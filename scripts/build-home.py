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

# (行 id, 标题, style, gridSize, functionId, htmlTemplate)
ROWS = [
    ("home-daily", "每日推荐", "cover", [-1, 2.3], "loadDaily", "hero-daily.html"),
    ("home-recent", "最近播放", "fullWidthPoster", [-1, 3.4], "loadRecentPlayed", "track-rail.html"),
    ("home-fresh", "新歌速递", "fullWidthPoster", [-1, 3.4], "loadFresh", "track-rail.html"),
    ("home-familiar", "猜你喜欢", "fullWidthPoster", [-1, 3.4], "loadFamiliar", "track-rail.html"),
    ("home-scenes", "场景电台", "fullWidthPoster", [-1, 3.4], "loadScenes", "track-rail.html"),
    ("home-hot", "热歌歌单", "fullWidthPoster", [-1, 3.4], "loadHotPlaylists", "track-rail.html"),
    ("home-albums", "热门专辑", "fullWidthPoster", [-1, 3.4], "loadAlbums", "track-rail.html"),
    ("home-artists", "热门歌手", "fullWidthPoster", [-1, 3.4], "loadArtists", "artist-rail.html"),
]


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
        {"id": row_id, "title": title, "isActive": True, "items": [card(row_id, style, grid, fn, tpl)]}
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
