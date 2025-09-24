#!/bin/bash

# LINE Vocabulary Bot - NAS Deployment Script

echo "🚀 Deploying LINE Vocabulary Bot to NAS..."

# Load configuration from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Loaded configuration from .env file"
else
    echo "❌ .env file not found. Please create it with your NAS configuration."
    echo "Required variables: NAS_HOST, NAS_USER, NAS_PATH"
    exit 1
fi

# Check if required variables are set
if [ -z "$NAS_HOST" ] || [ -z "$NAS_USER" ] || [ -z "$NAS_PATH" ]; then
    echo "❌ Missing required NAS configuration in .env file"
    echo "Please add the following to your .env file:"
    echo "NAS_HOST=your-nas-ip-or-hostname"
    echo "NAS_USER=your-nas-username"
    echo "NAS_PATH=/path/to/your/bot/directory"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 NAS Deployment Flow:${NC}"
echo "1. SSH to NAS and update Docker container"
echo "2. Restart container with new image"
echo ""

# Generate deployment commands
echo -e "${BLUE}🔧 Deployment Commands for NAS:${NC}"
echo ""
echo -e "${GREEN}# SSH to your NAS${NC}"
echo "ssh $NAS_USER@$NAS_HOST"
echo ""
echo -e "${GREEN}# Navigate to your bot directory${NC}"
echo "cd $NAS_PATH"
echo ""
echo -e "${GREEN}# Update and restart container${NC}"
echo "docker-compose down"
echo "docker-compose build --no-cache"
echo "docker-compose up -d"
echo ""
echo -e "${GREEN}# Check container status${NC}"
echo "docker-compose ps"
echo ""
echo -e "${GREEN}# View logs${NC}"
echo "docker-compose logs -f line-vocabulary-bot"
echo ""

echo -e "${YELLOW}📋 After deployment:${NC}"
echo "1. Set your LINE Bot webhook URL to: http://$NAS_HOST:3000/webhook"
echo "2. Test by sending a message to your LINE Bot"
echo "3. Check logs: docker-compose logs -f line-vocabulary-bot"
echo ""

echo -e "${BLUE}💡 Pro tip:${NC}"
echo "You can also create a simple script on your NAS to automate this:"
echo ""
echo -e "${GREEN}# Create update script on NAS${NC}"
echo "echo '#!/bin/bash' > update-bot.sh"
echo "echo 'cd $NAS_PATH' >> update-bot.sh"
echo "echo 'docker-compose down' >> update-bot.sh"
echo "echo 'docker-compose build --no-cache' >> update-bot.sh"
echo "echo 'docker-compose up -d' >> update-bot.sh"
echo "chmod +x update-bot.sh"
echo ""
echo "Then just run: ./update-bot.sh"
