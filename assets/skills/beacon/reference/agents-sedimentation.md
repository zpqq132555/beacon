# AGENTS Sedimentation

- One-off background, temporary workarounds, or feature-specific notes that are not reusable long term should be silently ignored and kept out of AGENTS.
- Only when archived content is long-lived and high-value for AI should Beacon propose a summary-level AGENTS sedimentation update and wait for confirmation.
- If the project has no AGENTS tree yet, invoke `/beacon-init` as "full maintenance + current archive injection".
- If the project already has an AGENTS tree, limit `/beacon-init` to incremental maintenance for the current archive only.
- Whether maintenance is manual or archive-triggered, create/update/merge/move/delete actions should always be proposed in summary form before files are written.
