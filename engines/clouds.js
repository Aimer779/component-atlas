// Generated from snapshots/clouds.js by tools/adapt_engines.py.
// Original shaders are unchanged; static sizing and resource disposal are adapted.
const CLOUD_GN = 0.6;
const CLOUD_MR = 0.98 + 0.05 + 0.34 * 1.08 * CLOUD_GN;
const CLOUD_LR = 0.618;
const CLOUD_DR = [
  [0, 0.02, 0.6],
  [-0.52, 0.12, 0.44],
  [0.54, 0.08, 0.46],
  [-0.26, -0.36, 0.4],
  [0.3, -0.4, 0.38],
  [-0.98, 0.3, 0.34],
  [0.98, 0.26, 0.34],
];
const CLOUD_COUNT = 8;
const CLOUD_DPR = 0.75;
const CLOUD_PAL = {
  a: [0.8, 0.88, 0.96],
  b: [0.1, 0.075, 0.05],
  c: [0.6, 0.5, 0.4],
  d: [0.5, 0.55, 0.65],
};

const CLOUD_VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const CLOUD_FRAG = `precision highp float;

uniform vec2 uResolution;
uniform float uDpr;
uniform float uTime;
uniform vec4 uBlobs[8];
uniform int uCount;
uniform float uAlpha;
uniform float uShadow;
uniform vec4 uBox;
uniform float uSweep;
uniform float uSweepAlpha;
uniform float uScale;
uniform vec3 uPalA;
uniform vec3 uPalB;
uniform vec3 uPalC;
uniform vec3 uPalD;

#define PI 3.14159265359

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(13.0, 7.0);
    a *= 0.5;
  }
  return v;
}
float field(vec2 p) {
  float f = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= uCount) break;
    vec4 b = uBlobs[i];
    if (b.z <= 0.5) continue;
    vec2 d = p - b.xy;
    f += b.z * b.z / (dot(d, d) + 1.0);
  }
  return f;
}
float ridged(vec2 q) {
  float n = 0.65 * noise(q * 3.1) + 0.35 * noise(q * 6.3 + vec2(2.0, 5.0));
  return abs(2.0 * n - 1.0);
}
float layer(vec2 p, vec2 q, float lo, float hi) {
  float body = smoothstep(0.42, 1.5, field(p));
  float n = fbm(q);
  float base = body * smoothstep(lo, hi, n + body * 0.32);
  float edgeZone = (1.0 - base) * smoothstep(0.0, 0.35, base);
  return clamp(base - ridged(q + 3.7) * 0.32 * edgeZone, 0.0, 1.0);
}
float extinct(float d, float sigma) {
  return 1.0 - exp(-d * sigma);
}
void over(inout vec3 col, inout float a, vec3 c, float ca) {
  float na = ca + a * (1.0 - ca);
  col = (c * ca + col * a * (1.0 - ca)) / max(na, 1e-4);
  a = na;
}
vec3 pal(float t) {
  return uPalA + uPalB * cos(2.0 * PI * (uPalC * t + uPalD));
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr;
  float t = uTime;
  float unit = 260.0 / uScale;
  vec2 q0 = p / unit;
  vec2 flow = vec2(fbm(q0 * 0.55 + vec2(t * 0.035, 0.0)), fbm(q0 * 0.55 + vec2(7.3, 2.9) - vec2(0.0, t * 0.03))) - 0.5;
  vec2 q = q0 + flow * 0.9 + vec2(t * 0.045, t * 0.01);
  vec2 L = normalize(vec2(-0.6, -1.0));
  vec2 Lp = L * (30.0 / uScale);
  vec2 Lq = Lp / unit;
  vec2 qb = q * 0.8 + vec2(3.1, 1.7) - vec2(t * 0.012, 0.0);
  vec2 qm = q * 1.25 + vec2(11.4, 5.2) + vec2(t * 0.02, 0.0);
  vec2 qf = q * 1.9 + vec2(21.7, 9.9) + vec2(t * 0.035, -t * 0.01);
  float db = layer(p, qb, 0.28, 0.70);
  float dm = layer(p, qm, 0.36, 0.78);
  float df = layer(p, qf, 0.46, 0.84);
  float dbL = layer(p + Lp, qb + Lq * 0.8, 0.28, 0.70);
  float dmL = layer(p + Lp, qm + Lq * 1.25, 0.36, 0.78);
  float dfL = layer(p + Lp, qf + Lq * 1.9, 0.46, 0.84);
  float occM = smoothstep(0.05, 0.7, layer(p + vec2(-10.0, -16.0) / uScale, qf - vec2(10.0, 16.0) * (1.9 / unit), 0.46, 0.84));
  float occB = smoothstep(0.05, 0.7, layer(p + vec2(-14.0, -22.0) / uScale, qm - vec2(14.0, 22.0) * (1.25 / unit), 0.36, 0.78));
  float vert = clamp((p.y - uBox.y) / max(uBox.w, 1.0), 0.0, 1.0);
  float belly = smoothstep(0.25, 1.0, vert);
  vec3 sun = vec3(0.995, 0.99, 0.975);
  vec3 cold = vec3(0.815, 0.845, 0.885);
  float sb = smoothstep(-0.06, 0.5, dbL - db);
  float sm = smoothstep(-0.06, 0.5, dmL - dm);
  float sf = smoothstep(-0.06, 0.5, dfL - df);
  float pb = mix(0.9, 1.0, extinct(db, 2.6));
  float pm = mix(0.9, 1.0, extinct(dm, 2.6));
  float pf = mix(0.9, 1.0, extinct(df, 2.6));
  float rimF = smoothstep(0.02, 0.3, df - dfL) * (1.0 - extinct(df, 3.0)) * 0.06;
  float rimM = smoothstep(0.02, 0.3, dm - dmL) * (1.0 - extinct(dm, 3.0)) * 0.05;
  vec3 cb = mix(sun, cold, clamp(sb * 0.5 + belly * 0.28 + occB * 0.16, 0.0, 0.7)) * pb * 0.965;
  vec3 cm = mix(sun, cold, clamp(sm * 0.5 + belly * 0.2 * smoothstep(0.2, 1.0, dm) + occM * 0.14, 0.0, 0.65)) * pm * 0.985 + rimM;
  vec3 cf = mix(sun, cold, clamp(sf * 0.45 + belly * 0.14 * smoothstep(0.2, 1.0, df), 0.0, 0.6)) * pf + rimF;
  float ab = extinct(db, 3.2);
  float am = extinct(dm, 3.0);
  float af = extinct(df, 2.8);
  float f = field(p);
  float near = smoothstep(0.45, 1.25, f) * (0.10 + 0.16 * fbm(q * 1.3 + vec2(1.5)));
  float far = smoothstep(0.14, 0.9, f) * (0.04 + 0.12 * fbm(q * 0.6 + vec2(t * 0.02)));
  float drop = smoothstep(0.35, 1.3, field(p - vec2(0.0, 30.0 / uScale))) * uShadow;
  vec3 col = vec3(0.0);
  float a = 0.0;
  over(col, a, vec3(0.0), drop);
  over(col, a, vec3(0.955, 0.965, 0.98), far);
  over(col, a, vec3(0.965, 0.972, 0.985), near);
  over(col, a, cb, ab);
  over(col, a, cm, am);
  over(col, a, cf, af);
  if (uSweep >= 0.0) {
    float margin = 140.0;
    float axis = (p.x - (uBox.x - margin)) / max(uBox.z + margin * 2.0, 1.0);
    float cross = (p.y - (uBox.y - 60.0)) / max(uBox.w + 120.0, 1.0);
    float tw = t * 0.8;
    float waveX = (sin(cross * 6.0 + tw * 1.3) * 0.020 + sin(cross * 13.0 - tw * 0.9 + 1.4) * 0.012 + sin(cross * 21.0 + tw * 1.7 + 2.6) * 0.006) * 0.55;
    float d = (axis - uSweep) - waveX;
    float band = exp(-d * d * 18.0);
    float dh = -2.0 * d * 18.0 * band;
    vec3 N = normalize(vec3(-dh * 0.18, (dfL - df + dmL - dm) * 0.9, 1.0));
    float trail = pow(clamp(0.5 - d * 1.3, 0.0, 1.0), 2.5) * 0.30;
    float intensity = max(band * 0.95, trail);
    float hue = N.x * 0.45 + N.y * 0.30 + axis * 1.4 + cross * 0.35 + (df - dm) * 1.2 + t * 0.04;
    vec3 rc = pal(hue);
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 Lk = normalize(vec3(0.35, 0.55, 0.9));
    vec3 H = normalize(Lk + V);
    float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 80.0);
    float entry = mix(0.2, 1.0, 4.0 * uSweep * (1.0 - uSweep));
    float k = intensity * entry * uSweepAlpha;
    float thick = smoothstep(0.1, 0.9, max(max(db, dm), df));
    col = mix(col, rc * (0.9 + 0.1 * thick), k * 0.6);
    col += (rc * fresnel * 0.22 + vec3(spec) * 0.22) * band * entry * uSweepAlpha * (0.4 + 0.6 * thick);
    a = max(a, k * 0.2 * smoothstep(0.1, 0.6, f));
  }
  gl_FragColor = vec4(col, a * uAlpha);
}
`;

