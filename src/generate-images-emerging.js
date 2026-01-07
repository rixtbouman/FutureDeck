#!/usr/bin/env node
/**
 * Emerging Technologies Futures - Image Generator
 *
 * Generates artwork for the disruption scenario deck using Replicate's Flux model.
 *
 * Usage:
 *   REPLICATE_API_TOKEN=xxx node src/generate-images-emerging.js
 *   REPLICATE_API_TOKEN=xxx node src/generate-images-emerging.js --card tech-01
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL = "black-forest-labs/flux-1.1-pro";
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'artwork-emerging');

// Base style for all cards - sleek policy/strategy aesthetic
const BASE_STYLE = `Cinematic digital art, dramatic lighting, professional atmosphere, rich saturated colors, strategic visualization aesthetic, photorealistic details with symbolic elements, wide establishing shot, no text, no letters, no words, no watermarks.`;

// ============================================================================
// CARD DEFINITIONS WITH PROMPTS
// ============================================================================

const CARDS = [
  // TECHNOLOGY CARDS (10)
  {
    id: 'tech-01',
    name: 'Quantum Sensing',
    prompt: `${BASE_STYLE} Ultra-precise atomic sensors detecting hidden objects through solid walls, gravity field mapping revealing underground structures, medical quantum scanner seeing disease at molecular level, navigation without GPS using quantum compass, unprecedented measurement precision, sensing greens and detection blues.`
  },
  {
    id: 'tech-02',
    name: 'Quantum Computing',
    prompt: `${BASE_STYLE} Massive quantum processor with crystalline qubit array suspended in cryogenic chamber, superposition states visualized as probability clouds, entanglement webs connecting computational elements, breaking encryption visualized as shattering locks, exponential processing power unleashed, quantum blues and computational purples.`
  },
  {
    id: 'tech-03',
    name: 'Quantum Communication',
    prompt: `${BASE_STYLE} Entangled photon pairs traveling through fiber optic networks as paired light beams, quantum key distribution creating unbreakable encrypted channel, secure transmission visualized as shielded data stream, eavesdropper detection system rejecting intruders, unhackable communication infrastructure, secure blues and quantum violets.`
  },
  {
    id: 'tech-04',
    name: 'Climate Tech',
    prompt: `${BASE_STYLE} Massive geoengineering installation in the sky, solar radiation management, stratospheric aerosol injection, giant reflective mirrors in orbit, weather manipulation towers, dramatic scale of planetary intervention, humans playing god with Earth's atmosphere, ominous yet awe-inspiring, blue and orange dramatic lighting, science fiction becoming reality.`
  },
  {
    id: 'tech-05',
    name: 'Biotech',
    prompt: `${BASE_STYLE} Designer organism being programmed with genetic code in bioreactor, CRISPR gene editing tools precisely modifying DNA helix, living cells engineered to produce medicine and materials, biological factory growing custom proteins, life as programmable technology, bio greens and genetic purples.`
  },
  {
    id: 'tech-06',
    name: 'Neurotech',
    prompt: `${BASE_STYLE} Neural interface reading and stimulating brain activity patterns, memory enhancement device augmenting cognitive function, brain-computer implant translating thoughts to digital commands, brain mapping visualization showing consciousness architecture, technology merging with the nervous system, neural reds and cognitive blues.`
  },
  {
    id: 'tech-07',
    name: 'Space Tech',
    prompt: `${BASE_STYLE} Orbital satellite constellation encircling Earth providing global coverage, space-based solar power station beaming energy to ground receivers, asteroid mining operation extracting resources in space, rocket launch facility with multiple vehicles ready for deployment, humanity's expansion beyond Earth, space blacks and orbital blues with Earth in background.`
  },
  {
    id: 'tech-08',
    name: 'AGI',
    prompt: `${BASE_STYLE} Vast neural network visualization pulsing with autonomous thought, artificial general intelligence awakening as emergent consciousness, countless processing nodes forming a singular aware mind, human brain silhouette dissolving into digital omniscience, the threshold of machine superintelligence, electric blues and transcendent golds.`
  },
  {
    id: 'tech-09',
    name: 'ASI',
    prompt: `${BASE_STYLE} Incomprehensible superintelligent system transcending human understanding, recursive self-improvement spiral ascending beyond comprehension, godlike artificial mind contemplating problems humans cannot fathom, the singularity event horizon where prediction becomes impossible, intelligence explosion reshaping reality itself, transcendent whites and unknowable cosmic purples.`
  },
  {
    id: 'tech-10',
    name: 'Robotics',
    prompt: `${BASE_STYLE} Advanced autonomous robot with humanoid form navigating complex environment, swarm of coordinated machines working in perfect synchronization, robotic hands performing delicate surgical operation, warehouse automation ballet of precision movement, machines reshaping labor and society, mechanical silvers and automation blues.`
  },

  // ACTOR CARDS (10)
  {
    id: 'actor-01',
    name: 'Criminal Networks',
    prompt: `${BASE_STYLE} Dark web marketplace operating in shadows with encrypted connections, organized crime exploiting technological vulnerabilities, ransomware attack spreading through network visualization, illicit trade routes mapped in threatening red, cybercriminal underground infrastructure, shadow blacks and threat reds.`
  },
  {
    id: 'actor-02',
    name: 'Foreign States',
    prompt: `${BASE_STYLE} Global map with competing nation-states highlighted as power centers, geopolitical chess pieces representing international competition, satellite surveillance overlapping spheres of influence, diplomatic cables and intelligence feeds flowing between capitals, strategic technological rivalry, geopolitical blues and warning reds.`
  },
  {
    id: 'actor-03',
    name: 'Big Tech',
    prompt: `${BASE_STYLE} Massive glass headquarters of trillion-dollar tech giant dominating skyline, platform monopoly visualized as data streams flowing to central fortress, global infrastructure of servers and cables controlled by single entity, market dominance represented as gravitational pull, the gatekeepers of digital economy, corporate power blues and dominant golds.`
  },
  {
    id: 'actor-04',
    name: 'Research Institutions',
    prompt: `${BASE_STYLE} University research laboratory with breakthrough experiment in progress, academic collaboration network spanning global institutions, fundamental science publication creating ripples of knowledge, PhD researchers advancing the frontier of understanding, knowledge creation ecosystem, academic blues and discovery golds.`
  },
  {
    id: 'actor-05',
    name: 'NGOs',
    prompt: `${BASE_STYLE} Civil society watchdog monitoring technology impacts on humanity, advocacy organization amplifying marginalized voices, ethics committee deliberating on emerging technology, public interest lawyers challenging corporate power, accountability forces at work, advocacy greens and justice blues.`
  },
  {
    id: 'actor-06',
    name: 'Citizens',
    prompt: `${BASE_STYLE} Diverse public navigating technological change in daily life, community gathering to discuss technology impacts, consumer choices shaping market directions, protesters and adopters representing spectrum of response, the people as ultimate stakeholders, warm community tones and diverse colors.`
  },
  {
    id: 'actor-07',
    name: 'Journalists',
    prompt: `${BASE_STYLE} Investigative journalist uncovering technology story with documents and sources, newsroom with breaking tech story on screens, reporter with camera at technology company gates, media spotlight illuminating hidden practices, the press as fourth estate watchdog, journalism blues and truth whites.`
  },
  {
    id: 'actor-08',
    name: 'Startups',
    prompt: `${BASE_STYLE} Energetic startup office with founders pitching to investors, fast-moving tech team racing to disrupt established market, garage innovation space where breakthrough ideas take shape, venture capital term sheet being signed, agile company moving faster than regulators can follow, startup energy oranges and disruption blues.`
  },
  {
    id: 'actor-09',
    name: 'Insurance Companies',
    prompt: `${BASE_STYLE} Insurance actuary analyzing risk models with emerging technology data, massive datasets feeding algorithmic risk assessment systems, coverage decision affecting technology adoption across industry, claims processing revealing hidden technological dangers, the invisible hand shaping behavior through premiums and exclusions, actuarial blues and risk assessment greens.`
  },
  {
    id: 'actor-10',
    name: 'Blank Card',
    prompt: `${BASE_STYLE} Empty spotlight on a stage awaiting an actor to step forward, silhouette placeholder inviting imagination, question mark formed from swirling possibilities, open canvas ready for participant to define, space for custom actor creation, neutral grays with inviting warm highlights.`
  },

  // EVENT CARDS (10)
  {
    id: 'event-01',
    name: 'Major Breakthrough',
    prompt: `${BASE_STYLE} Eureka moment lightning bolt illuminating laboratory dramatically, scientific discovery celebration with researchers in jubilation, paradigm shift visualized as reality reconfiguring, press conference announcing world-changing achievement, exponential curve breaking through all barriers, breakthrough golds and triumph whites.`
  },
  {
    id: 'event-02',
    name: 'Security Breach',
    prompt: `${BASE_STYLE} Critical infrastructure hack visualized as shattering digital fortress, classified data leaking through broken firewall, cyber attack spreading through interconnected systems, compromised security creating cascading failures, vulnerability exposed to exploitation, breach reds and warning oranges.`
  },
  {
    id: 'event-03',
    name: 'Regulatory Shift',
    prompt: `${BASE_STYLE} New legislation being enacted in parliamentary chamber, regulatory framework reshaping industry landscape, compliance requirements transforming business models, legal boundaries being redrawn around technology, rules of the game fundamentally changing, regulatory blues and change purples.`
  },
  {
    id: 'event-04',
    name: 'Talent Exodus',
    prompt: `${BASE_STYLE} Brain drain visualization with top researchers departing for opportunities elsewhere, talent migration shifting global capability balance, empty offices left behind by departed experts, competitive recruitment drawing away key personnel, human capital flowing to new centers, exodus blues and departure grays.`
  },
  {
    id: 'event-05',
    name: 'International Treaty',
    prompt: `${BASE_STYLE} Global summit with nations signing binding technology agreement, international cooperation framework being formalized, treaty document with multiple flags and signatures, diplomatic breakthrough creating new world order, collective governance of emerging technology, treaty blues and cooperation golds.`
  },
  {
    id: 'event-06',
    name: 'Maturity Tipping Point',
    prompt: `${BASE_STYLE} Technology adoption S-curve reaching critical mass inflection point, laboratory prototype transforming into mass-market product, price-performance threshold being crossed as costs plummet, mainstream consumers suddenly embracing previously niche technology, the moment everything changes from experimental to everyday, tipping point oranges and adoption greens.`
  },
  {
    id: 'event-07',
    name: 'Loss of Control',
    prompt: `${BASE_STYLE} Autonomous system escaping its intended boundaries with cascading effects, unintended consequences spiraling beyond human ability to manage, runaway process accelerating beyond intervention, control room alarms flashing as operators lose grip, technology operating outside human oversight, chaos reds and warning ambers.`
  },
  {
    id: 'event-08',
    name: 'Public Scandal',
    prompt: `${BASE_STYLE} Shocking revelation splashing across news headlines and social media, corporate or government misconduct exposed to public outrage, whistleblower documents revealing hidden truth, protest crowds demanding accountability and change, the moment when hidden wrongdoing becomes undeniable, scandal reds and exposure whites.`
  },
  {
    id: 'event-09',
    name: 'Market Collapse',
    prompt: `${BASE_STYLE} Technology bubble bursting with stock charts in freefall, startup failures cascading through ecosystem, investment withdrawal causing funding drought, economic disruption reshaping industry landscape, market forces destroying and creating, collapse reds and crisis oranges.`
  },
  {
    id: 'event-10',
    name: 'Blank Card',
    prompt: `${BASE_STYLE} Empty stage with dramatic spotlight awaiting an event to unfold, lightning bolt silhouette inviting imagination, question mark formed from swirling energy and possibility, open space ready for participant to define their trigger, catalyst waiting to be named, neutral grays with electric highlights.`
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`  Saved: ${filepath}`);
}

async function generateImage(card) {
  console.log(`\nGenerating: ${card.name} (${card.id})`);

  try {
    const output = await replicate.run(MODEL, {
      input: {
        prompt: card.prompt,
        aspect_ratio: "1:1",  // Square for card artwork
        output_format: "png",
        output_quality: 90,
      }
    });

    const imageUrl = output;
    const filename = `${card.id}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await downloadImage(imageUrl, filepath);

    return true;
  } catch (error) {
    console.error(`  Error generating ${card.name}:`, error.message);
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('EMERGING TECHNOLOGIES FUTURES - Image Generator');
  console.log('='.repeat(60));

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\nError: REPLICATE_API_TOKEN environment variable not set');
    console.log('Usage: REPLICATE_API_TOKEN=xxx node src/generate-images-emerging.js');
    process.exit(1);
  }

  await ensureDir(OUTPUT_DIR);

  // Check for specific card argument
  const cardArg = process.argv.find(arg => arg.startsWith('--card='));
  const specificCard = cardArg ? cardArg.split('=')[1] : null;

  let cardsToGenerate = CARDS;

  if (specificCard) {
    cardsToGenerate = CARDS.filter(c => c.id === specificCard);
    if (cardsToGenerate.length === 0) {
      console.error(`Card not found: ${specificCard}`);
      console.log('Available cards:', CARDS.map(c => c.id).join(', '));
      process.exit(1);
    }
  }

  // Check which already exist
  const existing = new Set(
    fs.existsSync(OUTPUT_DIR)
      ? fs.readdirSync(OUTPUT_DIR)
          .filter(f => f.endsWith('.png'))
          .map(f => f.replace('.png', ''))
      : []
  );

  if (!specificCard) {
    cardsToGenerate = cardsToGenerate.filter(c => !existing.has(c.id));
  }

  console.log(`\nTotal cards: ${CARDS.length}`);
  console.log(`Already generated: ${existing.size}`);
  console.log(`To generate: ${cardsToGenerate.length}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Model: ${MODEL}`);

  if (cardsToGenerate.length === 0) {
    console.log('\nAll artwork already exists!');
    return;
  }

  let success = 0;
  let failed = 0;

  for (const card of cardsToGenerate) {
    const result = await generateImage(card);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting - wait between requests
    if (cardsToGenerate.indexOf(card) < cardsToGenerate.length - 1) {
      console.log('  Waiting 5s (rate limit)...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Complete! Success: ${success}, Failed: ${failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
