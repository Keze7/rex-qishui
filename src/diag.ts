// 诊断模块：只做一件事——把「账号歌单详情为什么读不到曲目」的真实返回值摊开。
// 宿主对没有可播曲目的条目只会丢进播放器，描述文字不渲染，所以诊断必须在列表层出结果。
import { accountPlatform, getAccount, myPlaylists } from "./account";
import { type Json, feedTracks, playlistTracks } from "./api";

const LINK = "qishui:login";
const CHUNK = 52;

function reason(error: unknown): string {
  const text = String((error as Error)?.message ?? error);
  return text.replace(/^汽水(账号)?接口错误\s*/, "").slice(0, 80);
}

function item(title: string, subtitle: string): VideoItem {
  return { id: `diag-${title}-${subtitle.slice(0, 8)}`, type: "url", link: LINK, title, subtitle };
}

/** 长文本切块，保证每段都能在一行副标题里看全 */
function spill(label: string, text: string): VideoItem[] {
  const clean = String(text || "空").replace(/\s+/g, " ").trim();
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += CHUNK) parts.push(clean.slice(i, i + CHUNK));
  if (!parts.length) parts.push("空");
  return parts.map((chunk, index) =>
    item(parts.length > 1 ? `${label} ${index + 1}/${parts.length}` : label, chunk),
  );
}

async function probeAnonymous(id: string, owner: string): Promise<string> {
  try {
    const result = await playlistTracks(id, owner, 5);
    return `匿名 ok 曲${result.entities.length}`;
  } catch (error) {
    return `匿名 ✗${reason(error)}`;
  }
}

/** 用账号票据请求推荐接口：认了就能拿到「官方按你账号」的推荐 */
async function probeAccountFeed(): Promise<string> {
  try {
    const data = await accountPlatform<Json>("/feed/song-tab/", {
      played_media: [],
      is_first_request: true,
      with_client_cache: false,
      is_did_first_request: false,
      count: 10,
      feed_preference: {
        scene_mode_id: null,
        scene_mode_select_time: null,
        preference_mode: "daily",
        total_request_count: 1,
        preference_mode_request_count: 1,
        current_mode_request_count: 1,
      },
    });
    const items: Json[] = Array.isArray(data.items) ? data.items : [];
    const names = items
      .map((row) => (row.entity?.track ?? row.entity?.media?.track_entity)?.base_info?.name)
      .filter(Boolean);
    return `票据 ok 曲${items.length}${names.length ? "：" + names.slice(0, 5).join("/") : ""}`;
  } catch (error) {
    return `票据 ✗${reason(error)}`;
  }
}

export async function handleDiag(version: string): Promise<VideoItem[]> {
  const out: VideoItem[] = [];
  const account = getAccount();
  out.push(item("插件版本", version));
  out.push(
    account
      ? item("登录状态", `已登录 uid=${account.userId} ${account.nickname || ""}`)
      : item("登录状态", "未登录（账号接口全部用不了）"),
  );

  // 推荐接口：先看匿名（设备维度）出什么歌，再看账号票据认不认
  if (account) {
    try {
      const anon = await feedTracks(null, 5, "daily");
      const names = anon.map((row) => row?.base_info?.name).filter(Boolean);
      out.push(item("推荐·匿名", names.length ? names.slice(0, 5).join("/") : "0 首"));
    } catch (error) {
      out.push(item("推荐·匿名", `✗${reason(error)}`));
    }
    out.push(item("推荐·账号票据", await probeAccountFeed()));
  }

  let rows: Json[] = [];
  try {
    rows = await myPlaylists(50);
    out.push(item("歌单列表", `拿到 ${rows.length} 个`));
  } catch (error) {
    out.push(item("歌单列表", `失败 ${reason(error)}`));
    return out;
  }
  if (!rows.length) return out;

  // 挑曲目最多的那张当目标：正是打不开的那一类
  const target = rows.reduce((best: Json, row: Json) => {
    const count = (item: Json) => Number(item.resource_cnt?.track_cnt ?? item.resource_cnt ?? 0) || 0;
    return count(row) > count(best) ? row : best;
  }, rows[0]);
  const targetId = String(target.base_info?.id ?? "");
  const targetOwner = String(target.base_info?.owner_id ?? "");

  for (const row of rows) {
    const id = String(row.base_info?.id ?? "");
    const owner = String(row.base_info?.owner_id ?? "");
    const title = String(row.base_info?.title ?? "未命名").slice(0, 14);
    const anon = await probeAnonymous(id, owner);
    out.push(item(`${title}`, anon));
    // 打不开的那张：把账号里的整行原样摊开，owner / mix / share 这类 id 都在这行里
    if (id === targetId) {
      const dump = JSON.stringify({
        base_info: row.base_info ?? {},
        relation_info: row.relation_info ?? {},
        stats: row.stats ?? {},
        keys: Object.keys(row),
      });
      out.push(...spill(`${title} 行`, dump));
    }
  }

  // 行里所有像 id 的字符串，两两组合喂给匿名详情：owner 填错是 28001035 最常见的原因
  const ids = new Set<string>();
  const harvest = (node: any, depth: number) => {
    if (!node || depth > 4) return;
    if (typeof node === "string") {
      if (/^(_000[\w-]+|\d{15,20})$/.test(node)) ids.add(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const value of node) harvest(value, depth + 1);
      return;
    }
    if (typeof node === "object") for (const key in node) harvest(node[key], depth + 1);
  };
  harvest(target, 0);
  if (account?.userId) ids.add(account.userId);

  // 组合最多 10 组，并发发出去（详情接口没有 feed 那种单流限制），避免模块加载超时
  const combos: Array<[string, string]> = [];
  for (const candidateId of [targetId, ...ids]) {
    for (const candidateOwner of [targetOwner, ...ids, ""]) {
      if (combos.length >= 10) break;
      if (candidateId === targetId && (candidateOwner === targetOwner || candidateOwner === "")) continue;
      combos.push([candidateId, candidateOwner]);
    }
  }
  const tried = combos.length;
  const results = await Promise.all(
    combos.map(([candidateId, candidateOwner]) =>
      playlistTracks(candidateId, candidateOwner, 3)
        .then((result) => ({ candidateId, candidateOwner, count: result.entities.length }))
        .catch(() => ({ candidateId, candidateOwner, count: 0 })),
    ),
  );
  const hits = results
    .filter((entry) => entry.count > 0)
    .map((entry) => `✓曲${entry.count} id…${entry.candidateId.slice(-5)} owner…${entry.candidateOwner.slice(-5) || "空"}`);
  out.push(...spill("组合试", hits.length ? hits.slice(0, 4).join(" ; ") : `${tried} 组全失败`));
  return out;
}
