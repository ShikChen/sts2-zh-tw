import { Glob, $ } from "bun";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const SRC_DIR = join(import.meta.dir, "sts2-localization/zhs");
const OUT_DIR = join(import.meta.dir, "localization_override/zhs");
const OPENCC_CONFIG = "s2twp";

async function main() {
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

main();
