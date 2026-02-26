#!/usr/bin/env node

/**
 * Personal Vercel - Simple Deploy Server
 * 
 * Handles file uploads and extracts them to /var/www/apps/{app-name}
 * Works with Caddy for wildcard subdomain routing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Config
const PORT = process.env.PORT || 3001;
const PASSWORD = process.env.IH_PASSWORD || 'demo123';
const APPS_DIR = process.env.APPS_DIR || '/var/www/apps';

// Ensure apps directory exists
if (!fs.existsSync(APPS_DIR)) {
  fs.mkdirSync(APPS_DIR, { recursive: true });
}

// Simple multipart parser (for small files)
function parseMultipart(buffer, boundary) {
  const parts = {};
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2; // skip \r\n
  
  while (start < buffer.length) {
    const end = buffer.indexOf(boundaryBuffer, start);
    if (end === -1) break;
    
    const part = buffer.slice(start, end - 2); // remove trailing \r\n
    const headerEnd = part.indexOf('\r\n\r\n');
    const headers = part.slice(0, headerEnd).toString();
    const content = part.slice(headerEnd + 4);
    
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    
    if (nameMatch) {
      const name = nameMatch[1];
      if (filenameMatch) {
        parts[name] = { filename: filenameMatch[1], data: content };
      } else {
        parts[name] = content.toString();
      }
    }
    
    start = end + boundaryBuffer.length + 2;
  }
  
  return parts;
}

// Extract zip to directory
function extractZip(zipPath, destDir) {
  execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'pipe' });
}

// Handle deploy request
async function handleDeploy(req, res, body) {
  try {
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing boundary in content-type' }));
      return;
    }
    
    const parts = parseMultipart(body, boundary);
    const appName = parts.app?.trim();
    const files = parts.files;
    
    if (!appName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing app name' }));
      return;
    }
    
    // Sanitize app name
    const safeName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const appDir = path.join(APPS_DIR, safeName);
    
    // Create app directory
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true });
    }
    fs.mkdirSync(appDir, { recursive: true });
    
    if (files && files.filename) {
      // Handle zip file
      if (files.filename.endsWith('.zip')) {
        const tmpZip = `/tmp/${Date.now()}.zip`;
        fs.writeFileSync(tmpZip, files.data);
        extractZip(tmpZip, appDir);
        fs.unlinkSync(tmpZip);
        
        // If extracted to a subdirectory, move files up
        const entries = fs.readdirSync(appDir);
        if (entries.length === 1) {
          const subdir = path.join(appDir, entries[0]);
          if (fs.statSync(subdir).isDirectory()) {
            const subfiles = fs.readdirSync(subdir);
            for (const f of subfiles) {
              fs.renameSync(path.join(subdir, f), path.join(appDir, f));
            }
            fs.rmdirSync(subdir);
          }
        }
      } else {
        // Single file
        fs.writeFileSync(path.join(appDir, files.filename), files.data);
      }
    }
    
    console.log(`✓ Deployed: ${safeName}`);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      app: safeName,
      url: `https://${safeName}.yourdomain.com`, // Update with actual domain
      files: fs.readdirSync(appDir),
    }));
    
  } catch (err) {
    console.error('Deploy error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// List deployed apps
function handleList(req, res) {
  try {
    const apps = fs.readdirSync(APPS_DIR)
      .filter(f => fs.statSync(path.join(APPS_DIR, f)).isDirectory())
      .map(name => {
        const appPath = path.join(APPS_DIR, name);
        const stats = fs.statSync(appPath);
        const files = fs.readdirSync(appPath);
        return {
          name,
          url: `https://${name}.yourdomain.com`,
          files: files.length,
          modified: stats.mtime,
        };
      });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ apps }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Delete app
function handleDelete(req, res, appName) {
  try {
    const safeName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const appDir = path.join(APPS_DIR, safeName);
    
    if (!fs.existsSync(appDir)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'App not found' }));
      return;
    }
    
    fs.rmSync(appDir, { recursive: true });
    console.log(`✓ Deleted: ${safeName}`);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, deleted: safeName }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Check auth
function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return token === PASSWORD;
}

// Request handler
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', apps_dir: APPS_DIR }));
    return;
  }
  
  // Auth required for everything else
  if (!checkAuth(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  // Routes
  if (url.pathname === '/api/deploy' && req.method === 'POST') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => handleDeploy(req, res, Buffer.concat(chunks)));
    return;
  }
  
  if (url.pathname === '/api/apps' && req.method === 'GET') {
    handleList(req, res);
    return;
  }
  
  if (url.pathname.startsWith('/api/apps/') && req.method === 'DELETE') {
    const appName = url.pathname.split('/')[3];
    handleDelete(req, res, appName);
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║         Personal Vercel - Deploy Server        ║
╠═══════════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(38)}║
║  Apps: ${APPS_DIR.padEnd(38)}║
║  Password: ${PASSWORD.slice(0, 3)}${'*'.repeat(PASSWORD.length - 3).padEnd(34)}║
╚═══════════════════════════════════════════════╝

Endpoints:
  POST /api/deploy     Deploy an app (multipart: app, files)
  GET  /api/apps       List all apps
  DELETE /api/apps/:id Delete an app
  GET  /health         Health check

Example:
  curl -X POST http://localhost:${PORT}/api/deploy \\
    -H "Authorization: Bearer ${PASSWORD}" \\
    -F "app=mysite" \\
    -F "files=@dist.zip"
`);
});
