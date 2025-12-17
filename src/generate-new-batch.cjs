#!/usr/bin/env node
/**
 * Generate new Futures Deck cards using Replicate (Flux 1.1 Pro)
 */

const fs = require('fs');
const path = require('path');

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN environment variable required');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'deck-artwork');

const STYLE = `art deco engraving illustration, hand-tinted vintage colors, intricate linework, ornate geometric border, symmetrical composition, tarot card aesthetic, muted jewel tones with gold accents, woodcut texture, 1920s poster art style, symbolic imagery, high detail`;

const NEW_CARDS = [
  {
    id: 'arc-04',
    name: 'Discipline',
    prompt: `${STYLE}, central figure of a stoic architect with compass and ruler, rigid geometric structures, ordered columns and arches, scales of balance, clockwork mechanisms, controlled growth patterns, pruned bonsai tree, martial arts master in focused stance, steel blue and bronze palette`
  },
  {
    id: 'object-03',
    name: 'Startup',
    prompt: `${STYLE}, central image of a rocket launching from a garage workshop, lightbulb moment with radiating sparks, napkin sketches becoming blueprints, phoenix rising from scattered papers, small seed growing into mighty oak, garage door opening to reveal the future, energetic orange and electric blue palette`
  },
  {
    id: 'time-02',
    name: 'Now',
    prompt: `${STYLE}, central figure standing at crossroads with paths radiating outward, the present moment as a glowing point, hourglass with sand frozen mid-fall, lightning bolt striking the ground, eye wide open in awareness, hands reaching out to grasp opportunity, vibrant present-tense gold and white palette`
  },
  {
    id: 'time-03',
    name: '6 Months',
    prompt: `${STYLE}, central calendar showing half a year, seasons changing from winter to summer or summer to winter, half-bloomed flower, moon in half phase, short bridge over a stream, sprouting seeds showing early growth, near horizon with visible destination, soft transitional blue-green palette`
  },
  {
    id: 'time-04',
    name: '1 Year',
    prompt: `${STYLE}, central zodiac wheel completing one rotation, four seasons represented in quadrants, tree showing full cycle of leaves, snake eating its tail (ouroboros), single candle burning through, earth orbiting sun once, anniversary ribbon, warm amber and seasonal palette`
  },
  {
    id: 'time-05',
    name: '2 Years',
    prompt: `${STYLE}, central image of paired hourglasses, toddler taking first steps, building foundation with first floor rising, seeds becoming saplings, two moons orbiting, medium-term plans on drafting table, relationship deepening over time, steady growth green and brown palette`
  },
  {
    id: 'time-06',
    name: '10 Years',
    prompt: `${STYLE}, central figure looking at distant mountain peak, decade marked by roman numeral X, child becoming adult silhouette, acorn becoming oak tree, city skyline transformed, technology generations evolving, long winding road disappearing over horizon, deep purple and silver palette`
  },
  {
    id: 'mod-02',
    name: 'Setback',
    prompt: `${STYLE}, central figure pushing boulder up hill, cracked foundation requiring repair, detour sign on the path, winter frost on spring buds, broken bridge being rebuilt, phoenix in ashes before rising, resilience emerging from difficulty, storm clouds with silver lining, muted grey-blue with hints of hope`
  }
];

async function generateCard(card) {
  console.log(`Generating ${card.name}...`);

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-1.1-pro',
      input: {
        prompt: card.prompt,
        aspect_ratio: '4:5',
        output_format: 'png',
        output_quality: 90,
        safety_tolerance: 5,
        prompt_upsampling: true
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(`Error starting ${card.name}:`, data);
    return null;
  }

  console.log(`  Started prediction: ${data.id}`);

  // Poll for completion
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
    });
    const result = await checkResponse.json();

    process.stdout.write('.');

    if (result.status === 'succeeded' && result.output) {
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      const imgResponse = await fetch(imageUrl);
      const buffer = await imgResponse.arrayBuffer();
      const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`\n  Saved: ${outputPath}`);
      return outputPath;
    }

    if (result.status === 'failed') {
      console.error(`\n  Failed: ${result.error}`);
      return null;
    }
  }

  console.error('\n  Timeout');
  return null;
}

async function main() {
  console.log(`Generating ${NEW_CARDS.length} new cards...\n`);

  for (const card of NEW_CARDS) {
    await generateCard(card);
    // Small delay between cards
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nDone!');
}

main().catch(console.error);
