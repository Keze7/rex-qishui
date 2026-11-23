import {
  type AlbumRef,
  type Json,
  type ArtistRef,
  type TrackRef,
  albumDetail,
  albumLinksOf,
  albumRef,
  artistInfo,
  artistLinksOf,
  artistRef,
  artistTracks,
  feedModes,
  feedTracks,
  formatCover,
  lyricOf,
  playlistTracks,
  resolveAudio,
  searchArtists,
  searchPlaylists,
  searchTracks,
  trackEntity,
  trackRef,
} from "./api";
import { accountPlaylistTracks, checkLogin, getAccount, myPlaylists, myRecentPlayed, pendingLogin, startLogin } from "./account";

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

export function artistLink(id: string): string {
  return `${LINK_PREFIX}artist:${id}`;
}

export function albumLink(id: string): string {
  return `${LINK_PREFIX}album:${id}`;
}

export function parseLink(
  link: string,
): { kind: "track" | "playlist" | "scene" | "artist" | "album" | "login"; id: string; ownerId: string } | null {
  const raw = String(link ?? "").trim();
  if (!raw.startsWith(LINK_PREFIX)) return null;
  const [kind, id, ownerId = ""] = raw.slice(LINK_PREFIX.length).split(":");
  if (!id || !/^\d{1,30}$/.test(id)) return null;
  if (kind === "track" || kind === "scene" || kind === "artist" || kind === "album" || kind === "login") {
    return { kind, id, ownerId: "" };
  }
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
  const seconds = Math.round(ref.durationMs / 1000);
  return {
    id: ref.id,
    type: "url",
    mediaType: "song",
    link: trackLink(ref.id),
    title: ref.name,
    ...(subtitle ? { subtitle } : {}),
    ...(seconds > 0 ? { duration: seconds, durationText: formatDuration(ref.durationMs) } : {}),
    ...(ref.cover ? { posterPath: ref.cover, coverUrl: ref.cover } : {}),
  };
}

// 场景详情只有 id，展示名在列表页时记下，避免标题变成“场景推荐”
const sceneNames = new Map<string, string>();

function toRexArtist(ref: ArtistRef): VideoItem {
  const subtitle = [ref.trackCount ? `${ref.trackCount} 首` : "", ref.albumCount ? `${ref.albumCount} 张专辑` : ""]
    .filter(Boolean)
    .join(" · ");
  return {
    id: ref.id,
    type: "person",
    mediaType: "person",
    link: artistLink(ref.id),
    title: ref.name,
    ...(subtitle ? { subtitle } : {}),
    ...(ref.avatar ? { avatar: ref.avatar, posterPath: ref.avatar, coverUrl: ref.avatar } : {}),
    ...(ref.intro ? { description: ref.intro.slice(0, 120) } : {}),
  };
}
function toRexAlbum(ref: AlbumRef): VideoItem {
  const subtitle = [ref.artists.join(" / "), ref.trackCount ? `${ref.trackCount} 首` : "", ref.releaseDate ?? ""]
    .filter(Boolean)
    .join(" · ");
  return {
    id: ref.id,
    type: "url",
    mediaType: "album",
    link: albumLink(ref.id),
    title: ref.name,
    ...(subtitle ? { subtitle } : {}),
    ...(ref.cover ? { posterPath: ref.cover, coverUrl: ref.cover } : {}),
    ...(ref.intro ? { description: ref.intro.slice(0, 150) } : {}),
  };
}

/** 从曲目反推专辑；专辑封面只有详情端点有，所以按上限并发补齐 */
async function albumsFromEntities(entities: Json[], limit = 8): Promise<VideoItem[]> {
  const links = albumLinksOf(entities).slice(0, limit);
  const rows = await Promise.all(
    links.map(async (link) => {
      try {
        const { album } = await albumDetail(link.id);
        return albumRef(album);
      } catch {
        return { id: link.id, name: link.name, trackCount: 0, artists: [] } as AlbumRef;
      }
    }),
  );
  return rows.filter((ref) => ref.id).map(toRexAlbum);
}

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

/** 车机 feed 自带多种口味：daily（每日推荐）/ fresh（新歌）/ familiar（熟悉的）/ explore（探索） */
export async function handleFeedPreference(preference: string, count = 30): Promise<VideoItem[]> {
  const entities = await feedTracks(null, count, preference);
  return entities.map((entity) => toRexTrack(trackRef(entity)));
}

