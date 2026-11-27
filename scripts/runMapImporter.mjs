import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

try {
  const [input, ...extra] = process.argv.slice(2);
  if (!input || extra.length) throw new Error("Usage: npm run --silent map:import -- <map.tmj>");
  const raw = JSON.parse(readFileSync(input, "utf8"));
  const project = fileURLToPath(new URL("../", import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), "surfbit-map-"));

  try {
    // Compile with the installed TypeScript so the importer also runs on Node 20.
    const result = spawnSync(process.execPath, [
      "node_modules/typescript/bin/tsc", "scripts/tiled-to-mapdef.ts", "--outDir", scratch,
      "--strict", "--target", "ES2022", "--module", "commonjs", "--skipLibCheck",
    ], { cwd: project, encoding: "utf8" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stdout.trim() || result.stderr.trim() || "TypeScript compilation failed");

    const require = createRequire(import.meta.url);
    const { tiledToMapDef } = require(join(scratch, "scripts/tiled-to-mapdef.js"));
    const def = tiledToMapDef(raw);
    process.stdout.write(`import type { MapDef } from "./types";\n\nconst def: MapDef = ${JSON.stringify(def, null, 2)};\n\nexport default def;\n`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
} catch (error) {
  console.error(`Tiled import failed: ${error.message}`);
  process.exitCode = 1;
}
