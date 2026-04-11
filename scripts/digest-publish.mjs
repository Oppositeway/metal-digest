/**
 * digest-publish.mjs
 * Creates a git branch, commits the new digest files, pushes, and opens a PR.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function exec(cmd) {
  console.log(`[publish] $ ${cmd}`);
  return execSync(cmd, { cwd: projectRoot, encoding: 'utf-8' }).trim();
}

export async function run() {
  const date = new Date().toISOString().slice(0, 10);
  const tmpDir = `/tmp/digest-${date}`;
  const metaPath = `${tmpDir}/meta.json`;

  if (!fs.existsSync(metaPath)) {
    throw new Error(`meta.json not found at ${metaPath}. Run previous steps first.`);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const branch = `digest/${date}`;

  exec(`git config user.email "digest-bot@metal-digest.com"`);
  exec(`git config user.name "Metal Digest Bot"`);
  exec(`git checkout -b ${branch}`);

  const filesToAdd = [meta.articlePath];
  if (meta.coverPath) filesToAdd.push(meta.coverPath);

  // Convert absolute paths to relative for git add
  const relPaths = filesToAdd.map((p) => path.relative(projectRoot, p));
  exec(`git add ${relPaths.map((p) => `"${p}"`).join(' ')}`);
  exec(`git commit -m "digest: ${date} metal news"`);
  exec(`git push origin ${branch}`);

  const prBody = [
    `**${meta.title}**`,
    '',
    meta.description,
    '',
    `Slug: \`${meta.slug}\``,
    `Tags: ${meta.tags}`,
  ].join('\n');

  const prUrl = exec(
    `gh pr create --title "Дайджест ${date}" --body "${prBody.replace(/"/g, '\\"')}" --base main`
  );

  console.log(`[publish] PR created: ${prUrl}`);
}
