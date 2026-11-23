// 端到端自检：用真实接口跑一遍插件导出，不依赖 Rex 宿主。
// 用法：node scripts/check.mjs
const calls = [];
globalThis.Widget = {
  http: {
    async request({ url, method = "GET", headers = {}, data }) {
      calls.push(url);
      const response = await fetch(url, { method, headers, ...(data !== undefined ? { body: data } : {}) });
      const text = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${url.slice(0, 120)}`);
      return { data: text, headers: Object.fromEntries(response.headers) };
    },
  },
};

for (const name of ["WidgetMetadata", "loadScenes", "loadSubtitle", "search", "loadDetail"]) {
  Object.defineProperty(globalThis, name, { value: undefined, writable: true, configurable: true });
}

const assert = (ok, message) => {
  if (!ok) throw new Error(`FAIL ${message}`);
  console.log(`ok   ${message}`);
};

await import("../dist/qishui.js");

const scenes = await loadScenes();
assert(scenes.length > 0, `发现场景 ${scenes.length} 个`);
assert(scenes[0].link.startsWith("qishui:scene:"), "场景链接前缀正确");

const scene = await loadDetail(scenes[0].link);
assert(scene.tracks.length > 0, `场景「${scene.title}」返回 ${scene.tracks.length} 首`);

const songs = await search({ keyword: "小半", kind: "songs", page: "1" });
assert(songs.length > 0, `搜索「小半」得到 ${songs.length} 首`);

const detail = await loadDetail(songs[0].link);
assert(/^https:\/\//.test(detail.videoUrl ?? ""), `详情页音源 ${String(detail.videoUrl).slice(0, 60)}...`);
assert(detail.title === "小半", `曲名 ${detail.title}`);

const audio = await fetch(detail.videoUrl, { headers: { range: "bytes=0-2047" } });
const head = Buffer.from(await audio.arrayBuffer());
assert(audio.status === 206 || audio.status === 200, `音源可下载 HTTP ${audio.status} ${audio.headers.get("content-type")}`);
assert(head.includes(Buffer.from("ftyp")), "返回的是 MP4 容器");

const subtitles = await loadSubtitle({ link: songs[0].link });
assert(subtitles.length > 0, `歌词 ${subtitles.length} 条`);
const lrc = Buffer.from(subtitles.at(-1).url.split(",")[1], "base64").toString("utf8");
assert(/\[\d{2}:\d{2}\.\d{2}\]/.test(lrc), `歌词首行 ${lrc.split("\n").find((line) => line.trim())}`);

const playlists = await search({ keyword: "华语", kind: "playlists", page: "1" });
assert(playlists.length > 0, `歌单搜索 ${playlists.length} 个`);
const playlist = await loadDetail(playlists[0].link);
assert(playlist.tracks.length > 0, `歌单「${playlist.title}」返回 ${playlist.tracks.length} 首`);
assert(playlist.title !== "歌单", "歌单标题已解析");

console.log(`\n全部通过，共请求 ${calls.length} 次`);
