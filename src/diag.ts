// 诊断模块：只做一件事——把「账号歌单详情为什么读不到曲目」的真实返回值摊开。
// 宿主对没有可播曲目的条目只会丢进播放器，描述文字不渲染，所以诊断必须在列表层出结果。
import { accountPlatform, getAccount, myPlaylists } from "./account";
import { type Json, playlistTracks } from "./api";

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

async function probeAccount(id: string, owner: string): Promise<{ line: string; detail: string[] }> {
  const detail: string[] = [];
  try {
    const data = await accountPlatform<Json>("/playlist/detail/", {
      playlist_id: id,
      owner_id: owner,
      count: 100,
      cursor: "0",
      type: null,
    });
    const rows: Json[] = Array.isArray(data.media_entities) ? data.media_entities : [];
    const keys = Object.keys(data).join(",");
    const line = `账号 ok rows=${rows.length} keys=${keys}`;
    if (rows.length) {
      detail.push(`row0 ${JSON.stringify(rows[0]).slice(0, 300)}`);
    } else {
      // 没行的时候，最有价值的是 playlist 对象里的计数（能确认服务端到底认不认这歌单）
      detail.push(`playlist ${JSON.stringify(data.playlist ?? {}).slice(0, 300)}`);
    }
    return { line, detail };
  } catch (error) {
    return { line: `账号 ✗${reason(error)}`, detail };
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
    const acc = await probeAccount(id, owner);
    out.push(item(`${title}`, `${anon} | ${acc.line}`));
    if (id === targetId) out.push(...spill(`${title} 明细`, acc.detail.join(" ‖ ")));
  }

  // 账号作用域里可能藏着别的歌单曲目端点，一次探完
  const candidates = ["/playlist/media/", "/me/playlist/media/", "/me/media/", "/playlist/item/", "/playlist/tracks/"];
  for (const path of candidates) {
    try {
      const data = await accountPlatform<Json>(path, {
        playlist_id: targetId,
        owner_id: targetOwner,
        count: 20,
        cursor: "0",
      });
      const keys = Object.keys(data).join(",");
      const rowsOf = Object.values(data).find((value) => Array.isArray(value)) as unknown[] | undefined;
      out.push(item(`探 ${path}`, `ok keys=${keys} 数组=${rowsOf ? rowsOf.length : 0}`));
    } catch (error) {
      out.push(item(`探 ${path}`, `✗${reason(error)}`));
    }
  }
  return out;
}
