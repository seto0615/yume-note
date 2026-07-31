/**
 * 幾何学タイル。
 * tax.hatenabase.jp の tax-geo.css の語彙をそのまま持ち込む。
 *   トーン: n=navy / b=blu / s=sky / p=pale
 *   形    : （無指定）=正方形 / o=円 / tl,tr,bl,br=1/4円 / lf=葉型
 * 暗い地の上に置くため、n（navy）は面としてではなく「抜き」として使う。
 */

export type Tile = string

/** ヒーロー用 4×4。1マスだけ空けるのは名刺デザインの踏襲 */
export const HERO_TILES: Tile[] = [
  'n tl', 's o', 'p', 'b br',
  'p o', 'b', 'n bl', 's tr',
  's tl', 'p o', 'n tr', 'b o',
  'p bl', 's', 'n', 'b br',
]

/** 見出し左に置く 2×2 のミニモザイク */
export const MINI_TILES: Tile[] = ['b tl', 'p', 's', 'n br']

interface Props {
  tiles?: Tile[]
  /** グリッドの列数。tiles の個数と整合させる */
  cols?: number
  /** 1タイルの一辺（px） */
  size?: number
  gap?: number
  className?: string
}

export default function Geo({
  tiles = MINI_TILES,
  cols = 2,
  size = 9,
  gap = 2,
  className = '',
}: Props) {
  return (
    <span
      className={`geo ${className}`.trim()}
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridAutoRows: `${size}px`,
        gap: `${gap}px`,
      }}
    >
      {tiles.map((t, i) => (
        <i key={i} className={t} />
      ))}
    </span>
  )
}

/** 葉型の一粒。セクション見出しの行頭に置く */
export function Leaf({ tone = 's', size = 8 }: { tone?: string; size?: number }) {
  return (
    <i
      className={`leaf ${tone}`}
      aria-hidden="true"
      style={{ width: size, height: size }}
    />
  )
}
