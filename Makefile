# Moneto Monorepo Developer Makefile

.PHONY: help dev build test lint docker-up docker-down clean

help:
	@echo "Moneto Platform Development Commands:"
	@echo "  make dev          - Start backend and frontend in development mode"
	@echo "  make build        - Compile TypeScript builds for backend and frontend"
	@echo "  make test         - Run Vitest integration test suite"
	@echo "  make lint         - Run ESLint checks across monorepo"
	@echo "  make docker-up    - Launch production Docker Compose stack"
	@echo "  make docker-down  - Stop all running Docker containers"
	@echo "  make prisma-studio- Open Prisma Studio database GUI"

dev:
	npm run backend:dev

build:
	npm run backend:build
	npm run frontend:build

test:
	cd backend && npm run test

lint:
	npm run lint

docker-up:
	docker compose up -d

docker-down:
	docker compose down

prisma-studio:
	cd backend && npm run prisma:studio
