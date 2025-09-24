const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Bot SDK configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

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
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Verify webhook signature
    const signature = req.get('X-Line-Signature');
    if (!line.validateSignature(req.body, process.env.LINE_CHANNEL_SECRET, signature)) {
      console.error('❌ Invalid signature');
      return res.status(401).send('Unauthorized');
    }

    console.log('✅ Signature verified');

    const events = req.body.events;
    console.log(`📋 Processing ${events.length} events`);

    // Process each event
    for (const event of events) {
      console.log('🔍 Event details:', JSON.stringify(event, null, 2));

      if (event.type === 'message' && event.message.type === 'text') {
        const { replyToken, message, source } = event;
        const userId = source.userId;
        const messageText = message.text;

        console.log(`👤 User ${userId} sent: "${messageText}"`);

        // Send a simple echo response
        const responseText = `🤖 Bot received your message: "${messageText}"\n\nThis is a test response from your LINE Vocabulary Bot!`;

        try {
          await client.replyMessage(replyToken, {
            type: 'text',
            text: responseText
          });
          console.log('✅ Response sent successfully');
        } catch (replyError) {
          console.error('❌ Failed to send reply:', replyError);
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

