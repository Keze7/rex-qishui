import {
  type TrackRef,
  feedModes,
  feedTracks,
  formatCover,
  lyricOf,
  playlistTracks,
  resolveAudio,
  searchPlaylists,
  searchTracks,
  trackEntity,
  trackRef,
} from "./api";

const LINK_PREFIX = "qishui:";

export function trackLink(id: string): string {
  return `${LINK_PREFIX}track:${id}`;
}

export function playlistLink(id: string, ownerId = ""): string {
  return `${LINK_PREFIX}playlist:${id}:${ownerId}`;
}

export function sceneLink(id: string): string {
  return `${LINK_PREFIX}scene:${id}`;
}

export function parseLink(link: string): { kind: "track" | "playlist" | "scene"; id: string; ownerId: string } | null {
  const raw = String(link ?? "").trim();
  if (!raw.startsWith(LINK_PREFIX)) return null;
  const [kind, id, ownerId = ""] = raw.slice(LINK_PREFIX.length).split(":");
  if (!id || !/^\d{1,30}$/.test(id)) return null;
  if (kind === "track" || kind === "scene") return { kind, id, ownerId: "" };
  if (kind === "playlist") return { kind, id, ownerId };
  return null;
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function toRexTrack(ref: TrackRef): VideoItem {
  const subtitle = [ref.artists.join(" / "), ref.album, formatDuration(ref.durationMs)].filter(Boolean).join(" · ");
  return {
    id: ref.id,
    type: "url",
    mediaType: "song",
    link: trackLink(ref.id),
    title: ref.name,
    ...(subtitle ? { subtitle } : {}),
    ...(ref.cover ? { posterPath: ref.cover, coverUrl: ref.cover } : {}),
  };
}

// 场景详情只有 id，展示名在列表页时记下，避免标题变成“场景推荐”
const sceneNames = new Map<string, string>();

export async function handleScenes(): Promise<VideoItem[]> {
  const modes = await feedModes();
  return modes.map((mode) => {
    sceneNames.set(mode.id, mode.name);
    return {
      id: `scene-${mode.id}`,
      type: "url",
      mediaType: "playlist",
      link: sceneLink(mode.id),
      title: mode.name,
      ...(mode.group ? { subtitle: mode.group } : {}),
      ...(mode.cover ? { posterPath: mode.cover, coverUrl: mode.cover } : {}),
    };
  });
}

export async function handleSceneDetail(id: string): Promise<VideoItem> {
  const entities = await feedTracks(id, 40);
  const tracks = entities.map((entity) => toRexTrack(trackRef(entity)));
  return {
    id: `scene-${id}`,
    type: "url",
    mediaType: "playlist",
    link: sceneLink(id),
    title: sceneNames.get(id) ?? "场景推荐",
    description: `${tracks.length} 首`,
    tracks,
  };
}

/** 通用推荐流，不绑定场景 */
export async function handleRecommend(): Promise<VideoItem[]> {
  const entities = await feedTracks(null, 30);
  return entities.map((entity) => toRexTrack(trackRef(entity)));
}

/** 按关键词取一组歌单，用作首页分区（车机接口没有官方运营位） */
export async function handlePlaylistSection(keyword: string, count = 10): Promise<VideoItem[]> {
  const rows = await searchPlaylists(keyword, count);
  return rows.map((row) => {
    const base = row.base_info ?? {};
    const cover = formatCover(row.display_info?.url_cover);
    return {
      id: `playlist-${base.id}`,
      type: "url",
      mediaType: "playlist",
      link: playlistLink(String(base.id), String(base.owner_id ?? "")),
      title: String(base.title ?? base.name ?? "歌单"),
      ...(cover ? { posterPath: cover, coverUrl: cover } : {}),
    };
  });
}

export async function handleSearch(params: { keyword?: string; kind?: string; page?: string }): Promise<VideoItem[]> {
  const keyword = String(params.keyword ?? "").trim();
  if (!keyword) return [];
  if (params.kind === "playlists") return handlePlaylistSection(keyword, 30);
  const entities = await searchTracks(keyword, 40);
  return entities.map((entity) => toRexTrack(trackRef(entity)));
}

async function loadPlaylistDetail(id: string, ownerId: string): Promise<VideoItem> {
  const { playlist, entities } = await playlistTracks(id, ownerId);
  const tracks = entities.map((entity) => toRexTrack(trackRef(entity)));
  const base = playlist?.base_info ?? {};
  const cover = formatCover(playlist?.display_info?.url_cover);
  const owner = playlist?.relation_info?.owner?.name;
  const subtitle = [owner, tracks.length ? `${tracks.length} 首` : ""].filter(Boolean).join(" · ");
  return {
    id,
    type: "url",
    mediaType: "playlist",
    link: playlistLink(id, ownerId),
    title: String(base.title ?? base.name ?? "歌单"),
    ...(subtitle ? { subtitle } : {}),
    ...(base.desc ? { description: String(base.desc).slice(0, 200) } : {}),
    ...(cover ? { posterPath: cover, coverUrl: cover } : {}),
    tracks,
  };
}

async function loadTrackDetail(id: string): Promise<VideoItem> {
  const entity = await trackEntity(id);
  const ref = trackRef(entity);
  const audio = await resolveAudio(entity);
  const notes = [formatDuration(ref.durationMs), audio.preview ? "仅试听片段" : ""].filter(Boolean).join(" · ");
  return {
    ...toRexTrack(ref),
    ...(notes ? { description: notes } : {}),
    videoUrl: audio.url,
  };
}

export async function handleDetail(link: string): Promise<VideoItem> {
  const parsed = parseLink(link);
  if (!parsed) throw new Error(`无法识别的链接：${link}`);
  if (parsed.kind === "track") return loadTrackDetail(parsed.id);
  if (parsed.kind === "scene") return handleSceneDetail(parsed.id);
  return loadPlaylistDetail(parsed.id, parsed.ownerId);
}

const LRC_LINE_RE = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/;
// 汽水部分曲目下发的是逐字 KRC：`[起始ms,时长ms]<字偏移,字时长,?>汉字`
const KRC_LINE_RE = /^\[(\d+),(\d+)\](.*)$/;
const KRC_TAG_RE = /<\d+,\d+(?:,\d+)?>/g;

function parseTimedLines(lrc: string): Array<{ ms: number; text: string }> {
  const out: Array<{ ms: number; text: string }> = [];
  for (const raw of String(lrc ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const lrcMatch = LRC_LINE_RE.exec(line);
    if (lrcMatch) {
      const [, minutes, seconds, fraction = "0", text] = lrcMatch;
      const ms = Number(minutes) * 60000 + Number(seconds) * 1000 + Number(fraction.padEnd(3, "0").slice(0, 3));
      out.push({ ms, text: text.trim() });
      continue;
    }
    const krcMatch = KRC_LINE_RE.exec(line);
    if (krcMatch) {
      out.push({ ms: Number(krcMatch[1]), text: krcMatch[3].replace(KRC_TAG_RE, "").trim() });
    }
  }
  return out;
}

function formatTimestamp(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}]`;
}

/** 原文与译文合并成一条时间轴歌词；译文缺行时只保留原文 */
export function mergeLrc(original: string, translation: string): string {
  const translated = new Map(parseTimedLines(translation).map((line) => [line.ms, line.text]));
  return parseTimedLines(original)
    .map((line) => {
      const second = translated.get(line.ms);
      const text = second && second !== line.text ? `${line.text} / ${second}` : line.text;
      return `${formatTimestamp(line.ms)}${text}`;
    })
    .join("\n");
}

/** 统一输出标准 LRC，KRC 逐字格式也在此归一化 */
function toLrc(text: string): string {
  return parseTimedLines(text)
    .map((line) => `${formatTimestamp(line.ms)}${line.text}`)
    .join("\n");
}

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** 手写 UTF-8 编码：JSC 没有 TextEncoder。覆盖代理对（表情符号） */
function utf8Bytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i += 1;
      }
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 63),
        0x80 | ((code >> 6) & 63),
        0x80 | (code & 63),
      );
    }
  }
  return bytes;
}

function base64EncodeUtf8(text: string): string {
  const bytes = utf8Bytes(text);
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const chunk = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += BASE64_CHARS[(chunk >> 18) & 63] + BASE64_CHARS[(chunk >> 12) & 63];
    out += i + 1 < bytes.length ? BASE64_CHARS[(chunk >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? BASE64_CHARS[chunk & 63] : "=";
  }
  return out;
}

export function toLrcDataUri(lrc: string): string {
  return `data:text/plain;charset=utf-8;base64,${base64EncodeUtf8(lrc)}`;
}

export async function handleSubtitle(params: { id?: string; link?: string }): Promise<SubtitleItem[]> {
  const parsed = params.link ? parseLink(params.link) : null;
  const id = parsed?.kind === "track" ? parsed.id : /^\d{1,30}$/.test(String(params.id ?? "")) ? String(params.id) : "";
  if (!id) return [];
  const entity = await trackEntity(id);
  const { original, translation } = lyricOf(entity);
  const items: SubtitleItem[] = [];
  if (original && translation) {
    const bilingual = mergeLrc(original, translation);
    if (bilingual) items.push({ id: `qishui:lyric:${id}:bilingual`, title: "双语歌词", lang: "zh-CN", url: toLrcDataUri(bilingual) });
  }
  const plainOriginal = original ? toLrc(original) : "";
  const plainTranslation = translation ? toLrc(translation) : "";
  if (plainOriginal) {
    items.push({ id: `qishui:lyric:${id}:original`, title: "原文歌词", lang: "und", url: toLrcDataUri(plainOriginal) });
  }
  if (plainTranslation) {
    items.push({ id: `qishui:lyric:${id}:translation`, title: "中文翻译", lang: "zh-CN", url: toLrcDataUri(plainTranslation) });
  }
  return items;
}
