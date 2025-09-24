class MessageFormatter {
  createConfirmationMessage(words) {
    const wordCount = words.length;
    
    // Create the vocabulary list text
    let vocabularyText = `📚 Found ${wordCount} vocabulary words:\n\n`;
    
    words.forEach((word, index) => {
      vocabularyText += `${index + 1}. ${word.enUS} → ${word.zhTW}\n`;
    });
    
    vocabularyText += `\nWould you like to upload these words to the app?`;

    // Create the confirmation message with buttons
    const message = {
      type: 'flex',
      altText: `Found ${wordCount} vocabulary words. Please confirm to upload.`,
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📚 Vocabulary Found',
              weight: 'bold',
              size: 'xl',
              color: '#1DB446',
              align: 'center'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'text',
              text: `Found ${wordCount} vocabulary words:`,
              size: 'md',
              margin: 'md',
              wrap: true
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              spacing: 'sm',
              contents: words.slice(0, 10).map((word, index) => ({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: `${index + 1}.`,
                    size: 'sm',
                    color: '#666666',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: word.enUS,
                    size: 'sm',
                    weight: 'bold',
                    flex: 1,
                    margin: 'sm'
                  },
                  {
                    type: 'text',
                    text: '→',
                    size: 'sm',
                    color: '#666666',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: word.zhTW,
                    size: 'sm',
                    flex: 1,
                    margin: 'sm'
                  }
                ]
              }))
            },
            ...(words.length > 10 ? [{
              type: 'text',
              text: `... and ${words.length - 10} more words`,
              size: 'sm',
              color: '#666666',
              align: 'center',
              margin: 'md'
            }] : [])
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              color: '#1DB446',
              action: {
                type: 'postback',
                label: '✅ Confirm Upload',
                data: 'confirm',
                displayText: 'Confirming vocabulary upload...'
              }
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '❌ Cancel',
                data: 'cancel',
                displayText: 'Cancelling...'
              }
            }
          ]
        }
      }
    };

    return message;
  }

  createSimpleConfirmationMessage(words) {
    const wordCount = words.length;
    
    let vocabularyText = `📚 Found ${wordCount} vocabulary words:\n\n`;
    
    words.forEach((word, index) => {
      vocabularyText += `${index + 1}. ${word.enUS} → ${word.zhTW}\n`;
    });
    
    vocabularyText += `\nWould you like to upload these words to the app?`;

    return {
      type: 'template',
      altText: `Found ${wordCount} vocabulary words. Please confirm to upload.`,
      template: {
        type: 'confirm',
        text: vocabularyText,
        actions: [
          {
            type: 'postback',
            label: '✅ Confirm',
            data: 'confirm',
            displayText: 'Confirming vocabulary upload...'
          },
          {
            type: 'postback',
            label: '❌ Cancel',
            data: 'cancel',
            displayText: 'Cancelling...'
          }
        ]
      }
    };
  }

  formatVocabularyList(words) {
    if (!words || words.length === 0) {
      return 'No vocabulary words found.';
    }

    let text = `📚 Vocabulary List (${words.length} words):\n\n`;
    
    words.forEach((word, index) => {
      text += `${index + 1}. ${word.enUS} → ${word.zhTW}\n`;
    });
    
    return text;
  }

  createErrorMessage(error) {
    return {
      type: 'text',
      text: `❌ Error: ${error.message || 'Something went wrong. Please try again.'}`
    };
  }

  createSuccessMessage(wordCount) {
    return {
      type: 'text',
      text: `✅ Successfully uploaded ${wordCount} vocabulary words to the app!`
    };
  }
}

module.exports = new MessageFormatter();

