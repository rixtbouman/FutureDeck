#!/usr/bin/env node
/**
 * Generate artwork for Futures Deck using MuleRouter API
 *
 * Generates 1440x1440 square images for each card
 * Output: assets/artwork/
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = path.join(__dirname, '..');
const PROMPTS_FILE = path.join(__dirname, 'artwork-prompts.json');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'assets', 'artwork');

// MuleRouter API configuration
const API_BASE = 'https://api.mulerun.com';
const API_KEY = process.env.MULEROUTER_API_KEY;

if (!API_KEY) {
  console.error('Error: MULEROUTER_API_KEY environment variable required');
  process.exit(1);
}

// Load prompts
const promptsData = require('./artwork-prompts.json');

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function generateImage(prompt, negativePrompt) {
  // Create generation task
  const task = await apiRequest('POST', '/vendors/alibaba/v1/wan2.6-t2i/generation', {
    prompt: prompt,
    negative_prompt: negativePrompt,
    size: '1440*1440',
    n: 1,
    prompt_extend: true
  });

  if (!task.task_id) {
    throw new Error(`Failed to create task: ${JSON.stringify(task)}`);
  }

  console.log(`  Task: ${task.task_id}`);

  // Poll for completion
  const maxAttempts = 120; // 10 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds

    const status = await apiRequest('GET', `/tasks/${task.task_id}`);

    if (status.status === 'completed') {
      if (status.images && status.images.length > 0) {
        return status.images[0];
      }
      throw new Error('Completed but no images');
    } else if (status.status === 'failed') {
      throw new Error(`Task failed: ${status.error || 'Unknown error'}`);
    }

    process.stdout.write('.');
  }

  throw new Error('Timeout waiting for image');
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('Futures Deck - Artwork Generator');
  console.log('='.repeat(50));

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const cards = promptsData.cards;
  const negativePrompt = promptsData.meta.negativePrompt;
  const stylePrefix = promptsData.meta.style;

  // Check which cards already have artwork
  const existing = new Set(
    fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''))
  );

  const toGenerate = cards.filter(c => !existing.has(c.id));

  console.log(`\nTotal cards: ${cards.length}`);
  console.log(`Already generated: ${existing.size}`);
  console.log(`To generate: ${toGenerate.length}\n`);

  if (toGenerate.length === 0) {
    console.log('All artwork already exists!');
    return;
  }

  // Generate each card
  for (let i = 0; i < toGenerate.length; i++) {
    const card = toGenerate[i];
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);

    console.log(`[${i + 1}/${toGenerate.length}] ${card.name} (${card.id})`);

    try {
      const fullPrompt = `${stylePrefix}. ${card.prompt}`;
      const imageUrl = await generateImage(fullPrompt, negativePrompt);
      console.log('\n  Downloading...');
      await downloadImage(imageUrl, outputPath);
      console.log(`  Saved: ${card.id}.png`);
    } catch (err) {
      console.error(`\n  ERROR: ${err.message}`);
      // Continue with next card
    }

    // Small delay between requests
    if (i < toGenerate.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Done! Artwork saved to:', OUTPUT_DIR);
}

main().catch(console.error);
