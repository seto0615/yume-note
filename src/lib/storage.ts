import { useCallback, useEffect, useState } from 'react'
import type { AppData, Dream, Habit, Settings } from '../types'

const STORAGE_KEY = 'yume-note/v1'
const DATA_VERSION = 1

export const EMPTY_SETTINGS: Settings = {
  name: '',
  birthDate: '',
  lifeExpectancy: 90,
  ultimateGoal: '',
}

export const EMPTY_DATA: AppData = {
  version: DATA_VERSION,
  settings: EMPTY_SETTINGS,
  dreams: [],
  habits: [],
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** 不明なキーや欠損に耐えるよう、既定値へ寄せて読み込む */
export function normalize(raw: unknown): AppData {
  const src = (raw ?? {}) as Partial<AppData>
  const settings = { ...EMPTY_SETTINGS, ...(src.settings ?? {}) }
  const expectancy = Number(settings.lifeExpectancy)
  settings.lifeExpectancy =
    Number.isFinite(expectancy) && expectancy > 0 && expectancy <= 150 ? expectancy : 90

  return {
    version: DATA_VERSION,
    settings,
    dreams: Array.isArray(src.dreams) ? (src.dreams as Dream[]) : [],
    habits: Array.isArray(src.habits) ? (src.habits as Habit[]) : [],
  }
}

function read(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DATA
    return normalize(JSON.parse(raw))
  } catch {
    return EMPTY_DATA
  }
}

export interface Store {
  data: AppData
  setSettings: (patch: Partial<Settings>) => void
  upsertDream: (dream: Dream) => void
  removeDream: (id: string) => void
  upsertHabit: (habit: Habit) => void
  removeHabit: (id: string) => void
  replaceAll: (data: AppData) => void
  /** localStorage の容量超過などの書き込みエラー */
  error: string | null
  clearError: () => void
}

export function useStore(): Store {
  const [data, setData] = useState<AppData>(read)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setError(null)
    } catch {
      setError(
        '保存できませんでした。端末の保存領域が上限に達している可能性があります。写真の枚数を減らすか、不要な夢を削除してください。',
      )
    }
  }, [data])

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  const upsertDream = useCallback((dream: Dream) => {
    setData((d) => {
      const i = d.dreams.findIndex((x) => x.id === dream.id)
      const dreams = i === -1 ? [...d.dreams, dream] : d.dreams.map((x) => (x.id === dream.id ? dream : x))
      return { ...d, dreams }
    })
  }, [])

  const removeDream = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      dreams: d.dreams.filter((x) => x.id !== id),
      // 削除した夢に紐づく習慣は、習慣自体は残して紐付けだけ外す
      habits: d.habits.map((h) => (h.dreamId === id ? { ...h, dreamId: null } : h)),
    }))
  }, [])

  const upsertHabit = useCallback((habit: Habit) => {
    setData((d) => {
      const i = d.habits.findIndex((x) => x.id === habit.id)
      const habits = i === -1 ? [...d.habits, habit] : d.habits.map((x) => (x.id === habit.id ? habit : x))
      return { ...d, habits }
    })
  }, [])

  const removeHabit = useCallback((id: string) => {
    setData((d) => ({ ...d, habits: d.habits.filter((x) => x.id !== id) }))
  }, [])

  const replaceAll = useCallback((next: AppData) => setData(normalize(next)), [])
  const clearError = useCallback(() => setError(null), [])

  return {
    data,
    setSettings,
    upsertDream,
    removeDream,
    upsertHabit,
    removeHabit,
    replaceAll,
    error,
    clearError,
  }
}
