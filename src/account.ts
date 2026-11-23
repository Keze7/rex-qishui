// 车机账号接口：扫码登录 → access_code → bd-ticket-guard 票据 → /me/*。
// 每个请求都要用扫码时生成的 P-256 私钥签名，签名实现在 sign.ts。
import { base64Encode, buildCsr, ecdsaSign, randomScalar, utf8Bytes } from "./sign";

const PREFIX = "/api/luna/v1/platform";
const SDK_UA = "LunaOpenSDK/1.0.10";
const CLIENT_KEY = "aw4bbxfujo741d09";
const DEVICE_ID = "1270651532221750165";
const AUTH_KEY = "qishui:account";
const PENDING_KEY = "qishui:login";
/** 二维码 5 分钟内有效，过期就重新点一次模块 */
const QR_TTL_MS = 5 * 60 * 1000;

const COMMON: Record<string, string> = {
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

export interface Account {
  /** P-256 私钥（hex），只存在本机 */
  key: string;
  ticket: string;
  cert: string;
  tsSign: string;
  accessCode: string;
  openId: string;
  expiresAt: number;
  userId: string;
  nickname: string;
  avatar: string;
  vip: boolean;
}

function query(extra: Record<string, string | number>): string {
  const params: Record<string, string | number> = {
    ...COMMON,
    device_id: DEVICE_ID,
    did: DEVICE_ID,
    iid: DEVICE_ID,
    vehicle_id: `qishui-${DEVICE_ID}`,
    _timestamp: String(Math.floor(Date.now() / 1000)),
    _nonce: String(Math.floor(Math.random() * 9000) + 1000),
    ...extra,
  };
  const parts: string[] = [];
  for (const key in params) {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`);
  }
  return parts.join("&");
}

function form(fields: Record<string, string>): string {
  const parts: string[] = [];
  for (const key in fields) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(fields[key])}`);
  return parts.join("&");
}

type RawResponse = { data: any; status: number; headers: Record<string, string> };

async function raw(url: string, options: { method?: "GET" | "POST"; headers?: Record<string, string>; data?: string } = {}): Promise<RawResponse> {
  const response = await Widget.http.request<any>({
    url,
    method: options.method ?? "GET",
    headers: { "user-agent": SDK_UA, ...(options.headers ?? {}) },
    ...(options.data !== undefined ? { data: options.data } : {}),
    timeout: 20,
  });
  const body = typeof response.data === "string" ? safeJson(response.data) : response.data;
  return { data: body, status: response.statusCode ?? 200, headers: response.headers ?? {} };
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function header(headers: Record<string, string>, name: string): string {
  const lower = name.toLowerCase();
  for (const key in headers) {
    if (key.toLowerCase() === lower) return String(headers[key]);
  }
  return "";
}

function checkBody(body: any): void {
  const code = Number(body?.err_no ?? body?.data?.error_code ?? 0);
  if (code) throw new Error(`汽水账号接口错误 ${code}${body?.err_msg ? `：${body.err_msg}` : ""}`);
}

// ---------- 本地存储 ----------

function storeGet<T>(key: string): T | null {
  try {
    return (Widget.storage?.get<T>(key) as T) ?? null;
  } catch {
    return null;
  }
}

function storeSet(key: string, value: unknown): void {
  try {
    Widget.storage?.set(key, value);
  } catch {
    /* 存储不可用时退化为内存态，至少当次可用 */
  }
}

function storeRemove(key: string): void {
  try {
    Widget.storage?.remove(key);
  } catch {
    /* ignore */
  }
}

export function getAccount(): Account | null {
  const saved = storeGet<Account>(AUTH_KEY);
  if (!saved || !saved.ticket || !saved.key) return null;
  return saved;
}

export function saveAccount(account: Account): void {
  storeSet(AUTH_KEY, account);
}

export function logout(): void {
  storeRemove(AUTH_KEY);
  storeRemove(PENDING_KEY);
}

// ---------- 登录 ----------

export interface LoginTicket {
  /** 二维码图片，data URL */
  image: string;
  expiresAt: number;
}

const QR_SCOPE = "user_info,luna.openapi.platform.interaction,luna.openapi.platform.me_tab,luna.commerce.openapi_platform.vip_info";

function qrParams(): string {
  const params: Record<string, string> = {
    aid: "1128",
    client_key: CLIENT_KEY,
    scope: QR_SCOPE,
    state: "",
    next: "",
    jump_type: "native",
    optional_scope_check: "",
    optional_scope_uncheck: "",
    customize_params: '{"source":"pc_auth","not_skip_confirm":"true"}',
    source_from: "native",
    device_platform: "android",
    // md5("com.luna.music.car")，车机端固定标识
    app_identity: "82a0737a3f8d93d9958c8a7938bbc365",
    signature: "cf9024ea72d9c71813238b13ea107a3d",
  };
  const parts: string[] = [];
  for (const key in params) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return parts.join("&");
}

/** 生成二维码并暂存私钥，等用户回来看结果 */
export async function startLogin(): Promise<LoginTicket> {
  const key = randomScalar();
  const csr = buildCsr(key);
  const result = await raw(`https://open.douyin.com/oauth/get_qrcode/?${qrParams()}`);
  const data = result.data?.data;
  if (!data?.token || !data?.qrcode) throw new Error("二维码生成失败，请稍后重试");
  const expiresAt = Date.now() + QR_TTL_MS;
  const image = `data:image/png;base64,${data.qrcode}`;
  // 图片一起存下来，重开模块不用重新生成二维码
  storeSet(PENDING_KEY, {
    token: String(data.token),
    key: key.toString(16),
    csr,
    image,
    expiresAt,
  });
  return { image, expiresAt };
}

interface Pending {
  token: string;
  key: string;
  csr: string;
  image: string;
  expiresAt: number;
}

export function pendingLogin(): Pending | null {
  const pending = storeGet<Pending>(PENDING_KEY);
  if (!pending || pending.expiresAt < Date.now()) return null;
  return pending;
}

/** 票据交换：CSR 只用于首次，续期用已有证书 */
async function fetchTicket(access: any, keyHex: string, credential: { csr?: string; cert?: string }): Promise<Omit<Account, "userId" | "nickname" | "avatar" | "vip">> {
  if (!access?.access_code) throw new Error("登录凭据缺失");
  const url = `https://open-client.douyin.com/passport/open/get_access_ticket/?${form({ aid: "1128", client_key: CLIENT_KEY, device_platform: "android" })}`;
  const result = await raw(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "bd-ticket-guard-version": "1",
      ...(credential.csr ? { "bd-ticket-guard-client-csr": credential.csr } : { "bd-ticket-guard-client-cert": credential.cert ?? "" }),
    },
    data: form({ access_code: String(access.access_code), open_id: String(access.open_id || access.open_uid || "") }),
  });
  checkBody(result.data);
  const guardRaw = header(result.headers, "bd-ticket-guard-server-data");
  if (!guardRaw) throw new Error("票据缺失，请重新扫码");
  const guard = safeJson(decodeUtf8(guardRaw));
  if (!guard?.ticket || !guard?.client_cert) throw new Error("票据格式异常，请重新扫码");
  const cert = String(guard.client_cert);
  const expiresRaw = Number(access.expires_time ?? 0);
  const expiresAt =
    expiresRaw > 1e12 ? expiresRaw : expiresRaw > 1e9 ? expiresRaw * 1000 : expiresRaw > 0 ? Date.now() + expiresRaw * 1000 : Date.now() + 6 * 3600000;
  return {
    key: keyHex,
    ticket: String(guard.ticket),
    cert: cert.includes("-----BEGIN") ? base64Encode(utf8Bytes(cert)) : cert,
    tsSign: String(guard.ts_sign ?? ""),
    accessCode: String(access.access_code),
    openId: String(access.open_id || access.open_uid || ""),
    expiresAt,
  };
}

