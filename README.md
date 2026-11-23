# 汽水音乐（rex-widget 插件）

基于汽水音乐**车机开放接口**的 Rex 音乐插件。公开曲库用匿名 client_token 即可读，不需要 Cookie，也不需要 Argus / X-Helios 客户端签名；「我的歌单」「最近播放」要扫码登录，账号接口用插件内实现的 P-256 签名。

## 安装地址

Rex 里添加插件，直接填这一行：

```
https://cdn.jsdelivr.net/gh/Keze7/rex-qishui@main/dist/qishui.js
```

## 能力

| 模块 | 说明 |
| --- | --- |
| 我的歌单 | 扫码登录后读 `/me/playlist/`，含「我喜欢的音乐」「抖音收藏的音乐」 |
| 最近播放 | `/me/recent-played/`，每页 8 条，翻页取 50 首 |
| 登录 | 首次显示二维码，扫码确认后落库；已登录时显示账号，长按可退出 |
| 每日推荐 | `feed_preference: daily`，每天换一批 |
| 推荐歌曲 | 通用推荐流 |
| 新歌速递 | `feed_preference: fresh` |
| 猜你喜欢 | `feed_preference: familiar` |
| 热门专辑 | 从每日推荐反推专辑，点进去是整张专辑 |
| 热歌歌单 / 华语经典 | 关键词搜出的歌单分区，显示收藏数 |
| 场景电台 | 45 个场景（深夜 EMO、通勤、运动…），点进去是 40 首推荐 |
| 热门歌手 | 18 位歌手，点进去是主页 + 最多 50 首热门单曲 |
| 搜索 | 全部（歌手 / 专辑 / 歌曲 / 歌单分组）/ 歌曲 / 歌手 / 专辑 / 歌单 |
| 播放 | 曲目详情返回 CDN 明文直链，`audio/mp4` + `Accept-Ranges` |
| 歌词 | 时间轴歌词，原文 / 译文 / 双语三档 |

歌单详情最多拉 200 首（每页 40~48 首，游标 +50，要循环）。

## 登录

```
打开「登录」分区 → 二维码 → 汽水音乐 App 扫一扫 → 手机上确认 → 回首页下拉刷新
```

- 二维码 5 分钟内有效，过期重开模块即可换一张。
- 登录态（票据 + 私钥）存在 `Widget.storage` 里，只在本机，不上传任何服务器。
- 票据约 6 小时过期，插件会用 `access_code` 自动续期，不需要重新扫码；换设备或清数据才要重扫。

### 为什么需要自己实现签名

车机账号接口要求 `bd-ticket-guard` 请求签名：

1. 生成 P-256 密钥对，拼一张 CSR，随 `get_access_ticket` 送给服务端；
2. 服务端返回票据、客户端证书和 `ts_sign`；
3. 之后每个请求都要用私钥对 `ticket=…&path=…&timestamp=…` 做 ECDSA-SHA256 签名，塞进 `bd-ticket-guard-client-data`。

Rex 跑在 iOS 的 JavaScriptCore 里，**没有 `node:crypto`**，也没有 Web Crypto。所以 `src/sign.ts` 用 BigInt 手写了 SHA-256、HMAC、RFC 6979 确定性随机数、P-256 标量乘与 ECDSA、DER/CSR 编码。单测直接与 `node:crypto` 对照：SPKI 逐字节一致、签名能被 Node 验签、CSR 自洽。

同一份代码在 JSC 里没有 `TextEncoder` / `URLSearchParams` / `atob`，全部手写。

## 已知限制

- **没有榜单与运营位**。首页轮播、飙升榜这类内容属于汽水 App 的运营接口，需要 Argus 签名，车机通道拿不到。
- **专辑没有独立搜索**。`/album/detail/` 可用（隐藏端点，SDK 未收录），但搜索的 `album` 分组恒为空，专辑只能从曲目的 `album_link` 反推。
- **feed 必须串行**。车机 `/feed/song-tab/` 是设备级单流，并发请求会互相打空（返回 0 首），`api.ts` 里用 promise 链排队 + 60 秒结果缓存。
- **收藏来的歌单（type 2）打不开**。`/playlist/detail/` 对该类歌单返回「记录不存在」，换成账号票据则报 `28001003 access_token无效`——这个端点不接受账号票据。自建歌单与「抖音收藏的音乐」（type 4）正常。
- **会员曲目只有 30 秒片段**。`playable_condition` 为 `membership_type == 'svip'` 的曲目，接口只给 `preview` 段；广告畅听、30 天畅听都不被这套接口识别（PC 端同样不识别）。
- **音源直链约 63 分钟过期**，所以每次进详情页都重新解析，不做缓存。
- 免费曲目实测可完整播放，热门歌单里约 26%~41%。
- `video_model` 里的地址是 CENC 密文，插件只用 `url_player_info` 下发的明文 `PlayInfoList`，遇到带 `EncryptionMethod` / `PlayAuth` 的条目直接跳过。

## 构建

```sh
npm install
NODE_ENV=production npx rslib build   # 产出 dist/qishui.js
```

Windows 下 `npm run build` 里的 `NODE_ENV=` 前缀不被 cmd 支持，用上面这行。

## 自检

```sh
npx rstest                # 单测：链接解析、LRC/KRC 归一化、P-256 与 node:crypto 对照
node scripts/check.mjs    # 端到端：真实接口跑发现、搜索、详情、下载、歌词
```

## 安装到 Rex

`dist/qishui.js` 已提交进仓库，用 jsDelivr 分发：

```
https://cdn.jsdelivr.net/gh/Keze7/rex-qishui@main/dist/qishui.js
```

raw 备用地址（没有 CDN 缓存延迟，国内需代理）：

```
https://raw.githubusercontent.com/Keze7/rex-qishui/main/dist/qishui.js
```

推送新版本后 jsDelivr 的 `@main` 缓存 12 小时，急着生效就主动刷：

```sh
curl https://purge.jsdelivr.net/gh/Keze7/rex-qishui@main/dist/qishui.js
```

想锁死某次发布的版本，把 `@main` 换成 commit 短哈希或 tag，例如 `@v1.0.0`。

> 仓库必须保持公开，jsDelivr 不服务私有仓库。
