#!/usr/bin/env node
// Generate citation files (RIS and CSL-JSON) for episodes
// Scans content/episodes/*.md and writes to public/citations/

const fs = require('fs');
const path = require('path');

const EPISODES_DIR = path.join(__dirname, '..', 'content', 'episodes');
const OUT_DIR = path.join(__dirname, '..', 'public', 'citations');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function parseFrontMatter(md) {
  // Very simple YAML front matter parser
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const data = {};
  yaml.split('\n').forEach(line => {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) return;
    const key = m[1].trim();
    let val = m[2].trim();
    // Handle quoted strings
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Handle simple arrays (tags: \n - a \n - b)
    if (val === '') {
      // Look ahead for indented list items
      // Not implemented in this minimal parser; tags handled separately below
    } else {
      data[key] = val;
    }
  });
  // Extract tags block separately
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
  if (Array.isArray(meta.tags)) {
    meta.tags.forEach(t => lines.push(`KW  - ${t}`));
  }
  lines.push('PB  - The Domination Chronicles Podcast');
  if (meta.image) lines.push(`L3  - ${meta.image}`);
  // Duplicate title in T1 for some RIS consumers
  if (meta.title) lines.push(`T1  - ${meta.title}`);
  lines.push('ER  -');
  return lines.join('\n') + '\n';
}

function toCSLJSON(meta, slug) {
  const url = `https://dominationchronicles.com/episodes/${slug}/`;
  const issued = (() => {
    if (!meta.publishDate) return undefined;
    const d = meta.publishDate.split('-').map(n => parseInt(n, 10));
    if (d.length === 3) return { 'date-parts': [[d[0], d[1], d[2]]] };
    if (d.length === 2) return { 'date-parts': [[d[0], d[1]]] };
    return { 'date-parts': [[d[0]]] };
  })();
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
  if (meta.image) obj['container'] = meta.image; // non-standard, optional
  return JSON.stringify([obj], null, 2) + '\n';
}

function run() {
  ensureDir(OUT_DIR);
  const files = fs.readdirSync(EPISODES_DIR).filter(f => f.endsWith('.md'));
  let count = 0;
  files.forEach(file => {
    const slug = path.basename(file, '.md');
    const md = fs.readFileSync(path.join(EPISODES_DIR, file), 'utf8');
    const meta = parseFrontMatter(md);
    const ris = toRIS(meta, slug);
    const csl = toCSLJSON(meta, slug);
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.ris`), ris);
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.csl.json`), csl);
    count++;
  });
  console.log(`Generated citations for ${count} episode(s) in ${OUT_DIR}`);
}

run();
