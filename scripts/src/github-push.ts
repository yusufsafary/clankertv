import { readFileSync, readdirSync, statSync } from "fs";
import { createHash } from "crypto";
import { join, relative } from "path";

const TOKEN = process.env.GITHUB_TOKEN!;
const REPO_URL = process.env.GITHUB_REPO_URL!;

if (!TOKEN || !REPO_URL) {
  console.error("Missing GITHUB_TOKEN or GITHUB_REPO_URL");
  process.exit(1);
}

const repoPath = REPO_URL.replace("https://github.com/", "").replace(/\.git$/, "").trim();
const [owner, repo] = repoPath.split("/");
console.log(`Pushing to: ${owner}/${repo}`);

const BASE = "https://api.github.com";

async function apiReq(method: string, endpoint: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as unknown;
  if (!res.ok) {
    const msg = typeof data === "object" && data !== null && "message" in data
      ? (data as { message: string }).message
      : JSON.stringify(data).slice(0, 150);
    throw new Error(`${res.status}: ${msg}`);
  }
  return data;
}

interface FileInfo { sha: string; size: number; }
type TreeResponse = { tree: Array<{ path: string; sha: string; size?: number; type: string }> };

// Fetch the entire repo tree at once to avoid per-file GET requests
async function getRepoTree(branch: string): Promise<Map<string, FileInfo>> {
  const map = new Map<string, FileInfo>();
  try {
    const data = await apiReq("GET", `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`) as TreeResponse;
    for (const item of data.tree) {
      if (item.type === "blob") {
        map.set(item.path, { sha: item.sha, size: item.size ?? 0 });
      }
    }
  } catch (err) {
    console.warn("Could not fetch repo tree:", err);
  }
  return map;
}

// Compute git blob SHA (same as git hash-object)
function gitBlobSha(content: Buffer): string {
  const header = `blob ${content.length}\0`;
  const store = Buffer.concat([Buffer.from(header), content]);
  return createHash("sha1").update(store).digest("hex");
}

const IGNORE = new Set([
  "node_modules", ".git", "dist", "build", ".pnpm-store",
  "pnpm-lock.yaml", ".replit", "replit.nix", ".cache",
  ".local", "__pycache__", ".DS_Store", ".upm"
]);

function walkDir(dir: string, base: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (IGNORE.has(entry) || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      results.push(...walkDir(full, base));
    } else {
      if (stat.size > 500_000) continue;
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const repoInfo = await apiReq("GET", `/repos/${owner}/${repo}`) as { default_branch?: string };
  const branch = repoInfo.default_branch ?? "main";
  console.log(`Branch: ${branch}`);

  console.log("Fetching current repo tree...");
  const existingTree = await getRepoTree(branch);
  console.log(`Repo has ${existingTree.size} existing files`);

  const workspace = "/home/runner/workspace";
  const files = walkDir(workspace, workspace);
  console.log(`Local files to process: ${files.length}\n`);

  let uploaded = 0, unchanged = 0, skipped = 0, failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relPath = relative(workspace, file);

    let raw: Buffer;
    try {
      raw = readFileSync(file);
    } catch {
      skipped++;
      continue;
    }

    const localSha = gitBlobSha(raw);
    const existing = existingTree.get(relPath);

    // Skip if unchanged
    if (existing && existing.sha === localSha) {
      unchanged++;
      process.stdout.write(`\r  [${i + 1}/${files.length}] ${uploaded} uploaded, ${unchanged} unchanged, ${failed} failed   `);
      continue;
    }

    const content = raw.toString("base64");
    const sha = existing?.sha;

    try {
      await apiReq("PUT", `/repos/${owner}/${repo}/contents/${relPath}`, {
        message: `upload: ${relPath}`,
        content,
        sha,
        branch,
      });
      uploaded++;
    } catch (err) {
      failed++;
      console.error(`\n  FAIL ${relPath}: ${err}`);
    }

    process.stdout.write(`\r  [${i + 1}/${files.length}] ${uploaded} uploaded, ${unchanged} unchanged, ${failed} failed   `);
  }

  console.log(`\n\nDone!`);
  console.log(`  ${uploaded} uploaded (changed)`);
  console.log(`  ${unchanged} unchanged (skipped)`);
  console.log(`  ${skipped} unreadable`);
  console.log(`  ${failed} failed`);
  console.log(`\n→ https://github.com/${owner}/${repo}`);
}

main().catch(err => { console.error("\nFatal:", err); process.exit(1); });
