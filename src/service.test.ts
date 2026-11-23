import { expect, test } from "@rstest/core";
import { mergeLrc, parseLink, toLrcDataUri } from "./service";

test("toLrcDataUri 的 UTF-8 base64 与标准实现逐字节一致", () => {
  // 覆盖：ASCII、3 字节中文、4 字节 emoji、非 3 倍数长度的 padding
  const samples = ["", "A", "AB", "ABC", "[00:01.00]晴天", "[00:02.00]雨 🌧 停", "ラブ / 爱"];
  for (const text of samples) {
    const expected = `data:text/plain;charset=utf-8;base64,${Buffer.from(text, "utf8").toString("base64")}`;
    expect(toLrcDataUri(text)).toBe(expected);
  }
});

test("parseLink 识别三种详情链接并拒绝非法输入", () => {
  expect(parseLink("qishui:track:1234567890")).toEqual({ kind: "track", id: "1234567890", ownerId: "" });
  expect(parseLink("qishui:scene:4")).toEqual({ kind: "scene", id: "4", ownerId: "" });
  expect(parseLink("qishui:artist:6818416771607824386")).toEqual({
    kind: "artist",
    id: "6818416771607824386",
    ownerId: "",
  });
  expect(parseLink("qishui:playlist:123:_000-abc")).toEqual({ kind: "playlist", id: "123", ownerId: "_000-abc" });
  expect(parseLink("qishui:track:abc")).toBeNull();
  expect(parseLink("https://music.douyin.com/x")).toBeNull();
});

test("mergeLrc 按时间戳合并译文，缺译文的行保留原文", () => {
  const original = "[00:00.63]ラブ\n[00:02.73]ドントレットミーダウン";
  const translation = "[00:00.63]爱\n[00:02.73]别让我失望";
  expect(mergeLrc(original, translation)).toBe("[00:00.63]ラブ / 爱\n[00:02.73]ドントレットミーダウン / 别让我失望");

  const partial = "[00:00.63]爱";
  expect(mergeLrc(original, partial)).toBe("[00:00.63]ラブ / 爱\n[00:02.73]ドントレットミーダウン");
});

test("mergeLrc 忽略元数据行与空行", () => {
  const original = "[ti:标题]\n\n[00:01.00]第一句";
  expect(mergeLrc(original, "")).toBe("[00:01.00]第一句");
});

test("mergeLrc 把逐字 KRC 归一化为标准 LRC", () => {
  const krc = "[60,1470]<0,350,0>不<400,340,0>敢\n[1600,900]<0,300,0>回看";
  expect(mergeLrc(krc, "")).toBe("[00:00.06]不敢\n[00:01.60]回看");
});
