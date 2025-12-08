#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const EPISODES_DIR = path.join(__dirname, '..', 'content', 'episodes');
const OUT_DIR = path.join(__dirname, '..', 'public', 'citations');
const FORCE_REGEN = process.argv.includes('--force') || process.env.CITATIONS_FORCE === 'true';

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function parseFrontMatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const data = {};
  yaml.split('\n').forEach(line => {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) return;
    const key = m[1].trim();
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val) data[key] = val;
  });
  const tagsBlock = yaml.match(/tags:\s*[\r\n]+([\s\S]*)/);
  if (tagsBlock) {
    const items = [];
    tagsBlock[1].split('\n').forEach(l => {
      const tm = l.match(/^\s*-\s*(.+)$/);
      if (tm) items.push(tm[1].trim());
    });
    if (items.length) data.tags = items;
  }
  return data;
}

function toRIS(meta, slug) {
  const lines = [];
  lines.push('TY  - GEN');
  lines.push(`TI  - ${meta.title || slug}`);
  if (meta.publishDate) lines.push(`DA  - ${meta.publishDate}`);
  const url = `https://dominationchronicles.com/episodes/${slug}/`;
  lines.push(`UR  - ${url}`);
  if (meta.description) lines.push(`N1  - ${meta.description}`);
  if (Array.isArray(meta.tags)) meta.tags.forEach(t => lines.push(`KW  - ${t}`));
  lines.push('PB  - The Domination Chronicles Podcast');
  if (meta.image) lines.push(`L3  - ${meta.image}`);
  if (meta.title) lines.push(`T1  - ${meta.title}`);
  lines.push('ER  -');
  return lines.join('\n') + '\n';
}

function toCSLJSON(meta, slug) {
  const url = `https://dominationchronicles.com/episodes/${slug}/`;
  let issued;
  if (meta.publishDate) {
    const d = meta.publishDate.split('-').map(n => parseInt(n, 10));
    if (d.length === 3) issued = { 'date-parts': [[d[0], d[1], d[2]]] };
    else if (d.length === 2) issued = { 'date-parts': [[d[0], d[1]]] };
    else issued = { 'date-parts': [[d[0]]] };
  }
  const obj = {
    id: slug,
    type: 'broadcast',
    title: meta.title || slug,
    abstract: meta.description || '',
    URL: url,
    language: 'en',
    source: 'The Domination Chronicles Podcast'
  };
  if (issued) obj.issued = issued;
  if (Array.isArray(meta.tags)) obj.keyword = meta.tags;
  if (meta.duration) obj.duration = meta.duration;
  if (meta.image) obj.container = meta.image;
  return JSON.stringify([obj], null, 2) + '\n';
}

function hasExistingCitation(slug) {
  const risPath = path.join(OUT_DIR, `${slug}.ris`);
  const cslPath = path.join(OUT_DIR, `${slug}.csl.json`);
  return fs.existsSync(risPath) && fs.existsSync(cslPath);
}

function run() {
  ensureDir(OUT_DIR);
  const files = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith('.md'));
  let generated = 0;
  let skipped = 0;
  files.forEach(file => {
    const slug = path.basename(file, '.md');
    if (!FORCE_REGEN && hasExistingCitation(slug)) {
      skipped++;
      return;
    }
    const md = fs.readFileSync(path.join(EPISODES_DIR, file), 'utf8');
    const meta = parseFrontMatter(md);
    const ris = toRIS(meta, slug);
    const csl = toCSLJSON(meta, slug);
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.ris`), ris);
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.csl.json`), csl);
    generated++;
  });
  console.log(`Citations: ${generated} generated, ${skipped} skipped${FORCE_REGEN ? ' (force mode)' : ''}. Output directory: ${OUT_DIR}`);
}

run();
