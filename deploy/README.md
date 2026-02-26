# Personal Vercel - Self-Hosted Deploy

Simple self-hosted static site hosting with auto-SSL.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Caddy                               │
│         (Auto-SSL + Reverse Proxy)                       │
├─────────────────────────────────────────────────────────┤
│  yourdomain.com        → InternalHub dashboard           │
│  *.yourdomain.com      → Deployed apps                   │
│  myapp.yourdomain.com  → /apps/myapp/                    │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Get a domain + VPS

- Domain: Namecheap, Cloudflare, etc (~$10/yr)
- VPS: DigitalOcean, Hetzner, etc (~$5/mo)
- Point `*.yourdomain.com` and `yourdomain.com` to your VPS IP

### 2. Install Caddy

```bash
# Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudflare.com/cloudflare-main.gpg' | sudo gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflare-main $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare.list
sudo apt update && sudo apt install caddy
```

### 3. Configure Caddy

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### 4. Run the deploy server

```bash
npm install
IH_PASSWORD=your-password node server.js
```

## Files

- `Caddyfile` - Caddy configuration for wildcard SSL + routing
- `server.js` - Simple deploy API server
- `deploy.sh` - CLI deploy script

## How It Works

1. Upload files via API or CLI
2. Files saved to `/apps/{app-name}/`
3. Caddy serves `{app-name}.yourdomain.com` from that folder
4. Auto-SSL via Let's Encrypt

## Deploy Methods

### Method 1: Web Upload (InternalHub)
Use the InternalHub dashboard to drag & drop files.

### Method 2: CLI
```bash
./deploy.sh myapp ./dist
# Deploys ./dist folder as myapp.yourdomain.com
```

### Method 3: curl
```bash
curl -X POST https://yourdomain.com/api/deploy \
  -H "Authorization: Bearer $PASSWORD" \
  -F "app=myapp" \
  -F "files=@dist.zip"
```

### Method 4: GitHub Actions
```yaml
- name: Deploy
  run: |
    zip -r dist.zip dist/
    curl -X POST ${{ secrets.DEPLOY_URL }}/api/deploy \
      -H "Authorization: Bearer ${{ secrets.DEPLOY_PASSWORD }}" \
      -F "app=${{ github.event.repository.name }}" \
      -F "files=@dist.zip"
```