function cloudEase([x1, y1, x2, y2]) {
  const a = (t, p) => 1 - 3 * p + 3 * t;
  const b = (t, p) => 3 * p - 6 * t;
  const c = (t) => 3 * t;
  const bez = (t, p, q) => ((a(p, q) * t + b(p, q)) * t + c(p)) * t;
  const der = (t, p, q) => 3 * a(p, q) * t * t + 2 * b(p, q) * t + c(p);
  const solve = (x) => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const d = der(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      t -= (bez(t, x1, x2) - x) / d;
    }
    if (t < 0 || t > 1 || Math.abs(bez(t, x1, x2) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 24; i += 1) {
        t = (lo + hi) / 2;
        if (bez(t, x1, x2) < x) lo = t;
        else hi = t;
      }
    }
    return t;
  };
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return bez(solve(x), y1, y2);
  };
}

function padBlobs(list) {
  const out = list.map((b) => ({ x: b.x, y: b.y, r: b.r }));
  const seed = out[0] ?? { x: 0, y: 0, r: 0 };
  while (out.length < CLOUD_COUNT) out.push({ x: seed.x, y: seed.y, r: 0 });
  return out.slice(0, CLOUD_COUNT);
}

function blobFrame(box, compact) {
  const scaled = {
    width: box.width * (compact ? 2.2 : 1.3),
    height: box.height,
  };
  const hw = (scaled.width * CLOUD_LR) / 2 / CLOUD_MR;
  const hh = Math.min(hw * CLOUD_GN, scaled.height * 0.34);
  const cx = box.width / 2;
  const cy = box.height * 0.5;
  return { hw, hh, cx, cy, scaled };
}

