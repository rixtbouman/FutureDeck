# Creating Your Own Card Deck

This guide explains how to create your own custom card deck using the Futures Deck system with Claude Code.

## Overview

The system has three main components:

1. **`src/cards-v2.json`** - Your card definitions (names, descriptions, categories)
2. **`src/generate-images.js`** - AI artwork generator (uses Replicate/Flux)
3. **`src/render-final-cards.js`** - Renders web-ready cards (900×1500px, rounded corners)
4. **`src/render-print-cards.js`** - Renders print-ready cards (1050×1750px, square corners, bleed)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Edit your card data
# Edit src/cards-v2.json with your cards

# 3. Generate artwork (requires Replicate API token)
REPLICATE_API_TOKEN=xxx node src/generate-images.js

# 4. Render cards for web
node src/render-final-cards.js

# 5. Render cards for print (optional)
node src/render-print-cards.js
```

## Step 1: Define Your Cards

Edit `src/cards-v2.json` to define your deck. The file has this structure:

```json
{
  "meta": {
    "name": "Your Deck Name",
    "version": "1.0.0",
    "description": "Description of your deck"
  },
  "category_name": [
    {
      "id": "category-01",
      "name": "Card Name",
      "description": "Short tagline",
      "context": "Longer explanation text",
      "symbols": ["Symbol 1", "Symbol 2"]
    }
  ]
}
```

### Card Categories

You can create any categories you want. The current Futures Deck uses:

| Category | Purpose | Special Fields |
|----------|---------|----------------|
| `arc` | Story trajectories | Standard |
| `terrain` | Domains/settings | Standard |
| `object` | What emerges | Standard |
| `wellbeing` | Human needs | `positive`, `negative` |
| `timeframe` | When it happens | Standard |
| `modifiers` | Timeline adjustments | `label`, `value` |
| `technology` | Key technologies | Standard |
| `prompt` | Story perspectives | Standard |

### Standard Card Fields

```json
{
  "id": "category-01",      // Unique ID (used for filenames)
  "name": "Card Name",      // Display name
  "description": "Tagline", // Short description
  "context": "Longer text", // Detailed explanation
  "symbols": ["A", "B"]     // Optional: visual symbols
}
```

### Special Card Types

**Wellbeing cards** (with positive/negative outcomes):
```json
{
  "id": "well-01",
  "name": "Autonomy",
  "description": "Freedom to choose",
  "positive": "Self-determination, independence",
  "negative": "Isolation, overwhelming choice"
}
```

**Modifier cards** (with year adjustments):
```json
{
  "id": "mod-01",
  "label": "Major Breakthrough",
  "value": -3,
  "context": "A significant advancement accelerates the timeline"
}
```

## Step 2: Generate Artwork

The `generate-images.js` script creates AI artwork using Replicate's Flux model.

### Setup

1. Get an API token from [replicate.com](https://replicate.com)
2. Set the environment variable: `REPLICATE_API_TOKEN=xxx`

### Add Image Prompts

Edit `src/generate-images.js` to add prompts for your cards:

```javascript
const BASE_STYLE = `Cinematic digital art, dramatic lighting,
contemporary symbols, oracle card aesthetic, no text, no watermarks.`;

const CARDS = [
  {
    id: 'category-01',  // Must match your cards-v2.json ID
    name: 'Card Name',
    prompt: `${BASE_STYLE} Your detailed image description here...`
  },
  // ... more cards
];
```

### Generate Images

```bash
# Generate all missing artwork
REPLICATE_API_TOKEN=xxx node src/generate-images.js

