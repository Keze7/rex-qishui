// 汽水音乐车机开放接口：匿名 client_token 即可读写公开曲库，不经过 Argus / X-Helios 签名。
const PREFIX = "/api/luna/v1/platform";
const SDK_UA = "LunaOpenSDK/1.0.10";
// 车机接口要求 19 位设备号，固定一个即可，无需与账号绑定。
const DEVICE_ID = "1270651532221750165";
const COMMON_PARAMS: Record<string, string> = {
  aid: "765213",
  app_id: "765213",
  app_name: "byte_autoservice_lite",
  version_code: "100010",
  version_name: "1.0.10",
  channel: "bydSong",
  sdk_aid: "753999",
  caller_name: "luna_open_sdk",
  sdk_version_code: "100000100",
  sdk_version_name: "0.0.1",
  sdk_channel: "Test",
  vehicle_type: "BYD",
  device_brand: "BYD",
  device_type: "BYD",
  device_platform: "android",
  resolution: "1920x1080",
  os_version: "13",
  ac: "wifi",
};

export type Json = Record<string, any>;

/**
 * 字节系图片服务：`urls[0] + uri` 只是裸路径，直接请求会 400。
 * 必须追加 `~{template_prefix}-origin.image`，缺模板后缀 CDN 会报 "fail to get template"。
 */
export function formatCover(image?: Json | string | null): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  const prefix = Array.isArray(image.urls) && image.urls.length ? String(image.urls[0]) : "";
  const uri = image.uri ? String(image.uri) : "";
  if (!prefix || !uri) return "";
  const base = prefix + uri;
  const template = image.template_prefix ? String(image.template_prefix) : "";
  return template ? `${base}~${template}-origin.image` : base;
}

export interface TrackRef {
  id: string;
  name: string;
  artists: string[];
  album?: string;
  cover?: string;
  durationMs: number;
  /** 非 `1 == 1` 的曲目需要会员，匿名只能拿到 30 秒片段 */
  vip: boolean;
}

export interface AudioSource {
  url: string;
  preview: boolean;
  duration: number;
}

function buildQuery(extra: Record<string, string | number> = {}): string {
  // Rex 跑在 iOS 的 JSC 里，没有 URLSearchParams，手写拼接
  const params: Record<string, string | number> = {
    ...COMMON_PARAMS,
    device_id: DEVICE_ID,
    did: DEVICE_ID,
    iid: DEVICE_ID,
    vehicle_id: `qishui-${DEVICE_ID}`,
    _timestamp: String(Math.floor(Date.now() / 1000)),
    _nonce: String(Math.floor(Math.random() * 9000) + 1000),
  };
  for (const key in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) params[key] = extra[key];
  }
  const parts: string[] = [];
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`);
    }
  }
  return parts.join("&");
}

async function http<T = Json>(
  url: string,
  options: { method?: "GET" | "POST"; headers?: Record<string, string>; data?: string } = {},
): Promise<T> {
  const response = await Widget.http.request<T>({
    url,
    method: options.method ?? "GET",
    headers: options.headers ?? {},
    ...(options.data !== undefined ? { data: options.data } : {}),
    timeout: 20,
  });
  return (typeof response.data === "string" ? JSON.parse(response.data) : response.data) as T;
}

let tokenCache: { value: string; at: number } | null = null;
const TOKEN_TTL_MS = 30 * 60 * 1000;

async function clientToken(refresh = false): Promise<string> {
  if (!refresh && tokenCache && Date.now() - tokenCache.at < TOKEN_TTL_MS) {
    return tokenCache.value;
  }
  const data = await http<Json>(`https://open.qishui.com${PREFIX}/client/token/get/?${buildQuery({ trigger_type: "cold_start" })}`, {
    headers: { "user-agent": SDK_UA },
  });
  if (typeof data.client_token !== "string" || !data.client_token) {
    throw new Error(`汽水客户端令牌获取失败${data.err_msg ? `：${data.err_msg}` : ""}`);
  }
  tokenCache = { value: data.client_token, at: Date.now() };
  return tokenCache.value;
}

