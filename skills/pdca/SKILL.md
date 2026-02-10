---
name: pdca
description: "Use when you want to iteratively improve code quality through Plan-Do-Check-Act cycles. Triggers: pdca, iterative improvement, continuous improvement, quality cycle."
argument-hint: <task> [--max-iterations=N] [--auto-act]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
user-invocable: true
---

# PDCA Skill

Systematically improve code quality through iterative Plan-Do-Check-Act improvement cycles.

## When to Use

Use this skill when:
- You want to iteratively improve code quality with measurable progress
- A feature needs refinement through multiple improvement cycles
- You want structured quality improvement with decision points
- You need continuous improvement with verification at each iteration

Do NOT use when:
- Single-pass implementation is sufficient
- No quality baseline exists to measure against
- Immediate delivery is required without iteration

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `task` | Yes | The improvement task or feature to iteratively refine |
| `--max-iterations=N` | No | Maximum PDCA cycles (default: 4) |
| `--auto-act` | No | Automatically continue without manual approval at Act phase |

Example: `/blueprint:pdca "improve auth module error handling" --max-iterations=3`

## Workflow

### 1. Initialize
- Generate unique cycle-id (format: `pdca-{timestamp}`)
- Create state file at `.omc/blueprint/pdca/cycles/{cycle-id}.json`
- Set initial phase to "plan"

State file format:
```json
{
  "id": "pdca-20260210-143022",
  "task": "improve auth module error handling",
  "status": "active",
  "current_phase": "plan",
  "iteration": 1,
  "max_iterations": 4,
  "created_at": "2026-02-10T14:30:22Z",
  "updated_at": "2026-02-10T14:30:22Z",
  "phases": {
    "plan": {"status": "pending", "output": null},
    "do": {"status": "pending", "output": null},
    "check": {"status": "pending", "output": null},
    "act": {"status": "pending", "decision": null}
  }
}
```

### 2. Plan Phase
Spawn agents to analyze current state and create improvement plan:

**Primary path (with fallback):**
```javascript
// Try plugin agent first
Task(subagent_type="blueprint:pdca-iterator",
     model="sonnet",
     prompt="Plan phase: Analyze task and create improvement plan.\nTask: {user_task}\nIteration: {N}")

// Fallback if plugin agent unavailable
Task(subagent_type="oh-my-claudecode:analyst",
     model="opus",
     prompt="You are a PDCA cycle orchestrator in Plan phase.\nAnalyze: {user_task}\nCreate actionable improvement plan with specific targets.")
```

Output: Structured plan with clear quality targets and acceptance criteria

### 3. Do Phase
Implement the plan created in Plan phase:

```javascript
Task(subagent_type="oh-my-claudecode:executor",
     model="sonnet",
     prompt="Implement the following PDCA plan:\n{plan_output}\n\nTask: {user_task}")
```

Output: Implementation changes with file:line references

### 4. Check Phase
Verify implementation against quality targets:

```javascript
Task(subagent_type="oh-my-claudecode:verifier",
     model="sonnet",
     prompt="Verify PDCA implementation meets targets:\nPlan: {plan_output}\nImplementation: {do_output}\nCheck all acceptance criteria.")
```

Output: Verification report with pass/fail on each target

### 5. Act Phase
Decide whether to continue iterating or complete:

**Primary path (with fallback):**
```javascript
// Try plugin agent first
Task(subagent_type="blueprint:pdca-iterator",
     model="sonnet",
     prompt="Act phase: Review verification results and decide next action.\nVerification: {check_output}\nIteration: {N}/{max_iterations}")

// Fallback if plugin agent unavailable
Task(subagent_type="oh-my-claudecode:analyst",
     model="opus",
     prompt="You are a PDCA cycle orchestrator in Act phase.\nReview: {check_output}\nDecide: CONTINUE (if targets not met) or COMPLETE (if targets met or max iterations reached)")
```

Decisions:
- **CONTINUE**: Quality targets not met AND iterations remaining → loop back to Plan (iteration++)
- **COMPLETE**: Quality targets met OR max iterations reached → finalize cycle

### 6. Finalize
When complete:
- Set status='completed' in state file
- Archive to `.omc/blueprint/pdca/history/{cycle-id}-{timestamp}.json`
- Generate summary report

## Output Format

```
## PDCA Cycle Complete: {cycle-id}

### Task
{user_task}

### Iterations
- Total cycles: {N}
- Final status: {COMPLETE/INCOMPLETE}

### Iteration Summary
**Iteration 1**
- Plan: [summary of plan]
- Do: [summary of implementation]
- Check: [verification results]
- Act: CONTINUE (reason: [why])

**Iteration 2**
- Plan: [refined plan]
- Do: [implementation]
- Check: [verification results]
- Act: COMPLETE (reason: targets met)

### Final Outcome
- [2-3 sentences on achieved improvements]
- Quality progression: [baseline] → [final]

### Evidence
- Build: [command] -> [pass/fail]
- Tests: [command] -> [X passed]
- Verification: [summary]
```

## State Management

**Active cycles tracked in**: `.omc/blueprint/pdca/active-cycles.json`
```json
{
  "cycles": [
    {"id": "pdca-123", "task": "...", "iteration": 2, "status": "active"}
  ]
}
```

**Update state after each phase**:
```bash
# Update current phase
jq '.current_phase = "do" | .updated_at = now' state.json > tmp && mv tmp state.json

# Record phase output
jq '.phases.plan.status = "completed" | .phases.plan.output = "..."' state.json > tmp && mv tmp state.json
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Plan too vague | Require specific, measurable targets in Plan phase |
| Do phase diverges from plan | Pass full plan context to executor |
| Check phase always passes | Strengthen acceptance criteria in Plan phase |
| Infinite loops | Enforce max_iterations hard limit |
| Lost context between iterations | Always include previous iteration summary in next Plan |

## Agent Fallback Pattern

For all Task() calls, implement this pattern:

```javascript
try {
  // Primary: plugin agent
  result = Task(subagent_type="blueprint:pdca-iterator", ...)
} catch (AgentNotFoundError) {
  // Fallback: OMC agent with inline role prompt
  result = Task(subagent_type="oh-my-claudecode:analyst",
                prompt="You are a PDCA cycle orchestrator...\n{specific_instructions}")
}
```

This ensures the skill works even when the plugin agent is unavailable.

## Example Session

User: `/blueprint:pdca "improve error handling in auth module" --max-iterations=3`

1. **Initialize**: Create `pdca-20260210-143022.json`
2. **Iteration 1 - Plan**: analyst identifies missing try/catch blocks, sets target: 100% error coverage
3. **Iteration 1 - Do**: executor adds try/catch to 5 functions
4. **Iteration 1 - Check**: verifier finds 2 functions still missing error handling → FAIL
5. **Iteration 1 - Act**: pdca-iterator decides CONTINUE (targets not met)
6. **Iteration 2 - Plan**: pdca-iterator creates refined plan focusing on 2 remaining functions
7. **Iteration 2 - Do**: executor adds error handling to remaining functions
8. **Iteration 2 - Check**: verifier confirms 100% coverage → PASS
9. **Iteration 2 - Act**: pdca-iterator decides COMPLETE (targets met)
10. **Finalize**: Archive cycle, generate report

Result: Auth module improved from 60% → 100% error coverage in 2 iterations
