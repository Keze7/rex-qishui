import {
  type AlbumRef,
  type Json,
  type ArtistRef,
  type TrackRef,
  albumDetail,
  albumLinksOf,
  albumRef,
  artistInfo,
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

async function loadPlaylistDetail(id: string, ownerId: string): Promise<VideoItem> {
  let result;
  try {
    result = await playlistTracks(id, ownerId);
  } catch (error) {
    // 收藏来的歌单（type 2）匿名接口报「记录不存在」，有账号时用票据再试一次；
    // 该接口不接受账号票据（28001003），所以这类歌单最终仍可能打不开。
    if (!getAccount()) throw new Error("这个歌单打不开：车机接口只开放自建与抖音收藏的歌单");
    result = await accountPlaylistTracks(id, ownerId).catch(() => {
      throw new Error("这个歌单打不开：车机接口不给收藏来的歌单");
    });
  }
  const { playlist, entities } = result;
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

function toRexQr(image: string, title: string): VideoItem {
  return {
    id: "login-qr",
    type: "url",
    link: LOGIN_LINK,
    title,
    subtitle: "扫码并在手机上确认后，回到首页下拉刷新",
    description: "二维码 5 分钟内有效。登录态只保存在本机，不会上传到任何服务器。",
    posterPath: image,
    coverUrl: image,
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
    const result = await checkLogin().catch(() => ({ state: "waiting" as const }));
    if (result.state === "done" && result.account) return [toRexAccount(result.account)];
    if (result.state !== "expired") {
      return [toRexQr(pending.image, result.state === "scanned" ? "已扫码，请在手机上点确认" : "用汽水音乐 App 扫码登录")];
    }
  }
  const ticket = await startLogin();
  return [toRexQr(ticket.image, "用汽水音乐 App 扫码登录")];
}

export async function handleMyPlaylists(count = 50): Promise<VideoItem[]> {
  if (!getAccount()) return [loginPrompt()];
  try {
    const rows = await myPlaylists(count);
    if (!rows.length) return [noticeItem("还没有歌单", "账号里没有自建或收藏的歌单")];
    return rows.map(toRexPlaylist);
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
