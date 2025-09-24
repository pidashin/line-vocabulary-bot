npm i# LINE Vocabulary Bot

A LINE bot that extracts vocabulary words from teacher messages using AI and translates them into English-Traditional Chinese pairs.

## Features

- 🤖 **AI-First Parsing**: Uses OpenAI GPT to extract vocabulary words from messages
- 🌐 **Automatic Translation**: Translates English words to Traditional Chinese (Taiwan)
- ✅ **User Confirmation**: Interactive confirmation flow with buttons
- 📱 **LINE Integration**: Full LINE Bot SDK integration with webhook handling
- 🔗 **App Integration**: Uploads confirmed vocabulary to external app API

## Flow

1. **Teacher sends message** → Bot receives webhook
2. **AI Processing** → Bot sends message text to OpenAI
3. **Vocabulary Extraction** → AI returns structured JSON with word pairs
4. **User Confirmation** → Bot shows formatted list with confirm/cancel buttons
5. **Upload to App** → On confirmation, vocabulary is uploaded to app API
6. **Success Feedback** → Bot confirms successful upload

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

# AI Service Configuration (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# App API Configuration
APP_API_BASE_URL=https://your-app-api.com
APP_API_KEY=your_app_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Getting LINE Bot Credentials

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new provider and channel
3. Choose "Messaging API" as the channel type
4. Get your Channel Access Token and Channel Secret from the Basic settings

### Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add billing information to use the API

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

1. In LINE Developers Console, set your webhook URL to:
   ```
   https://your-domain.com/webhook
   ```

2. Enable "Use webhook" in the Messaging API settings

3. Verify the webhook is working by sending a test message

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

## App API Integration

The bot uploads vocabulary to your app API with this payload:

```json
{
  "words": [
    { "enUS": "word", "zhTW": "翻譯" }
  ],
  "source": "line_bot",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "total_words": 1,
    "extracted_at": "2024-01-01T00:00:00.000Z"
  }
}
```

Expected app API endpoint: `POST /api/vocabulary/upload`

## Testing

The bot includes fallback mechanisms for testing:

- If OpenAI API is not configured, it uses a simple word extraction fallback
- If app API is not configured, it returns mock success responses
- All services include comprehensive error handling

## Project Structure

```
src/
├── handlers/
│   ├── lineBotHandler.js    # Main bot logic and event handling
│   └── webhookHandler.js    # LINE webhook processing
├── services/
│   ├── aiService.js         # OpenAI integration for vocabulary extraction
│   └── appService.js        # External app API integration
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

