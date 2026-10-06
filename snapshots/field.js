const FIELD_VERT = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FIELD_FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uSize;
uniform float uDpr;
uniform float uTime;
uniform vec3 uTint;
uniform int uKind;

const float CELL = 6.0;

vec2 cmul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 cdiv(vec2 a, vec2 b) { float d = dot(b, b); return vec2(dot(a, b), a.y * b.x - a.x * b.y) / max(d, 1e-9); }

float julia(vec2 uv, float time) {
  float angle = 0.62 + time * 0.05;
  vec2 c = 0.7885 * vec2(cos(angle), sin(angle));
  vec2 z = uv * 3.1;
  int it = 48;
  for (int i = 0; i < 48; i++) {
    z = cmul(z, z) + c;
    if (dot(z, z) > 16.0) { it = i; break; }
  }
  if (it >= 48) return 1.0;
  float escape = float(it) - log2(log2(dot(z, z))) + 4.0;
  return pow(clamp(escape / 48.0, 0.0, 1.0), 1.5);
}

float newton(vec2 uv, float time) {
  float rot = time * 0.03;
  float cs = cos(rot), sn = sin(rot);
  vec2 p = uv * 2.6;
  vec2 z = vec2(p.x * cs - p.y * sn, p.x * sn + p.y * cs);
  vec2 r0 = vec2(1.0, 0.0);
  vec2 r1 = vec2(-0.5, 0.8660254);
  vec2 r2 = vec2(-0.5, -0.8660254);
  float basin = 0.0;
  float steps = 26.0;
  for (int i = 0; i < 26; i++) {
    vec2 z2 = cmul(z, z);
    vec2 z3 = cmul(z2, z);
    z = z - cdiv(z3 - vec2(1.0, 0.0), 3.0 * z2);
    if (distance(z, r0) < 0.001) { basin = 0.0; steps = float(i); break; }
    if (distance(z, r1) < 0.001) { basin = 1.0; steps = float(i); break; }
    if (distance(z, r2) < 0.001) { basin = 2.0; steps = float(i); break; }
  }
  float edge = clamp(steps / 13.0, 0.0, 1.0);
  return clamp((0.30 + 0.70 * edge) * (0.70 + 0.15 * basin), 0.0, 1.0);
}

void main() {
  vec2 position = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 cellIndex = floor(position / CELL);
  vec2 cellCenter = (cellIndex + 0.5) * CELL;
  vec2 uv = cellCenter / uSize - 0.5;
  float v = uKind == 0 ? julia(uv, uTime) : newton(uv, uTime);
  if (v < 0.14) discard;
  float radius = CELL * 0.5 * (0.28 + 0.62 * v);
  float d = distance(position, cellCenter);
  float coverage = 1.0 - smoothstep(radius - 0.7, radius + 0.5, d);
  if (coverage <= 0.0) discard;
  float a = coverage * (0.35 + 0.6 * v);
  vec3 rgb = uTint * (0.55 + 0.45 * v);
  gl_FragColor = vec4(rgb, a);
}
`;

function fieldTint(host, tint) {
  host.style.color = tint;
  const color = getComputedStyle(host).color;
  const match = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(color);
  if (match) return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [0.3, 0.45, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function mountField(host, options) {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
  });
  host.appendChild(canvas);
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    depth: false,
    stencil: false,
  }) || canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    depth: false,
    stencil: false,
  });
  if (!gl) {
    window.__fieldStatus = "no-gl";
    return;
  }
  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      window.__fieldStatus = gl.getShaderInfoLog(shader);
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, FIELD_VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FIELD_FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "position");
  gl.bindAttribLocation(prog, 1, "uv");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    window.__fieldStatus = gl.getProgramInfoLog(prog);
    return;
  }
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 0, 0, 3, -1, 2, 0, -1, 3, 0, 2]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
  const uSize = gl.getUniformLocation(prog, "uSize");
  const uDpr = gl.getUniformLocation(prog, "uDpr");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uTint = gl.getUniformLocation(prog, "uTint");
  const uKind = gl.getUniformLocation(prog, "uKind");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  gl.uniform1f(uDpr, dpr);
  gl.uniform1f(uTime, 8);
  gl.uniform1i(uKind, options.kind === "julia" ? 0 : 1);
  const tint = fieldTint(host, options.tint || "var(--primary)");
  gl.uniform3fv(uTint, tint);

  let time = 8;
  const paint = (w, h) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.uniform2f(uSize, w, h);
    gl.uniform1f(uDpr, dpr);
    gl.uniform1f(uTime, time);
    gl.uniform1i(uKind, options.kind === "julia" ? 0 : 1);
    gl.uniform3fv(uTint, tint);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    const bw = Math.max(1, Math.floor(w * dpr));
    const bh = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    paint(w, h);
  };
  resize();
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
  const motion = options.animated && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (motion) {
    const started = performance.now();
    let last = 0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (now - last < 1000 / 24) return;
      last = now;
      time = 8 + (now - started) / 1000;
      paint(host.clientWidth || 1, host.clientHeight || 1);
    };
    requestAnimationFrame(frame);
  }
  window.__fieldStatus = "ok";
}

window.CrommaField = { mount: mountField };
