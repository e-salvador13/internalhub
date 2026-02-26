#!/bin/bash

# Personal Vercel - CLI Deploy Script
# Usage: ./deploy.sh <app-name> <folder-or-file>

set -e

# Config - set these or use env vars
DEPLOY_URL="${DEPLOY_URL:-http://localhost:3001}"
DEPLOY_PASSWORD="${DEPLOY_PASSWORD:-demo123}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help
if [ "$1" == "-h" ] || [ "$1" == "--help" ] || [ -z "$1" ]; then
    echo "Personal Vercel - Deploy CLI"
    echo ""
    echo "Usage: $0 <app-name> <folder-or-file>"
    echo ""
    echo "Examples:"
    echo "  $0 mysite ./dist           # Deploy folder"
    echo "  $0 mysite ./build.zip      # Deploy zip"
    echo "  $0 mysite ./index.html     # Deploy single file"
    echo ""
    echo "Environment variables:"
    echo "  DEPLOY_URL      Deploy server URL (default: http://localhost:3001)"
    echo "  DEPLOY_PASSWORD Password (default: demo123)"
    exit 0
fi

APP_NAME="$1"
SOURCE="$2"

if [ -z "$SOURCE" ]; then
    echo -e "${RED}Error: Please specify a folder or file to deploy${NC}"
    exit 1
fi

if [ ! -e "$SOURCE" ]; then
    echo -e "${RED}Error: '$SOURCE' not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying '$APP_NAME'...${NC}"

# Create zip if it's a directory
if [ -d "$SOURCE" ]; then
    echo "Zipping folder..."
    TMP_ZIP="/tmp/deploy-${APP_NAME}-$(date +%s).zip"
    (cd "$SOURCE" && zip -r "$TMP_ZIP" . -x "*.git*" -x "node_modules/*" -x ".DS_Store")
    UPLOAD_FILE="$TMP_ZIP"
    CLEANUP=true
elif [[ "$SOURCE" == *.zip ]]; then
    UPLOAD_FILE="$SOURCE"
    CLEANUP=false
else
    # Single file - wrap in zip
    TMP_ZIP="/tmp/deploy-${APP_NAME}-$(date +%s).zip"
    zip -j "$TMP_ZIP" "$SOURCE"
    UPLOAD_FILE="$TMP_ZIP"
    CLEANUP=true
fi

# Deploy
echo "Uploading to $DEPLOY_URL..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$DEPLOY_URL/api/deploy" \
    -H "Authorization: Bearer $DEPLOY_PASSWORD" \
    -F "app=$APP_NAME" \
    -F "files=@$UPLOAD_FILE")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Cleanup
if [ "$CLEANUP" = true ]; then
    rm -f "$UPLOAD_FILE"
fi

# Check result
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Deployed successfully!${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Deploy failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    exit 1
fi
