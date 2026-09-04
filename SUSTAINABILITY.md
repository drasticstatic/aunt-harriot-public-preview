# Hosting & Sustainability

### Aunt Harriot

---

> **For Kenney, future invited users, and anyone forking this framework, asking:**
> *"Who hosts this? What happens if Christopher moves on? Does this cost me anything? What if I want to run my own copy?"*

---

## Where the site lives

The public front end is hosted on **GitHub Pages** — free, permanent static hosting run by GitHub.
No monthly fee, no server to maintain, no technical staff required to keep it online. Every push
to the private repo's `main` branch triggers a sync-and-publish; if nobody touches the repo, the
site simply stays up exactly as it is, indefinitely.

**Live URL:** https://drasticstatic.github.io/aunt-harriot-public-preview/

---

## Who currently owns it

Built under Christopher Wilson's personal GitHub account (`drasticstatic`). Aunt Harriot is
explicitly designed to be **forked** — the whole point of the bring-your-own-API-key model (see
[`ROADMAP.md`](ROADMAP.md)) is that anyone can stand up their own instance without needing
Christopher's credentials, subscription, or involvement at all.

---

## What "sustainability" means here

| Concern | Answer |
|---------|--------|
| **What does this cost Kenney?** | $0 beyond his own Anthropic API usage. Harriot's thinking is billed to whichever key the visitor supplies, not to Christopher. |
| **What if Christopher moves on?** | The repo can be forked or transferred like any other. Since the front end is plain static HTML/CSS/JS with no build step, anyone can read, edit, and redeploy it without special tooling. |
| **What if GitHub goes down?** | GitHub Pages has 99.9%+ uptime. Worst case, the static files (`docs/`) can be hosted anywhere — Netlify, Vercel, or any web server — at no cost. |
| **What if Kenney wants his own instance instead?** | That's the actual design goal, not an edge case — fork the repo, point it at your own repos, bring your own API key. See [`ROADMAP.md`](ROADMAP.md). |
| **What if Anthropic's API changes pricing?** | The front end you're reading right now runs without any AI subscription at all — it's static HTML. The real backend (not yet built) will need an API key regardless of who's paying for it; that cost is the visitor's own choice, not a fixed platform fee. |

---

## Current hosting stack

| Layer | Provider | Account | Cost |
|-------|----------|---------|------|
| Static site hosting | GitHub Pages | `drasticstatic` (forkable to anyone) | Free |
| Source code | GitHub private repo (`aunt-harriot`) + public mirror (`aunt-harriot-public-preview`) | `drasticstatic` | Free |
| Automation CI | GitHub Actions (sync + graphify) | `drasticstatic` | Free (2,000 min/mo) |
| The actual thinking | Anthropic API | Whoever's using Harriot, their own key | Pay-as-you-go, per user |

The real backend — a scoped GitHub App/PAT for Harriot's own git identity, a magic-link + invite
allowlist login, and wherever the API key gets held — isn't built yet (see
[`ROADMAP.md`](ROADMAP.md) §5). Its hosting cost isn't decided either, since the hosting platform
itself is one of the open questions.

---

## What could break (and how to fix it)

| Risk | Trigger | Fix |
|------|---------|-----|
| Public sync stops working | `PUBLIC_REPO_TOKEN` PAT expires or is revoked | Regenerate the PAT, update the repo secret — no code changes needed, the workflow references the secret name, not the value |
| GitHub Pages goes stale | Pages build fails silently | `gh api repos/drasticstatic/aunt-harriot-public-preview/pages/builds/latest` shows the last build status |
| A future private root file leaks publicly | The exclude-list sync model fails *open*, not closed — a new private path leaks until it's added to the strip list | Audit `.github/workflows/sync-public.yml`'s `--path` list on every new top-level addition (see `CLAUDE.md`) |

---

## For developers (or Kenney, if he ever wants to look)

No framework, no build tools, no package manager required to read or edit the public front end
(`docs/`) — it's plain HTML, CSS, and a small amount of vanilla JavaScript. The actual backend,
once built, will very likely need real tooling; that decision hasn't been made yet.

- `CLAUDE.md` / `AGENTS.md` — agent instructions and security rules (private, not synced)
- `ROADMAP.md` — the full planned architecture, kept public and up to date
- `HOW-IT-WORKS.md` — the plain-English mechanics of how a request actually becomes a change

---

## Contact

Questions about hosting, access, or anything technical: reach Christopher directly, or open an
issue on the public repo.

---

*This document is public and intentionally written for both non-technical readers and developers.*
*Last updated: September 4, 2026.*
