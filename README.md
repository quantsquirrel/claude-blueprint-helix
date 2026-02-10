# claude-blueprint-helix

> Systematic development through iterative improvement: PDCA cycles, Gap Analysis, and Dev Pipeline for Claude Code

A Claude Code plugin that brings structured development methodologies to AI-assisted programming. Build better software through continuous improvement cycles, systematic gap analysis, and phased development pipelines.

## Features

- **PDCA Cycles** (`/blueprint:pdca`) - Iterative Plan-Do-Check-Act improvement loops for continuous refinement
- **Gap Analysis** (`/blueprint:gap`) - Compare current state vs desired state with severity-based reporting
- **Dev Pipeline** (`/blueprint:pipeline`) - Structured development through 3/6/9-stage pipelines
- **Cancel** (`/blueprint:cancel`) - Graceful termination of active cycles and pipelines

## Installation

```bash
claude plugin add quantsquirrel/claude-blueprint
```

## Quick Start

### PDCA Cycle

Run iterative improvement cycles on your codebase:

```
/blueprint:pdca "Improve error handling in authentication module" --iterations 3
```

Each cycle:
1. **Plan** - Analyze current state and create improvement plan
2. **Do** - Implement changes
3. **Check** - Verify implementation meets goals
4. **Act** - Review results and decide next iteration

### Gap Analysis

Identify gaps between current and desired state:

```
/blueprint:gap "API should follow REST conventions" --severity high
```

Generates a detailed report with:
- Current state analysis
- Desired state specification
- Gap identification by severity (critical/high/medium/low)
- Actionable recommendations

### Dev Pipeline

Execute structured development workflows:

```
/blueprint:pipeline "Add user authentication" --preset standard
```

Available presets:
- **full** (9 stages) - Complete workflow with all gates
- **standard** (6 stages) - Balanced workflow (default)
- **minimal** (3 stages) - Fast iteration for small changes

### Cancel Active Workflows

Stop running cycles or pipelines gracefully:

```
/blueprint:cancel --all
```

## Skills Reference

| Skill | Description | Key Arguments |
|-------|-------------|---------------|
| `/blueprint:pdca` | Run PDCA improvement cycles | `--iterations N`, `--auto-act` |
| `/blueprint:gap` | Perform gap analysis | `--severity [critical\|high\|medium\|low]` |
| `/blueprint:pipeline` | Execute dev pipeline | `--preset [full\|standard\|minimal]` |
| `/blueprint:cancel` | Cancel active workflows | `--all`, `--cycle-id ID`, `--pipeline-id ID` |

## Pipeline Presets

| Preset | Stages | Phases | Best For |
|--------|--------|--------|----------|
| **full** | 9 | requirements → architecture → design → implementation → unit-test → integration-test → code-review → gap-analysis → verification | Critical features, new modules |
| **standard** | 6 | requirements → design → implementation → unit-test → code-review → verification | Most development tasks |
| **minimal** | 3 | design → implementation → verification | Quick fixes, small changes |

## Architecture

### Components

- **6 Hooks** - Lifecycle management
  - `UserPromptSubmit` - Keyword detection
  - `PostToolUse` - Progress tracking
  - `SessionStart` - State restoration
  - `PreCompact` - State preservation
  - `Stop` - Graceful shutdown
  - `SessionEnd` - Cleanup

- **3 Custom Agents** - Specialized analysis
  - `gap-detector` (opus) - Read-only gap analysis
  - `design-writer` (sonnet) - Design document generation
  - `pdca-iterator` (sonnet) - PDCA cycle orchestration

- **1 MCP Server** - External tool access
  - `pdca_status` - Query PDCA cycle state
  - `gap_measure` - Measure gap metrics
  - `pipeline_progress` - Check pipeline progress

### State Management

State files stored at `.omc/blueprint/`:
- ID-based isolation (multiple cycles/pipelines can run concurrently)
- Lock protocol prevents race conditions
- Session cleanup on exit
- Graceful shutdown support

### Zero Dependencies

Built entirely with Node.js built-ins:
- No external packages required
- Minimal installation footprint
- Fast startup and execution

## Configuration

Configuration files in `config/`:

### `pdca-defaults.json`

```json
{
  "max_iterations": 4,
  "phase_timeout_ms": 300000,
  "auto_act": false,
  "default_agents": {
    "plan": ["oh-my-claudecode:analyst", "blueprint:pdca-iterator"],
    "do": ["oh-my-claudecode:executor"],
    "check": ["oh-my-claudecode:verifier"],
    "act": ["blueprint:pdca-iterator"]
  }
}
```

### `pipeline-phases.json`

Defines all 9 phases with agents and gate conditions. Customize for your workflow.

## Examples

### Iterative Performance Optimization

```
/blueprint:pdca "Optimize database query performance in user service" --iterations 4 --auto-act
```

Each iteration measures improvements and automatically proceeds if goals are met.

### Pre-Merge Quality Check

```
/blueprint:gap "Code ready for production" --severity critical
```

Identifies blocking issues before merge.

### Full Feature Development

```
/blueprint:pipeline "Add OAuth2 authentication" --preset full
```

Walks through all 9 stages from requirements to verification.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Repository

[https://github.com/quantsquirrel/claude-blueprint-helix](https://github.com/quantsquirrel/claude-blueprint-helix)

---

Built with ❤️ for systematic software development
