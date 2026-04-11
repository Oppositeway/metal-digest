/**
 * digest-write.mjs
 * Reads search-results.json, sends to Claude, writes a .md digest article.
 */
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export async function run() {
  const date = new Date().toISOString().slice(0, 10);
  const tmpDir = `/tmp/digest-${date}`;
  const searchResultsPath = `${tmpDir}/search-results.json`;

  if (!fs.existsSync(searchResultsPath)) {
    throw new Error(`search-results.json not found at ${searchResultsPath}. Run digest-search.mjs first.`);
  }

  const searchResults = JSON.parse(fs.readFileSync(searchResultsPath, 'utf-8'));
  const claudeMd = fs.readFileSync(path.join(projectRoot, 'CLAUDE.md'), 'utf-8');

  const client = new Anthropic();

  console.log('[write] calling Claude to generate digest...');
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `${claudeMd}

You are writing an automated digest for the Metal Digest site.
Follow the pipeline rules in the ## Пайплайн section exactly.
Return ONLY the raw Markdown file content — frontmatter + body. No explanation, no code fences.`,
    messages: [
      {
        role: 'user',
        content: `Today is ${date}. Here are the news items found for the past 3 days:

${JSON.stringify(searchResults, null, 2)}

Write a metal news digest in Russian following the pipeline format rules.
Select the 5 most significant items (3 releases/announcements + 1-2 tours).
Fill all frontmatter fields completely: title, description, pubDate, type, tags, sources.`,
      },
    ],
  });

  const markdown = message.content[0].text.trim();

  // Extract frontmatter title and tags for meta.json
  const titleMatch = markdown.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
  const tagsMatch = markdown.match(/^tags:\s*\[(.+?)\]/m);
  const descMatch = markdown.match(/^description:\s*['"]?(.+?)['"]?\s*$/m);

  const title = titleMatch ? titleMatch[1] : `Дайджест — ${date}`;
  const tags = tagsMatch ? tagsMatch[1] : '';
  const description = descMatch ? descMatch[1] : '';
  const slug = `${date}-metal-digest`;

  // Write markdown article
  const articlePath = path.join(projectRoot, `src/content/blog/${slug}.md`);
  fs.writeFileSync(articlePath, markdown);
  console.log(`[write] article written to ${articlePath}`);

  // Write meta.json for subsequent steps
  const meta = { date, slug, title, tags, description, articlePath };
  fs.writeFileSync(`${tmpDir}/meta.json`, JSON.stringify(meta, null, 2));
  console.log(`[write] meta.json written to ${tmpDir}/meta.json`);
}
