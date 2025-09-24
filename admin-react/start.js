// Alternative startup script for shared hosting
// Some hosting providers prefer this simpler approach

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Fresh County Admin Panel...');
console.log('Node.js version:', process.version);
console.log('Working directory:', process.cwd());

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3002;

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Start the Next.js server
const serverPath = path.join(__dirname, 'server.js');
const child = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  child.kill('SIGINT');
});