#!/usr/bin/env node
/**
 * Render Futures Deck cards in text-only format (matching alchemy-deck style)
 *
 * Creates 900x1500 PNG cards with text overlays only (no artwork)
 * Output: assets/cards-print/
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
const OUTPUT_DIR = path.join(PROJECT_DIR, 'assets', 'cards-print');

// TGC Tarot dimensions
const CARD_WIDTH = 900;
const CARD_HEIGHT = 1500;

// Category color styles (matching futures-deck theme)
const categoryStyles = {
  arc:       { bg: 'linear-gradient(to bottom, #1f1a2e, #0f0a1a)', color: '#a855f7', name: 'Arc' },
  terrain:   { bg: 'linear-gradient(to bottom, #1a2a2a, #0a1a1a)', color: '#4ECDC4', name: 'Terrain' },
  object:    { bg: 'linear-gradient(to bottom, #2a1f1a, #1a0f0a)', color: '#FF8C42', name: 'Object' },
  wellbeing: { bg: 'linear-gradient(to bottom, #2a2a1a, #1a1a0a)', color: '#FFD93D', name: 'Wellbeing' },
  timeframe: { bg: 'linear-gradient(to bottom, #1a1f2a, #0a0f1a)', color: '#60a5fa', name: 'Timeframe' },
  modifiers: { bg: 'linear-gradient(to bottom, #2a1a1a, #1a0a0a)', color: '#f87171', name: 'Modifier' }
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
      context: card.context,
      symbols: card.symbols
    });
  }

  // Terrain cards (16)
  for (const card of CARDS_DATA.terrain) {
    cards.push({
      id: card.id,
      category: 'terrain',
      name: card.name,
      description: card.description,
      context: card.context,
      symbols: card.symbols
    });
  }

  // Object cards (10)
  for (const card of CARDS_DATA.object) {
    cards.push({
      id: card.id,
      category: 'object',
      name: card.name,
      description: card.description,
      context: card.context,
      symbols: card.symbols
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
      value: card.value,
      symbols: card.symbols
    });
  }

  return cards;
}

// Generate HTML for standard cards (Arc, Terrain, Object, Timeframe)
function generateStandardCardHTML(card) {
  const style = categoryStyles[card.category];

  // Build symbols list if available
  let symbolsHTML = '';
  if (card.symbols && card.symbols.length > 0) {
    symbolsHTML = `
      <div class="symbols">
        ${card.symbols.map(s => `<span class="symbol">${s}</span>`).join('')}
      </div>`;
  }

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
      background: ${style.bg};
      display: flex;
      flex-direction: column;
      border-radius: 40px;
      overflow: hidden;
      border: 6px solid rgba(255, 255, 255, 0.15);
    }
    .header {
      padding: 100px 80px 50px;
      text-align: center;
      border-bottom: 3px solid rgba(255, 255, 255, 0.1);
    }
    .category {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 20px;
      color: ${style.color};
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 90px;
      font-weight: 600;
      color: #fff;
      line-height: 1.1;
      letter-spacing: 0.02em;
      text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    .subtitle {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 36px;
      font-style: italic;
      color: rgba(255,255,255,0.6);
      margin-top: 16px;
      font-weight: 300;
    }
    .content {
      flex: 1;
      padding: 50px 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .context {
      font-size: 38px;
      line-height: 1.5;
      color: rgba(255,255,255,0.9);
      font-weight: 400;
    }
    .symbols {
      margin-top: 40px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .symbol {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 10px 20px;
      font-size: 24px;
      color: ${style.color};
    }
    .footer {
      padding: 40px 80px 100px;
      text-align: center;
      border-top: 3px solid rgba(255, 255, 255, 0.1);
    }
    .footer-text {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 22px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="category">${style.name}</div>
      <div class="title">${card.name}</div>
      <div class="subtitle">${card.description}</div>
    </div>
    <div class="content">
      <div class="context">${card.context}</div>
      ${symbolsHTML}
    </div>
    <div class="footer">
      <div class="footer-text">Futures Deck</div>
    </div>
  </div>
</body>
</html>`;
}

// Generate HTML for wellbeing cards (with positive/negative)
function generateWellbeingCardHTML(card) {
  const style = categoryStyles[card.category];

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
      background: ${style.bg};
      display: flex;
      flex-direction: column;
      border-radius: 40px;
      overflow: hidden;
      border: 6px solid rgba(255, 255, 255, 0.15);
    }
    .header {
      padding: 80px 80px 40px;
      text-align: center;
      border-bottom: 3px solid rgba(255, 255, 255, 0.1);
    }
    .category {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 16px;
      color: ${style.color};
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 80px;
      font-weight: 600;
      color: #fff;
      line-height: 1.1;
      text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    .subtitle {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 32px;
      font-style: italic;
      color: rgba(255,255,255,0.6);
      margin-top: 12px;
      font-weight: 300;
    }
    .content {
      flex: 1;
      padding: 40px 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 30px;
    }
    .context {
      font-size: 34px;
      line-height: 1.45;
      color: rgba(255,255,255,0.85);
    }
    .outcomes {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 20px;
    }
    .outcome {
      padding: 24px 30px;
      border-radius: 16px;
      font-size: 28px;
      line-height: 1.4;
    }
    .positive {
      background: rgba(74, 222, 128, 0.12);
      border-left: 5px solid #4ade80;
      color: #86efac;
    }
    .negative {
      background: rgba(248, 113, 113, 0.12);
      border-left: 5px solid #f87171;
      color: #fca5a5;
    }
    .outcome-label {
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .positive .outcome-label { color: #4ade80; }
    .negative .outcome-label { color: #f87171; }
    .footer {
      padding: 30px 80px 80px;
      text-align: center;
      border-top: 3px solid rgba(255, 255, 255, 0.1);
    }
    .footer-text {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 22px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="category">${style.name}</div>
      <div class="title">${card.name}</div>
      <div class="subtitle">${card.description}</div>
    </div>
    <div class="content">
      <div class="context">${card.context}</div>
      <div class="outcomes">
        <div class="outcome positive">
          <div class="outcome-label">Positive Future</div>
          ${card.positive}
        </div>
        <div class="outcome negative">
          <div class="outcome-label">Negative Future</div>
          ${card.negative}
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">Futures Deck</div>
    </div>
  </div>
</body>
</html>`;
}

// Generate HTML for modifier cards (with value indicator)
function generateModifierCardHTML(card) {
  const style = categoryStyles[card.category];
  const sign = card.value < 0 ? '' : '+';
  const valueClass = card.value < 0 ? 'accelerate' : 'delay';
  const valueLabel = card.value < 0 ? 'Accelerates Timeline' : 'Delays Timeline';

  let symbolsHTML = '';
  if (card.symbols && card.symbols.length > 0) {
    symbolsHTML = `
      <div class="symbols">
        ${card.symbols.map(s => `<span class="symbol">${s}</span>`).join('')}
      </div>`;
  }

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
      background: ${style.bg};
      display: flex;
      flex-direction: column;
      border-radius: 40px;
      overflow: hidden;
      border: 6px solid rgba(255, 255, 255, 0.15);
    }
    .header {
      padding: 80px 80px 40px;
      text-align: center;
      border-bottom: 3px solid rgba(255, 255, 255, 0.1);
    }
    .category {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 16px;
      color: ${style.color};
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 72px;
      font-weight: 600;
      color: #fff;
      line-height: 1.1;
      text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    }
    .value-badge {
      margin-top: 30px;
      display: inline-block;
      padding: 16px 40px;
      border-radius: 50px;
      font-size: 48px;
      font-weight: 700;
    }
    .accelerate {
      background: rgba(74, 222, 128, 0.2);
      border: 3px solid #4ade80;
      color: #4ade80;
    }
    .delay {
      background: rgba(248, 113, 113, 0.2);
      border: 3px solid #f87171;
      color: #f87171;
    }
    .value-label {
      font-size: 24px;
      margin-top: 12px;
      color: rgba(255,255,255,0.5);
      font-weight: 400;
    }
    .content {
      flex: 1;
      padding: 50px 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .context {
      font-size: 40px;
      line-height: 1.5;
      color: rgba(255,255,255,0.9);
    }
    .symbols {
      margin-top: 40px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .symbol {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 10px 20px;
      font-size: 24px;
      color: ${style.color};
    }
    .footer {
      padding: 40px 80px 100px;
      text-align: center;
      border-top: 3px solid rgba(255, 255, 255, 0.1);
    }
    .footer-text {
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 22px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="category">${style.name}</div>
      <div class="title">${card.name}</div>
      <div class="value-badge ${valueClass}">${sign}${card.value} years</div>
      <div class="value-label">${valueLabel}</div>
    </div>
    <div class="content">
      <div class="context">${card.description}</div>
      ${symbolsHTML}
    </div>
    <div class="footer">
      <div class="footer-text">Futures Deck</div>
    </div>
  </div>
</body>
</html>`;
}

// Generate card back HTML
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
      border-radius: 40px;
      border: 6px solid rgba(255, 255, 255, 0.1);
    }
    .pattern {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.08;
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
      font-size: 140px;
      color: #a855f7;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 56px;
      font-weight: 500;
      color: #a855f7;
      letter-spacing: 0.25em;
      text-transform: uppercase;
    }
    .logo-subtitle {
      font-size: 26px;
      color: #666;
      letter-spacing: 0.15em;
      margin-top: 16px;
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
  // Wait a bit for fonts to load
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: outputPath, type: 'png' });
  await page.close();
}

async function main() {
  console.log('Futures Deck - Text-Only Card Renderer');
  console.log('='.repeat(50));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const cards = buildCardList();
  console.log(`\nRendering ${cards.length} cards...\n`);

  const browser = await puppeteer.launch({ headless: true });

  // Render each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);

    let html;
    if (card.category === 'wellbeing') {
      html = generateWellbeingCardHTML(card);
    } else if (card.category === 'modifiers') {
      html = generateModifierCardHTML(card);
    } else {
      html = generateStandardCardHTML(card);
    }

    await renderCard(browser, html, outputPath);
    console.log(`[${i + 1}/${cards.length}] ${card.name}`);
  }

  // Render card back
  console.log('\nRendering card back...');
  const backHtml = generateCardBackHTML();
  const backPath = path.join(OUTPUT_DIR, 'card-back.png');
  await renderCard(browser, backHtml, backPath);
  console.log('card-back.png');

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log(`Done! Rendered ${cards.length + 1} cards to:`);
  console.log(OUTPUT_DIR);
}

main().catch(console.error);
