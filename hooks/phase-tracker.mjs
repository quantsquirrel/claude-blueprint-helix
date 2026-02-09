#!/usr/bin/env node

/**
 * Phase Tracker Hook (PostToolUse)
 * Tracks phase progression for active PDCA cycles and pipeline runs.
 * Only processes Task, Write, Edit, Bash tool calls; ignores the rest.
 *
 * Pattern: OMC post-tool-verifier.mjs
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  findOmcRoot,
  loadState,
  saveState,
  acquireLock,
  releaseLock
} from './lib/state-manager.mjs';
import { PDCA_PHASES, PIPELINE_PHASES, STATE_PATHS, CYCLE_STATUS, RUN_STATUS } from './lib/constants.mjs';

// Tools that indicate meaningful work progress
const TRACKED_TOOLS = new Set(['Task', 'Write', 'Edit', 'Bash']);

// Read stdin with timeout protection
function readStdin(timeoutMs = 4000) {
  return new Promise((resolve) => {
    const chunks = [];
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        process.stdin.removeAllListeners();
        try { process.stdin.destroy(); } catch { /* ignore */ }
        resolve(Buffer.concat(chunks).toString('utf-8'));
      }
    }, timeoutMs);
    process.stdin.on('data', (chunk) => { chunks.push(chunk); });
    process.stdin.on('end', () => {
      if (!settled) { settled = true; clearTimeout(timeout); resolve(Buffer.concat(chunks).toString('utf-8')); }
    });
    process.stdin.on('error', () => {
      if (!settled) { settled = true; clearTimeout(timeout); resolve(''); }
    });
    if (process.stdin.readableEnded) {
      if (!settled) { settled = true; clearTimeout(timeout); resolve(Buffer.concat(chunks).toString('utf-8')); }
    }
  });
}

// Update activity timestamp on active PDCA cycles
function trackPdcaActivity(blueprintDir) {
  const cyclesDir = join(blueprintDir, STATE_PATHS.pdca.cycles);
  if (!existsSync(cyclesDir)) return;

  try {
    const files = readdirSync(cyclesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = join(cyclesDir, file);
      const lock = acquireLock(filePath, { timeoutMs: 1000 });
      try {
        const state = loadState(filePath);
        if (state && state.status === CYCLE_STATUS.ACTIVE) {
          state.updatedAt = new Date().toISOString();
          state.activityCount = (state.activityCount || 0) + 1;
          saveState(filePath, state);
        }
      } finally {
        if (lock) releaseLock(filePath);
      }
    }
  } catch {
    // Silently ignore errors
  }
}

// Update activity timestamp on active pipeline runs
function trackPipelineActivity(blueprintDir) {
  const runsDir = join(blueprintDir, STATE_PATHS.pipeline.runs);
  if (!existsSync(runsDir)) return;

  try {
    const files = readdirSync(runsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = join(runsDir, file);
      const lock = acquireLock(filePath, { timeoutMs: 1000 });
      try {
        const state = loadState(filePath);
        if (state && state.status === RUN_STATUS.RUNNING) {
          state.updatedAt = new Date().toISOString();
          state.activityCount = (state.activityCount || 0) + 1;
          saveState(filePath, state);
        }
      } finally {
        if (lock) releaseLock(filePath);
      }
    }
  } catch {
    // Silently ignore errors
  }
}

async function main() {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      process.stdout.write(JSON.stringify({ continue: true }));
      return;
    }

    let data = {};
    try { data = JSON.parse(input); } catch { /* ignore */ }

    const toolName = data.tool_name || data.toolName || '';

    // Only track meaningful tool calls
    if (!TRACKED_TOOLS.has(toolName)) {
      process.stdout.write(JSON.stringify({ continue: true }));
      return;
    }

    // Find blueprint state directory
    let blueprintDir;
    try {
      blueprintDir = findOmcRoot(data.cwd || data.directory || process.cwd());
    } catch {
      process.stdout.write(JSON.stringify({ continue: true }));
      return;
    }

    // Track activity on active cycles and pipelines
    trackPdcaActivity(blueprintDir);
    trackPipelineActivity(blueprintDir);

    process.stdout.write(JSON.stringify({ continue: true }));
  } catch {
    // On any error, allow continuation
    process.stdout.write(JSON.stringify({ continue: true }));
  }
}

main();
