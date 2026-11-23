import { expect, test } from "@rstest/core";
import { albumLinksOf, albumRef, formatCover } from "./api";

test("formatCover 必须补上 -origin 模板后缀，否则 CDN 返回 400", () => {
  const info = {
    urls: ["https://p3-luna.douyinpic.com/img/"],
    uri: "tos-cn-i-b829550vbb/a.png",
    template_prefix: "tplv-b829550vbb",
  };
  expect(formatCover(info)).toBe(
    "https://p3-luna.douyinpic.com/img/tos-cn-i-b829550vbb/a.png~tplv-b829550vbb-origin.image",
  );
});

test("formatCover 兜底：无模板裸拼、已是字符串、空值", () => {
  expect(formatCover({ urls: ["https://a/"], uri: "b.png" })).toBe("https://a/b.png");
  expect(formatCover("https://a/b.jpg")).toBe("https://a/b.jpg");
  expect(formatCover(undefined)).toBe("");
  expect(formatCover(null)).toBe("");
  expect(formatCover({ urls: [], uri: "b.png" })).toBe("");
  expect(formatCover({ urls: ["https://a/"] })).toBe("");
});

test("albumRef 读取专辑字段，release_date 是秒级时间戳", () => {
  const ref = albumRef({
    base_info: { id: "77", name: "礼物", count_tracks: 14, release_date: 1278604800, intro: "简介" },
    related_info: { artist_links: [{ name: "张学友" }] },
    display: { url_cover: { urls: ["https://p3/"], uri: "c.jpeg", template_prefix: "tplv-x" } },
  });
  expect(ref.id).toBe("77");
  expect(ref.name).toBe("礼物");
  expect(ref.trackCount).toBe(14);
  expect(ref.artists).toEqual(["张学友"]);
  expect(ref.releaseDate).toBe("2010-07-08");
  expect(ref.cover).toBe("https://p3/c.jpeg~tplv-x-origin.image");
});

test("albumLinksOf 从曲目反推专辑并去重", () => {
  const entities = [
    { related_info: { album_link: { id: "1", name: "A" } } },
    { related_info: { album_link: { id: "1", name: "A" } } },
    { related_info: { album_link: { id: "2", name: "B" } } },
    { related_info: {} },
  ];
  expect(albumLinksOf(entities)).toEqual([
    { id: "1", name: "A" },
    { id: "2", name: "B" },
  ]);
});
