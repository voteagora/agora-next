#!/usr/bin/env node

/**
 * Trigger script to open Eames Canvas with agora-next routes
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectPath = join(__dirname, '..');

const BRIDGE_URL = 'http://localhost:4000';

// Get port from command line arg or try to detect it
async function getDevServerPort() {
  // Check if port provided as argument
  const portArg = process.argv.find(arg => arg.startsWith('--port='));
  if (portArg) {
    return parseInt(portArg.split('=')[1]);
  }

  // Try to detect running Next.js dev server
  try {
    const { stdout } = await execAsync('lsof -ti:3001,3000,3002 -sTCP:LISTEN');
    const pids = stdout.trim().split('\n').filter(Boolean);
    
    for (const pid of pids) {
      try {
        const { stdout: cmdOutput } = await execAsync(`ps -p ${pid} -o command=`);
        if (cmdOutput.includes('next dev') || cmdOutput.includes('next-server')) {
          // Found Next.js dev server, check which port
          const { stdout: portOutput } = await execAsync(`lsof -Pan -p ${pid} -iTCP -sTCP:LISTEN | grep LISTEN`);
          const match = portOutput.match(/:(\d+)/);
          if (match) {
            return parseInt(match[1]);
          }
        }
      } catch (e) {
        // Continue checking other PIDs
      }
    }
  } catch (e) {
    // Could not detect, fall back to default
  }

  // Default to 3000
  return 3000;
}

async function openCanvas() {
  console.log('🎨 Opening Eames Canvas...\n');

  try {
    const DEV_PORT = await getDevServerPort();
    
    console.log(`Project: ${projectPath}`);
    console.log(`Dev Server: http://localhost:${DEV_PORT}\n`);

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
