# Privacy Policy

### Aunt Harriot

The short version: this site collects nothing about you today, and the real backend's design
(not built yet) is deliberately built to collect as little as possible. Full mechanics:
[`HOW-IT-WORKS.md`](doc.html?doc=how-it-works).

---

## What this site collects today

Nothing, server-side — there is no server. This is a static site on GitHub Pages. Your browser
does store a few small preferences locally (theme, reduced-motion, whether the workspace's example
chips autoplay) via `localStorage` — that data never leaves your browser and Christopher never
sees it. Anything you type into the workspace preview's chat is processed entirely client-side
and is never transmitted anywhere.

GitHub Pages itself may log standard web server access data (IP address, request timing) the same
way any static host does — that's GitHub's infrastructure, not something this site adds on top of.

## What the real backend will collect (once it exists)

- **Your email**, to check it against the invite allowlist and send a magic link. Not shared,
  not sold, used only for that login purpose.
- **Your Anthropic API key**, entered after login. Never logged, never exposed back to your
  browser after initial entry, never committed to any file. Whether it's encrypted-at-rest or
  session-only is still an open design question — see [`ROADMAP.md`](doc.html?doc=roadmap) §4.3.
- **The changes you ask for**, since that's the actual point — these become real, visible pull
  requests on the repos you're invited to, reviewed by Christopher.

## What never gets collected

Payment information (nothing here processes payments), anything about repos you weren't invited
to, or any data broader than what's needed to do the specific task you asked for.

## Third parties

GitHub (hosting, source control), Anthropic (whichever API key you supply), and — once decided —
whatever backend hosting the [stack consideration](doc.html?doc=roadmap) settles on. No analytics
provider, no ad network, no tracking pixel.

## Questions

Reach Christopher directly, or open an issue on the public repo (linked in the footer of every
page on this site).

---

*Last updated: September 5, 2026.*
