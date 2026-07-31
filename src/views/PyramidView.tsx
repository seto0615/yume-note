import { useMemo } from 'react'
import type { Dream, FieldId, Settings } from '../types'
import { CORE_FIELDS, LEVEL_LABEL, fieldsOfLevel } from '../lib/fields'

interface Props {
  dreams: Dream[]
  settings: Settings
  onJumpToField: (field: FieldId) => void
  onOpenSettings: () => void
}

/**
 * 夢・人生ピラミッド。
 * 基礎（健康・教養・心）→ 実現（家庭・仕事）→ 結果（経済）と積み上げ、
 * 空白の分野を炙り出してバランスを取り戻すための画面。
 */
export default function PyramidView({ dreams, settings, onJumpToField, onOpenSettings }: Props) {
  const byField = useMemo(() => {
    const map: Record<string, Dream[]> = {}
    for (const d of dreams) (map[d.field] ??= []).push(d)
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.priority.localeCompare(b.priority) || a.createdAt - b.createdAt)
    }
    return map
  }, [dreams])

  const emptyFields = CORE_FIELDS.filter((f) => (byField[f.id] ?? []).length === 0)
  const unsorted = byField.unsorted ?? []

  return (
    <>
      <button
        className="apex"
        style={{ display: 'block', width: '100%' }}
        onClick={onOpenSettings}
      >
        <div className="k">究極の目標 — なりたい自分</div>
        <div className={`v${settings.ultimateGoal ? '' : ' placeholder'}`}>
          {settings.ultimateGoal || 'タップして、人生の究極の目標を書く'}
        </div>
      </button>

      <div className="pyramid">
        <div className="tier-label">{LEVEL_LABEL.result}</div>
        <div className="tier tier-1">
          {fieldsOfLevel('result').map((f) => (
            <Block key={f.id} id={f.id} name={f.short} color={f.color} shape={f.shape} dreams={byField[f.id] ?? []} onOpen={onJumpToField} />
          ))}
        </div>

        <div className="tier-label">{LEVEL_LABEL.realize}</div>
        <div className="tier tier-2">
          {fieldsOfLevel('realize').map((f) => (
            <Block key={f.id} id={f.id} name={f.short} color={f.color} shape={f.shape} dreams={byField[f.id] ?? []} onOpen={onJumpToField} />
          ))}
        </div>

        <div className="tier-label">{LEVEL_LABEL.foundation}</div>
        <div className="tier">
          {fieldsOfLevel('foundation').map((f) => (
            <Block key={f.id} id={f.id} name={f.short} color={f.color} shape={f.shape} dreams={byField[f.id] ?? []} onOpen={onJumpToField} />
          ))}
        </div>
      </div>

      <div className="balance-note">
        {emptyFields.length === 0 ? (
          <>
            6分野すべてに夢が置かれています。
            <br />
            健康な体・豊かな教養・開かれた心が、仕事と家庭の夢を実現させ、その結果として経済的な豊かさがついてくる。
          </>
        ) : (
          <>
            <strong>{emptyFields.map((f) => f.name).join('・')}</strong>
            が空白です。
            <br />
            バランスのとれた全人になってこそ、人生の究極の目標は達成される。この分野で自分が本当に望むこと・果たすべき責務を、もう一度考えてみる。
          </>
        )}
      </div>

      {unsorted.length > 0 && (
        <>
          <div className="section-label">未分類 — {unsorted.length}件</div>
          <button
            className="card"
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
            onClick={() => onJumpToField('unsorted')}
          >
            <div className="muted" style={{ fontSize: 13 }}>
              分野が決まっていない夢が {unsorted.length} 件あります。6分野のどこかに置くと、
              ピラミッドのバランスが見えるようになります。
            </div>
          </button>
        </>
      )}
    </>
  )
}

function Block({
  id,
  name,
  color,
  shape,
  dreams,
  onOpen,
}: {
  id: FieldId
  name: string
  color: string
  shape: string
  dreams: Dream[]
  onOpen: (f: FieldId) => void
}) {
  return (
    <button
      className={`pblock${dreams.length === 0 ? ' empty-field' : ''}`}
      onClick={() => onOpen(id)}
    >
      <div className="name">
        <span className={`mark ${shape}`} style={{ background: color }} />
        {name}
      </div>
      <div className="n-count">{dreams.length} 件</div>
      <ul>
        {dreams.slice(0, 3).map((d) => (
          <li key={d.id}>{d.title}</li>
        ))}
      </ul>
    </button>
  )
}