/** 首页「热门专辑」：车机没有专辑列表，从每日推荐的曲目里反推 */
export async function handleAlbumSection(count = 10): Promise<VideoItem[]> {
  const entities = await feedTracks(null, 30, "daily");
  return albumsFromEntities(entities, count);
}

function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return String(value);
}

function toRexPlaylist(row: Json): VideoItem {
  const base = row.base_info ?? {};
  const cover = formatCover(row.display_info?.url_cover);
  const collected = formatCount(Number(row.stats?.count_collected ?? 0));
  // 搜索结果是数字，账号歌单是对象 { track_cnt, media_count }
  const count = typeof row.resource_cnt === "number" ? row.resource_cnt : Number(row.resource_cnt?.track_cnt ?? 0);
  const subtitle = [collected ? `${collected} 收藏` : "", count ? `${count} 首` : ""].filter(Boolean).join(" · ");
  return {
    id: `playlist-${base.id}`,
    type: "url",
    mediaType: "playlist",
    link: playlistLink(String(base.id), String(base.owner_id ?? "")),
    title: String(base.title ?? base.name ?? "歌单"),
    ...(subtitle ? { subtitle } : {}),
    ...(cover ? { posterPath: cover, coverUrl: cover } : {}),
  };
}

/** 按关键词取一组歌单，用作首页分区（车机接口没有官方运营位） */
export async function handlePlaylistSection(keyword: string, count = 10): Promise<VideoItem[]> {
  const rows = await searchPlaylists(keyword, count);
  return rows.map(toRexPlaylist);
}

const ARTIST_NOISE = /歌手|歌曲|热门|榜单|合集|未知|^\s*$/;

/** 车机没有歌手列表接口，用几个大盘词拼出“热门歌手” */
export async function handleHotArtists(count = 18): Promise<VideoItem[]> {
  const groups = await Promise.all(
    ["华语", "粤语", "欧美"].map((keyword) => searchArtists(keyword, 10).catch(() => [] as any[])),
  );
  const seen = new Set<string>();
  const out: VideoItem[] = [];
  for (const row of groups.flat()) {
    const ref = artistRef(row);
    if (!ref.id || seen.has(ref.id) || ARTIST_NOISE.test(ref.name) || ref.name.length > 20) continue;
    if (ref.trackCount < 1) continue;
    seen.add(ref.id);
    out.push(toRexArtist(ref));
    if (out.length >= count) return out;
  }
  return out;
}

async function loadArtistDetail(id: string): Promise<VideoItem> {
  const [info, entities] = await Promise.all([artistInfo(id), artistTracks(id)]);
  const tracks = entities.map((entity) => toRexTrack(trackRef(entity)));
  const subtitle = [tracks.length ? `${tracks.length} 首热门` : "", info.albumCount ? `${info.albumCount} 张专辑` : ""]
    .filter(Boolean)
    .join(" · ");
  return {
    ...toRexArtist(info),
    ...(subtitle ? { subtitle } : {}),
    ...(info.intro ? { description: info.intro.slice(0, 300) } : {}),
    tracks,
  };
}

/** 首页「歌手」分区；点进某个歌手时 Rex 会带 peopleId 再次调用 */
export async function handleArtists(params: { peopleId?: string; id?: string } = {}): Promise<VideoItem[]> {
  const peopleId = String(params.peopleId ?? params.id ?? "").trim();
  if (/^\d{1,30}$/.test(peopleId)) return [await loadArtistDetail(peopleId)];
  return handleHotArtists();
}

