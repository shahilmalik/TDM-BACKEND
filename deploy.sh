#!/bin/bash
set -e

PROJECT_DIR="/home/ubuntu/TDM-BACKEND"
FRONTEND_DIST="$PROJECT_DIR/frontend/dist"
BACKEND_SERVICE="django.service"
NGINX_HTML="/var/www/html"

echo "== Restarting Backend =="
sudo systemctl restart $BACKEND_SERVICE
sudo systemctl status $BACKEND_SERVICE --no-pager || true

echo "== Deploying Frontend (already built locally) =="
if [ ! -d "$FRONTEND_DIST" ]; then
    echo "❌ dist folder not found at $FRONTEND_DIST"
    exit 1
fi

sudo rm -rf $NGINX_HTML/*
sudo cp -r $FRONTEND_DIST/* $NGINX_HTML/

echo "== Reloading Nginx =="
sudo systemctl reload nginx

echo "== Deployment Completed Successfully 🎯 =="
