#!/usr/bin/env node
/**
 * Futures Deck - Image Generator
 *
 * Generates artwork for all cards using Replicate's Flux model.
 *
 * Usage:
 *   REPLICATE_API_TOKEN=xxx node src/generate-images.js
 *   REPLICATE_API_TOKEN=xxx node src/generate-images.js --card arc-01
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
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'artwork');

// Base style for all cards - contemporary futurist aesthetic
const BASE_STYLE = `Cinematic digital art, dramatic lighting, contemporary symbols, evocative atmosphere, rich saturated colors, mysterious mood, oracle card aesthetic, photorealistic details with symbolic elements, wide establishing shot, no text, no letters, no words, no watermarks.`;

// ============================================================================
// CARD DEFINITIONS WITH PROMPTS
// ============================================================================

const CARDS = [
  // ARC CARDS (4)
  {
    id: 'arc-01',
    name: 'Growth',
    prompt: `${BASE_STYLE} Towering glass skyscrapers reaching into golden sunset clouds, exponential growth curves made of light beams ascending into the sky, holographic stock charts floating in the air, lush vertical gardens cascading down building facades, delivery drones in formation, abundance and technological expansion, optimistic future city.`
  },
  {
    id: 'arc-02',
    name: 'Collapse',
    prompt: `${BASE_STYLE} Abandoned shopping mall overgrown with vines and wildflowers, cracked highway overpass with nature reclaiming concrete, rusted shipping containers half-buried, empty office tower with broken windows reflecting sunset, melancholic post-apocalyptic beauty, twilight atmosphere, nature triumphant over civilization.`
  },
  {
    id: 'arc-03',
    name: 'Discipline',
    prompt: `${BASE_STYLE} Surveillance cameras on geometric white poles watching over orderly crowds, facial recognition grid patterns overlaid in the air, QR codes and holographic access badges floating, uniform minimalist architecture in perfect rows, algorithmic control visualization, cold blue and white lighting, dystopian order.`
  },
  {
    id: 'arc-04',
    name: 'Transformation',
    prompt: `${BASE_STYLE} Human silhouette dissolving into digital particles and organic butterfly wings, DNA helix transforming into fiber optic light streams, chrysalis pod made of circuit boards opening, old industrial world merging with biotech future, metamorphosis and evolution, vibrant ethereal purples and cyans.`
  },

  // TERRAIN CARDS (16)
  {
    id: 'terrain-01',
    name: 'Agriculture',
    prompt: `${BASE_STYLE} Vertical hydroponic farm towers glowing with purple LED grow lights at dusk, robotic arms harvesting pristine vegetables, lab-grown meat cultures in glass bioreactors, ancient wheat field meeting futuristic greenhouse dome, seed vault door in arctic ice, the future of food production.`
  },
  {
    id: 'terrain-02',
    name: 'Warfare',
    prompt: `${BASE_STYLE} Swarm of autonomous drones casting geometric shadows over barren landscape, cyber command center with holographic tactical maps, soldier silhouette in exoskeleton armor, missile defense dome shimmering with energy shield, digital battlefield with data streams, military technology of tomorrow.`
  },
  {
    id: 'terrain-03',
    name: 'Healthcare',
    prompt: `${BASE_STYLE} Robotic surgeon arms performing precision operation in sterile blue light, DNA double helix being edited with glowing CRISPR tools, holographic full-body diagnostic scan, futuristic hospital pod with monitoring screens, the medical frontier, clean whites and clinical blues.`
  },
  {
    id: 'terrain-04',
    name: 'Education',
    prompt: `${BASE_STYLE} Virtual reality headset revealing holographic classroom with floating equations, AI tutor as friendly robot teaching diverse children, digital achievement badges orbiting student, ancient library shelves morphing into infinite digital screens, brain-computer interface for learning, warm knowledge-glow.`
  },
  {
    id: 'terrain-05',
    name: 'The Ocean',
    prompt: `${BASE_STYLE} Floating city platform on calm turquoise ocean at golden hour, underwater kelp forest farm with diving suits, massive cargo ships in shipping lanes viewed from above, offshore wind turbines at sunset, whale swimming past submarine fiber optic cables, maritime future, deep blues and golds.`
  },
  {
    id: 'terrain-06',
    name: 'Governance',
    prompt: `${BASE_STYLE} Digital voting booth with blockchain verification hologram, circular parliament chamber with AI advisor screens, protest signs mixed with social media icons floating, algorithmic decision trees projected on classical government building, citizens connected by network visualization lines, democracy reimagined.`
  },
  {
    id: 'terrain-07',
    name: 'Entertainment',
    prompt: `${BASE_STYLE} Person in VR headset lost in immersive gaming world with fantasy creatures, streaming platform interface with infinite content scrolling, concert venue with spectacular drone light show, influencer ring light and camera creating content bubble, social media notification hearts floating, neon pleasure dome.`
  },
  {
    id: 'terrain-08',
    name: 'Transport',
    prompt: `${BASE_STYLE} Hyperloop tube cutting through mountain landscape at sunset, autonomous electric vehicles on smart illuminated road, cargo drone swarm in perfect formation against sky, futuristic airport terminal with holographic departure boards, bike-sharing station in green urban plaza, movement and mobility.`
  },
  {
    id: 'terrain-09',
    name: 'Religion',
    prompt: `${BASE_STYLE} Ancient gothic cathedral with holographic stained glass projections, meditation app interface floating in peaceful temple garden, pilgrims walking with GPS devices to sacred site, sacred symbols from multiple faiths arranged in harmonious mandala, candles and prayer beads with soft glow, spirituality meets technology.`
  },
  {
    id: 'terrain-10',
    name: 'Commerce',
    prompt: `${BASE_STYLE} Cryptocurrency coins orbiting a holographic shopping cart, stock exchange trading floor with dramatic digital displays, contactless payment wave emanating from smartphone, global supply chain network visualized as glowing threads across Earth, retail store with augmented reality mirrors, money and value flowing.`
  },
  {
    id: 'terrain-11',
    name: 'Startups',
    prompt: `${BASE_STYLE} Pitch deck presentation on massive screen in modern glass office, coworking space with exposed brick and motivational neon signs, term sheet document with dramatic signature moment, MVP prototype glowing on laptop in garage, accelerator demo day stage with audience, entrepreneurship energy and ambition.`
  },
  {
    id: 'terrain-12',
    name: 'Arts & Culture',
    prompt: `${BASE_STYLE} NFT gallery with floating digital artworks in void space, film festival red carpet with spotlights, traditional publishing press meeting holographic e-reader, street artist creating vibrant mural on urban wall, museum exhibition with contemplative visitors, creative expression and cultural heritage.`
  },
  {
    id: 'terrain-13',
    name: 'Energy',
    prompt: `${BASE_STYLE} Massive solar panel array stretching to horizon reflecting sunset, battery storage facility glowing with stored charge indicators, oil refinery silhouette at golden hour, power grid transmission lines against dramatic sky, smart meter dashboard display showing consumption, electricity and power infrastructure.`
  },
  {
    id: 'terrain-14',
    name: 'Housing',
    prompt: `${BASE_STYLE} 3D-printed house emerging from giant printer at construction site, smart home interface hologram controlling lights and temperature, architectural blueprint with AR overlay showing finished building, construction crane lifting modular housing unit, cozy living room with ambient smart lighting, shelter and home.`
  },
  {
    id: 'terrain-15',
    name: 'Labor',
    prompt: `${BASE_STYLE} Gig worker on electric scooter with glowing delivery bag at night, robotic arm working alongside human on factory floor, union hall meeting with workers linking arms, remote work home office with multiple screens and coffee, automation timeline showing job transformation, work and employment evolution.`
  },
  {
    id: 'terrain-16',
    name: 'Climate',
    prompt: `${BASE_STYLE} Carbon capture facility with massive pipes reaching into stormy sky, weather satellite orbiting Earth showing climate data, rewilding zone with wolves returning to forest, emissions trading dashboard with rising numbers, climate adaptation seawall protecting coastal city, environmental urgency and hope.`
  },

  // OBJECT CARDS (10)
  {
    id: 'object-01',
    name: 'Device',
    prompt: `${BASE_STYLE} Smartphone floating and emanating holographic interface displays, smartwatch monitoring vital signs with heart rate visualization, wireless earbuds connected to visible brain waves, medical implant glowing softly under translucent skin, smart home devices arranged ceremonially, technological artifacts of daily life.`
  },
  {
    id: 'object-02',
    name: 'Law',
    prompt: `${BASE_STYLE} Gavel striking on digital screen creating ripple effect, legal documents with glowing blockchain verification seal, supreme court building with holographic scales of justice, treaty scroll unfurling with binary code watermark, regulatory compliance checklist floating, rules and formal authority.`
  },
  {
    id: 'object-03',
    name: 'Ritual',
    prompt: `${BASE_STYLE} Wedding rings exchanged before smartphone altar livestreaming, graduation caps thrown in celebration freeze-frame, corporate team building circle with hands joined, morning coffee ritual as sacred mindful act, memorial candles lit creating warm glow, meaningful repetition and ceremony.`
  },
  {
    id: 'object-04',
    name: 'Beverage',
    prompt: `${BASE_STYLE} Nootropic smart drink in sleek minimalist bottle glowing, artisan coffee with perfect latte art next to laptop, energy drink cans in vibrant neon colors arranged, herbal adaptogen tea ceremony with steam rising, protein shake in gym setting with weights, liquids that transform us.`
  },
  {
    id: 'object-05',
    name: 'Vehicle',
    prompt: `${BASE_STYLE} Sleek electric car charging at illuminated station at night, personal flying pod concept hovering over city, massive cargo ship viewed from dramatic low angle, emergency helicopter in dramatic rescue flight, recreational sailboat on open water at sunset, machines of movement.`
  },
  {
    id: 'object-06',
    name: 'Building',
    prompt: `${BASE_STYLE} Parametric architecture with flowing organic curved forms, public library with floor-to-ceiling glass walls revealing readers, shopping mall atrium with natural skylights, industrial factory floor with robotic assembly lines, sacred temple built with modern sustainable materials, structures that contain human activity.`
  },
  {
    id: 'object-07',
    name: 'Garment',
    prompt: `${BASE_STYLE} Smart fabric clothing with embedded LED sensors glowing, high-visibility work vest with tech patches and tools, luxury fashion runway piece dramatic and sculptural, protective hazmat suit with reflective visor, athletic wear with visible biometric tracking display, what we wear defines us.`
  },
  {
    id: 'object-08',
    name: 'Game',
    prompt: `${BASE_STYLE} Esports arena with massive screens and cheering crowd silhouettes, strategic board game pieces on world map, game controller and VR headset floating artistically, colorful arcade game interface elements, competitive energy and focus.`
  },
  {
    id: 'object-09',
    name: 'Plant',
    prompt: `${BASE_STYLE} Glowing bioluminescent plant in laboratory setting, vertical farm with rows of lettuce under purple grow lights, botanical specimens in glass terrariums, seeds germinating in petri dishes, lush green vegetation and seedlings, nature and cultivation.`
  },
  {
    id: 'object-10',
    name: 'Advertisement',
    prompt: `${BASE_STYLE} Targeted ad popup floating from smartphone screen, Times Square digital billboards blazing at night, influencer creating sponsored content with ring light, product placement seamlessly integrated in living room, retargeting pixels visualized as following eyes in digital space, commercial persuasion everywhere.`
  },

  // WELLBEING CARDS (13)
  {
    id: 'well-01',
    name: 'Autonomy',
    prompt: `${BASE_STYLE} Person breaking free from puppet strings made of social media icons, autonomous vehicle passenger relaxing and reading, solo traveler at crossroads with multiple glowing paths, resignation letter floating away dramatically in wind, personal choice dashboard with freedom options, independence and self-direction.`
  },
  {
    id: 'well-02',
    name: 'Beauty',
    prompt: `${BASE_STYLE} Spectacular sunset over pristine mountain landscape reflected in person's eyes, art gallery visitor having transcendent emotional experience, concert crowd in rapturous joy with light beams, interior design magazine spread of perfect room, botanical garden in full magnificent bloom, aesthetic pleasure and wonder.`
  },
  {
    id: 'well-03',
    name: 'Comfort',
    prompt: `${BASE_STYLE} Perfect ergonomic chair in serene minimalist home office, climate control smart thermostat creating ideal temperature bubble, luxury mattress in peaceful bedroom with soft lighting, noise-canceling headphones creating bubble of silence, spa treatment room with warm ambient glow, physical ease and relaxation.`
  },
  {
    id: 'well-04',
    name: 'Community',
    prompt: `${BASE_STYLE} Neighborhood block party with diverse joyful faces gathering, sports team in matching uniforms celebrating victory together, congregation in fellowship hall sharing meal, union members linking arms in solidarity, alumni reunion with nostalgic embraces, group belonging and shared identity.`
  },
  {
    id: 'well-05',
    name: 'Competence',
    prompt: `${BASE_STYLE} Craftsperson's skilled hands working with precision tools in workshop, professional certification badge glowing with achievement, athlete in perfect form mid-motion, skill assessment hologram showing mastery levels, workshop filled with specialized well-used equipment, capability and expertise earned.`
  },
  {
    id: 'well-06',
    name: 'Fitness',
    prompt: `${BASE_STYLE} Runner silhouette on mountain trail at golden sunrise, modern gym with exercise equipment as sculptural installation, holographic health monitoring display showing vitality metrics, running shoes and water bottle, sports and wellness energy.`
  },
  {
    id: 'well-07',
    name: 'Impact',
    prompt: `${BASE_STYLE} Ripples spreading from dropped stone in still water expanding outward, petition with thousands of glowing signatures, volunteer group making visible difference in community, performance review showing significant contributions highlighted, project completion celebration with team, making a meaningful difference.`
  },
  {
    id: 'well-08',
    name: 'Morality',
    prompt: `${BASE_STYLE} Ethical sourcing certification label in dramatic close-up, voting booth with civic duty light streaming in, charity donation creating visible positive impact ripple, conscience visualization as guiding inner light, fair trade coffee beans being weighed on golden scales, living according to values.`
  },
  {
    id: 'well-09',
    name: 'Purpose',
    prompt: `${BASE_STYLE} Golden compass pointing toward meaningful glowing horizon, mission statement illuminated on wall of inspiring workspace, vision board with life goals connected by light threads, career roadmap stretching into bright future, mountain peak representing achievement at golden hour, direction and meaning in life.`
  },
  {
    id: 'well-10',
    name: 'Recognition',
    prompt: `${BASE_STYLE} Trophy and award ceremony with dramatic spotlights on winner, social media likes and hearts floating upward in stream, handwritten thank you card being read with emotion, promotion announcement on office screen with celebration, standing ovation from appreciative audience, being seen and valued.`
  },
  {
    id: 'well-11',
    name: 'Relatedness',
    prompt: `${BASE_STYLE} Family photo album pages turning with warm memories glowing, anniversary celebration intimate dinner table with candles, contacts list on phone showing close connections with faces, gift exchange moment between dear friends, shared calendar with quality time blocked in gold, caring close relationships.`
  },
  {
    id: 'well-12',
    name: 'Security',
    prompt: `${BASE_STYLE} Insurance policy document with protective golden shield emanating, emergency fund bank statement showing healthy savings, home security system keypad with armed status, employment contract signed and sealed with stability, safe deposit box opening to reveal valuables, safety and predictability assured.`
  },
  {
    id: 'well-13',
    name: 'Stimulation',
    prompt: `${BASE_STYLE} Travel destination collage with exotic locations calling, event tickets fanned out excitingly with anticipation glow, new release notification alert creating excitement burst, adventure gear ready for expedition departure, learning platform with endless fascinating courses, novelty and excitement beckoning.`
  },

  // TIMEFRAME CARDS (7)
  {
    id: 'time-01',
    name: 'Now',
    prompt: `${BASE_STYLE} Present moment captured as frozen time bubble with world paused, today's date on calendar glowing urgently, breaking news ticker live broadcast monitors, current status indicator pulsing with immediate energy, now playing music visualizer in real-time, the present instant demanding attention.`
  },
  {
    id: 'time-02',
    name: '6 Months',
    prompt: `${BASE_STYLE} Half-year calendar pages turning in sequence, next quarter planning meeting with timeline projection, seasonal change montage from current to coming weather, near-term forecast chart with approaching events, upcoming countdown timer ticking, the imminent accessible future.`
  },
  {
    id: 'time-03',
    name: '1 Year',
    prompt: `${BASE_STYLE} Full orbit of Earth around Sun visualized as light trail, annual review document with year's achievements, next year calendar fresh blank and full of potential, twelve month projection chart with milestones, birthday candles marking complete cycle, one full revolution.`
  },
  {
    id: 'time-04',
    name: '2 Years',
    prompt: `${BASE_STYLE} Product roadmap stretching two years ahead with phases, election cycle timeline with campaign milestones, apartment lease agreement term visualized, technology evolution over 24 months comparison, near future city concept emerging from present, developing momentum building.`
  },
  {
    id: 'time-05',
    name: '5 Years',
    prompt: `${BASE_STYLE} Strategic five-year plan on executive desk with vision, child aging from kid to teen in growth montage, technology generations evolving through iterations, mortgage milestone marker along long path, career trajectory arc rising with achievements, substantial meaningful change ahead.`
  },
  {
    id: 'time-06',
    name: '10 Years',
    prompt: `${BASE_STYLE} Decade timeline with major milestones marked along path, infrastructure megaproject completion artist vision, long-term investment growth chart with compound curve, generational shift represented as passing torch, your future self glimpsed in mirror ahead, a full transformative decade.`
  },
  {
    id: 'time-07',
    name: '20 Years',
    prompt: `${BASE_STYLE} Generation gap visualized as bridge between eras connecting, climate projection maps of 2040s world changed, children becoming parents in life cycle montage, retirement horizon visible on distant peaceful shore, unrecognizable future cityscape of possibilities, profound long-term transformation.`
  },

  // MODIFIER CARDS (6)
  {
    id: 'mod-01',
    name: 'Major Breakthrough',
    prompt: `${BASE_STYLE} Eureka moment lightning bolt illuminating laboratory dramatically, scientific discovery celebration with champagne and joy, patent filing documents glowing with innovation light, press conference announcing world-changing breakthrough, exponential curve shooting upward breaking through ceiling, acceleration and quantum leap, bright optimistic greens.`
  },
  {
    id: 'mod-02',
    name: 'Accelerated Funding',
    prompt: `${BASE_STYLE} Venture capital term sheet being signed with golden pen, government budget allocation expanding pie chart, defense contract award ceremony with flags, money flowing like river of gold into project funnel, investment surge visualization as rising tide, massive resource mobilization, abundant greens and golds.`
  },
  {
    id: 'mod-03',
    name: 'Steady Progress',
    prompt: `${BASE_STYLE} Quarterly progress report with satisfying checkmarks in sequence, milestone completion notice board all green, team expansion welcome banner with new faces, steady upward graph line moving reliably forward, on-track project timeline with current marker, reliable consistent advancement, calm reassuring greens.`
  },
  {
    id: 'mod-04',
    name: 'Technical Setback',
    prompt: `${BASE_STYLE} Bug tracking system screen filled with red error warnings, failed test report document with disappointing results, engineering post-mortem meeting room with serious faces, debugging code screen with frustrating errors, obstacle barrier blocking the path forward, unexpected challenge arising, amber warning tones.`
  },
  {
    id: 'mod-05',
    name: 'Funding Collapse',
    prompt: `${BASE_STYLE} Layoff announcement email on screen delivering bad news, project cancellation notice torn and crumpled, budget cut memo with red ink slashing through, empty office after downsizing with abandoned desks, money draining away visualization as falling coins, resource withdrawal crisis, stressed reds.`
  },
  {
    id: 'mod-06',
    name: 'Regulatory Delay',
    prompt: `${BASE_STYLE} Official documents stamped with pending status, government office with towering stacks of paperwork, bureaucratic maze of long corridors, red ribbon tape wrapped around project files, institutional clock showing slow passage of time, amber and red warning tones.`
  },

  // TECHNOLOGY CARDS (10)
  {
    id: 'tech-01',
    name: 'Fault-Tolerant Quantum',
    prompt: `${BASE_STYLE} Massive quantum computer with glowing blue qubits suspended in crystalline array, error correction codes visualized as protective geometric shields, cryogenic cooling chambers with frost and mist, IBM or Google-style quantum processor close-up, the holy grail of computing achieved, electric blues and deep purples.`
  },
  {
    id: 'tech-02',
    name: 'Quantum Cryptography',
    prompt: `${BASE_STYLE} Entangled photons traveling through fiber optic cables as paired light streams, quantum key distribution system with unhackable lock visualization, secure channel forming between distant towers, eavesdropper being detected and rejected, unbreakable encryption shield glowing, secure blues and violets.`
  },
  {
    id: 'tech-03',
    name: 'Quantum AI',
    prompt: `${BASE_STYLE} Neural network made of entangled quantum particles thinking in superposition, AI oracle giving answers it cannot explain, quantum brain processing patterns beyond classical comprehension, machine learning at exponential scale, mysterious intelligence emerging, ethereal purples and thinking blues.`
  },
  {
    id: 'tech-04',
    name: 'Quantum Sensing',
    prompt: `${BASE_STYLE} Atomic clock of extraordinary precision measuring time with cosmic accuracy, magnetic sensor detecting hidden objects through walls, medical scanner seeing disease at molecular level years before symptoms, quantum compass navigating without GPS, ultra-precise measurement instruments, sensing greens and detection blues.`
  },
  {
    id: 'tech-05',
    name: 'Quantum Simulation',
    prompt: `${BASE_STYLE} Molecular simulation showing drug binding to protein in exquisite detail, new material being designed atom by atom, chemical reaction being modeled at quantum level, pharmaceutical lab with holographic molecule displays, designing drugs in days not decades, discovery greens and simulation blues.`
  },
  {
    id: 'tech-06',
    name: 'AGI',
    prompt: `${BASE_STYLE} Artificial general intelligence awakening as vast interconnected mind visualization, AI reasoning about complex goals with human-level cognition, self-improving system reaching new levels of capability, threshold being crossed into machine consciousness, digital being emerging, transcendent golds and intelligence blues.`
  },
  {
    id: 'tech-07',
    name: 'Brain-Computer Interface',
    prompt: `${BASE_STYLE} Neural implant connecting human brain directly to digital world, thoughts becoming actions on screen without touching anything, paralyzed person controlling robotic arm with pure intention, memory being recorded and replayed, telepathic communication between networked minds, neural reds and interface blues.`
  },
  {
    id: 'tech-08',
    name: 'Synthetic Biology',
    prompt: `${BASE_STYLE} Designer organism being programmed with genetic code, biological factory producing fuel and medicine, CRISPR tools editing life like software code, living materials growing into structures, custom cells performing engineered functions, bio greens and genetic purples.`
  },
  {
    id: 'tech-09',
    name: 'Fusion Power',
    prompt: `${BASE_STYLE} Tokamak fusion reactor with plasma contained by magnetic fields glowing like captured sun, net energy gain achieved as breakthrough moment, unlimited clean power flowing into grid, artificial star burning in controlled chamber, power of the sun on Earth, fusion oranges and plasma blues.`
  },
  {
    id: 'tech-10',
    name: 'Room-Temp Superconductors',
    prompt: `${BASE_STYLE} Superconducting material levitating magnets at room temperature, power lines glowing with lossless electricity transmission, maglev train floating silently, quantum computer running without cryogenic cooling, zero resistance revolution changing everything, superconducting blues and transformation golds.`
  },

  // PROMPT CARDS (6)
  {
    id: 'prompt-01',
    name: 'The Innovator',
    prompt: `${BASE_STYLE} Visionary inventor at workbench surrounded by prototypes and dreams, entrepreneur pitching world-changing idea with passion, researcher having eureka moment in laboratory, garage startup founder defying the odds, dreamer building the future, warm inspiring golds and creative oranges.`
  },
  {
    id: 'prompt-02',
    name: 'The Incumbent',
    prompt: `${BASE_STYLE} Corporate executive watching market disruption from corner office tower, established industry resisting change with institutional weight, old guard fighting to preserve power and position, lobbying forces blocking progress, adapting or dying in face of innovation, conservative blues and resistant grays.`
  },
  {
    id: 'prompt-03',
    name: 'The Citizen',
    prompt: `${BASE_STYLE} Ordinary person navigating technological change in daily life, family adapting to new normal with mixed emotions, morning routine transformed by innovation, new habits forming and old ones dying, what is gained and lost in transition, everyday warm tones and life colors.`
  },
  {
    id: 'prompt-04',
    name: 'The Edge Case',
    prompt: `${BASE_STYLE} Person falling through cracks of technological system, those left behind by progress watching from margins, communities forgotten by innovation wave, vulnerable populations facing new risks, who doesn't fit the default assumption, shadow tones and marginalized perspectives.`
  },
  {
    id: 'prompt-05',
    name: 'The Unintended',
    prompt: `${BASE_STYLE} Butterfly effect cascading from good intentions to strange outcomes, unforeseen consequences rippling through systems, solution creating new problems in its wake, second-order effects nobody predicted, what could possibly go wrong visualization, chaotic patterns and warning ambers.`
  },
  {
    id: 'prompt-06',
    name: 'The Threshold',
    prompt: `${BASE_STYLE} Point of no return visualized as doorway into changed world, tipping point moment when change becomes inevitable, line being crossed with no going back, decisive moment locking in future path, before and after separated by critical instant, threshold golds and transformation violets.`
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
  console.log('FUTURES DECK - Image Generator');
  console.log('='.repeat(60));

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\nError: REPLICATE_API_TOKEN environment variable not set');
    console.log('Usage: REPLICATE_API_TOKEN=xxx node src/generate-images.js');
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
    fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''))
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
