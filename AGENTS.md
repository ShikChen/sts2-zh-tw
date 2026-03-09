# AGENTS.md

Instructions for AI coding agents working with this codebase.

CLAUDE.md is a symlink to this file.

## Formatting

Run `bun run format` to format code with prettier.

## CLI (`main.ts`)

Run with `bun main.ts <command>`. Available commands:

- `extract` — Extract localization files from game PCK
- `convert` — Convert zhs to zh-tw using OpenCC with custom dictionaries
- `install` — Copy converted files to game override directory
- `check-sts1` — Compare OpenCC output against STS1 official zht

Run `bun main.ts --help` for details.

## tmp/ directory

Put one-shot experiments in ./tmp/. It's ignored by git.

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
bunx opensrc <package>              # npm package (e.g., bunx opensrc zod)
bunx opensrc pypi:<package>         # Python package (e.g., bunx opensrc pypi:requests)
bunx opensrc crates:<package>       # Rust crate (e.g., bunx opensrc crates:serde)
bunx opensrc github:<owner>/<repo>  # GitHub repo (e.g., bunx opensrc github:vercel/ai)
```

<!-- opensrc:end -->
