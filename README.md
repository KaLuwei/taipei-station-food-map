# 北車食旅 V7｜Django 版

點選地圖街區或搜尋店名、餐點，探索 143 家收錄店家。可依條件篩選、按餐期使用美食轉盤，或從 9 條主題路線開始規劃並保存自己的行程。

## GitHub Pages 靜態預覽

在儲存庫的 Settings → Pages 選擇 Deploy from a branch，指定 `main` 分支與 `/docs` 資料夾並儲存。發布完成後，可從 Pages 設定頁的 Visit site 開啟網站。

首頁 `docs/index.html` 取自 V7 單檔網頁版，內含店家資料、底圖及互動程式。Pages 僅提供靜態檔案。若更新 Django 資料，請同步更新這份 HTML 並提交，預覽才會顯示新版內容。

## 需求
Python 3.10+，Django 5.2 / 6.0 皆可。

## 本機啟動

```sh
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_restaurants
python manage.py runserver
```

瀏覽 http://127.0.0.1:8000/ 。請勿在正式公開環境直接使用 `runserver`。

## 專案結構
- `food/models.py`：店家資料模型，含區域、預算、資料來源與可信度欄位。
- `food/views.py`：首頁與讀取 JSON API（5 分鐘快取）。
- `food/templates/food/index.html`：UI 骨架，Django JSON Script 安全傳入資料。
- `food/static/food/styles.css`：CSS，桌面與手機適配。
- `food/static/food/app.js`：篩選、地圖區域、轉盤、餐廳細節；無 npm / 不依賴外部 CDN。
- `food/static/food/map_bg.jpg`：使用者提供的地圖截圖，保留原圖 Google Maps 出處標示。
- `data/restaurants.json`：可審查和更正的資料種子，含原本 108 家、最新新增地下街店。
- `food/management/commands/seed_restaurants.py`：可重跑且不會產生重複 id 的匯入命令。
- `preview.html`：另附可直接雙擊開啟的單檔靜態預覽，用來測試 UI；更新正式資料仍以 Django 管理為主。

## 地下街區域
Y 台北地下街、Z 站前地下街、K 東森廣場、R 中山地下街。
原截圖僅覆蓋 R 南端和部分 Y 段，不得將區域色塊當成精準地籍／等時線；R 延伸至中山與雙連，超過台北車站 5 分鐘。

## 限制
店家資訊來自原對話與新增網路搜尋；每家有 `source`、`data_status`，未取得即時官方核驗者不標示為 `verified`。推薦品項不是完整菜單，不提供假想價位與評論。

## 效能
CSS/JS/圖片分離、原生 `defer` 載入、瀏覽器圖片快取、Django ORM 以 `.values()` 批量查詢與快取、JS 搜尋從相同資料集執行；沒有為 143 筆資料引入大型前端框架。對搜尋量大時可換用 Fuse.js (https://www.fusejs.io/)，此版保持輕量純 JS。

## 上線提醒
設定 `DJANGO_SECRET_KEY`、`DJANGO_DEBUG=0`、`DJANGO_ALLOWED_HOSTS`，執行 `python manage.py collectstatic`；正式服務使用 WSGI/ASGI + 靜態檔案服務。上線前需核實 Google Maps 截圖重製與公開使用授權／遵守服務條款。

## V6 擴充（2026-11-17）
- 原 131 家保留，新增 12 家在地商家，現在共 143 家 **已收錄條目**，不等於街區所有餐飲業者，也不代表全是品質認證。
- 新增三個示意選區：站前百貨與凱撒飯店、公園路與青島西路、中山北路巷弄。原 Google Maps 截圖視野外的區域不補畫精確邊界。
- 在表頭新增「美食行程」；可選 3 條從早餐、午餐、下午點心到晚餐的路線，點每站可進店家一頁式詳情，亦可連結 Google Maps 步行規劃。行程時間非店家即時供餐證明。
- 搜尋預設提示改為動態「143 家美食，開始探索」；篩選、轉盤、地圖選區、詳情操作保留。
- 任何店家的評價與推薦僅作為候選資訊，未進行逐戶街道現場清查或確認所有攤販。

## V7 美食行程規劃（2026-11-17）
- 原本三條行程保持不變，新增六種主題範例，現在可按主題切換選擇。
- 可「新增我的行程」自行取名、選擇主題、挑選 143 家資料庫中的店家、設定每站時間、備註、增減（2–8）站及調整順序。
- 可複製預設行程作為範本、編輯或刪除自己的行程。
- **儲存位置：瀏覽器 localStorage**，同一瀏覽器重開後保留，不含 Django 帳號同步功能；清除瀏覽器網站資料時可能消失。若瀏覽器停用本機儲存，會明確提示失敗。
- 調整各面板關閉按鈕為 CSS X 圖示，避免 SVG sprite 圖示在特定環境不顯示。
- 行程為非即時示範，並非已核實當日營業或逐站步行耗時；總價為各店參考價位加總。
