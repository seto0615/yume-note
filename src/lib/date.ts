const MS_PER_DAY = 86400000

/** ローカルタイムの 'YYYY-MM-DD' */
export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toKey(new Date())
}

/** 'YYYY-MM-DD' をローカル正午の Date に。タイムゾーンによる日ズレを避ける */
export function parseKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 日付の差（日数）。a - b を切り捨てず四捨五入 */
export function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY)
}

/** 今日から指定日までの残り日数。過去なら負の値 */
export function daysUntil(key: string): number | null {
  const target = parseKey(key)
  if (!target) return null
  const now = parseKey(todayKey())!
  return diffDays(target, now)
}

/** 誕生日から満年齢 */
export function ageAt(birthKey: string, at: Date): number | null {
  const b = parseKey(birthKey)
  if (!b) return null
  let age = at.getFullYear() - b.getFullYear()
  const m = at.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && at.getDate() < b.getDate())) age -= 1
  return age
}

export function addYears(d: Date, years: number): Date {
  const n = new Date(d)
  n.setFullYear(n.getFullYear() + years)
  return n
}

export function formatDate(key: string): string {
  const d = parseKey(key)
  if (!d) return ''
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatShort(key: string): string {
  const d = parseKey(key)
  if (!d) return ''
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

/** 数値を桁区切りで */
export function comma(n: number): string {
  return Math.round(n).toLocaleString('ja-JP')
}
