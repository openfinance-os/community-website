"""Outline the Open Finance OS wordmark lockups from the self-hosted DM Sans fonts.

Regenerate with `python3 scripts/generate-wordmark.py` (needs `pip install fonttools`
and the repo's node_modules for the PNG exports). Writes brand/logo-full.svg,
brand/logo-full-dark.svg and the 360/720/1440px PNG exports, then mirrors them
to public/brand/. "Open Finance" is DM Sans 700 and "OS" is DM Sans 500.
"""

import json
import shutil
import subprocess
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"
BRAND = ROOT / "brand"
PUBLIC_BRAND = ROOT / "public" / "brand"

SCALE = 0.03  # 30px type on a 1000-unit em
BASELINE = 37
TEXT_X = 58
HEIGHT = 48
MARK = (
    '<g transform="translate(2 4)">'
    '<path d="M29 8a15 15 0 1 0 6 12" stroke="{ink}" stroke-width="5.5" fill="none"/>'
    '<path d="M12 20h16" stroke="{ink}" stroke-width="4"/>'
    '<circle cx="33" cy="7" r="4" fill="#E8A85C"/></g>'
)
THEMES = {
    "logo-full.svg": {"ink": "#0D4F4F", "suffix": "#526662"},
    "logo-full-dark.svg": {"ink": "#CCE4D8", "suffix": "#ADC1B9"},
}
RUNS = [("Open Finance", "dm-sans-bold.ttf", "ink"), (" OS", "dm-sans-medium.ttf", "suffix")]


def outline(colors: dict[str, str]) -> str:
    x = TEXT_X
    paths = []
    for text, font_file, role in RUNS:
        font = TTFont(FONTS / font_file)
        glyphs = font.getGlyphSet()
        cmap = font.getBestCmap()
        for char in text:
            name = cmap[ord(char)]
            pen = SVGPathPen(glyphs)
            glyphs[name].draw(pen)
            commands = pen.getCommands()
            if commands:
                paths.append(
                    f'<path d="{commands}" transform="translate({x:.3f} {BASELINE}) '
                    f'scale({SCALE:.5f} -{SCALE:.5f})" fill="{colors[role]}"/>'
                )
            x += font["hmtx"][name][0] * SCALE
    width = x + 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.3f} {HEIGHT}">'
        f"<title>Open Finance OS</title>{MARK.format(ink=colors['ink'])}{''.join(paths)}</svg>"
    )


for file_name, colors in THEMES.items():
    (BRAND / file_name).write_text(outline(colors), encoding="utf-8")

exports = [
    {"src": str(BRAND / "logo-full.svg"), "out": str(BRAND / f"logo-full-{w}.png"), "width": w}
    for w in (360, 720, 1440)
]
subprocess.run(
    [
        "node",
        "-e",
        "const sharp=require('sharp');"
        "(async()=>{for(const e of JSON.parse(process.argv[1])){"
        "await sharp(e.src,{density:1200}).resize({width:e.width}).png().toFile(e.out);}})()"
        ".catch(e=>{console.error(e);process.exit(1);});",
        json.dumps(exports),
    ],
    cwd=ROOT,
    check=True,
)

for name in [*THEMES, *(Path(e["out"]).name for e in exports)]:
    shutil.copyfile(BRAND / name, PUBLIC_BRAND / name)
    print(f"Generated brand/{name} and public/brand/{name}")
