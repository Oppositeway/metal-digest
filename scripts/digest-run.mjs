/**
 * digest-run.mjs
 * Orchestrator: runs all pipeline steps sequentially.
 * On failure — sends Telegram notification and exits with code 1.
 */
import { sendTelegram } from './lib/telegram.mjs';

const steps = [
  { name: 'search',  run: () => import('./digest-search.mjs').then((m) => m.run()) },
  { name: 'write',   run: () => import('./digest-write.mjs').then((m) => m.run()) },
  { name: 'image',   run: () => import('./digest-image.mjs').then((m) => m.run()) },
  { name: 'publish', run: () => import('./digest-publish.mjs').then((m) => m.run()) },
];

console.log('[run] Metal Digest pipeline starting...');

for (const step of steps) {
  console.log(`[run] step: ${step.name}`);
  try {
    await step.run();
  } catch (err) {
    const msg = `<b>Metal Digest pipeline failed</b>\nStep: <code>${step.name}</code>\n\n${err.message}`;
    console.error(`[run] FAILED at step "${step.name}": ${err.message}`);
    await sendTelegram(msg);
    process.exit(1);
  }
}

console.log('[run] pipeline completed successfully.');
