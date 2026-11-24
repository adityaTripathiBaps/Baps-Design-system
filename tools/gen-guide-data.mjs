// Builds data.json for the BAPS Design System guide page: every SPM audit task
// from the handoff index, every kit commit, spm-ui commits since 1 Oct 2026,
// every ui-kit component, and the rule and doc files. Nothing is typed in by
// hand, so a re-run after new commits refreshes the whole page.
//
// Usage: node tools/gen-guide-data.mjs <out.json>
// Env:   SPM_DIR (default ../spm-ui), TASKS_FILE (default ../audits/handoff/TASKS.md)
import { execSync } from 'node:child_process';
import {
  readFileSync,
  readdirSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  statSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPM = resolve(process.env.SPM_DIR ?? join(KIT, '../spm-ui'));
const TASKS = resolve(
  process.env.TASKS_FILE ?? join(KIT, '../audits/handoff/TASKS.md'),
);
const OUT = process.argv[2];
if (!OUT) {
  console.error('Usage: node tools/gen-guide-data.mjs <out.json>');
  process.exit(1);
}
if (!existsSync(TASKS)) {
  console.error(`Task index not found: ${TASKS} (set TASKS_FILE)`);
  process.exit(1);
}

const git = (repo, args) =>
  execSync(`git -C "${repo}" ${args}`, {
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  });

const parseLog = (repo, extra = '') =>
  git(repo, `log ${extra} --date=short --pretty=format:%h%x09%ad%x09%s`)
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...rest] = line.split('\t');
      const raw = rest.join('\t');
      const m = raw.match(/^(\w+)(?:\(([^)]*)\))?!?:\s*(.*)$/);
      return {
        hash,
        date,
        type: m ? m[1] : 'other',
        scope: m?.[2] ?? '',
        subject: m ? m[3] : raw,
        ats: [...new Set(raw.match(/AT-\d{3}/g) ?? [])],
      };
    });

const commits = parseLog(KIT);
const spmCommits = existsSync(SPM) ? parseLog(SPM, '--since=2026-10-01') : [];

// Tasks: the index table only; the detail sections below it repeat the IDs.
const index =
  readFileSync(TASKS, 'utf8').split('## Index')[1]?.split('\n---')[0] ?? '';
const KINDS = [
  [/^Kit:/i, 'Kit fix'],
  [/^Swap:/i, 'SPM swap'],
  [/^a11y:/i, 'Accessibility'],
  [/^DECISION/i, 'Decision'],
  [/^Sweep:/i, 'Sweep'],
  [/^spm:/i, 'SPM fix'],
];
const groupOf = (status) =>
  status === 'VERIFIED' || status === 'DONE'
    ? 'done'
    : status === 'IN-PROGRESS'
      ? 'progress'
      : status === 'OPEN'
        ? 'open'
        : 'closed';

const tasks = index
  .split('\n')
  .filter((l) => /^\| AT-\d+/.test(l))
  .map((l) => {
    const c = l.split('|').map((s) => s.trim());
    const [id, priority, rawTitle, statusRaw] = [c[1], c[2], c[3], c[4]];
    const title = rawTitle.replace(/`/g, '');
    const status = statusRaw.split(/[\s(]/)[0];
    const linked = [
      ...commits
        .filter((k) => k.ats.includes(id))
        .map((k) => ({ ...k, repo: 'kit' })),
      ...spmCommits
        .filter((k) => k.ats.includes(id))
        .map((k) => ({ ...k, repo: 'spm-ui' })),
    ]
      .map(({ hash, date, subject, repo }) => ({ hash, date, subject, repo }))
      .sort((a, b) => b.date.localeCompare(a.date));
    return {
      id,
      priority,
      title,
      statusRaw,
      status,
      group: groupOf(status),
      kind: KINDS.find(([re]) => re.test(title))?.[1] ?? 'Other',
      commits: linked,
      lastDate: linked[0]?.date ?? null,
    };
  });

// Components: one folder each under libs/ui-kit; React twin by folder name.
const compDir = join(KIT, 'libs/ui-kit/src/lib/components');
const reactSet = new Set(
  readdirSync(join(KIT, 'packages/ui-kit-react/src/lib')),
);
const components = readdirSync(compDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map(({ name }) => {
    const files = readdirSync(join(compDir, name), { recursive: true }).map(
      String,
    );
    const dates = git(
      KIT,
      `log --date=short --pretty=format:%ad -- libs/ui-kit/src/lib/components/${name}`,
    )
      .split('\n')
      .filter(Boolean);
    return {
      name,
      react: reactSet.has(name),
      stories: files.some((f) => f.endsWith('.stories.ts')),
      spec: files.some((f) => f.endsWith('.spec.ts')),
      commits: dates.length,
      lastChange: dates[0] ?? null,
    };
  });

// Rules and docs: the H1 and the first prose line of each file.
const describe = (path) => {
  const lines = readFileSync(path, 'utf8').split('\n');
  const h1 = lines.find((l) => l.startsWith('# '));
  const body = lines.find(
    (l, i) =>
      i > 0 && l.trim() && !/^[#>|`-]/.test(l.trim()) && !l.startsWith('<!--'),
  );
  return {
    title: h1 ? h1.slice(2) : '',
    summary: body ? body.trim().slice(0, 220) : '',
  };
};
const listMd = (dir, skip = []) =>
  readdirSync(join(KIT, dir))
    .filter((f) => f.endsWith('.md') && !skip.includes(f))
    .map((file) => ({ file, ...describe(join(KIT, dir, file)) }));

