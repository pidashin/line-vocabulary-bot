const line = require('@line/bot-sdk');
const fs = require('fs');
const path = require('path');

// Configuration for Image Bot
const config = {
  channelAccessToken: process.env.IMG_BOT_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.IMG_BOT_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET,
};

// Create Line Client
const client = new line.Client(config);

// Ensure storage directory exists
const storagePath = process.env.IMAGE_STORAGE_PATH || path.join(__dirname, '../../temp');
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'image') {
    // Ignore non-image messages
    return Promise.resolve(null);
  }

  try {
    // Get image content
    const stream = await client.getMessageContent(event.message.id);
    
    // Generate filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `${timestamp}.jpg`;
    const filepath = path.join(storagePath, filename);

    // Save image to file
    const writable = fs.createWriteStream(filepath);
    stream.pipe(writable);

    await new Promise((resolve, reject) => {
      writable.on('finish', resolve);
      writable.on('error', reject);
    });

    console.log(`Image saved to ${filepath}`);

    // Reply to user
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '圖片已收到！',
    });
  } catch (error) {
    console.error('Error handling image:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '處理圖片時發生錯誤。',
    });
  }
}

module.exports = {
  config,
  handleEvent,
};
