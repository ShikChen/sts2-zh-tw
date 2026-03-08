import * as z from "zod";
import { parseArgs } from "zod-parse-args";
import { Glob, $ } from "bun";
import { mkdir, cp } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync } from "node:fs";

const SRC_DIR = join(import.meta.dir, "sts2-localization/zhs");
const OUT_DIR = join(import.meta.dir, "localization_override/zhs");
const OPENCC_CONFIG = "s2twp";

const GAME_OVERRIDE_DIR = join(
  homedir(),
  "Library/Application Support/SlayTheSpire2/localization_override",
);

const args = parseArgs(
  z.discriminatedUnion("command", [
    z
      .object({ command: z.literal("convert") })
      .describe("Convert zhs to zh-tw using OpenCC"),
    z
      .object({ command: z.literal("install") })
      .describe("Install converted files to game directory"),
  ]),
  { name: "bun main.ts" },
);

async function convert() {
  await mkdir(OUT_DIR, { recursive: true });

  const glob = new Glob("*.json");
  const files = Array.from(glob.scanSync(SRC_DIR)).sort();

  console.log(
    `Converting ${files.length} files with opencc (${OPENCC_CONFIG})...`,
  );

  for (const file of files) {
    const srcPath = join(SRC_DIR, file);
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
  case "convert":
    await convert();
    break;
  case "install":
    await install();
    break;
}
