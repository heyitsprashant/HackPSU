#!/bin/bash

# HackPSU Deployment Script for Vultr
set -e

echo "🚀 Starting deployment..."

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "📦 Installing dependencies..."
apt-get install -y nginx git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
apt-get install -y python3 python3-pip python3-venv

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Create app directory
echo "📁 Setting up application directory..."
mkdir -p /var/www/hackpsu
cd /var/www/hackpsu

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/heyitsprashant/HackPSU.git .

# Setup Backend
echo "🐍 Setting up Python backend..."
cd /var/www/hackpsu/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file for backend
cat > .env << EOL
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
EOL

# Setup Frontend
echo "⚛️ Setting up Next.js frontend..."
cd /var/www/hackpsu
npm install

# Create .env.local for frontend
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
EOL

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Setup PM2 processes
echo "🔧 Setting up PM2 processes..."

# Backend PM2 config
cat > /var/www/hackpsu/backend/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'hackpsu-backend',
    script: 'venv/bin/python',
    args: 'main.py',
    cwd: '/var/www/hackpsu/backend',
    interpreter: 'none',
    env: {
      PYTHONUNBUFFERED: '1'
    }
  }]
}
EOL

# Frontend PM2 config
cat > /var/www/hackpsu/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'hackpsu-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hackpsu',
    env: {
      PORT: 3000,
      NODE_ENV: 'production'
    }
  }]
}
EOL

# Start backend with PM2
cd /var/www/hackpsu/backend
pm2 start ecosystem.config.js

# Start frontend with PM2
cd /var/www/hackpsu
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/hackpsu << 'EOL'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 50M;
}
EOL

# Enable site
ln -sf /etc/nginx/sites-available/hackpsu /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be accessible at: http://YOUR_SERVER_IP"
echo ""
echo "📝 Next steps:"
echo "1. Edit /var/www/hackpsu/backend/.env with your API keys"
echo "2. Edit /var/www/hackpsu/.env.local with your API keys"
echo "3. Restart services: pm2 restart all"
echo ""
echo "📊 Useful commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs             - View application logs"
echo "  pm2 restart all      - Restart all services"
echo "  systemctl status nginx - Check Nginx status"
