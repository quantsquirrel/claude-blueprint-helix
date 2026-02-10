# claude-blueprint-helix

A structured development methodology plugin for Claude Code with PDCA cycles, gap analysis, and dev pipelines.

## Directory Guide

### agents/

Custom agents for specialized analysis and orchestration.

**Files:**
- `gap-detector.md` - Read-only gap analysis agent (opus model)
  - Compares current state vs desired state
  - Identifies gaps by severity (critical/high/medium/low)
  - Generates actionable recommendations
  - No file modifications (analysis only)

- `design-writer.md` - Design document generation agent (sonnet model)
  - Creates structured design documents
  - Documents architecture decisions
  - Produces implementation-ready specifications
  - Used in pipeline design phase

- `pdca-iterator.md` - PDCA cycle orchestration agent (sonnet model)
  - Manages Plan-Do-Check-Act iterations
  - Coordinates phase transitions
  - Evaluates cycle completion criteria
  - Decides continuation or termination

**Agent Discovery:**
Agents are loaded from the plugin namespace (`blueprint:agent-name`). If plugin agents are unavailable, inline prompts serve as fallbacks.

---

### config/

JSON configuration files for customizing behavior.

**Files:**
- `pdca-defaults.json` - PDCA cycle configuration
  - `max_iterations`: Maximum cycle count (default: 4)
  - `phase_timeout_ms`: Phase timeout in milliseconds (default: 300000)
  - `auto_act`: Whether to automatically proceed after Check phase (default: false)
  - `default_agents`: Agent assignments for each PDCA phase

- `pipeline-phases.json` - Pipeline phase definitions
  - 9 phases: requirements, architecture, design, implementation, unit-test, integration-test, code-review, gap-analysis, verification
  - Each phase has: index, name, agent, gate condition
  - 3 presets: full (9 stages), standard (6 stages), minimal (3 stages)
  - Defaults: preset selection, error handling, retry limits

**Customization:**
Edit these files to adjust workflows, timeouts, or agent assignments.

---

### hooks/

Claude Code hooks for event-driven behavior.

**Files:**
- `hooks.json` - Hook registration manifest
  - Maps hook names to handler scripts
  - Defines execution order and priority

- `blueprint-detect.mjs` - Keyword detection (UserPromptSubmit hook)
  - Detects skill invocation patterns
  - Parses arguments and flags
  - Routes to appropriate skill handler

- `phase-tracker.mjs` - Progress tracking (PostToolUse hook)
  - Monitors agent completion
  - Updates phase progress
  - Triggers next phase when gates are met

- `session-loader.mjs` - State restoration (SessionStart hook)
  - Loads active cycles/pipelines from `.omc/blueprint/`
  - Restores in-progress workflows
  - Displays restoration summary

- `compact-preserver.mjs` - State preservation (PreCompact hook)
  - Backs up active state before compaction
  - Ensures state survives context window compression

- `cycle-finalize.cjs` - Graceful shutdown (Stop hook)
  - Finalizes incomplete cycles
  - Writes completion reports
  - Releases locks

- `session-cleanup.mjs` - Session cleanup (SessionEnd hook)
  - Archives completed workflows
  - Removes stale locks
  - Resets session state

**lib/ subdirectory:**
- `constants.mjs` - Shared constants (state paths, IDs, timeouts)
- `state-manager.mjs` - State file read/write utilities with locking

---

### mcp/

MCP (Model Context Protocol) server for external tool access.

**Files:**
- `blueprint-server.cjs` - JSON-RPC server implementation
  - Exposes 3 tools via MCP:
    - `pdca_status` - Query active PDCA cycle state (ID, phase, iteration, progress)
    - `gap_measure` - Measure gap metrics (severity distribution, closure rate)
    - `pipeline_progress` - Check pipeline progress (current phase, gates passed, ETA)
  - Stateless design (reads from `.omc/blueprint/`)
  - Handles concurrent requests

**Integration:**
Referenced by `.mcp.json` at plugin root. Claude Code loads the server at session start.

---

### skills/

User-invocable skills (slash commands).

**Directory structure:**
```
skills/
├── pdca/
│   └── SKILL.md
├── gap/
│   └── SKILL.md
├── pipeline/
│   └── SKILL.md
└── cancel/
    └── SKILL.md
```

**Skills:**
- `/blueprint:pdca` - Run PDCA improvement cycles
  - Args: `--iterations N`, `--auto-act`
  - Orchestrates Plan → Do → Check → Act loop
  - Continues until max iterations or convergence

- `/blueprint:gap` - Perform gap analysis
  - Args: `--severity [critical|high|medium|low]`
  - Generates gap report with recommendations
  - Read-only (no code changes)

- `/blueprint:pipeline` - Execute dev pipeline
  - Args: `--preset [full|standard|minimal]`
  - Runs phased development workflow
  - Each phase has a gate condition

- `/blueprint:cancel` - Cancel active workflows
  - Args: `--all`, `--cycle-id ID`, `--pipeline-id ID`
  - Graceful termination with cleanup
  - Preserves partial results

**Skill Metadata:**
Each `SKILL.md` contains:
- Trigger patterns (keywords)
- Argument schema
- Agent instructions
- Example usage

---

### tests/

Unit and integration tests.

**Directory structure:**
```
tests/
├── unit/
└── integration/
```

**Unit tests:**
Test individual components (hooks, state manager, agent prompts) in isolation.

**Integration tests:**
Test end-to-end workflows (complete PDCA cycle, pipeline execution, concurrent operations).

**Coverage targets:**
- State management (locking, concurrency, recovery)
- Hook behavior (detection, tracking, cleanup)
- Agent coordination (phase transitions, error handling)

---

## State Management

**Location:** `.omc/blueprint/`

**File naming:**
- PDCA cycles: `pdca-{ID}.json`
- Pipelines: `pipeline-{ID}.json`
- Locks: `{type}-{ID}.lock`

**Lock protocol:**
1. Acquire lock before state modification
2. Write state atomically
3. Release lock after write
4. Timeout locks after 5 minutes (stale lock cleanup)

**Concurrency:**
Multiple cycles/pipelines can run concurrently with ID-based isolation. Hooks check for active workflows on session start and resume them.

---

## Agent Discovery

**Primary source:** Plugin agents (`blueprint:agent-name`)

**Fallback:** Inline prompts in skill handlers

**Precedence:**
1. Plugin agent (if available)
2. oh-my-claudecode agent (if pattern matches)
3. Inline prompt (last resort)

**Example:**
```javascript
const agent = await discoverAgent('gap-detector', fallbackPrompt);
```

This ensures the plugin works even if custom agents fail to load.

---

## Development

**Prerequisites:**
- Node.js 18+ (uses built-in modules only)
- Claude Code (for plugin hosting)

**Local testing:**
```bash
# Run unit tests
node tests/unit/*.test.js

# Run integration tests
node tests/integration/*.test.js

# Test in Claude Code
claude plugin link .
```

**Code style:**
- ESM modules (`.mjs`) for hooks and utilities
- CommonJS (`.cjs`) for MCP server (compatibility)
- No external dependencies
- Prefer async/await over callbacks

---

## Contributing

1. Add tests for new features
2. Update configuration schemas if adding options
3. Document new hooks/agents in this file
4. Follow existing code style (ESLint config)
5. Ensure zero external dependencies

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
