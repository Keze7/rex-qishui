function e(e) {
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
let t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function n(e) {
    let n = "";
    for(let r = 0; r < e.length; r += 3){
        let i = e[r] << 16 | (r + 1 < e.length ? e[r + 1] : 0) << 8 | (r + 2 < e.length ? e[r + 2] : 0);
        n += t[i >> 18 & 63] + t[i >> 12 & 63], n += r + 1 < e.length ? t[i >> 6 & 63] : "=", n += r + 2 < e.length ? t[63 & i] : "=";
    }
    return n;
}
function r(e, t) {
    let n = Array(t).fill(0), r = e;
    for(let e = t - 1; e >= 0; e--)n[e] = Number(255n & r), r >>= 8n;
    return n;
}
function i(e) {
    let t = 0n;
    for (let n of e)t = t << 8n | BigInt(n);
    return t;
}
let l = [
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
function o(e, t) {
    return e >>> t | e << 32 - t;
}
function a(e) {
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
            let t = o(i[e - 15], 7) ^ o(i[e - 15], 18) ^ i[e - 15] >>> 3, n = o(i[e - 2], 17) ^ o(i[e - 2], 19) ^ i[e - 2] >>> 10;
            i[e] = i[e - 16] + t + i[e - 7] + n >>> 0;
        }
        let [r, a, u, c, f, d, s, p] = t;
        for(let e = 0; e < 64; e++){
            let t = p + (o(f, 6) ^ o(f, 11) ^ o(f, 25)) + (f & d ^ ~f & s) + l[e] + i[e] >>> 0, n = (o(r, 2) ^ o(r, 13) ^ o(r, 22)) + (r & a ^ r & u ^ a & u) >>> 0;
            p = s, s = d, d = f, f = c + t >>> 0, c = u, u = a, a = r, r = t + n >>> 0;
        }
        t[0] = t[0] + r >>> 0, t[1] = t[1] + a >>> 0, t[2] = t[2] + u >>> 0, t[3] = t[3] + c >>> 0, t[4] = t[4] + f >>> 0, t[5] = t[5] + d >>> 0, t[6] = t[6] + s >>> 0, t[7] = t[7] + p >>> 0;
    }
    let a = [];
    for (let e of t)a.push(e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e);
    return a;
}
function u(e, t) {
    let n = e.length > 64 ? a(e) : e.slice();
    for(; n.length < 64;)n.push(0);
    let r = n.map((e)=>0x36 ^ e).concat(t), i = n.map((e)=>0x5c ^ e).concat(a(r));
    return a(i);
}
let c = {
    x: 0n,
    y: 1n,
    z: 0n
};
function f(e, t = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn) {
    let n = e % t;
    return n < 0n ? n + t : n;
}
function d(e, t) {
    let n = f(e, t);
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
    return f(i, t);
}
function s(e) {
    if (0n === e.z) return c;
    let t = f(e.x * e.x), n = f(e.y * e.y), r = f(n * n), i = f(2n * (f((e.x + n) * (e.x + n)) - t - r)), l = f(e.z * e.z), o = f(3n * t - 3n * f(l * l)), a = f(o * o - 2n * i), u = f(o * (i - a) - 8n * r);
    return {
        x: a,
        y: u,
        z: f(2n * e.y * e.z)
    };
}
function p(e, t) {
    let n = c, r = e, i = t;
    for(; i > 0n;)1n & i && (n = function(e, t) {
        if (0n === e.z) return t;
        if (0n === t.z) return e;
        let n = f(e.z * e.z), r = f(t.z * t.z), i = f(e.x * r), l = f(t.x * n), o = f(e.y * t.z * r), a = f(t.y * e.z * n);
        if (i === l) return o === a ? s(e) : c;
        let u = f(l - i), d = f(4n * u * u), p = f(u * d), m = f(2n * (a - o)), y = f(i * d), h = f(m * m - p - 2n * y), v = f(m * (y - h) - 2n * o * p);
        return {
            x: h,
            y: v,
            z: f(((e.z + t.z) * (e.z + t.z) - n - r) * u)
        };
    }(n, r)), r = s(r), i >>= 1n;
    return n;
}
function m(e) {
    if (0n === e.z) throw Error("point at infinity");
    let t = d(e.z, 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn), n = f(t * t);
    return {
        x: f(e.x * n),
        y: f(e.y * n * t)
    };
}
function y(e, ...t) {
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
function h(e) {
    let t = 0;
    for(; t < e.length - 1 && 0 === e[t];)t++;
    let n = e.slice(t);
    return y(0x02, 0x80 & n[0] ? [
        0,
        ...n
    ] : n);
}
function v(e) {
    return y(0x06, function(e) {
        let t = [];
        for(let n = 0; n < e.length; n += 2)t.push(parseInt(e.slice(n, n + 2), 16));
        return t;
    }(e));
}
function g(e, t) {
    let n = i(a(t)), l = r(e, 32), o = r(f(n, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), 32), c = Array(32).fill(1), s = Array(32).fill(0);
    s = u(s, c.concat([
        0
    ], l, o)), c = u(s, c), s = u(s, c.concat([
        1
    ], l, o)), c = u(s, c);
    let v = 0n;
    for(; !((v = i(c = u(s, c))) > 0n) || !(v < 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);)s = u(s, c.concat([
        0
    ])), c = u(s, c);
    let g = f(m(p({
        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
        z: 1n
    }, v)).x, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n), _ = f(d(v, 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n) * (n + g * e), 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n);
    if (0n === g || 0n === _) throw Error("invalid signature");
    return y(0x30, h(r(g, 32)), h(r(_, 32)));
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
function b(e) {
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
function x(e) {
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
function k(e, t) {
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
let S = "/api/luna/v1/platform", $ = "aw4bbxfujo741d09", w = "1270651532221750165", O = "qishui:account", P = "qishui:login", j = {
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
function D(e) {
    let t = x(k(x({}, j), {
        device_id: w,
        did: w,
        iid: w,
        vehicle_id: `qishui-${w}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    }), e), n = [];
    for(let e in t)n.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`);
    return n.join("&");
}
function A(e) {
    let t = [];
    for(let n in e)t.push(`${encodeURIComponent(n)}=${encodeURIComponent(e[n])}`);
    return t.join("&");
}
function C(e) {
    return b(function*(e, t = {}) {
        var n, r, i, l;
        let o = yield Widget.http.request(k(x({
            url: e,
            method: null != (n = t.method) ? n : "GET",
            headers: x({
                "user-agent": "LunaOpenSDK/1.0.10"
            }, null != (r = t.headers) ? r : {})
        }, void 0 !== t.data ? {
            data: t.data
        } : {}), {
            timeout: 20
        }));
        return {
            data: "string" == typeof o.data ? N(o.data) : o.data,
            status: null != (i = o.statusCode) ? i : 200,
            headers: null != (l = o.headers) ? l : {}
        };
    }).apply(this, arguments);
}
function N(e) {
    try {
        return JSON.parse(e);
    } catch (t) {
        return {
            raw: e
        };
    }
}
function E(e) {
    var t, n, r;
    let i = Number(null != (t = null != (n = null == e ? void 0 : e.err_no) ? n : null == e || null == (r = e.data) ? void 0 : r.error_code) ? t : 0);
    if (i) throw Error(`汽水账号接口错误 ${i}${(null == e ? void 0 : e.err_msg) ? `：${e.err_msg}` : ""}`);
}
function q(e) {
    try {
        var t, n;
        return null != (t = null == (n = Widget.storage) ? void 0 : n.get(e)) ? t : null;
    } catch (e) {
        return null;
    }
}
function M(e, t) {
    try {
        var n;
        null == (n = Widget.storage) || n.set(e, t);
    } catch (e) {}
}
function I(e) {
    try {
        var t;
        null == (t = Widget.storage) || t.remove(e);
    } catch (e) {}
}
function z() {
    let e = q(O);
    return e && e.ticket && e.key ? e : null;
}
function B() {
    let e = {
        aid: "1128",
        client_key: $,
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
function T() {
    let e = q(P);
    return !e || !e.qr || e.expiresAt < Date.now() ? null : e;
}
function U(t, r, i) {
    return b(function*() {
        var l, o, a;
        if (!(null == t ? void 0 : t.access_code)) throw Error("登录凭据缺失");
        let u = `https://open-client.douyin.com/passport/open/get_access_ticket/?${A({
            aid: "1128",
            client_key: $,
            device_platform: "android"
        })}`, c = yield C(u, {
            method: "POST",
            headers: x({
                "content-type": "application/x-www-form-urlencoded",
                "bd-ticket-guard-version": "1"
            }, i.csr ? {
                "bd-ticket-guard-client-csr": i.csr
            } : {
                "bd-ticket-guard-client-cert": null != (l = i.cert) ? l : ""
            }),
            data: A({
                access_code: String(t.access_code),
                open_id: String(t.open_id || t.open_uid || "")
            })
        });
        E(c.data);
        let f = function(e, t) {
            let n = t.toLowerCase();
            for(let t in e)if (t.toLowerCase() === n) return String(e[t]);
            return "";
        }(c.headers, "bd-ticket-guard-server-data");
        if (!f) throw Error("票据缺失，请重新扫码");
        let d = N(function(e) {
            let t = function(e) {
                let t = e.replace(/[^A-Za-z0-9+/]/g, ""), n = [];
                for(let e = 0; e < t.length; e += 4){
                    var r;
                    let i = R.indexOf(t[e]) << 18 | R.indexOf(null != (r = t[e + 1]) ? r : "A") << 12 | (t[e + 2] ? R.indexOf(t[e + 2]) : 0) << 6 | (t[e + 3] ? R.indexOf(t[e + 3]) : 0);
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
        }(f));
        if (!(null == d ? void 0 : d.ticket) || !(null == d ? void 0 : d.client_cert)) throw Error("票据格式异常，请重新扫码");
        let s = String(d.client_cert), p = Number(null != (o = t.expires_time) ? o : 0), m = p > 1e12 ? p : p > 1e9 ? 1000 * p : p > 0 ? Date.now() + 1000 * p : Date.now() + 21600000;
        return {
            key: r,
            ticket: String(d.ticket),
            cert: s.includes("-----BEGIN") ? n(e(s)) : s,
            tsSign: String(null != (a = d.ts_sign) ? a : ""),
            accessCode: String(t.access_code),
            openId: String(t.open_id || t.open_uid || ""),
            expiresAt: m
        };
    })();
}
let R = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", L = {
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
function F(e, t = 160) {
    let n = "string" == typeof e ? e : JSON.stringify(null != e ? e : null);
    return n.length > t ? `${n.slice(0, t)}…` : n;
}
function W(e, t) {
    if ("string" != typeof e) return "";
    for (let n of e.split(/[?&]/)){
        let e = n.indexOf("=");
        if (e > 0 && n.slice(0, e) === t) return decodeURIComponent(n.slice(e + 1));
    }
    return "";
}
function J(t, r) {
    let i = Math.floor(Date.now() / 1000), l = `ticket=${t.ticket}&path=${S}${r}&timestamp=${i}`, o = n(g(BigInt(`0x${t.key}`), e(l)));
    return n(e(JSON.stringify({
        ts_sign: t.tsSign,
        req_content: "ticket,path,timestamp",
        req_sign: o,
        timestamp: i
    })));
}
let Y = null;
function G(e) {
    return b(function*(e, t = {}) {
        var n, r;
        let i = z();
        if (!i) throw Error("未登录");
        let l = yield i.expiresAt - Date.now() > 3600000 ? Promise.resolve(i) : Y || (Y = b(function*() {
            var e;
            let t = yield C(`https://open.qishui.com${S}/access/code/refresh/?${D({
                access_code: i.accessCode
            })}`);
            E(t.data);
            let n = (null == (e = t.data) ? void 0 : e.data) || t.data, r = yield U(n, i.key, {
                cert: i.cert
            }), l = k(x({}, i, r), {
                accessCode: String(n.access_code || i.accessCode)
            });
            return M(O, l), l;
        })().finally(()=>{
            Y = null;
        })), o = yield C(`https://open.douyin.com${S}${e}?${D({})}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "access-token": l.ticket,
                "bd-ticket-guard-version": "1",
                "bd-ticket-guard-client-cert": l.cert,
                "bd-ticket-guard-client-data": J(l, e)
            },
            data: JSON.stringify(k(x({}, t), {
                common_params: {
                    user_id: l.userId
                }
            }))
        });
        return E(o.data), null != (n = null == (r = o.data) ? void 0 : r.data) ? n : {};
    }).apply(this, arguments);
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
let Z = "/api/luna/v1/platform", X = "LunaOpenSDK/1.0.10", ee = "1270651532221750165", et = {
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
function en(e) {
    if (!e) return "";
    if ("string" == typeof e) return e;
    let t = Array.isArray(e.urls) && e.urls.length ? String(e.urls[0]) : "", n = e.uri ? String(e.uri) : "";
    if (!t || !n) return "";
    let r = t + n, i = e.template_prefix ? String(e.template_prefix) : "";
    return i ? `${r}~${i}-origin.image` : r;
}
function er(e = {}) {
    let t = V(Q({}, et), {
        device_id: ee,
        did: ee,
        iid: ee,
        vehicle_id: `qishui-${ee}`,
        _timestamp: String(Math.floor(Date.now() / 1000)),
        _nonce: String(Math.floor(9000 * Math.random()) + 1000)
    });
    for(let n in e)Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
    let n = [];
    for(let e in t)Object.prototype.hasOwnProperty.call(t, e) && n.push(`${encodeURIComponent(e)}=${encodeURIComponent(String(t[e]))}`);
    return n.join("&");
}
function ei(e) {
    return H(function*(e, t = {}) {
        var n, r;
        let i = yield Widget.http.request(V(Q({
            url: e,
            method: null != (n = t.method) ? n : "GET",
            headers: null != (r = t.headers) ? r : {}
        }, void 0 !== t.data ? {
            data: t.data
        } : {}), {
            timeout: 20
        }));
        return "string" == typeof i.data ? JSON.parse(i.data) : i.data;
    }).apply(this, arguments);
}
let el = null;
function eo(e) {
    return H(function*(e, t = {}) {
        for(let l = 0;; l++){
            var n, r, i;
            let o = yield function(e = !1) {
                return H(function*() {
                    if (!e && el && Date.now() - el.at < 1800000) return el.value;
                    let t = yield ei(`https://open.qishui.com${Z}/client/token/get/?${er({
                        trigger_type: "cold_start"
                    })}`, {
                        headers: {
                            "user-agent": X
                        }
                    });
                    if ("string" != typeof t.client_token || !t.client_token) throw Error(`汽水客户端令牌获取失败${t.err_msg ? `：${t.err_msg}` : ""}`);
                    return (el = {
                        value: t.client_token,
                        at: Date.now()
                    }).value;
                })();
            }(l > 0), a = yield ei(`https://open.douyin.com${Z}${e}?${er()}`, {
                method: "POST",
                headers: {
                    "user-agent": X,
                    "content-type": "application/json",
                    "access-token": o
                },
                data: JSON.stringify(V(Q({}, t), {
                    common_params: {}
                }))
            }), u = Number(null != (n = null != (r = a.err_no) ? r : null == (i = a.data) ? void 0 : i.error_code) ? n : 0);
            if (28001008 !== u || 0 !== l) {
                if (u) throw Error(`汽水接口错误 ${u}${a.err_msg ? `：${a.err_msg}` : ""}`);
                if (!a.data || "object" != typeof a.data) throw Error("汽水接口返回缺少 data");
                return a.data;
            }
        }
    }).apply(this, arguments);
}
function ea(e, t, n) {
    return H(function*() {
        var r;
        let i = `${Date.now()}-${Math.random().toString(16).slice(2)}`, l = yield eo("/search/", {
            q: t,
            cursor: "0",
            search_id: i,
            from_search_id: i,
            search_method: "input",
            search_type: e,
            search_scene: "normal",
            scene_name: "search",
            ab_param: "",
            last_viewed_media: {}
        }), o = Array.isArray(l.result_groups) ? l.result_groups : [], a = null != (r = o.find((t)=>t.id === `${e}s`)) ? r : o[0];
        return (Array.isArray(null == a ? void 0 : a.data) ? a.data : []).map((t)=>{
            var n;
            return null == (n = t.entity) ? void 0 : n[e];
        }).filter(Boolean).slice(0, n);
    })();
}
function eu(e, t = 30) {
    return H(function*() {
        return ea("track", e, t);
    })();
}
function ec(e, t = 20) {
    return H(function*() {
        return ea("playlist", e, t);
    })();
}
function ef(e, t = 20) {
    return H(function*() {
        return ea("artist", e, t);
    })();
}
function ed(e) {
    var t, n, r, i, l, o, a, u;
    let c = null != (t = null != (n = null == e ? void 0 : e.base_info) ? n : e) ? t : {};
    return {
        id: String(null != (r = c.id) ? r : ""),
        name: String(null != (i = null != (l = null != (o = c.full_display_name) ? o : c.simple_display_name) ? l : c.name) ? i : "未知歌手"),
        avatar: en(c.url_avatar),
        trackCount: Number(null != (a = c.count_tracks) ? a : 0),
        albumCount: Number(null != (u = c.count_albums) ? u : 0),
        intro: c.intro ? String(c.intro) : void 0
    };
}
function es(e) {
    var t, n, r, i, l, o, a, u, c;
    let f = null != (t = null == e ? void 0 : e.base_info) ? t : {}, d = Array.isArray(null == e || null == (a = e.related_info) ? void 0 : a.artist_links) ? e.related_info.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [], s = Number(null != (n = f.release_date) ? n : 0);
    return V(Q({
        id: String(null != (r = f.id) ? r : ""),
        name: String(null != (i = f.name) ? i : "未知专辑"),
        cover: en(null != (l = null == e || null == (u = e.display) ? void 0 : u.url_cover) ? l : null == e || null == (c = e.display_info) ? void 0 : c.url_cover),
        trackCount: Number(null != (o = f.count_tracks) ? o : 0),
        artists: d
    }, s > 0 ? {
        releaseDate: new Date(1000 * s).toISOString().slice(0, 10)
    } : {}), {
        intro: f.intro ? String(f.intro) : void 0
    });
}
function ep(e) {
    return H(function*() {
        var t;
        let n = yield eo("/album/detail/", {
            album_id: e
        }), r = Array.isArray(n.tracks) ? n.tracks : [];
        return {
            album: null != (t = n.album_info) ? t : {},
            entities: r
        };
    })();
}
let em = Promise.resolve(), ey = new Map();
function eh(e, t = 30, n = null) {
    let r = `${null != e ? e : ""}|${null != n ? n : ""}|${t}`, i = ey.get(r);
    if (i && Date.now() - i.at < 60000) return i.promise;
    let l = ()=>H(function*() {
            let r = yield eo("/feed/song-tab/", {
                played_media: [],
                is_first_request: !0,
                with_client_cache: !1,
                is_did_first_request: !1,
                count: t,
                feed_preference: {
                    scene_mode_id: null == e ? null : Number(e),
                    scene_mode_select_time: null == e ? null : Date.now(),
                    preference_mode: null != n ? n : null,
                    total_request_count: 1,
                    preference_mode_request_count: 1,
                    current_mode_request_count: 1
                }
            });
            return (Array.isArray(r.items) ? r.items : []).filter((e)=>!e.type || "track" === e.type).map((e)=>{
                var t, n, r, i, l;
                return null != (t = null != (n = null == (r = e.entity) ? void 0 : r.track) ? n : null == (l = e.entity) || null == (i = l.media) ? void 0 : i.track_entity) ? t : e;
            }).filter(Boolean);
        })(), o = em.then(l, l);
    return em = o.catch(()=>void 0), ey.set(r, {
        at: Date.now(),
        promise: o
    }), o.catch(()=>ey.delete(r)), ey.size > 20 && ey.clear(), o;
}
function ev(e) {
    return H(function*() {
        var t;
        let n = yield eo("/media/mget/", {
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
function eg(e) {
    var t, n, r, i, l, o, a, u, c, f;
    let d = null != (t = e.base_info) ? t : {}, s = null != (n = e.related_info) ? n : {}, p = Array.isArray(s.artist_links) ? s.artist_links.map((e)=>String(e.name || "")).filter(Boolean) : [];
    return {
        id: String(null != (r = null != (i = d.id) ? i : e.id) ? r : ""),
        name: String(null != (l = d.name) ? l : "未知歌曲"),
        artists: p.length ? p : [
            "未知歌手"
        ],
        album: (null == (u = s.album_link) ? void 0 : u.name) ? String(s.album_link.name) : void 0,
        cover: en(null == (c = e.display_info) ? void 0 : c.cover_url),
        durationMs: Number(null != (o = d.duration_ms) ? o : 0),
        vip: "1 == 1" !== String(null != (a = null == (f = e.commerce_info) ? void 0 : f.playable_condition) ? a : "1 == 1")
    };
}
function e_(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function eb(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                e_(l, r, i, o, a, "next", e);
            }
            function a(e) {
                e_(l, r, i, o, a, "throw", e);
            }
            o(void 0);
        });
    };
}
function ex(e) {
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
function ek(e, t) {
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
let eS = "qishui:";
function e$(e, t = "") {
    return `${eS}playlist:${e}:${t}`;
}
function ew(e) {
    return `${eS}scene:${e}`;
}
function eO(e) {
    let t = String(null != e ? e : "").trim();
    if (!t.startsWith(eS)) return null;
    let [n, r, i = ""] = t.slice(eS.length).split(":");
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
function eP(e) {
    if (!Number.isFinite(e) || e <= 0) return "";
    let t = Math.round(e / 1000);
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function ej(e) {
    var t;
    let n = [
        e.artists.join(" / "),
        e.album,
        eP(e.durationMs)
    ].filter(Boolean).join(" · "), r = Math.round(e.durationMs / 1000);
    return ex({
        id: e.id,
        type: "url",
        mediaType: "song",
        link: (t = e.id, `${eS}track:${t}`),
        title: e.name
    }, n ? {
        subtitle: n
    } : {}, r > 0 ? {
        duration: r,
        durationText: eP(e.durationMs)
    } : {}, e.cover ? {
        posterPath: e.cover,
        coverUrl: e.cover
    } : {});
}
let eD = new Map();
function eA(e) {
    var t;
    let n = [
        e.trackCount ? `${e.trackCount} 首` : "",
        e.albumCount ? `${e.albumCount} 张专辑` : ""
    ].filter(Boolean).join(" · ");
    return ex({
        id: e.id,
        type: "person",
        mediaType: "person",
        link: (t = e.id, `${eS}artist:${t}`),
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
function eC(e) {
    var t, n;
    let r = [
        e.artists.join(" / "),
        e.trackCount ? `${e.trackCount} 首` : "",
        null != (t = e.releaseDate) ? t : ""
    ].filter(Boolean).join(" · ");
    return ex({
        id: e.id,
        type: "url",
        mediaType: "album",
        link: (n = e.id, `${eS}album:${n}`),
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
function eN(e, t = 8) {
    return eb(function*() {
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
        return (yield Promise.all(n.map((e)=>eb(function*() {
                try {
                    let { album: t } = yield ep(e.id);
                    return es(t);
                } catch (t) {
                    return {
                        id: e.id,
                        name: e.name,
                        trackCount: 0,
                        artists: []
                    };
                }
            })()))).filter((e)=>e.id).map(eC);
    })();
}
function eE(e, t = 30) {
    return eb(function*() {
        return (yield eh(null, t, e)).map((e)=>ej(eg(e)));
    })();
}
function eq(e) {
    return !Number.isFinite(e) || e <= 0 ? "" : e >= 100000000 ? `${(e / 100000000).toFixed(1)}亿` : e >= 10000 ? `${(e / 10000).toFixed(1)}万` : String(e);
}
function eM(e) {
    var t, n, r, i, l, o, a, u, c;
    let f = null != (t = e.base_info) ? t : {}, d = en(null == (a = e.display_info) ? void 0 : a.url_cover), s = eq(Number(null != (n = null == (u = e.stats) ? void 0 : u.count_collected) ? n : 0)), p = "number" == typeof e.resource_cnt ? e.resource_cnt : Number(null != (r = null == (c = e.resource_cnt) ? void 0 : c.track_cnt) ? r : 0), m = [
        s ? `${s} 收藏` : "",
        p ? `${p} 首` : ""
    ].filter(Boolean).join(" · ");
    return ex({
        id: `playlist-${f.id}`,
        type: "url",
        mediaType: "playlist",
        link: e$(String(f.id), String(null != (i = f.owner_id) ? i : "")),
        title: String(null != (l = null != (o = f.title) ? o : f.name) ? l : "歌单")
    }, m ? {
        subtitle: m
    } : {}, d ? {
        posterPath: d,
        coverUrl: d
    } : {});
}
function eI(e, t = 10) {
    return eb(function*() {
        return (yield ec(e, t)).map(eM);
    })();
}
let ez = /歌手|歌曲|热门|榜单|合集|未知|^\s*$/;
function eB(e) {
    return eb(function*() {
        let [t, n] = yield Promise.all([
            H(function*() {
                var t;
                return ed(null != (t = (yield eo("/artist/detail/", {
                    artist_id: e
                })).artist_info) ? t : {});
            })(),
            function(e, t = 50) {
                return H(function*() {
                    let n = yield eo("/artist/tracks/", {
                        artist_id: e,
                        count: t,
                        cursor: "0"
                    });
                    return Array.isArray(n.tracks) ? n.tracks : [];
                })();
            }(e)
        ]), r = n.map((e)=>ej(eg(e))), i = [
            r.length ? `${r.length} 首热门` : "",
            t.albumCount ? `${t.albumCount} 张专辑` : ""
        ].filter(Boolean).join(" · ");
        return ek(ex({}, eA(t), i ? {
            subtitle: i
        } : {}, t.intro ? {
            description: t.intro.slice(0, 300)
        } : {}), {
            tracks: r
        });
    })();
}
let eT = /^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/, eU = /^\[(\d+),(\d+)\](.*)$/, eR = /<\d+,\d+(?:,\d+)?>/g;
function eL(e) {
    let t = [];
    for (let n of String(null != e ? e : "").split(/\r?\n/)){
        let e = n.trim();
        if (!e) continue;
        let r = eT.exec(e);
        if (r) {
            let [, e, n, i = "0", l] = r, o = 60000 * Number(e) + 1000 * Number(n) + Number(i.padEnd(3, "0").slice(0, 3));
            t.push({
                ms: o,
                text: l.trim()
            });
            continue;
        }
        let i = eU.exec(e);
        i && t.push({
            ms: Number(i[1]),
            text: i[3].replace(eR, "").trim()
        });
    }
    return t;
}
function eF(e) {
    let t = Math.floor(e / 60000), n = Math.floor(e % 60000 / 1000), r = Math.floor(e % 1000 / 10);
    return `[${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}.${String(r).padStart(2, "0")}]`;
}
function eW(e) {
    return eL(e).map((e)=>`${eF(e.ms)}${e.text}`).join("\n");
}
let eJ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function eY(e) {
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
            n += eJ[l >> 18 & 63] + eJ[l >> 12 & 63], n += e + 1 < t.length ? eJ[l >> 6 & 63] : "=", n += e + 2 < t.length ? eJ[63 & l] : "=";
        }
        return n;
    }(e)}`;
}
let eG = `${eS}login:0`;
function eK(e) {
    let t = [
        e.vip ? "VIP" : "普通账号",
        e.userId
    ].filter(Boolean).join(" · ");
    return ek(ex(ek(ex({
        id: "my-account",
        type: "url",
        link: eG,
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
function eH(e, t, n) {
    return ex({
        id: "my-notice",
        type: "url",
        link: eG,
        title: e
    }, t ? {
        subtitle: t
    } : {}, n ? {
        description: n
    } : {});
}
function eQ(e, t) {
    return {
        id: "login-qr",
        type: "url",
        link: eG,
        title: t,
        subtitle: "点开这一条看大图，用汽水音乐 App 扫码",
        description: "二维码 5 分钟内有效。登录态只保存在本机，不会上传到任何服务器。",
        posterPath: e,
        detailPoster: e,
        coverUrl: e
    };
}
function eV() {
    return eH("点这里登录汽水音乐", "登录后才会显示账号里的歌单", "汽水音乐的账号数据要扫码授权才能读，接口不给匿名访问。");
}
function eZ() {
    return eb(function*() {
        let t = z();
        if (t) return [
            eK(t)
        ];
        let l = T();
        if (l) {
            let e = yield b(function*() {
                var e, t, n, r;
                let i = T();
                if (!i) return {
                    state: "expired"
                };
                let l = null == (t = (yield C(`https://open.douyin.com/oauth/check_qrcode/?${B()}&token=${encodeURIComponent(i.token)}&timestamp=${Date.now()}`)).data) ? void 0 : t.data, o = String(null != (e = null == l ? void 0 : l.status) ? e : "").toLowerCase(), a = L[o];
                return "expired" === a ? (I(P), {
                    state: "expired"
                }) : "waiting" === a || "scanned" === a ? {
                    state: a
                } : "confirmed" !== a ? {
                    state: "unknown",
                    debug: `未知扫码状态「${o || "空"}」 ${F(l)}`
                } : (n = l, r = i, b(function*() {
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
                            ].find((e)=>"string" == typeof e && e) || W(null == n ? void 0 : n.redirect_url, "code") || W(null == n ? void 0 : n.redirect_url, "auth_code");
                            if (!e) return {
                                state: "unknown",
                                debug: `没拿到授权码 · ${a.join(" · ")} · ${F(n, 200)}`
                            };
                            let t = null;
                            for (let n of [
                                "auth_code",
                                "code"
                            ])try {
                                let t = yield C(`https://open.qishui.com${S}/access/code/get/?${D({
                                    [n]: String(e)
                                })}`);
                                a.push(`code/get(${n}) ${t.status} ${F(t.data)}`), E(t.data), o = (null == (l = t.data) ? void 0 : l.data) || t.data;
                                break;
                            } catch (e) {
                                t = e;
                            }
                            if (!o) throw t instanceof Error ? t : Error("授权码兑换失败");
                        }
                        if (!(null == o ? void 0 : o.access_code)) throw Error("access_code 缺失");
                        let u = yield U(o, r.key, {
                            csr: r.csr
                        });
                        a.push(`ticket ok expires=${u.expiresAt}`);
                        let c = yield C(`https://open.douyin.com${S}/me/info/?${D({})}`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",
                                "access-token": u.ticket,
                                "bd-ticket-guard-version": "1",
                                "bd-ticket-guard-client-cert": u.cert,
                                "bd-ticket-guard-client-data": J(u, "/me/info/")
                            },
                            data: JSON.stringify({
                                common_params: {}
                            })
                        });
                        E(c.data);
                        let f = null == (i = c.data) || null == (t = i.data) ? void 0 : t.my_info;
                        if (a.push(`me/info ${c.status} ${F(c.data)}`), !(null == f ? void 0 : f.id)) throw Error("账号信息读取失败");
                        let d = k(x({}, u), {
                            userId: String(f.id),
                            nickname: String(null != (e = f.nickname) ? e : ""),
                            avatar: String(f.medium_avatar_url || f.avatar_url || ""),
                            vip: !0 === f.is_vip
                        });
                        if (M(O, d), I(P), !z()) return {
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
                eK(e.account)
            ];
            if ("unknown" === e.state) {
                var o;
                return [
                    eH("登录没走完（把这段发我）", null != (o = e.debug) ? o : "没有详情")
                ];
            }
            if ("expired" !== e.state) return [
                eQ(l.qr, "scanned" === e.state ? "已扫码，请在手机上点确认" : "用汽水音乐 App 扫码登录")
            ];
        }
        return [
            eQ((yield b(function*() {
                var t, l;
                let o = function() {
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
                        t = t.concat(a(r.concat([
                            255 & n
                        ]))), n++;
                    }
                    return i(t) % (0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n - 1n) + 1n;
                }(), u = function(t) {
                    var i;
                    let l, o = m(p({
                        x: 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
                        y: 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
                        z: 1n
                    }, t)), a = (t, n)=>y(0x31, y(0x30, v(t), y(0x0c, e(n)))), u = y(0x30, a("550403", "bd-ticket-guard"), a("55040b", ""), a("55040a", "")), c = y(0x30, y(0x02, [
                        0
                    ]), u, (l = [
                        0x04,
                        ...r(o.x, 32),
                        ...r(o.y, 32)
                    ], y(0x30, y(0x30, v("2a8648ce3d0201"), v("2a8648ce3d030107")), y(0x03, [
                        0x00,
                        ...l
                    ]))), y(0xa0)), f = g(t, c), d = y(0x30, c, y(0x30, v("2a8648ce3d040302")), y(0x03, [
                        0x00,
                        ...f
                    ])), s = `-----BEGIN CERTIFICATE REQUEST-----\n${null == (i = n(d).match(/.{1,64}/g)) ? void 0 : i.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
                    return n(e(s));
                }(o), c = null == (t = (yield C(`https://open.douyin.com/oauth/get_qrcode/?${B()}`)).data) ? void 0 : t.data;
                if (!(null == c ? void 0 : c.token) || !(null == c ? void 0 : c.qrcode_index_url)) throw Error("二维码生成失败，请稍后重试");
                let f = Date.now() + 300000, d = yield (l = String(c.qrcode_index_url), b(function*() {
                    let e = encodeURIComponent(l), t = [
                        `https://quickchart.io/qr?text=${e}&size=600&margin=1&ecLevel=M&format=png`,
                        `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=8&ecc=M&data=${e}`
                    ];
                    for (let e of t)try {
                        var n;
                        if ((null != (n = (yield Widget.http.request({
                            url: e,
                            method: "GET",
                            decodable: !1,
                            timeout: 15
                        })).statusCode) ? n : 0) === 200) return e;
                    } catch (e) {}
                    return t[0];
                })());
                return M(P, {
                    token: String(c.token),
                    key: o.toString(16),
                    csr: u,
                    qr: d,
                    expiresAt: f
                }), {
                    qr: d,
                    expiresAt: f
                };
            })()).qr, "用汽水音乐 App 扫码登录")
        ];
    })();
}
function eX(e, t, n, r, i, l, o) {
    try {
        var a = e[l](o), u = a.value;
    } catch (e) {
        n(e);
        return;
    }
    a.done ? t(u) : Promise.resolve(u).then(r, i);
}
function e0(e) {
    return function() {
        var t = this, n = arguments;
        return new Promise(function(r, i) {
            var l = e.apply(t, n);
            function o(e) {
                eX(l, r, i, o, a, "next", e);
            }
            function a(e) {
                eX(l, r, i, o, a, "throw", e);
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
    version: "0.2.4",
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
}, loadLogin = ()=>e0(function*() {
        return eZ();
    })(), loadMyPlaylists = ()=>e0(function*() {
        return function(e = 50) {
            return eb(function*() {
                if (!z()) return [
                    eV()
                ];
                try {
                    let t = yield function(e = 50) {
                        return b(function*() {
                            let t = [], n = "";
                            for(let l = 0; l < 4; l++){
                                var r, i;
                                let l = yield G("/me/playlist/", {
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
                    }(e);
                    if (!t.length) return [
                        eH("还没有歌单", "账号里没有自建或收藏的歌单")
                    ];
                    return t.map(eM);
                } catch (e) {
                    var t;
                    return [
                        eH("歌单读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), loadRecentPlayed = ()=>e0(function*() {
        return function(e = 50) {
            return eb(function*() {
                if (!z()) return [
                    eV()
                ];
                try {
                    let t = yield function(e = 50) {
                        return b(function*() {
                            let t = [], n = "";
                            for(let l = 0; l < 8 && t.length < e; l++){
                                var r, i;
                                let l = yield G("/me/recent-played/", {
                                    count: e,
                                    cursor: n,
                                    media_type: "track",
                                    scene: "me_tab"
                                });
                                for (let n of Array.isArray(l.media) ? l.media : []){
                                    let r = null == n ? void 0 : n.media;
                                    if ((null == r ? void 0 : r.track_entity) && (t.push(k(x({}, r.track_entity), {
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
                        eH("还没有播放记录", "在汽水音乐里听几首歌再回来")
                    ];
                    return t.map((e)=>ej(eg(e)));
                } catch (e) {
                    var t;
                    return [
                        eH("最近播放读取失败", String(null != (t = e.message) ? t : e).slice(0, 90))
                    ];
                }
            })();
        }();
    })(), logoutAccount = ()=>e0(function*() {
        return I(O), I(P), {
            message: "已退出登录",
            refresh: !0
        };
    })(), loadScenes = ()=>e0(function*() {
        return eb(function*() {
            return (yield H(function*() {
                let e = yield eo("/feed/mode/", {});
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
                                cover: en(i.url_info)
                            }
                        ];
                    });
                });
            })()).map((e)=>(eD.set(e.id, e.name), ex({
                    id: `scene-${e.id}`,
                    type: "url",
                    mediaType: "playlist",
                    link: ew(e.id),
                    title: e.name
                }, e.group ? {
                    subtitle: e.group
                } : {}, e.cover ? {
                    posterPath: e.cover,
                    coverUrl: e.cover
                } : {})));
        })();
    })(), loadRecommend = ()=>e0(function*() {
        return eb(function*() {
            return (yield eh(null, 30)).map((e)=>ej(eg(e)));
        })();
    })(), loadDaily = ()=>e0(function*() {
        return eE("daily", 30);
    })(), loadFresh = ()=>e0(function*() {
        return eE("fresh", 30);
    })(), loadFamiliar = ()=>e0(function*() {
        return eE("familiar", 30);
    })(), loadAlbums = ()=>e0(function*() {
        return function(e = 10) {
            return eb(function*() {
                return eN((yield eh(null, 30, "daily")), e);
            })();
        }(10);
    })(), loadArtists = (e)=>e0(function*() {
        return function() {
            return eb(function*(e = {}) {
                var t, n;
                let r = String(null != (t = null != (n = e.peopleId) ? n : e.id) ? t : "").trim();
                return /^\d{1,30}$/.test(r) ? [
                    (yield eB(r))
                ] : function(e = 18) {
                    return eb(function*() {
                        let t = yield Promise.all([
                            "华语",
                            "粤语",
                            "欧美"
                        ].map((e)=>ef(e, 10).catch(()=>[]))), n = new Set(), r = [];
                        for (let i of t.flat()){
                            let t = ed(i);
                            if (!(!t.id || n.has(t.id) || ez.test(t.name)) && !(t.name.length > 20) && !(t.trackCount < 1) && (n.add(t.id), r.push(eA(t)), r.length >= e)) break;
                        }
                        return r;
                    })();
                }();
            }).apply(this, arguments);
        }(e);
    })(), loadHotPlaylists = ()=>e0(function*() {
        return eI("热歌", 10);
    })(), loadClassicPlaylists = ()=>e0(function*() {
        return eI("经典老歌", 10);
    })(), loadSubtitle = (e)=>e0(function*() {
        return eb(function*() {
            var t, n, r, i, l;
            let o, a = e.link ? eO(e.link) : null, u = (null == a ? void 0 : a.kind) === "track" ? a.id : /^\d{1,30}$/.test(String(null != (t = e.id) ? t : "")) ? String(e.id) : "";
            if (!u) return [];
            let { original: c, translation: f } = {
                original: String(null != (n = null == (o = null == (i = (yield ev(u)).display_info) ? void 0 : i.lyric_info) || null == (l = o.lyric_entity) ? void 0 : l.content) ? n : ""),
                translation: Object.values(null != (r = null == o ? void 0 : o.lang_translations) ? r : {}).map((e)=>{
                    var t;
                    return String(null != (t = null == e ? void 0 : e.content) ? t : "");
                }).find((e)=>e.trim().length > 0)
            }, d = [];
            if (c && f) {
                let e, t = (e = new Map(eL(f).map((e)=>[
                        e.ms,
                        e.text
                    ])), eL(c).map((t)=>{
                    let n = e.get(t.ms), r = n && n !== t.text ? `${t.text} / ${n}` : t.text;
                    return `${eF(t.ms)}${r}`;
                }).join("\n"));
                t && d.push({
                    id: `qishui:lyric:${u}:bilingual`,
                    title: "双语歌词",
                    lang: "zh-CN",
                    url: eY(t)
                });
            }
            let s = c ? eW(c) : "", p = f ? eW(f) : "";
            return s && d.push({
                id: `qishui:lyric:${u}:original`,
                title: "原文歌词",
                lang: "und",
                url: eY(s)
            }), p && d.push({
                id: `qishui:lyric:${u}:translation`,
                title: "中文翻译",
                lang: "zh-CN",
                url: eY(p)
            }), d;
        })();
    })(), search = (e)=>e0(function*() {
        return eb(function*() {
            var t, n;
            let r = String(null != (t = e.keyword) ? t : "").trim();
            if (!r) return [];
            let i = String(null != (n = e.kind) ? n : "all");
            if ("artists" === i) return (yield ef(r, 20)).map((e)=>eA(ed(e)));
            if ("playlists" === i) return eI(r, 30);
            if ("albums" === i) return eN((yield eu(r, 40)), 12);
            if ("songs" === i || "tracks" === i) return (yield eu(r, 40)).map((e)=>ej(eg(e)));
            let [l, o, a] = yield Promise.all([
                ef(r, 12).catch(()=>[]),
                eu(r, 20).catch(()=>[]),
                ec(r, 8).catch(()=>[])
            ]), u = yield eN(o, 6).catch(()=>[]);
            return [
                ...l.map((e)=>eA(ed(e))),
                ...u,
                ...o.map((e)=>ej(eg(e))),
                ...a.map(eM)
            ];
        })();
    })(), loadDetail = (e)=>e0(function*() {
        return eb(function*() {
            var t, n, r, i, l;
            let o = eO(e);
            if (!o) throw Error(`无法识别的链接：${e}`);
            return "track" === o.kind ? (t = o.id, eb(function*() {
                let e = yield ev(t), n = eg(e), r = yield H(function*() {
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
                        var n, r, i, l, o, a, u, c;
                        let d = null == (o = t[e]) ? void 0 : o.video_model_info;
                        if (!(null == d ? void 0 : d.url_player_info)) continue;
                        let s = yield ei(String(d.url_player_info), {
                            headers: {
                                "user-agent": X
                            }
                        }), p = (null != (n = null != (r = null != (i = null == (u = s.Result) || null == (a = u.Data) ? void 0 : a.PlayInfoList) ? i : null == (c = s.data) ? void 0 : c.PlayInfoList) ? r : s.PlayInfoList) ? n : []).filter((e)=>(null == e ? void 0 : e.MainPlayUrl) && !e.PlayAuth && !e.EncryptionMethod).sort((e, t)=>{
                            var n, r;
                            return Number(null != (n = t.Bitrate) ? n : 0) - Number(null != (r = e.Bitrate) ? r : 0);
                        });
                        if (!p.length) continue;
                        let m = p[0], y = Number(null != (l = m.Duration) ? l : 0);
                        return {
                            url: String(m.MainPlayUrl),
                            preview: f || y > 0 && y < 25,
                            duration: y
                        };
                    }
                    throw Error("这首歌只有加密音源，暂不支持播放");
                })(), i = [
                    eP(n.durationMs),
                    r.preview ? "仅试听片段" : ""
                ].filter(Boolean).join(" · ");
                return ek(ex({}, ej(n), i ? {
                    description: i
                } : {}), {
                    videoUrl: r.url
                });
            })()) : "scene" === o.kind ? (n = o.id, eb(function*() {
                var e;
                let t = (yield eh(n, 40)).map((e)=>ej(eg(e)));
                return {
                    id: `scene-${n}`,
                    type: "url",
                    mediaType: "playlist",
                    link: ew(n),
                    title: null != (e = eD.get(n)) ? e : "场景推荐",
                    description: `${t.length} 首`,
                    tracks: t
                };
            })()) : "artist" === o.kind ? eB(o.id) : "album" === o.kind ? (r = o.id, eb(function*() {
                let { album: e, entities: t } = yield ep(r), n = es(e);
                return ek(ex({}, eC(n), n.intro ? {
                    description: n.intro.slice(0, 300)
                } : {}), {
                    tracks: t.map((e)=>ej(eg(e)))
                });
            })()) : "login" === o.kind ? (yield eZ())[0] : (i = o.id, l = o.ownerId, eb(function*() {
                var e, t, n, r, o, a, u, c;
                let f;
                try {
                    f = yield function(e, t = "", n = 200) {
                        return H(function*() {
                            let r, i = [], l = "0";
                            for(let m = 0; m < 8; m++){
                                var o, a, u, c, f, d, s, p;
                                let m = yield eo("/playlist/detail/", {
                                    playlist_id: e,
                                    owner_id: t,
                                    count: 100,
                                    cursor: l,
                                    type: null
                                });
                                for (let e of (r = null != r ? r : m.playlist, Array.isArray(m.media_entities) ? m.media_entities : [])){
                                    let t = null != (a = null != (u = null != (c = e.track_entity) ? c : null == (f = e.entity) ? void 0 : f.track) ? u : null == (s = e.entity) || null == (d = s.media) ? void 0 : d.track_entity) ? a : e.base_info ? e : null;
                                    if ((null == t || null == (p = t.base_info) ? void 0 : p.id) && i.push(t), i.length >= n) break;
                                }
                                let y = String(null != (o = m.next_cursor) ? o : "");
                                if (!m.has_more || !y || y === l || i.length >= n) break;
                                l = y;
                            }
                            return {
                                playlist: r,
                                entities: i
                            };
                        })();
                    }(i, l);
                } catch (e) {
                    if (!z()) throw Error("这个歌单打不开：车机接口只开放自建与抖音收藏的歌单");
                    f = yield (function(e, t = "", n = 200) {
                        return b(function*() {
                            let r, i = [], l = "0";
                            for(let m = 0; m < 8 && i.length < n; m++){
                                var o, a, u, c, f, d, s, p;
                                let m = yield G("/playlist/detail/", {
                                    playlist_id: e,
                                    owner_id: t,
                                    count: 100,
                                    cursor: l,
                                    type: null
                                });
                                for (let e of (r = null != r ? r : m.playlist, Array.isArray(m.media_entities) ? m.media_entities : [])){
                                    let t = null != (a = null != (u = null != (c = e.track_entity) ? c : null == (f = e.entity) ? void 0 : f.track) ? u : null == (s = e.entity) || null == (d = s.media) ? void 0 : d.track_entity) ? a : e.base_info ? e : null;
                                    if ((null == t || null == (p = t.base_info) ? void 0 : p.id) && i.push(t), i.length >= n) break;
                                }
                                let y = String(null != (o = m.next_cursor) ? o : "");
                                if (!m.has_more || !y || y === l) break;
                                l = y;
                            }
                            return {
                                playlist: r,
                                entities: i
                            };
                        })();
                    })(i, l).catch(()=>{
                        throw Error("这个歌单打不开：车机接口不给收藏来的歌单");
                    });
                }
                let { playlist: d, entities: s } = f, p = s.map((e)=>ej(eg(e))), m = null != (e = null == d ? void 0 : d.base_info) ? e : {}, y = en(null == d || null == (o = d.display_info) ? void 0 : o.url_cover), h = null == d || null == (u = d.relation_info) || null == (a = u.owner) ? void 0 : a.name, v = eq(Number(null != (t = null == d || null == (c = d.stats) ? void 0 : c.count_collected) ? t : 0)), g = [
                    h,
                    v ? `${v} 收藏` : "",
                    p.length ? `${p.length} 首` : ""
                ].filter(Boolean).join(" · ");
                return ek(ex({
                    id: i,
                    type: "url",
                    mediaType: "playlist",
                    link: e$(i, l),
                    title: String(null != (n = null != (r = m.title) ? r : m.name) ? n : "歌单")
                }, g ? {
                    subtitle: g
                } : {}, m.desc ? {
                    description: String(m.desc).slice(0, 200)
                } : {}, y ? {
                    posterPath: y,
                    coverUrl: y
                } : {}), {
                    tracks: p
                });
            })());
        })();
    })();
