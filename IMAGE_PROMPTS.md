# HeyHey Dive — AI 圖片生成清單

完全免費的工作流：用 Google ImageFX 產圖 → 下載 → 放對位置 → 網站自動顯示。

> 🚦 **顯示邏輯**：所有圖位都有「漸層 fallback」，沒放圖也不會破畫面。放圖後自動切換成圖。

---

## 🛠 工具

**Google ImageFX**（你已有 Google 帳號）
👉 https://labs.google/fx/tools/image-fx

- 完全免費、品質佳、寫實風好
- 預設 1:1，做 hero 大圖記得切「Widescreen 16:9」
- 一個 prompt 可以連續產 4 張，挑最好的

---

## 📂 兩種放置方式

| 圖類 | 放法 | 為什麼 |
|------|------|--------|
| **首頁 Hero** | 檔案丟到 `public/images/hero.jpg` | 沒對應 DB 紀錄 |
| **潛點 / 行程 / 課程封面** | 後台 `/admin` → 對應項目 → 「封面圖片」上傳 | 已綁 DB 的 `cover_image` 欄位 |

---

## 🔥 第一波（10 張，做完首頁就完整了）

### 1️⃣ 首頁 Hero（檔名 `hero.jpg`，16:9，最重要）

**📥 放置**：下載後重新命名為 `hero.jpg`，放到 `public/images/hero.jpg`

**Prompt**（複製整段貼到 ImageFX，記得選 16:9 Widescreen）：
```
Underwater scene from a freediver's perspective looking up at the sun, dramatic god rays piercing through deep turquoise water, silhouette of a single freediver descending with a monofin, cinematic blue tones, hyper realistic, photographic, wide angle, Taiwan ocean vibe, peaceful and majestic
```

---

### 2️⃣ 潛點封面（3 張，1:1 或 16:9 都可）

**📥 放置**：到 `/admin/dive-sites`，點對應潛點 → 上傳封面

**綠島 LUDAO**
```
Aerial drone shot of Ludao green island Taiwan, turquoise volcanic coastline, clear shallow reef visible from above, tropical island, golden hour light, cinematic photography, ultra realistic
```

**蘭嶼 LANYU**
```
Lanyu orchid island Taiwan coastline at sunset, dramatic black volcanic cliffs, deep blue ocean meeting sky, traditional Tao culture vibe, cinematic wide shot, ultra realistic photography
```

**小琉球 LIUQIU**
```
Underwater photograph of a green sea turtle swimming peacefully over a vibrant coral reef in Liuqiu Taiwan, crystal clear water, sunbeams from above, tropical fish around, photorealistic, National Geographic style
```

---

### 3️⃣ 行程封面（4 張，16:9）

**📥 放置**：到 `/admin/trips`，點對應行程 → 上傳封面

> 提示：你目前 DB 裡可能不只 4 個行程。優先做「最近會跑」的那幾個就好。

**綠島行程 LUDAO**
```
Group of scuba divers entering crystal clear turquoise water from a small boat near Ludao Taiwan, sunny day, GoPro action style, vibrant, realistic, summer vibes
```

**蘭嶼行程 LANYU**
```
Underwater school of hammerhead sharks swimming in deep blue water near Lanyu Taiwan, dramatic lighting, wide angle, cinematic, ultra realistic
```

**小琉球行程 LIUQIU**
```
Snorkeler floating above a sea turtle in shallow clear water near Liuqiu Taiwan, sunlight reflections on the surface, peaceful, photorealistic
```

**墾丁 / 其他 KENTING**
```
Coastal sunset over Kenting Taiwan, divers walking along golden beach carrying fins, silhouette against orange sky, cinematic, photorealistic
```

---

### 4️⃣ 課程封面（2 張，16:9）

**📥 放置**：到 `/admin/courses`，點對應課程 → 上傳封面

**AIDA 自由潛水**
```
A single freediver descending along a vertical rope into deep blue ocean, holding the rope with one hand, wearing a monofin, peaceful and meditative, minimalist composition, cinematic deep blue tones, photorealistic
```

**PADI 水肺**
```
Scuba diver in full gear hovering horizontally over a vibrant coral reef, bubbles rising, surrounded by tropical fish, bright sunlight from above, clear blue water, photorealistic, wide angle
```

---

## 🌊 第二波（可選，視時間補完）

潛點故事區塊、課程細節 hero、教練頭像等 —— **建議第一波放完看效果再決定是否需要**。

教練頭像強烈建議**用真實照片**，AI 生成的人臉品牌風險高。

---

## ✅ 完成檢查表

- [ ] `public/images/hero.jpg` 已放置
- [ ] 後台 → 綠島 / 蘭嶼 / 小琉球潛點封面已上傳
- [ ] 後台 → 主要行程封面已上傳
- [ ] 後台 → AIDA / PADI 課程封面已上傳
- [ ] 重新整理首頁確認顯示正常

---

## 💡 Prompt 調整小技巧

如果產出的圖風格不對：
- 想更寫實 → 加 `photorealistic, National Geographic style, DSLR photo`
- 想更夢幻 → 加 `cinematic, ethereal, soft light`
- 不要插畫感 → 加 `not illustration, not anime, photograph`
- 想統一色調 → 加 `cinematic blue and teal color grading`

如果某張圖怎麼產都不滿意，貼回來我幫你改 prompt。

---

## 🛍 限量周邊（Merch）封面圖

目前 seed migration 預設使用 `public/images/merch/*.svg`（簡約插畫，先放上去先讓商品上架）。
要換成寫實照片時：

1. 用 ImageFX 用下列 prompts 產出 1:1 圖
2. 後台 `/admin/merch` → 點商品 → 上傳新封面（會自動覆蓋）

| 商品 | Slug | Prompt（複製貼到 ImageFX） |
|------|------|-------------------------------|
| 海洋藍經典 T-shirt | `tee-ocean` | `Studio product photography of an ocean blue heavyweight cotton t-shirt folded neatly on a sandy beach background, soft natural lighting, embroidered yellow "heyhey DIVE" chest logo, minimalist, premium quality, 1:1 square, hyper realistic` |
| 珊瑚色海灘巾 | `towel-coral` | `Top-down product photo of a coral orange striped beach towel folded with a small yellow logo patch in the center, natural linen background, soft shadow, summer mood, photorealistic, 1:1 square` |
| 帆布托特包 | `tote-canvas` | `Studio product photo of a natural canvas tote bag with screen-printed navy "heyhey DIVE TAIWAN" text on the front, hanging against a deep ocean blue wall, soft side light, premium quality, 1:1 square` |
| 深海軍藍棒球帽 | `cap-navy` | `Studio product photography of a deep navy unstructured dad cap with subtle yellow "hh DIVE" embroidered front, on a pastel cream background, soft natural light, no person, 1:1 square, hyper realistic` |
| 不鏽鋼保溫瓶 | `bottle-steel` | `Studio product photo of a brushed stainless steel insulated water bottle in ocean gradient blue with a small cream label reading "heyhey · SEA BOTTLE", soft studio lighting, light gradient background, 1:1 square, photorealistic` |
| 潛旅貼紙包 | `stickers-pack` | `Top-down flat lay of 4 vinyl die-cut stickers spread on a warm cream paper background: a yellow turtle circle, a coral orange "heyhey DIVE" rectangle, a yellow Ludao hot-spring badge, and a blue "BREATHE" bubble badge. Soft daylight, 1:1 square, photorealistic` |

> 換圖後，商品詳情頁仍可顯示 SVG 作為 fallback gallery（多角度示意）。
