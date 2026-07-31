import { useMemo } from 'react'
import type { Dream, Settings } from '../types'
import { fieldOf } from '../lib/fields'
import { ageAt, formatShort, parseKey } from '../lib/date'
import Geo, { HERO_TILES } from '../components/Geo'

interface Props {
  dreams: Dream[]
  settings: Settings
  onOpen: (id: string) => void
}

/**
 * 未来年表。実現日を持つ夢を年ごとに並べ、「その年に自分は何歳か」を添える。
 * 夢に期限をつけ、逆算して行動計画を立てるための画面。
 */
export default function TimelineView({ dreams, settings, onOpen }: Props) {
  const years = useMemo(() => {
    const dated = dreams.filter((d) => d.targetDate && parseKey(d.targetDate))
    const map = new Map<number, Dream[]>()
    for (const d of dated) {
      const y = parseKey(d.targetDate)!.getFullYear()
      const arr = map.get(y) ?? []
      arr.push(d)
      map.set(y, arr)
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, items]) => ({
        year,
        items: items.sort((a, b) => a.targetDate.localeCompare(b.targetDate)),
        age: settings.birthDate
          ? ageAt(settings.birthDate, new Date(year, 11, 31, 12))
          : null,
      }))
  }, [dreams, settings.birthDate])

  const undated = dreams.filter((d) => !d.targetDate).length

  if (years.length === 0) {
    return (
      <div className="empty">
        <Geo tiles={HERO_TILES} cols={4} size={30} gap={4} />
        <span className="quote">期限のない夢は、願望のまま終わる。</span>
        夢に「実現する日」を入れると、
        <br />
        ここに年表が立ち上がります。
      </div>
    )
  }

  return (
    <div className="v-timeline">
      <div className="section-label">未来年表</div>
      {years.map((y) => (
        <div className="year" key={y.year}>
          <div className="year-head">
            <span className="y">{y.year}</span>
            {y.age !== null && <span className="age">{y.age}歳</span>}
          </div>
          {y.items.map((d) => {
            const f = fieldOf(d.field)
            return (
              <button
                key={d.id}
                className="year-item"
                onClick={() => onOpen(d.id)}
                style={{ opacity: d.achieved ? 0.5 : 1 }}
              >
                <div className="t">
                  {d.achieved && '✓ '}
                  {d.title}
                </div>
                <div className="m">
                  <span className={`mark ${f.shape}`} style={{ background: f.color }} />
                  <span className="fld" style={{ color: f.color }}>
                    {f.short}
                  </span>
                  {formatShort(d.targetDate)}
                  {d.metric.target && ` ／ ${d.metric.target}${d.metric.unit}`}
                </div>
              </button>
            )
          })}
        </div>
      ))}

      {undated > 0 && (
        <div className="limit-note">
          期限が入っていない夢が {undated} 件あります。日付を入れると年表に並びます。
        </div>
      )}
    </div>
  )
}
