# 🏪 商家資料收集系統

一個完整的商家資料收集、管理和查詢系統，使用 Google Apps Script 作為後端。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com)

---

## ✨ 功能特色

### 📝 **表單功能**
- ✅ 多店家類型支援（美甲、美髮、美容、紋繡等）
- ✅ 分店名稱管理
- ✅ 詳細的服務項目分類
- ✅ 營業時間和公休日設定
- ✅ 社群連結收集（Facebook、Instagram、LINE 等）
- ✅ 商品資料管理（名稱、價格、描述）
- ✅ 圖片上傳（環境圖、價目表、商品圖）⚠️ 目前有 bug

### 🔍 **查詢功能**
- ✅ Email 查詢所有提交記錄
- ✅ 顯示完整的店家資訊
- ✅ 圖片連結查看
- ✅ 美觀的卡片式界面

### 📊 **資料管理**
- ✅ 自動儲存到 Google Sheets
- ✅ 圖片自動上傳到 Google Drive（有資料夾但圖片上傳失敗 - 待修復）
- ✅ 資料夾自動命名和分類

---

## ⚠️ **已知問題**

### **圖片上傳功能**
- **狀態：** 🔴 有 Bug
- **問題：** 資料夾可以建立，但圖片無法上傳
- **影響：** 圖片連結欄位為空
- **臨時方案：** 用戶可以手動上傳圖片到 Google Drive 並提供連結
- **計劃：** 正在修復中

---

## 🚀 快速開始

### **前置需求**
- Google 帳號
- Google Drive 存取權限
- Google Sheets 存取權限
- 基本的 HTML/JavaScript 知識（用於設定）

---

### **步驟 1：設定 Google Sheets**

1. 建立一個新的 Google Sheets
2. 複製 Sheet ID（從網址列取得）
   ```
   https://docs.google.com/spreadsheets/d/[這是SHEET_ID]/edit
   ```

---

### **步驟 2：設定 Google Drive**

1. 在 Google Drive 建立一個資料夾（用來存放圖片）
2. 複製資料夾 ID（從網址列取得）
   ```
   https://drive.google.com/drive/folders/[這是FOLDER_ID]
   ```

---

### **步驟 3：部署 Google Apps Script**

1. 前往 [Google Apps Script](https://script.google.com)
2. 建立新專案
3. 複製 `google-apps-script.js` 的內容並貼上
4. 修改前幾行，填入您的資訊：
   ```javascript
   const SHEET_ID = '您的SHEET_ID';
   const DRIVE_FOLDER_ID = '您的FOLDER_ID';
   const ADMIN_PASSWORD = 'admin123';  // 修改成您的密碼
   ```
5. 儲存專案（Ctrl+S）
6. 部署：
   - 點擊「部署」→「新增部署作業」
   - 選擇類型：「網頁應用程式」
   - 執行身分：「我」
   - 具有存取權的使用者：「所有人」
   - 點擊「部署」
7. 授權存取權限
8. 複製「網頁應用程式 URL」

---

### **步驟 4：設定 HTML 檔案**

#### **4-1. 設定 merchant-form.html（表單頁面）**

1. 開啟 `merchant-form.html`
2. 搜尋 `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`
3. 替換成您的 API URL
4. 儲存

#### **4-2. 設定 merchant-query.html（查詢頁面）**

1. 開啟 `merchant-query.html`
2. 搜尋 `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`
3. 替換成相同的 API URL
4. 儲存

---

### **步驟 5：測試**

1. 開啟 `merchant-form.html`（雙擊或用瀏覽器開啟）
2. 填寫測試資料
3. 提交
4. 檢查 Google Sheets 是否有資料
5. 開啟 `merchant-query.html` 測試查詢功能

---

## 📁 檔案結構

```
merchant-data-system/
├── README.md                    # 本檔案
├── SETUP.md                     # 詳細設定指南
├── CHANGELOG.md                 # 更新日誌
├── google-apps-script.js        # 後端程式碼
├── merchant-form.html           # 表單頁面
├── merchant-query.html          # 查詢頁面
├── docs/                        # 文件資料夾
│   ├── setup-guide.md          # 設定指南
│   ├── user-manual.md          # 使用手冊
│   └── troubleshooting.md      # 疑難排解
└── images/                      # 截圖和示意圖
    ├── screenshot-form.png
    ├── screenshot-query.png
    └── screenshot-sheet.png
```

---

## 🔧 設定說明

### **必須設定的項目：**

1. **Google Apps Script:**
   - `SHEET_ID` - Google Sheets ID
   - `DRIVE_FOLDER_ID` - Google Drive 資料夾 ID
   - `ADMIN_PASSWORD` - 管理員密碼

2. **HTML 檔案:**
   - `merchant-form.html` - 填入 API URL
   - `merchant-query.html` - 填入 API URL

---

## 📊 資料結構

### **Google Sheets 欄位：**

| 欄位名稱 | 說明 |
|---------|------|
| 提交時間 | 自動記錄 |
| 店家類型 | 美甲、美髮等 |
| 店家名稱 | 主要店名 |
| 分店名稱 | 分店名稱 |
| 聯絡人 | 聯絡人姓名 |
| 聯絡Email | 用於查詢 |
| 聯絡電話 | 聯絡電話 |
| 店家地址 | 完整地址 |
| 地址補充 | 地址補充說明 |
| 服務類別 | 選擇的服務類別 |
| 服務項目 | 詳細服務項目 |
| 起跳金額 | 最低價格 |
| 最高金額 | 最高價格 |
| 營業日 | 營業日 |
| 營業時間 | 營業時間 |
| 營業時間補充 | 補充說明 |
| 公休日 | 公休日 |
| 公休日補充 | 補充說明 |
| 官方網站 | 網站連結 |
| Facebook | FB 連結 |
| LINE | LINE 連結 |
| Instagram | IG 連結 |
| Google商家連結 | Google 商家 |
| 連結備註 | 其他連結說明 |
| 商家介紹 | 商家介紹文字 |
| 環境圖連結 | 環境圖片連結 |
| 價目表連結 | 價目表連結 |
| 商品資料 | 商品詳細資料 |
| 商品圖片連結 | 商品圖片連結 |

---

## 🐛 疑難排解

### **常見問題：**

#### **Q1: 提交後沒有反應？**
**A:** 檢查：
- API URL 是否正確填入
- 網路是否正常
- 按 F12 查看 Console 錯誤訊息

#### **Q2: 查詢功能沒反應？**
**A:** 確認：
- merchant-query.html 的 API URL 是否已填入
- Email 是否正確
- 按 F12 查看錯誤

#### **Q3: 圖片沒有上傳？**
**A:** 這是已知的 Bug，正在修復中。臨時方案：
- 手動上傳圖片到 Google Drive
- 在表單中貼上圖片連結

#### **Q4: Google Sheets 沒有資料？**
**A:** 檢查：
- SHEET_ID 是否正確
- Apps Script 是否有權限存取
- 查看 Apps Script 執行記錄

---

## 🔄 更新記錄

### **v1.0.0** (2025-10-27)
- ✅ 初始版本
- ✅ 表單功能
- ✅ 查詢功能
- ✅ 資料儲存到 Google Sheets
- ⚠️ 圖片上傳功能有 bug（待修復）

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

## 📝 授權

MIT License

---

## 📧 聯絡方式

如有問題，請開 Issue。

---

## ⭐ 如果這個專案對您有幫助，請給個星星！

---

## 📚 相關連結

- [Google Apps Script 文件](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Drive API](https://developers.google.com/drive/api)

---

**最後更新：** 2025-10-27
