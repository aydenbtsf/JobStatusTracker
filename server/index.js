// This is a wrapper script to start both the Python backend and the React frontend
const { spawn } = require('child_process');
const path = require('path');

console.log("Starting Job Tracking System...");

// Start the Python FastAPI backend
console.log("Starting FastAPI backend...");
const backendProcess = spawn('python', ['-m', 'uvicorn', 'api:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: path.join(process.cwd(), 'server'),
  stdio: 'inherit'
});

backendProcess.on('error', (err) => {
  console.error('Failed to start FastAPI backend:', err);
});

// Start the React frontend
console.log("Starting React frontend...");
const frontendEnv = { ...process.env, VITE_API_BASE_URL: 'http://localhost:8000' };
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(process.cwd(), 'client'),
  stdio: 'inherit',
  env: frontendEnv
});

frontendProcess.on('error', (err) => {
  console.error('Failed to start React frontend:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\nShutting down services...");
  backendProcess.kill();
  frontendProcess.kill();
});

// Log that everything is running
console.log("\n----------------------------------");
console.log("Job Tracking System is running!");
console.log("FastAPI backend: http://localhost:8000");
console.log("React frontend: http://localhost:5000");
console.log("----------------------------------");
console.log("Press Ctrl+C to stop all services");