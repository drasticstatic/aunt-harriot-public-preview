# Harriot review pipeline

Hardened rewrite of the XML-delta review pipeline originally prototyped in
`setup/ideas-from-Gemini/` (`extract-pr-diff.js`, `harriot-pipe.sh`, `deploy-preview.js`,
`harriot-orchestrator.js`). Those originals are now deprecated — reference only, do not run them.
Full security review: `AGENT-SYNC/created-by-mystarch/2026-09-10_harriot-pipeline-security-review.md`.

## What changed, in one line each

- **`extract-workspace-delta.js`** — base64-encodes file content instead of raw CDATA (closes a
  prompt-injection breakout), scans for secret paths/content before including anything, caps
  per-file and total payload size, XML-escapes metadata, uses `execFileSync` with argument arrays.
- **`harriot-pipe.sh`** — merge gate now requires `[HARRIOT_MERGE_READY]` as the exact last line
  of the response, not a substring match anywhere in the log.
- **`deploy-preview.js`** — `execFileSync` with argument arrays (no shell-injectable string
  interpolation), a strict allowlist pattern on `clientName`/`featureName`, `--force-with-lease`
  instead of a bare `--force`, and the stash/pop wrapped in `try/finally` so a failed build can't
  strand the working directory.
- **`harriot-orchestrator.js`** — unchanged logic, just points at the hardened scripts above.
- **`harriot-webhook.json`** — unchanged; it's a data shape, not executable, so it carried no
  injection risk in the original.

## Status

This is a hardened version of one candidate pipeline for Aunt Harriot's still-undecided "actual
backend" (see `PENDING-TASKS.md`'s "Open — next real decision, not blocking" section) — it is
**not** yet reconciled with `ROADMAP.md`'s GitHub-App/PR-branch model, which is a different
architecture (Harriet opens PRs for human review on GitHub directly, rather than a local
XML-payload-to-Claude-CLI review loop). Whoever picks up the actual backend decision should decide
whether this pipeline becomes a component of that PR flow (e.g. as the automated pre-review step
before a PR opens) or gets superseded by it entirely — flagging that decision, not making it here.
