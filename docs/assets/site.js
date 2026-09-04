// Hamburger — toggles the mobile nav panel (which also holds the theme
// toggle on small screens, so the title bar's traffic lights + filename
// keep the room on mobile instead of competing with a full nav row).
document.querySelectorAll('.hamburger').forEach(function (btn) {
  var menu = document.getElementById('mobile-menu');
  if (!menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? '✕' : '☰';
  });
});

// Theme toggle — reads/writes the live class on <html>, same pattern as
// iamoneself's SettingsModal (not a one-shot localStorage read).
document.querySelectorAll('.theme-toggle').forEach(function (btn) {
  function render() {
    var isDark = document.documentElement.classList.contains('dark');
    // shows the icon for what clicking it switches TO, not the current state
    btn.textContent = isDark ? '☼' : '☾';
    btn.setAttribute('aria-label', isDark ? 'Switch to the light workspace' : 'Switch to the dark workspace');
  }
  render();
  btn.addEventListener('click', function () {
    var isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove(isDark ? 'dark' : 'light');
    document.documentElement.classList.add(isDark ? 'light' : 'dark');
    try { localStorage.setItem('harriot-theme', isDark ? 'light' : 'dark'); } catch (e) {}
    render();
  });
});
