export const VIEWER_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
export const VIEWER_DURATION = 400;

export function expandedRect(viewWidth, viewHeight) {
  const width = Math.min(viewWidth * .8, viewHeight * .8 * 16 / 9);
  const height = width * 9 / 16;
  return { width, height, left: (viewWidth - width) / 2, top: (viewHeight - height) / 2, borderRadius: 32 };
}

export function springStep(state, target, delta) {
  let left = Math.min(.05, Math.max(0, delta));
  while (left > 0) {
    const step = Math.min(1 / 120, left);
    const acceleration = (-420 * (state.value - target) - 35 * state.velocity) / .7;
    state.velocity += acceleration * step;
    state.value += state.velocity * step;
    left -= step;
  }
  return state.value;
}

export function scrollTarget(viewportHeight, sectionTop) {
  // Hidden iframe panels have zero layout height; keep the previous spring state until they reappear.
  if (!(viewportHeight > 0) || !Number.isFinite(sectionTop)) return null;
  const progress = Math.min(1, Math.max(0, (viewportHeight - sectionTop) / (viewportHeight * .5)));
  return .96 + .04 * progress;
}

// Integrate the source's cubic ramp at its 60fps reference rate, independent of display refresh rate.
export function reelDistance(from, to) {
  const primitive = time => {
    const ramp = Math.min(Math.max(0, time), 3000);
    return .06 * (.175 * ramp + .875 * ramp ** 4 / (4 * 3000 ** 3) + Math.max(0, time - 3000) * 1.05);
  };
  return primitive(to) - primitive(from);
}
