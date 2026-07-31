import { useMemo } from 'react'
import type { Settings } from '../types'
import { addYears, ageAt, comma, diffDays, parseKey, todayKey } from '../lib/date'

interface Props {
  settings: Settings
  onOpenSettings: () => void
}

/**
 * 人生時計。
 * 生年月日と想定寿命から「残り日数」を出し、1マス＝1週の人生カレンダーで可視化する。
 */
export default function ClockView({ settings, onOpenSettings }: Props) {
  const calc = useMemo(() => {
    const birth = parseKey(settings.birthDate)
    if (!birth) return null

    const now = parseKey(todayKey())!
    const end = addYears(birth, settings.lifeExpectancy)

    const totalDays = diffDays(end, birth)
    const livedDays = diffDays(now, birth)
    const leftDays = totalDays - livedDays
    const pct = totalDays > 0 ? Math.min(100, Math.max(0, (livedDays / totalDays) * 100)) : 0

    const totalWeeks = Math.max(1, Math.floor(totalDays / 7))
    const livedWeeks = Math.max(0, Math.floor(livedDays / 7))

    return {
      age: ageAt(settings.birthDate, now),
      totalDays,
      livedDays,
      leftDays,
      pct,
      totalWeeks,
      livedWeeks,
      leftWeeks: Math.max(0, totalWeeks - livedWeeks),
      leftMonths: Math.max(0, Math.floor(leftDays / 30.44)),
      leftYears: Math.max(0, leftDays / 365.2425),
      endYear: end.getFullYear(),
    }
  }, [settings.birthDate, settings.lifeExpectancy])

  if (!calc) {
    return (
      <div className="empty">
        <span className="quote">時間は、命そのもの。</span>
        まず生年月日と想定寿命を登録すると、
        <br />
        あなたに残された日数が動きはじめます。
        <div style={{ marginTop: 22 }}>
          <button className="btn btn-primary" onClick={onOpenSettings}>
            人生時計を合わせる
          </button>
        </div>
      </div>
    )
  }

  const overLived = calc.leftDays <= 0

  return (
    <>
      <div className="clock-hero">
        <div className="label">Days Remaining</div>
        <div className="days">{comma(Math.max(0, calc.leftDays))}</div>
        <div className="unit">日</div>
      </div>

      <div className="clock-bar">
        <i style={{ width: `${calc.pct}%` }} />
      </div>
      <div className="clock-bar-meta">
        <span>{calc.age !== null ? `${calc.age}歳` : ''}</span>
        <span>{calc.pct.toFixed(1)}% 経過</span>
        <span>
          {settings.lifeExpectancy}歳 / {calc.endYear}年
        </span>
      </div>

      <div className="section-label">残り</div>
      <div className="stat-grid">
        <div className="stat">
          <span className="v">{comma(Math.max(0, calc.leftWeeks))}</span>
          <span className="k">週</span>
        </div>
        <div className="stat">
          <span className="v">{comma(calc.leftMonths)}</span>
          <span className="k">ヶ月</span>
        </div>
        <div className="stat">
          <span className="v">{calc.leftYears.toFixed(1)}</span>
          <span className="k">年</span>
        </div>
      </div>

      <div className="section-label">人生カレンダー — 1マス＝1週</div>
      <div className="life-grid" aria-label={`人生${calc.totalWeeks}週のうち${calc.livedWeeks}週が経過`}>
        {Array.from({ length: calc.totalWeeks }, (_, i) => (
          <i
            key={i}
            className={i < calc.livedWeeks ? 'past' : i === calc.livedWeeks ? 'now' : ''}
          />
        ))}
      </div>

      <div className="section-label">Creed</div>
      <div className="creed">
        {overLived ? (
          <>
            想定寿命は過ぎました。
            <br />
            ここから先は、<strong>すべて延長戦</strong>です。
          </>
        ) : (
          <>
            人は、<strong>夢で描いた自分の姿以上には</strong>なれない。
            <br />
            限りある時間を、何に捧げるか。
          </>
        )}
      </div>
    </>
  )
}
