import { expect, test } from "@rstest/core";
import { formatCover } from "./api";

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
