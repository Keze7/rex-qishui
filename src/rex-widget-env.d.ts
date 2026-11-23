/// <reference types='@rexnow/libs/env' />
declare namespace QishuiMusic {
    interface GlobalParams {
    }
}

//#region myPlaylists
/** Params of 我的歌单 */
interface LoadMyPlaylistsParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 我的歌单 */
interface LoadMyPlaylistsReturnType extends Array<VideoItem> {
}

/**
 * 我的歌单
 * @description 账号里的自建与收藏歌单
 */
declare let loadMyPlaylists: (params: LoadMyPlaylistsParams) => LoadMyPlaylistsReturnType | Promise<LoadMyPlaylistsReturnType>;
//#endregion myPlaylists

//#region recentPlayed
/** Params of 最近播放 */
interface LoadRecentPlayedParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 最近播放 */
interface LoadRecentPlayedReturnType extends Array<VideoItem> {
}

/**
 * 最近播放
 * @description 汽水音乐里最近听过的歌
 */
declare let loadRecentPlayed: (params: LoadRecentPlayedParams) => LoadRecentPlayedReturnType | Promise<LoadRecentPlayedReturnType>;
//#endregion recentPlayed

//#region daily
/** Params of 每日推荐 */
interface LoadDailyParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 每日推荐 */
interface LoadDailyReturnType extends Array<VideoItem> {
}

/**
 * 每日推荐
 * @description 每天换一批的 30 首
 */
declare let loadDaily: (params: LoadDailyParams) => LoadDailyReturnType | Promise<LoadDailyReturnType>;
//#endregion daily

//#region recommend
/** Params of 推荐歌曲 */
interface LoadRecommendParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 推荐歌曲 */
interface LoadRecommendReturnType extends Array<VideoItem> {
}

/**
 * 推荐歌曲
 * @description 电台式的连续推荐
 */
declare let loadRecommend: (params: LoadRecommendParams) => LoadRecommendReturnType | Promise<LoadRecommendReturnType>;
//#endregion recommend

//#region fresh
/** Params of 新歌速递 */
interface LoadFreshParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 新歌速递 */
interface LoadFreshReturnType extends Array<VideoItem> {
}

/**
 * 新歌速递
 * @description 最近上架的新歌
 */
declare let loadFresh: (params: LoadFreshParams) => LoadFreshReturnType | Promise<LoadFreshReturnType>;
//#endregion fresh

//#region familiar
/** Params of 猜你喜欢 */
interface LoadFamiliarParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 猜你喜欢 */
interface LoadFamiliarReturnType extends Array<VideoItem> {
}

/**
 * 猜你喜欢
 * @description 你熟悉的那一类
 */
declare let loadFamiliar: (params: LoadFamiliarParams) => LoadFamiliarReturnType | Promise<LoadFamiliarReturnType>;
//#endregion familiar

//#region albums
/** Params of 热门专辑 */
interface LoadAlbumsParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 热门专辑 */
interface LoadAlbumsReturnType extends Array<VideoItem> {
}

/**
 * 热门专辑
 * @description 从每日推荐里挑出的整张专辑
 */
declare let loadAlbums: (params: LoadAlbumsParams) => LoadAlbumsReturnType | Promise<LoadAlbumsReturnType>;
//#endregion albums

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

//#region artists
/** Params of 热门歌手 */
interface LoadArtistsParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 热门歌手 */
interface LoadArtistsReturnType extends Array<VideoItem> {
}

/**
 * 热门歌手
 * @description 歌手主页与热门单曲
 */
declare let loadArtists: (params: LoadArtistsParams) => LoadArtistsReturnType | Promise<LoadArtistsReturnType>;
//#endregion artists

//#region login
/** Params of 登录 */
interface LoadLoginParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 登录 */
interface LoadLoginReturnType extends Array<VideoItem> {
}

/**
 * 登录
 * @description 扫码登录汽水音乐账号
 */
declare let loadLogin: (params: LoadLoginParams) => LoadLoginReturnType | Promise<LoadLoginReturnType>;
//#endregion login

//#region diag
/** Params of 诊断 */
interface LoadDiagParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 诊断 */
interface LoadDiagReturnType extends Array<VideoItem> {
}

/**
 * 诊断
 * @description 歌单读不到时用：把接口真实返回摊开
 */
declare let loadDiag: (params: LoadDiagParams) => LoadDiagReturnType | Promise<LoadDiagReturnType>;
//#endregion diag

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
     * @default 'all'
     */
    kind: 'all' | 'songs' | 'artists' | 'albums' | 'playlists';
}

/** Return Type of 搜索 */
interface SearchReturnType extends Array<VideoItem> {
}

/**
 * 搜索
 * @description 搜索汽水音乐的歌手、专辑、歌曲与歌单
 */
declare let search: (params: SearchParams) => SearchReturnType | Promise<SearchReturnType>;
//#endregion search
