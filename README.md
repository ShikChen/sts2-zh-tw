# Slay the Spire 2 台灣正體中文語言包

將 Slay the Spire 2 的簡體中文翻譯轉換為台灣正體中文。

由於遊戲目前不支援直接新增語言，本語言包透過覆蓋簡體中文 (`zhs`) 的方式實現。

## 安裝方式

1. 下載本專案的 `localization_override/zhs/` 資料夾
2. 複製到遊戲的 localization override 目錄：
   - **macOS**:
     `~/Library/Application Support/SlayTheSpire2/localization_override/zhs/`
   - **Windows**:
     `%APPDATA%\SlayTheSpire2\localization_override\zhs\`
3. 在遊戲中將語言設定為「中文」即可看到正體中文

## 轉換原理

使用 [OpenCC](https://github.com/BYVoid/OpenCC) 的 `s2twp` 設定
（簡體→台灣正體，含慣用詞轉換），搭配自訂字典處理遊戲專有名詞。

OpenCC 的轉換分為兩個階段：

### 分詞（mmseg）

轉換前，OpenCC 先用最大正向匹配（mmseg）將輸入文字切成詞組。
分詞字典決定了哪些字會被當成一個整體處理，
例如「回复」會被切成一個詞而非「回」+「复」兩個字。
分詞只看字典的 key（第一欄），不使用轉換值。

分詞結果直接影響後續轉換：
如果一個詞沒有被正確分詞，就無法被詞組字典匹配到，只能逐字轉換，可能導致錯誤。
因此 `custom-fixes.txt` 和 `custom-st.txt` 同時出現在分詞字典和轉換字典中。

### 轉換鏈

分詞完成後，依序經過三個轉換步驟。
每一步在每個詞組內部獨立做最大正向匹配替換，無法跨越詞組邊界：

1. 簡→繁：`custom-fixes.txt` → `custom-st.txt`
   → `STPhrases` → `STCharacters`
2. 台灣慣用詞：`custom-tw.txt` → `TWPhrases`
3. 台灣異體字：`custom-twvar.txt` → `TWVariants`

同一步驟中，字典按順序查找，第一個匹配的結果生效。

### 自訂字典

| 檔案               | 階段          | key 文字 | 用途                                  |
| ------------------ | ------------- | -------- | ------------------------------------- |
| `custom-fixes.txt` | 分詞 + 步驟 1 | 簡體     | 修正上游簡中原文的錯字、漏字          |
| `custom-st.txt`    | 分詞 + 步驟 1 | 簡體     | 簡繁轉換修正、遊戲專有名詞、標點符號  |
| `custom-tw.txt`    | 步驟 2        | 繁體     | 台灣慣用詞、擋住 TWPhrases 的過度轉換 |
| `custom-twvar.txt` | 步驟 3        | 繁體     | 異體字保護（如手裏劍）                |

## 專案架構

```
├── main.ts                    # CLI 工具
├── opencc/
│   ├── s2twp-custom.json      # 自訂 OpenCC 設定檔
│   ├── custom-fixes.txt       # 上游原文修正（簡體 key）
│   ├── custom-st.txt          # 簡繁轉換自訂字典（簡體 key）
│   ├── custom-tw.txt          # 台灣慣用詞自訂字典（繁體 key）
│   └── custom-twvar.txt       # 異體字保護（繁體 key）
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
