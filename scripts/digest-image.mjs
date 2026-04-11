/**
 * digest-image.mjs
 * STUB — Ступень 5: заменить на Replicate API.
 *
 * Сейчас копирует placeholder-cover.jpg как обложку дайджеста
 * и добавляет heroImage в frontmatter статьи.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export async function run() {
  const date = new Date().toISOString().slice(0, 10);
  const tmpDir = `/tmp/digest-${date}`;
  const metaPath = `${tmpDir}/meta.json`;

  if (!fs.existsSync(metaPath)) {
    throw new Error(`meta.json not found at ${metaPath}. Run digest-write.mjs first.`);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const coverFilename = `${date}-cover.jpg`;
  const coverDest = path.join(projectRoot, `src/assets/blog/${coverFilename}`);

  // STUB: copy placeholder instead of generating with Replicate
  const placeholder = path.join(projectRoot, 'src/assets/placeholder-cover.jpg');
  fs.copyFileSync(placeholder, coverDest);
  console.log(`[image] stub: placeholder cover copied to ${coverDest}`);

  // Add heroImage to article frontmatter
  const articlePath = meta.articlePath;
  let content = fs.readFileSync(articlePath, 'utf-8');

  // Insert heroImage after pubDate line if not already present
  if (!content.includes('heroImage:')) {
    content = content.replace(
      /(pubDate:\s*['"]?\d{4}-\d{2}-\d{2}['"]?)/,
      `$1\nheroImage: ../../assets/blog/${coverFilename}`
    );
    fs.writeFileSync(articlePath, content);
    console.log(`[image] heroImage added to ${articlePath}`);
  }

  // Update meta.json with cover path
  meta.coverPath = coverDest;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}