async function platform<T = Json>(path: string, body: Json = {}): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const token = await clientToken(attempt > 0);
    const data = await http<Json>(`https://open.douyin.com${PREFIX}${path}?${buildQuery()}`, {
      method: "POST",
      headers: { "user-agent": SDK_UA, "content-type": "application/json", "access-token": token },
      data: JSON.stringify({ ...body, common_params: {} }),
    });
    const code = Number(data.err_no ?? data.data?.error_code ?? 0);
    // 28001008：令牌过期，换一号令牌重试一次
    if (code === 28001008 && attempt === 0) continue;
    if (code) throw new Error(`汽水接口错误 ${code}${data.err_msg ? `：${data.err_msg}` : ""}`);
    if (!data.data || typeof data.data !== "object") throw new Error("汽水接口返回缺少 data");
    return data.data as T;
  }
}

/** 搜索结果为分组结构，只取目标分组内的实体 */
async function searchEntities(type: "track" | "playlist" | "artist", keyword: string, limit: number): Promise<any[]> {
  const searchId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const data = await platform<Json>("/search/", {
    q: keyword,
    cursor: "0",
    search_id: searchId,
    from_search_id: searchId,
    search_method: "input",
    search_type: type,
    search_scene: "normal",
    scene_name: "search",
    ab_param: "",
    last_viewed_media: {},
  });
  const groups: Json[] = Array.isArray(data.result_groups) ? data.result_groups : [];
  const group = groups.find((item) => item.id === `${type}s`) ?? groups[0];
  const rows: Json[] = Array.isArray(group?.data) ? group.data : [];
  return rows
    .map((row) => row.entity?.[type])
    .filter(Boolean)
    .slice(0, limit);
}

export async function searchTracks(keyword: string, limit = 30): Promise<Json[]> {
  return searchEntities("track", keyword, limit);
}

export async function searchPlaylists(keyword: string, limit = 20): Promise<Json[]> {
  return searchEntities("playlist", keyword, limit);
}

/** 车机搜索支持歌手，但 album 分组恒为空（没有专辑端点） */
export async function searchArtists(keyword: string, limit = 20): Promise<Json[]> {
  return searchEntities("artist", keyword, limit);
}

export interface ArtistRef {
  id: string;
  name: string;
  avatar?: string;
  trackCount: number;
  albumCount: number;
  intro?: string;
}

export function artistRef(entity: Json): ArtistRef {
  const base = entity?.base_info ?? entity ?? {};
  return {
    id: String(base.id ?? ""),
    name: String(base.full_display_name ?? base.simple_display_name ?? base.name ?? "未知歌手"),
    avatar: formatCover(base.url_avatar),
    trackCount: Number(base.count_tracks ?? 0),
    albumCount: Number(base.count_albums ?? 0),
    intro: base.intro ? String(base.intro) : undefined,
  };
}

export async function artistInfo(id: string): Promise<ArtistRef> {
  const data = await platform<Json>("/artist/detail/", { artist_id: id });
  return artistRef(data.artist_info ?? {});
}

/** 车机只下发歌手热门歌曲，最多 50 首，没有分页 */
export async function artistTracks(id: string, count = 50): Promise<Json[]> {
  const data = await platform<Json>("/artist/tracks/", { artist_id: id, count, cursor: "0" });
  return Array.isArray(data.tracks) ? data.tracks : [];
}

export interface AlbumRef {
  id: string;
  name: string;
  cover?: string;
  trackCount: number;
  artists: string[];
  releaseDate?: string;
  intro?: string;
}

export function albumRef(entity: Json): AlbumRef {
  const base = entity?.base_info ?? {};
  const artists: string[] = Array.isArray(entity?.related_info?.artist_links)
    ? entity.related_info.artist_links.map((item: Json) => String(item.name || "")).filter(Boolean)
    : [];
  const released = Number(base.release_date ?? 0);
  return {
    id: String(base.id ?? ""),
    name: String(base.name ?? "未知专辑"),
    cover: formatCover(entity?.display?.url_cover ?? entity?.display_info?.url_cover),
    trackCount: Number(base.count_tracks ?? 0),
    artists,
    ...(released > 0 ? { releaseDate: new Date(released * 1000).toISOString().slice(0, 10) } : {}),
    intro: base.intro ? String(base.intro) : undefined,
  };
}

