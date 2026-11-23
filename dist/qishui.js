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
function f(e) {
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
function s(e) {
    return t(function*(e, o = {}) {
        for(let p = 0;; p++){
            var a, u, s;
            let y = yield function(e = !1) {
                return t(function*() {
                    if (!e && d && Date.now() - d.at < 1800000) return d.value;
                    let t = yield f(`https://open.qishui.com${i}/client/token/get/?${c({
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
            }(p > 0), m = yield f(`https://open.douyin.com${i}${e}?${c()}`, {
                method: "POST",
                headers: {
                    "user-agent": l,
                    "content-type": "application/json",
                    "access-token": y
                },
                data: JSON.stringify(r(n({}, o), {
                    common_params: {}
                }))
            }), h = Number(null != (a = null != (u = m.err_no) ? u : null == (s = m.data) ? void 0 : s.error_code) ? a : 0);
            if (28001008 !== h || 0 !== p) {
                if (h) throw Error(`汽水接口错误 ${h}${m.err_msg ? `：${m.err_msg}` : ""}`);
                if (!m.data || "object" != typeof m.data) throw Error("汽水接口返回缺少 data");
                return m.data;
            }
        }
    }).apply(this, arguments);
}
function p(e, n, r) {
    return t(function*() {
        var t;
        let i = `${Date.now()}-${Math.random().toString(16).slice(2)}`, l = yield s("/search/", {
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
        return p("track", e, n);
    })();
}
function m(e, n = 20) {
    return t(function*() {
        return p("playlist", e, n);
    })();
}
function h(e, n = 20) {
    return t(function*() {
        return p("artist", e, n);
    })();
}
function g(e) {
    var t, n, r, i, l, o, a, c;
    let f = null != (t = null != (n = null == e ? void 0 : e.base_info) ? n : e) ? t : {};
    return {
        id: String(null != (r = f.id) ? r : ""),
        name: String(null != (i = null != (l = null != (o = f.full_display_name) ? o : f.simple_display_name) ? l : f.name) ? i : "未知歌手"),
        avatar: u(f.url_avatar),
        trackCount: Number(null != (a = f.count_tracks) ? a : 0),
        albumCount: Number(null != (c = f.count_albums) ? c : 0),
        intro: f.intro ? String(f.intro) : void 0
    };
}
function _(e, n = 50) {
    return t(function*() {
        let t = yield s("/artist/tracks/", {
            artist_id: e,
            count: n,
            cursor: "0"
        });
        return Array.isArray(t.tracks) ? t.tracks : [];
    })();
}
function v(e) {
    var t, i, l, o, a, c, f, d, s;
    let p = null != (t = null == e ? void 0 : e.base_info) ? t : {}, y = Array.isArray(null == e || null == (f = e.related_info) ? void 0 : f.artist_links) ? e.related_info.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [], m = Number(null != (i = p.release_date) ? i : 0);
    return r(n({
        id: String(null != (l = p.id) ? l : ""),
        name: String(null != (o = p.name) ? o : "未知专辑"),
        cover: u(null != (a = null == e || null == (d = e.display) ? void 0 : d.url_cover) ? a : null == e || null == (s = e.display_info) ? void 0 : s.url_cover),
        trackCount: Number(null != (c = p.count_tracks) ? c : 0),
        artists: y
    }, m > 0 ? {
        releaseDate: new Date(1000 * m).toISOString().slice(0, 10)
    } : {}), {
        intro: p.intro ? String(p.intro) : void 0
    });
}
function b(e) {
    return t(function*() {
        var t;
        let n = yield s("/album/detail/", {
            album_id: e
        }), r = Array.isArray(n.tracks) ? n.tracks : [];
        return {
            album: null != (t = n.album_info) ? t : {},
            entities: r
        };
    })();
}
function k(e) {
    var t, n, r, i, l, o, a;
    let u = null != (t = null != (n = null != (r = e.track_entity) ? r : null == (i = e.entity) ? void 0 : i.track) ? n : null == (o = e.entity) || null == (l = o.media) ? void 0 : l.track_entity) ? t : e.base_info ? e : null;
    return (null == u || null == (a = u.base_info) ? void 0 : a.id) ? u : null;
}
function x(e, t = []) {
    let n = [], r = (e, i)=>{
        if (!n.length && e && !(i > 2)) {
            if (Array.isArray(e)) {
                let l = e.map(k).filter((e)=>!!e).filter((e)=>{
                    var n, r;
                    let i = String(null != (n = null == (r = e.base_info) ? void 0 : r.id) ? n : "");
                    return !i || !t.includes(i);
                });
                if (l.length) {
                    n = l;
                    return;
                }
                for (let t of e)r(t, i + 1);
                return;
            }
            if ("object" == typeof e) for(let t in e)r(e[t], i + 1);
        }
    };
    return r(e, 0), n;
}
function $(e) {
    return t(function*() {
        let t = [];
        for(let i = 0; i < e.length; i += 50){
            var n, r;
            let l = e.slice(i, i + 50), o = yield s("/media/mget/", {
                media_list: l.map((e)=>({
                        id: e,
                        type: "track"
                    })),
                card_context: {}
            });
            for (let e of Array.isArray(o.media_list) ? o.media_list : [])(null == (r = e.track_entity) || null == (n = r.base_info) ? void 0 : n.id) && t.push(e.track_entity);
        }
        return t;
    })();
}
function S(e, n = "", r = 200) {
    return t(function*() {
        let t, i = [], l = [], o = "0";
        for(let u = 0; u < 8; u++){
            var a;
            let u = yield s("/playlist/detail/", {
                playlist_id: e,
                owner_id: n,
                count: 100,
                cursor: o,
                type: null
            });
            for (let e of (t = null != t ? t : u.playlist, Array.isArray(u.media_entities) ? u.media_entities : [])){
                let t = k(e);
                if (t ? i.push(t) : e.media_id && l.push(String(e.media_id)), i.length >= r) break;
            }
            if (!i.length) for (let t of x(u, [
                e
            ]))i.push(t);
            let c = String(null != (a = u.next_cursor) ? a : "");
            if (!u.has_more || !c || c === o || i.length >= r) break;
            o = c;
        }
        if (!i.length && l.length) for (let e of yield $(l).catch(()=>[]))i.push(e);
        return {
            playlist: t,
            entities: i
        };
    })();
}
let w = Promise.resolve(), O = new Map();
function j(e, n = 30, r = null) {
    let i = `${null != e ? e : ""}|${null != r ? r : ""}|${n}`, l = O.get(i);
    if (l && Date.now() - l.at < 60000) return l.promise;
    let o = ()=>t(function*() {
            let t = yield s("/feed/song-tab/", {
                played_media: [],
                is_first_request: !0,
                with_client_cache: !1,
                is_did_first_request: !1,
                count: n,
                feed_preference: {
                    scene_mode_id: null == e ? null : Number(e),
                    scene_mode_select_time: null == e ? null : Date.now(),
                    preference_mode: null != r ? r : null,
                    total_request_count: 1,
                    preference_mode_request_count: 1,
                    current_mode_request_count: 1
                }
            });
            return (Array.isArray(t.items) ? t.items : []).filter((e)=>!e.type || "track" === e.type).map((e)=>{
                var t, n, r, i, l;
                return null != (t = null != (n = null == (r = e.entity) ? void 0 : r.track) ? n : null == (l = e.entity) || null == (i = l.media) ? void 0 : i.track_entity) ? t : e;
            }).filter(Boolean);
        })(), a = w.then(o, o);
    return w = a.catch(()=>void 0), O.set(i, {
        at: Date.now(),
        promise: a
    }), a.catch(()=>O.delete(i)), O.size > 20 && O.clear(), a;
}
function P(e) {
    return t(function*() {
        var t;
        let n = yield s("/media/mget/", {
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
function A(e) {
    return t(function*() {
        let t = e.player_info;
        if (!t) throw Error("这首歌没有可播放音源");
        for (let [e, s] of [
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
            let y = yield f(String(p.url_player_info), {
                headers: {
                    "user-agent": l
                }
            }), m = (null != (n = null != (r = null != (i = null == (c = y.Result) || null == (u = c.Data) ? void 0 : u.PlayInfoList) ? i : null == (d = y.data) ? void 0 : d.PlayInfoList) ? r : y.PlayInfoList) ? n : []).filter((e)=>(null == e ? void 0 : e.MainPlayUrl) && !e.PlayAuth && !e.EncryptionMethod).sort((e, t)=>{
                var n, r;
                return Number(null != (n = t.Bitrate) ? n : 0) - Number(null != (r = e.Bitrate) ? r : 0);
            });
            if (!m.length) continue;
            let h = m[0], g = Number(null != (o = h.Duration) ? o : 0);
            return {
                url: String(h.MainPlayUrl),
                preview: s || g > 0 && g < 25,
                duration: g
            };
        }
        throw Error("这首歌只有加密音源，暂不支持播放");
    })();
}
function D(e) {
    var t, n, r, i, l, o, a, c, f, d;
    let s = null != (t = e.base_info) ? t : {}, p = null != (n = e.related_info) ? n : {}, y = Array.isArray(p.artist_links) ? p.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [];
    return {
        id: String(null != (r = null != (i = s.id) ? i : e.id) ? r : ""),
        name: String(null != (l = s.name) ? l : "未知歌曲"),
        artists: y.length ? y : [
            "未知歌手"
        ],
        album: (null == (c = p.album_link) ? void 0 : c.name) ? String(p.album_link.name) : void 0,
        cover: u(null == (f = e.display_info) ? void 0 : f.cover_url),
        durationMs: Number(null != (o = s.duration_ms) ? o : 0),
        vip: "1 == 1" !== String(null != (a = null == (d = e.commerce_info) ? void 0 : d.playable_condition) ? a : "1 == 1")
    };
}
function N(e) {
    let t = [];
    for(let n = 0; n < e.length; n++){
        let r = e.charCodeAt(n);
        if (r >= 0xd800 && r <= 0xdbff && n + 1 < e.length) {
            let t = e.charCodeAt(n + 1);
            t >= 0xdc00 && t <= 0xdfff && (r = 0x10000 + (r - 0xd800 << 10) + (t - 0xdc00), n++);
        }
        r < 0x80 ? t.push(r) : r < 0x800 ? t.push(0xc0 | r >> 6, 0x80 | 63 & r) : r < 0x10000 ? t.push(0xe0 | r >> 12, 0x80 | r >> 6 & 63, 0x80 | 63 & r) : t.push(0xf0 | r >> 18, 0x80 | r >> 12 & 63, 0x80 | r >> 6 & 63, 0x80 | 63 & r);
    }
    return t;
}
let C = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function q(e) {
    let t = "";
    for(let n = 0; n < e.length; n += 3){
        let r = e[n] << 16 | (n + 1 < e.length ? e[n + 1] : 0) << 8 | (n + 2 < e.length ? e[n + 2] : 0);
        t += C[r >> 18 & 63] + C[r >> 12 & 63], t += n + 1 < e.length ? C[r >> 6 & 63] : "=", t += n + 2 < e.length ? C[63 & r] : "=";
    }
    return t;
}
function E(e, t) {
    let n = Array(t).fill(0), r = e;
    for(let e = t - 1; e >= 0; e--)n[e] = Number(255n & r), r >>= 8n;
    return n;
}
function I(e) {
    let t = 0n;
    for (let n of e)t = t << 8n | BigInt(n);
    return t;
}
let M = [
    0x428a2f98,
    0x71374491,
    0xb5c0fbcf,
    0xe9b5dba5,
    0x3956c25b,
    0x59f111f1,
    0x923f82a4,
    0xab1c5ed5,
    0xd807aa98,
    0x12835b01,
    0x243185be,
    0x550c7dc3,
    0x72be5d74,
    0x80deb1fe,
    0x9bdc06a7,
    0xc19bf174,
    0xe49b69c1,
    0xefbe4786,
    0x0fc19dc6,
    0x240ca1cc,
    0x2de92c6f,
    0x4a7484aa,
    0x5cb0a9dc,
    0x76f988da,
    0x983e5152,
    0xa831c66d,
    0xb00327c8,
    0xbf597fc7,
    0xc6e00bf3,
    0xd5a79147,
    0x06ca6351,
    0x14292967,
    0x27b70a85,
    0x2e1b2138,
    0x4d2c6dfc,
    0x53380d13,
    0x650a7354,
    0x766a0abb,
    0x81c2c92e,
    0x92722c85,
    0xa2bfe8a1,
    0xa81a664b,
    0xc24b8b70,
    0xc76c51a3,
    0xd192e819,
    0xd6990624,
    0xf40e3585,
    0x106aa070,
    0x19a4c116,
    0x1e376c08,
    0x2748774c,
    0x34b0bcb5,
    0x391c0cb3,
    0x4ed8aa4a,
    0x5b9cca4f,
    0x682e6ff3,
    0x748f82ee,
    0x78a5636f,
    0x84c87814,
    0x8cc70208,
    0x90befffa,
    0xa4506ceb,
    0xbef9a3f7,
    0xc67178f2
];
function z(e, t) {
    return e >>> t | e << 32 - t;
}
function T(e) {
    let t = [
        0x6a09e667,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19
    ], n = e.slice(), r = 8 * e.length;
    for(n.push(0x80); n.length % 64 != 56;)n.push(0);
    n.push(0, 0, 0, 0), n.push(r >>> 24 & 255, r >>> 16 & 255, r >>> 8 & 255, 255 & r);
    let i = Array(64).fill(0);
    for(let e = 0; e < n.length; e += 64){
        for(let t = 0; t < 16; t++)i[t] = (n[e + 4 * t] << 24 | n[e + 4 * t + 1] << 16 | n[e + 4 * t + 2] << 8 | n[e + 4 * t + 3]) >>> 0;
        for(let e = 16; e < 64; e++){
            let t = z(i[e - 15], 7) ^ z(i[e - 15], 18) ^ i[e - 15] >>> 3, n = z(i[e - 2], 17) ^ z(i[e - 2], 19) ^ i[e - 2] >>> 10;
            i[e] = i[e - 16] + t + i[e - 7] + n >>> 0;
        }
        let [r, l, o, a, u, c, f, d] = t;
        for(let e = 0; e < 64; e++){
            let t = d + (z(u, 6) ^ z(u, 11) ^ z(u, 25)) + (u & c ^ ~u & f) + M[e] + i[e] >>> 0, n = (z(r, 2) ^ z(r, 13) ^ z(r, 22)) + (r & l ^ r & o ^ l & o) >>> 0;
            d = f, f = c, c = u, u = a + t >>> 0, a = o, o = l, l = r, r = t + n >>> 0;
        }
        t[0] = t[0] + r >>> 0, t[1] = t[1] + l >>> 0, t[2] = t[2] + o >>> 0, t[3] = t[3] + a >>> 0, t[4] = t[4] + u >>> 0, t[5] = t[5] + c >>> 0, t[6] = t[6] + f >>> 0, t[7] = t[7] + d >>> 0;
    }
    let l = [];
    for (let e of t)l.push(e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e);
    return l;
}
function B(e, t) {
    let n = e.length > 64 ? T(e) : e.slice();
    for(; n.length < 64;)n.push(0);
    let r = n.map((e)=>0x36 ^ e).concat(t), i = n.map((e)=>0x5c ^ e).concat(T(r));
    return T(i);
}
let U = {
    x: 0n,
    y: 1n,
    z: 0n
};
function R(e, t = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn) {
    let n = e % t;
    return n < 0n ? n + t : n;
}
function W(e, t) {
    let n = R(e, t);
    if (0n === n) throw Error("inverse of zero");
    let r = t, i = 1n, l = 0n;
    for(; 0n !== r;){
        let e = n / r;
        [n, r] = [
            r,
            n - e * r
        ], [i, l] = [
            l,
            i - e * l
        ];
    }
    return R(i, t);
}
function L(e) {
    if (0n === e.z) return U;
    let t = R(e.x * e.x), n = R(e.y * e.y), r = R(n * n), i = R(2n * (R((e.x + n) * (e.x + n)) - t - r)), l = R(e.z * e.z), o = R(3n * t - 3n * R(l * l)), a = R(o * o - 2n * i), u = R(o * (i - a) - 8n * r);
    return {
        x: a,
        y: u,
        z: R(2n * e.y * e.z)
    };
}
function F(e, t) {
    let n = U, r = e, i = t;
    for(; i > 0n;)1n & i && (n = function(e, t) {
        if (0n === e.z) return t;
        if (0n === t.z) return e;
        let n = R(e.z * e.z), r = R(t.z * t.z), i = R(e.x * r), l = R(t.x * n), o = R(e.y * t.z * r), a = R(t.y * e.z * n);
        if (i === l) return o === a ? L(e) : U;
        let u = R(l - i), c = R(4n * u * u), f = R(u * c), d = R(2n * (a - o)), s = R(i * c), p = R(d * d - f - 2n * s), y = R(d * (s - p) - 2n * o * f);
        return {
            x: p,
            y,
            z: R(((e.z + t.z) * (e.z + t.z) - n - r) * u)
        };
    }(n, r)), r = L(r), i >>= 1n;
    return n;
}
function J(e) {
    if (0n === e.z) throw Error("point at infinity");
    let t = W(e.z, 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn), n = R(t * t);
    return {
        x: R(e.x * n),
        y: R(e.y * n * t)
    };
}
function Y(e, ...t) {
    var n;
    let r = [];
    for (let e of t)r.push(...e);
    return [
        e,
        ...(n = r.length) < 128 ? [
            n
        ] : n < 256 ? [
            0x81,
            n
        ] : [
            0x82,
            n >> 8 & 255,
            255 & n
        ],
        ...r
    ];
}
function G(e) {
    let t = 0;
    for(; t < e.length - 1 && 0 === e[t];)t++;
    let n = e.slice(t);
    return Y(0x02, 0x80 & n[0] ? [
        0,
        ...n
    ] : n);
}
function K(e) {
    return Y(0x06, function(e) {
        let t = [];
        for(let n = 0; n < e.length; n += 2)t.push(parseInt(e.slice(n, n + 2), 16));
        return t;
    }(e));
}
function H(e, t) {
    let n = I(T(t)), r = E(e, 32), i = E(R(n, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), 32), l = Array(32).fill(1), o = Array(32).fill(0);
    o = B(o, l.concat([
        0
    ], r, i)), l = B(o, l), o = B(o, l.concat([
        1
    ], r, i)), l = B(o, l);
    let a = 0n;
    for(; !((a = I(l = B(o, l))) > 0n) || !(a < 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);)o = B(o, l.concat([
        0
    ])), l = B(o, l);
    let u = R(J(F({
        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
        z: 1n
    }, a)).x, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), c = R(W(a, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n) * (n + u * e), 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);
    if (0n === u || 0n === c) throw Error("invalid signature");
    return Y(0x30, G(E(u, 32)), G(E(c, 32)));
}
function Q(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function V(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                Q(l, r, i, o, a, "next", e);
            }
            function a(e) {
                Q(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function Z(e) {
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
function X(e, t) {
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
let ee = "/api/luna/v1/platform", et = "aw4bbxfujo741d09", en = "1270651532221750165", er = "qishui:account", ei = "qishui:login", el = {
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
function eo(e) {
    let t = Z(X(Z({}, el), {
        device_id: en,
        did: en,
        iid: en,
        vehicle_id: `qishui-${en}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    }), e), n = [];
    for(let e in t)n.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`);
    return n.join("&");
}
function ea(e) {
    let t = [];
    for(let n in e)t.push(`${encodeURIComponent(n)}=${encodeURIComponent(e[n])}`);
    return t.join("&");
}
function eu(e) {
    return V(function*(e, t = {}) {
        var n, r, i, l;
        let o = yield Widget.http.request(X(Z({
            url: e,
            method: null != (n = t.method) ? n : "GET",
            headers: Z({
                "user-agent": "LunaOpenSDK/1.0.10"
            }, null != (r = t.headers) ? r : {})
        }, void 0 !== t.data ? {
            data: t.data
        } : {}), {
            timeout: 20
        }));
        return {
            data: "string" == typeof o.data ? ec(o.data) : o.data,
            status: null != (i = o.statusCode) ? i : 200,
            headers: null != (l = o.headers) ? l : {}
        };
    }).apply(this, arguments);
}
function ec(e) {
    try {
        return JSON.parse(e);
    } catch (t) {
        return {
            raw: e
        };
    }
}
function ef(e) {
    var t, n, r;
    let i = Number(null != (t = null != (n = null == e ? void 0 : e.err_no) ? n : null == e || null == (r = e.data) ? void 0 : r.error_code) ? t : 0);
    if (i) throw Error(`汽水账号接口错误 ${i}${(null == e ? void 0 : e.err_msg) ? `：${e.err_msg}` : ""}`);
}
function ed(e) {
    try {
        var t, n;
        return null != (t = null == (n = Widget.storage) ? void 0 : n.get(e)) ? t : null;
    } catch (e) {
        return null;
    }
}
function es(e, t) {
    try {
        var n;
        null == (n = Widget.storage) || n.set(e, t);
    } catch (e) {}
}
function ep(e) {
    try {
        var t;
        null == (t = Widget.storage) || t.remove(e);
    } catch (e) {}
}
function ey() {
    let e = ed(er);
    return e && e.ticket && e.key ? e : null;
}
function em() {
    let e = {
        aid: "1128",
        client_key: et,
        scope: "user_info,luna.openapi.platform.interaction,luna.openapi.platform.me_tab,luna.commerce.openapi_platform.vip_info",
        state: "",
        next: "",
        jump_type: "native",
        optional_scope_check: "",
        optional_scope_uncheck: "",
        customize_params: '{"source":"pc_auth","not_skip_confirm":"true"}',
        source_from: "native",
        device_platform: "android",
        app_identity: "82a0737a3f8d93d9958c8a7938bbc365",
        signature: "cf9024ea72d9c71813238b13ea107a3d"
    }, t = [];
    for(let n in e)t.push(`${encodeURIComponent(n)}=${encodeURIComponent(e[n])}`);
    return t.join("&");
}
function eh() {
    let e = ed(ei);
    return !e || !e.qr || e.expiresAt < Date.now() ? null : e;
}
function eg(e, t, n) {
    return V(function*() {
        var r, i, l;
        if (!(null == e ? void 0 : e.access_code)) throw Error("登录凭据缺失");
        let o = `https://open-client.douyin.com/passport/open/get_access_ticket/?${ea({
            aid: "1128",
            client_key: et,
            device_platform: "android"
        })}`, a = yield eu(o, {
            method: "POST",
            headers: Z({
                "content-type": "application/x-www-form-urlencoded",
                "bd-ticket-guard-version": "1"
            }, n.csr ? {
                "bd-ticket-guard-client-csr": n.csr
            } : {
                "bd-ticket-guard-client-cert": null != (r = n.cert) ? r : ""
            }),
            data: ea({
                access_code: String(e.access_code),
                open_id: String(e.open_id || e.open_uid || "")
            })
        });
        ef(a.data);
        let u = function(e, t) {
            let n = t.toLowerCase();
            for(let t in e)if (t.toLowerCase() === n) return String(e[t]);
            return "";
        }(a.headers, "bd-ticket-guard-server-data");
        if (!u) throw Error("票据缺失，请重新扫码");
        let c = ec(function(e) {
            let t = function(e) {
                let t = e.replace(/[^A-Za-z0-9+/]/g, ""), n = [];
                for(let e = 0; e < t.length; e += 4){
                    var r;
                    let i = e_.indexOf(t[e]) << 18 | e_.indexOf(null != (r = t[e + 1]) ? r : "A") << 12 | (t[e + 2] ? e_.indexOf(t[e + 2]) : 0) << 6 | (t[e + 3] ? e_.indexOf(t[e + 3]) : 0);
                    n.push(i >> 16 & 255, i >> 8 & 255, 255 & i);
                }
                let i = e.includes("=") ? e.endsWith("==") ? 2 : 1 : 0;
                return i ? n.slice(0, n.length - i) : n;
            }(e), n = "";
            for(let e = 0; e < t.length;){
                let r = t[e];
                if (r < 0x80) n += String.fromCharCode(r), e += 1;
                else if (r >= 0xc0 && r < 0xe0) n += String.fromCharCode((31 & r) << 6 | 63 & t[e + 1]), e += 2;
                else if (r >= 0xe0 && r < 0xf0) n += String.fromCharCode((15 & r) << 12 | (63 & t[e + 1]) << 6 | 63 & t[e + 2]), e += 3;
                else {
                    let i = ((7 & r) << 18 | (63 & t[e + 1]) << 12 | (63 & t[e + 2]) << 6 | 63 & t[e + 3]) - 0x10000;
                    n += String.fromCharCode(0xd800 + (i >> 10), 0xdc00 + (1023 & i)), e += 4;
                }
            }
            return n;
        }(u));
        if (!(null == c ? void 0 : c.ticket) || !(null == c ? void 0 : c.client_cert)) throw Error("票据格式异常，请重新扫码");
        let f = String(c.client_cert), d = Number(null != (i = e.expires_time) ? i : 0), s = d > 1e12 ? d : d > 1e9 ? 1000 * d : d > 0 ? Date.now() + 1000 * d : Date.now() + 21600000;
        return {
            key: t,
            ticket: String(c.ticket),
            cert: f.includes("-----BEGIN") ? q(N(f)) : f,
            tsSign: String(null != (l = c.ts_sign) ? l : ""),
            accessCode: String(e.access_code),
            openId: String(e.open_id || e.open_uid || ""),
            expiresAt: s
        };
    })();
}
let e_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ev = {
    new: "waiting",
    init: "waiting",
    scan: "scanned",
    scanned: "scanned",
    waiting_confirm: "scanned",
    confirm: "confirmed",
    confirmed: "confirmed",
    expired: "expired",
    cancel: "expired",
    canceled: "expired",
    refused: "expired",
    refuse: "expired"
};
function eb(e, t = 160) {
    let n = "string" == typeof e ? e : JSON.stringify(null != e ? e : null);
    return n.length > t ? `${n.slice(0, t)}…` : n;
}
function ek(e, t) {
    if ("string" != typeof e) return "";
    for (let n of e.split(/[?&]/)){
        let e = n.indexOf("=");
        if (e > 0 && n.slice(0, e) === t) return decodeURIComponent(n.slice(e + 1));
    }
    return "";
}
function ex(e, t) {
    let n = Math.floor(Date.now() / 1000), r = `ticket=${e.ticket}&path=${ee}${t}&timestamp=${n}`, i = q(H(BigInt(`0x${e.key}`), N(r)));
    return q(N(JSON.stringify({
        ts_sign: e.tsSign,
        req_content: "ticket,path,timestamp",
        req_sign: i,
        timestamp: n
    })));
}
let e$ = null;
function eS(e) {
    return V(function*(e, t = {}) {
        var n, r;
        let i = ey();
        if (!i) throw Error("未登录");
        let l = yield i.expiresAt - Date.now() > 3600000 ? Promise.resolve(i) : e$ || (e$ = V(function*() {
            var e;
            let t = yield eu(`https://open.qishui.com${ee}/access/code/refresh/?${eo({
                access_code: i.accessCode
            })}`);
            ef(t.data);
            let n = (null == (e = t.data) ? void 0 : e.data) || t.data, r = yield eg(n, i.key, {
                cert: i.cert
            }), l = X(Z({}, i, r), {
                accessCode: String(n.access_code || i.accessCode)
            });
            return es(er, l), l;
        })().finally(()=>{
            e$ = null;
        })), o = yield eu(`https://open.douyin.com${ee}${e}?${eo({})}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "access-token": l.ticket,
                "bd-ticket-guard-version": "1",
                "bd-ticket-guard-client-cert": l.cert,
                "bd-ticket-guard-client-data": ex(l, e)
            },
            data: JSON.stringify(X(Z({}, t), {
                common_params: {
                    user_id: l.userId
                }
            }))
        });
        return ef(o.data), null != (n = null == (r = o.data) ? void 0 : r.data) ? n : {};
    }).apply(this, arguments);
}
function ew(e = 50) {
    return V(function*() {
        let t = [], n = "";
        for(let l = 0; l < 4; l++){
            var r, i;
            let l = yield eS("/me/playlist/", {
                count: 100,
                cursor: n
            });
            for (let e of Array.isArray(l.playlists) ? l.playlists : Array.isArray(l.playlist_list) ? l.playlist_list : [])t.push(null != (r = null == e ? void 0 : e.playlist) ? r : e);
            if (!0 !== l.has_more || t.length >= e) break;
            let o = String(null != (i = l.next_cursor) ? i : "");
            if (!o || o === n) break;
            n = o;
        }
        return t.slice(0, e);
    })();
}
function eO(e, t = "", n = 200) {
    return V(function*() {
        let r, i = [], l = [], o = "", a = "0";
        for(let h = 0; h < 8 && i.length < n; h++){
            var u, c, f, d, s, p, y, m;
            let h = yield eS("/playlist/detail/", {
                playlist_id: e,
                owner_id: t,
                count: 100,
                cursor: a,
                type: null
            });
            r = null != r ? r : h.playlist;
            let g = Array.isArray(h.media_entities) ? h.media_entities : [];
            for (let e of g){
                let t = null != (c = null != (f = null != (d = e.track_entity) ? d : null == (s = e.entity) ? void 0 : s.track) ? f : null == (y = e.entity) || null == (p = y.media) ? void 0 : p.track_entity) ? c : e.base_info ? e : null;
                if ((null == t || null == (m = t.base_info) ? void 0 : m.id) ? i.push(t) : e.media_id && l.push(String(e.media_id)), i.length >= n) break;
            }
            if (!i.length) {
                for (let t of x(h, [
                    e
                ]))i.push(t);
                i.length || (o = `${Object.keys(h).join(",")}|rows=${g.length}`);
            }
            let _ = String(null != (u = h.next_cursor) ? u : "");
            if (!h.has_more || !_ || _ === a) break;
            a = _;
        }
        if (!i.length && l.length) for (let e of (o = `${o}|ids=${l.length}`, yield $(l).catch(()=>[])))i.push(e);
        return Z({
            playlist: r,
            entities: i
        }, o ? {
            shape: o
        } : {});
    })();
}
function ej(e = 50) {
    return V(function*() {
        let t = [], n = "";
        for(let l = 0; l < 8 && t.length < e; l++){
            var r, i;
            let l = yield eS("/me/recent-played/", {
                count: e,
                cursor: n,
                media_type: "track",
                scene: "me_tab"
            });
            for (let n of Array.isArray(l.media) ? l.media : []){
                let r = null == n ? void 0 : n.media;
                if ((null == r ? void 0 : r.track_entity) && (t.push(X(Z({}, r.track_entity), {
                    playedAt: Number(null != (i = n.play_start_timestamp) ? i : 0)
                })), t.length >= e)) break;
            }
            if (t.length >= e || !0 !== l.has_more) break;
            let o = String(null != (r = l.next_cursor) ? r : "");
            if (!o || o === n) break;
            n = o;
        }
        return t;
    })();
}
function eP(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function eA(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                eP(l, r, i, o, a, "next", e);
            }
            function a(e) {
                eP(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function eD(e) {
    var t;
    return String(null != (t = null == e ? void 0 : e.message) ? t : e).replace(/^汽水(账号)?接口错误\s*/, "").slice(0, 80);
}
function eN(e, t) {
    return {
        id: `diag-${e}-${t.slice(0, 8)}`,
        type: "url",
        link: "qishui:login",
        title: e,
        subtitle: t
    };
}
function eC(e, t) {
    let n = String(t || "空").replace(/\s+/g, " ").trim(), r = [];
    for(let e = 0; e < n.length; e += 52)r.push(n.slice(e, e + 52));
    return r.length || r.push("空"), r.map((t, n)=>eN(r.length > 1 ? `${e} ${n + 1}/${r.length}` : e, t));
}
function eq(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function eE(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                eq(l, r, i, o, a, "next", e);
            }
            function a(e) {
                eq(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function eI(e) {
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
function eM(e, t) {
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
let ez = "qishui:";
function eT(e) {
    return `${ez}track:${e}`;
}
function eB(e, t = "") {
    return `${ez}playlist:${e}:${t}`;
}
function eU(e) {
    return `${ez}scene:${e}`;
}
function eR(e) {
    let t = String(null != e ? e : "").trim();
    if (!t.startsWith(ez)) return null;
    let [n, r, i = ""] = t.slice(ez.length).split(":");
    return r && /^\d{1,30}$/.test(r) ? "track" === n || "scene" === n || "artist" === n || "album" === n || "login" === n ? {
        kind: n,
        id: r,
        ownerId: ""
    } : "playlist" === n ? {
        kind: n,
        id: r,
        ownerId: i
    } : null : null;
}
function eW(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    let t = Math.round(e / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function eL(e) {
    let t = [
        e.artists.join(" / "),
        e.album,
        eW(e.durationMs)
    ].filter(Boolean).join(" · "), n = Math.round(e.durationMs / 1000);
    return eI({
        id: e.id,
        type: "url",
        mediaType: "song",
        link: eT(e.id),
        title: e.name
    }, t ? {
        subtitle: t
    } : {}, n > 0 ? {
        duration: n,
        durationText: eW(e.durationMs)
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {});
}
let eF = new Map();
function eJ(e) {
    var t;
    let n = [
        e.trackCount ? `${e.trackCount} 首` : "",
        e.albumCount ? `${e.albumCount} 张专辑` : ""
    ].filter(Boolean).join(" · ");
    return eI({
        id: e.id,
        type: "person",
        mediaType: "person",
        link: (t = e.id, `${ez}artist:${t}`),
        title: e.name
    }, n ? {
        subtitle: n
    } : {}, e.avatar ? {
        avatar: e.avatar,
        posterPath: e.avatar,
        coverUrl: e.avatar
    } : {}, e.intro ? {
        description: e.intro.slice(0, 120)
    } : {});
}
function eY(e) {
    var t, n;
    let r = [
        e.artists.join(" / "),
        e.trackCount ? `${e.trackCount} 首` : "",
        null != (t = e.releaseDate) ? t : ""
    ].filter(Boolean).join(" · ");
    return eI({
        id: e.id,
        type: "url",
        mediaType: "album",
        link: (n = e.id, `${ez}album:${n}`),
        title: e.name
    }, r ? {
        subtitle: r
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {}, e.intro ? {
        description: e.intro.slice(0, 150)
    } : {});
}
function eG(e, t = 8) {
    return eE(function*() {
        let n = (function(e) {
            let t = new Set(), n = [];
            for (let l of e){
                var r, i;
                let e = null == l || null == (i = l.related_info) ? void 0 : i.album_link, o = (null == e ? void 0 : e.id) ? String(e.id) : "";
                !o || t.has(o) || (t.add(o), n.push({
                    id: o,
                    name: String(null != (r = e.name) ? r : "未知专辑")
                }));
            }
            return n;
        })(e).slice(0, t);
        return (yield Promise.all(n.map((e)=>eE(function*() {
                try {
                    let { album: t } = yield b(e.id);
                    return v(t);
                } catch (t) {
                    return {
                        id: e.id,
                        name: e.name,
                        trackCount: 0,
                        artists: []
                    };
                }
            })()))).filter((e)=>e.id).map(eY);
    })();
}
function eK(e, t = 30) {
    return eE(function*() {
        return (yield j(null, t, e)).map((e)=>eL(D(e)));
    })();
}
function eH(e) {
    return !Number.isFinite(e) || e <= 0 ? "" : e >= 100000000 ? `${(e / 100000000).toFixed(1)}亿` : e >= 10000 ? `${(e / 10000).toFixed(1)}万` : String(e);
}
function eQ(e) {
    var t, n, r, i, l, o, a, c, f;
    let d = null != (t = e.base_info) ? t : {}, s = u(null == (a = e.display_info) ? void 0 : a.url_cover), p = eH(Number(null != (n = null == (c = e.stats) ? void 0 : c.count_collected) ? n : 0)), y = "number" == typeof e.resource_cnt ? e.resource_cnt : Number(null != (r = null == (f = e.resource_cnt) ? void 0 : f.track_cnt) ? r : 0), m = [
        p ? `${p} 收藏` : "",
        y ? `${y} 首` : ""
    ].filter(Boolean).join(" · ");
    return eI({
        id: `playlist-${d.id}`,
        type: "url",
        mediaType: "playlist",
        link: eB(String(d.id), String(null != (i = d.owner_id) ? i : "")),
        title: String(null != (l = null != (o = d.title) ? o : d.name) ? l : "歌单")
    }, m ? {
        subtitle: m
    } : {}, s ? {
        posterPath: s,
        coverUrl: s
    } : {});
}
function eV(e, t = 10) {
    return eE(function*() {
        return (yield m(e, t)).map(eQ);
    })();
}
let eZ = /歌手|歌曲|热门|榜单|合集|未知|^\s*$/;
function eX(e) {
    return eE(function*() {
        let [n, r] = yield Promise.all([
            t(function*() {
                var t;
                return g(null != (t = (yield s("/artist/detail/", {
                    artist_id: e
                })).artist_info) ? t : {});
            })(),
            _(e)
        ]), i = r.map((e)=>eL(D(e))), l = [
            i.length ? `${i.length} 首热门` : "",
            n.albumCount ? `${n.albumCount} 张专辑` : ""
        ].filter(Boolean).join(" · ");
        return eM(eI({}, eJ(n), l ? {
            subtitle: l
        } : {}, n.intro ? {
            description: n.intro.slice(0, 300)
        } : {}), {
            tracks: i
        });
    })();
}
let e0 = (e)=>e.filter((t, n)=>e.indexOf(t) === n), e1 = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, e2 = /^\[(\d+),(\d+)\](.*)$/, e3 = /<\d+,\d+(?:,\d+)?>/g;
function e6(e) {
    let t = [];
    for (let n of String(null != e ? e : "").split(/\r?\n/)){
        let e = n.trim();
        if (!e) continue;
        let r = e1.exec(e);
        if (r) {
            let [, e, n, i = "0", l] = r, o = 60000 * Number(e) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            t.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = e2.exec(e);
        i && t.push({
            ms: Number(i[1]),
            text: i[3].replace(e3, "").trim()
        });
    }
    return t;
}
function e5(e) {
    let t = Math.floor(e / 60000), n = Math.floor(e % 60000 / 1000), r = Math.floor(e % 1000 / 10);
    return `[${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function e8(e) {
    return e6(e).map((e)=>`${e5(e.ms)}${e.text}`).join("\n");
}
let e4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function e7(e) {
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
            n += e4[l >> 18 & 63] + e4[l >> 12 & 63], n += e + 1 < t.length ? e4[l >> 6 & 63] : "=", n += e + 2 < t.length ? e4[63 & l] : "=";
        }
        return n;
    }(e)}`;
}
let e9 = `${ez}login:0`;
function te(e) {
    let t = [
        e.vip ? "VIP" : "普通账号",
        e.userId
    ].filter(Boolean).join(" · ");
    return eM(eI(eM(eI({
        id: "my-account",
        type: "url",
        link: e9,
        title: `已登录：${e.nickname || e.userId}`
    }, t ? {
        subtitle: t
    } : {}), {
        description: "长按这一条可以退出登录。登录态只保存在本机。"
    }), e.avatar ? {
        posterPath: e.avatar,
        coverUrl: e.avatar
    } : {}), {
        actions: [
            {
                id: "logout",
                title: "退出登录",
                functionName: "logoutAccount"
            }
        ]
    });
}
function tt(e, t, n) {
    return eI({
        id: "my-notice",
        type: "url",
        link: e9,
        title: e
    }, t ? {
        subtitle: t
    } : {}, n ? {
        description: n
    } : {});
}
function tn(e, t) {
    return {
        id: "login-qr",
        type: "url",
        link: e9,
        title: t,
        subtitle: "点开这一条看大图，用汽水音乐 App 扫码",
        description: "二维码 5 分钟内有效。登录态只保存在本机，不会上传到任何服务器。",
        posterPath: e,
        detailPoster: e,
        coverUrl: e
    };
}
function tr() {
    return tt("点这里登录汽水音乐", "登录后才会显示账号里的歌单", "汽水音乐的账号数据要扫码授权才能读，接口不给匿名访问。");
}
function ti() {
    return eE(function*() {
        let e = ey();
        if (e) return [
            te(e)
        ];
        let t = eh();
        if (t) {
            let e = yield V(function*() {
                var e, t, n, r;
                let i = eh();
                if (!i) return {
                    state: "expired"
                };
                let l = null == (t = (yield eu(`https://open.douyin.com/oauth/check_qrcode/?${em()}&token=${encodeURIComponent(i.token)}&timestamp=${Date.now()}`)).data) ? void 0 : t.data, o = String(null != (e = null == l ? void 0 : l.status) ? e : "").toLowerCase(), a = ev[o];
                return "expired" === a ? (ep(ei), {
                    state: "expired"
                }) : "waiting" === a || "scanned" === a ? {
                    state: a
                } : "confirmed" !== a ? {
                    state: "unknown",
                    debug: `未知扫码状态「${o || "空"}」 ${eb(l)}`
                } : (n = l, r = i, V(function*() {
                    var e, t, i, l, o;
                    let a = [
                        `status=${String(null == n ? void 0 : n.status)} keys=${Object.keys(null != n ? n : {}).join(",")}`
                    ];
                    try {
                        let o = null;
                        if (null == n ? void 0 : n.access_code) o = n, a.push("响应里直接带 access_code");
                        else {
                            let e = [
                                null == n ? void 0 : n.code,
                                null == n ? void 0 : n.auth_code,
                                null == n ? void 0 : n.access_token,
                                null == n ? void 0 : n.auth_token
                            ].find((e)=>"string" == typeof e && e) || ek(null == n ? void 0 : n.redirect_url, "code") || ek(null == n ? void 0 : n.redirect_url, "auth_code");
                            if (!e) return {
                                state: "unknown",
                                debug: `没拿到授权码 · ${a.join(" · ")} · ${eb(n, 200)}`
                            };
                            let t = null;
                            for (let n of [
                                "auth_code",
                                "code"
                            ])try {
                                let t = yield eu(`https://open.qishui.com${ee}/access/code/get/?${eo({
                                    [n]: String(e)
                                })}`);
                                a.push(`code/get(${n}) ${t.status} ${eb(t.data)}`), ef(t.data), o = (null == (l = t.data) ? void 0 : l.data) || t.data;
                                break;
                            } catch (e) {
                                t = e;
                            }
                            if (!o) throw t instanceof Error ? t : Error("授权码兑换失败");
                        }
                        if (!(null == o ? void 0 : o.access_code)) throw Error("access_code 缺失");
                        let u = yield eg(o, r.key, {
                            csr: r.csr
                        });
                        a.push(`ticket ok expires=${u.expiresAt}`);
                        let c = yield eu(`https://open.douyin.com${ee}/me/info/?${eo({})}`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",
                                "access-token": u.ticket,
                                "bd-ticket-guard-version": "1",
                                "bd-ticket-guard-client-cert": u.cert,
                                "bd-ticket-guard-client-data": ex(u, "/me/info/")
                            },
                            data: JSON.stringify({
                                common_params: {}
                            })
                        });
                        ef(c.data);
                        let f = null == (i = c.data) || null == (t = i.data) ? void 0 : t.my_info;
                        if (a.push(`me/info ${c.status} ${eb(c.data)}`), !(null == f ? void 0 : f.id)) throw Error("账号信息读取失败");
                        let d = X(Z({}, u), {
                            userId: String(f.id),
                            nickname: String(null != (e = f.nickname) ? e : ""),
                            avatar: String(f.medium_avatar_url || f.avatar_url || ""),
                            vip: !0 === f.is_vip
                        });
                        if (es(er, d), ep(ei), !ey()) return {
                            state: "unknown",
                            debug: "票据拿到了但本地存不进去（Widget.storage 不可写）"
                        };
                        return {
                            state: "done",
                            account: d
                        };
                    } catch (t) {
                        let e = String(null != (o = null == t ? void 0 : t.message) ? o : t);
                        return {
                            state: "unknown",
                            debug: `${e} · ${a.join(" · ")}`
                        };
                    }
                })());
            })().catch((e)=>{
                var t;
                return {
                    state: "unknown",
                    debug: String(null != (t = null == e ? void 0 : e.message) ? t : e)
                };
            });
            if ("done" === e.state && e.account) return [
                te(e.account)
            ];
            if ("unknown" === e.state) {
                var n;
                return [
                    tt("登录没走完（把这段发我）", null != (n = e.debug) ? n : "没有详情")
                ];
            }
            if ("expired" !== e.state) return [
                tn(t.qr, "scanned" === e.state ? "已扫码，请在手机上点确认" : "用汽水音乐 App 扫码登录")
            ];
        }
        return [
            tn((yield V(function*() {
                var e, t;
                let n = function() {
                    let e = [];
                    for(let t = 0; t < 16; t++)e.push(Math.floor(4294967296 * Math.random()));
                    for(let t = 0; t < 8; t++)e.push(Math.floor(Date.now() % 4294967296));
                    let t = [], n = 0;
                    for(; t.length < 48;){
                        let r = [];
                        for(let t = 0; t < 4; t++){
                            let i = e[(4 * n + t) % e.length] ^ 2654435761 * n;
                            r.push(i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, 255 & i);
                        }
                        t = t.concat(T(r.concat([
                            255 & n
                        ]))), n++;
                    }
                    return I(t) % (0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n - 1n) + 1n;
                }(), r = function(e) {
                    var t;
                    let n, r = J(F({
                        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
                        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
                        z: 1n
                    }, e)), i = (e, t)=>Y(0x31, Y(0x30, K(e), Y(0x0c, N(t)))), l = Y(0x30, i("550403", "bd-ticket-guard"), i("55040b", ""), i("55040a", "")), o = Y(0x30, Y(0x02, [
                        0
                    ]), l, (n = [
                        0x04,
                        ...E(r.x, 32),
                        ...E(r.y, 32)
                    ], Y(0x30, Y(0x30, K("2a8648ce3d0201"), K("2a8648ce3d030107")), Y(0x03, [
                        0x00,
                        ...n
                    ]))), Y(0xa0)), a = H(e, o), u = Y(0x30, o, Y(0x30, K("2a8648ce3d040302")), Y(0x03, [
                        0x00,
                        ...a
                    ])), c = `-----BEGIN CERTIFICATE REQUEST-----\n${null == (t = q(u).match(/.{1,64}/g)) ? void 0 : t.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
                    return q(N(c));
                }(n), i = null == (e = (yield eu(`https://open.douyin.com/oauth/get_qrcode/?${em()}`)).data) ? void 0 : e.data;
                if (!(null == i ? void 0 : i.token) || !(null == i ? void 0 : i.qrcode_index_url)) throw Error("二维码生成失败，请稍后重试");
                let l = Date.now() + 300000, o = yield (t = String(i.qrcode_index_url), V(function*() {
                    let e = encodeURIComponent(t), n = [
                        `https://quickchart.io/qr?text=${e}&size=600&margin=1&ecLevel=M&format=png`,
                        `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=8&ecc=M&data=${e}`
                    ];
                    for (let e of n)try {
                        var r;
                        if ((null != (r = (yield Widget.http.request({
                            url: e,
                            method: "GET",
                            decodable: !1,
                            timeout: 15
                        })).statusCode) ? r : 0) === 200) return e;
                    } catch (e) {}
                    return n[0];
                })());
                return es(ei, {
                    token: String(i.token),
                    key: n.toString(16),
                    csr: r,
                    qr: o,
                    expiresAt: l
                }), {
                    qr: o,
                    expiresAt: l
                };
            })()).qr, "用汽水音乐 App 扫码登录")
        ];
    })();
}
let tl = new Set();
function to(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function ta(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                to(l, r, i, o, a, "next", e);
            }
            function a(e) {
                to(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
let tu = "0.3.4";
WidgetMetadata = {
    id: "qishui.music",
    title: "汽水音乐",
    description: "汽水音乐插件，基于车机开放接口：扫码登录后可用我的歌单与最近播放，另有每日推荐、新歌、猜你喜欢、专辑、歌单、场景、歌手、搜索、播放与时间轴歌词。免费曲目可完整播放，会员曲目只有试听片段",
    author: "self-hosted",
    version: tu,
    iconurl: "https://cdn.jsdelivr.net/gh/Keze7/rex-qishui@main/assets/icon.png",
    requiredVersion: "0.0.7",
    contentType: "music",
    continuousPlay: !0,
    detailCacheDuration: 5,
    modules: [
        {
            id: "myPlaylists",
            title: "我的歌单",
            subtitle: "账号里的自建与收藏歌单",
            type: "video",
            functionName: "loadMyPlaylists",
            cacheDuration: 120
        },
        {
            id: "recentPlayed",
            title: "最近播放",
            subtitle: "汽水音乐里最近听过的歌",
            type: "video",
            functionName: "loadRecentPlayed",
            cacheDuration: 60
        },
        {
            id: "taste",
            title: "根据你的口味",
            subtitle: "拿最近播放里的歌手挑的 50 首",
            type: "video",
            functionName: "loadTaste",
            cacheDuration: 300
        },
        {
            id: "daily",
            title: "每日推荐",
            subtitle: "每天换一批的 30 首",
            type: "video",
            functionName: "loadDaily",
            cacheDuration: 3600
        },
        {
            id: "recommend",
            title: "推荐歌曲",
            subtitle: "电台式的连续推荐",
            type: "video",
            functionName: "loadRecommend",
            cacheDuration: 300
        },
        {
            id: "fresh",
            title: "新歌速递",
            subtitle: "最近上架的新歌",
            type: "video",
            functionName: "loadFresh",
            cacheDuration: 3600
        },
        {
            id: "familiar",
            title: "猜你喜欢",
            subtitle: "你熟悉的那一类",
            type: "video",
            functionName: "loadFamiliar",
            cacheDuration: 1800
        },
        {
            id: "albums",
            title: "热门专辑",
            subtitle: "从每日推荐里挑出的整张专辑",
            type: "video",
            functionName: "loadAlbums",
            cacheDuration: 3600
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
            id: "login",
            title: "登录",
            subtitle: "扫码登录汽水音乐账号",
            type: "video",
            functionName: "loadLogin",
            cacheDuration: 0
        },
        {
            id: "diag",
            title: "诊断",
            subtitle: "歌单读不到时用：把接口真实返回摊开",
            type: "video",
            functionName: "loadDiag",
            cacheDuration: 0
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
        subtitle: "搜索汽水音乐的歌手、专辑、歌曲与歌单",
        functionName: "search",
        params: [
            {
                name: "kind",
                title: "结果类型",
                type: "enumeration",
                value: "all",
                enumOptions: [
                    {
                        title: "全部（歌手 / 专辑 / 歌曲 / 歌单）",
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
                        title: "专辑",
                        value: "albums"
                    },
                    {
                        title: "歌单",
                        value: "playlists"
                    }
                ]
            }
        ]
    }
}, loadLogin = ()=>ta(function*() {
        return ti();
    })(), loadMyPlaylists = ()=>ta(function*() {
        return function(e = 50) {
            return eE(function*() {
                if (!ey()) return [
                    tr()
                ];
                try {
                    let t = yield ew(e);
                    if (!t.length) return [
                        tt("还没有歌单", "账号里没有自建或收藏的歌单")
                    ];
                    return yield Promise.all(t.map((e)=>eE(function*() {
                            var t, n, r, i;
                            let l = eQ(e), o = String(null != (t = null == (r = e.base_info) ? void 0 : r.id) ? t : ""), a = String(null != (n = null == (i = e.base_info) ? void 0 : i.owner_id) ? n : "");
                            return o ? (yield S(o, a, 1).then((e)=>e.entities.length > 0).catch(()=>!1)) ? (tl.delete(o), l) : (tl.add(o), eM(eI({}, l), {
                                subtitle: [
                                    l.subtitle,
                                    "车机读不到，需在汽水 App 里另存"
                                ].filter(Boolean).join(" · ")
                            })) : l;
                        })()));
                } catch (e) {
                    var t;
                    return [
                        tt("歌单读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), loadRecentPlayed = ()=>ta(function*() {
        return function(e = 50) {
            return eE(function*() {
                if (!ey()) return [
                    tr()
                ];
                try {
                    let t = yield ej(e);
                    if (!t.length) return [
                        tt("还没有播放记录", "在汽水音乐里听几首歌再回来")
                    ];
                    return t.map((e)=>eL(D(e)));
                } catch (e) {
                    var t;
                    return [
                        tt("最近播放读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), loadTaste = ()=>ta(function*() {
        return function(e = 24, t = 5) {
            return eE(function*() {
                var n, r, i, l, o;
                if (!ey()) return [
                    tr()
                ];
                try {
                    let o = yield ej(e);
                    if (!o.length) return [
                        tt("还没有播放记录", "在汽水音乐里听几首歌再回来")
                    ];
                    let a = new Set(), u = new Map();
                    for (let e of o)for (let t of (a.add(String(null != (n = null != (r = null == e || null == (i = e.base_info) ? void 0 : i.id) ? r : null == e ? void 0 : e.id) ? n : "")), function(e) {
                        var t;
                        let n = null == e || null == (t = e.related_info) ? void 0 : t.artist_links;
                        return Array.isArray(n) ? n.map((e)=>{
                            var t, n;
                            return {
                                id: String(null != (t = e.id) ? t : ""),
                                name: String(null != (n = e.name) ? n : "")
                            };
                        }).filter((e)=>e.id) : [];
                    }(e))){
                        let e = null != (l = u.get(t.id)) ? l : {
                            name: t.name,
                            hits: 0
                        };
                        e.hits += 1, u.set(t.id, e);
                    }
                    let c = [
                        ...u.entries()
                    ].sort((e, t)=>t[1].hits - e[1].hits).slice(0, t);
                    if (!c.length) return [
                        tt("没认出歌手", "最近播放里没有带歌手信息的曲目")
                    ];
                    let f = yield Promise.all(c.map(([e])=>_(e, 20).catch(()=>[]))), d = new Set(a), s = [];
                    for(let e = 0; e < 20 && s.length < 50; e++)for (let t of f){
                        let n = t[e];
                        if (!n) continue;
                        let r = D(n);
                        if (!(!r.id || d.has(r.id)) && (d.add(r.id), s.push(eL(r)), s.length >= 50)) break;
                    }
                    if (!s.length) return [
                        tt("没凑出新歌", "最近播放里的歌手暂时没有别的曲目")
                    ];
                    return s;
                } catch (e) {
                    return [
                        tt("口味推荐失败", String(null != (o = e.message) ? o : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), logoutAccount = ()=>ta(function*() {
        return ep(er), ep(ei), {
            message: "已退出登录",
            refresh: !0
        };
    })(), loadScenes = ()=>ta(function*() {
        return eE(function*() {
            return (yield t(function*() {
                let e = yield s("/feed/mode/", {});
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
            })()).map((e)=>(eF.set(e.id, e.name), eI({
                    id: `scene-${e.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: eU(e.id),
                    title: e.name
                }, e.group ? {
                    subtitle: e.group
                } : {}, e.cover ? {
                    posterPath: e.cover,
                    coverUrl: e.cover
                } : {})));
        })();
    })(), loadRecommend = ()=>ta(function*() {
        return eE(function*() {
            return (yield j(null, 30)).map((e)=>eL(D(e)));
        })();
    })(), loadDaily = ()=>ta(function*() {
        return eK("daily", 30);
    })(), loadFresh = ()=>ta(function*() {
        return eK("fresh", 30);
    })(), loadFamiliar = ()=>ta(function*() {
        return eK("familiar", 30);
    })(), loadAlbums = ()=>ta(function*() {
        return function(e = 10) {
            return eE(function*() {
                return eG((yield j(null, 30, "daily")), e);
            })();
        }(10);
    })(), loadArtists = (e)=>ta(function*() {
        return function() {
            return eE(function*(e = {}) {
                var t, n;
                let r = String(null != (t = null != (n = e.peopleId) ? n : e.id) ? t : "").trim();
                return /^\d{1,30}$/.test(r) ? [
                    (yield eX(r))
                ] : function(e = 18) {
                    return eE(function*() {
                        let t = yield Promise.all([
                            "华语",
                            "粤语",
                            "欧美"
                        ].map((e)=>h(e, 10).catch(()=>[]))), n = new Set(), r = [];
                        for (let i of t.flat()){
                            let t = g(i);
                            if (!(!t.id || n.has(t.id) || eZ.test(t.name)) && !(t.name.length > 20) && !(t.trackCount < 1) && (n.add(t.id), r.push(eJ(t)), r.length >= e)) break;
                        }
                        return r;
                    })();
                }();
            }).apply(this, arguments);
        }(e);
    })(), loadHotPlaylists = ()=>ta(function*() {
        return eV("热歌", 10);
    })(), loadClassicPlaylists = ()=>ta(function*() {
        return eV("经典老歌", 10);
    })(), loadSubtitle = (e)=>ta(function*() {
        return eE(function*() {
            var t, n, r, i, l;
            let o, a = e.link ? eR(e.link) : null, u = (null == a ? void 0 : a.kind) === "track" ? a.id : /^\d{1,30}$/.test(String(null != (t = e.id) ? t : "")) ? String(e.id) : "";
            if (!u) return [];
            let { original: c, translation: f } = {
                original: String(null != (n = null == (o = null == (i = (yield P(u)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((e)=>{
                    var t;
                    return String(null != (t = null == e ? void 0 : e.content) ? t : "");
                }).find((e)=>e.trim().length > 0)
            }, d = [];
            if (c && f) {
                let e, t = (e = new Map(e6(f).map((e)=>[
                        e.ms,
                        e.text
                    ])), e6(c).map((t)=>{
                    let n = e.get(t.ms), r = n && n !== t.text ? `${t.text} / ${n}` : t.text;
                    return `${e5(t.ms)}${r}`;
                }).join("\n"));
                t && d.push({
                    id: `qishui:lyric:${u}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: e7(t)
                });
            }
            let s = c ? e8(c) : "", p = f ? e8(f) : "";
            return s && d.push({
                id: `qishui:lyric:${u}:original`,
                title: "原文歌词",
                lang: "und",
                url: e7(s)
            }), p && d.push({
                id: `qishui:lyric:${u}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: e7(p)
            }), d;
        })();
    })(), search = (e)=>ta(function*() {
        return eE(function*() {
            var t, n;
            let r = String(null != (t = e.keyword) ? t : "").trim();
            if (!r) return [];
            let i = String(null != (n = e.kind) ? n : "all");
            if ("artists" === i) return (yield h(r, 20)).map((e)=>eJ(g(e)));
            if ("playlists" === i) return eV(r, 30);
            if ("albums" === i) return eG((yield y(r, 40)), 12);
            if ("songs" === i || "tracks" === i) return (yield y(r, 40)).map((e)=>eL(D(e)));
            let [l, o, a] = yield Promise.all([
                h(r, 12).catch(()=>[]),
                y(r, 20).catch(()=>[]),
                m(r, 8).catch(()=>[])
            ]), u = yield eG(o, 6).catch(()=>[]);
            return [
                ...l.map((e)=>eJ(g(e))),
                ...u,
                ...o.map((e)=>eL(D(e))),
                ...a.map(eQ)
            ];
        })();
    })(), loadDetail = (e)=>ta(function*() {
        return eE(function*() {
            var t, n, r, i, l;
            let o = eR(e);
            if (!o) throw Error(`无法识别的链接：${e}`);
            return "track" === o.kind ? (t = o.id, eE(function*() {
                var e, n;
                let r;
                try {
                    r = yield P(t);
                } catch (e) {
                    return tt("这首歌打不开", `id ${t}`, String(null != (n = null == e ? void 0 : e.message) ? n : e).slice(0, 100));
                }
                let i = D(r), l = null != (e = yield A(r).catch(()=>null)) ? e : yield eE(function*() {
                    var e;
                    let t = `${i.name} ${null != (e = i.artists[0]) ? e : ""}`.trim();
                    if (!t) return null;
                    let n = yield y(t, 6).catch(()=>[]), r = (e)=>String(e).replace(/[\s\-—_·.,，。!！?？()（）[\]【】]/g, "").toLowerCase();
                    for (let e of n){
                        if (r(D(e).name) !== r(i.name)) continue;
                        let t = yield A(e).catch(()=>null);
                        if (null == t ? void 0 : t.url) return t;
                    }
                    return null;
                })();
                if (!(null == l ? void 0 : l.url)) return eM(eI({}, eL(i)), {
                    link: eT(t),
                    description: "汽水没给这首歌播放地址（导入或已下架），换一首试试。"
                });
                let o = [
                    eW(i.durationMs),
                    l.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return eM(eI({}, eL(i), o ? {
                    description: o
                } : {}), {
                    videoUrl: l.url
                });
            })()) : "scene" === o.kind ? (n = o.id, eE(function*() {
                var e;
                let t = (yield j(n, 40)).map((e)=>eL(D(e)));
                return {
                    id: `scene-${n}`,
                    type: "url",
                    mediaType: "playlist",
                    link: eU(n),
                    title: null != (e = eF.get(n)) ? e : "场景推荐",
                    description: `${t.length} 首`,
                    tracks: t
                };
            })()) : "artist" === o.kind ? eX(o.id) : "album" === o.kind ? (r = o.id, eE(function*() {
                let { album: e, entities: t } = yield b(r), n = v(e);
                return eM(eI({}, eY(n), n.intro ? {
                    description: n.intro.slice(0, 300)
                } : {}), {
                    tracks: t.map((e)=>eL(D(e)))
                });
            })()) : "login" === o.kind ? (yield ti())[0] : (i = o.id, l = o.ownerId, eE(function*() {
                var e, t, n, r, o, a, c, f;
                if (tl.has(i)) return {
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: eB(i, l),
                    title: "这张歌单车机接口读不到",
                    subtitle: "在汽水 App 里把这张歌单另存为新歌单，就能读能播",
                    description: "车机开放接口（type=2 导入歌单）不返回曲目，客户端侧没有可用的替代入口。"
                };
                let d = [
                    [
                        "匿名",
                        ()=>S(i, l)
                    ]
                ];
                l && d.push([
                    "匿名·无作者",
                    ()=>S(i, "")
                ]);
                let s = ey();
                s && (d.push([
                    "账号票据",
                    ()=>eO(i, l)
                ]), s.userId && s.userId !== l && d.push([
                    "账号票据·本人",
                    ()=>eO(i, s.userId)
                ]));
                let p = [], y = null, m = (e, t)=>eE(function*() {
                        try {
                            let n = yield t();
                            if (n.entities.length) return y = n, !0;
                            let r = n.shape ? `(${n.shape})` : "";
                            p.push(`${e}:${n.playlist ? `0 首${r}` : "空结果"}`);
                        } catch (t) {
                            var n;
                            p.push(`${e}:${String(null != (n = null == t ? void 0 : t.message) ? n : t)}`);
                        }
                        return !1;
                    })();
                for (let [e, t] of d)if (yield m(e, t)) break;
                let h = [], g = "";
                if (!y) {
                    let e = yield eE(function*() {
                        var e, t, n, r, l, o, a, u, c;
                        let f = {
                            ids: [],
                            owners: [],
                            keys: [],
                            dump: "",
                            title: "",
                            count: 0
                        };
                        if (!ey()) return f;
                        let d = (yield ew(50).catch(()=>[])).find((e)=>{
                            var t, n;
                            return String(null != (t = null == (n = e.base_info) ? void 0 : n.id) ? t : "") === i;
                        });
                        if (!d) return f;
                        let s = [], p = [], y = (e, t, n)=>{
                            if (e && !(n > 3)) {
                                if ("string" == typeof e) return void (e.startsWith("_000") ? p.push(e) : /^\d{15,20}$/.test(e) && (/owner|creator|author|user|uid|sec/i.test(t) ? p.push(e) : s.push(e)));
                                if ("object" == typeof e) for(let t in e)y(e[t], t, n + 1);
                            }
                        };
                        for(let e in d)y(d[e], e, 0);
                        return {
                            ids: e0(s.filter((e)=>e !== i)).slice(0, 3),
                            owners: e0(p.filter((e)=>e !== i)).slice(0, 3),
                            keys: Object.keys(null != (e = d.base_info) ? e : {}),
                            dump: JSON.stringify(null != (t = d.base_info) ? t : d).slice(0, 420),
                            title: String(null != (n = null != (r = null == (a = d.base_info) ? void 0 : a.title) ? r : null == (u = d.base_info) ? void 0 : u.name) ? n : ""),
                            count: Number(null != (l = null != (o = null == (c = d.resource_cnt) ? void 0 : c.track_cnt) ? o : d.resource_cnt) ? l : 0) || 0
                        };
                    })();
                    h = e.keys, g = e.dump, e.title;
                    let t = 6;
                    for (let n of [
                        i,
                        ...e.ids
                    ]){
                        for (let r of e0([
                            l,
                            ...e.owners
                        ]))if (t-- <= 0 || (n !== i || r !== l) && (yield m(`匿名 ${n.slice(-6)}/${r.slice(-6) || "-"}`, ()=>S(n, r)))) break;
                        if (y) break;
                    }
                }
                if (!y) {
                    let e = (e, t)=>e.length > t ? `${e.slice(0, t)}…` : e, t = p.filter((e)=>e.startsWith("账号票据")).join(" | ") || "没登录", n = p.filter((e)=>e.startsWith("匿名")).join(" | "), r = h.length ? `${h.join(",")}${g ? ` ${g}` : ""}` : "没取到歌单行";
                    return {
                        id: i,
                        type: "url",
                        mediaType: "playlist",
                        link: eB(i, l),
                        title: e(`读不到 · ${t}`, 60),
                        subtitle: e(r, 80),
                        description: `接口反馈：${p.join(" / ").slice(0, 260)} · 匿名：${n}`
                    };
                }
                let _ = y, { playlist: v } = _, b = _.entities.filter((e)=>{
                    var t, n;
                    return String(null != (t = null == (n = e.base_info) ? void 0 : n.id) ? t : "") !== i;
                });
                if (!b.length) return {
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: eB(i, l),
                    title: "这个歌单里没有可播的曲目",
                    subtitle: "接口返回了歌单信息，但曲目列表是空的"
                };
                let k = b.map((e)=>eL(D(e))), x = null != (e = null == v ? void 0 : v.base_info) ? e : {}, $ = u(null == v || null == (o = v.display_info) ? void 0 : o.url_cover), w = null == v || null == (c = v.relation_info) || null == (a = c.owner) ? void 0 : a.name, O = eH(Number(null != (t = null == v || null == (f = v.stats) ? void 0 : f.count_collected) ? t : 0)), j = [
                    w,
                    O ? `${O} 收藏` : "",
                    k.length ? `${k.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return eM(eI({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: eB(i, l),
                    title: String(null != (n = null != (r = x.title) ? r : x.name) ? n : "歌单")
                }, j ? {
                    subtitle: j
                } : {}, x.desc ? {
                    description: String(x.desc).slice(0, 200)
                } : {}, $ ? {
                    posterPath: $,
                    coverUrl: $
                } : {}), {
                    tracks: k
                });
            })());
        })();
    })(), loadDiag = ()=>ta(function*() {
        return eA(function*() {
            var e, t, n, r, i, l, o, a, u, c, f, d, s;
            let p = [], y = ey();
            if (p.push(eN("插件版本", tu)), p.push(y ? eN("登录状态", `已登录 uid=${y.userId} ${y.nickname || ""}`) : eN("登录状态", "未登录（账号接口全部用不了）")), y) {
                try {
                    let e = (yield j(null, 5, "daily")).map((e)=>{
                        var t;
                        return null == e || null == (t = e.base_info) ? void 0 : t.name;
                    }).filter(Boolean);
                    p.push(eN("推荐·匿名", e.length ? e.slice(0, 5).join("/") : "0 首"));
                } catch (e) {
                    p.push(eN("推荐·匿名", `✗${eD(e)}`));
                }
                p.push(eN("推荐·账号票据", (yield eA(function*() {
                    try {
                        let e = yield eS("/feed/song-tab/", {
                            played_media: [],
                            is_first_request: !0,
                            with_client_cache: !1,
                            is_did_first_request: !1,
                            count: 10,
                            feed_preference: {
                                scene_mode_id: null,
                                scene_mode_select_time: null,
                                preference_mode: "daily",
                                total_request_count: 1,
                                preference_mode_request_count: 1,
                                current_mode_request_count: 1
                            }
                        }), t = Array.isArray(e.items) ? e.items : [], n = t.map((e)=>{
                            var t, n, r, i, l, o;
                            return null == (r = null != (t = null == (i = e.entity) ? void 0 : i.track) ? t : null == (o = e.entity) || null == (l = o.media) ? void 0 : l.track_entity) || null == (n = r.base_info) ? void 0 : n.name;
                        }).filter(Boolean);
                        return `票据 ok 曲${t.length}${n.length ? "：" + n.slice(0, 5).join("/") : ""}`;
                    } catch (e) {
                        return `票据 ✗${eD(e)}`;
                    }
                })())));
            }
            let m = [];
            try {
                m = yield ew(50), p.push(eN("歌单列表", `拿到 ${m.length} 个`));
            } catch (e) {
                return p.push(eN("歌单列表", `失败 ${eD(e)}`)), p;
            }
            if (!m.length) return p;
            let h = m.reduce((e, t)=>{
                let n = (e)=>{
                    var t, n, r;
                    return Number(null != (t = null != (n = null == (r = e.resource_cnt) ? void 0 : r.track_cnt) ? n : e.resource_cnt) ? t : 0) || 0;
                };
                return n(t) > n(e) ? t : e;
            }, m[0]), g = String(null != (e = null == (n = h.base_info) ? void 0 : n.id) ? e : ""), _ = String(null != (t = null == (r = h.base_info) ? void 0 : r.owner_id) ? t : "");
            for (let e of m){
                let t = String(null != (i = null == (a = e.base_info) ? void 0 : a.id) ? i : ""), n = String(null != (l = null == (u = e.base_info) ? void 0 : u.owner_id) ? l : ""), r = String(null != (o = null == (c = e.base_info) ? void 0 : c.title) ? o : "未命名").slice(0, 14), y = yield function(e, t) {
                    return eA(function*() {
                        try {
                            let n = yield S(e, t, 5);
                            return `匿名 ok 曲${n.entities.length}`;
                        } catch (e) {
                            return `匿名 ✗${eD(e)}`;
                        }
                    })();
                }(t, n);
                if (p.push(eN(`${r}`, y)), t === g) {
                    let t = JSON.stringify({
                        base_info: null != (f = e.base_info) ? f : {},
                        relation_info: null != (d = e.relation_info) ? d : {},
                        stats: null != (s = e.stats) ? s : {},
                        keys: Object.keys(e)
                    });
                    p.push(...eC(`${r} 行`, t));
                }
            }
            let v = new Set(), b = (e, t)=>{
                if (e && !(t > 4)) {
                    if ("string" == typeof e) {
                        /^(_000[\w-]+|\d{15,20})$/.test(e) && v.add(e);
                        return;
                    }
                    if (Array.isArray(e)) {
                        for (let n of e)b(n, t + 1);
                        return;
                    }
                    if ("object" == typeof e) for(let n in e)b(e[n], t + 1);
                }
            };
            b(h, 0), (null == y ? void 0 : y.userId) && v.add(y.userId);
            let k = [];
            for (let e of [
                g,
                ...v
            ])for (let t of [
                _,
                ...v,
                ""
            ]){
                if (k.length >= 10) break;
                (e !== g || t !== _ && "" !== t) && k.push([
                    e,
                    t
                ]);
            }
            let x = k.length, $ = (yield Promise.all(k.map(([e, t])=>S(e, t, 3).then((n)=>({
                        candidateId: e,
                        candidateOwner: t,
                        count: n.entities.length
                    })).catch(()=>({
                        candidateId: e,
                        candidateOwner: t,
                        count: 0
                    }))))).filter((e)=>e.count > 0).map((e)=>`✓曲${e.count} id…${e.candidateId.slice(-5)} owner…${e.candidateOwner.slice(-5) || "空"}`);
            return p.push(...eC("组合试", $.length ? $.slice(0, 4).join(" ; ") : `${x} 组全失败`)), p;
        })();
    })();