function decodeUtf8(base64: string): string {
  // atob 在 JSC 里也没有，手写 base64 → UTF-8
  const bytes = decodeBase64(base64);
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const byte = bytes[i];
    if (byte < 0x80) {
      out += String.fromCharCode(byte);
      i += 1;
    } else if (byte >= 0xc0 && byte < 0xe0) {
      out += String.fromCharCode(((byte & 31) << 6) | (bytes[i + 1] & 63));
      i += 2;
    } else if (byte >= 0xe0 && byte < 0xf0) {
      out += String.fromCharCode(((byte & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63));
      i += 3;
    } else {
      const code = ((byte & 7) << 18) | ((bytes[i + 1] & 63) << 12) | ((bytes[i + 2] & 63) << 6) | (bytes[i + 3] & 63);
      const offset = code - 0x10000;
      out += String.fromCharCode(0xd800 + (offset >> 10), 0xdc00 + (offset & 1023));
      i += 4;
    }
  }
  return out;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function decodeBase64(text: string): number[] {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, "");
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64.indexOf(clean[i]) << 18) |
      (B64.indexOf(clean[i + 1] ?? "A") << 12) |
      ((clean[i + 2] ? B64.indexOf(clean[i + 2]) : 0) << 6) |
      (clean[i + 3] ? B64.indexOf(clean[i + 3]) : 0);
    out.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  const pad = text.includes("=") ? (text.endsWith("==") ? 2 : 1) : 0;
  return pad ? out.slice(0, out.length - pad) : out;
}

