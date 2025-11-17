#!/usr/bin/env node

/**
 * Trigger script to open Eames Canvas with agora-next routes
 * 
 * This script:
 * 1. Detects the current project path
 * 2. Reads the dev server port from next.config.js or uses default
 * 3. Calls the Eames Bridge API to load all routes in Canvas
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectPath = join(__dirname, '..');

const BRIDGE_URL = 'http://localhost:4000';
const DEV_PORT = 3000; // agora-next dev server port

async function openCanvas() {
  console.log('🎨 Opening Eames Canvas...\n');
  console.log(`Project: ${projectPath}`);
  console.log(`Dev Server: http://localhost:${DEV_PORT}\n`);

  try {
    const response = await fetch(`${BRIDGE_URL}/api/canvas/open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectPath,
        port: DEV_PORT,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bridge API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('✅ Canvas opened successfully!\n');
    console.log(`Routes discovered: ${result.routes.length}`);
    console.log(`Connected Canvas clients: ${result.connectedClients}\n`);
    console.log('Routes loaded:');
    result.routes.forEach((route) => {
      console.log(`  - ${route}`);
    });

    if (result.connectedClients === 0) {
      console.log('\n⚠️  Warning: No Canvas clients connected.');
      console.log('   Make sure Eames Canvas is running at http://localhost:3000');
    }
  } catch (error) {
    console.error('❌ Failed to open Canvas:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Bridge server is not running.');
      console.error('\nTo start the bridge server:');
      console.error('  cd ../eames-canvas/bridge');
      console.error('  bun install');
      console.error('  bun start\n');
    } else {
      console.error(error.message);
    }
    
    process.exit(1);
  }
}

openCanvas();

