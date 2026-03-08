# Slay the Spire 2 台灣正體中文語言包

將 Slay the Spire 2 的簡體中文翻譯轉換為台灣正體中文。

由於遊戲目前不支援直接新增語言，本語言包透過覆蓋簡體中文 (`zhs`) 的方式實現。

## 安裝方式

1. 下載本專案的 `localization_override/zhs/` 資料夾
2. 複製到遊戲的 localization override 目錄：
   - **macOS**: `~/Library/Application Support/SlayTheSpire2/localization_override/zhs/`
   - **Windows**: `%APPDATA%\SlayTheSpire2\localization_override\zhs\`
3. 在遊戲中將語言設定為「中文」即可看到正體中文

## 轉換原理

使用 [OpenCC](https://github.com/BYVoid/OpenCC) 的 `s2twp` 設定
（簡體→台灣正體，含慣用詞轉換），搭配自訂字典處理遊戲專有名詞。

自訂字典分為三層，對應 OpenCC 轉換鏈的三個步驟：

1. `custom-st.txt` — 簡繁轉換修正、遊戲專有名詞、標點符號
2. `custom-tw.txt` — 台灣慣用詞、角色名稱
3. `custom-twvar.txt` — 異體字保護（如手裏劍）

## 專案架構

```
├── main.ts                    # CLI 工具
├── opencc/
│   ├── s2twp-custom.json      # 自訂 OpenCC 設定檔
│   ├── custom-st.txt          # Step 1 自訂字典（簡體 key）
│   ├── custom-tw.txt          # Step 2 自訂字典（繁體 key）
│   └── custom-twvar.txt       # Step 3 自訂字典（異體字保護）
├── localization_override/
│   └── zhs/                   # 轉換後的正體中文（可直接使用）
├── sts2-localization/         # 從遊戲 PCK 解出的官方多語系翻譯
└── sts1-localization/         # STS1 官方翻譯（正體中文參考用）
```

## 開發

需要 [Bun](https://bun.sh/) 和 [OpenCC](https://github.com/BYVoid/OpenCC)。
可透過 `bun main.ts --help` 查看所有指令。

### 更新流程

遊戲更新後，依序執行：

```sh
bun main.ts extract
bun main.ts convert
bun main.ts install
```

### 調整字典

透過 `check-sts1` 找出 OpenCC 轉換與 STS1 官方翻譯的差異，再將需要修正的詞條加入對應的自訂字典檔。
