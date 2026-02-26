#!/bin/bash

# Personal Vercel - VPS Setup Script
# Run on a fresh Ubuntu 22.04+ VPS

set -e

# Config
DOMAIN="${1:-yourdomain.com}"
PASSWORD="${2:-$(openssl rand -hex 16)}"

echo "╔═══════════════════════════════════════════════╗"
echo "║      Personal Vercel - VPS Setup              ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  Domain: $DOMAIN"
echo "║  This will install: Node.js, Caddy, PM2      ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update system
echo "Updating system..."
apt update && apt upgrade -y

# Install Node.js 20
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Caddy
echo "Installing Caddy..."
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudflare.com/cloudflare-main.gpg' | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflare-main $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflare.list
apt update
apt install -y caddy

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Create directories
echo "Creating directories..."
mkdir -p /var/www/apps
mkdir -p /opt/internalhub

# Copy server files
echo "Setting up deploy server..."
cp server.js /opt/internalhub/
cd /opt/internalhub

# Create package.json
cat > package.json << EOF
{
  "name": "internalhub-deploy",
  "version": "1.0.0",
  "main": "server.js"
}
EOF

# Configure Caddy
echo "Configuring Caddy..."
cat > /etc/caddy/Caddyfile << EOF
# InternalHub - Personal Vercel

# Main dashboard + API
${DOMAIN} {
    # Deploy API
    handle /api/deploy* {
        reverse_proxy localhost:3001
    }
    handle /api/apps* {
        reverse_proxy localhost:3001
    }
    handle /health {
        reverse_proxy localhost:3001
    }
    
    # Dashboard (if running InternalHub web)
    handle {
        reverse_proxy localhost:3000
    }
}

# Wildcard for deployed apps
*.${DOMAIN} {
    root * /var/www/apps/{labels.2}
    try_files {path} {path}/ /index.html
    file_server
    
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
    }
    
    handle_errors {
        respond "App not found" 404
    }
}
EOF

# Start services
echo "Starting services..."
systemctl restart caddy
pm2 start /opt/internalhub/server.js --name deploy-server -- --env PORT=3001 --env IH_PASSWORD="$PASSWORD" --env APPS_DIR=/var/www/apps
pm2 save
pm2 startup

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║              Setup Complete!                  ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  Domain: $DOMAIN"
echo "║  Password: $PASSWORD"
echo "╠═══════════════════════════════════════════════╣"
echo "║  Deploy command:                              ║"
echo "║  curl -X POST https://$DOMAIN/api/deploy \\"
echo "║    -H 'Authorization: Bearer $PASSWORD' \\"
echo "║    -F 'app=mysite' -F 'files=@dist.zip'      ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "DNS: Point *.${DOMAIN} and ${DOMAIN} to this server's IP"
echo ""
echo "Save this password: $PASSWORD"
