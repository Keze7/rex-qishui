/**
 * iOS JSC 没有 node:crypto，这里用 BigInt 手写 P-256 / SHA-256 / ECDSA，
 * 只为拼出车机登录要的 bd-ticket-guard CSR 与请求签名。
 */

// ---------- bytes ----------

export function utf8Bytes(text: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    else if (code < 0x10000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    else
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 63),
        0x80 | ((code >> 6) & 63),
        0x80 | (code & 63),
      );
  }
  return out;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function base64Encode(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const chunk = (a << 16) | (b << 8) | c;
    out += B64[(chunk >> 18) & 63] + B64[(chunk >> 12) & 63];
    out += i + 1 < bytes.length ? B64[(chunk >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? B64[chunk & 63] : "=";
  }
  return out;
}

export function base64Decode(text: string): number[] {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, "");
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64.indexOf(clean[i]) << 18) |
      (B64.indexOf(clean[i + 1] ?? "A") << 12) |
      ((clean[i + 2] ? B64.indexOf(clean[i + 2]) : 0) << 6) |
      (clean[i + 3] ? B64.indexOf(clean[i + 3]) : 0);
    out.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  const pad = text.includes("=") ? (text.endsWith("==") ? 2 : 1) : 0;
  return pad ? out.slice(0, out.length - pad) : out;
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => (b < 16 ? "0" : "") + b.toString(16)).join("");
}

export function hexToBytes(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

export function bigToBytes(value: bigint, length: number): number[] {
  const out: number[] = new Array(length).fill(0);
  let v = value;
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(v & 255n);
    v >>= 8n;
  }
  return out;
}

export function bytesToBig(bytes: number[]): bigint {
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return v;
}

