# Aunt Harriot 🧑‍🍳

> A fork of [`anthropas-argus-alfred`](https://github.com/drasticstatic/anthropas-argus-alfred-public-preview)'s
> Claude Code harness — same admin-agent/skills model, but authenticated by a visitor's own
> Anthropic API key through a front-end portal instead of Christopher's Claude Pro/Max
> subscription, so people outside this ecosystem can run their own instance against their own
> codebases (or, for Kenney specifically, against
> [`iamoneself`](https://github.com/drasticstatic/iamoneself-public-preview) and
> [`david-amaringo`](https://github.com/drasticstatic/david-amaringo-public-preview) on scoped feature branches
> Christopher reviews and merges).

[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey?style=flat)](LICENSE)
[![Public Preview](https://img.shields.io/badge/%F0%9F%8C%90%20Public%20Preview-Live-brightgreen)](https://drasticstatic.github.io/aunt-harriot-public-preview/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code%20CLI-blueviolet)](https://code.claude.com/docs/en/overview)
[![Status](https://img.shields.io/badge/Status-%F0%9F%9A%A7%20Planning-yellow)](ROADMAP.md)

---

**🌐 [Explore the Public Preview →](https://drasticstatic.github.io/aunt-harriot-public-preview/)**

---

> 🔒 **Public mirror notice:** This repository is synced to a public preview
> (`aunt-harriot-public-preview`) via an automated GitHub Actions pipeline
> (`git-filter-repo`, exclude-list model — see [ROADMAP.md](ROADMAP.md) §2). Aunt Harriot is meant
> to be a forkable framework, so the public copy is the *default* — almost everything syncs.
> Governance/agent-config files (`CLAUDE.md`, `AGENTS.md`), `.github/` workflow definitions,
> `AGENT-SYNC/` handoff notes, and anything credential-adjacent (`server/config/allowlist.json`,
> once it exists) are the only things stripped.

---

> 🪪 Named after **Harriet Cooper** — Alfred Pennyworth's Batman-comics/1960s-TV domestic
> counterpart, who moved into Wayne Manor to help raise Dick Grayson. Fitting sibling name for a
> repo that's a domesticated, API-key-authenticated counterpart to `anthropas-argus-alfred`.
>
> See [`AGENT_IDENTITY_REFERENCE.md`](https://github.com/drasticstatic/anthropas-argus-alfred-public-preview/blob/main/sandbox/AGENT_IDENTITY_REFERENCE.md)
> for how Aunt Harriot fits alongside Christopher's other agent personas (Kavanah, Alfred, Fortuna,
> Mystarch) — including two additional pseudonyms drafted for her specifically: the wholesome
> **Harriet's Magic Hats** register and the stranger **March Harriet** one. The public site's
> "window" identity (see below) leans into the March Harriet, looking-glass side of that split.

---

## Table of Contents

- [👋 What this is](#what-this-is)
- [🎯 The goal](#the-goal)
- [🏗️ Architecture](#architecture)
- [🌐 The site](#the-site)
- [🤝 Collaboration](#collaboration)
- [📜 License](#license)

---

<a id="what-this-is"></a>
## 👋 What this is

Christopher already has two working, subscription-authenticated harnesses in this ecosystem:
Mystarch (app-level, Augment Intent) and Alfred
([`anthropas-argus-alfred`](https://github.com/drasticstatic/anthropas-argus-alfred-public-preview), native
Claude Code CLI, general-purpose). Both assume the person driving the session has Christopher's own
Claude Pro/Max login. Aunt Harriot removes that assumption — she's the same shape of harness
(admin dashboard, `.claude/skills`, a `ClaudeCodeHarness`-style agent loop) but front-end,
portal-login, and **bring-your-own-Anthropic-API-key** instead.

**Origin idea:** Christopher had already started an admin agent (for non-technical editors to
update the `pir-devine-news` front end without his help) and a lead-collection chatbot/submission
agent, both powered by `platform.claude.com`/NVIDIA NIM, but never finished wiring the backend —
NIM's reliability issues echoed the same ACP flakiness this whole ecosystem has been fighting.
Kenney is now purchasing `platform.claude.com` access to power a similar admin agent for
[`iamoneself`](https://github.com/drasticstatic/iamoneself-public-preview) — Aunt Harriot is the shared, reusable version of that idea: prove the `ws.app.*`
integration pattern once (see `mystarch_chief-of-staff_acp-spoof`), then give Kenney (and anyone
else) their own instance instead of rebuilding this per-project.

**Developer / builder:** Christopher Wilson (`drasticstatic`)
**First external user:** Kenney — `iamoneself` + `david-amaringo` admin work, no GitHub account
needed (see [ROADMAP.md](ROADMAP.md))

---

<a id="the-goal"></a>
## 🎯 The goal

- Keep **Mystarch** oriented around Intent builds and **Alfred** general-purpose/subscription-backed.
- Let Aunt Harriot absorb the API-key-billed work (Kenney's `iamoneself`/`david-amaringo` editing,
  and anyone else this gets shared with) — offsetting Claude Pro/Max usage back onto
  per-user API credits instead.
- Non-technical users (Kenney) never touch GitHub, a terminal, or branch/merge mechanics — they
  log into a portal, and Harriet does the git work on their behalf on a scoped feature branch
  Christopher reviews before merge.

---

<a id="architecture"></a>
## 🏗️ Architecture (planned — see [ROADMAP.md](ROADMAP.md) for the full design)

- **Portal + admin dashboard + ClaudeCodeHarness** — front end where a visitor enters their own
  Anthropic API key plus an invite credential (see ROADMAP.md's access-gate design), then gets a
  Claude-Code-driven dashboard scoped to whichever repo(s) they're invited to.
- **Branch model** — Harriet pushes feature branches directly to the target repo (`iamoneself`,
  `david-amaringo`) under a scoped bot identity; Christopher reviews and merges via PR. No fork
  required, no GitHub account required for the visitor.
- **Public lanes** — `aunt-harriot-public-preview` (draft/staging, live on GitHub Pages now) now;
  an eventual `aunt-harriot-public` → `retreats.iamoneself` direct-publish lane once the framework
  is production-ready, matching this ecosystem's established `-public-preview` → `-public`
  naming convention.

---

<a id="the-site"></a>
## 🌐 The site

Live at **[drasticstatic.github.io/aunt-harriot-public-preview](https://drasticstatic.github.io/aunt-harriot-public-preview/)**
— hand-authored static HTML/CSS (`docs/`), no build step, framed as Harriot's own "window":
a persistent title bar + tab-style nav + status bar wrap every page, in place of a generic
marketing-site layout. Defaults to a dark register, with a light/dark toggle that persists per
visitor (same `.dark`-class convention as `iamoneself`/`findyourfeathers`).

| Page | What it's for |
|------|---------------|
| [Home](https://drasticstatic.github.io/aunt-harriot-public-preview/) | The portal — who Harriot is, one paragraph, two doors in |
| [Workspace](https://drasticstatic.github.io/aunt-harriot-public-preview/workspace.html) | A real, interactive mock of the chat → diff → PR flow — genuinely working UI, honestly-labeled simulated intelligence |
| [FAQ](https://drasticstatic.github.io/aunt-harriot-public-preview/about.html) | Answers plus links to the rendered `ROADMAP.md`/`HOW-IT-WORKS.md`/`SUSTAINABILITY.md` docs |

---

<a id="collaboration"></a>
## 🤝 Collaboration

Solo-developer project (Christopher Wilson), built with AI-agent assistance. First real-world
usage target: Kenney, for `iamoneself` and `david-amaringo` admin work.

---

<a id="license"></a>
## 📜 License

[MIT](LICENSE) — applies to this repo's own framework code. It does not extend to Anthropic's
API terms or any codebase a forked instance is pointed at.

---

*Built and maintained by [drasticstatic](https://github.com/drasticstatic) · w/ Anthropic's Claude Code CLI*
