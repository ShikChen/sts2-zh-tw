import * as z from "zod";
import { parseArgs } from "zod-parse-args";
import { Glob, $ } from "bun";
import { mkdir, cp } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

const LOCALIZATION_DIR = join(import.meta.dir, "sts2-localization");
const OUT_DIR = join(import.meta.dir, "localization_override/zhs");
const OPENCC_CONFIG = "s2twp";

const GAME_DATA_DIR = join(
  homedir(),
  "Library/Application Support/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.app/Contents/Resources",
);
const PCK_FILENAME = "Slay the Spire 2.pck";

const GAME_OVERRIDE_DIR = join(
  homedir(),
  "Library/Application Support/SlayTheSpire2/localization_override",
);

const args = parseArgs(
  z.discriminatedUnion("command", [
    z
      .object({ command: z.literal("extract") })
      .describe("Extract localization from game PCK file"),
    z
      .object({ command: z.literal("convert") })
      .describe("Convert zhs to zh-tw using OpenCC"),
    z
      .object({ command: z.literal("install") })
      .describe("Install converted files to game directory"),
  ]),
  { name: "bun main.ts" },
);

// --- PCK parser ---

const PCK_MAGIC = 0x43504447; // "GDPC" in little-endian

interface PckEntry {
  path: string;
  offset: number;
  size: number;
}

function parsePckDirectory(buffer: ArrayBuffer): {
  entries: PckEntry[];
  fileOffsetBase: number;
} {
  const view = new DataView(buffer);
  let pos = 0;

  const magic = view.getUint32(pos, true);
  pos += 4;
  if (magic !== PCK_MAGIC) {
    throw new Error(`Not a PCK file (magic: 0x${magic.toString(16)})`);
  }

  const formatVersion = view.getUint32(pos, true);
  pos += 4;
  // Skip major, minor, patch godot version
  pos += 12;

  let fileOffsetBase = 0;
  if (formatVersion >= 2) {
    // Skip flags
    pos += 4;
    fileOffsetBase = Number(view.getBigUint64(pos, true));
    pos += 8;
  }

  if (formatVersion >= 3) {
    const directoryOffset = Number(view.getBigUint64(pos, true));
    pos = directoryOffset;
  } else {
    // Skip 16 reserved uint32s
    pos += 64;
  }

  const fileCount = view.getUint32(pos, true);
  pos += 4;

  const entries: PckEntry[] = [];
  for (let i = 0; i < fileCount; i++) {
    const pathLen = view.getUint32(pos, true);
    pos += 4;

    const pathBytes = new Uint8Array(buffer, pos, pathLen);
    const path = new TextDecoder("utf-8")
      .decode(pathBytes)
      .replace(/\x00/g, "");
    pos += pathLen;
    // Align to 4 bytes
    pos += (4 - (pathLen % 4)) % 4;

    const offset = Number(view.getBigUint64(pos, true));
    pos += 8;
    const size = Number(view.getBigUint64(pos, true));
    pos += 8;
    // Skip MD5 (16 bytes)
    pos += 16;
    // Skip flags (4 bytes) for version >= 2
    if (formatVersion >= 2) pos += 4;

    entries.push({ path, offset, size });
  }

  return { entries, fileOffsetBase };
}

// --- Commands ---

async function extract() {
  const pckPath = join(GAME_DATA_DIR, PCK_FILENAME);
  if (!existsSync(pckPath)) {
    console.error(`PCK file not found: ${pckPath}`);
    process.exit(1);
  }

  console.log(`Parsing ${PCK_FILENAME}...`);
  const buffer = await Bun.file(pckPath).arrayBuffer();
  const { entries, fileOffsetBase } = parsePckDirectory(buffer);

  const locEntries = entries.filter(
    (e) => e.path.startsWith("localization/") && e.path.endsWith(".json"),
  );
  console.log(
    `Found ${locEntries.length} localization files (${entries.length} total in PCK)`,
  );

  let count = 0;
  for (const entry of locEntries) {
    const outPath = join(
      LOCALIZATION_DIR,
      entry.path.replace("localization/", ""),
    );
    await mkdir(join(outPath, ".."), { recursive: true });

    const fileData = new Uint8Array(
      buffer,
      fileOffsetBase + entry.offset,
      entry.size,
    );
    await Bun.write(outPath, fileData);
    count++;
  }

  console.log(`Extracted ${count} files to ${LOCALIZATION_DIR}`);
}

async function convert() {
  const srcDir = join(LOCALIZATION_DIR, "zhs");
  await mkdir(OUT_DIR, { recursive: true });

  const glob = new Glob("*.json");
  const files = Array.from(glob.scanSync(srcDir)).sort();

  console.log(
    `Converting ${files.length} files with opencc (${OPENCC_CONFIG})...`,
  );

  for (const file of files) {
    const srcPath = join(srcDir, file);
    const outPath = join(OUT_DIR, file);

    const result = await $`opencc -c ${OPENCC_CONFIG} -i ${srcPath}`.text();
    await Bun.write(outPath, result);

    console.log(`  ${file}`);
  }

  console.log(`Done. Output: ${OUT_DIR}`);
}

async function install() {
  if (!existsSync(GAME_OVERRIDE_DIR)) {
    console.error(`Game directory not found: ${GAME_OVERRIDE_DIR}`);
    process.exit(1);
  }

  const destDir = join(GAME_OVERRIDE_DIR, "zhs");

  const glob = new Glob("*.json");
  const files = Array.from(glob.scanSync(OUT_DIR)).sort();

  if (files.length === 0) {
    console.error("No converted files found. Run `bun main.ts convert` first.");
    process.exit(1);
  }

  await cp(OUT_DIR, destDir, { recursive: true });

  console.log(`Installed ${files.length} files to ${destDir}`);
}

switch (args.command) {
  case "extract":
    await extract();
    break;
  case "convert":
    await convert();
    break;
  case "install":
    await install();
    break;
}