// ---------- sha256 ----------

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
  0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
  0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
];

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256(bytes: number[]): number[] {
  const h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const data = bytes.slice();
  const bitLen = bytes.length * 8;
  data.push(0x80);
  while (data.length % 64 !== 56) data.push(0);
  data.push(0, 0, 0, 0);
  data.push((bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);

  const w = new Array<number>(64).fill(0);
  for (let i = 0; i < data.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = ((data[i + t * 4] << 24) | (data[i + t * 4 + 1] << 16) | (data[i + t * 4 + 2] << 8) | data[i + t * 4 + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }
  const out: number[] = [];
  for (const v of h) out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
  return out;
}

function hmacSha256(key: number[], message: number[]): number[] {
  const block = key.length > 64 ? sha256(key) : key.slice();
  while (block.length < 64) block.push(0);
  const inner = block.map((b) => b ^ 0x36).concat(message);
  const outer = block.map((b) => b ^ 0x5c).concat(sha256(inner));
  return sha256(outer);
}

// ---------- p-256 ----------

const P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
const N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
const GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n;
const GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n;

type Jacobian = { x: bigint; y: bigint; z: bigint };

const INF: Jacobian = { x: 0n, y: 1n, z: 0n };

function mod(value: bigint, m = P): bigint {
  const r = value % m;
  return r < 0n ? r + m : r;
}

function modInv(value: bigint, m: bigint): bigint {
  let a = mod(value, m);
  if (a === 0n) throw new Error("inverse of zero");
  let b = m;
  let x0 = 1n;
  let x1 = 0n;
  while (b !== 0n) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [x0, x1] = [x1, x0 - q * x1];
  }
  return mod(x0, m);
}

function jDouble(p: Jacobian): Jacobian {
  if (p.z === 0n) return INF;
  const A = mod(p.x * p.x);
  const B = mod(p.y * p.y);
  const C = mod(B * B);
  const D = mod(2n * (mod((p.x + B) * (p.x + B)) - A - C));
  const Z4 = mod(p.z * p.z);
  const M = mod(3n * A - 3n * mod(Z4 * Z4));
  const x = mod(M * M - 2n * D);
  const y = mod(M * (D - x) - 8n * C);
  const z = mod(2n * p.y * p.z);
  return { x, y, z };
}

function jAdd(a: Jacobian, b: Jacobian): Jacobian {
  if (a.z === 0n) return b;
  if (b.z === 0n) return a;
  const z1z1 = mod(a.z * a.z);
  const z2z2 = mod(b.z * b.z);
  const u1 = mod(a.x * z2z2);
  const u2 = mod(b.x * z1z1);
  const s1 = mod(a.y * b.z * z2z2);
  const s2 = mod(b.y * a.z * z1z1);
  if (u1 === u2) return s1 === s2 ? jDouble(a) : INF;
  const h = mod(u2 - u1);
  const i = mod(4n * h * h);
  const j = mod(h * i);
  const r = mod(2n * (s2 - s1));
  const v = mod(u1 * i);
  const x = mod(r * r - j - 2n * v);
  const y = mod(r * (v - x) - 2n * s1 * j);
  const z = mod(((a.z + b.z) * (a.z + b.z) - z1z1 - z2z2) * h);
  return { x, y, z };
}

function jMul(point: Jacobian, scalar: bigint): Jacobian {
  let result = INF;
  let base = point;
  let k = scalar;
  while (k > 0n) {
    if (k & 1n) result = jAdd(result, base);
    base = jDouble(base);
    k >>= 1n;
  }
  return result;
}

function toAffine(p: Jacobian): { x: bigint; y: bigint } {
  if (p.z === 0n) throw new Error("point at infinity");
  const zi = modInv(p.z, P);
  const zi2 = mod(zi * zi);
  return { x: mod(p.x * zi2), y: mod(p.y * zi2 * zi) };
}

// ---------- der ----------

function derLength(length: number): number[] {
  if (length < 128) return [length];
  if (length < 256) return [0x81, length];
  return [0x82, (length >> 8) & 255, length & 255];
}

function der(tag: number, ...parts: number[][]): number[] {
  const body: number[] = [];
  for (const part of parts) body.push(...part);
  return [tag, ...derLength(body.length), ...body];
}

function derInteger(bytes: number[]): number[] {
  let i = 0;
  while (i < bytes.length - 1 && bytes[i] === 0) i++;
  const value = bytes.slice(i);
  return der(0x02, value[0] & 0x80 ? [0, ...value] : value);
}

function derOid(hex: string): number[] {
  return der(0x06, hexToBytes(hex));
}

// ---------- keys ----------

export function randomScalar(): bigint {
  // JSC 没有 crypto.getRandomValues；用 Math.random 的连续输出 + 计时做种子，
  // 再经 SHA-256 扩散。只用来保护一条会过期的登录票据。
  const seed: number[] = [];
  for (let i = 0; i < 16; i++) seed.push(Math.floor(Math.random() * 4294967296));
  for (let i = 0; i < 8; i++) seed.push(Math.floor(Date.now() % 4294967296));
  let bytes: number[] = [];
  let counter = 0;
  while (bytes.length < 48) {
    const block: number[] = [];
    for (let i = 0; i < 4; i++) {
      const v = seed[(counter * 4 + i) % seed.length] ^ (counter * 2654435761);
      block.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
    }
    bytes = bytes.concat(sha256(block.concat([counter & 255])));
    counter++;
  }
  const d = bytesToBig(bytes) % (N - 1n);
  return d + 1n;
}

export function publicKey(d: bigint): { x: bigint; y: bigint } {
  return toAffine(jMul({ x: GX, y: GY, z: 1n }, d));
}

export function spkiDer(publicPoint: { x: bigint; y: bigint }): number[] {
  const point = [0x04, ...bigToBytes(publicPoint.x, 32), ...bigToBytes(publicPoint.y, 32)];
  return der(
    0x30,
    der(0x30, derOid("2a8648ce3d0201"), derOid("2a8648ce3d030107")),
    der(0x03, [0x00, ...point]),
  );
}

export function ecdsaSign(d: bigint, message: number[]): number[] {
  const hash = sha256(message);
  const e = bytesToBig(hash);
  const x = bigToBytes(d, 32);
  const h1 = bigToBytes(mod(e, N), 32);
  // RFC 6979 确定性 k：避免随机数重复导致私钥可解
  let v: number[] = new Array(32).fill(1);
  let k: number[] = new Array(32).fill(0);
  k = hmacSha256(k, v.concat([0], x, h1));
  v = hmacSha256(k, v);
  k = hmacSha256(k, v.concat([1], x, h1));
  v = hmacSha256(k, v);
  let nonce = 0n;
  for (;;) {
    v = hmacSha256(k, v);
    nonce = bytesToBig(v);
    if (nonce > 0n && nonce < N) break;
    k = hmacSha256(k, v.concat([0]));
    v = hmacSha256(k, v);
  }
  const rPoint = toAffine(jMul({ x: GX, y: GY, z: 1n }, nonce));
  const r = mod(rPoint.x, N);
  const s = mod(modInv(nonce, N) * (e + r * d), N);
  if (r === 0n || s === 0n) throw new Error("invalid signature");
  return der(0x30, derInteger(bigToBytes(r, 32)), derInteger(bigToBytes(s, 32)));
}

/** 车机登录用 CSR：subject 固定为 bd-ticket-guard，算法 ecdsa-with-SHA256 */
export function buildCsr(d: bigint): string {
  const point = publicKey(d);
  const name = (oid: string, value: string) => der(0x31, der(0x30, derOid(oid), der(0x0c, utf8Bytes(value))));
  const subject = der(
    0x30,
    name("550403", "bd-ticket-guard"),
    name("55040b", ""),
    name("55040a", ""),
  );
  const info = der(0x30, der(0x02, [0]), subject, spkiDer(point), der(0xa0));
  const signature = ecdsaSign(d, info);
  const request = der(0x30, info, der(0x30, derOid("2a8648ce3d040302")), der(0x03, [0x00, ...signature]));
  const pem = `-----BEGIN CERTIFICATE REQUEST-----\n${base64Encode(request)
    .match(/.{1,64}/g)
    ?.join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
  return base64Encode(utf8Bytes(pem));
}
