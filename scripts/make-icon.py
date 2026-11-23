# 生成汽水音乐图标：薄荷绿渐变圆角方块 + 白色汽水波 + 上升气泡
from PIL import Image, ImageDraw
import math

S = 2048          # 超采样画布
R = 464
TOP = (110, 238, 205)
BOTTOM = (10, 176, 138)
WHITE = (255, 255, 255, 255)


def sine(x, base, amp, freq, phase):
    return base - amp * math.sin(2 * math.pi * freq * x / S + phase)


# 1. 竖向渐变
grad = Image.new("RGB", (S, S))
px = grad.load()
for y in range(S):
    t = (y / (S - 1)) ** 0.85
    row = (
        round(TOP[0] + (BOTTOM[0] - TOP[0]) * t),
        round(TOP[1] + (BOTTOM[1] - TOP[1]) * t),
        round(TOP[2] + (BOTTOM[2] - TOP[2]) * t),
    )
    for x in range(S):
        px[x, y] = row

# 2. 圆角遮罩
mask = Image.new("L", (S, S), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=R, fill=255)

# 3. 白色波浪带：两条正弦之间填实，边缘光滑无锯齿
glyph = Image.new("RGBA", (S, S), (0, 0, 0, 0))
g = ImageDraw.Draw(glyph)

top_pts = [(x, sine(x, S * 0.56, S * 0.085, 1.1, 0.4)) for x in range(-40, S + 41, 4)]
bottom_pts = [(x, sine(x, S * 0.72, S * 0.055, 1.1, 0.4)) for x in range(S + 40, -41, -4)]
g.polygon(top_pts + bottom_pts, fill=WHITE)

# 4. 气泡：沿左下向右上排开，大小递减
for cx, cy, r in [
    (S * 0.300, S * 0.775, 80),
    (S * 0.395, S * 0.878, 46),
    (S * 0.215, S * 0.885, 28),
]:
    g.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)

# 5. 合并
out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
out.paste(grad, (0, 0), mask)
out.alpha_composite(Image.composite(glyph, Image.new("RGBA", (S, S), (0, 0, 0, 0)), mask))

out.resize((512, 512), Image.LANCZOS).save("assets/icon.png")
print("saved assets/icon.png")
