#!/usr/bin/env node
/**
 * Render Emerging Technologies Futures cards
 *
 * Specifications:
 * - Size: A6 (105x148mm at 300 DPI = 1240x1748 pixels)
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

// A6 at 300 DPI: 105mm x 148mm = 1240 x 1748 pixels
const CARD_WIDTH = 1240;
const CARD_HEIGHT = 1748;

// Category styles - solid background colors, black text
const categoryStyles = {
  technology: { bg: '#EBEBFF', name: 'TECHNOLOGY' },
  actors:     { bg: '#FFE7FF', name: 'ACTOR' },
  events:     { bg: '#FFEBEB', name: 'EVENT' }
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
      isBlank: card.name === 'Blank Card'
    });
  }

  for (const card of CARDS_DATA.actors) {
    cards.push({
      id: card.id,
      category: 'actors',
      name: card.name,
      description: card.description,
      isBlank: card.name === 'Blank Card'
    });
  }

  for (const card of CARDS_DATA.events) {
    cards.push({
      id: card.id,
      category: 'events',
      name: card.name,
      description: card.description,
      isBlank: card.name === 'Blank Card'
    });
  }

  return cards;
}

function generateCardHTML(card, imageDataUrl) {
  const style = categoryStyles[card.category];
  const hasImage = !!imageDataUrl;

  // For blank cards: show category, no title, "Write your own input" at bottom
  if (card.isBlank) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      overflow: hidden;
      font-family: 'Roboto Mono', monospace;
    }
    .card {
      width: 100%;
      height: 100%;
      background: ${style.bg};
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .artwork {
      height: ${CARD_WIDTH}px;
      overflow: hidden;
      background: #e0e0e0;
      position: relative;
    }
    .artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .text-panel {
      flex: 1;
      padding: 56px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .category {
      font-family: 'Roboto Mono', monospace;
      font-size: 42px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #000000;
    }
    .write-prompt {
      font-family: 'Roboto Mono', monospace;
      font-size: 36px;
      font-weight: 400;
      color: #000000;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="artwork">
      ${hasImage ? `<img src="${imageDataUrl}" alt="${style.name}">` : ''}
    </div>
    <div class="text-panel">
      <div class="category">${style.name}</div>
      <div class="write-prompt">Write your own input</div>
    </div>
  </div>
</body>
</html>`;
  }

  // Regular card
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      overflow: hidden;
      font-family: 'Roboto Mono', monospace;
    }
    .card {
      width: 100%;
      height: 100%;
      background: ${style.bg};
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .artwork {
      height: ${CARD_WIDTH}px;
      overflow: hidden;
      background: #e0e0e0;
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
      font-size: 72px;
      color: #000000;
      opacity: 0.2;
    }
    .text-panel {
      flex: 1;
      padding: 56px 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .category {
      font-family: 'Roboto Mono', monospace;
      font-size: 42px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 20px;
      color: #000000;
    }
    .title {
      font-family: 'Roboto Mono', monospace;
      font-size: 72px;
      font-weight: 700;
      color: #000000;
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .subtitle {
      font-family: 'Roboto Mono', monospace;
      font-size: 36px;
      font-weight: 400;
      color: #000000;
      line-height: 1.35;
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
    </div>
    <div class="text-panel">
      <div class="category">${style.name}</div>
      <div class="title">${card.name}</div>
      <div class="subtitle">${card.description || ''}</div>
    </div>
  </div>
</body>
</html>`;
}

function generateCardBackHTML(category) {
  const backgrounds = {
    technology: '#EBEBFF',
    actors: '#FFE7FF',
    events: '#FFEBEB'
  };
  const bg = backgrounds[category] || '#EBEBFF';

  return `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      font-family: 'Roboto Mono', monospace;
      overflow: hidden;
    }
    .card-back {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${bg};
    }
    .pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.04;
      background-image:
        repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 50px),
        repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 50px);
    }
    .content {
      position: relative;
      z-index: 1;
      text-align: center;
    }
    .title {
      font-family: 'Roboto Mono', monospace;
      font-size: 72px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.02em;
      line-height: 1.15;
    }
    .byline {
      font-family: 'Roboto Mono', monospace;
      font-size: 32px;
      font-weight: 400;
      color: #000000;
      opacity: 0.6;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="card-back">
    <div class="pattern"></div>
    <div class="content">
      <div class="title">Emerging Tech<br>Futures</div>
      <div class="byline">by Quantum Delta</div>
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
  console.log(`\nOutput size: ${CARD_WIDTH}x${CARD_HEIGHT} pixels (A6 @ 300 DPI)`);
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

  // Render category-specific card backs
  console.log('\nRendering card backs...');
  const categories = ['technology', 'actors', 'events'];
  for (const category of categories) {
    const backHtml = generateCardBackHTML(category);
    const backPath = path.join(OUTPUT_DIR, `card-back-${category}.png`);
    await renderCard(browser, backHtml, backPath);
    console.log(`✓ card-back-${category}.png`);
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`Done! Rendered ${cards.length} cards + 3 backs to:`);
  console.log(OUTPUT_DIR);
}

main().catch(console.error);
