"""
アプリアイコンを生成する。

夢・人生ピラミッドを幾何学タイルで組んだ 3-2-1 のスタック。
下段（基礎）から上段（結果）へ blu → sky → pale と明度が上がる、
はてなベース幾何学4トーンの序列をそのまま高さに写した形。

    python3 scripts/build_icons.py
"""

import pathlib

import cairosvg

CANVAS = 512
TILE = 108
GAP = 14

NAVY = '#0A2846'
BLU = '#2D5FA8'
SKY = '#A9C4E4'
PALE = '#DCE6F2'


def square(x, y, t, fill):
    return f'<rect x="{x}" y="{y}" width="{t}" height="{t}" fill="{fill}"/>'


def circle(x, y, t, fill):
    r = t / 2
    return f'<circle cx="{x + r}" cy="{y + r}" r="{r}" fill="{fill}"/>'


def leaf(x, y, t, fill):
    """border-radius: 0 100% 0 100% 相当。右上と左下を落としたレンズ形"""
    return (
        f'<path d="M {x} {y} '
        f'A {t} {t} 0 0 1 {x + t} {y + t} '
        f'A {t} {t} 0 0 1 {x} {y} Z" fill="{fill}"/>'
    )


def quarter_tl(x, y, t, fill):
    """border-radius: 100% 0 0 0 相当。直角が右下にくる1/4円"""
    return (
        f'<path d="M {x + t} {y} L {x + t} {y + t} L {x} {y + t} '
        f'A {t} {t} 0 0 1 {x + t} {y} Z" fill="{fill}"/>'
    )


def quarter_tr(x, y, t, fill):
    """border-radius: 0 100% 0 0 相当。直角が左下にくる1/4円"""
    return (
        f'<path d="M {x} {y} L {x} {y + t} L {x + t} {y + t} '
        f'A {t} {t} 0 0 0 {x} {y} Z" fill="{fill}"/>'
    )


def build_svg() -> str:
    row_w3 = TILE * 3 + GAP * 2
    stack_h = TILE * 3 + GAP * 2
    top = (CANVAS - stack_h) / 2
    left3 = (CANVAS - row_w3) / 2
    left2 = (CANVAS - (TILE * 2 + GAP)) / 2
    left1 = (CANVAS - TILE) / 2

    y1, y2, y3 = top, top + TILE + GAP, top + (TILE + GAP) * 2

    shapes = [
        # 結果レベル（経済）— 頂点
        circle(left1, y1, TILE, PALE),
        # 実現レベル（家庭・仕事）
        leaf(left2, y2, TILE, SKY),
        quarter_tl(left2 + TILE + GAP, y2, TILE, SKY),
        # 基礎レベル（健康・教養・心）
        square(left3, y3, TILE, BLU),
        circle(left3 + TILE + GAP, y3, TILE, BLU),
        quarter_tr(left3 + (TILE + GAP) * 2, y3, TILE, BLU),
    ]

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS} {CANVAS}" '
        f'width="{CANVAS}" height="{CANVAS}">'
        f'<rect width="{CANVAS}" height="{CANVAS}" rx="0" fill="{NAVY}"/>'
        + ''.join(shapes)
        + '</svg>'
    )


def main() -> None:
    root = pathlib.Path(__file__).resolve().parent.parent
    public = root / 'public'
    svg_path = public / 'icon.svg'
    svg = build_svg()
    svg_path.write_text(svg, encoding='utf-8')

    for size, name in [
        (32, 'favicon-32.png'),
        (180, 'apple-touch-icon.png'),
        (192, 'icon-192.png'),
        (512, 'icon-512.png'),
    ]:
        cairosvg.svg2png(
            bytestring=svg.encode('utf-8'),
            write_to=str(public / name),
            output_width=size,
            output_height=size,
        )
        print(f'wrote public/{name} ({size}px)')

    print(f'wrote public/{svg_path.name}')


if __name__ == '__main__':
    main()
