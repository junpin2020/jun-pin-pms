均品工程管理系統－Cloudflare 手機／電腦同步版

這個版本會把案場、工程日報、照片、簽名與公司章同步到 Cloudflare D1。
手機與電腦開同一個 Cloudflare Pages 網址，並輸入同一組同步密碼即可。

最簡單部署方式（VS Code 終端機）：

1. 解壓縮本資料夾，使用 VS Code 開啟。
2. 在 VS Code 上方選單「終端機」→「新增終端機」。
3. 依序輸入：

   npm install -D wrangler
   npx wrangler login
   npx wrangler d1 create jun-pin-pms-db

4. 上一步會顯示 database_id，把它貼進 wrangler.toml 的 database_id。
5. 建立同步密碼（請把 你的密碼 改成自己記得的密碼）：

   npx wrangler pages secret put SYNC_KEY --project-name jun-pin-pms

6. 部署：

   npx wrangler pages deploy . --project-name jun-pin-pms

7. 若 Cloudflare 要你選擇或建立 Pages 專案，名稱使用 jun-pin-pms。
8. 部署後，用手機與電腦開同一網址，兩邊輸入同一組同步密碼。

重要：
- D1 綁定名稱必須是 DB。
- SYNC_KEY 必須設定，否則同步不會運作。
- 第一次在原本有資料的電腦開啟時，舊資料會自動上傳到雲端。
- 右下角顯示「已同步」才代表雲端儲存完成。
