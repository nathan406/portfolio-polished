// sync-resume.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Syncs data from resume-draft.md (the source of truth) into the Neon database.
//
// What it updates:
//   • projects      → title + description (matched by base name, e.g. "ZAX — AI
//                     Chatbot (ZRA Hackathon)" matches the "ZAX" row)
//   • resume_experience → title + company (first entry)
//
// It never deletes anything and only touches the fields above, so re-running is
// safe. Images, URLs, timeframes, skills and technologies are left untouched.
//
// Usage:
//   node scripts/sync-resume.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// ── Minimal .env.local parser (no dotenv dependency) ─────────────────────────
function loadEnv(file) {
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv('.env.local');
const connStr = env.DATABASE_URL || env.NEON_DB;
if (!connStr) {
  console.error('No DATABASE_URL found in .env.local');
  process.exit(1);
}

const sql = neon(connStr);

// ── Markdown parsing ─────────────────────────────────────────────────────────
function parseProjects(md) {
  const start = md.indexOf('## Selected Projects');
  const end = md.indexOf('## Education');
  const section = md.slice(start, end === -1 ? md.length : end);
  const blocks = section.split(/^### /m).slice(1);
  const projects = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) continue;

    const fullTitle = lines[0].trim();

    // URL in the italic meta line, e.g. *vocalprint.netlify.app · Jul 2026 – Present*
    const metaLine = lines[1] || '';
    const urlMatch = metaLine.match(/([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s·*]*)?)/);
    const url = urlMatch ? urlMatch[1] : '';

    // Description = first paragraph after the **Technologies:** / **Skills:** lines
    const descLines = [];
    for (const line of lines.slice(2)) {
      if (/^\*\*/.test(line)) continue; // metadata line
      if (/^[-—]{2,}$/.test(line.trim())) continue; // horizontal rule separator
      descLines.push(line.trim());
    }
    const description = descLines.join(' ').replace(/\s+/g, ' ').trim();

    projects.push({ fullTitle, url, description });
  }
  return projects;
}

function parseExperience(md) {
  const start = md.indexOf('## Experience');
  const end = md.indexOf('## Selected Projects');
  const section = md.slice(start, end === -1 ? md.length : end);
  const titleLine = section.match(/^### (.+)$/m);
  if (!titleLine) return null;
  const parts = titleLine[1].split(' — ');
  const title = parts[0]?.trim();
  if (!title) return null;
  return { title, company: parts[1]?.trim() || '' };
}

// ── Sync ─────────────────────────────────────────────────────────────────────
const md = readFileSync('resume-draft.md', 'utf8');
const projects = parseProjects(md);

console.log(`Parsed ${projects.length} projects from resume-draft.md\n`);

// Fetch existing projects once so we can match by base name / url.
const dbProjects = await sql`SELECT id, title, project_url FROM projects`;

let updated = 0;
let skipped = 0;
for (const p of projects) {
  // Compare base names (strip the " — descriptor" suffix on both sides) so
  // re-runs match correctly even after titles were already updated.
  const base = p.fullTitle.split(' — ')[0].trim().toLowerCase();
  const match = dbProjects.find(
    (dbp) =>
      dbp.title.split(' — ')[0].trim().toLowerCase() === base ||
      (p.url && dbp.project_url && dbp.project_url.toLowerCase().includes(p.url.toLowerCase()))
  );

  if (!match) {
    console.log(`  ✗ NOT FOUND in DB: "${p.fullTitle}"`);
    skipped++;
    continue;
  }

  if (p.description) {
    await sql`
      UPDATE projects
      SET title = ${p.fullTitle}, description = ${p.description}
      WHERE id = ${match.id}
    `;
  } else {
    // No description in the draft — update the title only, keep the DB description.
    await sql`UPDATE projects SET title = ${p.fullTitle} WHERE id = ${match.id}`;
  }
  console.log(`  ✓ Updated: "${match.title}" → "${p.fullTitle}"`);
  updated++;
}

// Experience — parsed from resume-draft.md's "### Title — Company" line.
const expMeta = parseExperience(md);
const exp = await sql`SELECT id, title, company FROM resume_experience ORDER BY sort_order, created_at`;
if (exp[0] && expMeta) {
  await sql`
    UPDATE resume_experience
    SET title = ${expMeta.title}, company = ${expMeta.company}
    WHERE id = ${exp[0].id}
  `;
  console.log(`\n  ✓ Updated experience: "${exp[0].title}" → "${expMeta.title}"${expMeta.company ? ` (${expMeta.company})` : ''}`);
} else {
  console.log('\n  – No experience entries found; nothing to update.');
}

console.log(`\nDone. ${updated} projects updated, ${skipped} not found.`);
