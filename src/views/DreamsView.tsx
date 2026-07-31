import { useMemo, useState } from 'react'
import type { Dream, FieldId } from '../types'
import { FIELDS, FIELD_LIMIT, fieldOf } from '../lib/fields'
import { daysUntil, formatDate } from '../lib/date'
import DreamEditor, { blankDream } from '../components/DreamEditor'
import DreamDetail from '../components/DreamDetail'

interface Props {
  dreams: Dream[]
  field: FieldId | 'all'
  onFieldChange: (field: FieldId | 'all') => void
  onSave: (dream: Dream) => void
  onDelete: (id: string) => void
  /** 新規作成モーダルを開いた状態で入ってきたか */
  composing: boolean
  onComposingChange: (v: boolean) => void
}

const PRIORITY_ORDER = { A: 0, B: 1, C: 2 }

export default function DreamsView({
  dreams,
  field,
  onFieldChange,
  onSave,
  onDelete,
  composing,
  onComposingChange,
}: Props) {
  const [editing, setEditing] = useState<Dream | null>(null)
  const [viewing, setViewing] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of dreams) map[d.field] = (map[d.field] ?? 0) + 1
    return map
  }, [dreams])

  const list = useMemo(() => {
    const filtered = field === 'all' ? dreams : dreams.filter((d) => d.field === field)
    return [...filtered].sort((a, b) => {
      // 未達成 → 優先順位 → 期限が近い順
      if (a.achieved !== b.achieved) return a.achieved ? 1 : -1
      const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (p !== 0) return p
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate)
      if (a.targetDate) return -1
      if (b.targetDate) return 1
      return b.createdAt - a.createdAt
    })
  }, [dreams, field])

  // 詳細は id 参照で保持し、編集後も最新の内容を映す
  const viewingDream = viewing ? (dreams.find((d) => d.id === viewing) ?? null) : null

  const overLimit =
    field !== 'all' && field !== 'unsorted' && (counts[field] ?? 0) > FIELD_LIMIT

  return (
    <>
      <div className="chips">
        <button
          className="chip"
          aria-pressed={field === 'all'}
          style={field === 'all' ? { background: 'var(--brass-bright)' } : undefined}
          onClick={() => onFieldChange('all')}
        >
          すべて<span className="count">{dreams.length}</span>
        </button>
        {FIELDS.map((f) => (
          <button
            key={f.id}
            className="chip"
            aria-pressed={field === f.id}
            style={field === f.id ? { background: f.color } : undefined}
            onClick={() => onFieldChange(f.id)}
          >
            <span className="dot" style={{ background: f.color }} />
            {f.short}
            <span className="count">{counts[f.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {field !== 'all' && field !== 'unsorted' && (
        <div className={`limit-note${overLimit ? ' over' : ''}`}>
          {fieldOf(field).hint} — {counts[field] ?? 0}/{FIELD_LIMIT}
          {overLimit && '（熊谷式の目安は1分野7個まで。絞るほど実現に近づく）'}
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">
          <span className="quote">まだ何も書かれていない。</span>
          実現できるかは考えず、
          <br />
          思いつく限り書き出すところから。
        </div>
      ) : (
        list.map((d) => <DreamCard key={d.id} dream={d} onOpen={() => setViewing(d.id)} />)
      )}

      <button
        className="fab"
        aria-label="やりたいことを追加"
        onClick={() => onComposingChange(true)}
      >
        ＋
      </button>

      {composing && (
        <DreamEditor
          dream={blankDream(field === 'all' ? 'unsorted' : field)}
          isNew
          onSave={(d) => {
            onSave(d)
            onComposingChange(false)
          }}
          onDelete={() => onComposingChange(false)}
          onClose={() => onComposingChange(false)}
        />
      )}

      {editing && (
        <DreamEditor
          dream={editing}
          isNew={false}
          onSave={(d) => {
            onSave(d)
            setEditing(null)
          }}
          onDelete={(id) => {
            onDelete(id)
            setEditing(null)
            setViewing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {viewingDream && !editing && (
        <DreamDetail
          dream={viewingDream}
          onChange={onSave}
          onEdit={() => setEditing(viewingDream)}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  )
}

function DreamCard({ dream, onOpen }: { dream: Dream; onOpen: () => void }) {
  const f = fieldOf(dream.field)
  const left = dream.targetDate ? daysUntil(dream.targetDate) : null
  const total = dream.milestones.length
  const done = dream.milestones.filter((m) => m.done).length
  const pct = total > 0 ? (done / total) * 100 : 0

  return (
    <button className={`dream${dream.achieved ? ' is-achieved' : ''}`} onClick={onOpen}>
      {dream.image && (
        <div className="dream-photo" style={{ backgroundImage: `url(${dream.image})` }} />
      )}
      <div className="dream-body">
        <div className="dream-top">
          <span className="dream-field" style={{ color: f.color }}>
            {f.short}
          </span>
          <span className="dream-prio">優先 {dream.priority}</span>
          {dream.achieved && <span className="dream-prio">✓ 達成</span>}
        </div>

        <h3>{dream.title}</h3>
        {dream.detail && <p className="dream-detail">{dream.detail}</p>}

        <div className="dream-meta">
          {dream.targetDate ? (
            <>
              <span>{formatDate(dream.targetDate)}</span>
              {left !== null && !dream.achieved && (
                <span className={left < 0 ? 'overdue' : 'accent'}>
                  {left < 0 ? `${Math.abs(left)}日超過` : left === 0 ? '今日' : `あと${left}日`}
                </span>
              )}
            </>
          ) : (
            <span>期限なし</span>
          )}
          {dream.metric.target && (
            <span>
              {dream.metric.label ? `${dream.metric.label} ` : ''}
              {dream.metric.current || '—'} → {dream.metric.target}
              {dream.metric.unit}
            </span>
          )}
          {total > 0 && (
            <span>
              小目標 {done}/{total}
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="progress" style={{ color: f.color }}>
            <i style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </button>
  )
}