function footerFrame(box) {
  const hw = (box.width * CLOUD_LR) / 2 / CLOUD_MR;
  const hh = Math.min(hw * CLOUD_GN, box.height * 0.34);
  return {
    hw,
    hh,
    cx: box.width / 2,
    cy: box.height * 0.62,
    scaled: box,
  };
}

function blobsIdle(box, frame) {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    return {
      x: box.width / 2 + Math.cos(a) * (box.width / 2 + 120),
      y: box.height / 2 + Math.sin(a) * (box.height / 2 + 120),
      r: frame.hh * (0.22 + 0.08 * ((i * 7) % 3)),
    };
  });
}

function blobsLive(t, frame) {
  const { cx, cy, hw, hh } = frame;
  const list = CLOUD_DR.map(([a, d, h], u) => {
    const far = u >= 5;
    const m = far ? 0.05 : 0.22;
    const p = far ? 0.06 : 0.26;
    const v = far ? 0.08 : 0.26;
    return {
      x: cx + (a + m * Math.sin(t * 2.1 + u * 1.3)) * hw,
      y: cy + (d + p * Math.cos(t * 1.7 + u * 0.9)) * hh,
      r: h * (1 + v * Math.sin(t * 1.1 + u * 1.7)) * hh,
    };
  });
  const extra = Math.max(0, Math.sin(t * 1.3 + 0.4));
  list.push({
    x: cx + 0.35 * Math.sin(t * 0.9) * hw,
    y: cy - 0.55 * hh,
    r: extra * 0.38 * hh,
  });
  return list;
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    window.__cloudStatus = gl.getShaderInfoLog(sh);
    return null;
  }
  return sh;
}

