import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPLICATE_API_TOKEN = 'sk-mr-1a2750cb210f8989775e3cb3f13b75a7d6efd6bbd3838ac3e32cd617faa5d326';
const API_BASE = 'https://api.replicate.com/v1';

// Load cards
const cardsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'plant-intelligence-cards.json'), 'utf8'));
const outputDir = path.join(__dirname, 'assets', 'plant-intelligence');

// Flatten all cards
const allCards = [];
Object.values(cardsData.cards).forEach(categoryCards => {
  allCards.push(...categoryCards);
});

console.log(`Total cards to generate: ${allCards.length}`);

async function generateImage(card) {
  try {
    console.log(`Generating: ${card.name} (${card.id})...`);

    const response = await fetch(`${API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'fed618df81e2e1b831bdc3407b6b5e4407e10935a20f9081635aa09c9cfa9e57', // Flux 1.1 Pro
        input: {
          prompt: card.flux_prompt,
          num_outputs: 1,
          aspect_ratio: '2:3',
          num_inference_steps: 50
        }
      })
    });

    const prediction = await response.json();

    if (!response.ok) {
      console.error(`Error for ${card.name}:`, prediction);
      return null;
    }

    // Poll until complete
    let completed = false;
    let pollCount = 0;
    const maxPolls = 120; // 10 minutes with 5-second intervals

    while (!completed && pollCount < maxPolls) {
      const statusResponse = await fetch(`${API_BASE}/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`
        }
      });

      const status = await statusResponse.json();

      if (status.status === 'succeeded') {
        completed = true;
        console.log(`✓ ${card.name} completed`);
        return status.output[0];
      } else if (status.status === 'failed') {
        console.error(`✗ ${card.name} failed:`, status.error);
        return null;
      }

      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
      pollCount++;
    }

    if (!completed) {
      console.error(`✗ ${card.name} timed out after ${maxPolls * 5} seconds`);
      return null;
    }
  } catch (error) {
    console.error(`Error generating ${card.name}:`, error);
    return null;
  }
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(path.join(outputDir, filename), buffer);
    console.log(`  Downloaded: ${filename}`);
  } catch (error) {
    console.error(`  Error downloading ${filename}:`, error);
  }
}

async function main() {
  const results = [];

  // Generate images sequentially to avoid rate limits
  for (const card of allCards) {
    const imageUrl = await generateImage(card);

    if (imageUrl) {
      const filename = `${card.id}.png`;
      await downloadImage(imageUrl, filename);

      results.push({
        id: card.id,
        name: card.name,
        category: card.category,
        imageUrl: imageUrl,
        filename: filename,
        status: 'success'
      });
    } else {
      results.push({
        id: card.id,
        name: card.name,
        category: card.category,
        status: 'failed'
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'generation-results-plant.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== GENERATION COMPLETE ===');
  const successful = results.filter(r => r.status === 'success').length;
  console.log(`Generated: ${successful}/${allCards.length} images`);
  console.log(`Results saved to: generation-results-plant.json`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
