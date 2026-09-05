# Aunt Harriot — Roadmap

Architecture and open-questions doc for the portal/dashboard/harness Christopher asked for on
2026-09-03: a fork of [`anthropas-argus-alfred`](https://github.com/drasticstatic/anthropas-argus-alfred-public-preview)'s Claude Code harness pattern, but authenticated by
a visitor's own Anthropic API key instead of Christopher's subscription, so external collaborators
(starting with Kenney, for [`iamoneself`](https://github.com/drasticstatic/iamoneself-public-preview) and
[`david-amaringo`](https://github.com/drasticstatic/david-amaringo-public-preview)) can run an admin agent against
scoped repos without needing a GitHub account or ever touching git directly. (Links to source
throughout this doc point at GitHub, not the live sites — this is a build document, not a tour.)

This is a **planning document, not a build log** — nothing described here exists as working code
yet. See `README.md` for the one-paragraph pitch.

**Session start pointer (added 2026-09-04):** before building, read
`augment-intent-properties/AGENT-SYNC/created-by-mystarch/HANDOFF_20260904_HARRIOT_MAGIC_ROADMAP.md`
— it captures scope decisions (native suggestion feature, no Intent-bridge dependency, BYOK
deferred, PR-reviewer-chief role built here on plain `git`/`gh`) and reference UI patterns found in
[`pir-devine-news`](https://github.com/drasticstatic/pir-devine-news-public)/`iamoneself` worth
reusing, so they don't get re-derived or re-opened.

---

## 1. Branch & remote structure

**Decision (confirmed 2026-09-03): Harriet pushes feature branches directly. Kenney never needs a
GitHub account.** Rationale from Christopher: "the less the better to not confuse him or others he
employs" — every extra account/credential is friction for a non-technical user, and Christopher
wants a single review gate keeping GitHub itself clean, not multiple contributors' forks to track.

### How it works

1. **Harriet has her own scoped git identity** — not Christopher's personal token, not the
   visitor's own credentials. Recommended: a **GitHub App installation** (not a classic PAT)
   restricted to exactly the target repos (`iamoneself`, `david-amaringo` for Kenney's case), with
   contents + pull-request write permissions only — no admin, no delete, no access to any other
   repo in the ecosystem. A GitHub App's per-repo installation scoping is a hard boundary a PAT
   can't give you as cleanly; worth the extra setup step over reusing an existing PAT pattern.
2. **Branch naming**: `harriet/<invited-user-slug>/<task-slug>-<yyyy-mm-dd>` — e.g.
   `harriet/kenney/homepage-copy-edit-2026-09-05`. Keeps every branch attributable to who
   requested it and roughly when, without needing to cross-reference a separate log.
3. **Harriet never touches `main` directly** — no direct pushes, no force-pushes, ever. Every
   change lands as a PR from a `harriet/...` branch.
4. **PR opened automatically** by Harriet's bot identity the moment work is ready for review,
   tagging Christopher (or whoever owns review for that repo) as reviewer. This is the review
   gate Christopher asked for — Kenney's edits reach `main` only through his own approval.
5. **Branch cleanup**: enable "automatically delete head branches" (a per-repo GitHub setting) so
   merged `harriet/...` branches don't accumulate.
6. **Base-branch safety**: Harriet always branches from the current `main` at task start, never
   from a stale or another user's in-progress branch — avoids silent conflicts between two
   invited users editing the same repo concurrently. If concurrent edits to the same repo become
   common, revisit whether Harriet needs a lightweight "is anyone else mid-task here" check before
   branching.

### What this repo's own remotes look like

- `origin` → `aunt-harriot` (private, this repo) — the framework's own source.
- A separate sync workflow (§2) pushes to `aunt-harriot-public-preview` (public) — unrelated to
  the branch model above, which governs how *Harriet-the-deployed-agent* interacts with the repos
  she edits on Christopher's/Kenney's behalf, not this framework repo's own history.

---

## 2. GitHub Actions & sync scripts

### This repo's own public-preview sync

`.github/workflows/sync-public.yml` (already scaffolded) — **exclude-list model**, not allowlist.
Aunt Harriot is meant to be a forkable framework, closer to `trading-assistant`/`pir-devine-news`'s
mostly-open pattern than `augment-intent-properties`'s mostly-private one. Strips: `CLAUDE.md`,
`AGENTS.md`, `.github/`, `AGENT-SYNC/`, `specs/`, `graphify-out/`, and
`server/config/allowlist.json` (§4 — the invite list must never reach a public repo). Everything
else — the actual framework code, once it exists — syncs to `aunt-harriot-public-preview`
automatically on push to `main`. **Reminder from the template's own gotchas**: this model fails
*open* — a new private path leaks until explicitly added to the strip list. Audit the root tree
on every new top-level addition.

### Target-repo workflows (iamoneself, david-amaringo) — not yet built

Two pieces needed once the actual harness exists:

1. **A "Harriet task complete" workflow** in each target repo (or centrally, dispatched via the
   GitHub App) that runs on PR-open from a `harriet/...` branch: basic checks (build/lint,
   preview-deploy if the repo has one) so Christopher reviews a PR that's already been sanity
   -checked, not raw unverified output.
2. **Existing deploy/sync pipelines stay untouched** — once a `harriet/...` PR merges to `main`,
   whatever `iamoneself`/`david-amaringo` already run on `main` pushes (their own
   `-public`/`-public-preview` sync, if they have one) fires normally. Harriet doesn't need her
   own deploy step; she only needs to get clean, reviewed commits onto `main`.

### GitHub App vs. PAT — open implementation question

Not decided: whether to build the GitHub App installation now (more setup, cleaner scoping) or
start with a narrowly-scoped classic PAT (faster to stand up, harder to constrain to
exactly-two-repos as cleanly) for the first Kenney deployment, and upgrade later. Recommendation:
start with the PAT for the first working prototype — it's the faster path to something Kenney can
actually use — but treat the GitHub App migration as a near-term hardening step once the harness
works end-to-end once, not a someday-maybe.

---

## 3. Documented alternative: fork-and-PR (the "GitHub lane")

Not the initial model, but worth keeping as a documented option for a future user who *does* have
(or wants) their own GitHub account — e.g. a more technical collaborator than Kenney, or someone
self-hosting their own Aunt Harriot instance entirely.

- Visitor forks the target repo under their own GitHub account.
- Harriet operates inside their fork (still authenticated by their own Anthropic API key), commits
  there.
- Harriet opens a PR from their fork back to the upstream repo.
- Standard OSS-style isolation — the visitor's GitHub account *is* the access boundary, no
  separate invite-allowlist needed for repo-write purposes (though the front-end login gate in §4
  would likely still apply, to control who even reaches the dashboard at all).

**Trade-off vs. the direct-push model**: strictly more setup friction for the visitor (needs a
GitHub account, needs to understand what a fork is) in exchange for needing *no* scoped bot
credential management on Christopher's side per-repo — the visitor's own GitHub permissions (or
lack thereof) are the boundary. Good fit for a self-hosted/open-source distribution of this
framework later; wrong fit for Kenney's case today.

---

## 4. Access gate — protecting Harriet's front end from random visitors

Christopher's question: *"How do we protect random people from logging into Harriot's front end?
What type of password gate can we use additional to the API login?"*

**The real risk here isn't API cost** — each visitor supplies their own Anthropic API key, so
someone else's key means someone else's bill, not Christopher's. **The actual risk is unauthorized
access to the repo-push capability itself** — Harriet, once authenticated, can commit to
`iamoneself`/`david-amaringo` on someone's behalf. An API key alone proves someone has Anthropic
billing set up; it proves nothing about whether they should be allowed anywhere near those repos.
So the API key should be treated as a **second factor / usage-billing credential**, never as the
primary authorization gate.

### Recommended design: invite-only allowlist + magic link, API key as second step

1. **Server-side invite allowlist** (`server/config/<something>.json` or a small database table —
   never a tracked git file, already excluded from the public sync in §2) keyed by email address.
   Each entry records: email, which repo(s) they're scoped to (Kenney → `iamoneself` +
   `david-amaringo` only), and any per-repo constraints worth adding later (e.g. path
   restrictions within a repo). Only Christopher can add entries.
2. **Magic-link login**: visitor enters their email → if it's on the allowlist, Harriot emails a
   one-time, short-expiry login link → clicking it authenticates the session. No password to
   create, remember, or lose — matches "the less the better to not confuse him." Non-allowlisted
   emails get a neutral "request access" message, not an error revealing whether the address was
   checked against anything.
3. **API key entered after login, not before** — once authenticated via the magic link, the
   dashboard asks for their Anthropic API key (this is where the `iamoneself` admin-modal linkage
   Christopher mentioned comes in — surfacing "get your key" guidance right there). Store it
   encrypted server-side or session-only (not persisted across sessions) — a design choice to
   finalize once the actual backend exists; either way, never log it, never expose it to the
   client after initial capture, never commit it anywhere.
4. **Rate-limit the magic-link request endpoint** — prevent someone hammering arbitrary email
   addresses to see which ones are allowlisted (an enumeration/abuse vector even without any
   downstream access).
5. **Scoped bot credential does the actual git work** (§1) — even if the access gate above were
   somehow bypassed, the blast radius is capped at whatever repos the GitHub App/PAT can touch,
   not Christopher's whole account.
6. **Public-preview site stays fully separate and static** — `aunt-harriot-public-preview` (GH
   Pages) is a showcase/landing page only, no login, no secrets, no functional dashboard. The
   actual live app (with real push capability) needs real hosting with a backend — it can't live
   on GitHub Pages at all, since GH Pages only serves static content and this needs to hold
   secrets and make authenticated git calls server-side. Hosting choice not yet decided; needs its
   own pass once the app itself is being built.

### Why not just a shared password?

A single shared password (in addition to the API key) is the obvious quick answer, but it doesn't
actually solve the problem: it doesn't scope *which* repos someone can touch, it's one more thing
Kenney has to remember/lose/share insecurely (defeating "the less the better"), and once shared
with one person it's effectively shared with everyone they might casually mention it to. The
allowlist model above achieves the same "keep randoms out" goal without a shared secret at all —
each real person gets tied to their own email and their own scope, and revoking one person's
access is a one-line change instead of a password rotation for everyone.

---

## 5. What's genuinely open / not decided yet

- **Hosting for the real (non-static) app** — where the backend + secrets actually live. Not
  decided; pick this before building past the planning stage.
- **GitHub App vs. PAT** timing (§2) — PAT first for speed, App as a near-term hardening pass.
- **API key storage model** — encrypted-at-rest vs. session-only, not yet decided (§4.3).
- **`retreats.iamoneself` domain/production readiness** — the eventual `aunt-harriot-public` lane
  target; not scoped yet, revisit once `-public-preview` proves the framework works end-to-end.
- **Concurrent-edit handling** (§1.6) — only worth solving once multiple invited users are
  actually active on the same repo at once; not blocking for a single-user (Kenney) prototype.
- **Front-end/backend stack for the real dashboard** (added 2026-09-05) — see §6 below.

---

## 6. Stack consideration: Next.js front end, Django backend

Not decided, not started — this is the leading candidate, recorded here so it doesn't get
re-derived from scratch once building starts. Full reasoning: [`HOW-IT-WORKS.md`](doc.html?doc=how-it-works)
Part four and [`SUSTAINABILITY.md`](doc.html?doc=sustainability).

**Why this pairing, specifically for a chatbot admin panel** (not a generic "use a framework"
preference): streaming a response token-by-token, a file-tree explorer, and a visual diff/PR
review UI are all things React's component ecosystem already has mature answers for, and every
major AI SDK (OpenAI, LangChain, Stream Chat) ships a React integration first. Next.js adds the
API layer (SSE/WebSocket-native) in the same codebase. Django earns its place on the *backend*
side specifically because the real harness needs the Python AI ecosystem (LangChain, LlamaIndex,
embeddings) and Django's ORM/background-job story (Celery) for anything heavier than a quick
request/response — not because Django is a natural pair with a React front end by default.

**Named trade-off, not hidden**: two codebases, two deploy pipelines, two local dev environments
(Node + Python), and Django's own built-in admin panel stops being free — the custom UI is the
entire reason to be in Next.js instead of Django templates in the first place.

This repo's front end (`docs/`) stays plain HTML/CSS/JS regardless — that decision was made for a
static surface with no backend to talk to, and isn't in tension with this. This section is about
the *real* dashboard once the backend exists, not a plan to rewrite what's live today.

### Sequencing decision (confirmed 2026-09-05)

For getting Kenney into a real beta, the priority is **free and shipped**, not architecturally
ideal — Django's real cost (an always-on process, not free the way GitHub Pages is) isn't worth
paying before there's even a first real user. So, in order:

1. **Now, for Kenney's beta**: stay on GitHub Pages, no backend yet. This is the "advanced layers"
   on top of the plain static site already live — real interactivity built as far as it can go
   client-side (see the workspace preview) before a server becomes unavoidable.
2. **Build "Next.js-ready," not Next.js**: when front-end code does get added for real interactivity
   that static HTML can't do, structure it so a later move to Next.js is a migration, not a
   rewrite — plain component-shaped files, no framework-specific patterns baked in that would need
   undoing. Nothing to build differently *today* — this is a constraint on how future work gets
   structured, not new work now.
3. **Django (or any real backend) is a later-MVP decision**, made once there's an actual paying
   or committed reason to carry a non-free hosting cost — not before. See
   [`SUSTAINABILITY.md`](doc.html?doc=sustainability) for the cost shape if/when that happens.
