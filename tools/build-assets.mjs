import fs from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

await fs.mkdir(new URL('../assets/', import.meta.url), { recursive: true });
const original = new URL('../snapshots/assets/editor-workspace.png', import.meta.url);
const destination = new URL('../assets/editor-workspace.webp', import.meta.url);
await sharp(await fs.readFile(original)).webp({ lossless: true, effort: 6 }).toFile(fileURLToPath(destination));
const bytes = await fs.readFile(destination);
const before = await sharp(await fs.readFile(original)).ensureAlpha().raw().toBuffer();
const after = await sharp(bytes).ensureAlpha().raw().toBuffer();
if (!before.equals(after)) throw new Error('Lossless editor preview changed decoded pixels');
console.log(`Editor preview: ${(await fs.stat(original)).size} → ${bytes.length} bytes; decoded RGBA pixels unchanged.`);
