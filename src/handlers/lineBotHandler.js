const aiService = require('../services/aiService');
const appService = require('../services/appService');
const messageFormatter = require('../utils/messageFormatter');

class LineBotHandler {
  constructor() {
    this.userSessions = new Map(); // Store user sessions for confirmation flow
  }

  async handleEvent(event, client) {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        await this.handleTextMessage(event, client);
      } else if (event.type === 'postback') {
        await this.handlePostback(event, client);
      }
    } catch (error) {
      console.error('Error handling event:', error);
      await this.sendErrorMessage(client, event.replyToken);
    }
  }

  async handleTextMessage(event, client) {
    const { replyToken, message, source } = event;
    const userId = source.userId;
    const messageText = message.text;

    console.log(`Received message from ${userId}: ${messageText}`);

    try {
      // Send processing message
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '🤖 Processing your message with AI...'
      });

      // Extract vocabulary using AI
      const vocabularyData = await aiService.extractVocabulary(messageText);
      
      if (!vocabularyData || !vocabularyData.words || vocabularyData.words.length === 0) {
        await client.replyMessage(replyToken, {
          type: 'text',
          text: '❌ No vocabulary words found in your message. Please try again with a message containing English words.'
        });
        return;
      }

      // Store vocabulary data for confirmation
      this.userSessions.set(userId, {
        vocabularyData,
        timestamp: Date.now()
      });

      // Send confirmation message with buttons
      const confirmMessage = messageFormatter.createConfirmationMessage(vocabularyData.words);
      await client.replyMessage(replyToken, confirmMessage);

    } catch (error) {
      console.error('Error processing text message:', error);
      await this.sendErrorMessage(client, replyToken);
    }
  }

  async handlePostback(event, client) {
    const { replyToken, postback, source } = event;
    const userId = source.userId;
    const data = postback.data;

    console.log(`Received postback from ${userId}: ${data}`);

    try {
      const userSession = this.userSessions.get(userId);
      
      if (!userSession) {
        await client.replyMessage(replyToken, {
          type: 'text',
          text: '❌ Session expired. Please send your message again.'
        });
        return;
      }

      if (data === 'confirm') {
        // Upload vocabulary to app
        await client.replyMessage(replyToken, {
          type: 'text',
          text: '📤 Uploading vocabulary to the app...'
        });

        const uploadResult = await appService.uploadVocabulary(userSession.vocabularyData.words);
        
        if (uploadResult.success) {
          const wordCount = userSession.vocabularyData.words.length;
          await client.replyMessage(replyToken, {
            type: 'text',
            text: `✅ Uploaded ${wordCount} words into the app`
          });
        } else {
          await client.replyMessage(replyToken, {
            type: 'text',
            text: '❌ Failed to upload vocabulary. Please try again later.'
          });
        }

        // Clear session
        this.userSessions.delete(userId);

      } else if (data === 'cancel') {
        await client.replyMessage(replyToken, {
          type: 'text',
          text: '❌ Vocabulary upload cancelled.'
        });
        
        // Clear session
        this.userSessions.delete(userId);
      }

    } catch (error) {
      console.error('Error handling postback:', error);
      await this.sendErrorMessage(client, replyToken);
    }
  }

  async sendErrorMessage(client, replyToken) {
    try {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '❌ Sorry, something went wrong. Please try again later.'
      });
    } catch (error) {
      console.error('Error sending error message:', error);
    }
  }

  // Clean up expired sessions (call this periodically)
  cleanupExpiredSessions() {
    const now = Date.now();
    const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.timestamp > EXPIRY_TIME) {
        this.userSessions.delete(userId);
      }
    }
  }
}

// Create singleton instance
const lineBotHandler = new LineBotHandler();

// Clean up expired sessions every 10 minutes
setInterval(() => {
  lineBotHandler.cleanupExpiredSessions();
}, 10 * 60 * 1000);

module.exports = lineBotHandler;

