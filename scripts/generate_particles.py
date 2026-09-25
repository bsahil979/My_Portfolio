from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import numpy as np
from collections import deque
import json

src_path = r"C:\Users\Sahil Belchada\Desktop\portfolio\assets\sahil.jpg"
im = Image.open(src_path).convert("RGB")
w, h = im.size

# Crop centered on face: 700x793 -> 300x340
crop_w = 700
crop_h = int(crop_w * 340 / 300)
left = (w - crop_w) // 2
top = 70
crop = im.crop((left, top, left + crop_w, top + crop_h)).resize((300, 340), Image.Resampling.LANCZOS)
rgb = np.asarray(crop, dtype=np.float32)
gray = np.mean(rgb, axis=2)

# Segment subject
h_c, w_c = gray.shape
visited = np.zeros((h_c, w_c), dtype=bool)
is_bg = np.zeros((h_c, w_c), dtype=bool)
q = deque([(0, 0), (0, w_c - 1), (10, 0), (10, w_c - 1)])
for y, x in q:
    visited[y, x] = True

while q:
    cy, cx = q.popleft()
    if gray[cy, cx] > 205 and (rgb[cy, cx, 0] - rgb[cy, cx, 2]) < 22:
        is_bg[cy, cx] = True
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h_c and 0 <= nx < w_c and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

subject_mask = ~is_bg

# Grayscale contrast equalization
gray_im = ImageOps.grayscale(crop)
mask_pil = Image.fromarray((subject_mask * 255).astype(np.uint8))
eq_im = ImageOps.equalize(gray_im, mask=mask_pil)
eq_im = ImageEnhance.Contrast(eq_im).enhance(1.35)
eq_im = eq_im.filter(ImageFilter.UnsharpMask(radius=2, percent=175, threshold=1))
enhanced_arr = np.asarray(eq_im, dtype=np.float32)

# Floyd-Steinberg diffusion
def floyd_steinberg(gray_arr):
    work = gray_arr.copy().astype(np.float32) / 255.0
    out = np.zeros_like(work, dtype=bool)
    height, width = work.shape
    for y in range(height):
        left_to_right = (y % 2 == 0)
        xs = range(width) if left_to_right else range(width - 1, -1, -1)
        direction = 1 if left_to_right else -1
        for x in xs:
            old = work[y, x]
            new = 1.0 if old >= 0.5 else 0.0
            out[y, x] = bool(new)
            err = old - new
            nx = x + direction
            if 0 <= nx < width:
                work[y, nx] += err * 7 / 16
            if y + 1 < height:
                if 0 <= x - direction < width:
                    work[y + 1, x - direction] += err * 3 / 16
                work[y + 1, x] += err * 5 / 16
                if 0 <= nx < width:
                    work[y + 1, nx] += err * 1 / 16
    return out

dark_gray = enhanced_arr * subject_mask
bits_dark = floyd_steinberg(dark_gray) & subject_mask

ys, xs = np.where(bits_dark)
# We can sample every point or subsample slightly for optimal mobile/desktop balance (~14,000 points)
# For max quality, keep points where bits_dark is True
# Let's save a compact list: [x, y, brightness]
points = []
for y, x in zip(ys, xs):
    lum = float(enhanced_arr[y, x]) / 255.0
    points.append([int(x), int(y), round(lum, 2)])

print(f"Total extracted particles: {len(points)}")

# Also create a 12,000 point optimized version
step = max(1, len(points) // 14000)
opt_points = points[::step]
print(f"Optimized particles: {len(opt_points)}")

out_path = r"C:\Users\Sahil Belchada\Desktop\portfolio\assets\particles-data.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("// Pre-computed 1-bit Floyd-Steinberg particle data for instant 60 FPS loading\n")
    f.write("window.SAHIL_PORTRAIT_PARTICLES = " + json.dumps(opt_points) + ";\n")

print(f"Saved {out_path} ({len(json.dumps(opt_points)):,} chars)")
