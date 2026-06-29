#!/bin/bash

# Ensure background jobs are terminated cleanly on exit
trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM

echo "============================================="
echo "   KSP CRIME ANALYTICS - STARTUP SYSTEM      "
echo "============================================="

# 1. Clean up active ports to prevent binding conflicts
echo "Checking and freeing ports 3000 and 8000..."
for port in 3000 8000; do
  PID=$(lsof -t -i:$port)
  if [ ! -z "$PID" ]; then
    echo "Killing conflicting process $PID on port $port..."
    kill -9 $PID 2>/dev/null
  fi
done

# 2. Spin up Python FastAPI Backend
echo "Starting FastAPI backend on port 8000..."
cd ksp-crime-analytics-backend
../ai_env/bin/uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait briefly for FastAPI server to initialize
sleep 2.5

# 3. Spin up Next.js React Frontend
echo "Starting Next.js frontend on port 3000..."
cd ksp-crime-portal
npm run dev &
FRONTEND_PID=$!
cd ..

echo "---------------------------------------------"
echo "System Running:"
echo "  - Backend API: http://localhost:8000"
echo "  - Frontend UI: http://localhost:3000"
echo "Press Ctrl+C to terminate both servers."
echo "============================================="

# Keep script alive and wait for child processes
wait
