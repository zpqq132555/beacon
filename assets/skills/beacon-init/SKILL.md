---
name: beacon-init
description: "Beacon support skill: maintain the project AGENTS tree for manual full maintenance or archive-triggered follow-up."
---

# Beacon Init

**Immediately execute:** Use the Skill tool to load the `brainstorming` skill. Skipping this step is prohibited.

After the skill loads:
- Read the current workspace state, and you may include uncommitted changes in this maintenance pass.
- Output a summary-level AGENTS maintenance proposal first, then wait for user confirmation before creating, updating, merging, moving, or deleting files.
- Treat `/beacon-init` as the full AGENTS-tree maintenance entrypoint for the current workspace, including structural cleanup when the existing tree is duplicated or poorly layered.
- Keep the root `AGENTS.md` minimal, limited to the global entrypoint, key commands, high-value notes, and the AGENTS Map; `CLAUDE.md` remains only a shim that references `@AGENTS.md`.
- Use `beacon/reference/agents-topology.md` for layering rules and `beacon/reference/agents-sedimentation.md` for archive-triggered sedimentation policy.