// Templates parity rows (T-01…) from the newest audits/parity-*.md.
const AUDITS = dirname(dirname(TASKS));
const parityFile = existsSync(AUDITS)
  ? readdirSync(AUDITS)
      .filter((f) => /^parity-\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .pop()
  : undefined;
const parity = parityFile
  ? readFileSync(join(AUDITS, parityFile), 'utf8')
      .split('\n')
      .filter((l) => /^\| T-\d+/.test(l))
      .map((l) => {
        const c = l.split('|').map((s) => s.trim());
        return {
          id: c[1],
          area: c[2],
          what: c[3].replace(/\*\*/g, ''),
          dev: c[4].replace(/\*\*/g, ''),
          local: c[5].replace(/\*\*/g, ''),
          markedDone: /\*\*DONE/.test(c[3]),
        };
      })
  : [];

// Images beside data.json: Storybook visual baselines (desktop) and the
// parity shot pairs the T-rows name. Copied so the page can serve them.
const IMG = join(dirname(resolve(OUT)), 'img');
const copy = (from, to) => {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
};
const SNAP = join(KIT, 'apps/storybook-host/visual/stories.spec.ts-snapshots');
const previews = existsSync(SNAP)
  ? readdirSync(SNAP)
      .filter((f) => /-chromium-win32\.png$/.test(f))
      .map((f) => {
        const [group, story] = f
          .replace(/-chromium-win32\.png$/, '')
          .split('--');
        copy(join(SNAP, f), join(IMG, 'sb', f));
        return {
          file: `img/sb/${f}`,
          group,
          story,
          captured: statSync(join(SNAP, f)).mtime.toISOString().slice(0, 10),
        };
      })
  : [];

const shotRoot = parityFile
  ? join(AUDITS, 'shots', parityFile.replace(/\.md$/, ''))
  : '';

// Before / after screens: every dev-X / local-X pair in the parity shot folder (and its fp/ sub-folder).
// dev = SPM dev (the app before the kit), local = spm-ui on the kit pack. The combined diff image is kept when present.
const screens = [];
if (shotRoot && existsSync(shotRoot)) {
  for (const sub of ['', 'fp']) {
    const dir = join(shotRoot, sub);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)
      .filter((n) => /^dev-.+\.png$/.test(n))
      .sort()) {
      const name = f.slice(4, -4);
      const local = join(dir, `local-${name}.png`);
      if (!existsSync(local)) continue;
      const key = (sub ? sub + '-' : '') + name;
      const diffSrc = join(dir, 'pairs', `${name}.png`);
      screens.push({
        key,
        sub,
        name,
        folder: 'Templates parity, 23 Nov',
        kind: 'dev',
        beforeSrc: join(dir, f),
        afterSrc: local,
        diffSrc: existsSync(diffSrc) ? diffSrc : null,
        captured: '2026-11-23',
      });
    }
  }
}
// Older audit folders: pair any two files whose names differ only by dev/local or before/after
// (ab-spm/ab-kit folders too). Sant-padhramani screens are out of scope and skipped.
const SHOTS = join(AUDITS, 'shots');
const FOLDER_NAMES = {
  'template-migration': 'Template migration',
  'spm-full-audit-2026-10-30': 'Full audit, 30 Oct',
  'spm-audit-2026-10-30-r2': 'Audit round 2, 30 Oct',
  'spm-visual-gaps-2026-10-29': 'Visual gaps, 29 Oct',
  'theme-root-fix': 'Theme root fix',
  'preset-ab-2026-11-02': 'Preset A/B, 2 Nov',
  batch1: 'Batch 1',
};
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
// before/after wins over dev/local, so "before-local-x" and "after-local-x" pair as a before/after.
const SIDES = [
  [/(^|[\/_-])before([\/_.-])/i, 'before'],
  [/(^|[\/_-])after([\/_.-])/i, 'after'],
  [/(^|\/)ab-spm(\/)/, 'before'],
  [/(^|\/)ab-kit(\/)/, 'after'],
  [/(^|[\/_-])(?:ref-)?dev([\/_.-])/i, 'before'],
  [/(^|[\/_-])local([\/_.-])/i, 'after'],
];
for (const folder of Object.keys(FOLDER_NAMES)) {
  const root = join(SHOTS, folder);
  if (!existsSync(root)) continue;
  const groups = new Map();
  for (const abs of walk(root).filter((f) => f.endsWith('.png'))) {
    const rel = abs.slice(root.length + 1).replace(/\\/g, '/');
    if (/sant|padhramani/i.test(rel)) continue;
    const hit = SIDES.find(([re]) => re.test(rel));
    if (!hit) continue;
    const key = rel.replace(hit[0], '$1*$2').replace(/-rootclass/, '');
    if (!groups.has(key)) groups.set(key, {});
    const g = groups.get(key);
    if (!g[hit[1]]) g[hit[1]] = abs;
    g.kind =
      SIDES.indexOf(hit) < 2
        ? 'fix'
        : SIDES.indexOf(hit) < 4
          ? 'preset'
          : 'dev';
  }
  for (const [key, g] of groups) {
    if (!g.before || !g.after) continue;
    const name = key
      .replace(/\.png$/, '')
      .replace(/\*/g, '')
      .replace(/[\/_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    screens.push({
      key: `${folder}--${name}`.replace(/[^A-Za-z0-9_.-]/g, '-'),
      sub: folder,
      folder: FOLDER_NAMES[folder],
      name,
      kind: g.kind,
      beforeSrc: g.before,
      afterSrc: g.after,
      captured: statSync(g.after).mtime.toISOString().slice(0, 10),
    });
  }
}

// Which screen a parity row names: "templates-drw-b0" is a root pair, "fp/pairs/x" an fp pair.
for (const p of parity) {
  const cell =
    readFileSync(join(AUDITS, parityFile), 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`| ${p.id} |`))
      ?.split('|')[6] ?? '';
  p.screens = cell
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^fp\/pairs\/(.+?)(\.png)?$/);
      return m ? `fp-${m[1]}` : raw.includes('/') ? null : raw;
    })
    .filter((k) => k && screens.some((s) => s.key === k));
}

