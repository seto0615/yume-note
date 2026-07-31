import type { FieldId, PyramidLevel } from '../types'

export interface FieldDef {
  id: FieldId
  /** 手帳上の正式名称 */
  name: string
  /** タブなどで使う短縮名 */
  short: string
  /** 何を書く分野か */
  hint: string
  level: PyramidLevel | null
  color: string
  /**
   * 幾何学タイルの形。色だけに頼らず形でも分野を識別できるようにする。
   * '' = 正方形 / 'o' = 円 / 'tl','tr','bl','br' = 1/4円 / 'leaf' = 葉型
   */
  shape: string
}

/**
 * 夢手帳・熊谷式の6分野。
 * 基礎（健康・心・教養）が実現（家庭・仕事）を支え、その結果として経済が満たされる、という構造。
 */
export const FIELDS: FieldDef[] = [
  {
    id: 'economy',
    name: '経済（物・お金）',
    short: '経済',
    hint: '目に見える形で手に入れたいもの、物理的なもの',
    level: 'result',
    color: '#C8AE6E',
    shape: 'o',
  },
  {
    id: 'private',
    name: 'プライベート・家庭',
    short: '家庭',
    hint: '理想の家庭／プライベートな夢',
    level: 'realize',
    color: '#CE8B82',
    shape: 'leaf',
  },
  {
    id: 'social',
    name: '社会・仕事',
    short: '仕事',
    hint: '社会との関わり方や、職業／ライフワーク',
    level: 'realize',
    color: '#2D5FA8',
    shape: 'br',
  },
  {
    id: 'health',
    name: '健康（美容）',
    short: '健康',
    hint: '健康／体／美容の状態',
    level: 'foundation',
    color: '#6FB3A0',
    shape: '',
  },
  {
    id: 'knowledge',
    name: '教養・知識',
    short: '教養',
    hint: '身につけたい専門知識／資格／教養',
    level: 'foundation',
    color: '#5B93D6',
    shape: 'tr',
  },
  {
    id: 'mind',
    name: '心・精神',
    short: '心',
    hint: '心の持ち方／あり方／精神状態',
    level: 'foundation',
    color: '#8F8FD4',
    shape: 'tl',
  },
  {
    id: 'unsorted',
    name: '未分類',
    short: '未分類',
    hint: 'まだ分野を決めていない夢',
    level: null,
    color: '#7D8FA5',
    shape: 'bl',
  },
]

export const LEVEL_LABEL: Record<PyramidLevel, string> = {
  result: '結果レベル',
  realize: '実現レベル',
  foundation: '基礎レベル',
}

/** 6分野のみ（未分類を除く） */
export const CORE_FIELDS = FIELDS.filter((f) => f.level !== null)

export function fieldOf(id: FieldId): FieldDef {
  return FIELDS.find((f) => f.id === id) ?? FIELDS[FIELDS.length - 1]
}

export function fieldsOfLevel(level: PyramidLevel): FieldDef[] {
  return CORE_FIELDS.filter((f) => f.level === level)
}

/** 熊谷式の「1分野あたり7個まで」の目安 */
export const FIELD_LIMIT = 7
