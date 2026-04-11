/**
 * digest-search.mjs
 * STUB — Ступень 5: заменить на реальный Tavily API + Claude-генерацию запросов.
 *
 * Сейчас записывает фиксированные тестовые данные в /tmp/digest-YYYY-MM-DD/search-results.json.
 */
import fs from 'node:fs';

export async function run() {
  const date = new Date().toISOString().slice(0, 10);
  const outDir = `/tmp/digest-${date}`;
  fs.mkdirSync(outDir, { recursive: true });

  const results = [
    {
      title: 'Obituary announce North American tour',
      url: 'https://blabbermouth.net/obituary-tour-2026',
      content: 'Florida death metal veterans Obituary have announced a 24-date North American tour starting April 4 in Tampa.',
      publishedDate: date,
    },
    {
      title: 'Paradise Lost release new album "Obsidian"',
      url: 'https://loudwire.com/paradise-lost-obsidian',
      content: 'British doom/gothic metal legends Paradise Lost have released their 13th studio album "Obsidian" via Nuclear Blast.',
      publishedDate: date,
    },
    {
      title: 'Candlemass return with original vocalist',
      url: 'https://metal-archives.com/candlemass-2026',
      content: 'Swedish epic doom band Candlemass have released "Sweet Evil Sun" featuring original vocalist Johan Längqvist on Napalm Records.',
      publishedDate: date,
    },
    {
      title: 'Immolation sign to Nuclear Blast, announce new album',
      url: 'https://metalinjection.net/immolation-nuclear-blast',
      content: 'New York death metal veterans Immolation have signed to Nuclear Blast and announced their new album "Descent" due April 10.',
      publishedDate: date,
    },
    {
      title: 'At The Gates announce new album on Century Media',
      url: 'https://loudersound.com/at-the-gates-2026',
      content: 'Swedish melodic death metal founders At The Gates have announced "The Ghost Of A Future Dead" via Century Media, releasing April 24.',
      publishedDate: date,
    },
    {
      title: 'Melvins and Napalm Death release collaborative album',
      url: 'https://pitchfork.com/melvins-napalm-death',
      content: 'Melvins and Napalm Death have released "Savage Imperial Death March" via Ipecac Recordings, blending sludge, grind and noise.',
      publishedDate: date,
    },
  ];

  fs.writeFileSync(`${outDir}/search-results.json`, JSON.stringify(results, null, 2));
  console.log(`[search] stub: wrote ${results.length} results to ${outDir}/search-results.json`);
}
