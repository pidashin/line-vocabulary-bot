const express = require('express');
const line = require('@line/bot-sdk');
const aiService = require('./services/aiService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to capture raw body for signature validation
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LINE Bot SDK configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// Check if required environment variables are set
if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
  console.error('❌ Missing required LINE Bot environment variables');
  console.error('Please set LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET in your .env file');
  process.exit(1);
}

const client = new line.Client(config);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'LINE Vocabulary Bot is running'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'LINE Vocabulary Bot Test Endpoint',
    webhook_url: `http://localhost:${PORT}/webhook`,
    instructions: [
      '1. Set your LINE Bot webhook URL to the webhook_url above',
      '2. Send a message to your LINE Bot',
      '3. Check the console for received messages'
    ]
  });
});

// LINE webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Received webhook request');
    console.log('Headers:', req.headers);

    // Check if LINE_CHANNEL_SECRET is configured
    if (!process.env.LINE_CHANNEL_SECRET) {
      console.error('❌ LINE_CHANNEL_SECRET not configured');
      return res.status(500).send('LINE_CHANNEL_SECRET not configured');
    }

    // Verify webhook signature using raw body
    const signature = req.get('X-Line-Signature');
    if (!signature) {
      console.error('❌ No signature header found');
      return res.status(401).send('No signature header');
    }

    if (!line.validateSignature(req.body, process.env.LINE_CHANNEL_SECRET, signature)) {
      console.error('❌ Invalid signature');
      return res.status(401).send('Unauthorized');
    }

    console.log('✅ Signature verified');

    // Parse the JSON body
    const body = JSON.parse(req.body.toString());
    console.log('Body:', JSON.stringify(body, null, 2));

    const events = body.events;
    console.log(`📋 Processing ${events.length} events`);

    // Process each event
    for (const event of events) {
      console.log('🔍 Event details:', JSON.stringify(event, null, 2));

      if (event.type === 'message' && event.message.type === 'text') {
        const { replyToken, message, source } = event;
        const userId = source?.userId || 'unknown';
        const messageText = message?.text || 'no text';

        console.log(`👤 User ${userId} sent: "${messageText}"`);
        console.log(`🔑 Reply token: ${replyToken ? 'present' : 'missing'}`);

        if (!replyToken) {
          console.error('❌ No reply token found, cannot send response');
          continue;
        }

        try {
          // Extract vocabulary using AI
          const vocabularyData = await aiService.extractVocabulary(messageText);
          
          if (!vocabularyData || !vocabularyData.words || vocabularyData.words.length === 0) {
            await client.replyMessage(replyToken, {
              type: 'text',
              text: '❌ No vocabulary words found in your message. Please try again with a message containing English words.'
            });
            continue;
          }

          // Format vocabulary list
          const wordCount = vocabularyData.words.length;
          let vocabularyText = `📚 Found ${wordCount} vocabulary words:\n\n`;
          
          vocabularyData.words.forEach((word, index) => {
            vocabularyText += `${index + 1}. ${word.enUS} → ${word.zhTW}\n`;
          });
          
          vocabularyText += `\n✅ Vocabulary extraction complete!`;

          // Check message length (LINE limit is 5000 characters)
          if (vocabularyText.length > 5000) {
            vocabularyText = vocabularyText.substring(0, 4990) + '\n... (truncated)';
          }

          // Send vocabulary response
          await client.replyMessage(replyToken, {
            type: 'text',
            text: vocabularyText
          });
          
          console.log('✅ Vocabulary response sent successfully');
        } catch (error) {
          console.error('❌ Failed to process vocabulary:', error);
          
          // Send error response (only if we haven't sent a reply yet)
          try {
            await client.replyMessage(replyToken, {
              type: 'text',
              text: '❌ Sorry, something went wrong while processing your message. Please try again later.'
            });
          } catch (replyError) {
            console.error('❌ Failed to send error response:', replyError);
          }
        }
      } else {
        console.log(`ℹ️  Ignoring event type: ${event.type}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 LINE Vocabulary Bot Server Started');
  console.log(`📱 Server running on port ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Make sure your .env file has LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET');
  console.log('2. Set your LINE Bot webhook URL to: http://localhost:3000/webhook');
  console.log('3. Send a message to your LINE Bot to test!');
  console.log('');
});

module.exports = app;

