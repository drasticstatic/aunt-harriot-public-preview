// Aunt Harriot — preview deploy (hardened)
//
// Replaces setup/ideas-from-Gemini/deploy-preview.js, which is deprecated (reference only) as of
// 2026-09-10 — see AGENT-SYNC/created-by-mystarch/2026-09-10_harriot-pipeline-security-review.md.
//
// Fixes applied vs. the Gemini original:
//   1. Every git/npm invocation uses execFileSync with an argument array, never a shell string
//      built from clientName/featureName. The original interpolated those values straight into
//      execSync template strings, which run through a shell — a client name like
//      `foo; rm -rf .` was a direct shell-injection vector. Argument arrays have no shell to
//      inject into.
//   2. clientName/featureName are validated against a strict allowlist pattern before use in a
//      branch name or file path, on top of (1) — defense in depth.
//   3. The stash/pop sequence is wrapped in try/finally so a failed build can't strand the
//      user's working directory in a stashed state.

import { execFileSync } from 'child_process';

const SAFE_SEGMENT = /^[a-zA-Z0-9_-]{1,64}$/;

function runFile(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf-8' }).trim();
}

function assertSafeSegment(value, label) {
  if (!SAFE_SEGMENT.test(value)) {
    throw new Error(
      `${label} "${value}" contains characters outside [a-zA-Z0-9_-] — rejected before it ever reaches git/npm.`
    );
  }
}

function deployPreview(clientName, featureName) {
  const cleanFeature = featureName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  assertSafeSegment(clientName, 'clientName');
  assertSafeSegment(cleanFeature, 'featureName (post-slugify)');

  const previewBranch = `preview/${clientName}-${cleanFeature}`;
  console.log(`Staging preview for ${clientName} on branch [${previewBranch}]...`);

  const stashRef = `harriot-preview-${Date.now()}`;
  let stashed = false;

  try {
    runFile('git', ['stash', 'push', '-u', '-m', stashRef]);
    stashed = true;

    runFile('git', ['checkout', '-B', previewBranch]);

    console.log('Building client preview package...');
    runFile('npm', ['run', 'build']);

    const distDir = './dist';
    console.log('Syncing build artifacts to target lane...');

    runFile('git', ['add', '-f', distDir]);
    runFile('git', ['commit', '-m', `Auto-generated preview build for ${clientName}`]);
    runFile('git', ['push', 'origin', previewBranch, '--force-with-lease']);

    const previewUrl = `https://drasticstatic.github.io/${clientName}/${cleanFeature}`;
    console.log(`\nSuccess! Aunt Harriot deployed the preview live here:\n${previewUrl}\n`);
    return { previewBranch, previewUrl };
  } finally {
    runFile('git', ['checkout', 'main']);
    if (stashed) {
      try {
        runFile('git', ['stash', 'pop']);
      } catch (e) {
        console.error(
          `Could not auto-pop the stash "${stashRef}" — it's still in the stash list, ` +
          `resolve manually with 'git stash list' / 'git stash pop'. Error: ${e.message}`
        );
      }
    }
  }
}

const [, , clientName = 'AcmeCorp', featureName = 'Landing Page Hero V2'] = process.argv;
deployPreview(clientName, featureName);
