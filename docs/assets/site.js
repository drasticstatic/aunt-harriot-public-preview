// Theme toggle — reads/writes the live class on <html>, same pattern as
// iamoneself's SettingsModal (not a one-shot localStorage read).
document.querySelectorAll('.theme-toggle').forEach(function (btn) {
  function render() {
    var isDark = document.documentElement.classList.contains('dark');
    btn.textContent = isDark ? '☾' : '☼';
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
