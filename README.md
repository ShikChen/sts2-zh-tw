# Slay the Spire 2 台灣正體中文語言包

將 Slay the Spire 2 的簡體中文翻譯轉換為台灣正體中文。

由於遊戲目前不支援直接新增語言，本語言包透過覆蓋簡體中文 (`zhs`) 的方式實現。

## 安裝方式

將 `localization_override/zhs/` 中的所有 JSON 檔案複製到遊戲的 localization override 目錄。

## 專案架構

```
├── main.ts                    # 簡轉繁轉換腳本
├── sts2-localization/         # STS2 官方多語系翻譯（含簡體中文來源）
├── sts1-localization/         # STS1 官方翻譯（正體中文參考用）
└── localization_override/
    └── zhs/                   # 轉換後的正體中文輸出
```

## 建置方式

需要 [Bun](https://bun.sh/) 和 [OpenCC](https://github.com/BYVoid/OpenCC)。

```sh
bun main.ts
```

使用 OpenCC 的 `s2twp` 設定檔（簡體轉台灣正體，含慣用詞轉換）對 `sts2-localization/zhs/` 中的所有檔案進行轉換，輸出至 `localization_override/zhs/`。

## 更新流程

遊戲更新後，更新 `sts2-localization/` 的來源檔案，重新執行 `bun main.ts` 即可。
