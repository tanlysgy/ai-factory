#!/usr/bin/env node
/**
 * Score engine tests — pure function, no network/DB/LLM.
 * Run: node radar/engine/score.test.mjs
 */

import { scoreOpportunity, DIMENSIONS, MAX_RAW, TOTAL_DIMS } from './score.mjs';

let pass = 0;
let fail = 0;

function assert(name, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name} ${detail}`);
  }
}

console.log('Constants:');
assert('TOTAL_DIMS = 8', TOTAL_DIMS === 8, `got ${TOTAL_DIMS}`);
console.log(`  MAX_RAW = ${MAX_RAW} (expected 22)`);
assert('MAX_RAW = 22', MAX_RAW === 22, `got ${MAX_RAW}`);

const allStrong = {
  search: 2, money: 2, pain: 2, paid_replacement: 2, competition: 2, build_feasibility: 2, founder_fit: 2, acquisition: 2,
};
const none = {
  search: 0, money: 0, pain: 0, paid_replacement: 0, competition: 0, build_feasibility: 0, founder_fit: 0, acquisition: 0,
};
const freshMulti = { fresh: true, conflicts: false, singleSource: false };

// --- 1. High evidence
console.log('\nHigh evidence');
let r = scoreOpportunity({ signals: allStrong, independentSources: 4, confidence_factors: freshMulti });
assert('score 100', r.score === 100, `got ${r.score}`);
assert('label Strong Candidate', r.scoreLabel === 'Strong Candidate', r.scoreLabel);
assert('confidence high', r.confidence === 'high', r.confidence);
assert('coverage 8/8', r.coverage === '8/8', r.coverage);

// --- 2. No evidence
console.log('\nNo evidence');
r = scoreOpportunity({ signals: none, independentSources: 0, confidence_factors: {} });
assert('score 0', r.score === 0, `got ${r.score}`);
assert('label Low', r.scoreLabel === 'Low', r.scoreLabel);
assert('confidence low', r.confidence === 'low', r.confidence);
assert('coverage 0/8', r.coverage === '0/8', r.coverage);

// --- 3. Missing evidence (sparse)
console.log('\nMissing evidence');
r = scoreOpportunity({
  signals: { search: 0, money: 2, pain: 0, paid_replacement: 0, competition: 0, build_feasibility: 0, founder_fit: 1, acquisition: 0 },
  independentSources: 1,
  confidence_factors: { fresh: true, conflicts: false, singleSource: true },
});
assert('coverage 2/8', r.coverage === '2/8', r.coverage);
assert('confidence low (single source + <4 covered)', r.confidence === 'low', r.confidence);
assert('not inflated to Candidate (raw = 4+1 = 5 -> 23%)', r.scoreLabel === 'Low', r.scoreLabel);

// --- 4. Conflicting evidence caps confidence
console.log('\nConflicting evidence');
r = scoreOpportunity({ signals: allStrong, independentSources: 4, confidence_factors: { fresh: true, conflicts: true, singleSource: false } });
assert('score stays 100', r.score === 100, `got ${r.score}`);
assert('confidence capped to medium (conflict)', r.confidence === 'medium', r.confidence);

// --- 5. High search / no commercial -> search capped, can't be top
console.log('\nHigh search / no commercial');
r = scoreOpportunity({
  signals: { search: 2, money: 0, pain: 0, paid_replacement: 0, competition: 0, build_feasibility: 2, founder_fit: 2, acquisition: 0 },
  independentSources: 1,
  confidence_factors: freshMulti,
});
// search 2->1 capped: raw=1*1 + 1*2+1*2 (fit) = 5 -> 23%
assert('score 23 (search capped)', r.score === Math.round((5 / 22) * 100), `got ${r.score}`);
assert('label Low (no commercial)', r.scoreLabel === 'Low', r.scoreLabel);
assert('confidence capped to medium even if "fresh multi"', r.confidence === 'low' || r.confidence === 'medium', r.confidence);

// --- 6. Low competition / no demand -> no bonus
console.log('\nLow competition / low demand');
r = scoreOpportunity({
  signals: { search: 0, money: 0, pain: 0, paid_replacement: 0, competition: 0, build_feasibility: 2, founder_fit: 2, acquisition: 0 },
  independentSources: 1,
  confidence_factors: {},
});
assert('score low (<40)', r.score < 40, `got ${r.score}`);
assert('label Low', r.scoreLabel === 'Low', r.scoreLabel);

// --- 7. High competition / high demand -> valid, high
console.log('\nHigh competition / high demand');
r = scoreOpportunity({
  signals: { search: 2, money: 2, pain: 2, paid_replacement: 2, competition: 2, build_feasibility: 1, founder_fit: 2, acquisition: 2 },
  independentSources: 4,
  confidence_factors: freshMulti,
});
assert('score >= 85', r.score >= 85, `got ${r.score}`);
assert('label Strong Candidate', r.scoreLabel === 'Strong Candidate', r.scoreLabel);

// --- 8. Stale evidence caps confidence
console.log('\nFreshness gate');
r = scoreOpportunity({ signals: allStrong, independentSources: 4, confidence_factors: { fresh: false, conflicts: false, singleSource: false } });
assert('stale -> medium not high', r.confidence === 'medium', r.confidence);

// --- 9. Realistic mid: money+pain+paid, partial others -> Candidate/Medium
console.log('\nRealistic mid opportunity');
r = scoreOpportunity({
  signals: { search: 1, money: 2, pain: 2, paid_replacement: 1, competition: 1, build_feasibility: 2, founder_fit: 1, acquisition: 1 },
  independentSources: 3,
  confidence_factors: freshMulti,
});
// raw = 1 + 4 + 4 + 2 + 1 + 2 + 1 + 1 = 16 -> 73%
assert('score 73 Candidate', r.score === Math.round((16 / 22) * 100), `got ${r.score} label=${r.scoreLabel}`);
assert('coverage 8/8', r.coverage === '8/8', r.coverage);
assert('confidence high', r.confidence === 'high', r.confidence);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);