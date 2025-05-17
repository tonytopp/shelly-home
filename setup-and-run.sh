#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
# Shelly Smart Home Environment Variables

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
# MQTT_USERNAME=your_mqtt_username
# MQTT_PASSWORD=your_mqtt_password

# Server Configuration
PORT=5000
NODE_ENV=development
EOF
  echo ".env file created. Please edit it with your MQTT settings."
  echo "Then run this script again to start the application."
  exit 0
else
  echo ".env file already exists."
fi

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
  echo "Creating data directory..."
  mkdir -p data
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Initialize the database
echo "Initializing database..."
npm run db:push

# Start the development server
echo "Starting development server..."
npm run dev
