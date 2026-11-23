import { logout } from "./account";
import {
  handleAlbumSection,
  handleArtists,
  handleDetail,
  handleFeedPreference,
  handleLogin,
  handleMyPlaylists,
  handlePlaylistSection,
  handleRecommend,
  handleRecentPlayed,
  handleScenes,
  handleSearch,
  handleSubtitle,
} from "./service";

const widgetVersion = (() => {
  if (process.env.NODE_ENV === "production") {
    return process.env.PACKAGE_VERSION || "0.1.0";
  }
  const date = new Date();
  return `0.0.0-${[date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()]
    .map((item) => item.toString().padStart(2, "0"))
    .join("")}`;
})();

WidgetMetadata = {
  id: "qishui.music",
  title: process.env.NODE_ENV === "production" ? "汽水音乐" : "汽水音乐 (测试)",
  description:
    "汽水音乐插件，基于车机开放接口：扫码登录后可用我的歌单与最近播放，另有每日推荐、新歌、猜你喜欢、专辑、歌单、场景、歌手、搜索、播放与时间轴歌词。免费曲目可完整播放，会员曲目只有试听片段",
  author: "self-hosted",
  version: widgetVersion,
  requiredVersion: "0.0.7",
  contentType: "music",
  continuousPlay: true,
  detailCacheDuration: 5,
  modules: [
    {
      id: "myPlaylists",
      title: "我的歌单",
      subtitle: "账号里的自建与收藏歌单",
      type: "video",
      functionName: "loadMyPlaylists",
      cacheDuration: 120,
    },
    {
      id: "recentPlayed",
      title: "最近播放",
      subtitle: "汽水音乐里最近听过的歌",
      type: "video",
      functionName: "loadRecentPlayed",
      cacheDuration: 60,
    },
    {
      id: "daily",
      title: "每日推荐",
      subtitle: "每天换一批的 30 首",
      type: "video",
      functionName: "loadDaily",
      cacheDuration: 3600,
    },
    {
      id: "recommend",
      title: "推荐歌曲",
      subtitle: "电台式的连续推荐",
      type: "video",
      functionName: "loadRecommend",
      cacheDuration: 300,
    },
    {
      id: "fresh",
      title: "新歌速递",
      subtitle: "最近上架的新歌",
      type: "video",
      functionName: "loadFresh",
      cacheDuration: 3600,
    },
    {
      id: "familiar",
      title: "猜你喜欢",
      subtitle: "你熟悉的那一类",
      type: "video",
      functionName: "loadFamiliar",
      cacheDuration: 1800,
    },
    {
      id: "albums",
      title: "热门专辑",
      subtitle: "从每日推荐里挑出的整张专辑",
      type: "video",
      functionName: "loadAlbums",
      cacheDuration: 3600,
    },
    {
      id: "hot",
      title: "热歌歌单",
      subtitle: "抖音热门与流行合集",
      type: "video",
      functionName: "loadHotPlaylists",
      cacheDuration: 3600,
    },
    {
      id: "classic",
      title: "华语经典",
      subtitle: "黄金年代的百首老歌",
      type: "video",
      functionName: "loadClassicPlaylists",
      cacheDuration: 3600,
    },
    {
      id: "scenes",
      title: "场景电台",
      subtitle: "按心情与场景推荐",
      type: "video",
      functionName: "loadScenes",
      cacheDuration: 3600,
    },
    {
      id: "artists",
      title: "热门歌手",
      subtitle: "歌手主页与热门单曲",
      type: "person",
      functionName: "loadArtists",
      cacheDuration: 86400,
    },
    {
      id: "login",
      title: "登录",
      subtitle: "扫码登录汽水音乐账号",
      type: "video",
      functionName: "loadLogin",
      cacheDuration: 0,
    },
    {
      id: "loadSubtitle",
      title: "歌词",
      subtitle: "汽水音乐时间轴歌词（原文 / 译文 / 双语）",
      type: "subtitle",
      functionName: "loadSubtitle",
      cacheDuration: 3600,
    },
  ],
  search: {
    id: "search",
    title: "搜索",
    subtitle: "搜索汽水音乐的歌手、专辑、歌曲与歌单",
    functionName: "search",
    params: [
      {
        name: "kind",
        title: "结果类型",
        type: "enumeration",
        value: "all",
        enumOptions: [
          { title: "全部（歌手 / 专辑 / 歌曲 / 歌单）", value: "all" },
          { title: "歌曲", value: "songs" },
          { title: "歌手", value: "artists" },
          { title: "专辑", value: "albums" },
          { title: "歌单", value: "playlists" },
        ],
      },
    ],
  },
};

loadLogin = async () => handleLogin();

loadMyPlaylists = async () => handleMyPlaylists();

loadRecentPlayed = async () => handleRecentPlayed();

logoutAccount = async () => {
  logout();
  return { message: "已退出登录", refresh: true };
};

loadScenes = async () => handleScenes();

loadRecommend = async () => handleRecommend();

loadDaily = async () => handleFeedPreference("daily", 30);

loadFresh = async () => handleFeedPreference("fresh", 30);

loadFamiliar = async () => handleFeedPreference("familiar", 30);

loadAlbums = async () => handleAlbumSection(10);

loadArtists = async (params) => handleArtists(params);

loadHotPlaylists = async () => handlePlaylistSection("热歌", 10);

loadClassicPlaylists = async () => handlePlaylistSection("经典老歌", 10);

loadSubtitle = async (params) => handleSubtitle(params);

search = async (params) => handleSearch(params);

loadDetail = async (link) => handleDetail(link);
