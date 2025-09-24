# NAS Minimal Setup - Docker Deployment

This setup allows you to deploy the LINE Vocabulary Bot to your NAS using Docker.

## NAS Setup (One-time)

### 1. Create minimal directory structure on NAS

```bash
# SSH to your NAS
ssh your-username@your-nas-ip

# Create minimal directory
mkdir -p /path/to/your/bot/directory
cd /path/to/your/bot/directory

# Create only the necessary files
```

### 2. Create docker-compose.yml on NAS

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  line-vocabulary-bot:
    build:
      context: https://github.com/pidashin/line-vocabulary-bot.git#main
      dockerfile: Dockerfile
    container_name: line-vocabulary-bot
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    networks:
      - bot-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  bot-network:
    driver: bridge
EOF
```

### 3. Create .env file on NAS

```bash
# Create .env file with your LINE Bot credentials
cat > .env << 'EOF'
LINE_CHANNEL_ACCESS_TOKEN=your_actual_channel_access_token
LINE_CHANNEL_SECRET=your_actual_channel_secret
PORT=3000
NODE_ENV=production
EOF
```

### 4. Create logs directory

```bash
mkdir -p logs
```

### 5. Create update script (optional)

```bash
# Create automated update script
cat > update-bot.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating LINE Vocabulary Bot from GitHub..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "✅ Update complete!"
docker-compose ps
EOF

chmod +x update-bot.sh
```

## Deployment Flow

### From your local machine:

1. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Run deployment script:**
   ```bash
   ./deploy-github-docker.sh
   ```

3. **Follow the provided SSH commands to update on NAS**

### On your NAS:

```bash
# SSH to NAS
ssh your-username@your-nas-ip

# Navigate to bot directory
cd /path/to/your/bot/directory

# Update and restart (manual)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# OR use the update script (automated)
./update-bot.sh
```

## File Structure on NAS

```
/path/to/your/bot/directory/
├── docker-compose.yml      # Docker Compose configuration
├── .env                    # Environment variables
├── update-bot.sh          # Update script (optional)
└── logs/                  # Application logs
```

## Benefits of This Approach

- ✅ **No Git repository on NAS** - Only Docker pulls from GitHub
- ✅ **Minimal files** - Only docker-compose.yml, .env, and logs
- ✅ **Always latest** - Docker builds from GitHub main branch
- ✅ **Easy updates** - Just run docker-compose build
- ✅ **Clean deployment** - No source code clutter on NAS

## Management Commands

```bash
# View logs
docker-compose logs -f line-vocabulary-bot

# Restart
docker-compose restart

# Stop
docker-compose down

# Check status
docker-compose ps

# Health check
curl http://localhost:3000/health
```

## LINE Bot Webhook Setup

Set your webhook URL to: `http://your-nas-ip:3000/webhook`

## Troubleshooting

### Build fails
```bash
# Check if GitHub URL is accessible
curl -I https://github.com/pidashin/line-vocabulary-bot.git

# Check Docker build logs
docker-compose build --no-cache --progress=plain
```

### Container won't start
```bash
# Check logs
docker-compose logs line-vocabulary-bot

# Check environment variables
docker-compose exec line-vocabulary-bot env | grep LINE
```

### Update GitHub URL
Edit `docker-compose.yml` and change the GitHub URL to your actual repository.
