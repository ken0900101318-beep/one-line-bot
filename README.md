# ONE桌遊 LINE Bot 智能客服系統

**三層架構 + AI 智能回覆 + 店家自主設定**

---

## 🎯 系統架構

```
店家設定網頁（店家填寫）
    ↓
Google Sheets（自動儲存）
    ↓
LINE Bot（讀取設定 + AI 回覆）
    ↓
客人（收到智能回覆）
```

---

## 📋 功能特色

### 🏪 店家端
- ✅ 簡單易用的網頁表單
- ✅ 填寫基本資訊、價格、優惠
- ✅ 選擇 AI 個性（6 種風格）
- ✅ 自訂退單政策、活動方案
- ✅ 點擊儲存 → 自動同步

### 🤖 LINE Bot
- ✅ 24/7 自動回覆
- ✅ 從 Google Sheets 讀取店家設定
- ✅ 根據店家設定 + AI 規則回覆
- ✅ 支援多店管理
- ✅ 5 種 AI 個性風格

### 🎨 AI 個性
1. **親切鄰家風** - 像朋友一樣自然
2. **熱情小編風** - 超級活力充沛
3. **尊榮管家風** - 精簡優雅（推薦）
4. **呆萌吉祥物風** - 軟萌可愛
5. **專業顧問風** - 沉穩冷靜

---

## 🚀 部署步驟

### 步驟 1：建立 Google Sheets

1. **新建 Google Sheets**
   - 前往 Google Sheets 新建表單

2. **設定欄位（第一列）**
   ```
   店家名稱 | 地址 | 客服電話 | 客服時間 | 預約網址 | Google評論 | Wifi密碼 | 開放區價格 | 小包廂價格 | 大包廂價格 | 退單限制_小時 | 退單扣款 | AI個性 | 飲料機 | 飲水機 | 電視 | 當期活動 | 優惠方案
   ```

3. **公開分享**
   - 右上角「共用」→「任何知道連結的人」→「檢視者」
   - 複製連結

4. **取得 CSV 網址**
   - 原始連結：`https://docs.google.com/spreadsheets/d/你的ID/edit#gid=0`
   - CSV 連結：`https://docs.google.com/spreadsheets/d/你的ID/export?format=csv&gid=0`

---

### 步驟 2：部署店家設定網頁

1. **上傳到 GitHub**
   ```bash
   cd ~/.openclaw/workspace
   git add one-line-bot/public
   git commit -m "新增店家設定網頁"
   git push
   ```

2. **設定 GitHub Pages**
   - 前往 GitHub Repository → Settings → Pages
   - Source: `main` branch, `/one-line-bot/public` folder
   - 儲存

3. **取得網址**
   ```
   https://ken0900101318-beep.github.io/one-line-bot/
   ```

---

### 步驟 3：部署 LINE Bot 到 Railway

1. **安裝依賴**
   ```bash
   cd ~/.openclaw/workspace/one-line-bot
   npm install
   ```

2. **設定環境變數**
   ```bash
   cp .env.example .env
   # 編輯 .env 填入你的設定
   ```

3. **部署到 Railway**
   ```bash
   railway login
   railway init
   railway up
   ```

4. **設定環境變數（Railway Dashboard）**
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `SHEETS_CSV_URL`
   - `ANTHROPIC_API_KEY`

5. **取得 Webhook URL**
   ```
   https://你的專案名稱.up.railway.app/webhook
   ```

---

### 步驟 4：設定 LINE Bot Webhook

1. **前往 LINE Developers Console**
   - https://developers.line.biz/console/

2. **選擇你的 Channel**

3. **設定 Webhook URL**
   ```
   https://你的專案名稱.up.railway.app/webhook
   ```

4. **啟用 Webhook**
   - Use webhook: ON

5. **停用自動回覆**
   - Auto-reply messages: OFF

---

## 🧪 測試

### 1. 測試店家設定網頁
- 打開 `https://你的網址.github.io/one-line-bot/`
- 填寫表單
- 點擊「預覽資料」檢查
- 點擊「儲存設定」

### 2. 檢查 Google Sheets
- 確認資料已寫入

### 3. 測試 LINE Bot
- 加入 LINE 官方帳號
- 發送訊息測試
- 範例訊息：
  - 「土城店的 Wifi 密碼是多少？」
  - 「小包廂多少錢？」
  - 「可以退訂嗎？」

---

## 📊 資料流程

```
客人傳訊息
    ↓
LINE Bot 收到
    ↓
從 Google Sheets 讀取店家設定
    ↓
偵測詢問的店家（從訊息關鍵字）
    ↓
取得該店家設定
    ↓
傳送給 Claude AI
    ↓
根據店家設定 + AI 規則產生回覆
    ↓
回覆客人
```

---

## 🔧 維護

### 更新店家資訊
- 店家直接打開設定網頁修改
- 系統 5 分鐘自動更新快取

### 查看 Logs
```bash
railway logs
```

### 手動重新載入設定
- 重啟 Railway 服務

---

## 📞 技術支援

- **開發者**: Ken
- **建立日期**: 2026-03-08
- **版本**: v1.0.0

---

## 🎉 完成！

**系統已完整建立：**
- ✅ 店家設定網頁
- ✅ LINE Bot 系統
- ✅ Google Sheets 整合
- ✅ AI 智能回覆

**現在可以：**
1. 店家填寫設定
2. 自動儲存到 Sheets
3. LINE Bot 自動讀取
4. 智能回覆客人

**享受自動化的客服系統吧！** 🎊
