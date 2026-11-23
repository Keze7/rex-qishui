/// <reference types='@rexnow/libs/env' />
declare namespace QishuiMusic {
    interface GlobalParams {
    }
}

//#region scenes
/** Params of 发现 */
interface LoadScenesParams extends QishuiMusic.GlobalParams, VideoListParams {
}

/** Return Type of 发现 */
interface LoadScenesReturnType extends Array<VideoItem> {
}

/**
 * 发现
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