# Generate a specific card
REPLICATE_API_TOKEN=xxx node src/generate-images.js --card=category-01
```

Images are saved to `assets/artwork/` as `{card-id}.png`.

### Tips for Good Prompts

- Start with a base style for consistency
- Include specific visual elements, colors, mood
- End with "no text, no watermarks" to avoid unwanted elements
- Use aspect ratio `1:1` for card artwork (square, cropped to fit)

## Step 3: Customize Card Styles

Edit the `categoryStyles` object in both render scripts to match your categories:

```javascript
const categoryStyles = {
  your_category: {
    bg: 'linear-gradient(to bottom, #1f1a2e, #0f0a1a)',  // Background
    color: '#a855f7',  // Accent color (for category label)
    name: 'Your Category'  // Display name
  },
  // ... more categories
};
```

You can also customize:
- **Fonts**: Change the Google Fonts import in `generateCardHTML()`
- **Layout**: Modify the HTML/CSS in `generateCardHTML()`
- **Dimensions**: Change `CARD_WIDTH` and `CARD_HEIGHT` constants

## Step 4: Render Cards

### Web Cards (for display/digital use)

```bash
node src/render-final-cards.js
```

Output: `assets/cards-final/` (900×1500px, rounded corners)

### Print Cards (for physical printing)

```bash
node src/render-print-cards.js
```

Output: `assets/cards-print/` (1050×1750px, square corners, bleed margins)

A ZIP file is also created at `assets/futures-deck-print-ready.zip`.

## Step 5: Print Your Deck

See the README for recommended printers. Key specs for print files:

| Spec | Value |
|------|-------|
| Dimensions | 1050 × 1750 pixels |
| Resolution | 300 DPI |
| Print size | 89mm × 148mm with bleed |
| Trim size | ~80mm × 140mm |
| Bleed | 4mm on all sides |
| Corners | Square (printer die-cuts) |
| Format | PNG (RGB) |

## Working with Claude Code

Claude Code can help you at every step:

### 1. Design Your Deck
Ask Claude to help brainstorm card categories, names, and descriptions based on your theme.

Example: *"Help me design a 50-card oracle deck about personal growth with 5 categories"*

### 2. Generate Card Data
Claude can create the `cards-v2.json` structure for you.

Example: *"Create the JSON structure for these cards: [your card list]"*

### 3. Write Image Prompts
Claude can write detailed image generation prompts for each card.

Example: *"Write Flux image prompts for these cards in the style of tarot art"*

### 4. Customize Styles
Ask Claude to modify the category colors, fonts, or layout.

Example: *"Change the color scheme to warm earth tones"*

### 5. Troubleshoot
Claude can help debug issues with rendering or API calls.

## File Structure

```
your-deck/
├── src/
│   ├── cards-v2.json           # Your card definitions
│   ├── generate-images.js      # Image generation script
│   ├── render-final-cards.js   # Web card renderer
│   └── render-print-cards.js   # Print card renderer
├── assets/
│   ├── artwork/                # Generated AI artwork (1:1 square)
│   ├── cards-final/            # Web-ready cards (900×1500)
│   └── cards-print/            # Print-ready cards (1050×1750)
├── docs/                       # Optional: website files
├── package.json
├── CREATING-CARDS.md           # This guide
└── README.md
```

## Troubleshooting

### Images not generating
- Check your `REPLICATE_API_TOKEN` is valid
- Ensure card IDs in `generate-images.js` match `cards-v2.json`
- Check the Replicate dashboard for error messages

### Cards rendering without artwork
- Verify artwork exists in `assets/artwork/{card-id}.png`
- Card IDs must match exactly (case-sensitive)

### Print files look wrong
- Ensure you're using `render-print-cards.js` not `render-final-cards.js`
- Check output dimensions are 1050×1750

### Fonts not loading
- The scripts use Google Fonts (requires internet)
- For offline use, convert to local font files

## Example: Creating a Simple Deck

Here's a minimal example for a 4-card deck:

**src/cards-v2.json:**
```json
{
  "meta": {
    "name": "Elements Deck",
    "version": "1.0.0",
    "description": "A simple elemental oracle"
  },
  "elements": [
    {
      "id": "elem-01",
      "name": "Fire",
      "description": "Transformation and passion",
      "context": "The element of change, creativity, and drive."
    },
    {
      "id": "elem-02",
      "name": "Water",
      "description": "Emotion and intuition",
      "context": "The element of feeling, dreams, and flow."
    },
    {
      "id": "elem-03",
      "name": "Earth",
      "description": "Stability and growth",
      "context": "The element of foundation, patience, and abundance."
    },
    {
      "id": "elem-04",
      "name": "Air",
      "description": "Thought and communication",
      "context": "The element of ideas, clarity, and connection."
    }
  ]
}
```

Then add the category to the render scripts:

```javascript
const categoryStyles = {
  elements: {
    bg: 'linear-gradient(to bottom, #2a1a1a, #1a0a0a)',
    color: '#ff6b6b',
    name: 'Element'
  }
};
```

And update `buildCardList()`:

```javascript
function buildCardList() {
  const cards = [];
  for (const card of CARDS_DATA.elements) {
    cards.push({
      id: card.id,
      category: 'elements',
      name: card.name,
      description: card.description,
      context: card.context
    });
  }
  return cards;
}
```

## License

This card creation system is MIT licensed. Create whatever you want!
