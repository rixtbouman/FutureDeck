import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load cards
const cardsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'plant-intelligence-cards.json'), 'utf8'));
const outputDir = path.join(__dirname, 'assets', 'plant-intelligence');

// Category colors
const categoryColors = {
  organism: '#1B4332',
  capacity: '#2D6A4F',
  domain: '#40916C',
  interface: '#52B788',
  humanResponse: '#74C69D',
  timeframe: '#95D5B2',
  season: '#B7E4C7'
};

// Flatten all cards
const allCards = [];
Object.values(cardsData.cards).forEach(categoryCards => {
  allCards.push(...categoryCards);
});

// Create SVG placeholder for each card
allCards.forEach(card => {
  const color = categoryColors[card.category] || '#2D6A4F';
  const filename = `${card.id}.svg`;
  const filepath = path.join(outputDir, filename);

  // Create SVG
  const svg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
      </linearGradient>
      <pattern id="border-${card.id}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill="${color}" opacity="0.5"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="400" height="600" fill="#0a1a0f"/>

    <!-- Gradient overlay -->
    <rect width="400" height="600" fill="url(#grad-${card.id})"/>

    <!-- Border pattern -->
    <rect width="400" height="600" fill="url(#border-${card.id})" opacity="0.3"/>

    <!-- Decorative border -->
    <rect x="20" y="20" width="360" height="560" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>
    <rect x="25" y="25" width="350" height="550" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>

    <!-- Category label -->
    <text x="200" y="120" font-family="serif" font-size="14" font-weight="bold" fill="${color}" text-anchor="middle" letter-spacing="2">
      ${card.category.toUpperCase().replace(/([A-Z])/g, ' $1')}
    </text>

    <!-- Card name -->
    <text x="200" y="200" font-family="serif" font-size="32" font-weight="300" fill="white" text-anchor="middle" word-spacing="9999">
      ${card.name}
    </text>

    <!-- Description -->
    <foreignObject x="40" y="270" width="320" height="200">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 12px; color: #ccc; line-height: 1.5; text-align: center;">
        ${card.description}
      </div>
    </foreignObject>

    <!-- ID at bottom -->
    <text x="200" y="570" font-family="monospace" font-size="10" fill="${color}" text-anchor="middle" opacity="0.6">
      ${card.id}
    </text>
  </svg>`;

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Created placeholder: ${filename}`);
});

console.log(`\n✓ Generated ${allCards.length} placeholder SVG cards`);