/** 查一次扫码状态；确认后落库并返回账号 */
export async function checkLogin(): Promise<{ state: "waiting" | "scanned" | "expired" | "done"; account?: Account }> {
  const pending = pendingLogin();
  if (!pending) return { state: "expired" };
  const result = await raw(
    `https://open.douyin.com/oauth/check_qrcode/?${qrParams()}&token=${encodeURIComponent(pending.token)}&timestamp=${Date.now()}`,
  );
  const data = result.data?.data;
  const status = String(data?.status ?? "");
  if (status === "new") return { state: "waiting" };
  if (status === "scanned") return { state: "scanned" };
  if (status === "expired" || status === "refused") {
    storeRemove(PENDING_KEY);
    return { state: "expired" };
  }
  if (status !== "confirmed") return { state: "waiting" };
  const code = data?.code || data?.auth_code;
  if (!code) throw new Error("授权码缺失，请重新扫码");
  const accessResult = await raw(`https://open.qishui.com${PREFIX}/access/code/get/?${query({ auth_code: String(code) })}`);
  checkBody(accessResult.data);
  const access = accessResult.data?.data || accessResult.data;
  const base = await fetchTicket(access, pending.key, { csr: pending.csr });
  const meResult = await raw(`https://open.douyin.com${PREFIX}/me/info/?${query({})}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "access-token": base.ticket,
      "bd-ticket-guard-version": "1",
      "bd-ticket-guard-client-cert": base.cert,
      "bd-ticket-guard-client-data": clientData(base, "/me/info/"),
    },
    data: JSON.stringify({ common_params: {} }),
  });
  checkBody(meResult.data);
  const info = meResult.data?.data?.my_info;
  if (!info?.id) throw new Error("账号信息读取失败");
  const account: Account = {
    ...base,
    userId: String(info.id),
    nickname: String(info.nickname ?? ""),
    avatar: String(info.medium_avatar_url || info.avatar_url || ""),
    vip: info.is_vip === true,
  };
  saveAccount(account);
  storeRemove(PENDING_KEY);
  return { state: "done", account };
}

function clientData(account: Pick<Account, "key" | "ticket" | "tsSign">, path: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const content = `ticket=${account.ticket}&path=${PREFIX}${path}&timestamp=${timestamp}`;
  const signature = base64Encode(ecdsaSign(BigInt(`0x${account.key}`), utf8Bytes(content)));
  return base64Encode(
    utf8Bytes(
      JSON.stringify({
        ts_sign: account.tsSign,
        req_content: "ticket,path,timestamp",
        req_sign: signature,
        timestamp,
      }),
    ),
  );
}

let refreshing: Promise<Account> | null = null;

/** 票据一小时过期，用 access_code 换一张新的（不需要重新扫码） */
function ensureFresh(account: Account): Promise<Account> {
  if (account.expiresAt - Date.now() > 3600000) return Promise.resolve(account);
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const accessResult = await raw(`https://open.qishui.com${PREFIX}/access/code/refresh/?${query({ access_code: account.accessCode })}`);
    checkBody(accessResult.data);
    const access = accessResult.data?.data || accessResult.data;
    const base = await fetchTicket(access, account.key, { cert: account.cert });
    const next: Account = { ...account, ...base, accessCode: String(access.access_code || account.accessCode) };
    saveAccount(next);
    return next;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** 带票据签名的账号接口 */
export async function accountPlatform<T = any>(path: string, body: Record<string, any> = {}): Promise<T> {
  const current = getAccount();
  if (!current) throw new Error("未登录");
  const account = await ensureFresh(current);
  const result = await raw(`https://open.douyin.com${PREFIX}${path}?${query({})}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "access-token": account.ticket,
      "bd-ticket-guard-version": "1",
      "bd-ticket-guard-client-cert": account.cert,
      "bd-ticket-guard-client-data": clientData(account, path),
    },
    data: JSON.stringify({ ...body, common_params: { user_id: account.userId } }),
  });
  checkBody(result.data);
  return (result.data?.data ?? {}) as T;
}

export async function meInfo(): Promise<{ my_info: any }> {
  return accountPlatform("/me/info/");
}

export async function myPlaylists(count = 50): Promise<any[]> {
  const rows: any[] = [];
  let cursor = "";
  for (let page = 0; page < 4; page++) {
    const data = await accountPlatform<any>("/me/playlist/", { count: 100, cursor });
    const list: any[] = Array.isArray(data.playlists) ? data.playlists : Array.isArray(data.playlist_list) ? data.playlist_list : [];
    for (const row of list) rows.push(row?.playlist ?? row);
    if (data.has_more !== true || rows.length >= count) break;
    const next = String(data.next_cursor ?? "");
    if (!next || next === cursor) break;
    cursor = next;
  }
  return rows.slice(0, count);
}

/** 收藏来的歌单（type 2）匿名读不到，只能用账号票据读 */
export async function accountPlaylistTracks(id: string, ownerId = "", limit = 200): Promise<{ playlist?: any; entities: any[] }> {
  const entities: any[] = [];
  let playlist: any;
  let cursor = "0";
  for (let page = 0; page < 8 && entities.length < limit; page++) {
    const data = await accountPlatform<any>("/playlist/detail/", {
      playlist_id: id,
      owner_id: ownerId,
      count: 100,
      cursor,
      type: null,
    });
    playlist = playlist ?? data.playlist;
    const rows: any[] = Array.isArray(data.media_entities) ? data.media_entities : [];
    for (const row of rows) {
      const entity = row.track_entity ?? row.entity?.track ?? row.entity?.media?.track_entity ?? (row.base_info ? row : null);
      if (entity?.base_info?.id) entities.push(entity);
      if (entities.length >= limit) break;
    }
    const next = String(data.next_cursor ?? "");
    if (!data.has_more || !next || next === cursor) break;
    cursor = next;
  }
  return { playlist, entities };
}

export async function myRecentPlayed(count = 50): Promise<any[]> {
  const items: any[] = [];
  let cursor = "";
  // 服务端每页最多回 8 条，count 传多大都按 8 给，只能翻页
  for (let page = 0; page < 8 && items.length < count; page++) {
    const data = await accountPlatform<any>("/me/recent-played/", { count, cursor, media_type: "track", scene: "me_tab" });
    const rows: any[] = Array.isArray(data.media) ? data.media : [];
    for (const row of rows) {
      const media = row?.media;
      if (!media?.track_entity) continue;
      items.push({ ...media.track_entity, playedAt: Number(row.play_start_timestamp ?? 0) });
      if (items.length >= count) break;
    }
    if (items.length >= count || data.has_more !== true) break;
    const next = String(data.next_cursor ?? "");
    if (!next || next === cursor) break;
    cursor = next;
  }
  return items;
}
