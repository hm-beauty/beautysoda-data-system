# 📤 如何上傳到 GitHub

完整的 GitHub 上傳步驟說明。

---

## 🎯 上傳目標

將您的專案上傳到 GitHub，讓它：
- ✅ 有版本控制
- ✅ 可以分享給別人
- ✅ 有完整的文件
- ✅ 可以追蹤問題和更新

---

## 📋 前置準備

### **需要的帳號：**
- GitHub 帳號（免費）：https://github.com/signup

### **需要安裝：**
- Git（版本控制工具）

---

## 🚀 上傳步驟

### **方法 1：使用 GitHub 網頁介面（最簡單）** ⭐ 推薦

#### **步驟 1：建立 GitHub Repository**

1. 登入 GitHub
2. 點擊右上角的「+」→「New repository」
3. 填寫資訊：
   - **Repository name：** `merchant-data-system` 或您喜歡的名稱
   - **Description：** 商家資料收集系統
   - **Public/Private：** 選擇 Public（公開）或 Private（私人）
   - ✅ 勾選「Add a README file」
   - **License：** 選擇 MIT License
4. 點擊「Create repository」

#### **步驟 2：上傳檔案**

1. 在您的 Repository 頁面，點擊「Add file」→「Upload files」
2. 將以下檔案拖曳到上傳區：
   - `README.md`
   - `SETUP.md`
   - `CHANGELOG.md`
   - `LICENSE`
   - `.gitignore`
   - `google-apps-script.js`
   - `merchant-form.html`
   - `merchant-query.html`
3. 在下方的 Commit 欄位填寫：
   - Commit message：`Initial commit - v1.0.0`
4. 點擊「Commit changes」

#### **步驟 3：完成！**

您的專案已經上傳到 GitHub 了！🎉

---

### **方法 2：使用 Git 命令列**

#### **步驟 1：安裝 Git**

**Windows：**
- 下載：https://git-scm.com/download/win
- 安裝後重開機

**Mac：**
```bash
brew install git
```

**Linux：**
```bash
sudo apt-get install git
```

#### **步驟 2：設定 Git**

開啟終端機或命令提示字元：

```bash
# 設定您的名字
git config --global user.name "Your Name"

# 設定您的 Email
git config --global user.email "your.email@example.com"
```

#### **步驟 3：初始化專案**

在您的專案資料夾中：

```bash
# 初始化 Git Repository
git init

# 新增所有檔案
git add .

# 第一次 Commit
git commit -m "Initial commit - v1.0.0"
```

#### **步驟 4：連結到 GitHub**

1. 在 GitHub 建立一個空的 Repository（不要勾選 README）
2. 複製 Repository URL
3. 在終端機執行：

```bash
# 新增遠端 Repository
git remote add origin https://github.com/你的用戶名/merchant-data-system.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

#### **步驟 5：完成！**

您的專案已經上傳到 GitHub 了！🎉

---

## 🔄 後續更新

### **當您修改程式碼後：**

#### **使用網頁介面：**
1. 前往您的 Repository
2. 點擊要更新的檔案
3. 點擊「編輯」圖示（鉛筆）
4. 修改內容
5. 填寫 Commit message
6. 點擊「Commit changes」

#### **使用 Git 命令列：**

```bash
# 查看變更
git status

# 新增變更的檔案
git add .

# Commit
git commit -m "修復圖片上傳問題"

# 推送到 GitHub
git push
```

---

## 📝 Commit Message 建議

### **格式：**
```
類型: 簡短描述

詳細說明（選填）
```

### **類型：**
- `feat:` 新功能
- `fix:` 修復 bug
- `docs:` 文件更新
- `style:` 格式調整（不影響程式碼）
- `refactor:` 重構
- `test:` 測試
- `chore:` 其他雜務

### **範例：**
```
feat: 新增圖片批次上傳功能

- 支援一次上傳多張圖片
- 新增進度條顯示
- 優化上傳速度
```

---

## 🌿 分支管理（進階）

### **建議的分支策略：**

- `main` - 穩定版本
- `develop` - 開發版本
- `feature/圖片上傳` - 功能分支
- `fix/bug修復` - 修復分支

### **建立分支：**

```bash
# 建立並切換到新分支
git checkout -b feature/image-upload

# 開發...

# Commit
git commit -m "feat: 改進圖片上傳功能"

# 推送分支
git push origin feature/image-upload

# 在 GitHub 上建立 Pull Request
```

---

## 📊 Repository 設定建議

### **1. 啟用 Issues**
讓使用者回報問題

### **2. 新增 Description 和 Topics**
- Description：商家資料收集系統 - 使用 Google Apps Script
- Topics：
  - google-apps-script
  - google-sheets
  - form-builder
  - data-collection
  - merchant-management

### **3. 新增 README Badges**
讓專案看起來更專業（已在 README.md 中）

### **4. 啟用 Discussions**
讓社群討論和提問

---

## 📖 README 最佳實踐

您的 README.md 應該包含（已包含）：
- ✅ 專案名稱和描述
- ✅ 功能特色
- ✅ 快速開始指南
- ✅ 設定步驟
- ✅ 使用範例
- ✅ 常見問題
- ✅ 貢獻指南
- ✅ 授權資訊
- ✅ 聯絡方式

---

## 🎨 讓 Repository 更吸引人

### **1. 新增截圖**
在 README 中展示實際使用畫面

### **2. 新增 Demo 連結**
如果有線上 Demo，放上連結

### **3. 寫清楚的文件**
完整的設定指南和使用手冊

### **4. 回應 Issues**
及時回應使用者的問題

### **5. 持續更新**
定期更新功能和修復 bug

---

## ⭐ 推廣您的專案

### **1. 新增到 Awesome Lists**
搜尋相關的 Awesome 清單並提交

### **2. 分享到社群**
- Reddit
- Hacker News
- Twitter
- Facebook 相關社團

### **3. 寫 Blog**
分享開發過程和技術細節

### **4. 錄製 Demo 影片**
上傳到 YouTube

---

## 📞 需要幫助？

### **Git 相關：**
- [Git 官方文件](https://git-scm.com/doc)
- [GitHub 指南](https://guides.github.com/)

### **Markdown 語法：**
- [Markdown 指南](https://www.markdownguide.org/)

---

## ✅ 上傳檢查清單

- [ ] GitHub 帳號已建立
- [ ] Repository 已建立
- [ ] 所有檔案已上傳
- [ ] README.md 完整且清楚
- [ ] LICENSE 已新增
- [ ] .gitignore 已新增
- [ ] Repository 設定已完成
- [ ] Description 和 Topics 已新增
- [ ] 第一個 Release 已建立（選填）

---

## 🎉 完成！

您的專案現在已經在 GitHub 上了！

**Repository URL 格式：**
```
https://github.com/你的用戶名/merchant-data-system
```

分享給其他人，讓更多人使用您的專案！🚀

---

**最後更新：** 2025-10-27
