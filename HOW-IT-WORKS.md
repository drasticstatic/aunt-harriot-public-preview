# How It Works

### Aunt Harriot

This page explains the actual mechanics — written so a technical reader (or anyone curious) can
see exactly what happens, not just the plain-language version on the [FAQ page](about.html). See
[`ROADMAP.md`](doc.html?doc=roadmap) for where this is headed and
[`SUSTAINABILITY.md`](doc.html?doc=sustainability) for how it's hosted and what it costs.

---

## Part one — getting in

Nothing here is built yet (see Status at the bottom), but the design is settled:

1. **Invite allowlist.** A visitor enters their email. If it's on Christopher's server-side
   allowlist (never a tracked git file — see `CLAUDE.md`'s credential rule), they get a one-time,
   short-expiry magic link.
2. **API key, second.** Only after that magic link authenticates the session does the dashboard
   ask for the visitor's own Anthropic API key. The key is a **usage-billing credential, never the
   access boundary** — the allowlist is what actually keeps random people out.
3. Non-allowlisted emails get a neutral "request access" response, not an error that reveals
   whether the address was checked against anything. The magic-link endpoint is rate-limited so it
   can't be used to enumerate the allowlist.

Full design: [`ROADMAP.md`](doc.html?doc=roadmap) §4.

---

## Part two — making a change

1. A visitor describes what they want in plain English.
2. Harriot reads the relevant files in whichever repo they're scoped to (`iamoneself`,
   `david-amaringo`) and proposes a specific, concrete diff — not a vague description of a change.
3. The visitor approves or asks for something different. Nothing is written until they approve.
4. On approval, Harriot commits to a branch of her own —
   `harriet/<invited-user-slug>/<task-slug>-<yyyy-mm-dd>` — under a scoped git identity (a GitHub
   App or PAT restricted to exactly the invited repos; which one is still an open call, see
   `ROADMAP.md` §2).
5. Harriot opens a pull request and tags Christopher as reviewer. **She never pushes to `main`
   directly, ever.** The PR is the actual safety net — not a courtesy, the load-bearing part of the
   whole design.

---

## Part three — what runs today vs. what's simulated

The [workspace preview](workspace.html) on this site is **real, working UI** — the chat, the
prompt suggestions, the diff card, the approve/cancel flow all function. What's simulated is the
intelligence behind it: typed requests are matched against a small set of patterns client-side
(plain JavaScript, no API call, nothing leaves your browser) to produce a realistic-looking
response. This is deliberate, not a shortcut — it's the same "UX first, wire in the real model
after" approach used on `pir-devine-news`'s admin dashboard, and it means the actual feel of using
Harriot is honestly represented today, not just described.

What's missing to make it real: the backend described in Part one and Part two above — an actual
Claude Code harness reading real files and proposing real diffs, instead of pattern-matched
canned ones.

---

## Why this is shared

Recording the machinery in the open does two things: it lets anyone using Harriot **see exactly
what she can and can't do** before trusting her with real edits, and it lets this framework be
**forked and understood by someone who isn't Christopher** — the entire point of Aunt Harriot
existing as a separate, forkable repo instead of one-off logic buried in each site she might
eventually touch.

---

## Part four — a stack question that's genuinely still open

This site is plain HTML/CSS/JS, no build step — the right fit for a front end with no backend to
talk to yet. The real backend won't stay that simple. A chatbot admin panel needs things a static
site structurally can't do: streaming responses token-by-token, a file-tree explorer, complex
state (which repo, which conversation, what's pending review), and a rich component ecosystem for
things like a visual diff viewer or a conversation-tree builder.

**React or Next.js is the strong front-end answer for that**, for reasons specific to a chatbot
admin panel rather than general "we should use a framework" instinct:

- **The AI SDK ecosystem ships React-first.** OpenAI, LangChain, and Stream Chat all provide a
  native React SDK before anything else — Harriot's real backend would be swimming with the
  current, not against it.
- **Next.js unifies the dashboard and its own API layer** in one codebase, with native
  Server-Sent Events/WebSocket support — exactly what streaming a live response token-by-token
  needs, the same way ChatGPT's own UI does it.
- **Rich, code-shaped UI** (a drag-and-drop conversation-tree builder, a live diff viewer) has
  mature React libraries (React Flow, for one) with no equivalent in a plain-template stack.

Christopher's actually considering **pairing that Next.js front end with a Django backend** —
not for the front end itself, but because a real Claude Code harness needs a real place to run
Python-ecosystem tooling (LangChain, LlamaIndex, embeddings), background jobs (re-indexing,
retraining), and a database Django's own ORM/admin already understands well. The trade-off is
real and worth naming plainly: **two codebases, two deployment pipelines, two local
environments** (Node for Next.js, Python for Django), and Django's own built-in admin panel
becomes something you no longer get for free — the whole point of building it in Next.js is a
custom UI, not the Django admin's default tables and forms.

**Nothing about this repo has committed to that stack.** It's the leading candidate for *when*
the real backend gets built, not a decision that's shipped. See [`ROADMAP.md`](doc.html?doc=roadmap)
§5 and [`SUSTAINABILITY.md`](doc.html?doc=sustainability) for how this same consideration threads
through the hosting and cost questions.

---

## Status

This site (the public front end you're reading right now) is real and live. The backend described
in Parts one, two, and four above is **not built yet** — see
[`ROADMAP.md`](doc.html?doc=roadmap) for exactly what's left and in what order.

*Last updated: September 5, 2026.*
