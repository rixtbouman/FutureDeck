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
  // TECHNOLOGY CARDS (8)
  {
    id: 'tech-01',
    name: 'AGI',
    prompt: `${BASE_STYLE} Vast neural network visualization pulsing with autonomous thought, artificial general intelligence awakening as emergent consciousness, countless processing nodes forming a singular aware mind, human brain silhouette dissolving into digital omniscience, the threshold of machine superintelligence, electric blues and transcendent golds.`
  },
  {
    id: 'tech-02',
    name: 'BCI',
    prompt: `${BASE_STYLE} Brain-computer interface implant glowing softly beneath skin, neural signals translated into digital commands visualized as light streams, human connected directly to machine consciousness, thoughts becoming actions without physical movement, the merger of biological and digital minds, neural purples and interface cyans.`
  },
  {
    id: 'tech-03',
    name: 'Quantum Communication',
    prompt: `${BASE_STYLE} Entangled photon pairs traveling through fiber optic networks as paired light beams, quantum key distribution creating unbreakable encrypted channel, secure transmission visualized as shielded data stream, eavesdropper detection system rejecting intruders, unhackable communication infrastructure, secure blues and quantum violets.`
  },
  {
    id: 'tech-04',
    name: 'Quantum Sensing',
    prompt: `${BASE_STYLE} Ultra-precise atomic sensors detecting hidden objects through solid walls, gravity field mapping revealing underground structures, medical quantum scanner seeing disease at molecular level, navigation without GPS using quantum compass, unprecedented measurement precision, sensing greens and detection blues.`
  },
  {
    id: 'tech-05',
    name: 'Quantum Computing',
    prompt: `${BASE_STYLE} Massive quantum processor with crystalline qubit array suspended in cryogenic chamber, superposition states visualized as probability clouds, entanglement webs connecting computational elements, breaking encryption visualized as shattering locks, exponential processing power unleashed, quantum blues and computational purples.`
  },
  {
    id: 'tech-06',
    name: 'Robotics',
    prompt: `${BASE_STYLE} Advanced autonomous robot with humanoid form navigating complex environment, swarm of coordinated machines working in perfect synchronization, robotic hands performing delicate surgical operation, warehouse automation ballet of precision movement, machines reshaping labor and society, mechanical silvers and automation blues.`
  },
  {
    id: 'tech-07',
    name: 'Synthetic Biology',
    prompt: `${BASE_STYLE} Designer organism being programmed with genetic code in bioreactor, CRISPR gene editing tools precisely modifying DNA helix, living cells engineered to produce medicine and materials, biological factory growing custom proteins, life as programmable technology, bio greens and genetic purples.`
  },
  {
    id: 'tech-08',
    name: 'Neurotechnology',
    prompt: `${BASE_STYLE} Neural interface reading and stimulating brain activity patterns, memory enhancement device augmenting cognitive function, mood regulation implant balancing neurochemistry, brain mapping visualization showing consciousness architecture, technology merging with the nervous system, neural reds and cognitive blues.`
  },

  // ACTOR CARDS (10)
  {
    id: 'actor-01',
    name: 'Foreign States',
    prompt: `${BASE_STYLE} Global map with competing nation-states highlighted as power centers, geopolitical chess pieces representing international competition, satellite surveillance overlapping spheres of influence, diplomatic cables and intelligence feeds flowing between capitals, strategic technological rivalry, geopolitical blues and warning reds.`
  },
  {
    id: 'actor-02',
    name: 'Dutch Government',
    prompt: `${BASE_STYLE} Netherlands parliament building (Binnenhof) with digital policy streams emanating, orange-accented government apparatus balancing innovation and protection, regulatory frameworks visualized as protective shields, European integration connections glowing, national technology strategy unfolding, Dutch orange and institutional blues.`
  },
  {
    id: 'actor-03',
    name: 'Criminal Networks',
    prompt: `${BASE_STYLE} Dark web marketplace operating in shadows with encrypted connections, organized crime exploiting technological vulnerabilities, ransomware attack spreading through network visualization, illicit trade routes mapped in threatening red, cybercriminal underground infrastructure, shadow blacks and threat reds.`
  },
  {
    id: 'actor-04',
    name: 'Tech Companies',
    prompt: `${BASE_STYLE} Startup office with entrepreneurs building innovative products, venture-backed company racing to market, agile tech team iterating on breakthrough ideas, smaller players competing against giants, innovation emerging from garages and incubators, startup energy and innovation blues.`
  },
  {
    id: 'actor-05',
    name: 'Big Tech',
    prompt: `${BASE_STYLE} Massive glass headquarters of trillion-dollar tech giant dominating skyline, platform monopoly visualized as data streams flowing to central fortress, global infrastructure of servers and cables controlled by single entity, market dominance represented as gravitational pull, the gatekeepers of digital economy, corporate power blues and dominant golds.`
  },
  {
    id: 'actor-06',
    name: 'Hacktivists',
    prompt: `${BASE_STYLE} Anonymous collective operating from distributed locations worldwide, leaked documents exposing hidden truths floating in digital space, digital resistance symbol glowing against corporate backdrop, systems being disrupted for ideological cause, information warfare for public interest, resistance greens and disruption purples.`
  },
  {
    id: 'actor-07',
    name: 'Research Institutions',
    prompt: `${BASE_STYLE} University research laboratory with breakthrough experiment in progress, academic collaboration network spanning global institutions, fundamental science publication creating ripples of knowledge, PhD researchers advancing the frontier of understanding, knowledge creation ecosystem, academic blues and discovery golds.`
  },
  {
    id: 'actor-08',
    name: 'NGOs',
    prompt: `${BASE_STYLE} Civil society watchdog monitoring technology impacts on humanity, advocacy organization amplifying marginalized voices, ethics committee deliberating on emerging technology, public interest lawyers challenging corporate power, accountability forces at work, advocacy greens and justice blues.`
  },
  {
    id: 'actor-09',
    name: 'Journalists',
    prompt: `${BASE_STYLE} Investigative journalist uncovering technology story with documents and sources, newsroom with breaking tech story on screens, reporter with camera at technology company gates, media spotlight illuminating hidden practices, the press as fourth estate watchdog, journalism blues and truth whites.`
  },
  {
    id: 'actor-10',
    name: 'Citizens',
    prompt: `${BASE_STYLE} Diverse public navigating technological change in daily life, community gathering to discuss technology impacts, consumer choices shaping market directions, protesters and adopters representing spectrum of response, the people as ultimate stakeholders, warm community tones and diverse colors.`
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
    name: 'Accelerated Funding',
    prompt: `${BASE_STYLE} Massive investment flowing as golden river into technology development, government budget allocation expanding dramatically, venture capital tsunami surging into emerging sector, research grants multiplying exponentially, resources mobilizing at unprecedented scale, funding golds and growth greens.`
  },
  {
    id: 'event-04',
    name: 'Technical Setback',
    prompt: `${BASE_STYLE} Failed experiment with smoking equipment and disappointed researchers, fundamental limitation blocking expected breakthrough, error cascade causing system failure, roadblock forcing redirection of development path, progress halted by unexpected barrier, setback ambers and frustration grays.`
  },
  {
    id: 'event-05',
    name: 'Regulatory Change',
    prompt: `${BASE_STYLE} New legislation being enacted in parliamentary chamber, regulatory framework reshaping industry landscape, compliance requirements transforming business models, legal boundaries being redrawn around technology, rules of the game fundamentally changing, regulatory blues and change purples.`
  },
  {
    id: 'event-06',
    name: 'Public Backlash',
    prompt: `${BASE_STYLE} Mass protest against technology deployment in public square, social media storm of opposition spreading virally, consumer boycott crippling technology adoption, public opinion turning decisively against innovation, democratic resistance to unwanted change, backlash reds and protest oranges.`
  },
  {
    id: 'event-07',
    name: 'International Treaty',
    prompt: `${BASE_STYLE} Global summit with nations signing binding technology agreement, international cooperation framework being formalized, treaty document with multiple flags and signatures, diplomatic breakthrough creating new world order, collective governance of emerging technology, treaty blues and cooperation golds.`
  },
  {
    id: 'event-08',
    name: 'Market Collapse',
    prompt: `${BASE_STYLE} Technology bubble bursting with stock charts in freefall, startup failures cascading through ecosystem, investment withdrawal causing funding drought, economic disruption reshaping industry landscape, market forces destroying and creating, collapse reds and crisis oranges.`
  },
  {
    id: 'event-09',
    name: 'Talent Exodus',
    prompt: `${BASE_STYLE} Brain drain visualization with top researchers departing for opportunities elsewhere, talent migration shifting global capability balance, empty offices left behind by departed experts, competitive recruitment drawing away key personnel, human capital flowing to new centers, exodus blues and departure grays.`
  },
  {
    id: 'event-10',
    name: 'Open Source Release',
    prompt: `${BASE_STYLE} Powerful technology being released to the world as open source, democratized access spreading capability globally, code repository shared with millions of developers, barriers to entry dissolving instantaneously, proliferation of once-restricted capability, open source greens and democratization blues.`
  },
  {
    id: 'event-11',
    name: 'War',
    prompt: `${BASE_STYLE} Military conflict reshaping technological priorities and development, weapons systems and defense technologies being rapidly deployed, supply chains disrupted by geopolitical conflict, wartime mobilization accelerating certain innovations, destruction and reconstruction transforming landscape, war reds and conflict grays.`
  },
  {
    id: 'event-12',
    name: 'Leak',
    prompt: `${BASE_STYLE} Classified documents spilling into public view revealing hidden truths, whistleblower releasing confidential information to journalists, secure vault broken open with secrets escaping, data breach exposing corporate or government wrongdoing, information that changes everything, leak blues and exposure whites.`
  },
  {
    id: 'event-13',
    name: 'Natural Disaster',
    prompt: `${BASE_STYLE} Catastrophic natural event testing technological resilience, infrastructure damaged by earthquake flood or storm, climate emergency forcing rapid adaptation, disaster response systems being overwhelmed, nature's power disrupting human systems, disaster oranges and emergency reds.`
  },

  // WELLBEING CARDS (17)
  {
    id: 'well-01',
    name: 'Autonomy',
    prompt: `${BASE_STYLE} Person breaking free from algorithmic control strings becoming self-directed, autonomous decision-making visualized as branching paths of choice, freedom to choose one's own path through complexity, self-determination in an age of AI influence, independence and agency preserved, autonomy purples and freedom blues.`
  },
  {
    id: 'well-02',
    name: 'Safety',
    prompt: `${BASE_STYLE} Protective shield deflecting technological hazards and threats, early warning system detecting danger before impact, safety infrastructure preventing harm to vulnerable populations, risk mitigation measures creating secure environment, protection from emerging technological dangers, safety greens and protection blues.`
  },
  {
    id: 'well-03',
    name: 'Security',
    prompt: `${BASE_STYLE} Encrypted fortress protecting personal data and privacy, stable institutions withstanding technological disruption, cyber defense systems repelling intrusion attempts, predictability and trust in technological systems, foundation of safety in uncertain times, security blues and stability grays.`
  },
  {
    id: 'well-04',
    name: 'Comfort',
    prompt: `${BASE_STYLE} Smart environment automatically adjusting to human needs for ease, seamless technology integration reducing daily friction, convenient automation handling tedious tasks, quality of life enhanced by technological assistance, ease and convenience in modern life, comfort golds and ease creams.`
  },
  {
    id: 'well-05',
    name: 'Community',
    prompt: `${BASE_STYLE} Diverse people connected through technology in meaningful community, shared identity strengthened by digital platforms, collective action organized through networked communication, belonging and solidarity in technological age, human connection enhanced not replaced, community oranges and connection blues.`
  },
  {
    id: 'well-06',
    name: 'Beauty',
    prompt: `${BASE_STYLE} Aesthetic experience enhanced by technology revealing hidden wonders, new art forms emerging from digital creativity, perception augmented to appreciate deeper beauty, creative flourishing enabled by technological tools, wonder and appreciation amplified, beauty purples and aesthetic golds.`
  },
  {
    id: 'well-07',
    name: 'Competence',
    prompt: `${BASE_STYLE} Human expertise augmented by technological capability, skill mastery enhanced by AI assistance and training, professional competence elevated to new levels, learning accelerated by intelligent tutoring, capability and mastery in partnership with machines, competence blues and mastery golds.`
  },
  {
    id: 'well-08',
    name: 'Fitness',
    prompt: `${BASE_STYLE} Health optimized through technological monitoring and intervention, vitality enhanced by biotech and medical advances, physical capability augmented by wearable technology, longevity extended through precision medicine, wellbeing of body in technological age, fitness greens and health blues.`
  },
  {
    id: 'well-09',
    name: 'Impact',
    prompt: `${BASE_STYLE} Individual action amplified to global scale through technology, ripple effects spreading from meaningful contribution, leverage and influence multiplied by digital reach, making a difference in an interconnected world, significance and contribution magnified, impact oranges and influence golds.`
  },
  {
    id: 'well-10',
    name: 'Purpose',
    prompt: `${BASE_STYLE} Meaningful direction illuminated through technological possibility, life mission clarified and enabled by new capabilities, sense of calling strengthened in changing world, existential meaning preserved amid disruption, direction and significance in technological age, purpose golds and meaning purples.`
  },
  {
    id: 'well-11',
    name: 'Relatedness',
    prompt: `${BASE_STYLE} Deep human connection maintained and enhanced by technology, intimate relationships strengthened through digital bridge, empathy and understanding amplified by communication tools, authentic bonds persisting through technological change, love and friendship in digital age, relatedness pinks and connection blues.`
  },
  {
    id: 'well-12',
    name: 'Stimulation',
    prompt: `${BASE_STYLE} Engaging experiences and novel discoveries enabled by technology, curiosity satisfied through infinite accessible knowledge, excitement and engagement in age of wonder, novelty and learning opportunities multiplying, mental engagement and growth, stimulation oranges and curiosity yellows.`
  },
  {
    id: 'well-13',
    name: 'Privacy',
    prompt: `${BASE_STYLE} Personal data protected within secure digital sanctuary, individual controlling who sees what behind privacy shield, intimate space preserved from surveillance eyes, data sovereignty represented as personal fortress, boundaries between self and world maintained, privacy blues and sanctuary purples.`
  },
  {
    id: 'well-14',
    name: 'Trust',
    prompt: `${BASE_STYLE} Handshake between human and machine symbolizing reliable partnership, verified information flowing through trusted channels, institutional foundations standing solid amid change, confidence in systems represented as stable bridge, dependable relationships in digital age, trust blues and confidence golds.`
  },
  {
    id: 'well-15',
    name: 'Fairness',
    prompt: `${BASE_STYLE} Balanced scales weighing algorithmic decisions equally, diverse people receiving equal treatment from technological systems, bias being removed from decision-making processes, justice applied consistently across all groups, equity and opportunity for everyone, fairness purples and justice golds.`
  },
  {
    id: 'well-16',
    name: 'Livelihood',
    prompt: `${BASE_STYLE} Worker adapting to technological change with new skills and tools, human labor valued alongside automated systems, economic opportunity emerging from technological transition, meaningful work persisting in age of automation, earning a living in transformed economy, livelihood greens and economic blues.`
  },
  {
    id: 'well-17',
    name: 'Identity',
    prompt: `${BASE_STYLE} Unique human fingerprint persisting amid digital representations, authentic self-expression through and despite technology, individual distinctiveness preserved in age of AI, sense of self maintained through technological change, who we are in a world of machines, identity purples and authenticity golds.`
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
