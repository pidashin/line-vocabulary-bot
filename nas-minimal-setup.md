# NAS Minimal Setup - Docker Deployment

This setup allows you to deploy the LINE Vocabulary Bot to your NAS using Docker.

## NAS Setup (One-time)

### 1. Create minimal directory structure on NAS

```bash
# SSH to your NAS
ssh your-username@your-nas-ip

# Create minimal directory
# Create minimal directory
mkdir -p /volume1/docker/line-vocabulary-bot
cd /volume1/docker/line-vocabulary-bot

# Create data directory for images and OCR results
mkdir -p /volume1/docker/data/line-bot-images

# OCR results will be stored in /volume1/docker/data/ocr-results.json

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
      - /volume1/docker/data/line-bot-images:/app/storage/images
      - /volume1/docker/data:/app/storage/ocr-results
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
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_actual_channel_access_token
LINE_CHANNEL_SECRET=your_actual_channel_secret

# Image Bot Configuration
IMG_BOT_CHANNEL_ACCESS_TOKEN=your_actual_img_bot_channel_access_token
IMG_BOT_CHANNEL_SECRET=your_actual_img_bot_channel_secret

# Server Configuration
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

### 6. Updating Configuration (if needed)

If you need to update your `.env` file (e.g., adding Image Bot credentials):

```bash
# Option 1: Edit directly on NAS
nano .env

# Option 2: Overwrite with new content
cat > .env << 'EOF'
LINE_CHANNEL_ACCESS_TOKEN=new_token
...
EOF

# After updating .env, restart the container
docker-compose down
docker-compose up -d
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

# View OCR results
cat /volume1/docker/data/ocr-results.json | jq .

# Count total OCR results
cat /volume1/docker/data/ocr-results.json | jq 'length'

# Filter by subject (e.g., 數學)
cat /volume1/docker/data/ocr-results.json | jq '.[] | select(.subject == "數學")'

# Backup OCR results
cp /volume1/docker/data/ocr-results.json ~/ocr-backup-$(date +%Y%m%d).json
```

## OCR Results Storage

The bot now saves all successful OCR results to `/volume1/docker/data/ocr-results.json`.

### Data Structure

Each OCR result includes:
- `id`: Unique timestamp-based identifier
- `timestamp`: ISO 8601 timestamp
- `subject`: Subject classification (國語, 數學, 自然, 社會, 英文)
- `userId`: LINE user ID
- `imagePath`: Path to original image
- `ocrData`: Complete Gemini OCR result
- `status`: "success"

### Future Migration

The JSON structure is designed for easy migration to a database:
- Each result has a unique ID
- Timestamps are in ISO format
- Structure maps directly to database tables
- When ready, migrate to SQLite or MongoDB for better performance
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
