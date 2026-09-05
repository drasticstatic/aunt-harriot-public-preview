// Hamburger — the "every page on the site" menu, available at every width
// now (not just mobile). Icon swaps between the navigation-search glyph and
// a close mark via a data attribute (keeps the element an <i class="ti ...">
// rather than swapping to plain text).
function hgCloseMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  if (!menu) return;
  menu.classList.remove('open');
  document.querySelectorAll('.hamburger').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
    var icon = btn.querySelector('i');
    if (icon) icon.className = 'ti ti-navigation-search';
  });
}
document.querySelectorAll('.hamburger').forEach(function (btn) {
  var menu = document.getElementById('mobile-menu');
  var icon = btn.querySelector('i');
  if (!menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (icon) icon.className = open ? 'ti ti-x' : 'ti ti-navigation-search';
  });
});

// ---- persisted preferences: theme, reduce-motion, chip autoplay ----
// Same "read the live class, don't trust a one-shot localStorage read"
// convention as iamoneself's SettingsModal.
function hgGet(key, fallback) {
  try { var v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
}
function hgSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

(function applyStoredPrefs() {
  if (hgGet('harriot-motion', 'on') === 'off') document.documentElement.classList.add('reduce-motion');
  if (hgGet('harriot-autoplay', 'on') === 'off') document.body.classList.add('no-autoplay');
})();

function hgSwitchSet(el, on) {
  el.classList.toggle('on', on);
  el.setAttribute('aria-checked', on ? 'true' : 'false');
}

// No DOMContentLoaded wrapper here on purpose: this script tag sits at the end
// of <body>, so every element it queries already exists by the time it runs.
// Wrapping this in DOMContentLoaded caused it to silently never fire, since
// that event has frequently already dispatched by this point in the parse.

// theme switch
var themeSwitch = document.getElementById('theme-switch');
if (themeSwitch) {
  (function () {
    function syncTheme() { hgSwitchSet(themeSwitch, document.documentElement.classList.contains('dark')); }
    syncTheme();
    themeSwitch.addEventListener('click', function () {
      var isDark = document.documentElement.classList.contains('dark');
      document.documentElement.classList.remove(isDark ? 'dark' : 'light');
      document.documentElement.classList.add(isDark ? 'light' : 'dark');
      hgSet('harriot-theme', isDark ? 'light' : 'dark');
      syncTheme();
    });
  })();
}

// reduce-motion switch
var motionSwitch = document.getElementById('motion-switch');
if (motionSwitch) {
  hgSwitchSet(motionSwitch, document.documentElement.classList.contains('reduce-motion'));
  motionSwitch.addEventListener('click', function () {
    var on = !document.documentElement.classList.contains('reduce-motion');
    document.documentElement.classList.toggle('reduce-motion', on);
    hgSet('harriot-motion', on ? 'off' : 'on');
    hgSwitchSet(motionSwitch, on);
  });
}

// chip-ticker autoplay switch (only visibly does anything on workspace.html,
// but the preference is stored globally so it's consistent wherever you set it)
var autoplaySwitch = document.getElementById('autoplay-switch');
if (autoplaySwitch) {
  hgSwitchSet(autoplaySwitch, !document.body.classList.contains('no-autoplay'));
  autoplaySwitch.addEventListener('click', function () {
    var nowOn = document.body.classList.contains('no-autoplay');
    document.body.classList.toggle('no-autoplay', !nowOn);
    hgSet('harriot-autoplay', nowOn ? 'on' : 'off');
    hgSwitchSet(autoplaySwitch, nowOn);
  });
}

// notification-sounds demo toggle — no real sound, but the icon genuinely
// swaps between bell-ringing and bell-x so there's something to interact with
// instead of a disabled "Soon" placeholder.
var notifSwitch = document.getElementById('notif-switch');
if (notifSwitch) {
  var notifIcon = document.getElementById('notif-icon');
  notifSwitch.addEventListener('click', function () {
    var on = !notifSwitch.classList.contains('on');
    hgSwitchSet(notifSwitch, on);
    if (notifIcon) notifIcon.className = 'ti ' + (on ? 'ti-bell-ringing' : 'ti-bell-x');
  });
}

// viewport-force toggle — bidirectional:
//   - real desktop browser: constrains the page to a phone-width column
//     (force-mobile), a CSS-only trick, since a desktop browser's own
//     viewport IS the real viewport already.
//   - real mobile device: a CSS max-width trick does nothing, because the
//     device's actual viewport meta tag is what determines layout width —
//     so this rewrites <meta name="viewport"> itself to a fixed wide value,
//     the same mechanism a real "view desktop site" feature uses.
(function () {
  var viewportSwitch = document.getElementById('viewport-switch');
  if (!viewportSwitch) return;
  var meta = document.querySelector('meta[name="viewport"]');
  var DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1.0';
  var DESKTOP_VIEWPORT = 'width=1080';

  function isNarrowDevice() { return window.matchMedia('(max-width: 720px)').matches; }

  function syncIcon() {
    var icon = viewportSwitch.parentElement.querySelector('.ti');
    if (!icon) return;
    var forced = document.documentElement.classList.contains('force-mobile')
      || document.documentElement.classList.contains('force-desktop');
    icon.className = 'ti ' + (isNarrowDevice()
      ? (forced ? 'ti-device-imac-heart' : 'ti-devices-code')
      : (forced ? 'ti-device-imac-heart' : 'ti-device-mobile-code'));
  }

  // restore persisted state on load
  if (hgGet('harriot-force-mobile', 'off') === 'on' && !isNarrowDevice()) {
    document.documentElement.classList.add('force-mobile');
  }
  if (hgGet('harriot-force-desktop', 'off') === 'on' && isNarrowDevice() && meta) {
    document.documentElement.classList.add('force-desktop');
    meta.setAttribute('content', DESKTOP_VIEWPORT);
  }
  hgSwitchSet(viewportSwitch, document.documentElement.classList.contains('force-mobile') || document.documentElement.classList.contains('force-desktop'));
  syncIcon();

  viewportSwitch.addEventListener('click', function () {
    if (isNarrowDevice()) {
      var desktopOn = !document.documentElement.classList.contains('force-desktop');
      document.documentElement.classList.toggle('force-desktop', desktopOn);
      if (meta) meta.setAttribute('content', desktopOn ? DESKTOP_VIEWPORT : DEFAULT_VIEWPORT);
      hgSet('harriot-force-desktop', desktopOn ? 'on' : 'off');
      hgSwitchSet(viewportSwitch, desktopOn);
    } else {
      var mobileOn = !document.documentElement.classList.contains('force-mobile');
      document.documentElement.classList.toggle('force-mobile', mobileOn);
      hgSet('harriot-force-mobile', mobileOn ? 'on' : 'off');
      hgSwitchSet(viewportSwitch, mobileOn);
    }
    syncIcon();
    // toggling either direction changes which nav elements should be
    // visible — an already-open hamburger menu from the old layout would
    // otherwise linger, oversized, until a manual page refresh
    hgCloseMobileMenu();
  });
})();

// traffic-light easter egg — click any of the three title-bar dots.
// More to come here later; this is deliberately left as a place something
// else could live once there's a reason for it.
(function () {
  var messages = [
    { icon: 'eye-search', text: 'curiouser and curiouser' },
    { icon: 'mood-crazy-happy', text: "we're all mad here" },
    { icon: 'spade', text: 'off with your bug reports' },
    { icon: 'arrow-autofit-height', text: 'one side makes you taller' },
    { icon: 'hourglass-high', text: 'no time to say hello, goodbye' }
  ];
  var i = 0;
  document.querySelectorAll('.dots span').forEach(function (dot) {
    dot.addEventListener('click', function () {
      var m = messages[i % messages.length];
      i++;
      var toast = document.createElement('div');
      toast.className = 'hg-toast';
      toast.innerHTML = '<i class="ti ti-' + m.icon + '"></i> ' + m.text;
      document.body.appendChild(toast);
      requestAnimationFrame(function () { toast.classList.add('show'); });
      setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
      }, 1800);
    });
  });
})();

// settings modal open/close
(function () {
  var modal = document.getElementById('settings-modal');
  if (!modal) return;
  document.querySelectorAll('.settings-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { modal.classList.add('open'); });
  });
  modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () { modal.classList.remove('open'); });
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') modal.classList.remove('open'); });
})();
