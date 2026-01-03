#!/usr/bin/env node
/**
 * Render Futures Deck cards for The Game Crafter
 *
 * Creates 900x1500 PNG cards with artwork and text overlays
 * Output: assets/cards-tgc/
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
const ARTWORK_DIR = path.join(PROJECT_DIR, 'assets', 'tarot');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'assets', 'cards-tgc');

// TGC Tarot dimensions
const CARD_WIDTH = 900;
const CARD_HEIGHT = 1500;

// Category colors (matching existing design system)
const CATEGORY_COLORS = {
  arc: { bg: '#1f1a2e', accent: '#a855f7', name: 'Arc' },
  terrain: { bg: '#1a2a2a', accent: '#4ECDC4', name: 'Terrain' },
  object: { bg: '#2a1f1a', accent: '#FF8C42', name: 'Object' },
  wellbeing: { bg: '#2a2a1a', accent: '#FFD93D', name: 'Wellbeing' },
  timeframe: { bg: '#1a1f2a', accent: '#60a5fa', name: 'Timeframe' },
  modifiers: { bg: '#2a1a1a', accent: '#f87171', name: 'Modifier' }
};

// Build card list from JSON
function buildCardList() {
  const cards = [];

  // Arc cards (4)
  for (const card of CARDS_DATA.arc) {
    cards.push({
      id: card.id,
      category: 'arc',
      name: card.name,
      description: card.description,
      context: card.context
    });
  }

  // Terrain cards (16)
  for (const card of CARDS_DATA.terrain) {
    cards.push({
      id: card.id,
      category: 'terrain',
      name: card.name,
      description: card.description,
      context: card.context
    });
  }

  // Object cards (10)
  for (const card of CARDS_DATA.object) {
    cards.push({
      id: card.id,
      category: 'object',
      name: card.name,
      description: card.description,
      context: card.context
    });
  }

  // Wellbeing cards (13)
  for (const card of CARDS_DATA.wellbeing) {
    cards.push({
      id: card.id,
      category: 'wellbeing',
      name: card.name,
      description: card.description,
      context: card.context,
      positive: card.positive,
      negative: card.negative
    });
  }

  // Timeframe cards (7)
  for (const card of CARDS_DATA.timeframe) {
    cards.push({
      id: card.id,
      category: 'timeframe',
      name: card.name,
      description: card.description,
      context: card.context
    });
  }

  // Modifier cards (6)
  for (const card of CARDS_DATA.modifiers) {
    cards.push({
      id: card.id,
      category: 'modifiers',
      name: card.label,
      description: card.context,
      value: card.value
    });
  }

  return cards;
}

function generateCardHTML(card, imagePath) {
  const colors = CATEGORY_COLORS[card.category];
  const hasImage = fs.existsSync(imagePath);

  // Load image as base64 for Puppeteer
  let imageDataUrl = '';
  if (hasImage) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    imageDataUrl = `data:image/png;base64,${base64}`;
  }

  // For wellbeing cards, show positive/negative
  let contextText = card.context || card.description;
  if (card.positive && card.negative) {
    contextText = `<span class="positive">+ ${card.positive}</span><br><span class="negative">− ${card.negative}</span>`;
  }

  // For modifier cards, show value
  let valueIndicator = '';
  if (card.value !== undefined) {
    const sign = card.value < 0 ? '' : '+';
    valueIndicator = `<div class="value-indicator">${sign}${card.value} years</div>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      font-family: 'Source Sans Pro', sans-serif;
      background: ${colors.bg};
      overflow: hidden;
    }

    .card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(to bottom, ${colors.bg}, #0f0f0f);
    }

    .artwork {
      width: 100%;
      height: 900px;
      overflow: hidden;
      position: relative;
    }

    .artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .artwork-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, ${colors.bg} 0%, #0f0f0f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: ${colors.accent};
      opacity: 0.3;
    }

    .text-panel {
      flex: 1;
      padding: 28px 80px 16px;
      display: flex;
      flex-direction: column;
    }

    .category-badge {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: ${colors.accent};
      margin-bottom: 8px;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 56px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.1;
    }

    .description {
      font-size: 28px;
      color: #aaa;
      margin-bottom: 16px;
      font-style: italic;
    }

    .context {
      font-size: 26px;
      color: #888;
      line-height: 1.4;
      flex: 1;
    }

    .context .positive {
      color: #4ade80;
    }

    .context .negative {
      color: #f87171;
    }

    .value-indicator {
      position: absolute;
      top: 20px;
      right: 20px;
      background: ${colors.accent};
      color: #000;
      font-weight: 700;
      font-size: 28px;
      padding: 12px 20px;
      border-radius: 8px;
    }

    .footer {
      padding: 16px 80px 80px;
      border-top: 1px solid #333;
    }

    .deck-name {
      font-size: 22px;
      color: #555;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="artwork">
      ${hasImage
        ? `<img src="${imageDataUrl}" alt="${card.name}">`
        : `<div class="artwork-placeholder">${card.name}</div>`
      }
      ${valueIndicator}
    </div>
    <div class="text-panel">
      <div class="category-badge">${colors.name}</div>
      <div class="title">${card.name}</div>
      <div class="description">${card.description || ''}</div>
      <div class="context">${contextText || ''}</div>
    </div>
    <div class="footer">
      <div class="deck-name">Futures Deck</div>
    </div>
  </div>
</body>
</html>`;
}

function generateCardBackHTML() {
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
      background: #0f0f0f;
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
      border: 3px solid #333;
    }

    .pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      background-image:
        repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 40px),
        repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 1px, transparent 40px);
    }

    .logo {
      position: relative;
      z-index: 1;
      text-align: center;
    }

    .logo-symbol {
      font-size: 120px;
      color: #c9a227;
      margin-bottom: 20px;
    }

    .logo-text {
      font-size: 48px;
      font-weight: 400;
      color: #c9a227;
      letter-spacing: 0.3em;
      text-transform: uppercase;
    }

    .logo-subtitle {
      font-size: 24px;
      color: #666;
      letter-spacing: 0.2em;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="card-back">
    <div class="pattern"></div>
    <div class="logo">
      <div class="logo-symbol">◈</div>
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
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath, type: 'png' });
  await page.close();
}

async function main() {
  console.log('Futures Deck - TGC Card Renderer');
  console.log('='.repeat(50));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const cards = buildCardList();
  console.log(`\nFound ${cards.length} cards to render\n`);

  const browser = await puppeteer.launch({ headless: true });

  // Render each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const imagePath = path.join(ARTWORK_DIR, `${card.id}.png`);
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);

    const html = generateCardHTML(card, imagePath);
    await renderCard(browser, html, outputPath);

    const hasImage = fs.existsSync(imagePath);
    const status = hasImage ? '✓' : '⚠ no image';
    console.log(`[${i + 1}/${cards.length}] ${card.id} - ${card.name} ${status}`);
  }

  // Render card back
  console.log('\nRendering card back...');
  const backHtml = generateCardBackHTML();
  const backPath = path.join(OUTPUT_DIR, 'card-back.png');
  await renderCard(browser, backHtml, backPath);
  console.log('✓ card-back.png');

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`Done! Rendered ${cards.length + 1} cards to:`);
  console.log(OUTPUT_DIR);
}

main().catch(console.error);
