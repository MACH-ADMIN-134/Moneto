#!/usr/bin/env bash
# Moneto Environment Initialization Script (Linux / macOS)

set -e

echo "🛡 Initializing Moneto Project Stack..."

if [ ! -f .env ]; then
    echo "📄 Copying .env.example to .env..."
    cp .env.example .env
fi

echo "🐳 Launching Docker Compose Infrastructure..."
docker compose -f docker-compose.dev.yml up -d

echo "✅ Environment initialized successfully!"