export async function handleSearch(params: { keyword?: string; kind?: string; page?: string }): Promise<VideoItem[]> {
  const keyword = String(params.keyword ?? "").trim();
  if (!keyword) return [];
  const kind = String(params.kind ?? "all");

  if (kind === "artists") return (await searchArtists(keyword, 20)).map((row) => toRexArtist(artistRef(row)));
  if (kind === "playlists") return handlePlaylistSection(keyword, 30);
  if (kind === "albums") return albumsFromEntities(await searchTracks(keyword, 40), 12);
  if (kind === "songs" || kind === "tracks") {
    return (await searchTracks(keyword, 40)).map((entity) => toRexTrack(trackRef(entity)));
  }

  // 混合结果：Rex 会按 mediaType 自动分组（歌手 / 专辑 / 歌曲 / 歌单）
  const [artists, trackRows, playlists] = await Promise.all([
    searchArtists(keyword, 12).catch(() => [] as any[]),
    searchTracks(keyword, 20).catch(() => [] as any[]),
    searchPlaylists(keyword, 8).catch(() => [] as any[]),
  ]);
  const albums = await albumsFromEntities(trackRows, 6).catch(() => [] as VideoItem[]);
  return [
    ...artists.map((row) => toRexArtist(artistRef(row))),
    ...albums,
    ...trackRows.map((entity) => toRexTrack(trackRef(entity))),
    ...playlists.map(toRexPlaylist),
  ];
}

const uniqueStr = (list: string[]) => list.filter((value, index) => list.indexOf(value) === index);

/**
 * 匿名读不到时，从账号里的歌单行挖其他 id / 作者再试一轮：
 * 收藏来的歌单，行里的 id 可能只是「收藏记录 id」，真正的 playlist id 或原作者在别的字段里。
 */
async function minePlaylistRow(id: string): Promise<{ ids: string[]; owners: string[]; keys: string[]; dump: string; title: string; count: number }> {
  const empty = { ids: [] as string[], owners: [] as string[], keys: [] as string[], dump: "", title: "", count: 0 };
  if (!getAccount()) return empty;
  const rows = await myPlaylists(50).catch(() => [] as Json[]);
  const row = rows.find((item) => String(item.base_info?.id ?? "") === id);
  if (!row) return empty;
  const ids: string[] = [];
  const owners: string[] = [];
  const walk = (node: any, key: string, depth: number) => {
    if (!node || depth > 3) return;
    if (typeof node === "string") {
      if (node.startsWith("_000")) owners.push(node);
      else if (/^\d{15,20}$/.test(node)) {
        if (/owner|creator|author|user|uid|sec/i.test(key)) owners.push(node);
        else ids.push(node);
      }
      return;
    }
    if (typeof node === "object") for (const k in node) walk(node[k], k, depth + 1);
  };
  for (const k in row) walk(row[k], k, 0);
  return {
    ids: uniqueStr(ids.filter((value) => value !== id)).slice(0, 3),
    owners: uniqueStr(owners.filter((value) => value !== id)).slice(0, 3),
    keys: Object.keys(row.base_info ?? {}),
    dump: JSON.stringify(row.base_info ?? row).slice(0, 420),
    title: String(row.base_info?.title ?? row.base_info?.name ?? ""),
    count: Number(row.resource_cnt?.track_cnt ?? row.resource_cnt ?? 0) || 0,
  };
}

