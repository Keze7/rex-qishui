#!/usr/bin/env python
"""生成汽水音乐的 Rex 首页包（.rex v2）。

用法：python scripts/build-home.py [脚本地址]
默认用当前 git HEAD 固定 jsDelivr 地址，避免 @main 的 12 小时缓存。

卡片是自写的 HTML（rex-html/ 里），数据来自插件模块的全局函数：
widgetURL 指 dist/qishui.js，widgetBundleId 必须是 WidgetMetadata.id（qishui.music），
functionId 是插件里导出的函数名（loadDaily 一类）。
"""
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "home" / "qishui-home.rex"

SCRIPT_URL = "https://cdn.jsdelivr.net/gh/Keze7/rex-qishui@{sha}/dist/qishui.js"
BUNDLE_ID = "qishui.music"

# 行标题由宿主渲染，改不了缩进；卡片内容都缩进了 16pt，标题前面补个宽度固定的空格跟上
SHIFT = "\u2003"  # 宿主只给横滑行加 16pt 内边距，全宽行的标题贴 0pt；em space ≈ 一个字号宽，正好补这 16pt

# (行 id, 标题, style, gridSize, functionId, htmlTemplate)
# 一行一个样：大卡 → 两列列表 → 压字方卡 → 两列列表 → 榜单小卡 → 两列列表 → 压字方卡 → 圆头像
ROWS = [
    ("home-daily", "每日推荐", "cover", [-1, 1.8], "loadDaily", "hero-daily.html"),
    ("home-recent", "最近播放", "cover", [-1, 3.0], "loadRecentPlayed", "list-grid.html"),
    ("home-familiar", "猜你喜欢", "fullWidthPoster", [-1, 1.8], "loadFamiliar", "tile-rail.html"),
    ("home-fresh", "新歌速递", "cover", [-1, 3.0], "loadFresh", "list-grid.html"),
    ("home-scenes", "场景电台", "fullWidthPoster", [-1, 1.2], "loadScenes", "chip-rail.html"),
    ("home-hot", "热歌歌单", "cover", [-1, 3.0], "loadHotPlaylists", "list-grid.html"),
    ("home-albums", "热门专辑", "fullWidthPoster", [-1, 1.8], "loadAlbums", "tile-rail.html"),
    ("home-artists", "热门歌手", "fullWidthPoster", [-1, 1.8], "loadArtists", "artist-circle.html"),
]


# 全宽卡片（标题贴屏幕边）才需要位移；横滑行的标题宿主已经缩进过
FLUSH_ROWS = {"hero-daily.html", "list-grid.html"}


def script_url() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1]
    sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    return SCRIPT_URL.format(sha=sha)


def card(row_id: str, style: str, grid: list, function_id: str, template: str | None) -> dict:
    item = {
        "id": f"{row_id}-card",
        "style": style,
        "gridSize": grid,
        "title": "",
        "functionId": function_id,
        "params": [],
        "subtitle": "",
        "name": "",
        "count": 0,
        "widgetBundleId": BUNDLE_ID,
        "widgetURL": script_url(),
        "iconUrl": "",
    }
    if template:
        item["htmlTemplate"] = template
    return item


def main() -> None:
    layout = [
        {
            "id": row_id,
            "title": (SHIFT + title) if tpl in FLUSH_ROWS else title,
            "isActive": True,
            "items": [card(row_id, style, grid, fn, tpl)],
        }
        for row_id, title, style, grid, fn, tpl in ROWS
    ]
    home = {
        "title": "汽水音乐",
        "avatar": "avatar-22",
        "description": "汽水音乐 · 每日推荐 / 最近播放 / 新歌 / 歌单 / 专辑 / 歌手",
        "isIndependent": False,
    }
    manifest = {"format": "video.fika.rex.home-package", "version": 2}

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("rex-manifest.json", json.dumps(manifest, ensure_ascii=False))
        z.writestr("rex-home.json", json.dumps(home, ensure_ascii=False))
        z.writestr("rex-layout.json", json.dumps(layout, ensure_ascii=False))
        for tpl in sorted({r[5] for r in ROWS if r[5]}):
            z.writestr(f"rex-html/{tpl}", (ROOT / "home" / "templates" / tpl).read_bytes())
    print(f"{OUT.name}: {OUT.stat().st_size} 字节, {len(layout)} 行, 脚本 {script_url()}")


if __name__ == "__main__":
    main()
