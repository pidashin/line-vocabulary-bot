const axios = require('axios');

class WordBridgeService {
  constructor() {
    this.baseURL = process.env.WORDBRIDGE_API_URL;
  }

  async addWords(words) {
    try {
      // Check if WordBridge API URL is configured
      if (!this.baseURL) {
        console.log('WordBridge API URL not configured, skipping word addition');
        return {
          success: true
        };
      }

      console.log(`Adding ${words.length} vocabulary words to WordBridge`);

      // Prepare the GraphQL mutation
      const mutation = `
        mutation AddWords($words: [WordInput!]!) {
          addWords(words: $words) {
            enUS
            zhTW
            __typename
          }
        }
      `;

      // Transform vocabulary data to match WordBridge format
      const wordInputs = words.map(word => ({
        enUS: word.enUS,
        zhTW: word.zhTW
      }));

      const variables = {
        words: wordInputs
      };

      const response = await axios.post(
        this.baseURL,
        {
          operationName: 'AddWords',
          query: mutation,
          variables: variables
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'User-Agent': 'LINE-Vocabulary-Bot/1.0'
          },
          timeout: 15000 // 15 second timeout
        }
      );

      console.log('✅ WordBridge API call successful');

      // Check for GraphQL errors
      if (response.data.errors) {
        console.error('GraphQL Errors:', response.data.errors);
        throw new Error(`GraphQL errors: ${response.data.errors.map(e => e.message).join(', ')}`);
      }

      const addedWords = response.data.data?.addWords || [];
      
      return {
        success: true
      };

    } catch (error) {
      console.error('WordBridge Service Error:', error);
      
      if (error.response) {
        console.error('WordBridge API Error Response:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async testConnection() {
    try {
      // Check if WordBridge API URL is configured
      if (!this.baseURL) {
        console.log('WordBridge API URL not configured, skipping connection test');
        return {
          success: false
        };
      }

      // Test with a simple introspection query
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
            }
            mutationType {
              name
            }
          }
        }
      `;

      const response = await axios.post(
        this.baseURL,
        {
          query: introspectionQuery
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'User-Agent': 'LINE-Vocabulary-Bot/1.0'
          },
          timeout: 5000
        }
      );

      return {
        success: true
      };

    } catch (error) {
      console.error('WordBridge API Connection Test Failed:', error);
      
      return {
        success: false
      };
    }
  }



}

module.exports = new WordBridgeService();
