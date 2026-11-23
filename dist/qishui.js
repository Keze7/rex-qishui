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
let s = null;
function d(e) {
    return t(function*(e, o = {}) {
        for(let p = 0;; p++){
            var a, u, d;
            let y = yield function(e = !1) {
                return t(function*() {
                    if (!e && s && Date.now() - s.at < 1800000) return s.value;
                    let t = yield f(`https://open.qishui.com${i}/client/token/get/?${c({
                        trigger_type: "cold_start"
                    })}`, {
                        headers: {
                            "user-agent": l
                        }
                    });
                    if ("string" != typeof t.client_token || !t.client_token) throw Error(`汽水客户端令牌获取失败${t.err_msg ? `：${t.err_msg}` : ""}`);
                    return (s = {
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
            }), h = Number(null != (a = null != (u = m.err_no) ? u : null == (d = m.data) ? void 0 : d.error_code) ? a : 0);
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
        let i = `${Date.now()}-${Math.random().toString(16).slice(2)}`, l = yield d("/search/", {
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
function v(e) {
    var t, i, l, o, a, c, f, s, d;
    let p = null != (t = null == e ? void 0 : e.base_info) ? t : {}, y = Array.isArray(null == e || null == (f = e.related_info) ? void 0 : f.artist_links) ? e.related_info.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [], m = Number(null != (i = p.release_date) ? i : 0);
    return r(n({
        id: String(null != (l = p.id) ? l : ""),
        name: String(null != (o = p.name) ? o : "未知专辑"),
        cover: u(null != (a = null == e || null == (s = e.display) ? void 0 : s.url_cover) ? a : null == e || null == (d = e.display_info) ? void 0 : d.url_cover),
        trackCount: Number(null != (c = p.count_tracks) ? c : 0),
        artists: y
    }, m > 0 ? {
        releaseDate: new Date(1000 * m).toISOString().slice(0, 10)
    } : {}), {
        intro: p.intro ? String(p.intro) : void 0
    });
}
function _(e) {
    return t(function*() {
        var t;
        let n = yield d("/album/detail/", {
            album_id: e
        }), r = Array.isArray(n.tracks) ? n.tracks : [];
        return {
            album: null != (t = n.album_info) ? t : {},
            entities: r
        };
    })();
}
function b(e) {
    var t, n, r, i, l, o, a;
    let u = null != (t = null != (n = null != (r = e.track_entity) ? r : null == (i = e.entity) ? void 0 : i.track) ? n : null == (o = e.entity) || null == (l = o.media) ? void 0 : l.track_entity) ? t : e.base_info ? e : null;
    return (null == u || null == (a = u.base_info) ? void 0 : a.id) ? u : null;
}
function k(e, t = []) {
    let n = [], r = (e, i)=>{
        if (!n.length && e && !(i > 2)) {
            if (Array.isArray(e)) {
                let l = e.map(b).filter((e)=>!!e).filter((e)=>{
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
function x(e) {
    return t(function*() {
        let t = [];
        for(let i = 0; i < e.length; i += 50){
            var n, r;
            let l = e.slice(i, i + 50), o = yield d("/media/mget/", {
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
function $(e, n = "", r = 200) {
    return t(function*() {
        let t, i = [], l = [], o = "0";
        for(let u = 0; u < 8; u++){
            var a;
            let u = yield d("/playlist/detail/", {
                playlist_id: e,
                owner_id: n,
                count: 100,
                cursor: o,
                type: null
            });
            for (let e of (t = null != t ? t : u.playlist, Array.isArray(u.media_entities) ? u.media_entities : [])){
                let t = b(e);
                if (t ? i.push(t) : e.media_id && l.push(String(e.media_id)), i.length >= r) break;
            }
            if (!i.length) for (let t of k(u, [
                e
            ]))i.push(t);
            let c = String(null != (a = u.next_cursor) ? a : "");
            if (!u.has_more || !c || c === o || i.length >= r) break;
            o = c;
        }
        if (!i.length && l.length) for (let e of yield x(l).catch(()=>[]))i.push(e);
        return {
            playlist: t,
            entities: i
        };
    })();
}
let S = Promise.resolve(), w = new Map();
function O(e, n = 30, r = null) {
    let i = `${null != e ? e : ""}|${null != r ? r : ""}|${n}`, l = w.get(i);
    if (l && Date.now() - l.at < 60000) return l.promise;
    let o = ()=>t(function*() {
            let t = yield d("/feed/song-tab/", {
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
        })(), a = S.then(o, o);
    return S = a.catch(()=>void 0), w.set(i, {
        at: Date.now(),
        promise: a
    }), a.catch(()=>w.delete(i)), w.size > 20 && w.clear(), a;
}
function j(e) {
    return t(function*() {
        var t;
        let n = yield d("/media/mget/", {
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
function P(e) {
    return t(function*() {
        let t = e.player_info;
        if (!t) throw Error("这首歌没有可播放音源");
        for (let [e, d] of [
            [
                "full",
                !1
            ],
            [
                "preview",
                !0
            ]
        ]){
            var n, r, i, o, a, u, c, s;
            let p = null == (a = t[e]) ? void 0 : a.video_model_info;
            if (!(null == p ? void 0 : p.url_player_info)) continue;
            let y = yield f(String(p.url_player_info), {
                headers: {
                    "user-agent": l
                }
            }), m = (null != (n = null != (r = null != (i = null == (c = y.Result) || null == (u = c.Data) ? void 0 : u.PlayInfoList) ? i : null == (s = y.data) ? void 0 : s.PlayInfoList) ? r : y.PlayInfoList) ? n : []).filter((e)=>(null == e ? void 0 : e.MainPlayUrl) && !e.PlayAuth && !e.EncryptionMethod).sort((e, t)=>{
                var n, r;
                return Number(null != (n = t.Bitrate) ? n : 0) - Number(null != (r = e.Bitrate) ? r : 0);
            });
            if (!m.length) continue;
            let h = m[0], g = Number(null != (o = h.Duration) ? o : 0);
            return {
                url: String(h.MainPlayUrl),
                preview: d || g > 0 && g < 25,
                duration: g
            };
        }
        throw Error("这首歌只有加密音源，暂不支持播放");
    })();
}
function A(e) {
    var t, n, r, i, l, o, a, c, f, s;
    let d = null != (t = e.base_info) ? t : {}, p = null != (n = e.related_info) ? n : {}, y = Array.isArray(p.artist_links) ? p.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [];
    return {
        id: String(null != (r = null != (i = d.id) ? i : e.id) ? r : ""),
        name: String(null != (l = d.name) ? l : "未知歌曲"),
        artists: y.length ? y : [
            "未知歌手"
        ],
        album: (null == (c = p.album_link) ? void 0 : c.name) ? String(p.album_link.name) : void 0,
        cover: u(null == (f = e.display_info) ? void 0 : f.cover_url),
        durationMs: Number(null != (o = d.duration_ms) ? o : 0),
        vip: "1 == 1" !== String(null != (a = null == (s = e.commerce_info) ? void 0 : s.playable_condition) ? a : "1 == 1")
    };
}
function D(e) {
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
let N = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function C(e) {
    let t = "";
    for(let n = 0; n < e.length; n += 3){
        let r = e[n] << 16 | (n + 1 < e.length ? e[n + 1] : 0) << 8 | (n + 2 < e.length ? e[n + 2] : 0);
        t += N[r >> 18 & 63] + N[r >> 12 & 63], t += n + 1 < e.length ? N[r >> 6 & 63] : "=", t += n + 2 < e.length ? N[63 & r] : "=";
    }
    return t;
}
function E(e, t) {
    let n = Array(t).fill(0), r = e;
    for(let e = t - 1; e >= 0; e--)n[e] = Number(255n & r), r >>= 8n;
    return n;
}
function q(e) {
    let t = 0n;
    for (let n of e)t = t << 8n | BigInt(n);
    return t;
}
let I = [
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
function M(e, t) {
    return e >>> t | e << 32 - t;
}
function z(e) {
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
            let t = M(i[e - 15], 7) ^ M(i[e - 15], 18) ^ i[e - 15] >>> 3, n = M(i[e - 2], 17) ^ M(i[e - 2], 19) ^ i[e - 2] >>> 10;
            i[e] = i[e - 16] + t + i[e - 7] + n >>> 0;
        }
        let [r, l, o, a, u, c, f, s] = t;
        for(let e = 0; e < 64; e++){
            let t = s + (M(u, 6) ^ M(u, 11) ^ M(u, 25)) + (u & c ^ ~u & f) + I[e] + i[e] >>> 0, n = (M(r, 2) ^ M(r, 13) ^ M(r, 22)) + (r & l ^ r & o ^ l & o) >>> 0;
            s = f, f = c, c = u, u = a + t >>> 0, a = o, o = l, l = r, r = t + n >>> 0;
        }
        t[0] = t[0] + r >>> 0, t[1] = t[1] + l >>> 0, t[2] = t[2] + o >>> 0, t[3] = t[3] + a >>> 0, t[4] = t[4] + u >>> 0, t[5] = t[5] + c >>> 0, t[6] = t[6] + f >>> 0, t[7] = t[7] + s >>> 0;
    }
    let l = [];
    for (let e of t)l.push(e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e);
    return l;
}
function T(e, t) {
    let n = e.length > 64 ? z(e) : e.slice();
    for(; n.length < 64;)n.push(0);
    let r = n.map((e)=>0x36 ^ e).concat(t), i = n.map((e)=>0x5c ^ e).concat(z(r));
    return z(i);
}
let B = {
    x: 0n,
    y: 1n,
    z: 0n
};
function U(e, t = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn) {
    let n = e % t;
    return n < 0n ? n + t : n;
}
function R(e, t) {
    let n = U(e, t);
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
    return U(i, t);
}
function W(e) {
    if (0n === e.z) return B;
    let t = U(e.x * e.x), n = U(e.y * e.y), r = U(n * n), i = U(2n * (U((e.x + n) * (e.x + n)) - t - r)), l = U(e.z * e.z), o = U(3n * t - 3n * U(l * l)), a = U(o * o - 2n * i), u = U(o * (i - a) - 8n * r);
    return {
        x: a,
        y: u,
        z: U(2n * e.y * e.z)
    };
}
function L(e, t) {
    let n = B, r = e, i = t;
    for(; i > 0n;)1n & i && (n = function(e, t) {
        if (0n === e.z) return t;
        if (0n === t.z) return e;
        let n = U(e.z * e.z), r = U(t.z * t.z), i = U(e.x * r), l = U(t.x * n), o = U(e.y * t.z * r), a = U(t.y * e.z * n);
        if (i === l) return o === a ? W(e) : B;
        let u = U(l - i), c = U(4n * u * u), f = U(u * c), s = U(2n * (a - o)), d = U(i * c), p = U(s * s - f - 2n * d), y = U(s * (d - p) - 2n * o * f);
        return {
            x: p,
            y,
            z: U(((e.z + t.z) * (e.z + t.z) - n - r) * u)
        };
    }(n, r)), r = W(r), i >>= 1n;
    return n;
}
function F(e) {
    if (0n === e.z) throw Error("point at infinity");
    let t = R(e.z, 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn), n = U(t * t);
    return {
        x: U(e.x * n),
        y: U(e.y * n * t)
    };
}
function J(e, ...t) {
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
function Y(e) {
    let t = 0;
    for(; t < e.length - 1 && 0 === e[t];)t++;
    let n = e.slice(t);
    return J(0x02, 0x80 & n[0] ? [
        0,
        ...n
    ] : n);
}
function G(e) {
    return J(0x06, function(e) {
        let t = [];
        for(let n = 0; n < e.length; n += 2)t.push(parseInt(e.slice(n, n + 2), 16));
        return t;
    }(e));
}
function K(e, t) {
    let n = q(z(t)), r = E(e, 32), i = E(U(n, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), 32), l = Array(32).fill(1), o = Array(32).fill(0);
    o = T(o, l.concat([
        0
    ], r, i)), l = T(o, l), o = T(o, l.concat([
        1
    ], r, i)), l = T(o, l);
    let a = 0n;
    for(; !((a = q(l = T(o, l))) > 0n) || !(a < 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);)o = T(o, l.concat([
        0
    ])), l = T(o, l);
    let u = U(F(L({
        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
        z: 1n
    }, a)).x, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), c = U(R(a, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n) * (n + u * e), 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);
    if (0n === u || 0n === c) throw Error("invalid signature");
    return J(0x30, Y(E(u, 32)), Y(E(c, 32)));
}
function H(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function Q(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                H(l, r, i, o, a, "next", e);
            }
            function a(e) {
                H(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function V(e) {
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
function Z(e, t) {
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
let X = "/api/luna/v1/platform", ee = "aw4bbxfujo741d09", et = "1270651532221750165", en = "qishui:account", er = "qishui:login", ei = {
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
function el(e) {
    let t = V(Z(V({}, ei), {
        device_id: et,
        did: et,
        iid: et,
        vehicle_id: `qishui-${et}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    }), e), n = [];
    for(let e in t)n.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`);
    return n.join("&");
}
function eo(e) {
    let t = [];
    for(let n in e)t.push(`${encodeURIComponent(n)}=${encodeURIComponent(e[n])}`);
    return t.join("&");
}
function ea(e) {
    return Q(function*(e, t = {}) {
        var n, r, i, l;
        let o = yield Widget.http.request(Z(V({
            url: e,
            method: null != (n = t.method) ? n : "GET",
            headers: V({
                "user-agent": "LunaOpenSDK/1.0.10"
            }, null != (r = t.headers) ? r : {})
        }, void 0 !== t.data ? {
            data: t.data
        } : {}), {
            timeout: 20
        }));
        return {
            data: "string" == typeof o.data ? eu(o.data) : o.data,
            status: null != (i = o.statusCode) ? i : 200,
            headers: null != (l = o.headers) ? l : {}
        };
    }).apply(this, arguments);
}
function eu(e) {
    try {
        return JSON.parse(e);
    } catch (t) {
        return {
            raw: e
        };
    }
}
function ec(e) {
    var t, n, r;
    let i = Number(null != (t = null != (n = null == e ? void 0 : e.err_no) ? n : null == e || null == (r = e.data) ? void 0 : r.error_code) ? t : 0);
    if (i) throw Error(`汽水账号接口错误 ${i}${(null == e ? void 0 : e.err_msg) ? `：${e.err_msg}` : ""}`);
}
function ef(e) {
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
function ed(e) {
    try {
        var t;
        null == (t = Widget.storage) || t.remove(e);
    } catch (e) {}
}
function ep() {
    let e = ef(en);
    return e && e.ticket && e.key ? e : null;
}
function ey() {
    let e = {
        aid: "1128",
        client_key: ee,
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
function em() {
    let e = ef(er);
    return !e || !e.qr || e.expiresAt < Date.now() ? null : e;
}
function eh(e, t, n) {
    return Q(function*() {
        var r, i, l;
        if (!(null == e ? void 0 : e.access_code)) throw Error("登录凭据缺失");
        let o = `https://open-client.douyin.com/passport/open/get_access_ticket/?${eo({
            aid: "1128",
            client_key: ee,
            device_platform: "android"
        })}`, a = yield ea(o, {
            method: "POST",
            headers: V({
                "content-type": "application/x-www-form-urlencoded",
                "bd-ticket-guard-version": "1"
            }, n.csr ? {
                "bd-ticket-guard-client-csr": n.csr
            } : {
                "bd-ticket-guard-client-cert": null != (r = n.cert) ? r : ""
            }),
            data: eo({
                access_code: String(e.access_code),
                open_id: String(e.open_id || e.open_uid || "")
            })
        });
        ec(a.data);
        let u = function(e, t) {
            let n = t.toLowerCase();
            for(let t in e)if (t.toLowerCase() === n) return String(e[t]);
            return "";
        }(a.headers, "bd-ticket-guard-server-data");
        if (!u) throw Error("票据缺失，请重新扫码");
        let c = eu(function(e) {
            let t = function(e) {
                let t = e.replace(/[^A-Za-z0-9+/]/g, ""), n = [];
                for(let e = 0; e < t.length; e += 4){
                    var r;
                    let i = eg.indexOf(t[e]) << 18 | eg.indexOf(null != (r = t[e + 1]) ? r : "A") << 12 | (t[e + 2] ? eg.indexOf(t[e + 2]) : 0) << 6 | (t[e + 3] ? eg.indexOf(t[e + 3]) : 0);
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
        let f = String(c.client_cert), s = Number(null != (i = e.expires_time) ? i : 0), d = s > 1e12 ? s : s > 1e9 ? 1000 * s : s > 0 ? Date.now() + 1000 * s : Date.now() + 21600000;
        return {
            key: t,
            ticket: String(c.ticket),
            cert: f.includes("-----BEGIN") ? C(D(f)) : f,
            tsSign: String(null != (l = c.ts_sign) ? l : ""),
            accessCode: String(e.access_code),
            openId: String(e.open_id || e.open_uid || ""),
            expiresAt: d
        };
    })();
}
let eg = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ev = {
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
function e_(e, t = 160) {
    let n = "string" == typeof e ? e : JSON.stringify(null != e ? e : null);
    return n.length > t ? `${n.slice(0, t)}…` : n;
}
function eb(e, t) {
    if ("string" != typeof e) return "";
    for (let n of e.split(/[?&]/)){
        let e = n.indexOf("=");
        if (e > 0 && n.slice(0, e) === t) return decodeURIComponent(n.slice(e + 1));
    }
    return "";
}
function ek(e, t) {
    let n = Math.floor(Date.now() / 1000), r = `ticket=${e.ticket}&path=${X}${t}&timestamp=${n}`, i = C(K(BigInt(`0x${e.key}`), D(r)));
    return C(D(JSON.stringify({
        ts_sign: e.tsSign,
        req_content: "ticket,path,timestamp",
        req_sign: i,
        timestamp: n
    })));
}
let ex = null;
function e$(e) {
    return Q(function*(e, t = {}) {
        var n, r;
        let i = ep();
        if (!i) throw Error("未登录");
        let l = yield i.expiresAt - Date.now() > 3600000 ? Promise.resolve(i) : ex || (ex = Q(function*() {
            var e;
            let t = yield ea(`https://open.qishui.com${X}/access/code/refresh/?${el({
                access_code: i.accessCode
            })}`);
            ec(t.data);
            let n = (null == (e = t.data) ? void 0 : e.data) || t.data, r = yield eh(n, i.key, {
                cert: i.cert
            }), l = Z(V({}, i, r), {
                accessCode: String(n.access_code || i.accessCode)
            });
            return es(en, l), l;
        })().finally(()=>{
            ex = null;
        })), o = yield ea(`https://open.douyin.com${X}${e}?${el({})}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "access-token": l.ticket,
                "bd-ticket-guard-version": "1",
                "bd-ticket-guard-client-cert": l.cert,
                "bd-ticket-guard-client-data": ek(l, e)
            },
            data: JSON.stringify(Z(V({}, t), {
                common_params: {
                    user_id: l.userId
                }
            }))
        });
        return ec(o.data), null != (n = null == (r = o.data) ? void 0 : r.data) ? n : {};
    }).apply(this, arguments);
}
function eS(e = 50) {
    return Q(function*() {
        let t = [], n = "";
        for(let l = 0; l < 4; l++){
            var r, i;
            let l = yield e$("/me/playlist/", {
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
function ew(e, t = "", n = 200) {
    return Q(function*() {
        let r, i = [], l = [], o = "", a = "0";
        for(let h = 0; h < 8 && i.length < n; h++){
            var u, c, f, s, d, p, y, m;
            let h = yield e$("/playlist/detail/", {
                playlist_id: e,
                owner_id: t,
                count: 100,
                cursor: a,
                type: null
            });
            r = null != r ? r : h.playlist;
            let g = Array.isArray(h.media_entities) ? h.media_entities : [];
            for (let e of g){
                let t = null != (c = null != (f = null != (s = e.track_entity) ? s : null == (d = e.entity) ? void 0 : d.track) ? f : null == (y = e.entity) || null == (p = y.media) ? void 0 : p.track_entity) ? c : e.base_info ? e : null;
                if ((null == t || null == (m = t.base_info) ? void 0 : m.id) ? i.push(t) : e.media_id && l.push(String(e.media_id)), i.length >= n) break;
            }
            if (!i.length) {
                for (let t of k(h, [
                    e
                ]))i.push(t);
                i.length || (o = `${Object.keys(h).join(",")}|rows=${g.length}`);
            }
            let v = String(null != (u = h.next_cursor) ? u : "");
            if (!h.has_more || !v || v === a) break;
            a = v;
        }
        if (!i.length && l.length) for (let e of (o = `${o}|ids=${l.length}`, yield x(l).catch(()=>[])))i.push(e);
        return V({
            playlist: r,
            entities: i
        }, o ? {
            shape: o
        } : {});
    })();
}
function eO(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function ej(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                eO(l, r, i, o, a, "next", e);
            }
            function a(e) {
                eO(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function eP(e) {
    var t;
    return String(null != (t = null == e ? void 0 : e.message) ? t : e).replace(/^汽水(账号)?接口错误\s*/, "").slice(0, 80);
}
function eA(e, t) {
    return {
        id: `diag-${e}-${t.slice(0, 8)}`,
        type: "url",
        link: "qishui:login",
        title: e,
        subtitle: t
    };
}
function eD(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function eN(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                eD(l, r, i, o, a, "next", e);
            }
            function a(e) {
                eD(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function eC(e) {
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
function eE(e, t) {
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
let eq = "qishui:";
function eI(e) {
    return `${eq}track:${e}`;
}
function eM(e, t = "") {
    return `${eq}playlist:${e}:${t}`;
}
function ez(e) {
    return `${eq}scene:${e}`;
}
function eT(e) {
    let t = String(null != e ? e : "").trim();
    if (!t.startsWith(eq)) return null;
    let [n, r, i = ""] = t.slice(eq.length).split(":");
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
function eB(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    let t = Math.round(e / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function eU(e) {
    let t = [
        e.artists.join(" / "),
        e.album,
        eB(e.durationMs)
    ].filter(Boolean).join(" · "), n = Math.round(e.durationMs / 1000);
    return eC({
        id: e.id,
        type: "url",
        mediaType: "song",
        link: eI(e.id),
        title: e.name
    }, t ? {
        subtitle: t
    } : {}, n > 0 ? {
        duration: n,
        durationText: eB(e.durationMs)
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {});
}
let eR = new Map();
function eW(e) {
    var t;
    let n = [
        e.trackCount ? `${e.trackCount} 首` : "",
        e.albumCount ? `${e.albumCount} 张专辑` : ""
    ].filter(Boolean).join(" · ");
    return eC({
        id: e.id,
        type: "person",
        mediaType: "person",
        link: (t = e.id, `${eq}artist:${t}`),
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
function eL(e) {
    var t, n;
    let r = [
        e.artists.join(" / "),
        e.trackCount ? `${e.trackCount} 首` : "",
        null != (t = e.releaseDate) ? t : ""
    ].filter(Boolean).join(" · ");
    return eC({
        id: e.id,
        type: "url",
        mediaType: "album",
        link: (n = e.id, `${eq}album:${n}`),
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
function eF(e, t = 8) {
    return eN(function*() {
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
        return (yield Promise.all(n.map((e)=>eN(function*() {
                try {
                    let { album: t } = yield _(e.id);
                    return v(t);
                } catch (t) {
                    return {
                        id: e.id,
                        name: e.name,
                        trackCount: 0,
                        artists: []
                    };
                }
            })()))).filter((e)=>e.id).map(eL);
    })();
}
function eJ(e, t = 30) {
    return eN(function*() {
        return (yield O(null, t, e)).map((e)=>eU(A(e)));
    })();
}
function eY(e) {
    return !Number.isFinite(e) || e <= 0 ? "" : e >= 100000000 ? `${(e / 100000000).toFixed(1)}亿` : e >= 10000 ? `${(e / 10000).toFixed(1)}万` : String(e);
}
function eG(e) {
    var t, n, r, i, l, o, a, c, f;
    let s = null != (t = e.base_info) ? t : {}, d = u(null == (a = e.display_info) ? void 0 : a.url_cover), p = eY(Number(null != (n = null == (c = e.stats) ? void 0 : c.count_collected) ? n : 0)), y = "number" == typeof e.resource_cnt ? e.resource_cnt : Number(null != (r = null == (f = e.resource_cnt) ? void 0 : f.track_cnt) ? r : 0), m = [
        p ? `${p} 收藏` : "",
        y ? `${y} 首` : ""
    ].filter(Boolean).join(" · ");
    return eC({
        id: `playlist-${s.id}`,
        type: "url",
        mediaType: "playlist",
        link: eM(String(s.id), String(null != (i = s.owner_id) ? i : "")),
        title: String(null != (l = null != (o = s.title) ? o : s.name) ? l : "歌单")
    }, m ? {
        subtitle: m
    } : {}, d ? {
        posterPath: d,
        coverUrl: d
    } : {});
}
function eK(e, t = 10) {
    return eN(function*() {
        return (yield m(e, t)).map(eG);
    })();
}
let eH = /歌手|歌曲|热门|榜单|合集|未知|^\s*$/;
function eQ(e) {
    return eN(function*() {
        let [n, r] = yield Promise.all([
            t(function*() {
                var t;
                return g(null != (t = (yield d("/artist/detail/", {
                    artist_id: e
                })).artist_info) ? t : {});
            })(),
            function(e, n = 50) {
                return t(function*() {
                    let t = yield d("/artist/tracks/", {
                        artist_id: e,
                        count: n,
                        cursor: "0"
                    });
                    return Array.isArray(t.tracks) ? t.tracks : [];
                })();
            }(e)
        ]), i = r.map((e)=>eU(A(e))), l = [
            i.length ? `${i.length} 首热门` : "",
            n.albumCount ? `${n.albumCount} 张专辑` : ""
        ].filter(Boolean).join(" · ");
        return eE(eC({}, eW(n), l ? {
            subtitle: l
        } : {}, n.intro ? {
            description: n.intro.slice(0, 300)
        } : {}), {
            tracks: i
        });
    })();
}
let eV = (e)=>e.filter((t, n)=>e.indexOf(t) === n), eZ = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, eX = /^\[(\d+),(\d+)\](.*)$/, e0 = /<\d+,\d+(?:,\d+)?>/g;
function e1(e) {
    let t = [];
    for (let n of String(null != e ? e : "").split(/\r?\n/)){
        let e = n.trim();
        if (!e) continue;
        let r = eZ.exec(e);
        if (r) {
            let [, e, n, i = "0", l] = r, o = 60000 * Number(e) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            t.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = eX.exec(e);
        i && t.push({
            ms: Number(i[1]),
            text: i[3].replace(e0, "").trim()
        });
    }
    return t;
}
function e2(e) {
    let t = Math.floor(e / 60000), n = Math.floor(e % 60000 / 1000), r = Math.floor(e % 1000 / 10);
    return `[${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function e3(e) {
    return e1(e).map((e)=>`${e2(e.ms)}${e.text}`).join("\n");
}
let e6 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function e5(e) {
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
            n += e6[l >> 18 & 63] + e6[l >> 12 & 63], n += e + 1 < t.length ? e6[l >> 6 & 63] : "=", n += e + 2 < t.length ? e6[63 & l] : "=";
        }
        return n;
    }(e)}`;
}
let e8 = `${eq}login:0`;
function e4(e) {
    let t = [
        e.vip ? "VIP" : "普通账号",
        e.userId
    ].filter(Boolean).join(" · ");
    return eE(eC(eE(eC({
        id: "my-account",
        type: "url",
        link: e8,
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
function e7(e, t, n) {
    return eC({
        id: "my-notice",
        type: "url",
        link: e8,
        title: e
    }, t ? {
        subtitle: t
    } : {}, n ? {
        description: n
    } : {});
}
function e9(e, t) {
    return {
        id: "login-qr",
        type: "url",
        link: e8,
        title: t,
        subtitle: "点开这一条看大图，用汽水音乐 App 扫码",
        description: "二维码 5 分钟内有效。登录态只保存在本机，不会上传到任何服务器。",
        posterPath: e,
        detailPoster: e,
        coverUrl: e
    };
}
function te() {
    return e7("点这里登录汽水音乐", "登录后才会显示账号里的歌单", "汽水音乐的账号数据要扫码授权才能读，接口不给匿名访问。");
}
function tt() {
    return eN(function*() {
        let e = ep();
        if (e) return [
            e4(e)
        ];
        let t = em();
        if (t) {
            let e = yield Q(function*() {
                var e, t, n, r;
                let i = em();
                if (!i) return {
                    state: "expired"
                };
                let l = null == (t = (yield ea(`https://open.douyin.com/oauth/check_qrcode/?${ey()}&token=${encodeURIComponent(i.token)}&timestamp=${Date.now()}`)).data) ? void 0 : t.data, o = String(null != (e = null == l ? void 0 : l.status) ? e : "").toLowerCase(), a = ev[o];
                return "expired" === a ? (ed(er), {
                    state: "expired"
                }) : "waiting" === a || "scanned" === a ? {
                    state: a
                } : "confirmed" !== a ? {
                    state: "unknown",
                    debug: `未知扫码状态「${o || "空"}」 ${e_(l)}`
                } : (n = l, r = i, Q(function*() {
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
                            ].find((e)=>"string" == typeof e && e) || eb(null == n ? void 0 : n.redirect_url, "code") || eb(null == n ? void 0 : n.redirect_url, "auth_code");
                            if (!e) return {
                                state: "unknown",
                                debug: `没拿到授权码 · ${a.join(" · ")} · ${e_(n, 200)}`
                            };
                            let t = null;
                            for (let n of [
                                "auth_code",
                                "code"
                            ])try {
                                let t = yield ea(`https://open.qishui.com${X}/access/code/get/?${el({
                                    [n]: String(e)
                                })}`);
                                a.push(`code/get(${n}) ${t.status} ${e_(t.data)}`), ec(t.data), o = (null == (l = t.data) ? void 0 : l.data) || t.data;
                                break;
                            } catch (e) {
                                t = e;
                            }
                            if (!o) throw t instanceof Error ? t : Error("授权码兑换失败");
                        }
                        if (!(null == o ? void 0 : o.access_code)) throw Error("access_code 缺失");
                        let u = yield eh(o, r.key, {
                            csr: r.csr
                        });
                        a.push(`ticket ok expires=${u.expiresAt}`);
                        let c = yield ea(`https://open.douyin.com${X}/me/info/?${el({})}`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",
                                "access-token": u.ticket,
                                "bd-ticket-guard-version": "1",
                                "bd-ticket-guard-client-cert": u.cert,
                                "bd-ticket-guard-client-data": ek(u, "/me/info/")
                            },
                            data: JSON.stringify({
                                common_params: {}
                            })
                        });
                        ec(c.data);
                        let f = null == (i = c.data) || null == (t = i.data) ? void 0 : t.my_info;
                        if (a.push(`me/info ${c.status} ${e_(c.data)}`), !(null == f ? void 0 : f.id)) throw Error("账号信息读取失败");
                        let s = Z(V({}, u), {
                            userId: String(f.id),
                            nickname: String(null != (e = f.nickname) ? e : ""),
                            avatar: String(f.medium_avatar_url || f.avatar_url || ""),
                            vip: !0 === f.is_vip
                        });
                        if (es(en, s), ed(er), !ep()) return {
                            state: "unknown",
                            debug: "票据拿到了但本地存不进去（Widget.storage 不可写）"
                        };
                        return {
                            state: "done",
                            account: s
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
                e4(e.account)
            ];
            if ("unknown" === e.state) {
                var n;
                return [
                    e7("登录没走完（把这段发我）", null != (n = e.debug) ? n : "没有详情")
                ];
            }
            if ("expired" !== e.state) return [
                e9(t.qr, "scanned" === e.state ? "已扫码，请在手机上点确认" : "用汽水音乐 App 扫码登录")
            ];
        }
        return [
            e9((yield Q(function*() {
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
                        t = t.concat(z(r.concat([
                            255 & n
                        ]))), n++;
                    }
                    return q(t) % (0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n - 1n) + 1n;
                }(), r = function(e) {
                    var t;
                    let n, r = F(L({
                        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
                        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
                        z: 1n
                    }, e)), i = (e, t)=>J(0x31, J(0x30, G(e), J(0x0c, D(t)))), l = J(0x30, i("550403", "bd-ticket-guard"), i("55040b", ""), i("55040a", "")), o = J(0x30, J(0x02, [
                        0
                    ]), l, (n = [
                        0x04,
                        ...E(r.x, 32),
                        ...E(r.y, 32)
                    ], J(0x30, J(0x30, G("2a8648ce3d0201"), G("2a8648ce3d030107")), J(0x03, [
                        0x00,
                        ...n
                    ]))), J(0xa0)), a = K(e, o), u = J(0x30, o, J(0x30, G("2a8648ce3d040302")), J(0x03, [
                        0x00,
                        ...a
                    ])), c = `-----BEGIN CERTIFICATE REQUEST-----\n${null == (t = C(u).match(/.{1,64}/g)) ? void 0 : t.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
                    return C(D(c));
                }(n), i = null == (e = (yield ea(`https://open.douyin.com/oauth/get_qrcode/?${ey()}`)).data) ? void 0 : e.data;
                if (!(null == i ? void 0 : i.token) || !(null == i ? void 0 : i.qrcode_index_url)) throw Error("二维码生成失败，请稍后重试");
                let l = Date.now() + 300000, o = yield (t = String(i.qrcode_index_url), Q(function*() {
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
                return es(er, {
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
function tn(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function tr(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                tn(l, r, i, o, a, "next", e);
            }
            function a(e) {
                tn(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
let ti = "0.3.0";
WidgetMetadata = {
    id: "qishui.music",
    title: "汽水音乐",
    description: "汽水音乐插件，基于车机开放接口：扫码登录后可用我的歌单与最近播放，另有每日推荐、新歌、猜你喜欢、专辑、歌单、场景、歌手、搜索、播放与时间轴歌词。免费曲目可完整播放，会员曲目只有试听片段",
    author: "self-hosted",
    version: ti,
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
}, loadLogin = ()=>tr(function*() {
        return tt();
    })(), loadMyPlaylists = ()=>tr(function*() {
        return function(e = 50) {
            return eN(function*() {
                if (!ep()) return [
                    te()
                ];
                try {
                    let t = yield eS(e);
                    if (!t.length) return [
                        e7("还没有歌单", "账号里没有自建或收藏的歌单")
                    ];
                    return t.map(eG);
                } catch (e) {
                    var t;
                    return [
                        e7("歌单读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), loadRecentPlayed = ()=>tr(function*() {
        return function(e = 50) {
            return eN(function*() {
                if (!ep()) return [
                    te()
                ];
                try {
                    let t = yield function(e = 50) {
                        return Q(function*() {
                            let t = [], n = "";
                            for(let l = 0; l < 8 && t.length < e; l++){
                                var r, i;
                                let l = yield e$("/me/recent-played/", {
                                    count: e,
                                    cursor: n,
                                    media_type: "track",
                                    scene: "me_tab"
                                });
                                for (let n of Array.isArray(l.media) ? l.media : []){
                                    let r = null == n ? void 0 : n.media;
                                    if ((null == r ? void 0 : r.track_entity) && (t.push(Z(V({}, r.track_entity), {
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
                    }(e);
                    if (!t.length) return [
                        e7("还没有播放记录", "在汽水音乐里听几首歌再回来")
                    ];
                    return t.map((e)=>eU(A(e)));
                } catch (e) {
                    var t;
                    return [
                        e7("最近播放读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), logoutAccount = ()=>tr(function*() {
        return ed(en), ed(er), {
            message: "已退出登录",
            refresh: !0
        };
    })(), loadScenes = ()=>tr(function*() {
        return eN(function*() {
            return (yield t(function*() {
                let e = yield d("/feed/mode/", {});
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
            })()).map((e)=>(eR.set(e.id, e.name), eC({
                    id: `scene-${e.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: ez(e.id),
                    title: e.name
                }, e.group ? {
                    subtitle: e.group
                } : {}, e.cover ? {
                    posterPath: e.cover,
                    coverUrl: e.cover
                } : {})));
        })();
    })(), loadRecommend = ()=>tr(function*() {
        return eN(function*() {
            return (yield O(null, 30)).map((e)=>eU(A(e)));
        })();
    })(), loadDaily = ()=>tr(function*() {
        return eJ("daily", 30);
    })(), loadFresh = ()=>tr(function*() {
        return eJ("fresh", 30);
    })(), loadFamiliar = ()=>tr(function*() {
        return eJ("familiar", 30);
    })(), loadAlbums = ()=>tr(function*() {
        return function(e = 10) {
            return eN(function*() {
                return eF((yield O(null, 30, "daily")), e);
            })();
        }(10);
    })(), loadArtists = (e)=>tr(function*() {
        return function() {
            return eN(function*(e = {}) {
                var t, n;
                let r = String(null != (t = null != (n = e.peopleId) ? n : e.id) ? t : "").trim();
                return /^\d{1,30}$/.test(r) ? [
                    (yield eQ(r))
                ] : function(e = 18) {
                    return eN(function*() {
                        let t = yield Promise.all([
                            "华语",
                            "粤语",
                            "欧美"
                        ].map((e)=>h(e, 10).catch(()=>[]))), n = new Set(), r = [];
                        for (let i of t.flat()){
                            let t = g(i);
                            if (!(!t.id || n.has(t.id) || eH.test(t.name)) && !(t.name.length > 20) && !(t.trackCount < 1) && (n.add(t.id), r.push(eW(t)), r.length >= e)) break;
                        }
                        return r;
                    })();
                }();
            }).apply(this, arguments);
        }(e);
    })(), loadHotPlaylists = ()=>tr(function*() {
        return eK("热歌", 10);
    })(), loadClassicPlaylists = ()=>tr(function*() {
        return eK("经典老歌", 10);
    })(), loadSubtitle = (e)=>tr(function*() {
        return eN(function*() {
            var t, n, r, i, l;
            let o, a = e.link ? eT(e.link) : null, u = (null == a ? void 0 : a.kind) === "track" ? a.id : /^\d{1,30}$/.test(String(null != (t = e.id) ? t : "")) ? String(e.id) : "";
            if (!u) return [];
            let { original: c, translation: f } = {
                original: String(null != (n = null == (o = null == (i = (yield j(u)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((e)=>{
                    var t;
                    return String(null != (t = null == e ? void 0 : e.content) ? t : "");
                }).find((e)=>e.trim().length > 0)
            }, s = [];
            if (c && f) {
                let e, t = (e = new Map(e1(f).map((e)=>[
                        e.ms,
                        e.text
                    ])), e1(c).map((t)=>{
                    let n = e.get(t.ms), r = n && n !== t.text ? `${t.text} / ${n}` : t.text;
                    return `${e2(t.ms)}${r}`;
                }).join("\n"));
                t && s.push({
                    id: `qishui:lyric:${u}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: e5(t)
                });
            }
            let d = c ? e3(c) : "", p = f ? e3(f) : "";
            return d && s.push({
                id: `qishui:lyric:${u}:original`,
                title: "原文歌词",
                lang: "und",
                url: e5(d)
            }), p && s.push({
                id: `qishui:lyric:${u}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: e5(p)
            }), s;
        })();
    })(), search = (e)=>tr(function*() {
        return eN(function*() {
            var t, n;
            let r = String(null != (t = e.keyword) ? t : "").trim();
            if (!r) return [];
            let i = String(null != (n = e.kind) ? n : "all");
            if ("artists" === i) return (yield h(r, 20)).map((e)=>eW(g(e)));
            if ("playlists" === i) return eK(r, 30);
            if ("albums" === i) return eF((yield y(r, 40)), 12);
            if ("songs" === i || "tracks" === i) return (yield y(r, 40)).map((e)=>eU(A(e)));
            let [l, o, a] = yield Promise.all([
                h(r, 12).catch(()=>[]),
                y(r, 20).catch(()=>[]),
                m(r, 8).catch(()=>[])
            ]), u = yield eF(o, 6).catch(()=>[]);
            return [
                ...l.map((e)=>eW(g(e))),
                ...u,
                ...o.map((e)=>eU(A(e))),
                ...a.map(eG)
            ];
        })();
    })(), loadDetail = (e)=>tr(function*() {
        return eN(function*() {
            var t, n, r, i, l;
            let o = eT(e);
            if (!o) throw Error(`无法识别的链接：${e}`);
            return "track" === o.kind ? (t = o.id, eN(function*() {
                var e, n;
                let r;
                try {
                    r = yield j(t);
                } catch (e) {
                    return e7("这首歌打不开", `id ${t}`, String(null != (n = null == e ? void 0 : e.message) ? n : e).slice(0, 100));
                }
                let i = A(r), l = null != (e = yield P(r).catch(()=>null)) ? e : yield eN(function*() {
                    var e;
                    let t = `${i.name} ${null != (e = i.artists[0]) ? e : ""}`.trim();
                    if (!t) return null;
                    let n = yield y(t, 6).catch(()=>[]), r = (e)=>String(e).replace(/[\s\-—_·.,，。!！?？()（）[\]【】]/g, "").toLowerCase();
                    for (let e of n){
                        if (r(A(e).name) !== r(i.name)) continue;
                        let t = yield P(e).catch(()=>null);
                        if (null == t ? void 0 : t.url) return t;
                    }
                    return null;
                })();
                if (!(null == l ? void 0 : l.url)) return eE(eC({}, eU(i)), {
                    link: eI(t),
                    description: "汽水没给这首歌播放地址（导入或已下架），换一首试试。"
                });
                let o = [
                    eB(i.durationMs),
                    l.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return eE(eC({}, eU(i), o ? {
                    description: o
                } : {}), {
                    videoUrl: l.url
                });
            })()) : "scene" === o.kind ? (n = o.id, eN(function*() {
                var e;
                let t = (yield O(n, 40)).map((e)=>eU(A(e)));
                return {
                    id: `scene-${n}`,
                    type: "url",
                    mediaType: "playlist",
                    link: ez(n),
                    title: null != (e = eR.get(n)) ? e : "场景推荐",
                    description: `${t.length} 首`,
                    tracks: t
                };
            })()) : "artist" === o.kind ? eQ(o.id) : "album" === o.kind ? (r = o.id, eN(function*() {
                let { album: e, entities: t } = yield _(r), n = v(e);
                return eE(eC({}, eL(n), n.intro ? {
                    description: n.intro.slice(0, 300)
                } : {}), {
                    tracks: t.map((e)=>eU(A(e)))
                });
            })()) : "login" === o.kind ? (yield tt())[0] : (i = o.id, l = o.ownerId, eN(function*() {
                var e, t, n, r, o, a, c, f;
                let s = [
                    [
                        "匿名",
                        ()=>$(i, l)
                    ]
                ];
                l && s.push([
                    "匿名·无作者",
                    ()=>$(i, "")
                ]);
                let d = ep();
                d && (s.push([
                    "账号票据",
                    ()=>ew(i, l)
                ]), d.userId && d.userId !== l && s.push([
                    "账号票据·本人",
                    ()=>ew(i, d.userId)
                ]));
                let p = [], y = null, m = (e, t)=>eN(function*() {
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
                for (let [e, t] of s)if (yield m(e, t)) break;
                let h = [], g = "";
                if (!y) {
                    let e = yield eN(function*() {
                        var e, t, n, r, l, o, a, u, c;
                        let f = {
                            ids: [],
                            owners: [],
                            keys: [],
                            dump: "",
                            title: "",
                            count: 0
                        };
                        if (!ep()) return f;
                        let s = (yield eS(50).catch(()=>[])).find((e)=>{
                            var t, n;
                            return String(null != (t = null == (n = e.base_info) ? void 0 : n.id) ? t : "") === i;
                        });
                        if (!s) return f;
                        let d = [], p = [], y = (e, t, n)=>{
                            if (e && !(n > 3)) {
                                if ("string" == typeof e) return void (e.startsWith("_000") ? p.push(e) : /^\d{15,20}$/.test(e) && (/owner|creator|author|user|uid|sec/i.test(t) ? p.push(e) : d.push(e)));
                                if ("object" == typeof e) for(let t in e)y(e[t], t, n + 1);
                            }
                        };
                        for(let e in s)y(s[e], e, 0);
                        return {
                            ids: eV(d.filter((e)=>e !== i)).slice(0, 3),
                            owners: eV(p.filter((e)=>e !== i)).slice(0, 3),
                            keys: Object.keys(null != (e = s.base_info) ? e : {}),
                            dump: JSON.stringify(null != (t = s.base_info) ? t : s).slice(0, 420),
                            title: String(null != (n = null != (r = null == (a = s.base_info) ? void 0 : a.title) ? r : null == (u = s.base_info) ? void 0 : u.name) ? n : ""),
                            count: Number(null != (l = null != (o = null == (c = s.resource_cnt) ? void 0 : c.track_cnt) ? o : s.resource_cnt) ? l : 0) || 0
                        };
                    })();
                    h = e.keys, g = e.dump, e.title;
                    let t = 6;
                    for (let n of [
                        i,
                        ...e.ids
                    ]){
                        for (let r of eV([
                            l,
                            ...e.owners
                        ]))if (t-- <= 0 || (n !== i || r !== l) && (yield m(`匿名 ${n.slice(-6)}/${r.slice(-6) || "-"}`, ()=>$(n, r)))) break;
                        if (y) break;
                    }
                }
                if (!y) {
                    let e = (e, t)=>e.length > t ? `${e.slice(0, t)}…` : e, t = p.filter((e)=>e.startsWith("账号票据")).join(" | ") || "没登录", n = p.filter((e)=>e.startsWith("匿名")).join(" | "), r = h.length ? `${h.join(",")}${g ? ` ${g}` : ""}` : "没取到歌单行";
                    return {
                        id: i,
                        type: "url",
                        mediaType: "playlist",
                        link: eM(i, l),
                        title: e(`读不到 · ${t}`, 60),
                        subtitle: e(r, 80),
                        description: `接口反馈：${p.join(" / ").slice(0, 260)} · 匿名：${n}`
                    };
                }
                let v = y, { playlist: _ } = v, b = v.entities.filter((e)=>{
                    var t, n;
                    return String(null != (t = null == (n = e.base_info) ? void 0 : n.id) ? t : "") !== i;
                });
                if (!b.length) return {
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: eM(i, l),
                    title: "这个歌单里没有可播的曲目",
                    subtitle: "接口返回了歌单信息，但曲目列表是空的"
                };
                let k = b.map((e)=>eU(A(e))), x = null != (e = null == _ ? void 0 : _.base_info) ? e : {}, S = u(null == _ || null == (o = _.display_info) ? void 0 : o.url_cover), w = null == _ || null == (c = _.relation_info) || null == (a = c.owner) ? void 0 : a.name, O = eY(Number(null != (t = null == _ || null == (f = _.stats) ? void 0 : f.count_collected) ? t : 0)), j = [
                    w,
                    O ? `${O} 收藏` : "",
                    k.length ? `${k.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return eE(eC({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: eM(i, l),
                    title: String(null != (n = null != (r = x.title) ? r : x.name) ? n : "歌单")
                }, j ? {
                    subtitle: j
                } : {}, x.desc ? {
                    description: String(x.desc).slice(0, 200)
                } : {}, S ? {
                    posterPath: S,
                    coverUrl: S
                } : {}), {
                    tracks: k
                });
            })());
        })();
    })(), loadDiag = ()=>tr(function*() {
        return ej(function*() {
            var e, t, n, r, i, l, o, a, u, c;
            let f = [], s = ep();
            f.push(eA("插件版本", ti)), f.push(s ? eA("登录状态", `已登录 uid=${s.userId} ${s.nickname || ""}`) : eA("登录状态", "未登录（账号接口全部用不了）"));
            let d = [];
            try {
                d = yield eS(50), f.push(eA("歌单列表", `拿到 ${d.length} 个`));
            } catch (e) {
                return f.push(eA("歌单列表", `失败 ${eP(e)}`)), f;
            }
            if (!d.length) return f;
            let p = d.reduce((e, t)=>{
                let n = (e)=>{
                    var t, n, r;
                    return Number(null != (t = null != (n = null == (r = e.resource_cnt) ? void 0 : r.track_cnt) ? n : e.resource_cnt) ? t : 0) || 0;
                };
                return n(t) > n(e) ? t : e;
            }, d[0]), y = String(null != (e = null == (n = p.base_info) ? void 0 : n.id) ? e : ""), m = String(null != (t = null == (r = p.base_info) ? void 0 : r.owner_id) ? t : "");
            for (let e of d){
                let t = String(null != (i = null == (a = e.base_info) ? void 0 : a.id) ? i : ""), n = String(null != (l = null == (u = e.base_info) ? void 0 : u.owner_id) ? l : ""), r = String(null != (o = null == (c = e.base_info) ? void 0 : c.title) ? o : "未命名").slice(0, 14), s = yield function(e, t) {
                    return ej(function*() {
                        try {
                            let n = yield $(e, t, 5);
                            return `匿名 ok 曲${n.entities.length}`;
                        } catch (e) {
                            return `匿名 ✗${eP(e)}`;
                        }
                    })();
                }(t, n), d = yield function(e, t) {
                    return ej(function*() {
                        let n = [];
                        try {
                            let i = yield e$("/playlist/detail/", {
                                playlist_id: e,
                                owner_id: t,
                                count: 100,
                                cursor: "0",
                                type: null
                            }), l = Array.isArray(i.media_entities) ? i.media_entities : [], o = Object.keys(i).join(","), a = `账号 ok rows=${l.length} keys=${o}`;
                            if (l.length) n.push(`row0 ${JSON.stringify(l[0]).slice(0, 300)}`);
                            else {
                                var r;
                                n.push(`playlist ${JSON.stringify(null != (r = i.playlist) ? r : {}).slice(0, 300)}`);
                            }
                            return {
                                line: a,
                                detail: n
                            };
                        } catch (e) {
                            return {
                                line: `账号 ✗${eP(e)}`,
                                detail: n
                            };
                        }
                    })();
                }(t, n);
                f.push(eA(`${r}`, `${s} | ${d.line}`)), t === y && f.push(...function(e, t) {
                    let n = String(t || "空").replace(/\s+/g, " ").trim(), r = [];
                    for(let e = 0; e < n.length; e += 52)r.push(n.slice(e, e + 52));
                    return r.length || r.push("空"), r.map((t, n)=>eA(r.length > 1 ? `${e} ${n + 1}/${r.length}` : e, t));
                }(`${r} 明细`, d.detail.join(" ‖ ")));
            }
            for (let e of [
                "/playlist/media/",
                "/me/playlist/media/",
                "/me/media/",
                "/playlist/item/",
                "/playlist/tracks/"
            ])try {
                let t = yield e$(e, {
                    playlist_id: y,
                    owner_id: m,
                    count: 20,
                    cursor: "0"
                }), n = Object.keys(t).join(","), r = Object.values(t).find((e)=>Array.isArray(e));
                f.push(eA(`探 ${e}`, `ok keys=${n} 数组=${r ? r.length : 0}`));
            } catch (t) {
                f.push(eA(`探 ${e}`, `✗${eP(t)}`));
            }
            return f;
        })();
    })();
