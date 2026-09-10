// Aunt Harriot — headless control loop (hardened)
//
// Replaces setup/ideas-from-Gemini/harriot-orchestrator.js, which is deprecated (reference only)
// as of 2026-09-10 — see AGENT-SYNC/created-by-mystarch/2026-09-10_harriot-pipeline-security-review.md.
// Logic is unchanged from the original (this file had no injection risk of its own — it only
// shells out to fixed commands, never user-supplied strings); moved here so the whole pipeline
// lives in one place and points at the hardened scripts.

import { execFileSync, spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function runCommand(cmd, args, live = false) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data;
      if (live) process.stdout.write(data);
    });
    proc.stderr.on('data', (data) => {
      if (live) process.stderr.write(data);
    });
    proc.on('close', (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error(`Command "${cmd} ${args.join(' ')}" exited with code ${code}`));
    });
  });
}

async function startDashboardLoop() {
  console.clear();
  console.log('=================================================');
  console.log('AUNT HARRIOT HEADLESS CONTROL INTERFACE (hardened)');
  console.log('=================================================');
  console.log('[1] Extract Workspace Delta & Generate XML');
  console.log('[2] Run Claude CLI Review Pipe');
  console.log('[3] Full Loop: Extract, Review');
  console.log('[exit] Close Terminal Loop');
  console.log('-------------------------------------------------');

  rl.question('Harriot Command> ', async (input) => {
    const choice = input.trim().toLowerCase();

    if (choice === 'exit') {
      console.log('Goodbye, Alfred.');
      rl.close();
      process.exit(0);
    }

    try {
      if (choice === '1' || choice === '3') {
        console.log('\nRunning extraction script...');
        execFileSync('node', ['pipeline/extract-workspace-delta.js'], { stdio: 'inherit' });
      }
      if (choice === '2' || choice === '3') {
        console.log('\nPiping payload into Claude CLI validation engine...');
        await runCommand('bash', ['pipeline/harriot-pipe.sh'], true);
      }
    } catch (error) {
      console.error(`\nPipeline interrupted: ${error.message}`);
    }

    setTimeout(startDashboardLoop, 1500);
  });
}

if (!fs.existsSync('./.harriot')) fs.mkdirSync('./.harriot');
startDashboardLoop();
