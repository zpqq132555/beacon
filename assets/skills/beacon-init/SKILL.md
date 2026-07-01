---
name: beacon-init
description: "Beacon support skill: maintain the project AGENTS tree for manual full maintenance or archive-triggered follow-up."
---

# Beacon Init

**Immediately execute:** Use the Skill tool to load the `brainstorming` skill. Skipping this step is prohibited.

After the skill loads:
- Read the current workspace state, and you may include uncommitted changes in this maintenance pass.
- Output a summary-level AGENTS maintenance proposal first, then wait for user confirmation before creating, updating, merging, moving, or deleting files.
- Keep the root `AGENTS.md` minimal, limited to the global entrypoint, key commands, high-value notes, and the AGENTS Map.
- When invoked manually, perform full maintenance for the AGENTS tree based on the current workspace rather than touching only one directory.
- If the current AGENTS tree shows duplication, responsibility mismatch, or poor layering, you may propose structural refactors.
- Use `beacon/reference/agents-topology.md` to decide the boundaries for the root `AGENTS.md`, directory-level `AGENTS.md`, `[responsibility].md`, and deeper nodes.
- Use `beacon/reference/agents-sedimentation.md` to distinguish manual full maintenance from archive-triggered incremental sedimentation.
- `CLAUDE.md` is only a shim that references `@AGENTS.md`; do not duplicate the same rules there.
