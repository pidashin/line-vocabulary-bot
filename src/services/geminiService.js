const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');

// Initialize Gemini API
// Ensure GEMINI_API_KEY is set in your .env file
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes an image to perform OCR and reconstruct the question.
 * @param {string} imagePath - The path to the image file.
 * @returns {Promise<Object>} - The structured data extracted from the image.
 */
async function analyzeImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `
      請分析這張圖片。
      
      首先，請判斷這張圖片是否包含「測驗題目」或「學習評量」。
      如果圖片模糊不清、無法辨識文字、或是風景照、人物照等非題目圖片，請輸出一個包含 "error" 欄位的 JSON 物件，例如：{"error": "圖片不包含清晰的測驗題目"}。
      
      如果是有效的題目圖片，請輸出一個 JSON 物件，格式如下：
      {
        "questions": [
          {
            "subject": "科目分類 (國語, 數學, 自然, 社會, 英文)",
            "stem": "題幹文字",
            "options": ["選項1", "選項2", ...], // 如果有的話
            "blanks": ["空格1答案", ...], // 如果是填空題，且能推斷或識別空格位置
            "image_description": "圖片描述" // 如果題目包含圖片
          }
        ]
      }
      
      如果圖片中包含多個題目，請在 questions 陣列中列出。
      請只輸出純 JSON 字串，不要包含 Markdown 格式標記 (如 \`\`\`json)。
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ]
        }
      ]
    });

    const text = response.candidates[0].content.parts[0].text;

    // Clean up potential markdown code blocks if the model includes them
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw error;
  }
}

module.exports = {
  analyzeImage,
};
