// 车机账号接口：扫码登录 → access_code → bd-ticket-guard 票据 → /me/*。
// 每个请求都要用扫码时生成的 P-256 私钥签名，签名实现在 sign.ts。
import { mgetEntities, pickEntities } from "./api";
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
  /** 二维码图片的 https 地址（Rex 不渲染 data URI，只能借在线生成） */
  qr: string;
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

/**
 * 二维码内容就是接口给的 `qrcode_index_url`（aweme:// 深链）——官方那张 PNG 解出来一模一样。
 * Rex 的图片位只吃 http(s)，data URI 会渲染成裂图，所以交给在线生成服务出图。
 */
async function qrImageUrl(payload: string): Promise<string> {
  const text = encodeURIComponent(payload);
  const providers = [
    `https://quickchart.io/qr?text=${text}&size=600&margin=1&ecLevel=M&format=png`,
    `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=8&ecc=M&data=${text}`,
  ];
  for (const url of providers) {
    try {
      const res = await Widget.http.request({ url, method: "GET", decodable: false, timeout: 15 });
      if ((res.statusCode ?? 0) === 200) return url;
    } catch {
      /* 换下一家 */
    }
  }
  return providers[0];
}

/** 生成二维码并暂存私钥，等用户回来看结果 */
export async function startLogin(): Promise<LoginTicket> {
  const key = randomScalar();
  const csr = buildCsr(key);
  const result = await raw(`https://open.douyin.com/oauth/get_qrcode/?${qrParams()}`);
  const data = result.data?.data;
  if (!data?.token || !data?.qrcode_index_url) throw new Error("二维码生成失败，请稍后重试");
  const expiresAt = Date.now() + QR_TTL_MS;
  const qr = await qrImageUrl(String(data.qrcode_index_url));
  // 图片一起存下来，重开模块不用重新生成二维码
  storeSet(PENDING_KEY, {
    token: String(data.token),
    key: key.toString(16),
    csr,
    qr,
    expiresAt,
  });
  return { qr, expiresAt };
}

interface Pending {
  token: string;
  key: string;
  csr: string;
  qr: string;
  expiresAt: number;
}

export function pendingLogin(): Pending | null {
  const pending = storeGet<Pending>(PENDING_KEY);
  // 老版本存的是 data URI，渲染不出来，当作过期重来
  if (!pending || !pending.qr || pending.expiresAt < Date.now()) return null;
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

export type LoginState = "waiting" | "scanned" | "confirmed" | "expired" | "done" | "unknown";

export interface LoginResult {
  state: LoginState;
  account?: Account;
  /** 卡住时把每一步的原始返回带上，用户截图就能定位 */
  debug?: string;
}

/** 不同版本返回的 status 词不一样，全都归一化 */
const LOGIN_STATUS: Record<string, LoginState> = {
  new: "waiting",
  init: "waiting",
  scan: "scanned",
  scanned: "scanned",
  waiting_confirm: "scanned",
  confirm: "confirmed",
  confirmed: "confirmed",
  expired: "expired",
  cancel: "expired",
  canceled: "expired",
  refused: "expired",
  refuse: "expired",
};

function clip(value: unknown, max = 160): string {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? null);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** 从 redirect_url 之类的串里抠参数 */
function param(url: unknown, name: string): string {
  if (typeof url !== "string") return "";
  const parts = url.split(/[?&]/);
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return "";
}

/** 查一次扫码状态；确认后换票据落库 */
export async function checkLogin(): Promise<LoginResult> {
  const pending = pendingLogin();
  if (!pending) return { state: "expired" };
  const result = await raw(
    `https://open.douyin.com/oauth/check_qrcode/?${qrParams()}&token=${encodeURIComponent(pending.token)}&timestamp=${Date.now()}`,
  );
  const data = result.data?.data;
  const rawStatus = String(data?.status ?? "").toLowerCase();
  const state = LOGIN_STATUS[rawStatus];
  if (state === "expired") {
    storeRemove(PENDING_KEY);
    return { state: "expired" };
  }
  if (state === "waiting" || state === "scanned") return { state };
  if (state !== "confirmed") {
    return { state: "unknown", debug: `未知扫码状态「${rawStatus || "空"}」 ${clip(data)}` };
  }
  return redeem(data, pending);
}

/** confirmed 之后：授权码 → access_code → bd-ticket-guard 票据 → 账号信息 */
async function redeem(data: any, pending: Pending): Promise<LoginResult> {
  const trace: string[] = [`status=${String(data?.status)} keys=${Object.keys(data ?? {}).join(",")}`];
  try {
    let access: any = null;
    if (data?.access_code) {
      access = data;
      trace.push("响应里直接带 access_code");
    } else {
      const code =
        [data?.code, data?.auth_code, data?.access_token, data?.auth_token].find((v) => typeof v === "string" && v) ||
        param(data?.redirect_url, "code") ||
        param(data?.redirect_url, "auth_code");
      if (!code) return { state: "unknown", debug: `没拿到授权码 · ${trace.join(" · ")} · ${clip(data, 200)}` };
      // 参数名各版本不一样，按可能的名字依次试
      let lastError: unknown = null;
      for (const field of ["auth_code", "code"]) {
        try {
          const res = await raw(`https://open.qishui.com${PREFIX}/access/code/get/?${query({ [field]: String(code) })}`);
          trace.push(`code/get(${field}) ${res.status} ${clip(res.data)}`);
          checkBody(res.data);
          access = res.data?.data || res.data;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!access) throw lastError instanceof Error ? lastError : new Error("授权码兑换失败");
    }
    if (!access?.access_code) throw new Error("access_code 缺失");
    const base = await fetchTicket(access, pending.key, { csr: pending.csr });
    trace.push(`ticket ok expires=${base.expiresAt}`);
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
    trace.push(`me/info ${meResult.status} ${clip(meResult.data)}`);
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
    if (!getAccount()) return { state: "unknown", debug: "票据拿到了但本地存不进去（Widget.storage 不可写）" };
    return { state: "done", account };
  } catch (error) {
    const message = String((error as Error)?.message ?? error);
    return { state: "unknown", debug: `${message} · ${trace.join(" · ")}` };
  }
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
export async function accountPlaylistTracks(id: string, ownerId = "", limit = 200): Promise<{ playlist?: any; entities: any[]; shape?: string }> {
  const entities: any[] = [];
  const pending: string[] = [];
  let playlist: any;
  let lastShape = "";
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
      else if (row.media_id) pending.push(String(row.media_id));
      if (entities.length >= limit) break;
    }
    // 一行都没捞出来：换个字段再扒（导入的歌单常见），并把响应字段名带出来
    if (!entities.length) {
      for (const entity of pickEntities(data, [id])) entities.push(entity);
      if (!entities.length) lastShape = `${Object.keys(data).join(",")}|rows=${rows.length}`;
    }
    const next = String(data.next_cursor ?? "");
    if (!data.has_more || !next || next === cursor) break;
    cursor = next;
  }
  if (!entities.length && pending.length) {
    lastShape = `${lastShape}|ids=${pending.length}`;
    for (const entity of await mgetEntities(pending).catch(() => [])) entities.push(entity);
  }
  return { playlist, entities, ...(lastShape ? { shape: lastShape } : {}) };
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
