# 📖 詳細設定指南

完整的系統設定步驟說明。

---

## 🎯 設定目標

完成設定後，您將擁有：
- ✅ 一個可以收集商家資料的表單
- ✅ 資料自動儲存到 Google Sheets
- ✅ Email 查詢功能
- ✅ 圖片上傳功能（目前有 bug，待修復）

---

## ⏱️ 預計時間

- **首次設定：** 15-20 分鐘
- **更新部署：** 5 分鐘

---

## 📋 前置準備

### **需要的帳號：**
- ✅ Google 帳號

### **需要的權限：**
- ✅ Google Drive 存取權限
- ✅ Google Sheets 存取權限
- ✅ Google Apps Script 執行權限

---

## 🚀 詳細步驟

### **步驟 1：建立 Google Sheet**

1. 前往 [Google Sheets](https://sheets.google.com)
2. 點擊「空白」建立新試算表
3. 重新命名為「商家資料庫」或您喜歡的名稱
4. 複製 Sheet ID：
   - 查看網址列
   - 複製 `/d/` 和 `/edit` 之間的那一段
   - 例如：`https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
   - Sheet ID 就是 `1ABC...XYZ`
5. 貼到記事本備用

**💡 提示：** Sheet 會在第一次有資料提交時自動建立欄位和表頭。

---

### **步驟 2：建立 Google Drive 資料夾**

1. 前往 [Google Drive](https://drive.google.com)
2. 點擊「新增」→「新資料夾」
3. 命名為「商家圖片」或您喜歡的名稱
4. 開啟該資料夾
5. 複製資料夾 ID：
   - 查看網址列
   - 複製 `/folders/` 後面的那一段
   - 例如：`https://drive.google.com/drive/folders/1ABC...XYZ`
   - 資料夾 ID 就是 `1ABC...XYZ`
6. 貼到記事本備用

**💡 提示：** 每次提交表單時，系統會在這個資料夾下自動建立子資料夾。

---

### **步驟 3：設定 Google Apps Script**

#### **3-1. 建立專案**

1. 前往 [Google Apps Script](https://script.google.com)
2. 點擊「新專案」
3. 重新命名專案為「商家資料表單後端」

#### **3-2. 貼上程式碼**

1. 刪除預設的程式碼
2. 開啟 `google-apps-script.js`
3. 全選複製（Ctrl+A → Ctrl+C）
4. 貼到 Apps Script 編輯器（Ctrl+V）

#### **3-3. 填入設定**

找到前幾行，填入您的資訊：

```javascript
const SHEET_ID = '貼上您的SHEET_ID';
const DRIVE_FOLDER_ID = '貼上您的FOLDER_ID';
const ADMIN_PASSWORD = 'admin123';  // 改成您想要的密碼
```

**範例：**
```javascript
const SHEET_ID = '1ABCdefGHIjklMNOpqrSTUvwxYZ123456789';
const DRIVE_FOLDER_ID = '1XYZwvuTSRqpONMlkjIHGfedCBA987654321';
const ADMIN_PASSWORD = 'mySecretPassword123';
```

#### **3-4. 儲存**

1. 點擊「磁碟」圖示或按 **Ctrl+S**
2. 等待儲存完成（看到「已儲存所有變更」）

---

### **步驟 4：部署 Apps Script**

#### **4-1. 建立部署**

1. 點擊右上角「**部署**」
2. 選擇「**新增部署作業**」
3. 點擊「**選取類型**」旁的齒輪圖示 ⚙️
4. 選擇「**網頁應用程式**」

#### **4-2. 設定部署**

- **說明：** 填入「v1.0」或任何版本號
- **執行身分：** 選擇「**我**」
- **具有存取權的使用者：** 選擇「**所有人**」

#### **4-3. 授權**

1. 點擊「**部署**」
2. 會彈出授權視窗
3. 點擊「**授權存取權**」
4. 選擇您的 Google 帳號
5. 可能會出現警告「這個應用程式未經驗證」：
   - 點擊「**進階**」
   - 點擊「**前往 [專案名稱]（不安全）**」
   - 點擊「**允許**」

#### **4-4. 複製 API URL**

1. 部署完成後，會顯示「**網頁應用程式 URL**」
2. **複製整個 URL**（很重要！）
3. 應該像這樣：
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
4. 貼到記事本備用

**⚠️ 重要：** 每次重新部署時，如果選擇「新版本」，URL 可能會改變。

---

### **步驟 5：設定 HTML 檔案**

#### **5-1. 設定表單頁面**

1. 用記事本或任何文字編輯器開啟 `merchant-form.html`
2. 按 **Ctrl+F** 搜尋：
   ```
   YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
   ```
3. 將其替換成您剛才複製的 API URL
4. **儲存**（Ctrl+S）

**範例：**
```javascript
// 之前
const scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// 之後
const scriptUrl = 'https://script.google.com/macros/s/AKfycbz.../exec';
```

#### **5-2. 設定查詢頁面**

1. 開啟 `merchant-query.html`
2. 搜尋 `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`
3. 替換成**相同的** API URL
4. **儲存**

---

### **步驟 6：測試**

#### **6-1. 測試表單**

1. 雙擊開啟 `merchant-form.html`（或用瀏覽器開啟）
2. 同意免責聲明
3. 填寫測試資料：
   - 店家類型：選擇「美甲」
   - 店家名稱：測試店家
   - 分店名稱：總店
   - 聯絡人：王小明
   - Email：test@example.com
   - 電話：0912345678
   - 填寫其他必填欄位
   - 暫時不上傳圖片（因為有 bug）
4. 點擊「提交」

#### **6-2. 檢查結果**

1. **檢查是否有成功訊息**
2. **檢查 Google Sheets：**
   - 重新整理試算表
   - 應該會看到：
     - 新的工作表「商家資料」
     - 表頭欄位
     - 第一筆資料
3. **檢查 Google Drive：**
   - 應該會有新的資料夾（但目前圖片功能有 bug，所以是空的）

#### **6-3. 測試查詢**

1. 開啟 `merchant-query.html`
2. 輸入剛才測試用的 Email：`test@example.com`
3. 點擊「查詢記錄」
4. 應該會顯示剛才提交的資料

---

## ✅ 設定完成檢查清單

### **確認以下每一項：**

- [ ] Google Sheet 已建立，Sheet ID 已複製
- [ ] Google Drive 資料夾已建立，資料夾 ID 已複製
- [ ] Apps Script 程式碼已貼上
- [ ] SHEET_ID、DRIVE_FOLDER_ID、ADMIN_PASSWORD 已填入
- [ ] Apps Script 已儲存
- [ ] Apps Script 已部署
- [ ] API URL 已複製
- [ ] merchant-form.html 的 API URL 已填入
- [ ] merchant-query.html 的 API URL 已填入
- [ ] 測試表單提交成功
- [ ] Google Sheet 有資料
- [ ] 查詢功能正常

---

## 🔄 更新部署

### **當您修改 Apps Script 時：**

1. 修改程式碼
2. **儲存**（Ctrl+S）
3. 部署 → 管理部署作業
4. 點擊現有部署右側的「**編輯**」✏️
5. 選擇「**新版本**」
6. 點擊「**部署**」
7. 完成！

**💡 提示：** 選擇「新版本」會讓變更生效，但 API URL 會改變（需要重新填入 HTML）。

---

## 🆘 常見設定錯誤

### **錯誤 1：Cannot read properties of undefined**
**原因：** HTML 的 API URL 沒有填入
**解決：** 確認 HTML 檔案的 API URL 已正確填入

### **錯誤 2：權限錯誤**
**原因：** Apps Script 沒有權限存取 Sheets 或 Drive
**解決：** 重新授權或檢查 SHEET_ID 和 FOLDER_ID 是否正確

### **錯誤 3：查詢沒有反應**
**原因：** merchant-query.html 的 API URL 沒填
**解決：** 確認查詢頁面也要填入 API URL

---

## 📞 需要幫助？

如果設定過程中遇到問題：

1. **檢查文件：** 閱讀 [疑難排解文件](./docs/troubleshooting.md)
2. **檢查錯誤：** 按 F12 查看 Console 錯誤訊息
3. **檢查記錄：** 查看 Apps Script 執行記錄
4. **開 Issue：** 在 GitHub 上開 Issue 描述問題

---

**設定完成後，恭喜您！系統已經可以使用了！** 🎉

接下來可以：
- 使用表單收集商家資料
- 用 Email 查詢記錄
- 等待圖片上傳功能修復（我們會持續改進）

---

**最後更新：** 2025-10-27
