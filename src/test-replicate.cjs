const fs = require('fs');
const path = require('path');

const REPLICATE_API_KEY = process.env.REPLICATE_API_TOKEN || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.replicate.com/v1';

const TEST_PROMPT = 'Tarot card titled GROWTH with the word GROWTH in gold letters at the bottom, featuring a mystical tree with roots and branches forming an infinity symbol, ornate art nouveau border with Celtic knotwork, rich jewel tones, professional card game art, high detail';

const models = [
  {
    name: 'ideogram-v3',
    model: 'ideogram-ai/ideogram-v3-balanced',
    input: { prompt: TEST_PROMPT, aspect_ratio: '2:3' }
  },
  {
    name: 'flux-schnell',
    model: 'black-forest-labs/flux-schnell',
    input: { prompt: TEST_PROMPT, aspect_ratio: '2:3' }
  },
  {
    name: 'flux-1.1-pro',
    model: 'black-forest-labs/flux-1.1-pro',
    input: { prompt: TEST_PROMPT, aspect_ratio: '2:3' }
  },
  {
    name: 'recraft-v3',
    model: 'recraft-ai/recraft-v3',
    input: { prompt: TEST_PROMPT, size: '1024x1536' }
  },
  {
    name: 'stable-diffusion-3.5',
    model: 'stability-ai/stable-diffusion-3.5-large',
    input: { prompt: TEST_PROMPT, aspect_ratio: '2:3' }
  }
];

const outputDir = path.join(__dirname, '..', 'assets', 'test-replicate');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function createPrediction(model) {
  console.log(`Submitting to ${model.name}...`);
  const response = await fetch(`${BASE_URL}/models/${model.model}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: model.input })
  });
  const data = await response.json();
  if (data.error) {
    console.log(`  Error: ${data.error}`);
    return null;
  }
  console.log(`  ID: ${data.id}, Status: ${data.status}`);
  return { ...model, id: data.id, urls: data.urls };
}

async function getPrediction(job) {
  const response = await fetch(job.urls.get, {
    headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
  });
  return response.json();
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
  console.log('Testing Replicate image models...\n');
  console.log('Prompt:', TEST_PROMPT, '\n');

  // Submit all jobs
  const jobs = [];
  for (const model of models) {
    try {
      const job = await createPrediction(model);
      if (job && job.id) {
        jobs.push(job);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }

  console.log(`\nSubmitted ${jobs.length} jobs. Polling for results...\n`);

  // Poll for completion
  const results = [];
  const completed = new Set();

  while (completed.size < jobs.length) {
    for (const job of jobs) {
      if (completed.has(job.name)) continue;

      try {
        const result = await getPrediction(job);
        if (result.status === 'succeeded') {
          const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
          if (imageUrl) {
            const filepath = path.join(outputDir, `${job.name}.png`);
            await downloadImage(imageUrl, filepath);
            console.log(`✓ ${job.name}: Downloaded`);
            results.push({ name: job.name, file: filepath, url: imageUrl });
          }
          completed.add(job.name);
        } else if (result.status === 'failed') {
          console.log(`✗ ${job.name}: Failed - ${result.error}`);
          completed.add(job.name);
        } else {
          console.log(`  ${job.name}: ${result.status}...`);
        }
      } catch (e) {
        console.log(`  ${job.name}: Error - ${e.message}`);
      }
    }

    if (completed.size < jobs.length) {
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(outputDir, 'results.json'),
    JSON.stringify({ prompt: TEST_PROMPT, results }, null, 2)
  );

  console.log('\nDone! Results saved to assets/test-replicate/');
}

main().catch(console.error);