/** 隐藏端点：SDK 未收录，但车机通道可用，返回 album_info + tracks */
export async function albumDetail(id: string): Promise<{ album: Json; entities: Json[] }> {
  const data = await platform<Json>("/album/detail/", { album_id: id });
  const rows: Json[] = Array.isArray(data.tracks) ? data.tracks : [];
  return { album: data.album_info ?? {}, entities: rows };
}

/** 专辑没有独立搜索，只能从曲目的 album_link 反推 */
export function albumLinksOf(entities: Json[]): Array<{ id: string; name: string }> {
  const seen = new Set<string>();
  const out: Array<{ id: string; name: string }> = [];
  for (const entity of entities) {
    const link = entity?.related_info?.album_link;
    const id = link?.id ? String(link.id) : "";
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: String(link.name ?? "未知专辑") });
  }
  return out;
}

/** 歌单分页：每页给 40~48 首，游标每次 +50，大歌单要循环拉 */
export async function playlistTracks(
  id: string,
  ownerId = "",
  limit = 200,
): Promise<{ playlist?: Json; entities: Json[] }> {
  const entities: Json[] = [];
  let playlist: Json | undefined;
  let cursor = "0";
  for (let page = 0; page < 8; page++) {
    const data = await platform<Json>("/playlist/detail/", {
      playlist_id: id,
      owner_id: ownerId,
      count: 100,
      cursor,
      type: null,
    });
    playlist = playlist ?? data.playlist;
    const rows: Json[] = Array.isArray(data.media_entities) ? data.media_entities : [];
    for (const row of rows) {
      // 歌单行是 { media_id, media_type, track_entity }，不是通用的 entity 包装
      const entity =
        row.track_entity ?? row.entity?.track ?? row.entity?.media?.track_entity ?? (row.base_info ? row : null);
      if (entity?.base_info?.id) entities.push(entity);
      if (entities.length >= limit) break;
    }
    const next = String(data.next_cursor ?? "");
    if (!data.has_more || !next || next === cursor || entities.length >= limit) break;
    cursor = next;
  }
  return { playlist, entities };
}

export async function feedModes(): Promise<Array<{ id: string; name: string; group: string; cover?: string }>> {
  const data = await platform<Json>("/feed/mode/", {});
  const blocks: Json[] = Array.isArray(data.feed_mode_block) ? data.feed_mode_block : [];
  return blocks.flatMap((block: Json) =>
    (block.feed_mode ?? []).flatMap((item: Json) => {
      const mode = item.entity?.feed_mode;
      const id = mode?.scene_mode?.scene_mode_id;
      if (id == null) return [];
      return [{ id: String(id), name: String(mode.text || "推荐"), group: String(block.title || ""), cover: formatCover(mode.url_info) }];
    }),
  );
}

/** scene 传 null 时不限定场景；preference 可选 daily / fresh / familiar / explore 等口味 */
async function feedRequest(scene: string | null, count: number, preference: string | null): Promise<Json[]> {
  const data = await platform<Json>("/feed/song-tab/", {
    played_media: [],
    is_first_request: true,
    with_client_cache: false,
    is_did_first_request: false,
    count,
    feed_preference: {
      scene_mode_id: scene == null ? null : Number(scene),
      scene_mode_select_time: scene == null ? null : Date.now(),
      preference_mode: preference ?? null,
      total_request_count: 1,
      preference_mode_request_count: 1,
      current_mode_request_count: 1,
    },
  });
  const items: Json[] = Array.isArray(data.items) ? data.items : [];
  return items
    .filter((item) => !item.type || item.type === "track")
    .map((item) => item.entity?.track ?? item.entity?.media?.track_entity ?? item)
    .filter(Boolean);
}

