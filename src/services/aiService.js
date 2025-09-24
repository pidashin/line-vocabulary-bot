const axios = require('axios');

class AIService {
  constructor() {
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.provider = 'hyperbolic'; // Using hyperbolic provider as suggested
    this.model = 'Qwen/Qwen3-Next-80B-A3B-Instruct';
    this.baseURL = 'https://router.huggingface.co/v1';
  }

  async extractVocabulary(messageText) {
    try {
      const prompt = this.createPrompt(messageText);
      
      // Using axios with the router endpoint
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: `${this.model}:${this.provider}`,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract the response content
      const aiResponse = response.data.choices[0]?.message?.content;
      console.log('AI Response:', aiResponse);

      if (!aiResponse) {
        throw new Error('No response content from AI');
      }

      // Try to extract JSON from the response
      const vocabularyData = this.extractJsonFromResponse(aiResponse);
      
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
      
      // Fallback to simple extraction if AI fails
      console.log('🔄 Falling back to simple vocabulary extraction');
      return await this.extractVocabularyFallback(messageText);
    }
  }

  createPrompt(messageText) {
    return `You are an English-Chinese vocabulary assistant for children aged 6 to 12.

Given a message from an English teacher to parents about a child's class, your task is:

1. Extract all English vocabulary words mentioned in the message (e.g., in the vocabulary list).
2. For each word, provide a JSON object with:
   - "enUS": the English word
   - "zhTW": its Traditional Chinese translation, kept simple and suitable for children aged 6–12.

3. Return the result as a JSON array. 
4. Do not include any explanations, text, or commentary — just the JSON array.

Example output:
[
  {
    "enUS": "basement",
    "zhTW": "地下室"
  },
  {
    "enUS": "tool",
    "zhTW": "工具"
  }
]

Message: "${messageText}"`;
  }

  extractJsonFromResponse(response) {
    try {
      // Try to find JSON array in the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const words = JSON.parse(jsonString);
        return { words };
      }
      
      // If no array found, try to parse the entire response as JSON
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return { words: parsed };
      }
      
      throw new Error('No valid JSON array found in response');
    } catch (error) {
      console.error('JSON extraction error:', error);
      throw new Error('Failed to extract JSON from AI response');
    }
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

  // Test Hugging Face API connection
  async testConnection() {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: `${this.model}:${this.provider}`,
          messages: [
            {
              role: "user",
              content: "Hello, this is a test."
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Hugging Face API Connection Test Failed:', error);
      
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // Fallback method for testing without AI
  async extractVocabularyFallback(messageText) {
    console.log('Using fallback vocabulary extraction');
    
    // Look for vocabulary list patterns in the message
    const vocabularyPatterns = [
      /學習單字[：:]\s*([^.]+)/i,
      /vocabulary[：:]\s*([^.]+)/i,
      /words[：:]\s*([^.]+)/i,
      /單字[：:]\s*([^.]+)/i
    ];

    let vocabularyWords = [];

    // Try to extract from vocabulary list patterns
    for (const pattern of vocabularyPatterns) {
      const match = messageText.match(pattern);
      if (match) {
        const wordList = match[1];
        vocabularyWords = wordList
          .split(/[,，、\s]+/)
          .map(word => word.trim())
          .filter(word => word.length > 0 && /^[a-zA-Z]+$/.test(word))
          .slice(0, 20); // Limit to 20 words
        break;
      }
    }

    // If no vocabulary list found, extract English words from the message
    if (vocabularyWords.length === 0) {
      vocabularyWords = messageText
        .match(/[a-zA-Z]{3,}/g) || []
        .filter(word => !['the', 'and', 'are', 'for', 'with', 'this', 'that', 'they', 'have', 'been', 'from', 'will', 'your', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'say', 'use', 'her', 'many', 'some', 'very', 'when', 'much', 'then', 'them', 'can', 'only', 'think', 'over', 'back', 'where', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'she', 'all', 'up', 'word', 'how', 'an', 'do', 'if', 'about', 'out', 'so', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'go', 'no', 'way', 'my', 'than', 'water', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'did', 'get', 'come', 'made', 'part'].includes(word.toLowerCase()))
        .slice(0, 10); // Limit to 10 words
    }

    const vocabularyData = {
      words: vocabularyWords.map(word => ({
        enUS: word.toLowerCase(),
        zhTW: `[${word}]` // Placeholder translation
      }))
    };

    return vocabularyData;
  }
}

module.exports = new AIService();