async function loadPlaylistDetail(id: string, ownerId: string): Promise<VideoItem> {
  // 列表页已判定读不到：直接给结论，省掉一轮必然失败的请求
  if (unreadablePlaylists.has(id)) {
    return {
      id,
      type: "url",
      mediaType: "playlist",
      link: playlistLink(id, ownerId),
      title: "这张歌单车机接口读不到",
      subtitle: "在汽水 App 里把这张歌单另存为新歌单，就能读能播",
      description: "车机开放接口（type=2 导入歌单）不返回曲目，客户端侧没有可用的替代入口。",
    };
  }
  // 匿名接口对部分歌单会报「记录不存在」，账号票据又不被这个端点接受（28001003）。
  // 这里把几种走法依次试一遍，全挂就把各家错误摊在详情页上，方便定位。
  type Attempt = { playlist?: Json; entities: Json[]; shape?: string };
  const tries: Array<[string, () => Promise<Attempt>]> = [["匿名", () => playlistTracks(id, ownerId)]];
  if (ownerId) tries.push(["匿名·无作者", () => playlistTracks(id, "")]);
  const account = getAccount();
  if (account) {
    tries.push(["账号票据", () => accountPlaylistTracks(id, ownerId)]);
    if (account.userId && account.userId !== ownerId) {
      tries.push(["账号票据·本人", () => accountPlaylistTracks(id, account.userId)]);
    }
  }

  const errors: string[] = [];
  let result: Attempt | null = null;
  const run = async (label: string, task: () => Promise<Attempt>) => {
    try {
      const attempt = await task();
      // 只有拿到曲目才算成功：部分歌单会返回元数据但 0 首（导入进来的歌单），
      // 这种进详情页会变成空页 + 重试，不如当成失败继续换走法。
      if (attempt.entities.length) {
        result = attempt;
        return true;
      }
      const shape = attempt.shape ? `(${attempt.shape})` : "";
      errors.push(`${label}:${attempt.playlist ? `0 首${shape}` : "空结果"}`);
    } catch (error) {
      errors.push(`${label}:${String((error as Error)?.message ?? error)}`);
    }
    return false;
  };
  for (const [label, task] of tries) if (await run(label, task)) break;

  let rowKeys: string[] = [];
  let rowDump = "";
  let rowTitle = "";
  if (!result) {
    // 换 id / 换作者再试：只在前面的走法全挂后才跑，正常歌单不受影响
    const mined = await minePlaylistRow(id);
    rowKeys = mined.keys;
    rowDump = mined.dump;
    rowTitle = mined.title;
    let budget = 6;
    for (const candidateId of [id, ...mined.ids]) {
      for (const candidateOwner of uniqueStr([ownerId, ...mined.owners])) {
        if (budget-- <= 0) break;
        if (candidateId === id && candidateOwner === ownerId) continue;
        if (await run(`匿名 ${candidateId.slice(-6)}/${candidateOwner.slice(-6) || "-"}`, () => playlistTracks(candidateId, candidateOwner))) break;
      }
      if (result) break;
    }
  }
  if (!result) {
    // 宿主对没有可播曲目的歌单只会把它当单曲丢进播放器，描述文字看不到，
    // 所以把诊断写进标题/副标题——这两处播放器一定会显示。
    const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);
    const accountMsg = errors.filter((item) => item.startsWith("账号票据")).join(" | ") || "没登录";
    const anonMsg = errors.filter((item) => item.startsWith("匿名")).join(" | ");
    const rowMsg = rowKeys.length ? `${rowKeys.join(",")}${rowDump ? ` ${rowDump}` : ""}` : "没取到歌单行";
    return {
      id,
      type: "url",
      mediaType: "playlist",
      link: playlistLink(id, ownerId),
      title: clip(`读不到 · ${accountMsg}`, 60),
      subtitle: clip(rowMsg, 80),
      description: `接口反馈：${errors.join(" / ").slice(0, 260)} · 匿名：${anonMsg}`,
    };
  }
  const picked: { playlist?: Json; entities: Json[] } = result;
  const { playlist } = picked;
  // 响应里可能混进歌单自己（推荐歌单、本歌单副本），留着会显示成「1 首」然后被宿主当单曲播
  const entities = picked.entities.filter((entity) => String(entity.base_info?.id ?? "") !== id);
  if (!entities.length) {
    return {
      id,
      type: "url",
      mediaType: "playlist",
      link: playlistLink(id, ownerId),
      title: "这个歌单里没有可播的曲目",
      subtitle: "接口返回了歌单信息，但曲目列表是空的",
    };
  }
  const tracks = entities.map((entity) => toRexTrack(trackRef(entity)));
  const base = playlist?.base_info ?? {};
  const cover = formatCover(playlist?.display_info?.url_cover);
  const owner = playlist?.relation_info?.owner?.name;
  const collected = formatCount(Number(playlist?.stats?.count_collected ?? 0));
  const subtitle = [owner, collected ? `${collected} 收藏` : "", tracks.length ? `${tracks.length} 首` : ""]
    .filter(Boolean)
    .join(" · ");
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

/** 导入/下架的曲目常常没有播放地址，用「歌名 + 歌手」在汽水里找同名曲兜底 */
async function fallbackAudio(ref: TrackRef): Promise<{ url: string; preview: boolean } | null> {
  const keyword = `${ref.name} ${ref.artists[0] ?? ""}`.trim();
  if (!keyword) return null;
  const rows = await searchTracks(keyword, 6).catch(() => [] as Json[]);
  const norm = (text: string) => String(text).replace(/[\s\-—_·.,，。!！?？()（）[\]【】]/g, "").toLowerCase();
  for (const row of rows) {
    const alt = trackRef(row);
    if (norm(alt.name) !== norm(ref.name)) continue;
    const audio = await resolveAudio(row).catch(() => null);
    if (audio?.url) return audio;
  }
  return null;
}

