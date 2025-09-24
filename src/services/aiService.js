const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async extractVocabulary(messageText) {
    try {
      const prompt = this.createPrompt(messageText);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a vocabulary extraction and translation assistant. Extract English vocabulary words from the given text and provide accurate Traditional Chinese (Taiwan) translations. Return only valid JSON in the specified format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content.trim();
      console.log('AI Response:', aiResponse);

      // Parse the JSON response
      const vocabularyData = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (!this.validateVocabularyData(vocabularyData)) {
        throw new Error('Invalid vocabulary data structure from AI');
      }

      return vocabularyData;

    } catch (error) {
      console.error('AI Service Error:', error);
      
      if (error.response) {
        console.error('AI API Error Response:', error.response.data);
      }
      
      throw new Error('Failed to extract vocabulary from AI service');
    }
  }

  createPrompt(messageText) {
    return `
Please extract English vocabulary words from the following text and provide Traditional Chinese (Taiwan) translations.

Text: "${messageText}"

Requirements:
1. Extract only English words that are suitable for vocabulary learning
2. Provide accurate Traditional Chinese (Taiwan) translations
3. Exclude common words like "the", "a", "an", "is", "are", "and", "or", "but", etc.
4. Focus on meaningful vocabulary words (nouns, verbs, adjectives, adverbs)
5. If no suitable vocabulary words are found, return an empty words array

Return the result in this exact JSON format:
{
  "words": [
    { "enUS": "word1", "zhTW": "翻譯1" },
    { "enUS": "word2", "zhTW": "翻譯2" }
  ]
}

Only return the JSON, no additional text or explanation.`;
  }

  validateVocabularyData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!Array.isArray(data.words)) {
      return false;
    }

    // Validate each word object
    for (const word of data.words) {
      if (!word || typeof word !== 'object') {
        return false;
      }

      if (!word.enUS || !word.zhTW || 
          typeof word.enUS !== 'string' || 
          typeof word.zhTW !== 'string') {
        return false;
      }

      // Basic validation for English and Chinese characters
      if (word.enUS.trim().length === 0 || word.zhTW.trim().length === 0) {
        return false;
      }
    }

    return true;
  }

  // Fallback method for testing without AI
  async extractVocabularyFallback(messageText) {
    console.log('Using fallback vocabulary extraction');
    
    // Simple word extraction (for testing purposes)
    const words = messageText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'are', 'for', 'with', 'this', 'that', 'they', 'have', 'been', 'from', 'will', 'your', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'say', 'use', 'her', 'many', 'some', 'very', 'when', 'much', 'then', 'them', 'can', 'only', 'think', 'over', 'also', 'back', 'where', 'much', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'she', 'all', 'there', 'when', 'up', 'use', 'word', 'how', 'said', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'time', 'has', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'].includes(word))
      .slice(0, 10); // Limit to 10 words

    const vocabularyData = {
      words: words.map(word => ({
        enUS: word,
        zhTW: `[${word}]` // Placeholder translation
      }))
    };

    return vocabularyData;
  }
}

module.exports = new AIService();

