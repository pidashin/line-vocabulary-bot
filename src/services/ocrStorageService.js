const fs = require('fs');
const path = require('path');

// Storage path from environment or default
const STORAGE_PATH = process.env.OCR_STORAGE_PATH || path.join(__dirname, '../../storage/ocr-results');
const STORAGE_FILE = path.join(STORAGE_PATH, 'ocr-results.json');

/**
 * Initialize storage directory and file if they don't exist
 */
function initializeStorage() {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(STORAGE_PATH)) {
      fs.mkdirSync(STORAGE_PATH, { recursive: true });
      console.log(`✅ Created OCR storage directory: ${STORAGE_PATH}`);
    }

    // Create empty array file if it doesn't exist
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2), 'utf8');
      console.log(`✅ Created OCR storage file: ${STORAGE_FILE}`);
    }
  } catch (error) {
    console.error('❌ Error initializing OCR storage:', error);
    throw error;
  }
}

/**
 * Read all OCR results from storage
 * @returns {Array} Array of OCR results
 */
function readResults() {
  try {
    initializeStorage();
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading OCR results:', error);
    return [];
  }
}

/**
 * Write OCR results to storage (atomic operation)
 * @param {Array} results - Array of OCR results
 */
function writeResults(results) {
  try {
    initializeStorage();
    // Write to temporary file first, then rename (atomic operation)
    const tempFile = `${STORAGE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(results, null, 2), 'utf8');
    fs.renameSync(tempFile, STORAGE_FILE);
  } catch (error) {
    console.error('❌ Error writing OCR results:', error);
    throw error;
  }
}

/**
 * Save a new OCR result (only if successful)
 * @param {Object} ocrData - The OCR data from Gemini
 * @param {string} imagePath - Path to the image file
 * @param {string} userId - LINE user ID
 * @returns {Object} The saved result with metadata
 */
async function saveOcrResult(ocrData, imagePath, userId) {
  try {
    // Don't save if OCR failed
    if (!ocrData || ocrData.error) {
      console.log('⚠️ Skipping save - OCR result contains error');
      return null;
    }

    // Generate unique ID using timestamp
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    // Create result object
    const result = {
      id,
      timestamp,
      subject: ocrData.subject || 'unknown',
      userId: userId || 'unknown',
      imagePath,
      ocrData,
      status: 'success'
    };

    // Read existing results
    const results = readResults();

    // Append new result
    results.push(result);

    // Write back to file
    writeResults(results);

    console.log(`✅ Saved OCR result: ${id} (${result.subject})`);
    return result;
  } catch (error) {
    console.error('❌ Error saving OCR result:', error);
    throw error;
  }
}

module.exports = {
  saveOcrResult
};
