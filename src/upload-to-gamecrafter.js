#!/usr/bin/env node
/**
 * Upload Futures Deck to The Game Crafter
 *
 * Usage: TGC_USERNAME=x TGC_PASSWORD=y node src/upload-to-gamecrafter.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'https://www.thegamecrafter.com/api';
const API_KEY = process.env.TGC_API_KEY || 'E4963FEA-E76C-11F0-B4B8-3F982389BF0E';

const CARDS_DATA = require('./cards-v2.json');
const PROJECT_DIR = path.join(__dirname, '..');
const CARDS_DIR = path.join(PROJECT_DIR, 'assets', 'cards-final');

// Build card list from JSON (same order as render script)
function buildCardList() {
  const cards = [];

  for (const card of CARDS_DATA.arc) {
    cards.push({ id: card.id, name: card.name });
  }
  for (const card of CARDS_DATA.terrain) {
    cards.push({ id: card.id, name: card.name });
  }
  for (const card of CARDS_DATA.object) {
    cards.push({ id: card.id, name: card.name });
  }
  for (const card of CARDS_DATA.wellbeing) {
    cards.push({ id: card.id, name: card.name });
  }
  for (const card of CARDS_DATA.timeframe) {
    cards.push({ id: card.id, name: card.name });
  }
  for (const card of CARDS_DATA.modifiers) {
    cards.push({ id: card.id, name: card.label });
  }

  return cards;
}

function apiPost(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${endpoint}`;
    const postData = new URLSearchParams(params).toString();
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            reject(new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`));
          } else {
            resolve(json.result || json);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function apiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${endpoint}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            reject(new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`));
          } else {
            resolve(json.result || json);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 500)}`));
        }
      });
    }).on('error', reject);
  });
}

async function uploadFile(sessionId, folderId, filePath, fileName) {
  const FormData = (await import('form-data')).default;
  const fetch = (await import('node-fetch')).default;

  const form = new FormData();
  form.append('session_id', sessionId);
  form.append('folder_id', folderId);
  form.append('name', fileName);
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(`${API_BASE}/file`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  const json = await response.json();
  if (json.error) {
    throw new Error(`Upload error: ${json.error.message || JSON.stringify(json.error)}`);
  }
  return json.result;
}

async function main() {
  console.log('='.repeat(50));
  console.log('FUTURES DECK - Upload to The Game Crafter');
  console.log('='.repeat(50));

  const username = process.env.TGC_USERNAME;
  const password = process.env.TGC_PASSWORD;

  if (!username || !password) {
    console.error('Usage: TGC_USERNAME=x TGC_PASSWORD=y node src/upload-to-gamecrafter.js');
    process.exit(1);
  }

  // Check if cards directory exists
  if (!fs.existsSync(CARDS_DIR)) {
    console.error(`Cards directory not found: ${CARDS_DIR}`);
    console.error('Run: node src/render-cards-for-tgc.js first');
    process.exit(1);
  }

  const cards = buildCardList();
  console.log(`\nPreparing to upload ${cards.length} cards + card back\n`);

  console.log('1. Creating session...');
  const session = await apiPost('/session', {
    username,
    password,
    api_key_id: API_KEY
  });
  const sessionId = session.id;
  console.log(`   Session: ${sessionId}`);

  console.log('\n2. Getting user info...');
  const user = await apiGet(`/user/${session.user_id}?session_id=${sessionId}&_include_related_objects=designers`);
  console.log(`   User: ${user.username}`);

  // Get or create designer
  let designerId;
  if (user.designers && user.designers.length > 0) {
    designerId = user.designers[0].id;
    console.log(`   Designer: ${designerId}`);
  } else {
    console.log('   Creating designer...');
    const designersResp = await apiGet(`/user/${user.id}/designers?session_id=${sessionId}`);
    if (designersResp.items && designersResp.items.length > 0) {
      designerId = designersResp.items[0].id;
    } else {
      const designer = await apiPost('/designer', {
        session_id: sessionId,
        name: `${user.username}_designer`,
        user_id: user.id
      });
      designerId = designer.id;
    }
    console.log(`   Designer: ${designerId}`);
  }

  // Create game
  const timestamp = new Date().toISOString().slice(0, 10);
  const gameName = `Futures Deck ${timestamp}`;
  console.log(`\n3. Creating game: ${gameName}...`);
  const game = await apiPost('/game', {
    session_id: sessionId,
    name: gameName,
    designer_id: designerId,
    description: 'A 56-card speculative futures oracle for exploring emerging technologies. Categories include Arc, Terrain, Object, Wellbeing, Timeframe, and Modifier cards.'
  });
  console.log(`   Game: ${game.id}`);

  console.log('\n4. Creating folder for images...');
  const folder = await apiPost('/folder', {
    session_id: sessionId,
    name: `Futures Deck Images ${timestamp}`,
    user_id: user.id
  });
  console.log(`   Folder: ${folder.id}`);

  console.log('\n5. Creating tarot deck...');
  const deck = await apiPost('/tarotdeck', {
    session_id: sessionId,
    name: 'Futures Oracle',
    game_id: game.id
  });
  console.log(`   Deck: ${deck.id}`);

  console.log('\n6. Uploading card images...');
  const uploadedFiles = {};

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const filePath = path.join(CARDS_DIR, `${card.id}.png`);

    if (!fs.existsSync(filePath)) {
      console.log(`   [${i + 1}/${cards.length}] SKIP ${card.id} - file not found`);
      continue;
    }

    try {
      const file = await uploadFile(sessionId, folder.id, filePath, `${card.id}.png`);
      uploadedFiles[card.id] = { fileId: file.id, name: card.name };
      console.log(`   [${i + 1}/${cards.length}] ✓ ${card.name}`);
    } catch (err) {
      console.log(`   [${i + 1}/${cards.length}] ✗ ${card.name}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // Upload card back
  const backPath = path.join(CARDS_DIR, 'card-back.png');
  let backFileId = null;
  if (fs.existsSync(backPath)) {
    console.log('\n7. Uploading card back...');
    try {
      const backFile = await uploadFile(sessionId, folder.id, backPath, 'card-back.png');
      backFileId = backFile.id;
      console.log(`   ✓ card-back.png (${backFileId})`);
    } catch (err) {
      console.log(`   ✗ card-back.png: ${err.message}`);
    }
  }

  console.log('\n8. Adding cards to deck...');
  let cardsCreated = 0;
  for (const [cardId, info] of Object.entries(uploadedFiles)) {
    try {
      await apiPost('/tarotcard', {
        session_id: sessionId,
        deck_id: deck.id,
        name: info.name,
        face_id: info.fileId
      });
      cardsCreated++;
    } catch (err) {
      console.log(`   ✗ ${info.name}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`   Created ${cardsCreated} cards`);

  // Set card back if uploaded
  if (backFileId) {
    console.log('\n9. Setting card back...');
    try {
      await apiPost('/tarotdeck', {
        session_id: sessionId,
        id: deck.id,
        back_id: backFileId
      });
      console.log('   ✓ Card back set');
    } catch (err) {
      console.log(`   Note: Card back may need to be set manually: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('UPLOAD COMPLETE!');
  console.log('='.repeat(50));
  console.log(`\nGame: ${gameName}`);
  console.log(`Game ID: ${game.id}`);
  console.log(`Deck ID: ${deck.id}`);
  console.log(`Cards: ${cardsCreated}`);
  console.log(`\nView your deck at:`);
  console.log(`https://www.thegamecrafter.com/make/games/${game.id}`);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
