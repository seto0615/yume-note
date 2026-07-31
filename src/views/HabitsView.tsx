import { useMemo, useState } from 'react'
import type { Dream, Habit, HabitCycle } from '../types'
import { WEEKDAY_LABELS, parseKey, toKey, todayKey } from '../lib/date'
import { newId } from '../lib/storage'
import Modal from '../components/Modal'
import { IconCheck } from '../components/icons'

interface Props {
  habits: Habit[]
  dreams: Dream[]
  onSave: (habit: Habit) => void
  onDelete: (id: string) => void
  composing: boolean
  onComposingChange: (v: boolean) => void
}

const CYCLES: { id: HabitCycle; label: string; desc: string }[] = [
  { id: 'D', label: 'Daily', desc: '毎日、同じ時間にやること' },
  { id: 'W', label: 'Weekly', desc: '毎週、決まった曜日にやること' },
  { id: 'M', label: 'Monthly', desc: '毎月、決まった日にやること' },
  { id: 'Y', label: 'Yearly', desc: '毎年、決まった月日にやること' },
]

function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate()
}

/** その習慣がその日に実行対象かどうか */
export function isDue(h: Habit, date: Date): boolean {
  switch (h.cycle) {
    case 'D':
      return true
    case 'W':
      return h.weekdays.includes(date.getDay())
    case 'M': {
      const last = daysInMonth(date.getFullYear(), date.getMonth() + 1)
      // 31日設定を30日までの月でも取りこぼさないよう、月末に丸める
      const day = Math.min(h.monthDay, last)
      return date.getDate() === day
    }
    case 'Y': {
      if (date.getMonth() + 1 !== h.yearMonth) return false
      const last = daysInMonth(date.getFullYear(), h.yearMonth)
      return date.getDate() === Math.min(h.monthDay, last)
    }
  }
}

function describe(h: Habit): string {
  switch (h.cycle) {
    case 'D':
      return h.time ? `毎日 ${h.time}` : '毎日'
    case 'W': {
      const days = [...h.weekdays].sort().map((d) => WEEKDAY_LABELS[d]).join('・')
      return days ? `毎週 ${days}` : '毎週（曜日未設定）'
    }
    case 'M':
      return `毎月 ${h.monthDay}日`
    case 'Y':
      return `毎年 ${h.yearMonth}月${h.monthDay}日`
  }
}

/** 今日から遡って何日連続で実行できているか（Dailyのみ意味を持つ） */
function streakOf(h: Habit): number {
  let n = 0
  const d = parseKey(todayKey())!
  // 今日が未チェックでも、昨日までの連続を切らさない
  if (!h.log[toKey(d)]) d.setDate(d.getDate() - 1)
  while (h.log[toKey(d)]) {
    n += 1
    d.setDate(d.getDate() - 1)
  }
  return n
}

function blankHabit(): Habit {
  const now = new Date()
  return {
    id: newId(),
    cycle: 'D',
    title: '',
    time: '',
    weekdays: [now.getDay()],
    monthDay: now.getDate(),
    yearMonth: now.getMonth() + 1,
    dreamId: null,
    log: {},
    createdAt: Date.now(),
  }
}

