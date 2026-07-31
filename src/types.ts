/** 夢・人生ピラミッドの6分野（+ 未分類） */
export type FieldId =
  | 'health'
  | 'mind'
  | 'knowledge'
  | 'private'
  | 'social'
  | 'economy'
  | 'unsorted'

/** ピラミッドの3レベル */
export type PyramidLevel = 'foundation' | 'realize' | 'result'

export type Priority = 'A' | 'B' | 'C'

/** 夢を分解した小さな達成単位 */
export interface Milestone {
  id: string
  title: string
  done: boolean
}

/** 数値目標。「達成期限」と「実現したときの状態を数値化したもの」 */
export interface Metric {
  label: string
  target: string
  unit: string
  current: string
}

export interface Dream {
  id: string
  field: FieldId
  title: string
  detail: string
  /** 縮小済みのデータURL（JPEG） */
  image: string | null
  /** YYYY-MM-DD。未設定は '' */
  targetDate: string
  metric: Metric
  milestones: Milestone[]
  priority: Priority
  achieved: boolean
  createdAt: number
}

export type HabitCycle = 'D' | 'W' | 'M' | 'Y'

export interface Habit {
  id: string
  cycle: HabitCycle
  title: string
  /** D: 実行時刻 'HH:MM' */
  time: string
  /** W: 曜日 0=日 … 6=土 */
  weekdays: number[]
  /** M: 実行日 1–31 */
  monthDay: number
  /** Y: 実行月 1–12 */
  yearMonth: number
  /** 紐づく夢のid（任意） */
  dreamId: string | null
  /** 実行記録。キーは 'YYYY-MM-DD' */
  log: Record<string, boolean>
  createdAt: number
}

export interface Settings {
  name: string
  /** YYYY-MM-DD */
  birthDate: string
  /** 想定寿命（年） */
  lifeExpectancy: number
  /** 究極の目標（なりたい自分）・人生観 */
  ultimateGoal: string
}

export interface AppData {
  version: number
  settings: Settings
  dreams: Dream[]
  habits: Habit[]
}