// Before / after code: each spm-ui commit that moves raw PrimeNG onto kit tags, as old and new hunks with line numbers.
const parseHunks = (diff) => {
  const files = [];
  let cur = null,
    hunk = null;
  for (const line of diff.split('\n')) {
    const f = line.match(/^\+\+\+ b\/(.+)$/);
    if (f) {
      cur = { file: f[1], hunks: [] };
      files.push(cur);
      continue;
    }
    const h = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (h && cur) {
      hunk = { oldStart: +h[1], newStart: +h[2], lines: [] };
      cur.hunks.push(hunk);
      continue;
    }
    if (hunk && /^[-+ ]/.test(line) && !/^(---|\+\+\+)/.test(line))
      hunk.lines.push(line);
  }
  return files;
};
const swaps = existsSync(SPM)
  ? spmCommits
      .filter(
        (c) =>
          /baps-|kit controls|bapsTabs|bapsTooltip/i.test(c.subject) &&
          /^(refactor|feat|fix)$/.test(c.type),
      )
      .map((c) => {
        const files = parseHunks(
          git(SPM, `show -U2 --format= ${c.hash} -- "*.html" "*.ts"`),
        )
          .filter((f) => !/\.spec\.ts$|generated/.test(f.file))
          .map((f) => ({
            ...f,
            hunks: f.hunks
              .filter(
                (h) =>
                  h.lines.some((l) => l[0] === '-') &&
                  h.lines.some((l) => l[0] === '+'),
              )
              .slice(0, 2)
              .map((h) => ({ ...h, lines: h.lines.slice(0, 30) })),
          }))
          .filter((f) => f.hunks.length)
          .slice(0, 3);
        if (!files.length) return null;
        return {
          hash: c.hash,
          date: c.date,
          scope: c.scope,
          subject: c.subject,
          files,
        };
      })
      .filter(Boolean)
  : [];

const byDay = {};
for (const c of commits) byDay[c.date] = (byDay[c.date] ?? 0) + 1;

writeFileSync(
  OUT,
  JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    kitBranch: git(KIT, 'branch --show-current').trim(),
    spmBranch: existsSync(SPM) ? git(SPM, 'branch --show-current').trim() : '',
    tasks,
    components,
    rules: listMd('.agents/rules', ['README.md']),
    docs: listMd('docs'),
    parity,
    parityFile: parityFile ?? null,
    previews,
    screens,
    swaps,
    commits,
    spmCommits,
    byDay,
  }),
);

const groups = {};
for (const t of tasks) groups[t.group] = (groups[t.group] ?? 0) + 1;
console.log(
  `tasks ${tasks.length} ${JSON.stringify(groups)} · components ${components.length} · kit commits ${commits.length} · spm commits ${spmCommits.length}`,
);
