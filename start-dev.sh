#!/bin/bash

echo "Starting Interview Practice Development Environment..."

echo ""
echo "Starting FastAPI Backend..."
cd backend && python start.py &
BACKEND_PID=$!

echo ""
echo "Waiting for backend to start..."
sleep 3

echo ""
echo "Starting Next.js Frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Development environment started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
