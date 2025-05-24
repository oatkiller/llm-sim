# AI Task Management Cheat Sheet

## Essential Commands (projectRoot="/home/robert/code/games/llm-sim")

```bash
# Get next available task
mcp_taskmaster-ai_next_task

# List all tasks with subtasks
mcp_taskmaster-ai_get_tasks with withSubtasks=true

# Get specific task details
mcp_taskmaster-ai_get_task with id="10.5"

# Set task status
mcp_taskmaster-ai_set_task_status with id="10.5", status="in-progress"

# Log implementation progress
mcp_taskmaster-ai_update_subtask with id="10.5", prompt="Implementation notes..."
```

## Codebase Exploration

```bash
# Check app structure
list_dir with relative_workspace_path="src"

# Read current app
read_file with target_file="src/App.tsx"

# Check tests
list_dir with relative_workspace_path="e2e"

# Check data models
list_dir with relative_workspace_path="src/types"
```

## Task ID Formats
- Parent tasks: `"10"`
- Subtasks: `"10.5"` (dot notation)

## Status Values
- "pending", "in-progress", "done", "deferred", "cancelled"

## Quick Workflow
1. Get next task → 2. Verify task exists → 3. Set to in-progress → 4. Explore codebase → 5. Implement → 6. Log progress

## Current Project State
- ✅ Tasks 1,2,3: Setup, data models, storage
- 🔄 Task 10: Testing (in-progress)
- ⏸️ Tasks 4-8: UI components (blocked by testing)

## Common Issues
- **Task ID not found**: Check actual task list structure
- **Missing prerequisites**: Verify dependencies exist before implementing tests 