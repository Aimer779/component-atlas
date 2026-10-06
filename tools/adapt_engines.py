"""Keep original shader evidence intact; generate local lifecycle adapters."""
from pathlib import Path


def replace_once(source, before, after):
    if source.count(before) != 1:
        raise ValueError(f"Source boundary changed: {before[:80]}")
    return source.replace(before, after, 1)


def build_engines(root: Path):
    destination = root / "engines"
    destination.mkdir(exist_ok=True)
    cloud = (root / "snapshots/clouds.js").read_text(encoding="utf-8")
    cloud = replace_once(cloud, '  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;', '  const reduced = options.static === true || window.matchMedia("(prefers-reduced-motion: reduce)").matches;')
    cloud = replace_once(cloud, 'if (options.frameMode === "footer" && next.width > 1 && next.height > 1 && !placed)', 'if (next.width > 1 && next.height > 1 && (reduced || options.frameMode === "footer" && !placed))')
    cloud = replace_once(cloud, '    gl.uniform1f(uni.uDpr, CLOUD_DPR);', '    gl.uniform1f(uni.uDpr, CLOUD_DPR);\n    if (reduced) draw(performance.now());')
    cloud = replace_once(cloud, '  function ready() {', '  function ready() {\n    if (reduced) { placeLive(); draw(performance.now()); return; }')
    cloud = replace_once(cloud, '  function pulseCloud() {', '  function pulseCloud() {\n    if (reduced) return;')
    cloud = replace_once(cloud, '    const sec = (nowMs - t0) / 1000;', '    const sec = reduced ? 0 : (nowMs - t0) / 1000;')
    cloud = replace_once(cloud, '    raf = requestAnimationFrame(draw);', '    if (!reduced) raf = requestAnimationFrame(draw);')
    cloud = replace_once(cloud, '  let placed = false;', '''  let active = options.activity?.active !== false;
  let pausedAt = performance.now();
  let disposed = false;
  let placed = false;''')
    cloud = replace_once(cloud, '  function draw(nowMs) {', '''  function draw(nowMs) {
    raf = 0;
    if (!active || disposed) return;''')
    cloud = replace_once(cloud, '  raf = requestAnimationFrame(draw);', '  if (active && !reduced) raf = requestAnimationFrame(draw);')
    cloud = replace_once(cloud, '    const packed = new Float32Array(CLOUD_COUNT * 4);', '')
    cloud = replace_once(cloud, '  let placed = false;', '  const packed = new Float32Array(CLOUD_COUNT * 4);\n  let placed = false;')
    start = cloud.index('  if (options.cycleMs && !reduced) {')
    end = cloud.index('  function destroy() {', start)
    cloud = cloud[:start] + '''  function startCycle() {
    if (!options.cycleMs || reduced || !active || disposed) return;
    cycleTimer = window.setInterval(() => {
      pulse += 1;
      morph(blobsLive(pulse, frame), 2600, [0.32, 0.72, 0, 1]);
      sweepAt = performance.now() + 820;
    }, options.cycleMs);
  }
  function setActive(next) {
    if (disposed || active === next) return;
    active = next;
    if (!active) {
      pausedAt = performance.now();
      cancelAnimationFrame(raf); raf = 0;
      window.clearInterval(cycleTimer); cycleTimer = 0;
      return;
    }
    const elapsed = performance.now() - pausedAt;
    t0 += elapsed; morphStart += elapsed; alphaStart += elapsed;
    if (sweepAt >= 0) sweepAt += elapsed;
    last = performance.now();
    if (reduced) draw(last);
    else if (!raf) raf = requestAnimationFrame(draw);
    startCycle();
  }
  startCycle();
  const unsubscribe = options.activity?.subscribe(setActive);

''' + cloud[end:]
    cloud = replace_once(cloud, '  function destroy() {', '''  function destroy() {
    if (disposed) return;
    disposed = true;
    unsubscribe?.();''')
    cloud = replace_once(cloud, '    canvas.remove();', '    gl.deleteBuffer(buf);\n    gl.deleteProgram(prog);\n    gl.deleteShader(vs);\n    gl.deleteShader(fs);\n    gl.getExtension("WEBGL_lose_context")?.loseContext();\n    canvas.remove();')
    header = '// Generated from snapshots/clouds.js by tools/adapt_engines.py.\n// Original shaders are unchanged; static sizing and resource disposal are adapted.\n'
    (destination / "clouds.js").write_text(header + cloud, encoding="utf-8", newline="\n")

    field = (root / "snapshots/field.js").read_text(encoding="utf-8")
    field = replace_once(field, '  const resize = () => {', '''  let active = options.activity?.active !== false;
  let disposed = false;
  const resize = () => {
    if (!active || disposed || !host.clientWidth || !host.clientHeight) return;''')
    start = field.index('  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);')
    end = field.index('  window.__fieldStatus = "ok";', start)
    field = field[:start] + '''  const observer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  observer?.observe(host);
  let raf = 0, last = 0;
  const motion = options.animated && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = (now) => {
    raf = 0;
    if (!active || disposed) return;
    if (last && now - last >= 1000 / 24) {
      time += (now - last) / 1000;
      last = now;
      paint(host.clientWidth, host.clientHeight);
    } else if (!last) last = now;
    raf = requestAnimationFrame(frame);
  };
  const setActive = next => {
    if (disposed || active === next) return;
    active = next; last = 0;
    cancelAnimationFrame(raf); raf = 0;
    if (active) {
      resize();
      if (motion) raf = requestAnimationFrame(frame);
    }
  };
  if (motion && active) raf = requestAnimationFrame(frame);
  const unsubscribe = options.activity?.subscribe(setActive);
''' + field[end:]
    field = replace_once(field, '  window.__fieldStatus = "ok";', '''  window.__fieldStatus = "ok";
  return { canvas, destroy() {
    if (disposed) return;
    disposed = true;
    unsubscribe?.();
    cancelAnimationFrame(raf);
    observer?.disconnect();
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  } };''')
    header = '// Generated from snapshots/field.js by tools/adapt_engines.py.\n// Original shaders are unchanged; destroy() releases observer, animation and GL resources.\n'
    (destination / "field.js").write_text(header + field, encoding="utf-8", newline="\n")
