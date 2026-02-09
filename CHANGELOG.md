# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-10

### Added

#### Core Skills
- PDCA cycle skill (`/blueprint:pdca`) with iterative improvement loops
  - Plan-Do-Check-Act methodology for continuous refinement
  - Configurable iteration count (default: 4 cycles)
  - Auto-act mode for autonomous progression
  - Phase timeout protection (5 minutes per phase)
- Gap Analysis skill (`/blueprint:gap`) with severity-based reporting
  - Current vs desired state comparison
  - Severity classification (critical/high/medium/low)
  - Actionable recommendations
  - Read-only analysis (no code modifications)
- Dev Pipeline skill (`/blueprint:pipeline`) with 3 presets
  - Full preset: 9-stage comprehensive workflow
  - Standard preset: 6-stage balanced workflow (default)
  - Minimal preset: 3-stage rapid iteration
  - Gate-based progression (each phase has entry criteria)
- Cancel skill (`/blueprint:cancel`) for graceful workflow termination
  - Cancel all active workflows with `--all`
  - Cancel specific cycle with `--cycle-id ID`
  - Cancel specific pipeline with `--pipeline-id ID`
  - Cleanup and lock release

#### Custom Agents
- `gap-detector` (opus model) for deep gap analysis
  - Read-only state examination
  - Multi-dimensional gap classification
  - Evidence-based recommendations
- `design-writer` (sonnet model) for design document generation
  - Architecture decision records
  - Implementation specifications
  - Structured documentation
- `pdca-iterator` (sonnet model) for PDCA cycle orchestration
  - Phase coordination
  - Iteration management
  - Convergence detection

#### Hooks
- `UserPromptSubmit` hook (blueprint-detect.mjs)
  - Keyword-based skill detection
  - Argument parsing and validation
  - Skill routing
- `PostToolUse` hook (phase-tracker.mjs)
  - Agent completion detection
  - Progress tracking
  - Phase transition triggering
- `SessionStart` hook (session-loader.mjs)
  - Active workflow restoration
  - State recovery
  - Session resumption
- `PreCompact` hook (compact-preserver.mjs)
  - State backup before compaction
  - Context window compression safety
- `Stop` hook (cycle-finalize.cjs)
  - Graceful shutdown
  - Partial result preservation
  - Lock cleanup
- `SessionEnd` hook (session-cleanup.mjs)
  - Workflow archival
  - Stale lock removal
  - Session state reset

#### MCP Server
- `blueprint-server.cjs` with 3 tools
  - `pdca_status` - Query PDCA cycle state (ID, phase, iteration, progress)
  - `gap_measure` - Measure gap metrics (severity distribution, closure rate)
  - `pipeline_progress` - Check pipeline progress (current phase, gates passed, ETA)
- JSON-RPC protocol implementation
- Stateless design with file-based storage
- Concurrent request handling

#### State Management
- ID-based isolation for concurrent workflows
  - Each cycle/pipeline has unique ID
  - Independent state files per workflow
  - No interference between concurrent operations
- Lock protocol for concurrency safety
  - Atomic state writes
  - Timeout-based stale lock cleanup (5 minutes)
  - Deadlock prevention
- Session isolation
  - State stored at `.omc/blueprint/`
  - Per-session cleanup
  - Cross-session persistence

#### Agent Discovery
- Plugin agent loading (`blueprint-helix:agent-name`)
- Fallback to oh-my-claudecode agents
- Inline prompt fallback for robustness
- Graceful degradation when agents unavailable

#### Configuration
- `config/pdca-defaults.json` for PDCA customization
  - Maximum iterations
  - Phase timeouts
  - Auto-act behavior
  - Default agent assignments
- `config/pipeline-phases.json` for pipeline definition
  - 9 phases with agents and gates
  - 3 presets (full/standard/minimal)
  - Error handling options
  - Retry limits

#### Documentation
- README.md with comprehensive usage guide
- README.ko.md (Korean translation)
- AGENTS.md with directory-by-directory breakdown
- CHANGELOG.md (this file)

#### Development
- Zero external dependencies (Node.js built-ins only)
- ESM modules for hooks and utilities
- CommonJS for MCP server (compatibility)
- Unit test structure
- Integration test structure

### Architecture Decisions

#### Why Zero Dependencies?
- Minimal installation footprint
- Faster startup time
- No version conflicts
- Easier maintenance
- Better security posture

#### Why ID-based State Isolation?
- Multiple workflows can run concurrently
- No state interference
- Easy cleanup and archival
- Clear ownership and lifecycle

#### Why Lock Protocol?
- Prevents race conditions in concurrent access
- Ensures atomic state updates
- Timeout prevents deadlock from crashed processes
- File-based locks work across processes

#### Why Agent Fallbacks?
- Plugin remains functional even if agents fail to load
- Graceful degradation rather than hard failure
- Users can still invoke skills manually
- Inline prompts as last resort

### Breaking Changes

None (initial release)

### Deprecated

None (initial release)

### Security

- No external network access (local file operations only)
- State files scoped to project directory
- Lock files prevent concurrent modification
- No credential storage

---

[1.0.0]: https://github.com/quantsquirrel/claude-blueprint-helix/releases/tag/v1.0.0
