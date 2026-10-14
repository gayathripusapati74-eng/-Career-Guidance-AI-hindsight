/**
 * Cross-Platform Build Script for Vercel & Production
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const rootDist = path.join(__dirname, '..', 'dist');

console.log('[Build] 1. Installing frontend dependencies...');
execSync('npm install --include=dev', { cwd: frontendDir, stdio: 'inherit' });

console.log('[Build] 2. Building Vite frontend bundle...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

console.log('[Build] 3. Copying frontend/dist to root dist directory...');
if (fs.existsSync(rootDist)) {
  fs.rmSync(rootDist, { recursive: true, force: true });
}
fs.cpSync(frontendDist, rootDist, { recursive: true });

console.log('[Build] Verification: Checking for index.html in root dist...');
if (fs.existsSync(path.join(rootDist, 'index.html'))) {
  console.log('[Build] Success! dist/index.html is verified and ready for Vercel deployment.');
} else {
  console.error('[Build] Warning: index.html was not found in dist.');
}
