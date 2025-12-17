# Futures Deck

A speculative oracle for exploring possible futures. Draw cards, build spreads, and let AI interpret scenarios.

## Play Online

**[Play the Digital Version](https://jdereklomas.github.io/futures-deck/play.html)**

Draw cards interactively and generate AI prompts for scenario interpretation.

## About

Futures Deck is a card-based foresight tool that helps people imagine and explore possible futures. Each card represents a different dimension of a scenario:

- **Wellbeing (8 cards)** - Human needs: Autonomy, Impact, Relatedness, Stimulation, Security, Purpose, Competence, Comfort
- **Arc (4 cards)** - Trajectory of change: Growth, Collapse, Transformation, Discipline
- **Terrain (7 cards)** - Setting: Ocean, City, Home, Wilderness, Workplace, School, Hospital
- **Outcome (4 cards)** - What emerges: Ritual, Device, Startup, Government Service
- **Timeframe (6 cards)** - When: Now, 6 Months, 1 Year, 2 Years, 5 Years, 10 Years
- **Modifier (2 cards)** - Inflection: Breakthrough, Setback
- **Technology (4 cards)** - Tech focus: AI, Quantum, Biotech, Robotics

**35 vision cards + 4 prompt cards = 39 total**

## How It Works

1. **Draw cards** to build a spread (or use the digital version to draw randomly)
2. **Photograph the spread** or copy the card descriptions
3. **Send to AI** (ChatGPT, Claude, etc.) to generate a detailed scenario
4. **Discuss and explore** the implications of this possible future

The cards include machine-readable prompts that help AI understand how to interpret each card in context.

## Print Your Own Deck

**[Print-Ready Cards (PDF)](https://jdereklomas.github.io/futures-deck/print.html)**

- Poker-sized cards (2.5" × 3.5")
- Print double-sided, flip on long edge
- Category-colored panels for easy sorting
- Includes card backs

## Project Structure

```
futures-deck/
├── docs/                    # GitHub Pages site
│   ├── index.html          # Main documentation
│   ├── play.html           # Digital card game
│   ├── print.html          # Printable card sheets
│   └── cards/              # Card artwork for web
├── assets/
│   └── deck-artwork/       # Source card artwork (PNG)
└── src/
    └── generate-*.js       # Image generation scripts
```

## Card Art Style

Art deco engraving illustration with hand-tinted vintage colors, intricate linework, ornate geometric borders, and tarot card aesthetic. Generated using Flux 1.1 Pro via Replicate.

## Links

- **Play Online**: https://jdereklomas.github.io/futures-deck/play.html
- **Documentation**: https://jdereklomas.github.io/futures-deck/
- **Print Cards**: https://jdereklomas.github.io/futures-deck/print.html

## License

MIT
