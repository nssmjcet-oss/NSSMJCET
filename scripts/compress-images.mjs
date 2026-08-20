/**
 * compress-images.mjs
 * Compresses all images in public/uploads (recursively) in-place using sharp.
 * - JPEGs → quality 75, progressive
 * - PNGs  → quality 80, effort 9
 * Skips files already under 50 KB.
 */

import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';

const ROOT = 'public/uploads';
const JPEG_QUALITY = 75;
const PNG_QUALITY = 80;
const SKIP_BELOW_BYTES = 50_000; // skip files already < 50 KB

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? getFiles(full) : full;
    })
  );
  return files.flat();
}

async function compressImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const { size: before } = await stat(filePath);
  if (before < SKIP_BELOW_BYTES) {
    console.log(`  SKIP  ${filePath} (${(before / 1024).toFixed(1)} KB — already small)`);
    return;
  }

  const tmpPath = filePath + '.tmp';

  try {
    let pipeline = sharp(filePath);

    if (ext === '.png') {
      pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9, effort: 10 });
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
    }

    await pipeline.toFile(tmpPath);

    const { size: after } = await stat(tmpPath);
    const saved = ((before - after) / before * 100).toFixed(1);

    // Only replace if we actually made it smaller
    if (after < before) {
      await rename(tmpPath, filePath);
      console.log(`  OK    ${basename(filePath)}: ${(before/1024).toFixed(1)} KB → ${(after/1024).toFixed(1)} KB (${saved}% saved)`);
    } else {
      await unlink(tmpPath);
      console.log(`  SKIP  ${basename(filePath)}: compression didn't help, keeping original`);
    }
  } catch (err) {
    // Clean up tmp if something went wrong
    try { await unlink(tmpPath); } catch {}
    console.error(`  ERROR ${filePath}:`, err.message);
  }
}

(async () => {
  console.log(`\nCompressing images in ${ROOT}...\n`);
  const files = await getFiles(ROOT);
  for (const f of files) {
    await compressImage(f);
  }
  console.log('\nDone!');
})();
