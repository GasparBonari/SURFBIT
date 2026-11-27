import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const project = fileURLToPath(new URL("../", import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), "surfbit-art-"));
const modules = join(scratch, "modules");
const controller = new AbortController();
let receiveResult;
const result = new Promise((resolve) => { receiveResult = resolve; });
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, "http://localhost").pathname;
    if (path === "/") {
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end('<script type="module" src="/scripts/packArt"></script>');
      return;
    }
    if (path === "/result" && request.method === "POST" && request.headers["content-type"] === "application/json") {
      let body = "";
      request.setEncoding("utf8");
      for await (const chunk of request) body += chunk;
      response.end();
      receiveResult(body);
      return;
    }
    if (!/^\/(scripts|src)\/[\w/-]+$/.test(path)) {
      response.writeHead(404).end();
      return;
    }
    const contents = await readFile(join(modules, path + ".js"));
    response.setHeader("Content-Type", "text/javascript");
    response.end(contents);
  } catch {
    response.writeHead(404).end();
  }
});

let chrome;
try {
  await run(process.execPath, [
    "node_modules/typescript/bin/tsc", "scripts/packArt.ts", "--outDir", modules, "--strict",
    "--target", "ES2022", "--module", "ESNext", "--moduleResolution", "bundler", "--skipLibCheck",
  ], { cwd: project });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  chrome = run(process.env.SURFBIT_CHROMIUM ?? "google-chrome", [
    "--headless", "--disable-gpu",
    `--user-data-dir=${join(scratch, "chromium")}`, `http://127.0.0.1:${server.address().port}`,
  ], { signal: controller.signal, timeout: 30_000 });
  const output = await Promise.race([result, chrome.then(() => {
    throw new Error("Chromium closed before exporting the world art");
  })]);
  const { tiles, sprites, frames, error } = JSON.parse(output);
  if (error) throw new Error(error);

  const destination = join(project, "public/assets/world");
  await mkdir(destination, { recursive: true });
  const entries = Object.entries(frames).map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`);
  await Promise.all([
    writeFile(join(destination, "tiles.png"), Buffer.from(tiles, "base64")),
    writeFile(join(destination, "sprites.png"), Buffer.from(sprites, "base64")),
    writeFile(join(destination, "sprites.json"), `{\n  "frames": {\n${entries.join(",\n")}\n  }\n}\n`),
  ]);
  console.log(`Exported the tileset and ${entries.length} sprite textures to public/assets/world`);
} finally {
  controller.abort();
  await chrome?.catch(() => {});
  server.close();
  server.closeAllConnections();
  await rm(scratch, { recursive: true, force: true, maxRetries: 3 });
}
