#!/usr/bin/env node
/**
 * Render Emerging Technologies Futures cards
 *
 * Specifications:
 * - Size: 1050x1750 pixels (print-ready with bleed)
 * - Output: assets/cards-emerging/
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
const CARDS_DATA = require('./cards-emerging-tech.json');
const ARTWORK_DIR = path.join(PROJECT_DIR, 'assets', 'artwork-emerging');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'assets', 'cards-emerging');

// Print dimensions
const CARD_WIDTH = 1050;
const CARD_HEIGHT = 1750;

// Category color styles - fresh, lighter aesthetic
const categoryStyles = {
  technology: { bg: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)', color: '#0369a1', textColor: '#0c4a6e', name: 'Technology' },
  actors:     { bg: 'linear-gradient(to bottom, #f3e8ff, #e9d5ff)', color: '#7c3aed', textColor: '#5b21b6', name: 'Actor' },
  events:     { bg: 'linear-gradient(to bottom, #ffedd5, #fed7aa)', color: '#c2410c', textColor: '#7c2d12', name: 'Event' },
  wellbeing:  { bg: 'linear-gradient(to bottom, #dcfce7, #bbf7d0)', color: '#15803d', textColor: '#14532d', name: 'Wellbeing' }
};

// Build card list from JSON
function buildCardList() {
  const cards = [];

  for (const card of CARDS_DATA.technology) {
    cards.push({
      id: card.id,
      category: 'technology',
      name: card.name,
      description: card.description,
      context: card.context,
      symbols: card.symbols
    });
  }

  for (const card of CARDS_DATA.actors) {
    cards.push({
      id: card.id,
      category: 'actors',
      name: card.name,
      description: card.description,
      context: card.context,
      symbols: card.symbols
    });
  }

  for (const card of CARDS_DATA.events) {
    cards.push({
      id: card.id,
      category: 'events',
      name: card.name,
      description: card.description,
      context: card.context,
      symbols: card.symbols
    });
  }

  for (const card of CARDS_DATA.wellbeing) {
    cards.push({
      id: card.id,
      category: 'wellbeing',
      name: card.name,
      description: card.description,
      positive: card.positive,
      negative: card.negative
    });
  }

  return cards;
}

function generateCardHTML(card, imageDataUrl) {
  const style = categoryStyles[card.category];
  const hasImage = !!imageDataUrl;

  // For wellbeing cards, show positive/negative outcomes
  let contextHTML = '';
  if (card.positive && card.negative) {
    contextHTML = `
      <div class="outcomes">
        <div class="outcome positive">+ ${card.positive}</div>
        <div class="outcome negative">- ${card.negative}</div>
      </div>`;
  } else if (card.context) {
    contextHTML = `<div class="context">${card.context}</div>`;
  }

  // Scale factor from 900x1500 reference to 1050x1750
  const scale = CARD_WIDTH / 900;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .card {
      width: 100%;
      height: 100%;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .artwork {
      height: ${Math.round(1050 * scale)}px;
      overflow: hidden;
      background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
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
    .text-panel {
      padding: ${Math.round(36 * scale)}px ${Math.round(70 * scale)}px ${Math.round(24 * scale)}px;
      background: ${style.bg};
      border-top: ${Math.round(5 * scale)}px solid ${style.color};
    }
    .category {
      font-family: 'Inter', sans-serif;
      font-size: ${Math.round(26 * scale)}px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: ${Math.round(10 * scale)}px;
      color: ${style.color};
    }
    .title {
      font-family: 'Roboto Mono', monospace;
      font-size: ${Math.round(68 * scale)}px;
      font-weight: 700;
      color: ${style.textColor};
      line-height: 1.1;
    }
    .subtitle {
      font-size: ${Math.round(36 * scale)}px;
      color: ${style.textColor};
      opacity: 0.7;
      margin-top: ${Math.round(10 * scale)}px;
      font-weight: 400;
    }
    .content {
      padding: ${Math.round(28 * scale)}px ${Math.round(70 * scale)}px ${Math.round(70 * scale)}px;
      background: ${style.bg};
      flex: 1;
    }
    .context {
      font-size: ${Math.round(34 * scale)}px;
      line-height: 1.45;
      color: ${style.textColor};
      opacity: 0.85;
    }
    .outcomes {
      display: flex;
      flex-direction: column;
      gap: ${Math.round(14 * scale)}px;
    }
    .outcome {
      font-size: ${Math.round(30 * scale)}px;
      line-height: 1.4;
      padding: ${Math.round(14 * scale)}px ${Math.round(18 * scale)}px;
      border-radius: ${Math.round(10 * scale)}px;
    }
    .positive { background: rgba(22, 163, 74, 0.15); color: #15803d; }
    .negative { background: rgba(220, 38, 38, 0.12); color: #b91c1c; }
  </style>
</head>
<body>
  <div class="card">
    <div class="artwork">
      ${hasImage
        ? `<img src="${imageDataUrl}" alt="${card.name}">`
        : `<div class="artwork-placeholder">${card.name}</div>`
      }
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
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }
    .card-back {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #e0f2fe 100%);
      border: ${Math.round(4 * scale)}px solid rgba(3, 105, 161, 0.3);
    }
    .pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.08;
      background-image:
        repeating-linear-gradient(45deg, #0369a1 0, #0369a1 1px, transparent 1px, transparent ${Math.round(40 * scale)}px),
        repeating-linear-gradient(-45deg, #0369a1 0, #0369a1 1px, transparent 1px, transparent ${Math.round(40 * scale)}px);
    }
    .logo {
      position: relative;
      z-index: 1;
      text-align: center;
    }
    .logo-symbol {
      font-size: ${Math.round(180 * scale)}px;
      color: #0369a1;
      margin-bottom: ${Math.round(40 * scale)}px;
    }
    .logo-text {
      font-family: 'Roboto Mono', monospace;
      font-size: ${Math.round(64 * scale)}px;
      font-weight: 700;
      color: #0c4a6e;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .logo-subtitle {
      font-family: 'Roboto Mono', monospace;
      font-size: ${Math.round(42 * scale)}px;
      font-weight: 500;
      color: #0369a1;
      letter-spacing: 0.1em;
      margin-top: ${Math.round(16 * scale)}px;
    }
    .logo-tagline {
      font-size: ${Math.round(26 * scale)}px;
      color: #0c4a6e;
      opacity: 0.7;
      letter-spacing: 0.05em;
      margin-top: ${Math.round(30 * scale)}px;
    }
  </style>
</head>
<body>
  <div class="card-back">
    <div class="pattern"></div>
    <div class="logo">
      <div class="logo-symbol">&#x25C8;</div>
      <div class="logo-text">Emerging Tech</div>
      <div class="logo-subtitle">Futures</div>
      <div class="logo-tagline">A Disruption Scenario Deck</div>
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
  console.log('Emerging Technologies Futures - Card Renderer');
  console.log('='.repeat(50));
  console.log(`\nOutput size: ${CARD_WIDTH}x${CARD_HEIGHT} pixels`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const cards = buildCardList();
  console.log(`Rendering ${cards.length} cards...\n`);

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
  console.log(`Done! Rendered ${cards.length + 1} cards to:`);
  console.log(OUTPUT_DIR);
}

main().catch(console.error);
