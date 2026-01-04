#!/usr/bin/env node
/**
 * Emerging Technologies Futures - PDF Print Generator
 *
 * Generates a print-ready PDF from the HTML print layout.
 *
 * Usage:
 *   node src/print-emerging-pdf.js
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output');
const HTML_FILE = path.join(PROJECT_DIR, 'docs', 'emerging-print.html');

async function generatePDF() {
  console.log('Emerging Technologies Futures - PDF Generator');
  console.log('='.repeat(50));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('\nLaunching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Loading print layout...');
  await page.goto(`file://${HTML_FILE}`, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  // Wait for images to load
  await page.evaluate(async () => {
    const images = document.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  });

  // Hide info bar for PDF
  await page.evaluate(() => {
    const info = document.querySelector('.info');
    if (info) info.style.display = 'none';
  });

  const pdfPath = path.join(OUTPUT_DIR, 'emerging-tech-futures.pdf');

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  console.log(`\n✓ Generated: ${pdfPath}`);
  console.log('\n' + '='.repeat(50));
  console.log('Done!');
  console.log('\nPrint settings:');
  console.log('  - Paper: Letter (8.5" x 11")');
  console.log('  - Double-sided: Flip on long edge');
  console.log('  - Scale: 100%');
  console.log('  - Margins: None');
}

generatePDF().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
