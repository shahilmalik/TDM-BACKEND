#!/bin/bash
set -e

PROJECT_DIR="/home/ubuntu/TDM-BACKEND"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_SERVICE="django.service"
NGINX_HTML="/var/www/html"

echo "== Restarting Backend =="
sudo systemctl restart $BACKEND_SERVICE
sudo systemctl status $BACKEND_SERVICE --no-pager || true

echo "== Building Frontend =="
cd $FRONTEND_DIR
npm install

# Remove Gemini SDK if present (prevents browser bundle from containing GoogleGenAI code)
npm remove @google/genai >/dev/null 2>&1 || true

# Clear Vite cache to avoid redeploying stale chunks
rm -rf node_modules/.vite dist

npm run build

echo "== Deploying Frontend (dist) =="
sudo rm -rf $NGINX_HTML/*
sudo cp -r dist/* $NGINX_HTML/

echo "== Reloading Nginx =="
sudo systemctl reload nginx

echo "== Restart + Deploy Completed Successfully 🎯 =="
