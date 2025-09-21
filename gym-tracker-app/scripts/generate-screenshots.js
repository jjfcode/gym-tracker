#!/usr/bin/env node

/**
 * Script to generate placeholder screenshots for PWA manifest
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../public/screenshots');

// Create a simple PNG placeholder (base64 encoded 1x1 transparent PNG)
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate placeholder screenshot files
const screenshots = ['desktop-1.png', 'mobile-1.png'];
screenshots.forEach(filename => {
  const filepath = path.join(screenshotsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, transparentPng);
    console.log(`Generated placeholder: ${filename}`);
  } else {
    console.log(`Already exists: ${filename}`);
  }
});

console.log('Screenshot generation complete!');
console.log('Note: These are placeholder PNG files. In production, capture actual app screenshots.');