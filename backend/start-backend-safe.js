import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting WasteWise Backend...');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  install.on('close', (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.error('❌ Failed to install dependencies');
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🔧 Starting server...');
  const server = spawn('node', ['server.js'], { stdio: 'inherit' });
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
  });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}