export default function HabitsView({
  habits,
  dreams,
  onSave,
  onDelete,
  composing,
  onComposingChange,
}: Props) {
  const [editing, setEditing] = useState<Habit | null>(null)
  const [dateKey, setDateKey] = useState(todayKey())

  const week = useMemo(() => {
    const out: { key: string; date: Date }[] = []
    const base = parseKey(todayKey())!
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(base)
      d.setDate(d.getDate() - i)
      out.push({ key: toKey(d), date: d })
    }
    return out
  }, [])

  const selected = parseKey(dateKey)!
  const due = habits.filter((h) => isDue(h, selected))
  const doneCount = due.filter((h) => h.log[dateKey]).length

  const toggle = (h: Habit) => {
    const log = { ...h.log }
    if (log[dateKey]) delete log[dateKey]
    else log[dateKey] = true
    onSave({ ...h, log })
  }

  return (
    <>
      <div className="today-card">
        <div className="head">
          <span className="t">{dateKey === todayKey() ? '今日やること' : 'この日にやること'}</span>
          <span className="n-done">
            {doneCount}/{due.length}
          </span>
        </div>

        {due.length === 0 ? (
          <div className="faint" style={{ fontSize: 12.5, paddingBottom: 10 }}>
            この日に予定されている行動はありません。
          </div>
        ) : (
          due.map((h) => (
            <div className="habit" key={h.id}>
              <button
                className="tick"
                aria-pressed={!!h.log[dateKey]}
                aria-label={h.log[dateKey] ? '未実行に戻す' : '実行済みにする'}
                onClick={() => toggle(h)}
              >
                <IconCheck />
              </button>
              <div className="habit-main">
                <div className={`t${h.log[dateKey] ? ' done' : ''}`}>{h.title}</div>
                <div className="s-desc">{describe(h)}</div>
              </div>
              {h.cycle === 'D' && streakOf(h) > 0 && <span className="streak">{streakOf(h)}日連続</span>}
            </div>
          ))
        )}

        <div className="week-strip">
          {week.map((w) => (
            <button
              key={w.key}
              aria-pressed={w.key === dateKey}
              onClick={() => setDateKey(w.key)}
            >
              <span className="d">{WEEKDAY_LABELS[w.date.getDay()]}</span>
              <span className="n-day">{w.date.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      {CYCLES.map((c) => {
        const list = habits.filter((h) => h.cycle === c.id)
        return (
          <div key={c.id}>
            <div className="section-label">
              {c.id} — {c.label}
            </div>
            {list.length === 0 ? (
              <div className="faint" style={{ fontSize: 12, paddingBottom: 4 }}>
                {c.desc}
              </div>
            ) : (
              list.map((h) => {
                const linked = h.dreamId ? dreams.find((d) => d.id === h.dreamId) : null
                return (
                  <div className="habit" key={h.id}>
                    <span className="cycle-badge">{h.cycle}</span>
                    <button
                      className="habit-main"
                      style={{ textAlign: 'left' }}
                      onClick={() => setEditing(h)}
                    >
                      <div className="t">{h.title}</div>
                      <div className="s-desc">
                        {describe(h)}
                        {linked && ` ／ ${linked.title}`}
                      </div>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )
      })}

      <div className="limit-note" style={{ marginTop: 24 }}>
        いつも決まった行動は習慣化し、必要以上の時間をかけない。空いた時間を夢に充てる。
      </div>

      <button className="fab" aria-label="習慣を追加" onClick={() => onComposingChange(true)}>
        ＋
      </button>

      {composing && (
        <HabitEditor
          habit={blankHabit()}
          isNew
          dreams={dreams}
          onSave={(h) => {
            onSave(h)
            onComposingChange(false)
          }}
          onDelete={() => onComposingChange(false)}
          onClose={() => onComposingChange(false)}
        />
      )}

      {editing && (
        <HabitEditor
          habit={editing}
          isNew={false}
          dreams={dreams}
          onSave={(h) => {
            onSave(h)
            setEditing(null)
          }}
          onDelete={(id) => {
            onDelete(id)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

function HabitEditor({
  habit,
  isNew,
  dreams,
  onSave,
  onDelete,
  onClose,
}: {
  habit: Habit
  isNew: boolean
  dreams: Dream[]
  onSave: (h: Habit) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [h, setH] = useState<Habit>(habit)
  const patch = (p: Partial<Habit>) => setH((prev) => ({ ...prev, ...p }))

  return (
    <Modal title={isNew ? '習慣を追加' : '習慣を編集'} onClose={onClose}>
      <div className="field">
        <label htmlFor="habit-title">行動の内容</label>
        <input
          id="habit-title"
          type="text"
          value={h.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="例：6:00に起きて30分走る"
          autoFocus={isNew}
        />
      </div>

      <div className="field">
        <label>サイクル</label>
        <div className="weekday-picker">
          {CYCLES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={h.cycle === c.id}
              onClick={() => patch({ cycle: c.id })}
            >
              {c.id}
            </button>
          ))}
        </div>
        <div className="hint">{CYCLES.find((c) => c.id === h.cycle)!.desc}</div>
      </div>

      {h.cycle === 'D' && (
        <div className="field">
          <label htmlFor="habit-time">実行する時間</label>
          <input
            id="habit-time"
            type="time"
            value={h.time}
            onChange={(e) => patch({ time: e.target.value })}
          />
        </div>
      )}

      {h.cycle === 'W' && (
        <div className="field">
          <label>実行する曜日</label>
          <div className="weekday-picker">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={h.weekdays.includes(i)}
                onClick={() =>
                  patch({
                    weekdays: h.weekdays.includes(i)
                      ? h.weekdays.filter((d) => d !== i)
                      : [...h.weekdays, i],
                  })
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(h.cycle === 'M' || h.cycle === 'Y') && (
        <div className="field">
          <label>実行する日</label>
          <div className="row">
            {h.cycle === 'Y' && (
              <select
                value={h.yearMonth}
                onChange={(e) => patch({ yearMonth: Number(e.target.value) })}
                aria-label="月"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}月
                  </option>
                ))}
              </select>
            )}
            <select
              value={h.monthDay}
              onChange={(e) => patch({ monthDay: Number(e.target.value) })}
              aria-label="日"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}日
                </option>
              ))}
            </select>
          </div>
          {h.monthDay > 28 && (
            <div className="hint">日数の少ない月では、その月の末日に繰り上がります。</div>
          )}
        </div>
      )}

      <div className="field">
        <label htmlFor="habit-dream">紐づける夢（任意）</label>
        <select
          id="habit-dream"
          value={h.dreamId ?? ''}
          onChange={(e) => patch({ dreamId: e.target.value || null })}
        >
          <option value="">紐づけない</option>
          {dreams.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <div className="hint">夢に紐づいた行動だけが、習慣にする価値を持つ。</div>
      </div>

      <div className="modal-actions">
        {!isNew ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (confirm('この習慣を削除しますか？記録も消えます。')) onDelete(h.id)
            }}
          >
            削除
          </button>
        ) : (
          <button type="button" className="btn" onClick={onClose}>
            やめる
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          disabled={!h.title.trim()}
          onClick={() => onSave({ ...h, title: h.title.trim() })}
        >
          保存
        </button>
      </div>
    </Modal>
  )
}
