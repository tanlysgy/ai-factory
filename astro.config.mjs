// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const factoryStateFile = path.join(repoRoot, '.factory', 'state.json');

// Expose .factory/state.json as an importable module so SSR pages can render
// the Command Center without depending on the build working directory.
function factoryStatePlugin() {
  const id = '\0virtual:factory-state';
  return {
    name: 'factory-state',
    resolveId(source) {
      if (source === 'virtual:factory-state') return id;
      return null;
    },
    load(sourceId) {
      if (sourceId !== id) return null;
      try {
        const raw = fs.readFileSync(factoryStateFile, 'utf-8');
        return `export default ${raw}`;
      } catch (err) {
        const fallback = JSON.stringify({ factory: 'ai-factory-command-center', version: 1, updated: new Date().toISOString(), counts: { experiments: 0, sites: 0, memories: 0, lessons: 0, tasks: 0 }, runningTasks: [], tasks: [], sites: [], experiments: [], memory: { status: 'unavailable', files: [] }, lessons: [] });
        return `export default ${fallback}`;
      }
    }
  };
}

// Copy launch kits (screenshots, OG/banner) into the static build so
// /launch/<slug>/... assets resolve in production (dist/client/launch).
function launchAssetsPlugin() {
  const launchDir = path.join(repoRoot, 'launch');
  const outDir = path.join(repoRoot, 'dist', 'client', 'launch');
  return {
    name: 'launch-assets',
    closeBundle() {
      if (fs.existsSync(launchDir)) {
        fs.cpSync(launchDir, outDir, { recursive: true });
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), factoryStatePlugin(), launchAssetsPlugin()]
  },

  adapter: cloudflare()
});
