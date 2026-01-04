# Futures Deck

A speculative oracle deck for exploring possible futures. 72 beautifully illustrated cards across 8 categories, with AI-powered scenario generation.

## Play Online

- **[Explore Futures](https://futures-deck.vercel.app/docs/explore.html)** - Generate spreads and AI scenarios with illustrations
- **[Quick Draw](https://futures-deck.vercel.app/docs/play-v2.html)** - Draw cards interactively
- **[Example Scenarios](https://futures-deck.vercel.app/docs/examples.html)** - See pre-generated future scenarios

## The Deck (72 Cards)

| Category | Cards | Purpose |
|----------|-------|---------|
| **Arc** (4) | Growth, Collapse, Discipline, Transformation | Trajectory of change |
| **Terrain** (16) | Agriculture, Warfare, Healthcare, Education, Ocean, Governance, Entertainment, Transport, Religion, Commerce, Startups, Arts & Culture, Energy, Housing, Labor, Climate | Domain/setting |
| **Object** (10) | Device, Law, Ritual, Beverage, Vehicle, Building, Garment, Game, Plant, Advertisement | What emerges |
| **Wellbeing** (13) | Autonomy, Beauty, Comfort, Community, Competence, Fitness, Impact, Morality, Purpose, Recognition, Relatedness, Security, Stimulation | Human needs at stake |
| **Timeframe** (7) | Now, 6 Months, 1 Year, 2 Years, 5 Years, 10 Years, 20 Years | When it happens |
| **Modifier** (6) | Major Breakthrough (-3yr), Accelerated Funding (-2yr), Steady Progress (-1yr), Technical Setback (+1yr), Funding Collapse (+2yr), Regulatory Delay (+3yr) | Timeline adjustments |
| **Technology** (10) | Fault-Tolerant Quantum, Quantum Cryptography, Quantum AI, Quantum Sensing, Quantum Simulation, AGI, Brain-Computer Interface, Synthetic Biology, Fusion Power, Room-Temp Superconductors | Key technologies |
| **Prompt** (6) | The Innovator, The Incumbent, The Citizen, The Edge Case, The Unintended, The Threshold | Story perspectives |

## Create Your Own Deck

This repository is set up to make it easy to create your own card decks using Claude Code. See **[CREATING-CARDS.md](CREATING-CARDS.md)** for a complete guide.

Quick overview:
1. Edit `src/cards-v2.json` with your card data
2. Generate artwork with `node src/generate-images.js`
3. Render cards with `node src/render-final-cards.js`
4. For print: `node src/render-print-cards.js`

## Print Your Deck

### Print-Ready Files

After running `node src/render-print-cards.js`:
- **Location**: `assets/cards-print/`
- **ZIP**: `assets/futures-deck-print-ready.zip`

### Specifications

| Spec | Value |
|------|-------|
| Dimensions | 1050 × 1750 pixels |
| Resolution | 300 DPI |
| Print size | 89mm × 148mm with bleed |
| Trim size | ~80mm × 140mm |
| Bleed | 4mm on all sides |
| Corners | Square (printer die-cuts) |
| Format | PNG (RGB) |

### Recommended Printers

**Netherlands:**
- [DigiDecks](https://digidecks.nl/) - Custom formats, 20-25 deck minimum, email: info@digidecks.nl
- [PeterPrint](https://www.peterprint.nl/speelkaarten-bedrukken.html) - Any format, small runs
- [Maxilia](https://www.maxilia.nl/spellen-bedrukken/speelkaarten-bedrukken/) - B Corp certified, from 25 decks

**International:**
- [MakePlayingCards.com](https://www.makeplayingcards.com/promotional/personalized-tarot-cards.html) - Cheapest for 1-10 decks, ships worldwide
- [Acelion](https://acelioncards.com/custom-tarot-cards/) - Professional quality, 100+ decks

### MakePlayingCards Specs

| Spec | Requirement |
|------|-------------|
| Tarot size | 2.75" × 4.75" (70 × 120mm) |
| Minimum upload | 897 × 1497 pixels |
| DPI | 300 minimum |
| Bleed | 1/8" (36px) per side |
| Safe area | 1/8" (36px) margin |
| Formats | PNG, JPG, PDF |

## Project Structure

```
futures-deck/
├── src/
│   ├── cards-v2.json           # Card definitions
│   ├── generate-images.js      # Generate AI artwork
│   ├── render-final-cards.js   # Render web cards (rounded corners)
│   └── render-print-cards.js   # Render print cards (square corners)
├── assets/
│   ├── artwork/                # Generated AI artwork
│   ├── cards-final/            # Web-ready cards (900×1500)
│   ├── cards-print/            # Print-ready cards (1050×1750)
│   └── futures-deck-print-ready.zip
├── docs/                       # Website
│   ├── explore.html            # AI scenario generator
│   ├── play-v2.html            # Card drawing interface
│   └── examples.html           # Example scenarios
├── api/                        # Vercel serverless functions
│   ├── generate.js             # Claude API for scenarios
│   └── image.js                # MuleRouter API for images
├── CREATING-CARDS.md           # Guide for making your own deck
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Generate card artwork (requires REPLICATE_API_TOKEN)
node src/generate-images.js

# Render web cards
node src/render-final-cards.js

# Render print cards
node src/render-print-cards.js

# Local dev server
npm run dev
```

## Environment Variables

For the web app (Vercel):
- `ANTHROPIC_API_KEY` - Claude API for scenario generation
- `MULEROUTER_API_KEY` - MuleRouter for image generation

For local artwork generation:
- `REPLICATE_API_TOKEN` - Replicate API for Flux image generation

## License

MIT

## Links

- **Live Site**: https://futures-deck.vercel.app
- **GitHub**: https://github.com/JDerekLomas/futures-deck
