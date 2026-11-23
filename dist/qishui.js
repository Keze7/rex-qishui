function e(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function t(t) {
    return function() {
        var n = this, r = arguments;
        return new Promise(function(i, l) {
            var o = t.apply(n, r);
            function a(t) {
                e(o, i, l, a, u, "next", t);
            }
            function u(t) {
                e(o, i, l, a, u, "throw", t);
            }
            a(void 0);
        });
    };
}
function n(e) {
    for(var t = 1; t < arguments.length; t++){
        var n = null != arguments[t] ? arguments[t] : {}, r = Object.keys(n);
        "function" == typeof Object.getOwnPropertySymbols && (r = r.concat(Object.getOwnPropertySymbols(n).filter(function(e) {
            return Object.getOwnPropertyDescriptor(n, e).enumerable;
        }))), r.forEach(function(t) {
            var r;
            r = n[t], t in e ? Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = r;
        });
    }
    return e;
}
function r(e, t) {
    return t = null != t ? t : {}, Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : (function(e) {
        var t = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            t.push.apply(t, n);
        }
        return t;
    })(Object(t)).forEach(function(n) {
        Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
    }), e;
}
let i = "/api/luna/v1/platform", l = "LunaOpenSDK/1.0.10", o = "1270651532221750165", a = {
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
    ac: "wifi"
};
function u(e) {
    if (!e) return "";
    if ("string" == typeof e) return e;
    let t = Array.isArray(e.urls) && e.urls.length ? String(e.urls[0]) : "", n = e.uri ? String(e.uri) : "";
    if (!t || !n) return "";
    let r = t + n, i = e.template_prefix ? String(e.template_prefix) : "";
    return i ? `${r}~${i}-origin.image` : r;
}
function c(e = {}) {
    let t = r(n({}, a), {
        device_id: o,
        did: o,
        iid: o,
        vehicle_id: `qishui-${o}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    });
    for(let n in e)Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    let i = [];
    for(let e in t)Object.prototype.hasOwnProperty.call(t, e) && i.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`);
    return i.join("&");
}
function s(e) {
    return t(function*(e, t = {}) {
        var i, l;
        let o = yield Widget.http.request(r(n({
            url: e,
            method: null != (i = t.method) ? i : "GET",
            headers: null != (l = t.headers) ? l : {}
        }, void 0 !== t.data ? {
            data: t.data
        } : {}), {
            timeout: 20
        }));
        return "string" == typeof o.data ? JSON.parse(o.data) : o.data;
    }).apply(this, arguments);
}
let d = null;
function f(e) {
    return t(function*(e, o = {}) {
        for(let p = 0;; p++){
            var a, u, f;
            let y = yield function(e = !1) {
                return t(function*() {
                    if (!e && d && Date.now() - d.at < 1800000) return d.value;
                    let t = yield s(`https://open.qishui.com${i}/client/token/get/?${c({
                        trigger_type: "cold_start"
                    })}`, {
                        headers: {
                            "user-agent": l
                        }
                    });
                    if ("string" != typeof t.client_token || !t.client_token) throw Error(`汽水客户端令牌获取失败${t.err_msg ? `：${t.err_msg}` : ""}`);
                    return (d = {
                        value: t.client_token,
                        at: Date.now()
                    }).value;
                })();
            }(p > 0), m = yield s(`https://open.douyin.com${i}${e}?${c()}`, {
                method: "POST",
                headers: {
                    "user-agent": l,
                    "content-type": "application/json",
                    "access-token": y
                },
                data: JSON.stringify(r(n({}, o), {
                    common_params: {}
                }))
            }), v = Number(null != (a = null != (u = m.err_no) ? u : null == (f = m.data) ? void 0 : f.error_code) ? a : 0);
            if (28001008 !== v || 0 !== p) {
                if (v) throw Error(`汽水接口错误 ${v}${m.err_msg ? `：${m.err_msg}` : ""}`);
                if (!m.data || "object" != typeof m.data) throw Error("汽水接口返回缺少 data");
                return m.data;
            }
        }
    }).apply(this, arguments);
}
function p(e, n, r) {
    return t(function*() {
        var t;
        let i = `${Date.now()}-${Math.random().toString(16).slice(2)}`, l = yield f("/search/", {
            q: n,
            cursor: "0",
            search_id: i,
            from_search_id: i,
            search_method: "input",
            search_type: e,
            search_scene: "normal",
            scene_name: "search",
            ab_param: "",
            last_viewed_media: {}
        }), o = Array.isArray(l.result_groups) ? l.result_groups : [], a = null != (t = o.find((t)=>t.id === `${e}s`)) ? t : o[0];
        return (Array.isArray(null == a ? void 0 : a.data) ? a.data : []).map((t)=>{
            var n;
            return null == (n = t.entity) ? void 0 : n[e];
        }).filter(Boolean).slice(0, r);
    })();
}
function y(e, n = 30) {
    return t(function*() {
        let t = yield f("/feed/song-tab/", {
            played_media: [],
            is_first_request: !0,
            with_client_cache: !1,
            is_did_first_request: !1,
            count: n,
            feed_preference: {
                scene_mode_id: null == e ? null : Number(e),
                scene_mode_select_time: null == e ? null : Date.now(),
                preference_mode: null,
                total_request_count: 1,
                preference_mode_request_count: 1,
                current_mode_request_count: 1
            }
        });
        return (Array.isArray(t.items) ? t.items : []).filter((e)=>!e.type || "track" === e.type).map((e)=>{
            var t, n, r, i, l;
            return null != (t = null != (n = null == (r = e.entity) ? void 0 : r.track) ? n : null == (l = e.entity) || null == (i = l.media) ? void 0 : i.track_entity) ? t : e;
        }).filter(Boolean);
    })();
}
function m(e) {
    return t(function*() {
        var t;
        let n = yield f("/media/mget/", {
            media_list: [
                {
                    id: e,
                    type: "track"
                }
            ],
            card_context: {}
        }), r = Array.isArray(n.media_list) ? n.media_list : [], i = null != (t = r.find((t)=>{
            var n, r, i;
            return String(null != (n = t.media_id) ? n : null == (i = t.track_entity) || null == (r = i.base_info) ? void 0 : r.id) === String(e);
        })) ? t : r[0];
        if (!(null == i ? void 0 : i.track_entity)) throw Error("汽水没有返回这首歌的信息");
        return i.track_entity;
    })();
}
function v(e) {
    var t, n, r, i, l, o, a, c, s, d;
    let f = null != (t = e.base_info) ? t : {}, p = null != (n = e.related_info) ? n : {}, y = Array.isArray(p.artist_links) ? p.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [];
    return {
        id: String(null != (r = null != (i = f.id) ? i : e.id) ? r : ""),
        name: String(null != (l = f.name) ? l : "未知歌曲"),
        artists: y.length ? y : [
            "未知歌手"
        ],
        album: (null == (c = p.album_link) ? void 0 : c.name) ? String(p.album_link.name) : void 0,
        cover: u(null == (s = e.display_info) ? void 0 : s.cover_url),
        durationMs: Number(null != (o = f.duration_ms) ? o : 0),
        vip: "1 == 1" !== String(null != (a = null == (d = e.commerce_info) ? void 0 : d.playable_condition) ? a : "1 == 1")
    };
}
function _(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function h(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                _(l, r, i, o, a, "next", e);
            }
            function a(e) {
                _(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function g(e) {
    for(var t = 1; t < arguments.length; t++){
        var n = null != arguments[t] ? arguments[t] : {}, r = Object.keys(n);
        "function" == typeof Object.getOwnPropertySymbols && (r = r.concat(Object.getOwnPropertySymbols(n).filter(function(e) {
            return Object.getOwnPropertyDescriptor(n, e).enumerable;
        }))), r.forEach(function(t) {
            var r;
            r = n[t], t in e ? Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = r;
        });
    }
    return e;
}
function b(e, t) {
    return t = null != t ? t : {}, Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : (function(e) {
        var t = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            t.push.apply(t, n);
        }
        return t;
    })(Object(t)).forEach(function(n) {
        Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
    }), e;
}
let S = "qishui:";
function O(e, t = "") {
    return `${S}playlist:${e}:${t}`;
}
function w(e) {
    return `${S}scene:${e}`;
}
function $(e) {
    let t = String(null != e ? e : "").trim();
    if (!t.startsWith(S)) return null;
    let [n, r, i = ""] = t.slice(S.length).split(":");
    return r && /^\d{1,30}$/.test(r) ? "track" === n || "scene" === n ? {
        kind: n,
        id: r,
        ownerId: ""
    } : "playlist" === n ? {
        kind: n,
        id: r,
        ownerId: i
    } : null : null;
}
function k(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    let t = Math.round(e / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function P(e) {
    var t;
    let n = [
        e.artists.join(" / "),
        e.album,
        k(e.durationMs)
    ].filter(Boolean).join(" · ");
    return g({
        id: e.id,
        type: "url",
        mediaType: "song",
        link: (t = e.id, `${S}track:${t}`),
        title: e.name
    }, n ? {
        subtitle: n
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {});
}
let j = new Map();
function D(e, n = 10) {
    return h(function*() {
        return (yield function(e, n = 20) {
            return t(function*() {
                return p("playlist", e, n);
            })();
        }(e, n)).map((e)=>{
            var t, n, r, i, l;
            let o = null != (t = e.base_info) ? t : {}, a = u(null == (l = e.display_info) ? void 0 : l.url_cover);
            return g({
                id: `playlist-${o.id}`,
                type: "url",
                mediaType: "playlist",
                link: O(String(o.id), String(null != (n = o.owner_id) ? n : "")),
                title: String(null != (r = null != (i = o.title) ? i : o.name) ? r : "歌单")
            }, a ? {
                posterPath: a,
                coverUrl: a
            } : {});
        });
    })();
}
let N = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, M = /^\[(\d+),(\d+)\](.*)$/, x = /<\d+,\d+(?:,\d+)?>/g;
function A(e) {
    let t = [];
    for (let n of String(null != e ? e : "").split(/\r?\n/)){
        let e = n.trim();
        if (!e) continue;
        let r = N.exec(e);
        if (r) {
            let [, e, n, i = "0", l] = r, o = 60000 * Number(e) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            t.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = M.exec(e);
        i && t.push({
            ms: Number(i[1]),
            text: i[3].replace(x, "").trim()
        });
    }
    return t;
}
function q(e) {
    let t = Math.floor(e / 60000), n = Math.floor(e % 60000 / 1000), r = Math.floor(e % 1000 / 10);
    return `[${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function E(e) {
    return A(e).map((e)=>`${q(e.ms)}${e.text}`).join("\n");
}
let B = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function C(e) {
    return `data:text/plain;charset=utf-8;base64,${function(e) {
        let t = function(e) {
            let t = [];
            for(let n = 0; n < e.length; n += 1){
                let r = e.charCodeAt(n);
                if (r >= 0xd800 && r <= 0xdbff && n + 1 < e.length) {
                    let t = e.charCodeAt(n + 1);
                    t >= 0xdc00 && t <= 0xdfff && (r = 0x10000 + (r - 0xd800 << 10) + (t - 0xdc00), n += 1);
                }
                r < 0x80 ? t.push(r) : r < 0x800 ? t.push(0xc0 | r >> 6, 0x80 | 63 & r) : r < 0x10000 ? t.push(0xe0 | r >> 12, 0x80 | r >> 6 & 63, 0x80 | 63 & r) : t.push(0xf0 | r >> 18, 0x80 | r >> 12 & 63, 0x80 | r >> 6 & 63, 0x80 | 63 & r);
            }
            return t;
        }(e), n = "";
        for(let e = 0; e < t.length; e += 3){
            var r, i;
            let l = t[e] << 16 | (null != (r = t[e + 1]) ? r : 0) << 8 | (null != (i = t[e + 2]) ? i : 0);
            n += B[l >> 18 & 63] + B[l >> 12 & 63], n += e + 1 < t.length ? B[l >> 6 & 63] : "=", n += e + 2 < t.length ? B[63 & l] : "=";
        }
        return n;
    }(e)}`;
}
function T(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function U(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                T(l, r, i, o, a, "next", e);
            }
            function a(e) {
                T(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
WidgetMetadata = {
    id: "qishui.music",
    title: "汽水音乐",
    description: "汽水音乐插件，基于车机开放接口：场景推荐、歌单、搜索、播放与时间轴歌词。免费曲目可完整播放，会员曲目只有试听片段",
    author: "self-hosted",
    version: "0.1.0",
    requiredVersion: "0.0.7",
    contentType: "music",
    continuousPlay: !0,
    detailCacheDuration: 5,
    modules: [
        {
            id: "recommend",
            title: "推荐歌曲",
            subtitle: "按你的口味挑的 30 首",
            type: "video",
            functionName: "loadRecommend",
            cacheDuration: 300
        },
        {
            id: "hot",
            title: "热歌歌单",
            subtitle: "抖音热门与流行合集",
            type: "video",
            functionName: "loadHotPlaylists",
            cacheDuration: 3600
        },
        {
            id: "classic",
            title: "华语经典",
            subtitle: "黄金年代的百首老歌",
            type: "video",
            functionName: "loadClassicPlaylists",
            cacheDuration: 3600
        },
        {
            id: "scenes",
            title: "场景电台",
            subtitle: "按心情与场景推荐",
            type: "video",
            functionName: "loadScenes",
            cacheDuration: 3600
        },
        {
            id: "loadSubtitle",
            title: "歌词",
            subtitle: "汽水音乐时间轴歌词（原文 / 译文 / 双语）",
            type: "subtitle",
            functionName: "loadSubtitle",
            cacheDuration: 3600
        }
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
                    {
                        title: "歌曲",
                        value: "songs"
                    },
                    {
                        title: "歌单",
                        value: "playlists"
                    }
                ]
            }
        ]
    }
}, loadScenes = ()=>U(function*() {
        return h(function*() {
            return (yield t(function*() {
                let e = yield f("/feed/mode/", {});
                return (Array.isArray(e.feed_mode_block) ? e.feed_mode_block : []).flatMap((e)=>{
                    var t;
                    return (null != (t = e.feed_mode) ? t : []).flatMap((t)=>{
                        var n, r;
                        let i = null == (n = t.entity) ? void 0 : n.feed_mode, l = null == i || null == (r = i.scene_mode) ? void 0 : r.scene_mode_id;
                        return null == l ? [] : [
                            {
                                id: String(l),
                                name: String(i.text || "推荐"),
                                group: String(e.title || ""),
                                cover: u(i.url_info)
                            }
                        ];
                    });
                });
            })()).map((e)=>(j.set(e.id, e.name), g({
                    id: `scene-${e.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: w(e.id),
                    title: e.name
                }, e.group ? {
                    subtitle: e.group
                } : {}, e.cover ? {
                    posterPath: e.cover,
                    coverUrl: e.cover
                } : {})));
        })();
    })(), loadRecommend = ()=>U(function*() {
        return h(function*() {
            return (yield y(null, 30)).map((e)=>P(v(e)));
        })();
    })(), loadHotPlaylists = ()=>U(function*() {
        return D("热歌", 10);
    })(), loadClassicPlaylists = ()=>U(function*() {
        return D("经典老歌", 10);
    })(), loadSubtitle = (e)=>U(function*() {
        return h(function*() {
            var t, n, r, i, l;
            let o, a = e.link ? $(e.link) : null, u = (null == a ? void 0 : a.kind) === "track" ? a.id : /^\d{1,30}$/.test(String(null != (t = e.id) ? t : "")) ? String(e.id) : "";
            if (!u) return [];
            let { original: c, translation: s } = {
                original: String(null != (n = null == (o = null == (i = (yield m(u)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((e)=>{
                    var t;
                    return String(null != (t = null == e ? void 0 : e.content) ? t : "");
                }).find((e)=>e.trim().length > 0)
            }, d = [];
            if (c && s) {
                let e, t = (e = new Map(A(s).map((e)=>[
                        e.ms,
                        e.text
                    ])), A(c).map((t)=>{
                    let n = e.get(t.ms), r = n && n !== t.text ? `${t.text} / ${n}` : t.text;
                    return `${q(t.ms)}${r}`;
                }).join("\n"));
                t && d.push({
                    id: `qishui:lyric:${u}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: C(t)
                });
            }
            let f = c ? E(c) : "", p = s ? E(s) : "";
            return f && d.push({
                id: `qishui:lyric:${u}:original`,
                title: "原文歌词",
                lang: "und",
                url: C(f)
            }), p && d.push({
                id: `qishui:lyric:${u}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: C(p)
            }), d;
        })();
    })(), search = (e)=>U(function*() {
        return h(function*() {
            var n;
            let r = String(null != (n = e.keyword) ? n : "").trim();
            return r ? "playlists" === e.kind ? D(r, 30) : (yield function(e, n = 30) {
                return t(function*() {
                    return p("track", e, n);
                })();
            }(r, 40)).map((e)=>P(v(e))) : [];
        })();
    })(), loadDetail = (e)=>U(function*() {
        return h(function*() {
            var n, r, i, o;
            let a = $(e);
            if (!a) throw Error(`无法识别的链接：${e}`);
            return "track" === a.kind ? (n = a.id, h(function*() {
                let e = yield m(n), r = v(e), i = yield t(function*() {
                    let t = e.player_info;
                    if (!t) throw Error("这首歌没有可播放音源");
                    for (let [e, f] of [
                        [
                            "full",
                            !1
                        ],
                        [
                            "preview",
                            !0
                        ]
                    ]){
                        var n, r, i, o, a, u, c, d;
                        let p = null == (a = t[e]) ? void 0 : a.video_model_info;
                        if (!(null == p ? void 0 : p.url_player_info)) continue;
                        let y = yield s(String(p.url_player_info), {
                            headers: {
                                "user-agent": l
                            }
                        }), m = (null != (n = null != (r = null != (i = null == (c = y.Result) || null == (u = c.Data) ? void 0 : u.PlayInfoList) ? i : null == (d = y.data) ? void 0 : d.PlayInfoList) ? r : y.PlayInfoList) ? n : []).filter((e)=>(null == e ? void 0 : e.MainPlayUrl) && !e.PlayAuth && !e.EncryptionMethod).sort((e, t)=>{
                            var n, r;
                            return Number(null != (n = t.Bitrate) ? n : 0) - Number(null != (r = e.Bitrate) ? r : 0);
                        });
                        if (!m.length) continue;
                        let v = m[0], _ = Number(null != (o = v.Duration) ? o : 0);
                        return {
                            url: String(v.MainPlayUrl),
                            preview: f || _ > 0 && _ < 25,
                            duration: _
                        };
                    }
                    throw Error("这首歌只有加密音源，暂不支持播放");
                })(), o = [
                    k(r.durationMs),
                    i.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return b(g({}, P(r), o ? {
                    description: o
                } : {}), {
                    videoUrl: i.url
                });
            })()) : "scene" === a.kind ? (r = a.id, h(function*() {
                var e;
                let t = (yield y(r, 40)).map((e)=>P(v(e)));
                return {
                    id: `scene-${r}`,
                    type: "url",
                    mediaType: "playlist",
                    link: w(r),
                    title: null != (e = j.get(r)) ? e : "场景推荐",
                    description: `${t.length} 首`,
                    tracks: t
                };
            })()) : (i = a.id, o = a.ownerId, h(function*() {
                var e, n, r, l, a, c;
                let { playlist: s, entities: d } = yield function(e, n = "", r = 100) {
                    return t(function*() {
                        let t = yield f("/playlist/detail/", {
                            playlist_id: e,
                            owner_id: n,
                            count: r,
                            cursor: "0",
                            type: null
                        }), i = Array.isArray(t.media_entities) ? t.media_entities : [];
                        return {
                            playlist: t.playlist,
                            entities: i.map((e)=>{
                                var t, n, r, i, l;
                                return null != (t = null != (n = null == (r = e.entity) ? void 0 : r.track) ? n : null == (l = e.entity) || null == (i = l.media) ? void 0 : i.track_entity) ? t : e;
                            }).filter(Boolean)
                        };
                    })();
                }(i, o), p = d.map((e)=>P(v(e))), y = null != (e = null == s ? void 0 : s.base_info) ? e : {}, m = u(null == s || null == (l = s.display_info) ? void 0 : l.url_cover), _ = [
                    null == s || null == (c = s.relation_info) || null == (a = c.owner) ? void 0 : a.name,
                    p.length ? `${p.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return b(g({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: O(i, o),
                    title: String(null != (n = null != (r = y.title) ? r : y.name) ? n : "歌单")
                }, _ ? {
                    subtitle: _
                } : {}, y.desc ? {
                    description: String(y.desc).slice(0, 200)
                } : {}, m ? {
                    posterPath: m,
                    coverUrl: m
                } : {}), {
                    tracks: p
                });
            })());
        })();
    })();
