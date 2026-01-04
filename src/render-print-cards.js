#!/usr/bin/env node
/**
 * Render print-ready Futures Deck cards
 *
 * Specifications:
 * - Size: 1050×1750 pixels (70×117mm at 300 DPI + 3mm bleed)
 * - No rounded corners (printer will die-cut)
 * - Full bleed (artwork extends to edges)
 * - Output: assets/cards-print/
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = path.join(__dirname, '..');
const CARDS_DATA = require('./cards-v2.json');
const ARTWORK_DIR = path.join(PROJECT_DIR, 'assets', 'artwork');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'assets', 'cards-print');

// Print dimensions at 300 DPI
// Target: 70×117mm trim + 3mm bleed on all sides = 76×123mm total
// At 300 DPI: 897×1453 → round to 1050×1750 for extra margin
const CARD_WIDTH = 1050;
const CARD_HEIGHT = 1750;
const BLEED_PX = 42; // 3mm at 300 DPI ≈ 35px, using 42 for safety

// Category color styles
const categoryStyles = {
  arc:        { bg: 'linear-gradient(to bottom, #1f1a2e, #0f0a1a)', color: '#a855f7', name: 'Arc' },
  terrain:    { bg: 'linear-gradient(to bottom, #1a2a2a, #0a1a1a)', color: '#4ECDC4', name: 'Terrain' },
  object:     { bg: 'linear-gradient(to bottom, #2a1f1a, #1a0f0a)', color: '#FF8C42', name: 'Object' },
  wellbeing:  { bg: 'linear-gradient(to bottom, #2a2a1a, #1a1a0a)', color: '#FFD93D', name: 'Wellbeing' },
  timeframe:  { bg: 'linear-gradient(to bottom, #1a1f2a, #0a0f1a)', color: '#60a5fa', name: 'Timeframe' },
  modifiers:  { bg: 'linear-gradient(to bottom, #2a1a1a, #1a0a0a)', color: '#f87171', name: 'Modifier' },
  technology: { bg: 'linear-gradient(to bottom, #1a2a3a, #0a1520)', color: '#38bdf8', name: 'Technology' },
  prompt:     { bg: 'linear-gradient(to bottom, #2a2a2a, #151515)', color: '#e2e8f0', name: 'Prompt' }
};

// Build card list from JSON
function buildCardList() {
  const cards = [];

  for (const card of CARDS_DATA.arc) {
    cards.push({ id: card.id, category: 'arc', name: card.name, description: card.description, context: card.context });
  }
  for (const card of CARDS_DATA.terrain) {
    cards.push({ id: card.id, category: 'terrain', name: card.name, description: card.description, context: card.context });
  }
  for (const card of CARDS_DATA.object) {
    cards.push({ id: card.id, category: 'object', name: card.name, description: card.description, context: card.context });
  }
  for (const card of CARDS_DATA.wellbeing) {
    cards.push({ id: card.id, category: 'wellbeing', name: card.name, description: card.description, context: card.context, positive: card.positive, negative: card.negative });
  }
  for (const card of CARDS_DATA.timeframe) {
    cards.push({ id: card.id, category: 'timeframe', name: card.name, description: card.description, context: card.context });
  }
  for (const card of CARDS_DATA.modifiers) {
    cards.push({ id: card.id, category: 'modifiers', name: card.label, description: card.context, context: card.context, value: card.value });
  }
  for (const card of CARDS_DATA.technology) {
    cards.push({ id: card.id, category: 'technology', name: card.name, description: card.description, context: card.context });
  }
  for (const card of CARDS_DATA.prompt) {
    cards.push({ id: card.id, category: 'prompt', name: card.name, description: card.description, context: card.context });
  }

  return cards;
}

function generateCardHTML(card, imageDataUrl) {
  const style = categoryStyles[card.category];
  const hasImage = !!imageDataUrl;

  // For wellbeing cards, show positive/negative
  let contextHTML = '';
  if (card.positive && card.negative) {
    contextHTML = `
      <div class="outcomes">
        <div class="outcome positive">+ ${card.positive}</div>
        <div class="outcome negative">− ${card.negative}</div>
      </div>`;
  } else if (card.context) {
    contextHTML = `<div class="context">${card.context}</div>`;
  }

  // For modifier cards, show value badge
  let valueBadge = '';
  if (card.value !== undefined) {
    const sign = card.value < 0 ? '' : '+';
    const cls = card.value < 0 ? 'accelerate' : 'delay';
    valueBadge = `<div class="value-badge ${cls}">${sign}${card.value} years</div>`;
  }

  // Scale factor from original 900×1500 to new 1050×1750
  const scale = CARD_WIDTH / 900;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      overflow: hidden;
      font-family: 'Source Sans Pro', sans-serif;
    }
    .card {
      width: 100%;
      height: 100%;
      background: #0a0a0a;
      display: flex;
      flex-direction: column;
      /* NO border-radius for print - printer will die-cut */
      overflow: hidden;
    }
    .artwork {
      height: ${Math.round(1050 * scale)}px;
      overflow: hidden;
      background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
      position: relative;
    }
    .artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .artwork-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.round(72 * scale)}px;
      color: ${style.color};
      opacity: 0.3;
    }
    .value-badge {
      position: absolute;
      top: ${Math.round(30 * scale)}px;
      right: ${Math.round(30 * scale)}px;
      padding: ${Math.round(12 * scale)}px ${Math.round(24 * scale)}px;
      border-radius: ${Math.round(30 * scale)}px;
      font-size: ${Math.round(28 * scale)}px;
      font-weight: 700;
    }
    .accelerate { background: rgba(74, 222, 128, 0.9); color: #000; }
    .delay { background: rgba(248, 113, 113, 0.9); color: #000; }
    .text-panel {
      padding: ${Math.round(32 * scale)}px ${Math.round(70 * scale)}px ${Math.round(20 * scale)}px;
      background: ${style.bg};
      border-top: ${Math.round(4 * scale)}px solid rgba(255, 255, 255, 0.1);
    }
    .category {
      font-size: ${Math.round(28 * scale)}px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: ${Math.round(12 * scale)}px;
      color: ${style.color};
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: ${Math.round(72 * scale)}px;
      font-weight: 600;
      color: #fff;
      line-height: 1.1;
    }
    .subtitle {
      font-size: ${Math.round(38 * scale)}px;
      font-style: italic;
      color: rgba(255,255,255,0.6);
      margin-top: ${Math.round(12 * scale)}px;
      font-weight: 300;
    }
    .content {
      padding: ${Math.round(24 * scale)}px ${Math.round(70 * scale)}px ${Math.round(70 * scale)}px;
      background: ${style.bg};
      flex: 1;
    }
    .context {
      font-size: ${Math.round(36 * scale)}px;
      line-height: 1.4;
      color: rgba(255,255,255,0.9);
    }
    .outcomes {
      display: flex;
      flex-direction: column;
      gap: ${Math.round(16 * scale)}px;
    }
    .outcome {
      font-size: ${Math.round(32 * scale)}px;
      line-height: 1.35;
      padding: ${Math.round(16 * scale)}px ${Math.round(20 * scale)}px;
      border-radius: ${Math.round(12 * scale)}px;
    }
    .positive { background: rgba(74, 222, 128, 0.15); color: #86efac; }
    .negative { background: rgba(248, 113, 113, 0.15); color: #fca5a5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="artwork">
      ${hasImage
        ? `<img src="${imageDataUrl}" alt="${card.name}">`
        : `<div class="artwork-placeholder">${card.name}</div>`
      }
      ${valueBadge}
    </div>
    <div class="text-panel">
      <div class="category">${style.name}</div>
      <div class="title">${card.name}</div>
      <div class="subtitle">${card.description || ''}</div>
    </div>
    <div class="content">
      ${contextHTML}
    </div>
  </div>
</body>
</html>`;
}

function generateCardBackHTML() {
  const scale = CARD_WIDTH / 900;

  return `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      font-family: 'Playfair Display', serif;
      overflow: hidden;
    }
    .card-back {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #0f0f0f 50%, #1a1a2e 100%);
      /* NO border-radius for print */
      border: ${Math.round(4 * scale)}px solid rgba(255, 255, 255, 0.08);
    }
    .pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.06;
      background-image:
        repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent ${Math.round(40 * scale)}px),
        repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 1px, transparent ${Math.round(40 * scale)}px);
    }
    .logo {
      position: relative;
      z-index: 1;
      text-align: center;
    }
    .logo-symbol {
      font-size: ${Math.round(200 * scale)}px;
      color: #a855f7;
      margin-bottom: ${Math.round(40 * scale)}px;
    }
    .logo-text {
      font-size: ${Math.round(80 * scale)}px;
      font-weight: 500;
      color: #a855f7;
      letter-spacing: 0.25em;
      text-transform: uppercase;
    }
    .logo-subtitle {
      font-size: ${Math.round(36 * scale)}px;
      color: #888;
      letter-spacing: 0.15em;
      margin-top: ${Math.round(24 * scale)}px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="card-back">
    <div class="pattern"></div>
    <div class="logo">
      <div class="logo-symbol">&#x25C7;</div>
      <div class="logo-text">Futures</div>
      <div class="logo-subtitle">A Speculative Oracle</div>
    </div>
  </div>
</body>
</html>`;
}

async function renderCard(browser, html, outputPath) {
  const page = await browser.newPage();
  await page.setViewport({ width: CARD_WIDTH, height: CARD_HEIGHT });
  await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: outputPath, type: 'png' });
  await page.close();
}

async function main() {
  console.log('Futures Deck - Print-Ready Card Renderer');
  console.log('='.repeat(50));
  console.log(`\nOutput size: ${CARD_WIDTH}×${CARD_HEIGHT} pixels`);
  console.log(`At 300 DPI: ${Math.round(CARD_WIDTH / 300 * 25.4)}mm × ${Math.round(CARD_HEIGHT / 300 * 25.4)}mm`);
  console.log(`Bleed: ${BLEED_PX}px (${Math.round(BLEED_PX / 300 * 25.4)}mm)`);
  console.log(`No rounded corners (printer will die-cut)\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const cards = buildCardList();
  console.log(`Rendering ${cards.length} cards for print...\n`);

  // Check artwork availability
  let withArtwork = 0;
  let withoutArtwork = 0;

  for (const card of cards) {
    const artPath = path.join(ARTWORK_DIR, `${card.id}.png`);
    if (fs.existsSync(artPath)) {
      withArtwork++;
    } else {
      withoutArtwork++;
    }
  }

  console.log(`Artwork found: ${withArtwork}`);
  console.log(`Missing artwork: ${withoutArtwork}\n`);

  const browser = await puppeteer.launch({ headless: true });

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const artPath = path.join(ARTWORK_DIR, `${card.id}.png`);
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);

    // Load artwork as base64 if available
    let imageDataUrl = null;
    if (fs.existsSync(artPath)) {
      const imageBuffer = fs.readFileSync(artPath);
      const base64 = imageBuffer.toString('base64');
      imageDataUrl = `data:image/png;base64,${base64}`;
    }

    const html = generateCardHTML(card, imageDataUrl);
    await renderCard(browser, html, outputPath);

    const status = imageDataUrl ? '✓' : '○ no art';
    console.log(`[${i + 1}/${cards.length}] ${card.name} ${status}`);
  }

  // Render card back
  console.log('\nRendering card back...');
  const backHtml = generateCardBackHTML();
  const backPath = path.join(OUTPUT_DIR, 'card-back.png');
  await renderCard(browser, backHtml, backPath);
  console.log('✓ card-back.png');

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('PRINT SPECIFICATIONS:');
  console.log(`- File size: ${CARD_WIDTH}×${CARD_HEIGHT} pixels`);
  console.log(`- Resolution: 300 DPI`);
  console.log(`- Trim size: ~89mm × 148mm (3.5" × 5.8")`);
  console.log(`- Bleed: 3mm on all sides`);
  console.log(`- Format: PNG (RGB) - convert to CMYK for offset printing`);
  console.log(`- Corners: Square (printer will die-cut rounded corners)`);
  console.log('\n' + '='.repeat(50));
  console.log(`Done! Rendered ${cards.length + 1} print-ready cards to:`);
  console.log(OUTPUT_DIR);
}

main().catch(console.error);
