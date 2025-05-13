import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { spawn } from "child_process";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Start FastAPI server
  startFastAPIServer();

  // Proxy all API requests to the FastAPI server
  app.use('/api', async (req, res, next) => {
    try {
      // Forward the request to FastAPI
      const url = `http://localhost:8000${req.url}`;
      const options: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add body for non-GET requests
      if (req.method !== 'GET' && req.body) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      // Forward the response
      res.status(response.status).json(data);
    } catch (error) {
      log(`API error: ${error}`, 'error');
      next(error);
    }
  });

  return httpServer;
}

function startFastAPIServer() {
  const serverDir = path.resolve(process.cwd(), 'server');
  const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

  // Install required packages if needed (add this when deploying)
  // const installProcess = spawn(pythonCommand, ['-m', 'pip', 'install', '-r', path.join(serverDir, 'requirements.txt')]);
  // installProcess.on('close', (code) => {
  //   log(`pip install exited with code ${code}`);
  // });

  // Start FastAPI server
  const apiProcess = spawn(pythonCommand, ['-m', 'uvicorn', 'api:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: serverDir,
    stdio: 'pipe',
  });

  // Log output
  apiProcess.stdout.on('data', (data) => {
    log(`FastAPI: ${data}`, 'fastapi');
  });

  apiProcess.stderr.on('data', (data) => {
    log(`FastAPI error: ${data}`, 'error');
  });

  apiProcess.on('close', (code) => {
    log(`FastAPI server exited with code ${code}`, 'error');
  });

  // Handle process exit
  process.on('exit', () => {
    apiProcess.kill();
  });
}
