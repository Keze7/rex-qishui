/// <reference types='@rexnow/libs/env' />
declare namespace QishuiMusic {
    interface GlobalParams {
    }
}

//#region recommend
/** Params of 推荐歌曲 */
interface LoadRecommendParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 推荐歌曲 */
interface LoadRecommendReturnType extends Array<VideoItem> {
}

/**
 * 推荐歌曲
 * @description 按你的口味挑的 30 首
 */
declare let loadRecommend: (params: LoadRecommendParams) => LoadRecommendReturnType | Promise<LoadRecommendReturnType>;
//#endregion recommend

//#region hot
/** Params of 热歌歌单 */
interface LoadHotPlaylistsParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 热歌歌单 */
interface LoadHotPlaylistsReturnType extends Array<VideoItem> {
}

/**
 * 热歌歌单
 * @description 抖音热门与流行合集
 */
declare let loadHotPlaylists: (params: LoadHotPlaylistsParams) => LoadHotPlaylistsReturnType | Promise<LoadHotPlaylistsReturnType>;
//#endregion hot

//#region classic
/** Params of 华语经典 */
interface LoadClassicPlaylistsParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 华语经典 */
interface LoadClassicPlaylistsReturnType extends Array<VideoItem> {
}

/**
 * 华语经典
 * @description 黄金年代的百首老歌
 */
declare let loadClassicPlaylists: (params: LoadClassicPlaylistsParams) => LoadClassicPlaylistsReturnType | Promise<LoadClassicPlaylistsReturnType>;
//#endregion classic

//#region scenes
/** Params of 场景电台 */
interface LoadScenesParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 场景电台 */
interface LoadScenesReturnType extends Array<VideoItem> {
}

/**
 * 场景电台
 * @description 按心情与场景推荐
 */
declare let loadScenes: (params: LoadScenesParams) => LoadScenesReturnType | Promise<LoadScenesReturnType>;
//#endregion scenes

//#region loadSubtitle
/** Params of 歌词 */
interface LoadSubtitleParams extends QishuiMusic.GlobalParams, BaseParams {
}

/** Return Type of 歌词 */
interface LoadSubtitleReturnType extends Array<SubtitleItem> {
}

/**
 * 歌词
 * @description 汽水音乐时间轴歌词（原文 / 译文 / 双语）
 */
declare let loadSubtitle: (params: LoadSubtitleParams) => LoadSubtitleReturnType | Promise<LoadSubtitleReturnType>;
//#endregion loadSubtitle

//#region search
/** Params of 搜索 */
interface SearchParams extends QishuiMusic.GlobalParams {
    /** 搜索关键词（由 Rex 注入） */
    keyword: string;
    /**
     * 结果类型
     * @default 'songs'
     */
    kind: 'songs' | 'playlists';
}

/** Return Type of 搜索 */
interface SearchReturnType extends Array<VideoItem> {
}

/**
 * 搜索
 * @description 搜索汽水音乐的歌曲与歌单
 */
declare let search: (params: SearchParams) => SearchReturnType | Promise<SearchReturnType>;
//#endregion search