function createCloud(root, options) {
  const reduced = options.static === true || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
  });
  root.appendChild(canvas);
  const gl =
    canvas.getContext("webgl2", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "default",
    }) ||
    canvas.getContext("webgl", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "default",
    });
  if (!gl) return { resize() {}, ready() {}, pulse() {}, frame: blobFrame };

  const vs = compile(gl, gl.VERTEX_SHADER, CLOUD_VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, CLOUD_FRAG);
  if (!vs || !fs) {
    return { resize() {}, ready() {}, pulse() {}, frame: blobFrame };
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "position");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    window.__cloudStatus = gl.getProgramInfoLog(prog);
    return { resize() {}, ready() {}, pulse() {}, frame: blobFrame };
  }
  window.__cloudStatus = "ok";
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uni = {
    uResolution: gl.getUniformLocation(prog, "uResolution"),
    uDpr: gl.getUniformLocation(prog, "uDpr"),
    uTime: gl.getUniformLocation(prog, "uTime"),
    uBlobs: gl.getUniformLocation(prog, "uBlobs[0]"),
    uCount: gl.getUniformLocation(prog, "uCount"),
    uAlpha: gl.getUniformLocation(prog, "uAlpha"),
    uShadow: gl.getUniformLocation(prog, "uShadow"),
    uBox: gl.getUniformLocation(prog, "uBox"),
    uSweep: gl.getUniformLocation(prog, "uSweep"),
    uSweepAlpha: gl.getUniformLocation(prog, "uSweepAlpha"),
    uScale: gl.getUniformLocation(prog, "uScale"),
    uPalA: gl.getUniformLocation(prog, "uPalA"),
    uPalB: gl.getUniformLocation(prog, "uPalB"),
    uPalC: gl.getUniformLocation(prog, "uPalC"),
    uPalD: gl.getUniformLocation(prog, "uPalD"),
  };
  gl.uniform1i(uni.uCount, CLOUD_COUNT);
  gl.uniform1f(uni.uShadow, options.shadow ?? 0.06);
  gl.uniform1f(uni.uScale, options.scale ?? 1);
  gl.uniform3fv(uni.uPalA, CLOUD_PAL.a);
  gl.uniform3fv(uni.uPalB, CLOUD_PAL.b);
  gl.uniform3fv(uni.uPalC, CLOUD_PAL.c);
  gl.uniform3fv(uni.uPalD, CLOUD_PAL.d);
  gl.uniform1f(uni.uSweep, -1);
  gl.uniform1f(uni.uSweepAlpha, 0);

  const frameFor = (next, compact) =>
    options.frameMode === "footer" ? footerFrame(next) : blobFrame(next, compact);
  let box = { width: 1, height: 1 };
  let frame = frameFor(box, false);
  let from = padBlobs(blobsIdle(box, frame));
  let to = padBlobs(from);
  let now = padBlobs(from);
  let morphStart = performance.now();
  let morphDur = 2600;
  let morphEase = cloudEase([0.16, 1, 0.3, 1]);
  let alphaFrom = options.opacity === 1 ? 1 : 0;
  let alphaTo = alphaFrom;
  let alphaStart = performance.now();
  let fadeDur = 1000;
  let drift = 0;
  let driftTarget = options.drift && !reduced ? 1 : 0;
  let t0 = performance.now();
  let last = t0;
  let sweepAt = -1;
  let pulse = 0;
  let raf = 0;
  let active = options.activity?.active !== false;
  let pausedAt = performance.now();
  let disposed = false;
  const packed = new Float32Array(CLOUD_COUNT * 4);
  let placed = false;
  let cycleTimer = 0;
  let sweepTimer = 0;

  function placeLive() {
    const live = padBlobs(blobsLive(pulse, frame));
    from = live.map((b) => ({ ...b }));
    to = live.map((b) => ({ ...b }));
    now = live.map((b) => ({ ...b }));
    morphStart = performance.now();
    morphDur = 1;
  }

  function resize(next, compact) {
    box = next;
    frame = frameFor(next, compact);
    if (next.width > 1 && next.height > 1 && (reduced || options.frameMode === "footer" && !placed)) {
      placed = true;
      placeLive();
    }
    canvas.width = Math.max(1, Math.floor(box.width * CLOUD_DPR));
    canvas.height = Math.max(1, Math.floor(box.height * CLOUD_DPR));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uni.uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(uni.uDpr, CLOUD_DPR);
    if (reduced) draw(performance.now());
  }

  function morph(next, duration, ease) {
    from = now.map((b) => ({ ...b }));
    to = padBlobs(next);
    morphStart = performance.now();
    morphDur = duration;
    morphEase = cloudEase(ease);
  }

  function ready() {
    if (reduced) { placeLive(); draw(performance.now()); return; }
    fadeTo(1, 1000);
    driftTarget = reduced ? 0 : 1;
    pulse = 0;
    morph(blobsLive(0, frame), 2600, [0.16, 1, 0.3, 1]);
  }

  function fadeTo(next, ms) {
    const nowMs = performance.now();
    const k = Math.min(1, (nowMs - alphaStart) / Math.max(1, fadeDur));
    alphaFrom = alphaFrom + (alphaTo - alphaFrom) * k;
    alphaTo = next;
    alphaStart = nowMs;
    fadeDur = ms;
  }

  function pulseCloud() {
    if (reduced) return;
    pulse += 1;
    sweepAt = performance.now() + 180;
    morph(blobsLive(pulse, frame), 1800, [0.32, 0.72, 0, 1]);
  }

  function draw(nowMs) {
    raf = 0;
    if (!active || disposed) return;
    const sec = reduced ? 0 : (nowMs - t0) / 1000;
    const dt = Math.min(0.1, (nowMs - last) / 1000);
    last = nowMs;
    drift += (driftTarget - drift) * (1 - Math.exp(-dt / 0.25));
    const k = morphEase(Math.min(1, (nowMs - morphStart) / Math.max(1, morphDur)));
    const ak = Math.min(1, (nowMs - alphaStart) / Math.max(1, fadeDur));

    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const a = from[i];
      const b = to[i];
      const x = a.x + (b.x - a.x) * k;
      const y = a.y + (b.y - a.y) * k;
      const r = a.r + (b.r - a.r) * k;
      now[i] = { x, y, r };
      const dx = Math.sin(sec * 0.55 + i * 1.7) * 7 * drift;
      const dy = Math.cos(sec * 0.42 + i * 1.1) * 5 * drift;
      packed[i * 4] = x + dx;
      packed[i * 4 + 1] = y + dy;
      packed[i * 4 + 2] = r;
      packed[i * 4 + 3] = 0;
      if (r > 0.5) {
        minY = Math.min(minY, y + dy - r);
        maxY = Math.max(maxY, y + dy + r);
        minX = Math.min(minX, x + dx - r);
        maxX = Math.max(maxX, x + dx + r);
      }
    }
    gl.uniform4fv(uni.uBlobs, packed);
    if (Number.isFinite(minY)) {
      gl.uniform4f(uni.uBox, minX, minY, Math.max(1, maxX - minX), Math.max(1, maxY - minY));
    } else {
      gl.uniform4f(uni.uBox, 0, 0, 1, 1);
    }
    const sr = 620;
    const xm = 260;
    if (sweepAt >= 0 && nowMs < sweepAt) {
      gl.uniform1f(uni.uSweep, -1);
      gl.uniform1f(uni.uSweepAlpha, 0);
    } else if (sweepAt >= 0) {
      const ct = nowMs - sweepAt;
      if (ct > sr + xm) {
        sweepAt = -1;
        gl.uniform1f(uni.uSweep, -1);
        gl.uniform1f(uni.uSweepAlpha, 0);
      } else {
        const nt = reduced ? 0.5 : 1 - Math.pow(1 - Math.min(1, ct / sr), 4);
        gl.uniform1f(uni.uSweep, nt);
        gl.uniform1f(uni.uSweepAlpha, ct <= sr ? 1 : 1 - (ct - sr) / xm);
      }
    }
    gl.uniform1f(uni.uTime, sec);
    gl.uniform1f(uni.uAlpha, alphaFrom + (alphaTo - alphaFrom) * ak);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!document.hidden) gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduced) raf = requestAnimationFrame(draw);
  }

  if (active && !reduced) raf = requestAnimationFrame(draw);

  function startCycle() {
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

  function destroy() {
    if (disposed) return;
    disposed = true;
    unsubscribe?.();
    cancelAnimationFrame(raf);
    window.clearInterval(cycleTimer);
    window.clearTimeout(sweepTimer);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  }

  return { resize, ready, pulse: pulseCloud, fadeTo, destroy, canvas, frame: blobFrame };
}

window.HeroCloud = {
  frame: blobFrame,
  create: createCloud,
  mount(root) {
    const host = root.querySelector("#cloud-root") || root;
    this._layer = createCloud(host, { shadow: 0.06 });
    return this._layer;
  },
};