// 车机 feed 是设备级单流：并发请求会互相打空（返回 0 首），必须串行排队
let feedChain: Promise<unknown> = Promise.resolve();
const feedCache = new Map<string, { at: number; promise: Promise<Json[]> }>();
const FEED_CACHE_MS = 60 * 1000;

export function feedTracks(scene: string | null, count = 30, preference: string | null = null): Promise<Json[]> {
  const key = `${scene ?? ""}|${preference ?? ""}|${count}`;
  const hit = feedCache.get(key);
  if (hit && Date.now() - hit.at < FEED_CACHE_MS) return hit.promise;

  const run = () => feedRequest(scene, count, preference);
  const next = feedChain.then(run, run);
  feedChain = next.catch(() => undefined);
  feedCache.set(key, { at: Date.now(), promise: next });
  next.catch(() => feedCache.delete(key));
  if (feedCache.size > 20) feedCache.clear();
  return next;
}

export async function trackEntity(id: string): Promise<Json> {
  const data = await platform<Json>("/media/mget/", {
    media_list: [{ id, type: "track" }],
    card_context: {},
  });
  const rows: Json[] = Array.isArray(data.media_list) ? data.media_list : [];
  const hit = rows.find((row) => String(row.media_id ?? row.track_entity?.base_info?.id) === String(id)) ?? rows[0];
  if (!hit?.track_entity) throw new Error("汽水没有返回这首歌的信息");
  return hit.track_entity;
}

/**
 * 音源解析：video_model 里的地址一律是 CENC 密文，播放要用 url_player_info 下发的明文 PlayInfoList。
 * 会员曲目没有 full 段，只能取到约 30 秒的 preview。
 */
export async function resolveAudio(entity: Json): Promise<AudioSource> {
  const player = entity.player_info;
  if (!player) throw new Error("这首歌没有可播放音源");
  for (const [kind, preview] of [
    ["full", false],
    ["preview", true],
  ] as const) {
    const info = player[kind]?.video_model_info;
    if (!info?.url_player_info) continue;
    const data = await http<Json>(String(info.url_player_info), { headers: { "user-agent": SDK_UA } });
    const list: Json[] = data.Result?.Data?.PlayInfoList ?? data.data?.PlayInfoList ?? data.PlayInfoList ?? [];
    const usable = list
      .filter((item) => item?.MainPlayUrl && !item.PlayAuth && !item.EncryptionMethod)
      .sort((a, b) => Number(b.Bitrate ?? 0) - Number(a.Bitrate ?? 0));
    if (!usable.length) continue;
    const best = usable[0];
    const duration = Number(best.Duration ?? 0);
    return {
      url: String(best.MainPlayUrl),
      preview: preview || (duration > 0 && duration < 25),
      duration,
    };
  }
  throw new Error("这首歌只有加密音源，暂不支持播放");
}

export function trackRef(entity: Json): TrackRef {
  const base = entity.base_info ?? {};
  const related = entity.related_info ?? {};
  const artists: string[] = Array.isArray(related.artist_links)
    ? related.artist_links.map((item: Json) => String(item.name || "")).filter(Boolean)
    : [];
  return {
    id: String(base.id ?? entity.id ?? ""),
    name: String(base.name ?? "未知歌曲"),
    artists: artists.length ? artists : ["未知歌手"],
    album: related.album_link?.name ? String(related.album_link.name) : undefined,
    cover: formatCover(entity.display_info?.cover_url),
    durationMs: Number(base.duration_ms ?? 0),
    vip: String(entity.commerce_info?.playable_condition ?? "1 == 1") !== "1 == 1",
  };
}

export function lyricOf(entity: Json): { original: string; translation?: string } {
  const info = entity.display_info?.lyric_info;
  const original = String(info?.lyric_entity?.content ?? "");
  const translations = info?.lang_translations ?? {};
  const translation = Object.values(translations)
    .map((item: any) => String(item?.content ?? ""))
    .find((text) => text.trim().length > 0);
  return { original, translation };
}
