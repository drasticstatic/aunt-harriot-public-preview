// March Harriet's take on the classic digital-rain effect — ported from a
// React/canvas component to vanilla JS (see /setup/matrix-rain.md for the
// source this was adapted from). Mixes real matrix katakana with Tabler
// icon glyphs (rendered straight from the same webfont the rest of the site
// uses, via their codepoints) and a handful of plain-text coding symbols,
// tinted with the site's own queen/cheshire/hatter/caterpillar ramp instead
// of stock green. Respects reduce-motion and the dark/light toggle.
(function () {
  var canvas = document.getElementById('matrix-rain');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Real matrix katakana + digits — kept sparse, scattered in among the rest.
  var katakana = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
  // Plain-text developer/coding punctuation.
  var codeChars = '{}<>/;=()$#*+-_[]|&%'.split('');
  // Tabler icon glyphs (dev/coding themed), by codepoint — same manifest
  // used to verify every other icon name on this site.
  var iconCodepoints = [
    'ebef', // terminal-2
    'ea77', // code
    'ebcc', // braces
    'ee08', // binary
    'eab2', // git-branch
    'eab3', // git-commit
    'ea48', // bug
    'ef8e', // cpu
    'ea78', // command
    'ebd6', // keyboard
    'ea88', // database
    'ebd0', // file-code
    'eab5', // git-merge
    'ef6f', // brand-git
    'f07c', // server-2
    'ea38', // bolt
    'eabc', // hash
    'f4a2'  // source-code
  ].map(function (hex) { return String.fromCharCode(parseInt(hex, 16)); });

  var fontSize = 15;
  var speed = 95;
  var columns = [];
  var drops = [];
  var glyphKind = []; // 'icon' | 'kana' | 'code' per column, re-rolled per drop cycle
  var lastGlyph = []; // last character drawn per column, so it never repeats twice in a row
  var raf = null;
  var interval = null;

  function pickGlyph(kind) {
    if (kind === 'icon') return iconCodepoints[(Math.random() * iconCodepoints.length) | 0];
    if (kind === 'kana') return katakana[(Math.random() * katakana.length) | 0];
    return codeChars[(Math.random() * codeChars.length) | 0];
  }

  function pickGlyphNoRepeat(kind, exclude) {
    var glyph = pickGlyph(kind);
    var tries = 0;
    while (glyph === exclude && tries < 8) {
      glyph = pickGlyph(kind);
      tries++;
    }
    return glyph;
  }

  function rollKind() {
    var r = Math.random();
    if (r < 0.4) return 'icon';
    if (r < 0.65) return 'kana';
    return 'code';
  }

  function themeColors() {
    var isDark = document.documentElement.classList.contains('dark');
    var style = getComputedStyle(document.documentElement);
    var base = style.getPropertyValue('--cheshire-400').trim() || (isDark ? '#35d6c0' : '#0d6e63');
    var accents = [
      style.getPropertyValue('--queen-400').trim(),
      style.getPropertyValue('--hatter-400').trim(),
      style.getPropertyValue('--caterpillar-400').trim()
    ].filter(Boolean);
    var bg = style.getPropertyValue('--bg-raised').trim() || (isDark ? '#1a1522' : '#fdfaf5');
    return { base: base, accents: accents, bg: bg, isDark: isDark };
  }

  function resize() {
    canvas.width = Math.max(1, window.innerWidth);
    canvas.height = Math.max(1, window.innerHeight);
    var count = Math.ceil(canvas.width / fontSize);
    columns = [];
    drops = [];
    glyphKind = [];
    lastGlyph = [];
    for (var i = 0; i < count; i++) {
      columns.push(i);
      drops.push(Math.random() * (canvas.height / fontSize));
      glyphKind.push(rollKind());
      lastGlyph.push(null);
    }
  }

  function draw() {
    var colors = themeColors();
    ctx.fillStyle = colors.bg;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    for (var i = 0; i < drops.length; i++) {
      var kind = glyphKind[i];
      var glyph = pickGlyphNoRepeat(kind, lastGlyph[i]);
      lastGlyph[i] = glyph;
      var x = i * fontSize;
      var y = drops[i] * fontSize;

      ctx.font = kind === 'icon' ? fontSize + 'px "tabler-icons"' : (fontSize + 2) + 'px monospace';
      ctx.fillStyle = Math.random() < 0.08 && colors.accents.length
        ? colors.accents[(Math.random() * colors.accents.length) | 0]
        : colors.base;
      ctx.fillText(glyph, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
        glyphKind[i] = rollKind();
      }
      drops[i]++;
    }
  }

  function start() {
    stop();
    if (document.documentElement.classList.contains('reduce-motion')) return;
    interval = setInterval(draw, speed);
  }

  function stop() {
    if (interval) { clearInterval(interval); interval = null; }
  }

  function boot() {
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    start();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('hg-motion-change', function () { start(); });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    boot();
  }
})();
