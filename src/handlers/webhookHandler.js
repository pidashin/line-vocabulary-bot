const line = require('@line/bot-sdk');
const lineBotHandler = require('./lineBotHandler');

// LINE Bot SDK configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

const webhookHandler = async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.get('X-Line-Signature');
    if (!line.validateSignature(req.body, process.env.LINE_CHANNEL_SECRET, signature)) {
      console.error('Invalid signature');
      return res.status(401).send('Unauthorized');
    }

    const events = req.body.events;
    
    // Process each event
    for (const event of events) {
      await lineBotHandler.handleEvent(event, client);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = webhookHandler;
