# Futures Deck - Artwork Generation

## Overview

Card artwork is generated using **Replicate's Flux 1.1 Pro** model, producing 1:1 square images that are composited onto the final card layouts.

## Requirements

- Node.js 18+
- Replicate API token (get one at https://replicate.com)
- `replicate` npm package (already installed)

## Quick Start

```bash
# Generate all artwork
REPLICATE_API_TOKEN=r8_xxx node src/generate-images.js

# Render final cards with artwork
node src/render-final-cards.js
```

## Full Workflow

### 1. Generate Artwork

```bash
# Set your API token and run
REPLICATE_API_TOKEN=r8_xxx node src/generate-images.js

# Generate a single card (for testing)
REPLICATE_API_TOKEN=r8_xxx node src/generate-images.js --card=arc-01
```

**Output:** `assets/artwork/*.png` (1:1 square images)

The script:
- Skips cards that already have artwork
- Rate-limits requests (5s between images)
- Uses evocative contemporary prompts for each card

### 2. Render Final Cards with Artwork

```bash
node src/render-final-cards.js
```

**Output:** `assets/cards-final/*.png` (900x1500 with artwork)

This composites artwork + text into final card layouts matching the alchemy-deck style.

### 3. Alternative: Render with Legacy TGC Script

```bash
node src/render-cards-for-tgc.js
```

**Output:** `assets/cards-tgc/*.png` (900x1500 TGC tarot size)

### 4. Alternative: Text-Only Cards

```bash
node src/render-cards-text-only.js
```

**Output:** `assets/cards-print/*.png` (900x1500, no artwork)

## File Structure

```
assets/
├── artwork/           # Raw generated artwork (square)
├── cards-tgc/         # Final cards with artwork (900x1500)
├── cards-print/       # Text-only cards (900x1500)
└── tarot/             # Legacy artwork location
```

## Card Categories

| Category | Count | Style |
|----------|-------|-------|
| Arc | 4 | Macro futures scenarios |
| Terrain | 16 | Domains of human activity |
| Object | 10 | Tangible artifacts |
| Wellbeing | 13 | Human needs (pos/neg futures) |
| Timeframe | 7 | Time horizons |
| Modifiers | 6 | Timeline accelerators/delays |

**Total: 56 cards + 1 card back**

## Prompt Style

Base style for all cards:
```
Cinematic digital art, dramatic lighting, contemporary symbols,
evocative atmosphere, rich saturated colors, mysterious mood,
oracle card aesthetic, no text, no letters, no words.
```

Each card adds specific imagery mixing:
- Contemporary technology symbols
- Recognizable modern artifacts
- Emotional/atmospheric elements
- Category-appropriate color palette

## Cost Estimate

Flux 1.1 Pro: ~$0.04 per image
- 56 cards × $0.04 = ~$2.24 total

## Troubleshooting

**Rate limiting:** Script waits 5s between requests. If you get 429 errors, increase the delay.

**Missing artwork:** Re-run the script - it only generates missing images.

**Wrong aspect ratio:** The model outputs 1:1 square images that get cropped to fit the 60% artwork area on cards.
