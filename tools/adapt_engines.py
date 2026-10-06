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
    cloud = replace_once(cloud, '    canvas.remove();', '    gl.deleteBuffer(buf);\n    gl.deleteProgram(prog);\n    gl.deleteShader(vs);\n    gl.deleteShader(fs);\n    gl.getExtension("WEBGL_lose_context")?.loseContext();\n    canvas.remove();')
    header = '// Generated from snapshots/clouds.js by tools/adapt_engines.py.\n// Original shaders are unchanged; static sizing and resource disposal are adapted.\n'
    (destination / "clouds.js").write_text(header + cloud, encoding="utf-8", newline="\n")

    field = (root / "snapshots/field.js").read_text(encoding="utf-8")
    field = replace_once(field, '  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);', '  const observer = "ResizeObserver" in window ? new ResizeObserver(resize) : null;\n  observer?.observe(host);\n  let raf = 0;')
    field = field.replace('requestAnimationFrame(frame);', 'raf = requestAnimationFrame(frame);')
    field = replace_once(field, '  window.__fieldStatus = "ok";', '''  window.__fieldStatus = "ok";
  let disposed = false;
  return { canvas, destroy() {
    if (disposed) return;
    disposed = true;
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
