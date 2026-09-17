import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standard 512x512 SVG (purpose: any / iOS / desktop)
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>
  <!-- Background with slight rounded corners for standalone previews -->
  <rect width="512" height="512" rx="112" fill="url(#oceanGrad)"/>
  
  <!-- Outer Compass Ring -->
  <circle cx="256" cy="256" r="216" fill="none" stroke="url(#ringGrad)" stroke-width="12" stroke-dasharray="16 14" opacity="0.85"/>
  <circle cx="256" cy="256" r="192" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.4"/>

  <!-- Compass Cardinal ticks -->
  <line x1="256" y1="48" x2="256" y2="70" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
  <line x1="256" y1="442" x2="256" y2="464" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
  <line x1="48" y1="256" x2="70" y2="256" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
  <line x1="442" y1="256" x2="464" y2="256" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />

  <!-- Anchor Emblem -->
  <g fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">
    <!-- Anchor Ring -->
    <circle cx="256" cy="136" r="36" />
    <!-- Stock (Horizontal Bar) -->
    <path d="M154 186h204" />
    <circle cx="154" cy="186" r="11" fill="#ffffff" stroke="none" />
    <circle cx="358" cy="186" r="11" fill="#ffffff" stroke="none" />
    <!-- Shank (Vertical Shaft) -->
    <path d="M256 172v218" />
    <!-- Crown & Flukes (Curved Base) -->
    <path d="M136 308c16 68 68 116 120 116s104-48 120-116" />
    <!-- Palms / Arrow tips -->
    <path d="M116 324l20-16 26 16" />
    <path d="M350 324l26-16 20 16" />
  </g>
</svg>`;

// Maskable SVG: full bleed background (#0f172a / #1e3a8a) with the central graphic scaled to fit the 80% safe zone (center 400px circle)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="oceanGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="ringGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
  </defs>
  <!-- Full bleed square without rounded corners for Android maskable engine -->
  <rect width="512" height="512" fill="url(#oceanGradMask)"/>
  
  <!-- Scaled group into safe zone (center 0.76 scale around (256, 256)) -->
  <g transform="translate(256 256) scale(0.76) translate(-256 -256)">
    <!-- Outer Compass Ring -->
    <circle cx="256" cy="256" r="216" fill="none" stroke="url(#ringGradMask)" stroke-width="12" stroke-dasharray="16 14" opacity="0.9"/>
    <circle cx="256" cy="256" r="192" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.5"/>

    <!-- Compass Cardinal ticks -->
    <line x1="256" y1="48" x2="256" y2="70" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
    <line x1="256" y1="442" x2="256" y2="464" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
    <line x1="48" y1="256" x2="70" y2="256" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
    <line x1="442" y1="256" x2="464" y2="256" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />

    <!-- Anchor Emblem -->
    <g fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="256" cy="136" r="36" />
      <path d="M154 186h204" />
      <circle cx="154" cy="186" r="11" fill="#ffffff" stroke="none" />
      <circle cx="358" cy="186" r="11" fill="#ffffff" stroke="none" />
      <path d="M256 172v218" />
      <path d="M136 308c16 68 68 116 120 116s104-48 120-116" />
      <path d="M116 324l20-16 26 16" />
      <path d="M350 324l26-16 20 16" />
    </g>
  </g>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save base SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), standardSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg, 'utf8');

  console.log('Generating PNG icons...');

  // 1. icon-512.png
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 2. icon-192.png
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'icon-192.png'));

  // 3. icon-maskable-512.png
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  // 4. icon-maskable-192.png
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'icon-maskable-192.png'));

  // 5. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 6. Favicons
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon-64.png'));

  await sharp(Buffer.from(standardSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));

  console.log('All icons generated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
