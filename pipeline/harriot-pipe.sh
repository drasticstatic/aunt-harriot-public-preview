#!/bin/bash
set -euo pipefail

# ====================================================================
# Aunt Harriot CLI Orchestration Pipeline (hardened)
#
# Replaces setup/ideas-from-Gemini/harriot-pipe.sh, which is deprecated (reference only) as of
# 2026-09-10 — see AGENT-SYNC/created-by-mystarch/2026-09-10_harriot-pipeline-security-review.md.
#
# Fix applied vs. the Gemini original: the merge gate no longer does a bare
# `grep -q "[HARRIOT_MERGE_READY]"` against the whole log, which matches even when the flag
# appears inside a sentence explaining why merge was REJECTED (e.g. "I will not output
# [HARRIOT_MERGE_READY] because..."). This version requires the flag to be the exact, sole
# content of the response's last non-empty line.
# ====================================================================

PAYLOAD_FILE="./.harriot/pending_payload.xml"
LOG_OUTPUT="./.harriot/claude_review.log"

if [ ! -f "$PAYLOAD_FILE" ]; then
    echo "Error: extraction payload not found at $PAYLOAD_FILE"
    echo "Run 'node pipeline/extract-workspace-delta.js <client> <feature>' first."
    exit 1
fi

echo "Forwarding workspace payload to Claude CLI..."
cat "$PAYLOAD_FILE" | claude pipe > "$LOG_OUTPUT" 2>&1

last_line="$(grep -v '^[[:space:]]*$' "$LOG_OUTPUT" | tail -n 1 || true)"

if [ "$last_line" = "[HARRIOT_MERGE_READY]" ]; then
    echo "Success — Claude validated the workspace changes as the response's final line."
    echo "auto_merge_enabled is false by design (see harriot-webhook schema) — this pipeline"
    echo "stops here. A human reviews and merges the preview branch manually."
else
    echo "Validation flag not found as the exact last line — treating as rejected or ambiguous."
    echo "Check the full assessment at: $LOG_OUTPUT"
    exit 1
fi
