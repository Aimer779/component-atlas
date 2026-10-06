// OKLCH → linear sRGB → encoded sRGB, using the CSS Color 4 conversion matrices.
// The exported hex is an 8-bit sRGB approximation; the original OKLCH stays in the document.
export function colorHex(value) {
  if (/^#[\da-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[\da-f]{3}$/i.test(value)) return '#' + [...value.slice(1)].map(char => char + char).join('').toLowerCase();
  const match = /^oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)$/i.exec(value);
  if (!match) throw new Error(`Unsupported documented color: ${value}`);
  const lightness = Number(match[1]) / (value.includes('%') ? 100 : 1);
  const chroma = Number(match[2]), angle = Number(match[3]) * Math.PI / 180;
  const a = chroma * Math.cos(angle), b = chroma * Math.sin(angle);
  const l = (lightness + .3963377774 * a + .2158037573 * b) ** 3;
  const m = (lightness - .1055613458 * a - .0638541728 * b) ** 3;
  const s = (lightness - .0894841775 * a - 1.291485548 * b) ** 3;
  const channels = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s];
  return '#' + channels.map(channel => {
    const encoded = channel <= .0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - .055;
    return Math.round(Math.max(0, Math.min(1, encoded)) * 255).toString(16).padStart(2, '0');
  }).join('');
}

export function contrastRatio(foreground, background) {
  const luminance = value => {
    const hex = colorHex(value).slice(1);
    const channels = [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
