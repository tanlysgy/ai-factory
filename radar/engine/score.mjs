#!/usr/bin/env node
/**
 * Demand Radar — Score Engine (v1)
 *
 * PURE function: no network, no DB, no LLM. Same input -> same output.
 * Reads an Opportunity markdown file (YAML frontmatter) and prints
 *   Score (0-100, bucketed) | Confidence (Low/Medium/High) | Coverage (x/8)
 *
 * Dimensions & weights (per design docs/plans/M1-demand-radar-design.md §7):
 *   money 2, pain 2, paid_replacement 2, search 1, competition 1,
 *   build_feasibility 1, founder_fit 1, acquisition 1   (max raw = 12)
 *
 * Anti-false-signal rules built in:
 *   - High search with NO commercial signal -> search capped at 1.
 *   - Competition=0 (none) with no commercial evidence -> no bonus, can't be strong.
 *   - Missing signals shrink coverage -> caps confidence.
 *
 * Usage:
 *   node radar/engine/score.mjs <opportunity.md>
 *   node radar/engine/score.test.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIMENSIONS = [
  { key: 'search', label: 'Search', weight: 1, cap: 2 },
  { key: 'money', label: 'Money', weight: 2, cap: 2 },
  { key: 'pain', label: 'Pain', weight: 2, cap: 2 },
  { key: 'paid_replacement', label: 'Paid replacement', weight: 2, cap: 2 },
  { key: 'competition', label: 'Competition', weight: 1, cap: 2 },
  { key: 'build_feasibility', label: 'Build feasibility', weight: 1, cap: 2 },
  { key: 'founder_fit', label: 'Founder fit', weight: 1, cap: 2 },
  { key: 'acquisition', label: 'Acquisition', weight: 1, cap: 2 },
];

const MAX_RAW = DIMENSIONS.reduce((s, d) => s + d.weight * d.cap, 0); // = search2 + money4 + pain4 + paid4 + comp2 + build2 + fit2 + acq2 = 22
const TOTAL_DIMS = DIMENSIONS.length; // 8

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const mm = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!mm) continue;
    const key = mm[1];
    let val = mm[2].trim();
    // list-form for signals: "signals:" followed by indented "- key: value"
    if (key === 'signals' && val === '') {
      const obj = {};
      for (let j = i + 1; j < lines.length && lines[j].match(/^\s+-\s+\w+:/); j++) {
        const sub = lines[j].match(/^\s+-\s+(\w+):\s*(.*)$/);
        if (sub) obj[sub[1]] = Number(sub[2].trim());
      }
      fm[key] = obj;
      continue;
    }
    fm[key] = val;
  }
  return fm;
}

function coerceNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Core pure function.
 * @param {object} doc { signals: {key:0..2}, independentSources:int, confidence_factors:{fresh,conflicts,singleSource} }
 * @returns {{score:number, scoreLabel:string, confidence:'low'|'medium'|'high', coverage:string}}
 */
export function scoreOpportunity(doc) {
  const signals = DIMENSIONS.map((d) => ({
    ...d,
    value: clamp(coerceNumber(doc.signals?.[d.key]), 0, d.cap),
  }));

  // Anti-false-signal: search alone (no commercial evidence) caps search at 1.
  const s = Object.fromEntries(signals.map((x) => [x.key, x.value]));
  if (s.search === 2 && s.money === 0 && s.pain === 0 && s.paid_replacement === 0) {
    signals.find((x) => x.key === 'search').value = 1;
  }

  const raw = signals.reduce((acc, d) => acc + d.weight * d.value, 0);
  const pct = Math.round((raw / MAX_RAW) * 100);
  const covered = signals.filter((d) => d.value > 0).length;

  let label;
  if (pct >= 85) label = 'Strong Candidate';
  else if (pct >= 65) label = 'Candidate';
  else if (pct >= 40) label = 'Watch';
  else label = 'Low';

  const cf = doc.confidence_factors || {};
  const sources = coerceNumber(doc.independentSources);

  // Base confidence from evidence quantity/quality.
  let confidence;
  if (covered >= 6 && sources >= 3 && cf.fresh !== false) {
    confidence = 'high';
  } else if (covered >= 4) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Downgrade chain (each factor drops one level; conflicts/single-source are red flags).
  const downgrade = () => {
    if (confidence === 'high') confidence = 'medium';
    else if (confidence === 'medium') confidence = 'low';
  };
  if (cf.conflicts) downgrade();      // conflicting signals -> distrust
  if (cf.singleSource) downgrade();   // only one source -> distrust

  // No commercial evidence at all (money+pain+paid all 0) -> can't be Strong, can't be high confidence.
  if (s.money === 0 && s.pain === 0 && s.paid_replacement === 0) {
    if (label === 'Strong Candidate') label = 'Candidate';
    if (confidence === 'high') confidence = 'medium';
  }

  return { score: pct, scoreLabel: label, confidence, coverage: `${covered}/${TOTAL_DIMS}` };
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: node radar/engine/score.mjs <opportunity.md>');
    process.exit(1);
  }
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  const fm = parseFrontmatter(content);
  if (!fm) {
    console.error('error: no YAML frontmatter found in', file);
    process.exit(1);
  }
  const signals = fm.signals && typeof fm.signals === 'object' ? fm.signals : {};
  const cf = {
    fresh: (fm['freshness'] || 'recent') === 'recent',
    conflicts: !!fm['conflicting_with'] && fm['conflicting_with'] !== 'null',
    singleSource: coerceNumber(fm['independentSources'] < 1 ? 1 : fm['independentSources']) <= 1,
  };
  const out = scoreOpportunity({
    signals,
    independentSources: coerceNumber(fm['independentSources']),
    confidence_factors: cf,
  });
  console.log(`Score: ${out.score} (${out.scoreLabel})`);
  console.log(`Confidence: ${out.confidence}`);
  console.log(`Evidence Coverage: ${out.coverage}`);
  const rawTotal = DIMENSIONS.reduce(
    (a, d) => a + d.weight * coerceNumber(fm.signals?.[d.key]),
    0,
  );
  console.log(`raw: ${rawTotal}/${MAX_RAW}`);
}

export { DIMENSIONS, MAX_RAW, TOTAL_DIMS };