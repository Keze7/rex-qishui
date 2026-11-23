function t(t, e, n, r, i, l, o) {
    try {
        var a = t[l](o), u = a.value;
    } catch (t) {
        n(t);
        return;
    }
    a.done ? e(u) : Promise.resolve(u).then(r, i);
}
function e(e) {
    return function() {
        var n = this, r = arguments;
        return new Promise(function(i, l) {
            var o = e.apply(n, r);
            function a(e) {
                t(o, i, l, a, u, "next", e);
            }
            function u(e) {
                t(o, i, l, a, u, "throw", e);
            }
            a(void 0);
        });
    };
}
function n(t) {
    for(var e = 1; e < arguments.length; e++){
        var n = null != arguments[e] ? arguments[e] : {}, r = Object.keys(n);
        "function" == typeof Object.getOwnPropertySymbols && (r = r.concat(Object.getOwnPropertySymbols(n).filter(function(t) {
            return Object.getOwnPropertyDescriptor(n, t).enumerable;
        }))), r.forEach(function(e) {
            var r;
            r = n[e], e in t ? Object.defineProperty(t, e, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = r;
        });
    }
    return t;
}
function r(t, e) {
    return e = null != e ? e : {}, Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(e)) : (function(t) {
        var e = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(t);
            e.push.apply(e, n);
        }
        return e;
    })(Object(e)).forEach(function(n) {
        Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(e, n));
    }), t;
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
function u(t) {
    if (!t) return "";
    if ("string" == typeof t) return t;
    let e = Array.isArray(t.urls) && t.urls.length ? String(t.urls[0]) : "", n = t.uri ? String(t.uri) : "";
    if (!e || !n) return "";
    let r = e + n, i = t.template_prefix ? String(t.template_prefix) : "";
    return i ? `${r}~${i}-origin.image` : r;
}
function c(t = {}) {
    let e = r(n({}, a), {
        device_id: o,
        did: o,
        iid: o,
        vehicle_id: `qishui-${o}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    });
    for(let n in t)Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    let i = [];
    for(let t in e)Object.prototype.hasOwnProperty.call(e, t) && i.push(`${encodeURIComponent(t)}=${encodeURIComponent(String(e[t]))}`);
    return i.join("&");
}
function s(t) {
    return e(function*(t, e = {}) {
        var i, l;
        let o = yield Widget.http.request(r(n({
            url: t,
            method: null != (i = e.method) ? i : "GET",
            headers: null != (l = e.headers) ? l : {}
        }, void 0 !== e.data ? {
            data: e.data
        } : {}), {
            timeout: 20
        }));
        return "string" == typeof o.data ? JSON.parse(o.data) : o.data;
    }).apply(this, arguments);
}
let d = null;
function f(t) {
    return e(function*(t, o = {}) {
        for(let p = 0;; p++){
            var a, u, f;
            let y = yield function(t = !1) {
                return e(function*() {
                    if (!t && d && Date.now() - d.at < 1800000) return d.value;
                    let e = yield s(`https://open.qishui.com${i}/client/token/get/?${c({
                        trigger_type: "cold_start"
                    })}`, {
                        headers: {
                            "user-agent": l
                        }
                    });
                    if ("string" != typeof e.client_token || !e.client_token) throw Error(`汽水客户端令牌获取失败${e.err_msg ? `：${e.err_msg}` : ""}`);
                    return (d = {
                        value: e.client_token,
                        at: Date.now()
                    }).value;
                })();
            }(p > 0), m = yield s(`https://open.douyin.com${i}${t}?${c()}`, {
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
function p(t, n, r) {
    return e(function*() {
        var e;
        let i = `${Date.now()}-${Math.random().toString(16).slice(2)}`, l = yield f("/search/", {
            q: n,
            cursor: "0",
            search_id: i,
            from_search_id: i,
            search_method: "input",
            search_type: t,
            search_scene: "normal",
            scene_name: "search",
            ab_param: "",
            last_viewed_media: {}
        }), o = Array.isArray(l.result_groups) ? l.result_groups : [], a = null != (e = o.find((e)=>e.id === `${t}s`)) ? e : o[0];
        return (Array.isArray(null == a ? void 0 : a.data) ? a.data : []).map((e)=>{
            var n;
            return null == (n = e.entity) ? void 0 : n[t];
        }).filter(Boolean).slice(0, r);
    })();
}
function y(t, n = 30) {
    return e(function*() {
        return p("track", t, n);
    })();
}
function m(t, n = 20) {
    return e(function*() {
        return p("playlist", t, n);
    })();
}
function v(t, n = 20) {
    return e(function*() {
        return p("artist", t, n);
    })();
}
function _(t) {
    var e, n, r, i, l, o, a, c;
    let s = null != (e = null != (n = null == t ? void 0 : t.base_info) ? n : t) ? e : {};
    return {
        id: String(null != (r = s.id) ? r : ""),
        name: String(null != (i = null != (l = null != (o = s.full_display_name) ? o : s.simple_display_name) ? l : s.name) ? i : "未知歌手"),
        avatar: u(s.url_avatar),
        trackCount: Number(null != (a = s.count_tracks) ? a : 0),
        albumCount: Number(null != (c = s.count_albums) ? c : 0),
        intro: s.intro ? String(s.intro) : void 0
    };
}
function h(t, n = 30) {
    return e(function*() {
        let e = yield f("/feed/song-tab/", {
            played_media: [],
            is_first_request: !0,
            with_client_cache: !1,
            is_did_first_request: !1,
            count: n,
            feed_preference: {
                scene_mode_id: null == t ? null : Number(t),
                scene_mode_select_time: null == t ? null : Date.now(),
                preference_mode: null,
                total_request_count: 1,
                preference_mode_request_count: 1,
                current_mode_request_count: 1
            }
        });
        return (Array.isArray(e.items) ? e.items : []).filter((t)=>!t.type || "track" === t.type).map((t)=>{
            var e, n, r, i, l;
            return null != (e = null != (n = null == (r = t.entity) ? void 0 : r.track) ? n : null == (l = t.entity) || null == (i = l.media) ? void 0 : i.track_entity) ? e : t;
        }).filter(Boolean);
    })();
}
function g(t) {
    return e(function*() {
        var e;
        let n = yield f("/media/mget/", {
            media_list: [
                {
                    id: t,
                    type: "track"
                }
            ],
            card_context: {}
        }), r = Array.isArray(n.media_list) ? n.media_list : [], i = null != (e = r.find((e)=>{
            var n, r, i;
            return String(null != (n = e.media_id) ? n : null == (i = e.track_entity) || null == (r = i.base_info) ? void 0 : r.id) === String(t);
        })) ? e : r[0];
        if (!(null == i ? void 0 : i.track_entity)) throw Error("汽水没有返回这首歌的信息");
        return i.track_entity;
    })();
}
function b(t) {
    var e, n, r, i, l, o, a, c, s, d;
    let f = null != (e = t.base_info) ? e : {}, p = null != (n = t.related_info) ? n : {}, y = Array.isArray(p.artist_links) ? p.artist_links.map((t)=>String(t.name || "")).filter(Boolean) : [];
    return {
        id: String(null != (r = null != (i = f.id) ? i : t.id) ? r : ""),
        name: String(null != (l = f.name) ? l : "未知歌曲"),
        artists: y.length ? y : [
            "未知歌手"
        ],
        album: (null == (c = p.album_link) ? void 0 : c.name) ? String(p.album_link.name) : void 0,
        cover: u(null == (s = t.display_info) ? void 0 : s.cover_url),
        durationMs: Number(null != (o = f.duration_ms) ? o : 0),
        vip: "1 == 1" !== String(null != (a = null == (d = t.commerce_info) ? void 0 : d.playable_condition) ? a : "1 == 1")
    };
}
function S(t, e, n, r, i, l, o) {
    try {
        var a = t[l](o), u = a.value;
    } catch (t) {
        n(t);
        return;
    }
    a.done ? e(u) : Promise.resolve(u).then(r, i);
}
function k(t) {
    return function() {
        var e = this, n = arguments;
        return new Promise(function(r, i) {
            var l = t.apply(e, n);
            function o(t) {
                S(l, r, i, o, a, "next", t);
            }
            function a(t) {
                S(l, r, i, o, a, "throw", t);
            }
            o(void 0);
        });
    };
}
function $(t) {
    for(var e = 1; e < arguments.length; e++){
        var n = null != arguments[e] ? arguments[e] : {}, r = Object.keys(n);
        "function" == typeof Object.getOwnPropertySymbols && (r = r.concat(Object.getOwnPropertySymbols(n).filter(function(t) {
            return Object.getOwnPropertyDescriptor(n, t).enumerable;
        }))), r.forEach(function(e) {
            var r;
            r = n[e], e in t ? Object.defineProperty(t, e, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = r;
        });
    }
    return t;
}
function w(t, e) {
    return e = null != e ? e : {}, Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(e)) : (function(t) {
        var e = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(t);
            e.push.apply(e, n);
        }
        return e;
    })(Object(e)).forEach(function(n) {
        Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(e, n));
    }), t;
}
let O = "qishui:";
function P(t, e = "") {
    return `${O}playlist:${t}:${e}`;
}
function j(t) {
    return `${O}scene:${t}`;
}
function D(t) {
    let e = String(null != t ? t : "").trim();
    if (!e.startsWith(O)) return null;
    let [n, r, i = ""] = e.slice(O.length).split(":");
    return r && /^\d{1,30}$/.test(r) ? "track" === n || "scene" === n || "artist" === n ? {
        kind: n,
        id: r,
        ownerId: ""
    } : "playlist" === n ? {
        kind: n,
        id: r,
        ownerId: i
    } : null : null;
}
function N(t) {
    if (!Number.isFinite(t) || t <= 0) return "";
    let e = Math.round(t / 1000);
    return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`;
}
function A(t) {
    var e;
    let n = [
        t.artists.join(" / "),
        t.album,
        N(t.durationMs)
    ].filter(Boolean).join(" · ");
    return $({
        id: t.id,
        type: "url",
        mediaType: "song",
        link: (e = t.id, `${O}track:${e}`),
        title: t.name
    }, n ? {
        subtitle: n
    } : {}, t.cover ? {
        posterPath: t.cover,
        coverUrl: t.cover
    } : {});
}
let M = new Map();
function x(t) {
    var e;
    let n = [
        t.trackCount ? `${t.trackCount} 首` : "",
        t.albumCount ? `${t.albumCount} 张专辑` : ""
    ].filter(Boolean).join(" · ");
    return $({
        id: t.id,
        type: "person",
        mediaType: "person",
        link: (e = t.id, `${O}artist:${e}`),
        title: t.name
    }, n ? {
        subtitle: n
    } : {}, t.avatar ? {
        avatar: t.avatar,
        posterPath: t.avatar,
        coverUrl: t.avatar
    } : {}, t.intro ? {
        description: t.intro.slice(0, 120)
    } : {});
}
function C(t, e = 10) {
    return k(function*() {
        return (yield m(t, e)).map((t)=>{
            var e, n, r, i, l;
            let o = null != (e = t.base_info) ? e : {}, a = u(null == (l = t.display_info) ? void 0 : l.url_cover);
            return $({
                id: `playlist-${o.id}`,
                type: "url",
                mediaType: "playlist",
                link: P(String(o.id), String(null != (n = o.owner_id) ? n : "")),
                title: String(null != (r = null != (i = o.title) ? i : o.name) ? r : "歌单")
            }, a ? {
                posterPath: a,
                coverUrl: a
            } : {});
        });
    })();
}
let q = /歌手|歌曲|热门|榜单|合集|未知|^\s*$/;
function B(t) {
    return k(function*() {
        let [n, r] = yield Promise.all([
            e(function*() {
                var e;
                return _(null != (e = (yield f("/artist/detail/", {
                    artist_id: t
                })).artist_info) ? e : {});
            })(),
            function(t, n = 50) {
                return e(function*() {
                    let e = yield f("/artist/tracks/", {
                        artist_id: t,
                        count: n,
                        cursor: "0"
                    });
                    return Array.isArray(e.tracks) ? e.tracks : [];
                })();
            }(t)
        ]), i = r.map((t)=>A(b(t))), l = [
            i.length ? `${i.length} 首热门` : "",
            n.albumCount ? `${n.albumCount} 张专辑` : ""
        ].filter(Boolean).join(" · ");
        return w($({}, x(n), l ? {
            subtitle: l
        } : {}, n.intro ? {
            description: n.intro.slice(0, 300)
        } : {}), {
            tracks: i
        });
    })();
}
let E = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, T = /^\[(\d+),(\d+)\](.*)$/, U = /<\d+,\d+(?:,\d+)?>/g;
function I(t) {
    let e = [];
    for (let n of String(null != t ? t : "").split(/\r?\n/)){
        let t = n.trim();
        if (!t) continue;
        let r = E.exec(t);
        if (r) {
            let [, t, n, i = "0", l] = r, o = 60000 * Number(t) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            e.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = T.exec(t);
        i && e.push({
            ms: Number(i[1]),
            text: i[3].replace(U, "").trim()
        });
    }
    return e;
}
function R(t) {
    let e = Math.floor(t / 60000), n = Math.floor(t % 60000 / 1000), r = Math.floor(t % 1000 / 10);
    return `[${String(e).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function L(t) {
    return I(t).map((t)=>`${R(t.ms)}${t.text}`).join("\n");
}
let W = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function Y(t) {
    return `data:text/plain;charset=utf-8;base64,${function(t) {
        let e = function(t) {
            let e = [];
            for(let n = 0; n < t.length; n += 1){
                let r = t.charCodeAt(n);
                if (r >= 0xd800 && r <= 0xdbff && n + 1 < t.length) {
                    let e = t.charCodeAt(n + 1);
                    e >= 0xdc00 && e <= 0xdfff && (r = 0x10000 + (r - 0xd800 << 10) + (e - 0xdc00), n += 1);
                }
                r < 0x80 ? e.push(r) : r < 0x800 ? e.push(0xc0 | r >> 6, 0x80 | 63 & r) : r < 0x10000 ? e.push(0xe0 | r >> 12, 0x80 | r >> 6 & 63, 0x80 | 63 & r) : e.push(0xf0 | r >> 18, 0x80 | r >> 12 & 63, 0x80 | r >> 6 & 63, 0x80 | 63 & r);
            }
            return e;
        }(t), n = "";
        for(let t = 0; t < e.length; t += 3){
            var r, i;
            let l = e[t] << 16 | (null != (r = e[t + 1]) ? r : 0) << 8 | (null != (i = e[t + 2]) ? i : 0);
            n += W[l >> 18 & 63] + W[l >> 12 & 63], n += t + 1 < e.length ? W[l >> 6 & 63] : "=", n += t + 2 < e.length ? W[63 & l] : "=";
        }
        return n;
    }(t)}`;
}
function z(t, e, n, r, i, l, o) {
    try {
        var a = t[l](o), u = a.value;
    } catch (t) {
        n(t);
        return;
    }
    a.done ? e(u) : Promise.resolve(u).then(r, i);
}
function H(t) {
    return function() {
        var e = this, n = arguments;
        return new Promise(function(r, i) {
            var l = t.apply(e, n);
            function o(t) {
                z(l, r, i, o, a, "next", t);
            }
            function a(t) {
                z(l, r, i, o, a, "throw", t);
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
            id: "artists",
            title: "热门歌手",
            subtitle: "歌手主页与热门单曲",
            type: "person",
            functionName: "loadArtists",
            cacheDuration: 86400
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
        subtitle: "搜索汽水音乐的歌手、歌曲与歌单",
        functionName: "search",
        params: [
            {
                name: "kind",
                title: "结果类型",
                type: "enumeration",
                value: "all",
                enumOptions: [
                    {
                        title: "全部（歌手 / 歌曲 / 歌单）",
                        value: "all"
                    },
                    {
                        title: "歌曲",
                        value: "songs"
                    },
                    {
                        title: "歌手",
                        value: "artists"
                    },
                    {
                        title: "歌单",
                        value: "playlists"
                    }
                ]
            }
        ]
    }
}, loadScenes = ()=>H(function*() {
        return k(function*() {
            return (yield e(function*() {
                let t = yield f("/feed/mode/", {});
                return (Array.isArray(t.feed_mode_block) ? t.feed_mode_block : []).flatMap((t)=>{
                    var e;
                    return (null != (e = t.feed_mode) ? e : []).flatMap((e)=>{
                        var n, r;
                        let i = null == (n = e.entity) ? void 0 : n.feed_mode, l = null == i || null == (r = i.scene_mode) ? void 0 : r.scene_mode_id;
                        return null == l ? [] : [
                            {
                                id: String(l),
                                name: String(i.text || "推荐"),
                                group: String(t.title || ""),
                                cover: u(i.url_info)
                            }
                        ];
                    });
                });
            })()).map((t)=>(M.set(t.id, t.name), $({
                    id: `scene-${t.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: j(t.id),
                    title: t.name
                }, t.group ? {
                    subtitle: t.group
                } : {}, t.cover ? {
                    posterPath: t.cover,
                    coverUrl: t.cover
                } : {})));
        })();
    })(), loadRecommend = ()=>H(function*() {
        return k(function*() {
            return (yield h(null, 30)).map((t)=>A(b(t)));
        })();
    })(), loadArtists = (t)=>H(function*() {
        return function() {
            return k(function*(t = {}) {
                var e, n;
                let r = String(null != (e = null != (n = t.peopleId) ? n : t.id) ? e : "").trim();
                return /^\d{1,30}$/.test(r) ? [
                    (yield B(r))
                ] : function(t = 18) {
                    return k(function*() {
                        let e = yield Promise.all([
                            "华语",
                            "粤语",
                            "欧美"
                        ].map((t)=>v(t, 10).catch(()=>[]))), n = new Set(), r = [];
                        for (let i of e.flat()){
                            let e = _(i);
                            if (!(!e.id || n.has(e.id) || q.test(e.name)) && !(e.name.length > 20) && !(e.trackCount < 1) && (n.add(e.id), r.push(x(e)), r.length >= t)) break;
                        }
                        return r;
                    })();
                }();
            }).apply(this, arguments);
        }(t);
    })(), loadHotPlaylists = ()=>H(function*() {
        return C("热歌", 10);
    })(), loadClassicPlaylists = ()=>H(function*() {
        return C("经典老歌", 10);
    })(), loadSubtitle = (t)=>H(function*() {
        return k(function*() {
            var e, n, r, i, l;
            let o, a = t.link ? D(t.link) : null, u = (null == a ? void 0 : a.kind) === "track" ? a.id : /^\d{1,30}$/.test(String(null != (e = t.id) ? e : "")) ? String(t.id) : "";
            if (!u) return [];
            let { original: c, translation: s } = {
                original: String(null != (n = null == (o = null == (i = (yield g(u)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((t)=>{
                    var e;
                    return String(null != (e = null == t ? void 0 : t.content) ? e : "");
                }).find((t)=>t.trim().length > 0)
            }, d = [];
            if (c && s) {
                let t, e = (t = new Map(I(s).map((t)=>[
                        t.ms,
                        t.text
                    ])), I(c).map((e)=>{
                    let n = t.get(e.ms), r = n && n !== e.text ? `${e.text} / ${n}` : e.text;
                    return `${R(e.ms)}${r}`;
                }).join("\n"));
                e && d.push({
                    id: `qishui:lyric:${u}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: Y(e)
                });
            }
            let f = c ? L(c) : "", p = s ? L(s) : "";
            return f && d.push({
                id: `qishui:lyric:${u}:original`,
                title: "原文歌词",
                lang: "und",
                url: Y(f)
            }), p && d.push({
                id: `qishui:lyric:${u}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: Y(p)
            }), d;
        })();
    })(), search = (t)=>H(function*() {
        return k(function*() {
            var e, n;
            let r = String(null != (e = t.keyword) ? e : "").trim();
            if (!r) return [];
            let i = String(null != (n = t.kind) ? n : "all");
            if ("artists" === i) return (yield v(r, 20)).map((t)=>x(_(t)));
            if ("playlists" === i) return C(r, 30);
            if ("songs" === i || "tracks" === i) return (yield y(r, 40)).map((t)=>A(b(t)));
            let [l, o, a] = yield Promise.all([
                v(r, 12).catch(()=>[]),
                y(r, 20).catch(()=>[]),
                m(r, 8).catch(()=>[])
            ]);
            return [
                ...l.map((t)=>x(_(t))),
                ...o.map((t)=>A(b(t))),
                ...a.map((t)=>{
                    var e, n, r, i, l;
                    let o = null != (e = t.base_info) ? e : {}, a = u(null == (l = t.display_info) ? void 0 : l.url_cover);
                    return $({
                        id: `playlist-${o.id}`,
                        type: "url",
                        mediaType: "playlist",
                        link: P(String(o.id), String(null != (n = o.owner_id) ? n : "")),
                        title: String(null != (r = null != (i = o.title) ? i : o.name) ? r : "歌单")
                    }, a ? {
                        posterPath: a,
                        coverUrl: a
                    } : {});
                })
            ];
        })();
    })(), loadDetail = (t)=>H(function*() {
        return k(function*() {
            var n, r, i, o;
            let a = D(t);
            if (!a) throw Error(`无法识别的链接：${t}`);
            return "track" === a.kind ? (n = a.id, k(function*() {
                let t = yield g(n), r = b(t), i = yield e(function*() {
                    let e = t.player_info;
                    if (!e) throw Error("这首歌没有可播放音源");
                    for (let [t, f] of [
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
                        let p = null == (a = e[t]) ? void 0 : a.video_model_info;
                        if (!(null == p ? void 0 : p.url_player_info)) continue;
                        let y = yield s(String(p.url_player_info), {
                            headers: {
                                "user-agent": l
                            }
                        }), m = (null != (n = null != (r = null != (i = null == (c = y.Result) || null == (u = c.Data) ? void 0 : u.PlayInfoList) ? i : null == (d = y.data) ? void 0 : d.PlayInfoList) ? r : y.PlayInfoList) ? n : []).filter((t)=>(null == t ? void 0 : t.MainPlayUrl) && !t.PlayAuth && !t.EncryptionMethod).sort((t, e)=>{
                            var n, r;
                            return Number(null != (n = e.Bitrate) ? n : 0) - Number(null != (r = t.Bitrate) ? r : 0);
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
                    N(r.durationMs),
                    i.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return w($({}, A(r), o ? {
                    description: o
                } : {}), {
                    videoUrl: i.url
                });
            })()) : "scene" === a.kind ? (r = a.id, k(function*() {
                var t;
                let e = (yield h(r, 40)).map((t)=>A(b(t)));
                return {
                    id: `scene-${r}`,
                    type: "url",
                    mediaType: "playlist",
                    link: j(r),
                    title: null != (t = M.get(r)) ? t : "场景推荐",
                    description: `${e.length} 首`,
                    tracks: e
                };
            })()) : "artist" === a.kind ? B(a.id) : (i = a.id, o = a.ownerId, k(function*() {
                var t, n, r, l, a, c;
                let { playlist: s, entities: d } = yield function(t, n = "", r = 100) {
                    return e(function*() {
                        let e = yield f("/playlist/detail/", {
                            playlist_id: t,
                            owner_id: n,
                            count: r,
                            cursor: "0",
                            type: null
                        }), i = Array.isArray(e.media_entities) ? e.media_entities : [];
                        return {
                            playlist: e.playlist,
                            entities: i.map((t)=>{
                                var e, n, r, i, l;
                                return null != (e = null != (n = null == (r = t.entity) ? void 0 : r.track) ? n : null == (l = t.entity) || null == (i = l.media) ? void 0 : i.track_entity) ? e : t;
                            }).filter(Boolean)
                        };
                    })();
                }(i, o), p = d.map((t)=>A(b(t))), y = null != (t = null == s ? void 0 : s.base_info) ? t : {}, m = u(null == s || null == (l = s.display_info) ? void 0 : l.url_cover), v = [
                    null == s || null == (c = s.relation_info) || null == (a = c.owner) ? void 0 : a.name,
                    p.length ? `${p.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return w($({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: P(i, o),
                    title: String(null != (n = null != (r = y.title) ? r : y.name) ? n : "歌单")
                }, v ? {
                    subtitle: v
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
