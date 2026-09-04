// Workspace preview — real, working UI; simulated intelligence. Every function here is written
// as the seam where the real thing plugs in later (see HOW-IT-WORKS.md, "what's simulated"):
//   - respond(text)   → swap the regex match for an actual Claude Code harness call
//   - gate handlers   → swap the setTimeout "sent"/"saved" for real magic-link + key storage calls
// Nothing here calls a network endpoint. Nothing typed here — including the "API key" — leaves
// the browser tab.

(function () {
  var currentRepo = 'iamoneself';

  var CHIPS = [
    'Update the retreat dates to March 15–17',
    'Add a new FAQ about integration circles',
    "Update David's artist bio",
    'Change the contact email on the booking page',
    'Add a testimonial from a recent retreat',
    'Fix a typo in the Plants & Miracles section'
  ];

  function renderChips() {
    var row = document.getElementById('chip-row');
    if (!row) return;
    var html = '';
    // duplicated once for a seamless marquee loop (chip-scroll keyframe moves -50%)
    [1, 2].forEach(function () {
      CHIPS.forEach(function (text) {
        html += '<button type="button" class="chip">' + text + '</button>';
      });
    });
    row.innerHTML = html;
    row.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.getElementById('chat-input').value = chip.textContent;
        send();
      });
    });
  }

  /* ── auth gate (simulated — see file header) ───────────────────────── */
  function initGate() {
    var step1 = document.getElementById('step-1');
    var step2 = document.getElementById('step-2');
    var emailInput = document.getElementById('gate-email');
    var sendBtn = document.getElementById('gate-send');
    var confirmBox = document.getElementById('gate-step1-confirm');
    var clickedBtn = document.getElementById('gate-clicked');
    var keyInput = document.getElementById('gate-key');
    var saveBtn = document.getElementById('gate-save');
    var skipLink = document.getElementById('gate-skip');

    sendBtn.addEventListener('click', function () {
      if (!emailInput.value.trim()) { emailInput.focus(); return; }
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending…';
      setTimeout(function () {
        sendBtn.textContent = 'Send magic link';
        confirmBox.hidden = false;
      }, 600);
    });

    clickedBtn.addEventListener('click', function () {
      step1.classList.add('done');
      step1.classList.remove('active');
      step2.classList.add('active');
      keyInput.disabled = false;
      saveBtn.disabled = false;
      keyInput.focus();
    });

    saveBtn.addEventListener('click', function () {
      if (!keyInput.value.trim()) { keyInput.focus(); return; }
      step2.classList.add('done');
      step2.classList.remove('active');
      unlockWorkspace();
    });

    skipLink.addEventListener('click', function (e) {
      e.preventDefault();
      unlockWorkspace();
    });
  }

  function unlockWorkspace() {
    document.getElementById('gate').hidden = true;
    document.getElementById('workbench').hidden = false;
    var badge = document.getElementById('mode-badge');
    badge.textContent = 'PREVIEW · SIMULATED';
    renderChips();
    initRepoSwitcher();
    addMsg('agent', "You're in. Ask for a change in plain English, or try one of the suggestions scrolling above.");
    document.getElementById('chat-input').focus();
  }

  /* ── repo switcher ──────────────────────────────────────────────────── */
  function initRepoSwitcher() {
    document.querySelectorAll('.session[data-repo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.session[data-repo]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentRepo = btn.getAttribute('data-repo');
        addMsg('agent', 'Switched to <code>' + currentRepo + '</code>. What would you like to change there?');
      });
    });
  }

  /* ── chat ───────────────────────────────────────────────────────────── */
  function addMsg(who, html) {
    var chat = document.getElementById('chat');
    var wrap = document.createElement('div');
    wrap.className = 'msg ' + who;
    wrap.innerHTML = '<p class="who">' + (who === 'user' ? 'YOU' : 'HARRIOT') + '</p><div class="bubble">' + html + '</div>';
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
    return wrap;
  }

  function showTyping() {
    var chat = document.getElementById('chat');
    var wrap = document.createElement('div');
    wrap.className = 'msg agent';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = '<p class="who">HARRIOT</p><div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }
  function hideTyping() {
    var el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function send() {
    var input = document.getElementById('chat-input');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg('user', escapeHtml(text));
    showTyping();
    setTimeout(function () { hideTyping(); respond(text); }, 700 + Math.random() * 500);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function diffBubble(intro, file, removeLine, addLine, note) {
    return intro + '<div class="diff-card"><div class="file">' + currentRepo + '/' + file + '</div>' +
      (removeLine ? '<div class="line remove">− ' + removeLine + '</div>' : '') +
      '<div class="line add">+ ' + addLine + '</div></div>' +
      '<div class="action-row" data-actions>' +
      '<button type="button" class="primary" data-approve>Looks good — open the PR</button>' +
      '<button type="button" data-cancel>Change something first</button>' +
      '</div><p class="note">' + note + '</p>';
  }

  function respond(text) {
    var t = text.toLowerCase();
    var bubble;

    if (/testimonial|review|quote/.test(t)) {
      bubble = diffBubble(
        "I'd add this as a new testimonial entry:",
        'content/testimonials.json',
        null,
        '{ "quote": "…", "attribution": "…" }',
        "Real testimonial text and attribution would come from you — this demo just shows where it lands."
      );
    } else if (/dates?|march|february|schedule/.test(t)) {
      bubble = diffBubble(
        "Found it — here's the change I'd make:",
        'content/retreats.json',
        '"dates": "February 8–10"',
        '"dates": "March 15–17"',
        "Christopher reviews and merges every change before it goes live — you'll never push straight to the site."
      );
    } else if (/faq|question|integration/.test(t)) {
      bubble = diffBubble(
        "I'd add this as a new entry:",
        'content/faq.json',
        null,
        '{ "q": "What is an integration circle?", "a": "…" }',
        "I'd draft the actual answer text with you before proposing this for real — this demo skips straight to the diff."
      );
    } else if (/bio|artist|about (david|maestro)/.test(t) || /david/.test(t)) {
      bubble = diffBubble(
        "Here's the proposed update to David's bio section:",
        'content/artist-bio.md',
        '"trained by his uncle Pablo Cesar Amaringo Shuña"',
        '"trained by his uncle Pablo Cesar Amaringo Shuña — updated wording"',
        'I would ask you for the actual replacement text first; this demo just shows the shape of the diff.'
      );
    } else if (/email|contact|booking/.test(t)) {
      bubble = diffBubble(
        "Proposed change to the booking contact:",
        'content/contact.json',
        '"email": "old@example.com"',
        '"email": "new@example.com"',
        "I'd confirm the exact new address with you before proposing this for real."
      );
    } else if (/typo|fix|correct|spelling/.test(t)) {
      bubble = diffBubble(
        "Found a likely candidate — here's the fix:",
        'content/teachings/plants-and-miracles.md',
        '[the misspelled word]',
        '[corrected]',
        "In the real version I'd point at the actual line I found, not a placeholder."
      );
    } else {
      addMsg('agent', 'I can help with that. Once the real backend is wired up, I\'d read the actual files in <code>' + currentRepo + '</code> and propose a specific diff. For now, try one of the suggestions scrolling above to see the shape of that response.<p class="note">See <a href="doc.html?doc=how-it-works">how it works</a> for exactly what\'s simulated here and what isn\'t yet.</p>');
      return;
    }

    var msgEl = addMsg('agent', bubble);
    var actions = msgEl.querySelector('[data-actions]');
    actions.querySelector('[data-approve]').addEventListener('click', function () {
      actions.innerHTML = '<span class="logged-note">✓ Logged (demo) — this will actually open a pull request once the real backend is live.</span>';
    });
    actions.querySelector('[data-cancel]').addEventListener('click', function () {
      actions.innerHTML = '<span class="logged-note">Cancelled — tell me what you\'d change about it.</span>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGate();
    document.getElementById('chat-send').addEventListener('click', send);
    document.getElementById('chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') send();
    });
  });
})();
