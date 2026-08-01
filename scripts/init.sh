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

echo "📦 Installing Backend Dependencies..."
cd backend && npm install && cd ..

echo "🔧 Generating Prisma Client..."
cd backend && npx prisma generate && cd ..

echo "🗄 Running Prisma Migrations..."
cd backend && npx prisma migrate deploy && cd ..

echo "🌱 Seeding Default Categories..."
cd backend && npx prisma db seed && cd ..

echo "✅ Environment initialized successfully!"
echo ""
echo "🌐 Available Endpoints:"
echo "   API:      http://localhost:5000/api/v1/health"
echo "   Frontend: http://localhost:3000"
echo "   Studio:   npx prisma studio (run inside ./backend)"
