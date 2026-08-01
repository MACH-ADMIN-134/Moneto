# Multi-stage production Dockerfile for Moneto Backend API

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
