# LINE Vocabulary Bot

A LINE bot that extracts vocabulary words from teacher messages using AI and translates them into English-Traditional Chinese pairs.

## Features

- 🤖 **AI-First Parsing**: Uses Google Gemini (free-tier models) to extract vocabulary words from messages
- 🌐 **Automatic Translation**: Translates English words to Traditional Chinese (Taiwan)
- 📱 **LINE Integration**: Full LINE Bot SDK integration with webhook handling
- 🖼️ **Image Bot**: Receives images, saves them locally with timestamps, and replies with confirmation
- 🎯 **WordBridge Integration**: Automatically adds extracted vocabulary to WordBridge collection

## Flow

### Vocabulary Bot Flow

1. **Teacher sends message** → Bot receives webhook
2. **AI Processing** → Bot sends message text to Gemini
3. **Vocabulary Extraction** → AI returns structured JSON with word pairs
4. **Display Results** → Bot shows formatted vocabulary list to user
5. **WordBridge Integration** → Automatically adds words to WordBridge collection
6. **Success Feedback** → Bot confirms successful addition to WordBridge

### Image Bot Flow

1. **User sends image** → Bot receives webhook
2. **Save Image** → Bot saves image to `./temp/` with timestamp filename
3. **Reply** → Bot replies "圖片已收到！"

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd line-vocabulary-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure your `.env` file with the required credentials (see Configuration section).

## Configuration

Create a `.env` file with the following variables:

```env
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# Image Bot Configuration
IMG_BOT_CHANNEL_ACCESS_TOKEN=your_img_bot_channel_access_token_here
IMG_BOT_CHANNEL_SECRET=your_img_bot_channel_secret_here

# AI Service Configuration (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
# Optional overrides (free-tier models)
# GEMINI_TEXT_MODEL=gemini-3.5-flash-lite
# GEMINI_MODEL=gemini-2.5-flash

# WordBridge API Configuration
WORDBRIDGE_API_URL=https://pidashinnas.myds.me/projects/wordbridge/api/graphql

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Getting LINE Bot Credentials

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider and channel
3. Choose "Messaging API" as the channel type
4. Get your Channel Access Token and Channel Secret from the Basic settings

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key (the free tier is enough; the bot only uses free-tier models)

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The bot will be available at `http://localhost:3000` with the webhook endpoint at `/webhook`.

### Setting up Webhook

#### Vocabulary Bot

1. In LINE Developers Console, set your webhook URL to:
   ```
   https://your-domain.com/webhook
   ```

2. Enable "Use webhook" in the Messaging API settings

3. Verify the webhook is working by sending a test message

#### Image Bot

1. In LINE Developers Console (for the Image Bot channel), set your webhook URL to:
   ```
   https://your-domain.com/imgsave/webhook
   ```

2. Enable "Use webhook" in the Messaging API settings

3. Verify the webhook is working by sending an image

## API Response Format

The AI service returns vocabulary data in this format:

```json
{
  "words": [
    { "enUS": "basement", "zhTW": "地下室" },
    { "enUS": "work", "zhTW": "工作" },
    { "enUS": "tool", "zhTW": "工具" }
  ]
}
```

## WordBridge Integration

The bot automatically adds extracted vocabulary to your WordBridge collection using GraphQL mutations. The integration includes:

- **Automatic Addition**: Words are added immediately after extraction
- **GraphQL Support**: Uses your WordBridge GraphQL API endpoint
- **Error Handling**: Graceful fallback if WordBridge is unavailable
- **Testing Mode**: Mock responses when API is not configured

### WordBridge Configuration

Set up your WordBridge API in the `.env` file:

```env
WORDBRIDGE_API_URL=https://pidashinnas.myds.me/projects/wordbridge/api/graphql
```


## Testing

The bot includes fallback mechanisms for testing:

- If the Gemini API is not configured or fails, it uses a simple word extraction fallback
- If WordBridge API is not configured, it operates in testing mode with mock responses
- All services include comprehensive error handling

## Project Structure

```
src/
├── handlers/
│   ├── lineBotHandler.js    # Main bot logic and event handling
│   └── webhookHandler.js    # LINE webhook processing
├── services/
│   ├── aiService.js         # Gemini AI integration for vocabulary extraction
│   └── wordBridgeService.js # WordBridge GraphQL API integration
├── utils/
│   └── messageFormatter.js  # LINE message formatting utilities
└── index.js                 # Main application entry point
```

## Error Handling

The bot includes comprehensive error handling:

- Invalid webhook signatures
- AI service failures
- App API connection issues
- Malformed vocabulary data
- Session management and cleanup

## Security

- Webhook signature verification
- Environment variable protection
- Input validation and sanitization
- Session timeout and cleanup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

