// npm only publishes the README and LICENSE found next to package.json, so `prepack` copies the
// repo-level ones in. The copies are gitignored; the files at the repo root are the source.
import { copyFileSync } from "node:fs";

for (const file of ["README.md", "LICENSE"]) {
  copyFileSync(
    new URL(`../../../${file}`, import.meta.url),
    new URL(`../${file}`, import.meta.url)
  );
}
