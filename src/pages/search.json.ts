import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')         // images first
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → label
    .replace(/`{3}[\s\S]*?`{3}/gm, '')       // fenced code blocks
    .replace(/`[^`]+`/g, '')                 // inline code
    .replace(/^#{1,6}\s+/gm, '')             // headings
    .replace(/\*{3}(.+?)\*{3}/g, '$1')       // bold+italic
    .replace(/\*\*(.+?)\*\*/g, '$1')         // bold
    .replace(/\*(.+?)\*/g, '$1')             // italic
    .replace(/_{2}(.+?)_{2}/g, '$1')         // bold underscore
    .replace(/_(.+?)_/g, '$1')               // italic underscore
    .replace(/^[-*+]\s+/gm, '')              // unordered lists
    .replace(/^\d+\.\s+/gm, '')              // ordered lists
    .replace(/^>\s+/gm, '')                  // blockquotes
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');

  const index = posts.map((post) => ({
    id: post.id,
    url: `/blog/${post.id}/`,
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags.join(' '),
    body: stripMarkdown(post.body ?? ''),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
