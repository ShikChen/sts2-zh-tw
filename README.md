# Slay the Spire 2 台灣正體中文語言包

將 Slay the Spire 2 的簡體中文翻譯轉換為台灣正體中文。

由於遊戲目前不支援直接新增語言，本語言包透過覆蓋簡體中文 (`zhs`) 的方式實現。

## 專案架構

```
├── main.ts                    # CLI 工具（extract / convert / install）
├── sts2-localization/         # 從遊戲 PCK 解出的官方多語系翻譯
├── sts1-localization/         # STS1 官方翻譯（正體中文參考用）
└── localization_override/
    └── zhs/                   # 轉換後的正體中文輸出
```

## 使用方式

需要 [Bun](https://bun.sh/) 和 [OpenCC](https://github.com/BYVoid/OpenCC)。

### `bun main.ts extract`

從本機安裝的 STS2 遊戲中解析 PCK 檔案，將所有語系的 localization JSON 解出至 `sts2-localization/`。

### `bun main.ts convert`

使用 OpenCC 的 `s2twp` 設定檔（簡體轉台灣正體，含慣用詞轉換）將 `sts2-localization/zhs/` 中的檔案轉換，輸出至 `localization_override/zhs/`。

### `bun main.ts install`

將 `localization_override/zhs/` 複製到遊戲的 localization override 目錄（`~/Library/Application Support/SlayTheSpire2/localization_override/zhs/`）。

## 更新流程

遊戲更新後，依序執行：

```sh
bun main.ts extract
bun main.ts convert
bun main.ts install
```
