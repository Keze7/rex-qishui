import { handleDetail, handleScenes, handleSearch, handleSubtitle } from "./service";

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
    "汽水音乐插件，基于车机开放接口：场景推荐、歌单、搜索、播放与时间轴歌词。免费曲目可完整播放，会员曲目只有试听片段",
  author: "self-hosted",
  version: widgetVersion,
  requiredVersion: "0.0.7",
  contentType: "music",
  continuousPlay: true,
  detailCacheDuration: 5,
  modules: [
    {
      id: "scenes",
      title: "发现",
      subtitle: "按心情与场景推荐",
      type: "video",
      functionName: "loadScenes",
      cacheDuration: 3600,
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
    subtitle: "搜索汽水音乐的歌曲与歌单",
    functionName: "search",
    params: [
      {
        name: "kind",
        title: "结果类型",
        type: "enumeration",
        value: "songs",
        enumOptions: [
          { title: "歌曲", value: "songs" },
          { title: "歌单", value: "playlists" },
        ],
      },
    ],
  },
};

loadScenes = async () => handleScenes();

loadSubtitle = async (params) => handleSubtitle(params);

search = async (params) => handleSearch(params);

loadDetail = async (link) => handleDetail(link);
