import type { Dream } from '../types'
import { fieldOf } from '../lib/fields'
import { daysUntil, formatDate } from '../lib/date'
import Modal from './Modal'
import { IconCheck } from './icons'

interface Props {
  dream: Dream
  onChange: (dream: Dream) => void
  onEdit: () => void
  onClose: () => void
}

export default function DreamDetail({ dream, onChange, onEdit, onClose }: Props) {
  const field = fieldOf(dream.field)
  const left = dream.targetDate ? daysUntil(dream.targetDate) : null
  const { metric } = dream
  const hasMetric = metric.label.trim() !== '' || metric.target.trim() !== ''

  const toggle = (id: string) =>
    onChange({
      ...dream,
      milestones: dream.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
    })

  return (
    <Modal title={field.name} onClose={onClose}>
      {dream.image && <img src={dream.image} alt="" className="detail-photo" />}

      <h3
        style={{
          fontFamily: 'var(--display)',
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1.7,
          margin: '0 0 12px',
        }}
      >
        {dream.title}
      </h3>

      <div className="dream-meta" style={{ marginBottom: 18 }}>
        <span style={{ color: field.color }}>{field.short}</span>
        <span>優先 {dream.priority}</span>
        {dream.targetDate && (
          <>
            <span>{formatDate(dream.targetDate)}</span>
            {left !== null && (
              <span className={left < 0 ? 'overdue' : 'accent'}>
                {left < 0 ? `${Math.abs(left)}日超過` : left === 0 ? '今日' : `あと${left}日`}
              </span>
            )}
          </>
        )}
        {dream.achieved && <span className="accent">達成済み</span>}
      </div>

      {dream.detail && (
        <p className="muted" style={{ whiteSpace: 'pre-wrap', lineHeight: 2, fontSize: 13.5, marginTop: 0 }}>
          {dream.detail}
        </p>
      )}

      {hasMetric && (
        <>
          <div className="section-label">数値目標</div>
          <div className="metric-box">
            <div style={{ textAlign: 'center' }}>
              <div className="lab">現在</div>
              <span className="now">{metric.current || '—'}</span>
            </div>
            <span className="arrow">→</span>
            <div style={{ textAlign: 'center' }}>
              <div className="lab">{metric.label || '目標'}</div>
              <span className="goal">{metric.target || '—'}</span>
              {metric.unit && <span className="unit"> {metric.unit}</span>}
            </div>
          </div>
        </>
      )}

      {dream.milestones.length > 0 && (
        <>
          <div className="section-label">
            実現までの小目標 — {dream.milestones.filter((m) => m.done).length}/{dream.milestones.length}
          </div>
          <ul className="ms-list">
            {dream.milestones.map((m) => (
              <li key={m.id}>
                <button
                  className="tick"
                  aria-pressed={m.done}
                  aria-label={m.done ? '未完了に戻す' : '完了にする'}
                  onClick={() => toggle(m.id)}
                >
                  <IconCheck />
                </button>
                <span className={`ms-text${m.done ? ' done' : ''}`}>{m.title}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="modal-actions">
        <button className="btn" onClick={onClose}>
          閉じる
        </button>
        <button className="btn btn-primary" onClick={onEdit}>
          編集
        </button>
      </div>
    </Modal>
  )
}
