#!/usr/bin/env bash
# Moneto Health Check Script (Bash)

echo "🔍 Running Moneto Platform Health Audit..."

echo -n "Checking Backend API... "
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:5000/api/v1/health || echo "FAILED")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "🟢 OK (200)"
else
    echo "🔴 FAILED ($HTTP_STATUS)"
fi
