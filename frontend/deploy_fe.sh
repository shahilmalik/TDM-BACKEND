#!/bin/bash

set -e

SERVER_USER="ubuntu"
SERVER_IP="3.109.98.88"
PEM_PATH="/Users/shahilmalik/Tarviz/.ssh/tdm.pem"
SERVER_REACT_DIR="/var/www/react"

echo "----------------------------"
echo "  Local → Server Deployment "
echo "----------------------------"

### 1️⃣ Ensure .env.production exists
if [ ! -f ".env.production" ]; then
  echo "❌ ERROR: .env.production is missing!"
  echo "Create it before deployment."
  exit 1
fi

### 2️⃣ Force reading ONLY .env.production
export VITE_USER_NODE_ENV=production
export NODE_ENV=production

echo "🔍 Checking .env.production…"
grep "^VITE_" .env.production || {
  echo "❌ No VITE_ variables found in .env.production"
  exit 1
}

### 3️⃣ Validate critical variables
EXPECTED_API="https://prod.tarvizdigimart.com/api"
ACTUAL_API=$(grep "^VITE_API_BASE_URL" .env.production | cut -d '=' -f2)

if [ -z "$ACTUAL_API" ]; then
  echo "❌ ERROR: VITE_API_BASE_URL missing in .env.production"
  exit 1
fi

if [ "$ACTUAL_API" != "$EXPECTED_API" ]; then
  echo "❌ ERROR: VITE_API_BASE_URL is WRONG"
  echo "Expected: $EXPECTED_API"
  echo "Found:    $ACTUAL_API"
  exit 1
fi

echo "✅ API URL verified → $ACTUAL_API"

### 4️⃣ Build strictly in production mode
echo "📦 Building frontend with .env.production only..."
npm run build -- --mode production

### 5️⃣ Upload to server
echo "🚀 Uploading dist to server..."
scp -i "$PEM_PATH" -r dist $SERVER_USER@$SERVER_IP:~

### 6️⃣ Deploy on server
echo "🔧 Deploying on server..."
ssh -i "$PEM_PATH" $SERVER_USER@$SERVER_IP << EOF
  set -e
  sudo rm -rf $SERVER_REACT_DIR/*
  sudo cp -r ~/dist/* $SERVER_REACT_DIR/
  sudo chown -R www-data:www-data $SERVER_REACT_DIR
  rm -rf ~/dist
  sudo systemctl reload nginx
EOF

echo "✅ Deployment complete!"
echo "🌍 Live at: https://tarvizdigimart.com"