async function loadTrackDetail(id: string): Promise<VideoItem> {
  let entity: Json;
  try {
    entity = await trackEntity(id);
  } catch (error) {
    return noticeItem("这首歌打不开", `id ${id}`, String((error as Error)?.message ?? error).slice(0, 100));
  }
  const ref = trackRef(entity);
  const audio = (await resolveAudio(entity).catch(() => null)) ?? (await fallbackAudio(ref));
  if (!audio?.url) {
    // 不抛错：抛了宿主只会停在「重试」，这里给一条能看懂的原因
    return {
      ...toRexTrack(ref),
      link: trackLink(id),
      description: "汽水没给这首歌播放地址（导入或已下架），换一首试试。",
    };
  }
  const notes = [formatDuration(ref.durationMs), audio.preview ? "仅试听片段" : ""].filter(Boolean).join(" · ");
  return {
    ...toRexTrack(ref),
    ...(notes ? { description: notes } : {}),
    videoUrl: audio.url,
  };
}

async function loadAlbumDetail(id: string): Promise<VideoItem> {
  const { album, entities } = await albumDetail(id);
  const ref = albumRef(album);
  return {
    ...toRexAlbum(ref),
    ...(ref.intro ? { description: ref.intro.slice(0, 300) } : {}),
    tracks: entities.map((entity) => toRexTrack(trackRef(entity))),
  };
}

