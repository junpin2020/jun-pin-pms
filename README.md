# 均品室內設計 PMS

## 目前功能
- 響應式手機／電腦介面
- 工程新增、修改、刪除
- 工程進度
- 每日施工日誌
- 照片上傳
- GPS
- 業主與設計公司簽名
- 待辦事項
- 備份匯入／匯出
- PWA 離線快取
- 列印

## 直接使用
雙擊 `index.html` 可開啟，但 PWA 與部分手機功能建議用網站伺服器開啟。

## 上傳 GitHub
把整個資料夾內容上傳到 GitHub repository。

## Firebase Hosting
1. 安裝 Node.js
2. 安裝 Firebase CLI：
   npm install -g firebase-tools
3. 登入：
   firebase login
4. 在專案資料夾執行：
   firebase init hosting
5. public directory 輸入 `.`
6. single-page app 選 `No`
7. 部署：
   firebase deploy

## Firebase 雲端同步
將 Firebase Web App 設定貼入 `firebase-config.js`。
目前此版本以 localStorage 儲存；後續可再接 Firestore、Storage、Authentication。
