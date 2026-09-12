import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Guard the Command Center's single source of truth: .factory/state.json
// must stay a valid, complete document so /factory/ renders real data.
const root = path.resolve(new URL('../../', import.meta.url).pathname); // src/lib -> repo root
const statePath = path.join(root, '.factory', 'state.json');

test('factory state file exists and is valid JSON', () => {
	assert.ok(fs.existsSync(statePath), `.factory/state.json missing at ${statePath}`);
	const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
	assert.equal(typeof state.factory, 'string');
	assert.equal(state.factory, 'ai-factory-command-center');
});

test('factory state exposes the dashboard collections', () => {
	const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
	for (const key of ['counts', 'sites', 'experiments', 'memory', 'lessons', 'tasks', 'runningTasks']) {
		assert.ok(key in state, `state missing "${key}"`);
	}
	assert.ok(Array.isArray(state.sites));
	assert.ok(Array.isArray(state.experiments));
	assert.ok(Array.isArray(state.lessons));
	assert.ok(Array.isArray(state.tasks));
	assert.equal(typeof state.counts.experiments, 'number');
	assert.equal(typeof state.counts.sites, 'number');
});

test('factory state counts match the arrays', () => {
	const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
	assert.equal(state.counts.experiments, state.experiments.length);
	assert.equal(state.counts.sites, state.sites.length);
	assert.equal(state.counts.lessons, state.lessons.length);
	assert.equal(state.counts.memories, state.memory.files.length);
});

test('factory sites carry the fields the dashboard renders', () => {
	const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
	for (const site of state.sites) {
		assert.equal(typeof site.id, 'string');
		assert.equal(typeof site.name, 'string');
		assert.equal(typeof site.status, 'string');
		assert.equal(typeof site.page, 'string');
		assert.ok('previewUrl' in site, `${site.id} missing previewUrl`);
	}
});