export async function handleDetail(link: string): Promise<VideoItem> {
  const parsed = parseLink(link);
  if (!parsed) throw new Error(`无法识别的链接：${link}`);
  if (parsed.kind === "track") return loadTrackDetail(parsed.id);
  if (parsed.kind === "scene") return handleSceneDetail(parsed.id);
  if (parsed.kind === "artist") return loadArtistDetail(parsed.id);
  if (parsed.kind === "album") return loadAlbumDetail(parsed.id);
  if (parsed.kind === "login") return (await handleLogin())[0];
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

const LOGIN_LINK = `${LINK_PREFIX}login:0`;

function toRexAccount(account: { nickname: string; userId: string; vip: boolean; avatar: string }): VideoItem {
  const subtitle = [account.vip ? "VIP" : "普通账号", account.userId].filter(Boolean).join(" · ");
  return {
    id: "my-account",
    type: "url",
    link: LOGIN_LINK,
    title: `已登录：${account.nickname || account.userId}`,
    ...(subtitle ? { subtitle } : {}),
    description: "长按这一条可以退出登录。登录态只保存在本机。",
    ...(account.avatar ? { posterPath: account.avatar, coverUrl: account.avatar } : {}),
    actions: [{ id: "logout", title: "退出登录", functionName: "logoutAccount" }],
  };
}

function noticeItem(title: string, subtitle?: string, description?: string): VideoItem {
  return {
    id: "my-notice",
    type: "url",
    link: LOGIN_LINK,
    title,
    ...(subtitle ? { subtitle } : {}),
    ...(description ? { description } : {}),
  };
}

function toRexQr(qr: string, title: string): VideoItem {
  return {
    id: "login-qr",
    type: "url",
    link: LOGIN_LINK,
    title,
    subtitle: "点开这一条看大图，用汽水音乐 App 扫码",
    description: "二维码 5 分钟内有效。登录态只保存在本机，不会上传到任何服务器。",
    posterPath: qr,
    detailPoster: qr,
    coverUrl: qr,
  };
}

/** 未登录时点一下就进登录分区 */
function loginPrompt(): VideoItem {
  return noticeItem("点这里登录汽水音乐", "登录后才会显示账号里的歌单", "汽水音乐的账号数据要扫码授权才能读，接口不给匿名访问。");
}

export async function handleLogin(): Promise<VideoItem[]> {
  const account = getAccount();
  if (account) return [toRexAccount(account)];
  const pending = pendingLogin();
  if (pending) {
    const result = await checkLogin().catch((error) => ({ state: "unknown" as const, debug: String((error as Error)?.message ?? error) }));
    if (result.state === "done" && result.account) return [toRexAccount(result.account)];
    if (result.state === "unknown") {
      return [noticeItem("登录没走完（把这段发我）", result.debug ?? "没有详情")];
    }
    if (result.state !== "expired") {
      return [toRexQr(pending.qr, result.state === "scanned" ? "已扫码，请在手机上点确认" : "用汽水音乐 App 扫码登录")];
    }
  }
  const ticket = await startLogin();
  return [toRexQr(ticket.qr, "用汽水音乐 App 扫码登录")];
}

/** 预检判定读不到的歌单：点击时直接给结论，不再白等一轮重试 */
const unreadablePlaylists = new Set<string>();

/** 车机接口读不到这张歌单：列表里就标出来，别让用户点进空白播放器再猜 */
const BLOCKED_HINT = "车机读不到，需在汽水 App 里另存";

export async function handleMyPlaylists(count = 50): Promise<VideoItem[]> {
  if (!getAccount()) return [loginPrompt()];
  try {
    const rows = await myPlaylists(count);
    if (!rows.length) return [noticeItem("还没有歌单", "账号里没有自建或收藏的歌单")];
    return await Promise.all(
      rows.map(async (row) => {
        const card = toRexPlaylist(row);
        const id = String(row.base_info?.id ?? "");
        const owner = String(row.base_info?.owner_id ?? "");
        if (!id) return card;
        // 每张卡各试读 1 首：匿名读得到就正常显示，读不到就地标注
        const readable = await playlistTracks(id, owner, 1)
          .then((result) => result.entities.length > 0)
          .catch(() => false);
        if (readable) {
          unreadablePlaylists.delete(id);
          return card;
        }
        unreadablePlaylists.add(id);
        return { ...card, subtitle: [card.subtitle, BLOCKED_HINT].filter(Boolean).join(" · ") };
      }),
    );
  } catch (error) {
    return [noticeItem("歌单读取失败", String((error as Error).message ?? error).slice(0, 90))];
  }
}

export async function handleRecentPlayed(count = 50): Promise<VideoItem[]> {
  if (!getAccount()) return [loginPrompt()];
  try {
    const entities = await myRecentPlayed(count);
    if (!entities.length) return [noticeItem("还没有播放记录", "在汽水音乐里听几首歌再回来")];
    return entities.map((entity) => toRexTrack(trackRef(entity)));
  } catch (error) {
    return [noticeItem("最近播放读取失败", String((error as Error).message ?? error).slice(0, 90))];
  }
}

/** 用账号的最近播放当种子：最常听的几个歌手，各拉一批热门曲，轮流出歌并排掉听过的 */
export async function handleTaste(seedCount = 24, artistLimit = 5): Promise<VideoItem[]> {
  if (!getAccount()) return [loginPrompt()];
  try {
    const recent = await myRecentPlayed(seedCount);
    if (!recent.length) return [noticeItem("还没有播放记录", "在汽水音乐里听几首歌再回来")];
    const played = new Set<string>();
    const weights = new Map<string, { name: string; hits: number }>();
    for (const entity of recent) {
      played.add(String(entity?.base_info?.id ?? entity?.id ?? ""));
      for (const artist of artistLinksOf(entity)) {
        const row = weights.get(artist.id) ?? { name: artist.name, hits: 0 };
        row.hits += 1;
        weights.set(artist.id, row);
      }
    }
    const top = [...weights.entries()].sort((a, b) => b[1].hits - a[1].hits).slice(0, artistLimit);
    if (!top.length) return [noticeItem("没认出歌手", "最近播放里没有带歌手信息的曲目")];
    const groups = await Promise.all(top.map(([id]) => artistTracks(id, 20).catch(() => [] as Json[])));
    const seen = new Set(played);
    const out: VideoItem[] = [];
    // 一个歌手一首地轮，避免整段都是同一个人
    for (let i = 0; i < 20 && out.length < 50; i++) {
      for (const tracks of groups) {
        const entity = tracks[i];
        if (!entity) continue;
        const ref = trackRef(entity);
        if (!ref.id || seen.has(ref.id)) continue;
        seen.add(ref.id);
        out.push(toRexTrack(ref));
        if (out.length >= 50) break;
      }
    }
    if (!out.length) return [noticeItem("没凑出新歌", "最近播放里的歌手暂时没有别的曲目")];
    return out;
  } catch (error) {
    return [noticeItem("口味推荐失败", String((error as Error).message ?? error).slice(0, 90))];
  }
}

export async function handleSubtitle(params: { id?: string; link?: string }): Promise<SubtitleItem[]> {  const parsed = params.link ? parseLink(params.link) : null;
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
