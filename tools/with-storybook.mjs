/**
 * Run the browser-backed guards against a Storybook this script owns.
 *
 * Eleven of the tools under `tools/` drive a real page: a11y-audit,
 * check-standalone, check-brand-scope, check-controls, check-interactions,
 * check-panels, check-dark-contrast and the four drift guards. Every one of
 * them assumed somebody had already run `nx run storybook-host:storybook` in
 * another terminal, so in CI they did not fail — they exited 1 on a connection
 * error, which reads exactly like a real finding. That is the problem this
 * fixes: a guard nobody can run is a guard nobody trusts.
 *
 *   node tools/with-storybook.mjs                 every browser guard
 *   node tools/with-storybook.mjs a11y-audit      just that one
 *   node tools/with-storybook.mjs --keep          leave the server running
 *
 * It starts ONE Storybook and runs every guard against it, rather than each
 * guard paying the startup cost. If something is already listening on the
 * port it is reused and left alone afterwards — the common local case, where
 * the developer has their own server up and does not want this killing it.
 *
 * Node only, no new dependencies.
 */
import { spawn } from 'node:child_process';

const PORT = Number(process.env.STORYBOOK_PORT ?? 4400);
const BASE = process.env.STORYBOOK_URL ?? `http://localhost:${PORT}`;

/** Startup compiles the whole Angular library; two minutes is not generous. */
const READY_TIMEOUT_MS = Number(process.env.STORYBOOK_TIMEOUT_MS ?? 240_000);

/**
 * Every guard that needs a page, in the order a reader would want the output:
 * the broad ones first, then the per-component drift checks.
 *
 * check-controls is NOT here — it takes story ids as arguments and has no
 * meaningful "all" mode, so it stays a tool you reach for by hand.
 */
const GUARDS = [
  'a11y-audit',
  'check-standalone',
  'check-brand-scope',
  'check-dark-contrast',
  'check-interactions',
  'check-panels',
  'check-button-drift',
  'check-tag-drift',
  'check-toggle-switch-drift',
  'check-toolbar-drift',
  'check-pagination-drift',
];

const args = process.argv.slice(2);
const keep = args.includes('--keep');
const wanted = args.filter((a) => !a.startsWith('--'));
const guards = wanted.length ? wanted : GUARDS;

for (const name of guards) {
  if (!GUARDS.includes(name)) {
    console.error(`unknown guard "${name}" — one of: ${GUARDS.join(', ')}`);
    process.exit(2);
  }
}

/** Is something already serving Storybook's story index? */
async function isUp() {
  try {
    const res = await fetch(`${BASE}/index.json`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function waitUntilUp(child) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Storybook exited with ${child.exitCode} before serving`);
    }
    if (await isUp()) return;
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(
    `Storybook did not serve ${BASE}/index.json within ${READY_TIMEOUT_MS}ms`,
  );
}

function run(command, commandArgs) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, STORYBOOK_URL: BASE, SB_URL: BASE },
    });
    child.on('close', (code) => resolve(code ?? 1));
  });
}

let server;
if (await isUp()) {
  console.log(`using the Storybook already on ${BASE}`);
} else {
  console.log(`starting Storybook on ${BASE} …`);
  server = spawn(
    'pnpm',
    ['exec', 'nx', 'run', 'storybook-host:storybook', `--port=${PORT}`, '--ci'],
    { stdio: ['ignore', 'ignore', 'inherit'], shell: process.platform === 'win32' },
  );
  try {
    await waitUntilUp(server);
  } catch (error) {
    server.kill();
    console.error(String(error.message ?? error));
    process.exit(1);
  }
  console.log('Storybook is up');
}

const results = [];
for (const name of guards) {
  console.log(`\n── ${name} ───────────────────────────────────────────`);
  results.push([name, await run('node', [`tools/${name}.mjs`])]);
}

// Only tear down a server this script started. A developer's own one is
// theirs.
if (server && !keep) server.kill();

console.log('\n── summary ─────────────────────────────────────────');
for (const [name, code] of results) {
  console.log(`${code === 0 ? 'ok  ' : 'FAIL'}  ${name}`);
}

const failed = results.filter(([, code]) => code !== 0);
process.exit(failed.length ? 1 : 0);
