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

  /* ── auth gate (simulated — see file header), now a modal wizard ──────── */
  function initGate() {
    var modal = document.getElementById('gate-modal');
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
      setTimeout(function () {
        sendBtn.disabled = false;
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

    function unlockWorkspace() {
      modal.classList.remove('open');
      document.getElementById('workbench').hidden = false;
      var badge = document.getElementById('mode-badge');
      badge.innerHTML = '<i class="ti ti-virtual-space"></i> PREVIEW <span class="hg-glyph badge-glyph">⎙</span> SIMULATED';
      renderChips();
      initRepoSwitcher();
      initExamplePicker();
      initFileTree();
      initSidebarDrawer();
      initNewRequest();
      addMsg('agent', '⎈ ' + msgTypeIcon('agent') + "You're in — ask for a change in plain English, or try one of the suggestions below");
      // auto-focus is a nice touch on desktop, but on a real phone it pops
      // the keyboard and can trigger the OS's own zoom-on-focus the instant
      // the page loads — before the visitor has even seen the terminal.
      // Skip it below the same breakpoint the rest of the mobile layout uses.
      if (!window.matchMedia('(max-width: 720px)').matches) {
        document.getElementById('chat-input').focus();
      }
    }
  }

  function initNewRequest() {
    var btn = document.getElementById('new-request-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      document.getElementById('chat-input').value = '';
      document.getElementById('chat-input').focus();
      addMsg('agent', msgTypeIcon('agent') + "Starting fresh — what would you like to change in <code>" + currentRepo + "</code>?");
    });
  }

  /* ── repo switcher + file tree ──────────────────────────────────────── */
  function initRepoSwitcher() {
    document.querySelectorAll('.session[data-repo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.session[data-repo]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentRepo = btn.getAttribute('data-repo');
        document.getElementById('tree-iamoneself').hidden = currentRepo !== 'iamoneself';
        document.getElementById('tree-david-amaringo').hidden = currentRepo !== 'david-amaringo';
        addMsg('agent', msgTypeIcon('agent') + 'Switched to <code>' + currentRepo + '</code>. What would you like to change there?');
      });
    });
  }

  function initFileTree() {
    document.querySelectorAll('.file-tree .folder > .node').forEach(function (node) {
      node.addEventListener('click', function () {
        node.parentElement.classList.toggle('open');
        var folderIcon = node.querySelector('.ti-folder, .ti-folder-open');
        if (folderIcon) {
          var open = node.parentElement.classList.contains('open');
          folderIcon.className = open ? 'ti ti-folder-open' : 'ti ti-folder';
        }
      });
    });
  }

  function initSidebarDrawer() {
    var toggle = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('sidebar');
    var backdrop = document.getElementById('sidebar-backdrop');
    if (!toggle) return;
    function close() { sidebar.classList.remove('drawer-open'); backdrop.classList.remove('open'); }
    toggle.addEventListener('click', function () {
      sidebar.classList.add('drawer-open');
      backdrop.classList.add('open');
    });
    backdrop.addEventListener('click', close);
  }

  function initExamplePicker() {
    var select = document.getElementById('example-select');
    if (!select) return;
    select.addEventListener('change', function () {
      if (!select.value) return;
      document.getElementById('chat-input').value = select.value;
      select.value = '';
      send();
    });
  }

  /* ── chat ───────────────────────────────────────────────────────────── */
  function msgTypeIcon(who) {
    return who === 'user'
      ? '<i class="ti ti-message-user msg-type-icon"></i>'
      : '<i class="ti ti-message-2-exclamation msg-type-icon"></i>';
  }

  function addMsg(who, html) {
    var chat = document.getElementById('chat');
    var wrap = document.createElement('div');
    wrap.className = 'msg ' + who;
    var whoIcon = who === 'user' ? 'ti-user-edit' : 'ti-robot';
    var whoLabel = who === 'user' ? 'YOU' : 'HARRIOT';
    wrap.innerHTML = '<p class="who"><i class="ti ' + whoIcon + '"></i>' + whoLabel + '</p><div class="bubble">' + html + '</div>';
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
    return wrap;
  }

  function showTyping() {
    var chat = document.getElementById('chat');
    var wrap = document.createElement('div');
    wrap.className = 'msg agent';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = '<p class="who"><i class="ti ti-robot"></i>HARRIOT</p><div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
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
    addMsg('user', msgTypeIcon('user') + escapeHtml(text));
    showTyping();
    setTimeout(function () { hideTyping(); respond(text); }, 700 + Math.random() * 500);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function diffBubble(intro, file, removeLine, addLine, note) {
    return msgTypeIcon('agent') + intro + '<div class="diff-card"><div class="file">' + currentRepo + '/' + file + '</div>' +
      (removeLine ? '<div class="line remove">− ' + removeLine + '</div>' : '') +
      '<div class="line add">+ ' + addLine + '</div></div>' +
      '<div class="action-row" data-actions>' +
      '<button type="button" class="primary" data-push><i class="ti ti-cube-send"></i> Push this change</button>' +
      '<button type="button" data-cancel><i class="ti ti-adjustments-code"></i> Change something first</button>' +
      '</div><p class="note">' + note + '</p>';
  }

  function wireActions(msgEl) {
    var actions = msgEl.querySelector('[data-actions]');
    if (!actions) return;
    actions.querySelector('[data-push]').addEventListener('click', function () {
      actions.innerHTML =
        '<span class="confirm-text">Are you sure?</span>' +
        '<button type="button" class="confirm" data-yes><i class="ti ti-git-pull-request"></i> Yes, open the PR</button>' +
        '<button type="button" data-no>Wait, let me reconsider</button>';
      actions.querySelector('[data-yes]').addEventListener('click', function () {
        actions.innerHTML = '<span class="logged-note"><i class="ti ti-git-pull-request"></i> Logged (demo) — this will actually open a pull request once the real backend is live.</span>';
      });
      actions.querySelector('[data-no]').addEventListener('click', function () {
        actions.innerHTML = '<span class="logged-note">Cancelled — tell me what you\'d change about it.</span>';
      });
    });
    actions.querySelector('[data-cancel]').addEventListener('click', function () {
      actions.innerHTML = '<span class="logged-note">Cancelled — tell me what you\'d change about it.</span>';
    });
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
      addMsg('agent', msgTypeIcon('agent') + 'I can help with that. Once the real backend is wired up, I\'d read the actual files in <code>' + currentRepo + '</code> and propose a specific diff. For now, try one of the suggestions below to see the shape of that response.<p class="note">See <a href="doc.html?doc=how-it-works">how it works</a> for exactly what\'s simulated here and what isn\'t yet.</p>');
      return;
    }

    var msgEl = addMsg('agent', bubble);
    wireActions(msgEl);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGate();
    document.getElementById('chat-send').addEventListener('click', send);
    document.getElementById('chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') send();
    });
  });
})();
