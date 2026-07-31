import { useState } from 'react'
import type { Dream, FieldId, Milestone, Priority } from '../types'
import { FIELDS, fieldOf } from '../lib/fields'
import { newId } from '../lib/storage'
import { fileToDataUrl } from '../lib/image'
import Modal from './Modal'
import { IconCheck } from './icons'

interface Props {
  dream: Dream
  isNew: boolean
  onSave: (dream: Dream) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function blankDream(field: FieldId): Dream {
  return {
    id: newId(),
    field,
    title: '',
    detail: '',
    image: null,
    targetDate: '',
    metric: { label: '', target: '', unit: '', current: '' },
    milestones: [],
    priority: 'B',
    achieved: false,
    createdAt: Date.now(),
  }
}

export default function DreamEditor({ dream, isNew, onSave, onDelete, onClose }: Props) {
  const [d, setD] = useState<Dream>(dream)
  const [msText, setMsText] = useState('')
  const [imgError, setImgError] = useState<string | null>(null)

  const patch = (p: Partial<Dream>) => setD((prev) => ({ ...prev, ...p }))
  const patchMetric = (p: Partial<Dream['metric']>) =>
    setD((prev) => ({ ...prev, metric: { ...prev.metric, ...p } }))

  const addMilestone = () => {
    const title = msText.trim()
    if (!title) return
    const ms: Milestone = { id: newId(), title, done: false }
    patch({ milestones: [...d.milestones, ms] })
    setMsText('')
  }

  const handleImage = async (file: File | undefined) => {
    if (!file) return
    setImgError(null)
    try {
      patch({ image: await fileToDataUrl(file) })
    } catch {
      setImgError('この画像は読み込めませんでした。別の写真を試してください。')
    }
  }

  const save = () => {
    const title = d.title.trim()
    if (!title) return
    onSave({ ...d, title })
  }

  return (
    <Modal title={isNew ? 'やりたいことを書き出す' : '夢を編集'} onClose={onClose}>
      <div className="field">
        <label htmlFor="dream-title">やりたいこと</label>
        <input
          id="dream-title"
          type="text"
          value={d.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="例：湘南の海が見える家に住む"
          autoFocus={isNew}
        />
        <div className="hint">実現できるかどうかは考えない。ゼロベースで書く。</div>
      </div>

      <div className="field">
        <label htmlFor="dream-field">分野</label>
        <select
          id="dream-field"
          value={d.field}
          onChange={(e) => patch({ field: e.target.value as FieldId })}
        >
          {FIELDS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <div className="hint">{fieldOf(d.field).hint}</div>
      </div>

      <div className="field">
        <label htmlFor="dream-detail">具体的なイメージ</label>
        <textarea
          id="dream-detail"
          value={d.detail}
          onChange={(e) => patch({ detail: e.target.value })}
          placeholder="「家が欲しい」ではなく「駅徒歩10分、110㎡、外壁は白の塗り壁、庭にオリーブ」まで書く"
        />
      </div>

      <div className="field">
        <label>イメージ写真</label>
        {d.image && (
          <img src={d.image} alt="" className="detail-photo" style={{ marginBottom: 10 }} />
        )}
        <div className="row">
          <label className="btn btn-sm btn-block" style={{ cursor: 'pointer' }}>
            {d.image ? '写真を差し替える' : '写真を選ぶ'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => void handleImage(e.target.files?.[0])}
            />
          </label>
          {d.image && (
            <button type="button" className="btn btn-sm btn-danger" onClick={() => patch({ image: null })}>
              写真を外す
            </button>
          )}
        </div>
        {imgError && <div className="hint" style={{ color: 'var(--danger)' }}>{imgError}</div>}
      </div>

      <div className="field">
        <label htmlFor="dream-date">実現する日</label>
        <input
          id="dream-date"
          type="date"
          value={d.targetDate}
          onChange={(e) => patch({ targetDate: e.target.value })}
        />
        <div className="hint">期限のない夢は、ただの願望のまま終わる。</div>
      </div>

      <div className="field">
        <label>数値目標</label>
        <input
          type="text"
          value={d.metric.label}
          onChange={(e) => patchMetric({ label: e.target.value })}
          placeholder="測る指標（例：体重 / TOEIC / 人脈）"
          style={{ marginBottom: 8 }}
        />
        <div className="row">
          <input
            type="text"
            inputMode="decimal"
            value={d.metric.current}
            onChange={(e) => patchMetric({ current: e.target.value })}
            placeholder="現在"
          />
          <input
            type="text"
            inputMode="decimal"
            value={d.metric.target}
            onChange={(e) => patchMetric({ target: e.target.value })}
            placeholder="目標"
          />
          <input
            type="text"
            value={d.metric.unit}
            onChange={(e) => patchMetric({ unit: e.target.value })}
            placeholder="単位"
          />
        </div>
        <div className="hint">実現したときの状態を数字にする。「体重53キロ」「TOEIC 800点」「人脈15人」。</div>
      </div>

      <div className="field">
        <label htmlFor="dream-prio">優先順位</label>
        <select
          id="dream-prio"
          value={d.priority}
          onChange={(e) => patch({ priority: e.target.value as Priority })}
        >
          <option value="A">A — 最優先</option>
          <option value="B">B — 次点</option>
          <option value="C">C — いつか</option>
        </select>
      </div>

      <div className="field">
        <label>実現までの小目標</label>
        {d.milestones.length > 0 && (
          <ul className="ms-list" style={{ marginBottom: 10 }}>
            {d.milestones.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="tick"
                  aria-pressed={m.done}
                  aria-label={m.done ? '未完了に戻す' : '完了にする'}
                  onClick={() =>
                    patch({
                      milestones: d.milestones.map((x) =>
                        x.id === m.id ? { ...x, done: !x.done } : x,
                      ),
                    })
                  }
                >
                  <IconCheck />
                </button>
                <span className={`ms-text${m.done ? ' done' : ''}`}>{m.title}</span>
                <button
                  type="button"
                  className="faint"
                  aria-label="この小目標を削除"
                  onClick={() =>
                    patch({ milestones: d.milestones.filter((x) => x.id !== m.id) })
                  }
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="row">
          <input
            type="text"
            value={msText}
            onChange={(e) => setMsText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addMilestone()
              }
            }}
            placeholder="例：頭金500万円を貯める"
          />
          <button type="button" className="btn btn-sm" style={{ flex: '0 0 auto' }} onClick={addMilestone}>
            追加
          </button>
        </div>
      </div>

      {!isNew && (
        <div className="field">
          <button
            type="button"
            className="btn btn-block"
            onClick={() => patch({ achieved: !d.achieved })}
          >
            {d.achieved ? '未達成に戻す' : 'この夢は叶った'}
          </button>
        </div>
      )}

      <div className="modal-actions">
        {!isNew ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (confirm('この夢を削除しますか？')) onDelete(d.id)
            }}
          >
            削除
          </button>
        ) : (
          <button type="button" className="btn" onClick={onClose}>
            やめる
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={save} disabled={!d.title.trim()}>
          保存
        </button>
      </div>
    </Modal>
  )
}
