// Hamburger — toggles the mobile nav panel. Icon swaps between the
// navigation-search glyph and a close mark via a data attribute (keeps the
// element an <i class="ti ..."> rather than swapping to plain text).
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
