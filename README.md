# 汽水音乐（rex-widget 插件）

基于汽水音乐**车机开放接口**的 Rex 音乐插件。匿名 client_token 即可读公开曲库，不需要登录、Cookie，也不需要 Argus / X-Helios 客户端签名。

## 安装地址

Rex 里添加插件，直接填这一行：

```
https://cdn.jsdelivr.net/gh/Keze7/rex-qishui@main/dist/qishui.js
```

## 能力

| 模块 | 说明 |
| --- | --- |
| 发现 | 45 个场景（深夜 EMO、通勤、运动…），点进去是 40 首推荐 |
| 搜索 | 歌曲 / 歌单 |
| 播放 | 曲目详情返回 CDN 明文直链，`audio/mp4` + `Accept-Ranges` |
| 歌词 | 时间轴歌词，原文 / 译文 / 双语三档 |

## 已知限制

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
npx rstest                # 单测：链接解析、LRC/KRC 归一化
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
