import { createHash, createPublicKey, verify } from "node:crypto";
import { expect, test } from "@rstest/core";
import {
  base64Decode,
  base64Encode,
  bigToBytes,
  buildCsr,
  ecdsaSign,
  hexToBytes,
  publicKey,
  randomScalar,
  sha256,
  spkiDer,
  utf8Bytes,
} from "./sign";

// 固定私钥，与 node:crypto 逐字节对照
const D = 0x5f9d2a1c8e4b7a03c6d1e2f4a9b8c7d6e5f40312ab19c8d7e6f5a4b3c2d1e0f9n;

test("sha256 与 node 一致", () => {
  for (const text of ["", "abc", "汽水音乐 bd-ticket-guard", "x".repeat(200)]) {
    const mine = sha256(utf8Bytes(text)).map((b) => b.toString(16).padStart(2, "0")).join("");
    expect(mine).toBe(createHash("sha256").update(text, "utf8").digest("hex"));
  }
});

test("base64 编解码往返", () => {
  const bytes = Array.from({ length: 100 }, (_, i) => (i * 37) % 256);
  expect(base64Decode(base64Encode(bytes))).toEqual(bytes);
  expect(base64Encode(utf8Bytes("汽水"))).toBe(Buffer.from("汽水").toString("base64"));
});

test("公钥导出与 node 生成的 SPKI 一致", () => {
  const point = publicKey(D);
  // 用 node 从同一私钥导出 SPKI 做对照
  const ecdh = require("node:crypto").createECDH("prime256v1");
  ecdh.setPrivateKey(Buffer.from(bigToBytes(D, 32).map((b) => b)));
  const expectSpki = createPublicKey({ key: Buffer.concat([
    Buffer.from("3059301306072a8648ce3d020106082a8648ce3d030107034200", "hex"),
    Buffer.from(ecdh.getPublicKey()),
  ]), format: "der", type: "spki" }).export({ type: "spki", format: "der" });
  expect(Buffer.from(spkiDer(point)).toString("hex")).toBe(Buffer.from(expectSpki).toString("hex"));
});

test("ECDSA 签名可被 node 验签", () => {
  const point = publicKey(D);
  const ecdh = require("node:crypto").createECDH("prime256v1");
  ecdh.setPrivateKey(Buffer.from(bigToBytes(D, 32).map((b) => b)));
  const pub = createPublicKey({ key: Buffer.concat([
    Buffer.from("3059301306072a8648ce3d020106082a8648ce3d030107034200", "hex"),
    Buffer.from(ecdh.getPublicKey()),
  ]), format: "der", type: "spki" });
  for (const text of ["ticket=abc&path=/x/&timestamp=1", "汽水音乐"]) {
    const message = utf8Bytes(text);
    const sig = Buffer.from(ecdsaSign(D, message));
    expect(verify("sha256", Buffer.from(message), pub, sig)).toBe(true);
  }
  expect(point.x > 0n && point.y > 0n).toBe(true);
});

test("CSR 结构与签名自洽", () => {
  const b64 = buildCsr(D);
  const pemText = Buffer.from(base64Decode(b64)).toString("utf8");
  expect(pemText.startsWith("-----BEGIN CERTIFICATE REQUEST-----")).toBe(true);
  const der = Buffer.from(pemText.replace(/-----[^-]+-----/g, "").replace(/\s/g, ""), "base64");
  // 解析外层 SEQUENCE：info / algorithm / BIT STRING(signature)
  const read = (buf: Buffer, offset: number) => {
    const tag = buf[offset];
    let len = buf[offset + 1];
    let start = offset + 2;
    if (len & 0x80) {
      const count = len & 0x7f;
      len = 0;
      for (let i = 0; i < count; i++) len = (len << 8) | buf[offset + 2 + i];
      start = offset + 2 + count;
    }
    return { tag, offset, start, end: start + len, len };
  };
  const outer = read(der, 0);
  expect(outer.tag).toBe(0x30);
  const info = read(der, outer.start);
  expect(info.tag).toBe(0x30);
  const algo = read(der, info.end);
  expect(algo.tag).toBe(0x30);
  const bit = read(der, algo.end);
  expect(bit.tag).toBe(0x03);
  expect(der[bit.start]).toBe(0);

  const ecdh = require("node:crypto").createECDH("prime256v1");
  ecdh.setPrivateKey(Buffer.from(bigToBytes(D, 32).map((b) => b)));
  const pub = createPublicKey({ key: Buffer.concat([
    Buffer.from("3059301306072a8648ce3d020106082a8648ce3d030107034200", "hex"),
    Buffer.from(ecdh.getPublicKey()),
  ]), format: "der", type: "spki" });
  const tbs = der.subarray(info.offset, info.end);
  const sig = der.subarray(bit.start + 1, bit.end);
  expect(verify("sha256", tbs, pub, Buffer.from(sig) as any)).toBe(true);
});

test("randomScalar 落在合法区间", () => {
  for (let i = 0; i < 5; i++) {
    const d = randomScalar();
    expect(d > 0n).toBe(true);
    expect(d < 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n).toBe(true);
  }
  expect(hexToBytes("00ff").length).toBe(2);
});
