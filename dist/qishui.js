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
function v(e) {
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
function g(e) {
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
function _(e) {
    var t, n, r, i, l, o, a;
    let u = null != (t = null != (n = null != (r = e.track_entity) ? r : null == (i = e.entity) ? void 0 : i.track) ? n : null == (o = e.entity) || null == (l = o.media) ? void 0 : l.track_entity) ? t : e.base_info ? e : null;
    return (null == u || null == (a = u.base_info) ? void 0 : a.id) ? u : null;
}
function k(e) {
    let t = [], n = (e, r)=>{
        if (!t.length && e && !(r > 2)) {
            if (Array.isArray(e)) {
                let i = e.map(_).filter((e)=>!!e);
                if (i.length) {
                    t = i;
                    return;
                }
                for (let t of e)n(t, r + 1);
                return;
            }
            if ("object" == typeof e) for(let t in e)n(e[t], r + 1);
        }
    };
    return n(e, 0), t;
}
function x(e, n = "", r = 200) {
    return t(function*() {
        let t, i = [], l = "0";
        for(let a = 0; a < 8; a++){
            var o;
            let a = yield s("/playlist/detail/", {
                playlist_id: e,
                owner_id: n,
                count: 100,
                cursor: l,
                type: null
            });
            t = null != t ? t : a.playlist;
            let u = Array.isArray(a.media_entities) ? a.media_entities : [];
            for (let e of u){
                let t = _(e);
                if (t && i.push(t), i.length >= r) break;
            }
            if (!u.length) for (let e of k(a))i.push(e);
            let c = String(null != (o = a.next_cursor) ? o : "");
            if (!a.has_more || !c || c === l || i.length >= r) break;
            l = c;
        }
        return {
            playlist: t,
            entities: i
        };
    })();
}
let $ = Promise.resolve(), S = new Map();
function w(e, n = 30, r = null) {
    let i = `${null != e ? e : ""}|${null != r ? r : ""}|${n}`, l = S.get(i);
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
        })(), a = $.then(o, o);
    return $ = a.catch(()=>void 0), S.set(i, {
        at: Date.now(),
        promise: a
    }), a.catch(()=>S.delete(i)), S.size > 20 && S.clear(), a;
}
function O(e) {
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
function j(e) {
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
            let h = m[0], v = Number(null != (o = h.Duration) ? o : 0);
            return {
                url: String(h.MainPlayUrl),
                preview: s || v > 0 && v < 25,
                duration: v
            };
        }
        throw Error("这首歌只有加密音源，暂不支持播放");
    })();
}
function P(e) {
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
function A(e) {
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
let D = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function C(e) {
    let t = "";
    for(let n = 0; n < e.length; n += 3){
        let r = e[n] << 16 | (n + 1 < e.length ? e[n + 1] : 0) << 8 | (n + 2 < e.length ? e[n + 2] : 0);
        t += D[r >> 18 & 63] + D[r >> 12 & 63], t += n + 1 < e.length ? D[r >> 6 & 63] : "=", t += n + 2 < e.length ? D[63 & r] : "=";
    }
    return t;
}
function N(e, t) {
    let n = Array(t).fill(0), r = e;
    for(let e = t - 1; e >= 0; e--)n[e] = Number(255n & r), r >>= 8n;
    return n;
}
function E(e) {
    let t = 0n;
    for (let n of e)t = t << 8n | BigInt(n);
    return t;
}
let q = [
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
function I(e, t) {
    return e >>> t | e << 32 - t;
}
function M(e) {
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
            let t = I(i[e - 15], 7) ^ I(i[e - 15], 18) ^ i[e - 15] >>> 3, n = I(i[e - 2], 17) ^ I(i[e - 2], 19) ^ i[e - 2] >>> 10;
            i[e] = i[e - 16] + t + i[e - 7] + n >>> 0;
        }
        let [r, l, o, a, u, c, f, d] = t;
        for(let e = 0; e < 64; e++){
            let t = d + (I(u, 6) ^ I(u, 11) ^ I(u, 25)) + (u & c ^ ~u & f) + q[e] + i[e] >>> 0, n = (I(r, 2) ^ I(r, 13) ^ I(r, 22)) + (r & l ^ r & o ^ l & o) >>> 0;
            d = f, f = c, c = u, u = a + t >>> 0, a = o, o = l, l = r, r = t + n >>> 0;
        }
        t[0] = t[0] + r >>> 0, t[1] = t[1] + l >>> 0, t[2] = t[2] + o >>> 0, t[3] = t[3] + a >>> 0, t[4] = t[4] + u >>> 0, t[5] = t[5] + c >>> 0, t[6] = t[6] + f >>> 0, t[7] = t[7] + d >>> 0;
    }
    let l = [];
    for (let e of t)l.push(e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e);
    return l;
}
function z(e, t) {
    let n = e.length > 64 ? M(e) : e.slice();
    for(; n.length < 64;)n.push(0);
    let r = n.map((e)=>0x36 ^ e).concat(t), i = n.map((e)=>0x5c ^ e).concat(M(r));
    return M(i);
}
let T = {
    x: 0n,
    y: 1n,
    z: 0n
};
function B(e, t = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn) {
    let n = e % t;
    return n < 0n ? n + t : n;
}
function U(e, t) {
    let n = B(e, t);
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
    return B(i, t);
}
function R(e) {
    if (0n === e.z) return T;
    let t = B(e.x * e.x), n = B(e.y * e.y), r = B(n * n), i = B(2n * (B((e.x + n) * (e.x + n)) - t - r)), l = B(e.z * e.z), o = B(3n * t - 3n * B(l * l)), a = B(o * o - 2n * i), u = B(o * (i - a) - 8n * r);
    return {
        x: a,
        y: u,
        z: B(2n * e.y * e.z)
    };
}
function L(e, t) {
    let n = T, r = e, i = t;
    for(; i > 0n;)1n & i && (n = function(e, t) {
        if (0n === e.z) return t;
        if (0n === t.z) return e;
        let n = B(e.z * e.z), r = B(t.z * t.z), i = B(e.x * r), l = B(t.x * n), o = B(e.y * t.z * r), a = B(t.y * e.z * n);
        if (i === l) return o === a ? R(e) : T;
        let u = B(l - i), c = B(4n * u * u), f = B(u * c), d = B(2n * (a - o)), s = B(i * c), p = B(d * d - f - 2n * s), y = B(d * (s - p) - 2n * o * f);
        return {
            x: p,
            y,
            z: B(((e.z + t.z) * (e.z + t.z) - n - r) * u)
        };
    }(n, r)), r = R(r), i >>= 1n;
    return n;
}
function W(e) {
    if (0n === e.z) throw Error("point at infinity");
    let t = U(e.z, 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn), n = B(t * t);
    return {
        x: B(e.x * n),
        y: B(e.y * n * t)
    };
}
function F(e, ...t) {
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
function J(e) {
    let t = 0;
    for(; t < e.length - 1 && 0 === e[t];)t++;
    let n = e.slice(t);
    return F(0x02, 0x80 & n[0] ? [
        0,
        ...n
    ] : n);
}
function Y(e) {
    return F(0x06, function(e) {
        let t = [];
        for(let n = 0; n < e.length; n += 2)t.push(parseInt(e.slice(n, n + 2), 16));
        return t;
    }(e));
}
function G(e, t) {
    let n = E(M(t)), r = N(e, 32), i = N(B(n, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), 32), l = Array(32).fill(1), o = Array(32).fill(0);
    o = z(o, l.concat([
        0
    ], r, i)), l = z(o, l), o = z(o, l.concat([
        1
    ], r, i)), l = z(o, l);
    let a = 0n;
    for(; !((a = E(l = z(o, l))) > 0n) || !(a < 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);)o = z(o, l.concat([
        0
    ])), l = z(o, l);
    let u = B(W(L({
        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
        z: 1n
    }, a)).x, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), c = B(U(a, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n) * (n + u * e), 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);
    if (0n === u || 0n === c) throw Error("invalid signature");
    return F(0x30, J(N(u, 32)), J(N(c, 32)));
}
function K(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function H(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                K(l, r, i, o, a, "next", e);
            }
            function a(e) {
                K(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function Q(e) {
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
function V(e, t) {
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
let Z = "/api/luna/v1/platform", X = "aw4bbxfujo741d09", ee = "1270651532221750165", et = "qishui:account", en = "qishui:login", er = {
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
function ei(e) {
    let t = Q(V(Q({}, er), {
        device_id: ee,
        did: ee,
        iid: ee,
        vehicle_id: `qishui-${ee}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    }), e), n = [];
    for(let e in t)n.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`);
    return n.join("&");
}
function el(e) {
    let t = [];
    for(let n in e)t.push(`${encodeURIComponent(n)}=${encodeURIComponent(e[n])}`);
    return t.join("&");
}
function eo(e) {
    return H(function*(e, t = {}) {
        var n, r, i, l;
        let o = yield Widget.http.request(V(Q({
            url: e,
            method: null != (n = t.method) ? n : "GET",
            headers: Q({
                "user-agent": "LunaOpenSDK/1.0.10"
            }, null != (r = t.headers) ? r : {})
        }, void 0 !== t.data ? {
            data: t.data
        } : {}), {
            timeout: 20
        }));
        return {
            data: "string" == typeof o.data ? ea(o.data) : o.data,
            status: null != (i = o.statusCode) ? i : 200,
            headers: null != (l = o.headers) ? l : {}
        };
    }).apply(this, arguments);
}
function ea(e) {
    try {
        return JSON.parse(e);
    } catch (t) {
        return {
            raw: e
        };
    }
}
function eu(e) {
    var t, n, r;
    let i = Number(null != (t = null != (n = null == e ? void 0 : e.err_no) ? n : null == e || null == (r = e.data) ? void 0 : r.error_code) ? t : 0);
    if (i) throw Error(`汽水账号接口错误 ${i}${(null == e ? void 0 : e.err_msg) ? `：${e.err_msg}` : ""}`);
}
function ec(e) {
    try {
        var t, n;
        return null != (t = null == (n = Widget.storage) ? void 0 : n.get(e)) ? t : null;
    } catch (e) {
        return null;
    }
}
function ef(e, t) {
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
function es() {
    let e = ec(et);
    return e && e.ticket && e.key ? e : null;
}
function ep() {
    let e = {
        aid: "1128",
        client_key: X,
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
function ey() {
    let e = ec(en);
    return !e || !e.qr || e.expiresAt < Date.now() ? null : e;
}
function em(e, t, n) {
    return H(function*() {
        var r, i, l;
        if (!(null == e ? void 0 : e.access_code)) throw Error("登录凭据缺失");
        let o = `https://open-client.douyin.com/passport/open/get_access_ticket/?${el({
            aid: "1128",
            client_key: X,
            device_platform: "android"
        })}`, a = yield eo(o, {
            method: "POST",
            headers: Q({
                "content-type": "application/x-www-form-urlencoded",
                "bd-ticket-guard-version": "1"
            }, n.csr ? {
                "bd-ticket-guard-client-csr": n.csr
            } : {
                "bd-ticket-guard-client-cert": null != (r = n.cert) ? r : ""
            }),
            data: el({
                access_code: String(e.access_code),
                open_id: String(e.open_id || e.open_uid || "")
            })
        });
        eu(a.data);
        let u = function(e, t) {
            let n = t.toLowerCase();
            for(let t in e)if (t.toLowerCase() === n) return String(e[t]);
            return "";
        }(a.headers, "bd-ticket-guard-server-data");
        if (!u) throw Error("票据缺失，请重新扫码");
        let c = ea(function(e) {
            let t = function(e) {
                let t = e.replace(/[^A-Za-z0-9+/]/g, ""), n = [];
                for(let e = 0; e < t.length; e += 4){
                    var r;
                    let i = eh.indexOf(t[e]) << 18 | eh.indexOf(null != (r = t[e + 1]) ? r : "A") << 12 | (t[e + 2] ? eh.indexOf(t[e + 2]) : 0) << 6 | (t[e + 3] ? eh.indexOf(t[e + 3]) : 0);
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
            cert: f.includes("-----BEGIN") ? C(A(f)) : f,
            tsSign: String(null != (l = c.ts_sign) ? l : ""),
            accessCode: String(e.access_code),
            openId: String(e.open_id || e.open_uid || ""),
            expiresAt: s
        };
    })();
}
let eh = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ev = {
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
function eg(e, t = 160) {
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
function e_(e, t) {
    let n = Math.floor(Date.now() / 1000), r = `ticket=${e.ticket}&path=${Z}${t}&timestamp=${n}`, i = C(G(BigInt(`0x${e.key}`), A(r)));
    return C(A(JSON.stringify({
        ts_sign: e.tsSign,
        req_content: "ticket,path,timestamp",
        req_sign: i,
        timestamp: n
    })));
}
let ek = null;
function ex(e) {
    return H(function*(e, t = {}) {
        var n, r;
        let i = es();
        if (!i) throw Error("未登录");
        let l = yield i.expiresAt - Date.now() > 3600000 ? Promise.resolve(i) : ek || (ek = H(function*() {
            var e;
            let t = yield eo(`https://open.qishui.com${Z}/access/code/refresh/?${ei({
                access_code: i.accessCode
            })}`);
            eu(t.data);
            let n = (null == (e = t.data) ? void 0 : e.data) || t.data, r = yield em(n, i.key, {
                cert: i.cert
            }), l = V(Q({}, i, r), {
                accessCode: String(n.access_code || i.accessCode)
            });
            return ef(et, l), l;
        })().finally(()=>{
            ek = null;
        })), o = yield eo(`https://open.douyin.com${Z}${e}?${ei({})}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "access-token": l.ticket,
                "bd-ticket-guard-version": "1",
                "bd-ticket-guard-client-cert": l.cert,
                "bd-ticket-guard-client-data": e_(l, e)
            },
            data: JSON.stringify(V(Q({}, t), {
                common_params: {
                    user_id: l.userId
                }
            }))
        });
        return eu(o.data), null != (n = null == (r = o.data) ? void 0 : r.data) ? n : {};
    }).apply(this, arguments);
}
function e$(e = 50) {
    return H(function*() {
        let t = [], n = "";
        for(let l = 0; l < 4; l++){
            var r, i;
            let l = yield ex("/me/playlist/", {
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
function eS(e, t = "", n = 200) {
    return H(function*() {
        let r, i = [], l = "", o = "0";
        for(let m = 0; m < 8 && i.length < n; m++){
            var a, u, c, f, d, s, p, y;
            let m = yield ex("/playlist/detail/", {
                playlist_id: e,
                owner_id: t,
                count: 100,
                cursor: o,
                type: null
            });
            r = null != r ? r : m.playlist;
            let h = Array.isArray(m.media_entities) ? m.media_entities : [];
            for (let e of h){
                let t = null != (u = null != (c = null != (f = e.track_entity) ? f : null == (d = e.entity) ? void 0 : d.track) ? c : null == (p = e.entity) || null == (s = p.media) ? void 0 : s.track_entity) ? u : e.base_info ? e : null;
                if ((null == t || null == (y = t.base_info) ? void 0 : y.id) && i.push(t), i.length >= n) break;
            }
            if (!h.length) {
                for (let e of k(m))i.push(e);
                i.length || (l = Object.keys(m).join(","));
            }
            let v = String(null != (a = m.next_cursor) ? a : "");
            if (!m.has_more || !v || v === o) break;
            o = v;
        }
        return Q({
            playlist: r,
            entities: i
        }, l ? {
            shape: l
        } : {});
    })();
}
function ew(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function eO(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                ew(l, r, i, o, a, "next", e);
            }
            function a(e) {
                ew(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function ej(e) {
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
function eP(e, t) {
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
let eA = "qishui:";
function eD(e) {
    return `${eA}track:${e}`;
}
function eC(e, t = "") {
    return `${eA}playlist:${e}:${t}`;
}
function eN(e) {
    return `${eA}scene:${e}`;
}
function eE(e) {
    let t = String(null != e ? e : "").trim();
    if (!t.startsWith(eA)) return null;
    let [n, r, i = ""] = t.slice(eA.length).split(":");
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
function eq(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    let t = Math.round(e / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function eI(e) {
    let t = [
        e.artists.join(" / "),
        e.album,
        eq(e.durationMs)
    ].filter(Boolean).join(" · "), n = Math.round(e.durationMs / 1000);
    return ej({
        id: e.id,
        type: "url",
        mediaType: "song",
        link: eD(e.id),
        title: e.name
    }, t ? {
        subtitle: t
    } : {}, n > 0 ? {
        duration: n,
        durationText: eq(e.durationMs)
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {});
}
let eM = new Map();
function ez(e) {
    var t;
    let n = [
        e.trackCount ? `${e.trackCount} 首` : "",
        e.albumCount ? `${e.albumCount} 张专辑` : ""
    ].filter(Boolean).join(" · ");
    return ej({
        id: e.id,
        type: "person",
        mediaType: "person",
        link: (t = e.id, `${eA}artist:${t}`),
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
function eT(e) {
    var t, n;
    let r = [
        e.artists.join(" / "),
        e.trackCount ? `${e.trackCount} 首` : "",
        null != (t = e.releaseDate) ? t : ""
    ].filter(Boolean).join(" · ");
    return ej({
        id: e.id,
        type: "url",
        mediaType: "album",
        link: (n = e.id, `${eA}album:${n}`),
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
function eB(e, t = 8) {
    return eO(function*() {
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
        return (yield Promise.all(n.map((e)=>eO(function*() {
                try {
                    let { album: t } = yield b(e.id);
                    return g(t);
                } catch (t) {
                    return {
                        id: e.id,
                        name: e.name,
                        trackCount: 0,
                        artists: []
                    };
                }
            })()))).filter((e)=>e.id).map(eT);
    })();
}
function eU(e, t = 30) {
    return eO(function*() {
        return (yield w(null, t, e)).map((e)=>eI(P(e)));
    })();
}
function eR(e) {
    return !Number.isFinite(e) || e <= 0 ? "" : e >= 100000000 ? `${(e / 100000000).toFixed(1)}亿` : e >= 10000 ? `${(e / 10000).toFixed(1)}万` : String(e);
}
function eL(e) {
    var t, n, r, i, l, o, a, c, f;
    let d = null != (t = e.base_info) ? t : {}, s = u(null == (a = e.display_info) ? void 0 : a.url_cover), p = eR(Number(null != (n = null == (c = e.stats) ? void 0 : c.count_collected) ? n : 0)), y = "number" == typeof e.resource_cnt ? e.resource_cnt : Number(null != (r = null == (f = e.resource_cnt) ? void 0 : f.track_cnt) ? r : 0), m = [
        p ? `${p} 收藏` : "",
        y ? `${y} 首` : ""
    ].filter(Boolean).join(" · ");
    return ej({
        id: `playlist-${d.id}`,
        type: "url",
        mediaType: "playlist",
        link: eC(String(d.id), String(null != (i = d.owner_id) ? i : "")),
        title: String(null != (l = null != (o = d.title) ? o : d.name) ? l : "歌单")
    }, m ? {
        subtitle: m
    } : {}, s ? {
        posterPath: s,
        coverUrl: s
    } : {});
}
function eW(e, t = 10) {
    return eO(function*() {
        return (yield m(e, t)).map(eL);
    })();
}
let eF = /歌手|歌曲|热门|榜单|合集|未知|^\s*$/;
function eJ(e) {
    return eO(function*() {
        let [n, r] = yield Promise.all([
            t(function*() {
                var t;
                return v(null != (t = (yield s("/artist/detail/", {
                    artist_id: e
                })).artist_info) ? t : {});
            })(),
            function(e, n = 50) {
                return t(function*() {
                    let t = yield s("/artist/tracks/", {
                        artist_id: e,
                        count: n,
                        cursor: "0"
                    });
                    return Array.isArray(t.tracks) ? t.tracks : [];
                })();
            }(e)
        ]), i = r.map((e)=>eI(P(e))), l = [
            i.length ? `${i.length} 首热门` : "",
            n.albumCount ? `${n.albumCount} 张专辑` : ""
        ].filter(Boolean).join(" · ");
        return eP(ej({}, ez(n), l ? {
            subtitle: l
        } : {}, n.intro ? {
            description: n.intro.slice(0, 300)
        } : {}), {
            tracks: i
        });
    })();
}
let eY = (e)=>e.filter((t, n)=>e.indexOf(t) === n), eG = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, eK = /^\[(\d+),(\d+)\](.*)$/, eH = /<\d+,\d+(?:,\d+)?>/g;
function eQ(e) {
    let t = [];
    for (let n of String(null != e ? e : "").split(/\r?\n/)){
        let e = n.trim();
        if (!e) continue;
        let r = eG.exec(e);
        if (r) {
            let [, e, n, i = "0", l] = r, o = 60000 * Number(e) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            t.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = eK.exec(e);
        i && t.push({
            ms: Number(i[1]),
            text: i[3].replace(eH, "").trim()
        });
    }
    return t;
}
function eV(e) {
    let t = Math.floor(e / 60000), n = Math.floor(e % 60000 / 1000), r = Math.floor(e % 1000 / 10);
    return `[${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function eZ(e) {
    return eQ(e).map((e)=>`${eV(e.ms)}${e.text}`).join("\n");
}
let eX = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function e0(e) {
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
            n += eX[l >> 18 & 63] + eX[l >> 12 & 63], n += e + 1 < t.length ? eX[l >> 6 & 63] : "=", n += e + 2 < t.length ? eX[63 & l] : "=";
        }
        return n;
    }(e)}`;
}
let e1 = `${eA}login:0`;
function e2(e) {
    let t = [
        e.vip ? "VIP" : "普通账号",
        e.userId
    ].filter(Boolean).join(" · ");
    return eP(ej(eP(ej({
        id: "my-account",
        type: "url",
        link: e1,
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
function e3(e, t, n) {
    return ej({
        id: "my-notice",
        type: "url",
        link: e1,
        title: e
    }, t ? {
        subtitle: t
    } : {}, n ? {
        description: n
    } : {});
}
function e6(e, t) {
    return {
        id: "login-qr",
        type: "url",
        link: e1,
        title: t,
        subtitle: "点开这一条看大图，用汽水音乐 App 扫码",
        description: "二维码 5 分钟内有效。登录态只保存在本机，不会上传到任何服务器。",
        posterPath: e,
        detailPoster: e,
        coverUrl: e
    };
}
function e5() {
    return e3("点这里登录汽水音乐", "登录后才会显示账号里的歌单", "汽水音乐的账号数据要扫码授权才能读，接口不给匿名访问。");
}
function e8() {
    return eO(function*() {
        let e = es();
        if (e) return [
            e2(e)
        ];
        let t = ey();
        if (t) {
            let e = yield H(function*() {
                var e, t, n, r;
                let i = ey();
                if (!i) return {
                    state: "expired"
                };
                let l = null == (t = (yield eo(`https://open.douyin.com/oauth/check_qrcode/?${ep()}&token=${encodeURIComponent(i.token)}&timestamp=${Date.now()}`)).data) ? void 0 : t.data, o = String(null != (e = null == l ? void 0 : l.status) ? e : "").toLowerCase(), a = ev[o];
                return "expired" === a ? (ed(en), {
                    state: "expired"
                }) : "waiting" === a || "scanned" === a ? {
                    state: a
                } : "confirmed" !== a ? {
                    state: "unknown",
                    debug: `未知扫码状态「${o || "空"}」 ${eg(l)}`
                } : (n = l, r = i, H(function*() {
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
                                debug: `没拿到授权码 · ${a.join(" · ")} · ${eg(n, 200)}`
                            };
                            let t = null;
                            for (let n of [
                                "auth_code",
                                "code"
                            ])try {
                                let t = yield eo(`https://open.qishui.com${Z}/access/code/get/?${ei({
                                    [n]: String(e)
                                })}`);
                                a.push(`code/get(${n}) ${t.status} ${eg(t.data)}`), eu(t.data), o = (null == (l = t.data) ? void 0 : l.data) || t.data;
                                break;
                            } catch (e) {
                                t = e;
                            }
                            if (!o) throw t instanceof Error ? t : Error("授权码兑换失败");
                        }
                        if (!(null == o ? void 0 : o.access_code)) throw Error("access_code 缺失");
                        let u = yield em(o, r.key, {
                            csr: r.csr
                        });
                        a.push(`ticket ok expires=${u.expiresAt}`);
                        let c = yield eo(`https://open.douyin.com${Z}/me/info/?${ei({})}`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",
                                "access-token": u.ticket,
                                "bd-ticket-guard-version": "1",
                                "bd-ticket-guard-client-cert": u.cert,
                                "bd-ticket-guard-client-data": e_(u, "/me/info/")
                            },
                            data: JSON.stringify({
                                common_params: {}
                            })
                        });
                        eu(c.data);
                        let f = null == (i = c.data) || null == (t = i.data) ? void 0 : t.my_info;
                        if (a.push(`me/info ${c.status} ${eg(c.data)}`), !(null == f ? void 0 : f.id)) throw Error("账号信息读取失败");
                        let d = V(Q({}, u), {
                            userId: String(f.id),
                            nickname: String(null != (e = f.nickname) ? e : ""),
                            avatar: String(f.medium_avatar_url || f.avatar_url || ""),
                            vip: !0 === f.is_vip
                        });
                        if (ef(et, d), ed(en), !es()) return {
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
                e2(e.account)
            ];
            if ("unknown" === e.state) {
                var n;
                return [
                    e3("登录没走完（把这段发我）", null != (n = e.debug) ? n : "没有详情")
                ];
            }
            if ("expired" !== e.state) return [
                e6(t.qr, "scanned" === e.state ? "已扫码，请在手机上点确认" : "用汽水音乐 App 扫码登录")
            ];
        }
        return [
            e6((yield H(function*() {
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
                        t = t.concat(M(r.concat([
                            255 & n
                        ]))), n++;
                    }
                    return E(t) % (0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n - 1n) + 1n;
                }(), r = function(e) {
                    var t;
                    let n, r = W(L({
                        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
                        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
                        z: 1n
                    }, e)), i = (e, t)=>F(0x31, F(0x30, Y(e), F(0x0c, A(t)))), l = F(0x30, i("550403", "bd-ticket-guard"), i("55040b", ""), i("55040a", "")), o = F(0x30, F(0x02, [
                        0
                    ]), l, (n = [
                        0x04,
                        ...N(r.x, 32),
                        ...N(r.y, 32)
                    ], F(0x30, F(0x30, Y("2a8648ce3d0201"), Y("2a8648ce3d030107")), F(0x03, [
                        0x00,
                        ...n
                    ]))), F(0xa0)), a = G(e, o), u = F(0x30, o, F(0x30, Y("2a8648ce3d040302")), F(0x03, [
                        0x00,
                        ...a
                    ])), c = `-----BEGIN CERTIFICATE REQUEST-----\n${null == (t = C(u).match(/.{1,64}/g)) ? void 0 : t.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
                    return C(A(c));
                }(n), i = null == (e = (yield eo(`https://open.douyin.com/oauth/get_qrcode/?${ep()}`)).data) ? void 0 : e.data;
                if (!(null == i ? void 0 : i.token) || !(null == i ? void 0 : i.qrcode_index_url)) throw Error("二维码生成失败，请稍后重试");
                let l = Date.now() + 300000, o = yield (t = String(i.qrcode_index_url), H(function*() {
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
                return ef(en, {
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
function e4(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function e7(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                e4(l, r, i, o, a, "next", e);
            }
            function a(e) {
                e4(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
WidgetMetadata = {
    id: "qishui.music",
    title: "汽水音乐",
    description: "汽水音乐插件，基于车机开放接口：扫码登录后可用我的歌单与最近播放，另有每日推荐、新歌、猜你喜欢、专辑、歌单、场景、歌手、搜索、播放与时间轴歌词。免费曲目可完整播放，会员曲目只有试听片段",
    author: "self-hosted",
    version: "0.2.8",
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
}, loadLogin = ()=>e7(function*() {
        return e8();
    })(), loadMyPlaylists = ()=>e7(function*() {
        return function(e = 50) {
            return eO(function*() {
                if (!es()) return [
                    e5()
                ];
                try {
                    let t = yield e$(e);
                    if (!t.length) return [
                        e3("还没有歌单", "账号里没有自建或收藏的歌单")
                    ];
                    return t.map(eL);
                } catch (e) {
                    var t;
                    return [
                        e3("歌单读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), loadRecentPlayed = ()=>e7(function*() {
        return function(e = 50) {
            return eO(function*() {
                if (!es()) return [
                    e5()
                ];
                try {
                    let t = yield function(e = 50) {
                        return H(function*() {
                            let t = [], n = "";
                            for(let l = 0; l < 8 && t.length < e; l++){
                                var r, i;
                                let l = yield ex("/me/recent-played/", {
                                    count: e,
                                    cursor: n,
                                    media_type: "track",
                                    scene: "me_tab"
                                });
                                for (let n of Array.isArray(l.media) ? l.media : []){
                                    let r = null == n ? void 0 : n.media;
                                    if ((null == r ? void 0 : r.track_entity) && (t.push(V(Q({}, r.track_entity), {
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
                        e3("还没有播放记录", "在汽水音乐里听几首歌再回来")
                    ];
                    return t.map((e)=>eI(P(e)));
                } catch (e) {
                    var t;
                    return [
                        e3("最近播放读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), logoutAccount = ()=>e7(function*() {
        return ed(et), ed(en), {
            message: "已退出登录",
            refresh: !0
        };
    })(), loadScenes = ()=>e7(function*() {
        return eO(function*() {
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
            })()).map((e)=>(eM.set(e.id, e.name), ej({
                    id: `scene-${e.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: eN(e.id),
                    title: e.name
                }, e.group ? {
                    subtitle: e.group
                } : {}, e.cover ? {
                    posterPath: e.cover,
                    coverUrl: e.cover
                } : {})));
        })();
    })(), loadRecommend = ()=>e7(function*() {
        return eO(function*() {
            return (yield w(null, 30)).map((e)=>eI(P(e)));
        })();
    })(), loadDaily = ()=>e7(function*() {
        return eU("daily", 30);
    })(), loadFresh = ()=>e7(function*() {
        return eU("fresh", 30);
    })(), loadFamiliar = ()=>e7(function*() {
        return eU("familiar", 30);
    })(), loadAlbums = ()=>e7(function*() {
        return function(e = 10) {
            return eO(function*() {
                return eB((yield w(null, 30, "daily")), e);
            })();
        }(10);
    })(), loadArtists = (e)=>e7(function*() {
        return function() {
            return eO(function*(e = {}) {
                var t, n;
                let r = String(null != (t = null != (n = e.peopleId) ? n : e.id) ? t : "").trim();
                return /^\d{1,30}$/.test(r) ? [
                    (yield eJ(r))
                ] : function(e = 18) {
                    return eO(function*() {
                        let t = yield Promise.all([
                            "华语",
                            "粤语",
                            "欧美"
                        ].map((e)=>h(e, 10).catch(()=>[]))), n = new Set(), r = [];
                        for (let i of t.flat()){
                            let t = v(i);
                            if (!(!t.id || n.has(t.id) || eF.test(t.name)) && !(t.name.length > 20) && !(t.trackCount < 1) && (n.add(t.id), r.push(ez(t)), r.length >= e)) break;
                        }
                        return r;
                    })();
                }();
            }).apply(this, arguments);
        }(e);
    })(), loadHotPlaylists = ()=>e7(function*() {
        return eW("热歌", 10);
    })(), loadClassicPlaylists = ()=>e7(function*() {
        return eW("经典老歌", 10);
    })(), loadSubtitle = (e)=>e7(function*() {
        return eO(function*() {
            var t, n, r, i, l;
            let o, a = e.link ? eE(e.link) : null, u = (null == a ? void 0 : a.kind) === "track" ? a.id : /^\d{1,30}$/.test(String(null != (t = e.id) ? t : "")) ? String(e.id) : "";
            if (!u) return [];
            let { original: c, translation: f } = {
                original: String(null != (n = null == (o = null == (i = (yield O(u)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((e)=>{
                    var t;
                    return String(null != (t = null == e ? void 0 : e.content) ? t : "");
                }).find((e)=>e.trim().length > 0)
            }, d = [];
            if (c && f) {
                let e, t = (e = new Map(eQ(f).map((e)=>[
                        e.ms,
                        e.text
                    ])), eQ(c).map((t)=>{
                    let n = e.get(t.ms), r = n && n !== t.text ? `${t.text} / ${n}` : t.text;
                    return `${eV(t.ms)}${r}`;
                }).join("\n"));
                t && d.push({
                    id: `qishui:lyric:${u}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: e0(t)
                });
            }
            let s = c ? eZ(c) : "", p = f ? eZ(f) : "";
            return s && d.push({
                id: `qishui:lyric:${u}:original`,
                title: "原文歌词",
                lang: "und",
                url: e0(s)
            }), p && d.push({
                id: `qishui:lyric:${u}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: e0(p)
            }), d;
        })();
    })(), search = (e)=>e7(function*() {
        return eO(function*() {
            var t, n;
            let r = String(null != (t = e.keyword) ? t : "").trim();
            if (!r) return [];
            let i = String(null != (n = e.kind) ? n : "all");
            if ("artists" === i) return (yield h(r, 20)).map((e)=>ez(v(e)));
            if ("playlists" === i) return eW(r, 30);
            if ("albums" === i) return eB((yield y(r, 40)), 12);
            if ("songs" === i || "tracks" === i) return (yield y(r, 40)).map((e)=>eI(P(e)));
            let [l, o, a] = yield Promise.all([
                h(r, 12).catch(()=>[]),
                y(r, 20).catch(()=>[]),
                m(r, 8).catch(()=>[])
            ]), u = yield eB(o, 6).catch(()=>[]);
            return [
                ...l.map((e)=>ez(v(e))),
                ...u,
                ...o.map((e)=>eI(P(e))),
                ...a.map(eL)
            ];
        })();
    })(), loadDetail = (e)=>e7(function*() {
        return eO(function*() {
            var t, n, r, i, l;
            let o = eE(e);
            if (!o) throw Error(`无法识别的链接：${e}`);
            return "track" === o.kind ? (t = o.id, eO(function*() {
                var e, n;
                let r;
                try {
                    r = yield O(t);
                } catch (e) {
                    return e3("这首歌打不开", `id ${t}`, String(null != (n = null == e ? void 0 : e.message) ? n : e).slice(0, 100));
                }
                let i = P(r), l = null != (e = yield j(r).catch(()=>null)) ? e : yield eO(function*() {
                    var e;
                    let t = `${i.name} ${null != (e = i.artists[0]) ? e : ""}`.trim();
                    if (!t) return null;
                    let n = yield y(t, 6).catch(()=>[]), r = (e)=>String(e).replace(/[\s\-—_·.,，。!！?？()（）[\]【】]/g, "").toLowerCase();
                    for (let e of n){
                        if (r(P(e).name) !== r(i.name)) continue;
                        let t = yield j(e).catch(()=>null);
                        if (null == t ? void 0 : t.url) return t;
                    }
                    return null;
                })();
                if (!(null == l ? void 0 : l.url)) return eP(ej({}, eI(i)), {
                    link: eD(t),
                    description: "汽水没给这首歌播放地址（导入或已下架），换一首试试。"
                });
                let o = [
                    eq(i.durationMs),
                    l.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return eP(ej({}, eI(i), o ? {
                    description: o
                } : {}), {
                    videoUrl: l.url
                });
            })()) : "scene" === o.kind ? (n = o.id, eO(function*() {
                var e;
                let t = (yield w(n, 40)).map((e)=>eI(P(e)));
                return {
                    id: `scene-${n}`,
                    type: "url",
                    mediaType: "playlist",
                    link: eN(n),
                    title: null != (e = eM.get(n)) ? e : "场景推荐",
                    description: `${t.length} 首`,
                    tracks: t
                };
            })()) : "artist" === o.kind ? eJ(o.id) : "album" === o.kind ? (r = o.id, eO(function*() {
                let { album: e, entities: t } = yield b(r), n = g(e);
                return eP(ej({}, eT(n), n.intro ? {
                    description: n.intro.slice(0, 300)
                } : {}), {
                    tracks: t.map((e)=>eI(P(e)))
                });
            })()) : "login" === o.kind ? (yield e8())[0] : (i = o.id, l = o.ownerId, eO(function*() {
                var e, t, n, r, o, a, c, f;
                let d = [
                    [
                        "匿名",
                        ()=>x(i, l)
                    ]
                ];
                l && d.push([
                    "匿名·无作者",
                    ()=>x(i, "")
                ]);
                let s = es();
                s && (d.push([
                    "账号票据",
                    ()=>eS(i, l)
                ]), s.userId && s.userId !== l && d.push([
                    "账号票据·本人",
                    ()=>eS(i, s.userId)
                ]));
                let p = [], y = null, m = (e, t)=>eO(function*() {
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
                let h = [], v = "", g = "";
                if (!y) {
                    let e = yield eO(function*() {
                        var e, t, n, r, l, o, a, u, c;
                        let f = {
                            ids: [],
                            owners: [],
                            keys: [],
                            dump: "",
                            title: "",
                            count: 0
                        };
                        if (!es()) return f;
                        let d = (yield e$(50).catch(()=>[])).find((e)=>{
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
                            ids: eY(s.filter((e)=>e !== i)).slice(0, 3),
                            owners: eY(p.filter((e)=>e !== i)).slice(0, 3),
                            keys: Object.keys(null != (e = d.base_info) ? e : {}),
                            dump: JSON.stringify(null != (t = d.base_info) ? t : d).slice(0, 420),
                            title: String(null != (n = null != (r = null == (a = d.base_info) ? void 0 : a.title) ? r : null == (u = d.base_info) ? void 0 : u.name) ? n : ""),
                            count: Number(null != (l = null != (o = null == (c = d.resource_cnt) ? void 0 : c.track_cnt) ? o : d.resource_cnt) ? l : 0) || 0
                        };
                    })();
                    h = e.keys, v = e.dump, g = e.title;
                    let t = 6;
                    for (let n of [
                        i,
                        ...e.ids
                    ]){
                        for (let r of eY([
                            l,
                            ...e.owners
                        ]))if (t-- <= 0 || (n !== i || r !== l) && (yield m(`匿名 ${n.slice(-6)}/${r.slice(-6) || "-"}`, ()=>x(n, r)))) break;
                        if (y) break;
                    }
                }
                if (!y) {
                    let e = h.length ? ` · 字段:${h.join(",")}` : " · 没取到歌单行";
                    return {
                        id: i,
                        type: "url",
                        mediaType: "playlist",
                        link: eC(i, l),
                        title: g || "这个歌单读不到",
                        subtitle: "车机接口不给曲目",
                        description: `接口反馈：${p.join(" / ").slice(0, 180)}${e}${v ? ` · 行数据:${v}` : ""}`,
                        tracks: [
                            {
                                id: "playlist-blocked",
                                type: "url",
                                mediaType: "song",
                                link: e1,
                                title: "这个歌单读不到曲目",
                                subtitle: "导入或私密的歌单只有汽水 App 内能读，点这里看登录状态"
                            }
                        ]
                    };
                }
                let { playlist: b, entities: _ } = y, k = _.map((e)=>eI(P(e))), $ = null != (e = null == b ? void 0 : b.base_info) ? e : {}, S = u(null == b || null == (o = b.display_info) ? void 0 : o.url_cover), w = null == b || null == (c = b.relation_info) || null == (a = c.owner) ? void 0 : a.name, O = eR(Number(null != (t = null == b || null == (f = b.stats) ? void 0 : f.count_collected) ? t : 0)), j = [
                    w,
                    O ? `${O} 收藏` : "",
                    k.length ? `${k.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return eP(ej({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: eC(i, l),
                    title: String(null != (n = null != (r = $.title) ? r : $.name) ? n : "歌单")
                }, j ? {
                    subtitle: j
                } : {}, $.desc ? {
                    description: String($.desc).slice(0, 200)
                } : {}, S ? {
                    posterPath: S,
                    coverUrl: S
                } : {}), {
                    tracks: k
                });
            })());
        })();
    })();
