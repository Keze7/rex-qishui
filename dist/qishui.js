function e(e, t, n, r, i, l, o) {
    try {
        var u = e[l](o), a = u.value;
    } catch (e) {
        n(e);
        return;
    }
    u.done ? t(a) : Promise.resolve(a).then(r, i);
}
function t(t) {
    return function() {
        var n = this, r = arguments;
        return new Promise(function(i, l) {
            var o = t.apply(n, r);
            function u(t) {
                e(o, i, l, u, a, "next", t);
            }
            function a(t) {
                e(o, i, l, u, a, "throw", t);
            }
            u(void 0);
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
let i = "/api/luna/v1/platform", l = "LunaOpenSDK/1.0.10", o = "1270651532221750165", u = {
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
function a(e) {
    if (!e) return "";
    if ("string" == typeof e) return e;
    let t = Array.isArray(e.urls) && e.urls.length ? String(e.urls[0]) : "", n = e.uri ? String(e.uri) : "";
    if (!t || !n) return "";
    let r = t + n, i = e.template_prefix ? String(e.template_prefix) : "";
    return i ? `${r}~${i}-origin.image` : r;
}
function c(e = {}) {
    let t = r(n({}, u), {
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
            var u, a, f;
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
            }), _ = Number(null != (u = null != (a = m.err_no) ? a : null == (f = m.data) ? void 0 : f.error_code) ? u : 0);
            if (28001008 !== _ || 0 !== p) {
                if (_) throw Error(`汽水接口错误 ${_}${m.err_msg ? `：${m.err_msg}` : ""}`);
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
        }), o = Array.isArray(l.result_groups) ? l.result_groups : [], u = null != (t = o.find((t)=>t.id === `${e}s`)) ? t : o[0];
        return (Array.isArray(null == u ? void 0 : u.data) ? u.data : []).map((t)=>{
            var n;
            return null == (n = t.entity) ? void 0 : n[e];
        }).filter(Boolean).slice(0, r);
    })();
}
function y(e) {
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
function m(e) {
    var t, n, r, i, l, o, u, c, s, d;
    let f = null != (t = e.base_info) ? t : {}, p = null != (n = e.related_info) ? n : {}, y = Array.isArray(p.artist_links) ? p.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [];
    return {
        id: String(null != (r = null != (i = f.id) ? i : e.id) ? r : ""),
        name: String(null != (l = f.name) ? l : "未知歌曲"),
        artists: y.length ? y : [
            "未知歌手"
        ],
        album: (null == (c = p.album_link) ? void 0 : c.name) ? String(p.album_link.name) : void 0,
        cover: a(null == (s = e.display_info) ? void 0 : s.cover_url),
        durationMs: Number(null != (o = f.duration_ms) ? o : 0),
        vip: "1 == 1" !== String(null != (u = null == (d = e.commerce_info) ? void 0 : d.playable_condition) ? u : "1 == 1")
    };
}
function _(e, t, n, r, i, l, o) {
    try {
        var u = e[l](o), a = u.value;
    } catch (e) {
        n(e);
        return;
    }
    u.done ? t(a) : Promise.resolve(a).then(r, i);
}
function v(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                _(l, r, i, o, u, "next", e);
            }
            function u(e) {
                _(l, r, i, o, u, "throw", e);
            }
            o(void 0);
        });
    };
}
function h(e) {
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
function g(e, t) {
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
let b = "qishui:";
function S(e, t = "") {
    return `${b}playlist:${e}:${t}`;
}
function O(e) {
    return `${b}scene:${e}`;
}
function w(e) {
    let t = String(null != e ? e : "").trim();
    if (!t.startsWith(b)) return null;
    let [n, r, i = ""] = t.slice(b.length).split(":");
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
function $(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    let t = Math.round(e / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function k(e) {
    var t;
    let n = [
        e.artists.join(" / "),
        e.album,
        $(e.durationMs)
    ].filter(Boolean).join(" · ");
    return h({
        id: e.id,
        type: "url",
        mediaType: "song",
        link: (t = e.id, `${b}track:${t}`),
        title: e.name
    }, n ? {
        subtitle: n
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {});
}
let P = new Map(), j = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, D = /^\[(\d+),(\d+)\](.*)$/, M = /<\d+,\d+(?:,\d+)?>/g;
function x(e) {
    let t = [];
    for (let n of String(null != e ? e : "").split(/\r?\n/)){
        let e = n.trim();
        if (!e) continue;
        let r = j.exec(e);
        if (r) {
            let [, e, n, i = "0", l] = r, o = 60000 * Number(e) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            t.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = D.exec(e);
        i && t.push({
            ms: Number(i[1]),
            text: i[3].replace(M, "").trim()
        });
    }
    return t;
}
function A(e) {
    let t = Math.floor(e / 60000), n = Math.floor(e % 60000 / 1000), r = Math.floor(e % 1000 / 10);
    return `[${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function N(e) {
    return x(e).map((e)=>`${A(e.ms)}${e.text}`).join("\n");
}
let q = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function E(e) {
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
            n += q[l >> 18 & 63] + q[l >> 12 & 63], n += e + 1 < t.length ? q[l >> 6 & 63] : "=", n += e + 2 < t.length ? q[63 & l] : "=";
        }
        return n;
    }(e)}`;
}
function B(e, t, n, r, i, l, o) {
    try {
        var u = e[l](o), a = u.value;
    } catch (e) {
        n(e);
        return;
    }
    u.done ? t(a) : Promise.resolve(a).then(r, i);
}
function T(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                B(l, r, i, o, u, "next", e);
            }
            function u(e) {
                B(l, r, i, o, u, "throw", e);
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
            id: "scenes",
            title: "发现",
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
}, loadScenes = ()=>T(function*() {
        return v(function*() {
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
                                cover: a(i.url_info)
                            }
                        ];
                    });
                });
            })()).map((e)=>(P.set(e.id, e.name), h({
                    id: `scene-${e.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: O(e.id),
                    title: e.name
                }, e.group ? {
                    subtitle: e.group
                } : {}, e.cover ? {
                    posterPath: e.cover,
                    coverUrl: e.cover
                } : {})));
        })();
    })(), loadSubtitle = (e)=>T(function*() {
        return v(function*() {
            var t, n, r, i, l;
            let o, u = e.link ? w(e.link) : null, a = (null == u ? void 0 : u.kind) === "track" ? u.id : /^\d{1,30}$/.test(String(null != (t = e.id) ? t : "")) ? String(e.id) : "";
            if (!a) return [];
            let { original: c, translation: s } = {
                original: String(null != (n = null == (o = null == (i = (yield y(a)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((e)=>{
                    var t;
                    return String(null != (t = null == e ? void 0 : e.content) ? t : "");
                }).find((e)=>e.trim().length > 0)
            }, d = [];
            if (c && s) {
                let e, t = (e = new Map(x(s).map((e)=>[
                        e.ms,
                        e.text
                    ])), x(c).map((t)=>{
                    let n = e.get(t.ms), r = n && n !== t.text ? `${t.text} / ${n}` : t.text;
                    return `${A(t.ms)}${r}`;
                }).join("\n"));
                t && d.push({
                    id: `qishui:lyric:${a}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: E(t)
                });
            }
            let f = c ? N(c) : "", p = s ? N(s) : "";
            return f && d.push({
                id: `qishui:lyric:${a}:original`,
                title: "原文歌词",
                lang: "und",
                url: E(f)
            }), p && d.push({
                id: `qishui:lyric:${a}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: E(p)
            }), d;
        })();
    })(), search = (e)=>T(function*() {
        return v(function*() {
            var n;
            let r = String(null != (n = e.keyword) ? n : "").trim();
            return r ? "playlists" === e.kind ? (yield function(e, n = 20) {
                return t(function*() {
                    return p("playlist", e, n);
                })();
            }(r, 30)).map((e)=>{
                var t, n, r, i, l, o;
                let u = null != (t = e.base_info) ? t : {}, c = a(null == (o = e.display_info) ? void 0 : o.url_cover), s = Number(null != (n = e.resource_cnt) ? n : 0);
                return h({
                    id: `playlist-${u.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: S(String(u.id), String(null != (r = u.owner_id) ? r : "")),
                    title: String(null != (i = null != (l = u.title) ? l : u.name) ? i : "歌单")
                }, s ? {
                    subtitle: `${s} 首`
                } : {}, c ? {
                    posterPath: c,
                    coverUrl: c
                } : {});
            }) : (yield function(e, n = 30) {
                return t(function*() {
                    return p("track", e, n);
                })();
            }(r, 40)).map((e)=>k(m(e))) : [];
        })();
    })(), loadDetail = (e)=>T(function*() {
        return v(function*() {
            var n, r, i, o;
            let u = w(e);
            if (!u) throw Error(`无法识别的链接：${e}`);
            return "track" === u.kind ? (n = u.id, v(function*() {
                let e = yield y(n), r = m(e), i = yield t(function*() {
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
                        var n, r, i, o, u, a, c, d;
                        let p = null == (u = t[e]) ? void 0 : u.video_model_info;
                        if (!(null == p ? void 0 : p.url_player_info)) continue;
                        let y = yield s(String(p.url_player_info), {
                            headers: {
                                "user-agent": l
                            }
                        }), m = (null != (n = null != (r = null != (i = null == (c = y.Result) || null == (a = c.Data) ? void 0 : a.PlayInfoList) ? i : null == (d = y.data) ? void 0 : d.PlayInfoList) ? r : y.PlayInfoList) ? n : []).filter((e)=>(null == e ? void 0 : e.MainPlayUrl) && !e.PlayAuth && !e.EncryptionMethod).sort((e, t)=>{
                            var n, r;
                            return Number(null != (n = t.Bitrate) ? n : 0) - Number(null != (r = e.Bitrate) ? r : 0);
                        });
                        if (!m.length) continue;
                        let _ = m[0], v = Number(null != (o = _.Duration) ? o : 0);
                        return {
                            url: String(_.MainPlayUrl),
                            preview: f || v > 0 && v < 25,
                            duration: v
                        };
                    }
                    throw Error("这首歌只有加密音源，暂不支持播放");
                })(), o = [
                    $(r.durationMs),
                    i.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return g(h({}, k(r), o ? {
                    description: o
                } : {}), {
                    videoUrl: i.url
                });
            })()) : "scene" === u.kind ? (r = u.id, v(function*() {
                var e;
                let n = (yield function(e, n = 30) {
                    return t(function*() {
                        let t = yield f("/feed/song-tab/", {
                            played_media: [],
                            is_first_request: !0,
                            with_client_cache: !1,
                            is_did_first_request: !1,
                            count: n,
                            feed_preference: {
                                scene_mode_id: Number(e),
                                scene_mode_select_time: Date.now(),
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
                }(r, 40)).map((e)=>k(m(e)));
                return {
                    id: `scene-${r}`,
                    type: "url",
                    mediaType: "playlist",
                    link: O(r),
                    title: null != (e = P.get(r)) ? e : "场景推荐",
                    description: `${n.length} 首`,
                    tracks: n
                };
            })()) : (i = u.id, o = u.ownerId, v(function*() {
                var e, n, r, l, u, c;
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
                }(i, o), p = d.map((e)=>k(m(e))), y = null != (e = null == s ? void 0 : s.base_info) ? e : {}, _ = a(null == s || null == (l = s.display_info) ? void 0 : l.url_cover), v = [
                    null == s || null == (c = s.relation_info) || null == (u = c.owner) ? void 0 : u.name,
                    p.length ? `${p.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return g(h({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: S(i, o),
                    title: String(null != (n = null != (r = y.title) ? r : y.name) ? n : "歌单")
                }, v ? {
                    subtitle: v
                } : {}, y.desc ? {
                    description: String(y.desc).slice(0, 200)
                } : {}, _ ? {
                    posterPath: _,
                    coverUrl: _
                } : {}), {
                    tracks: p
                });
            })());
        })();
    })();
