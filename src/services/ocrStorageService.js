const fs = require('fs');
const path = require('path');

// Storage file path from environment or default
const STORAGE_FILE = process.env.OCR_STORAGE_PATH || path.join(__dirname, '../../storage/ocr-results.json');
const STORAGE_DIR = path.dirname(STORAGE_FILE);

/**
 * Initialize storage directory and file if they don't exist
 */
function initializeStorage() {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
      console.log(`✅ Created OCR storage directory: ${STORAGE_DIR}`);
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
    // Write directly to file (no temp file due to Docker file-level mount limitations)
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(results, null, 2), 'utf8');
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

    // Don't save if no questions found
    if (!ocrData.questions || ocrData.questions.length === 0) {
      console.log('⚠️ Skipping save - No questions found in OCR data');
      return null;
    }

    // Read existing results
    const results = readResults();

    // Each question already has subject included from Gemini
    const newQuestions = ocrData.questions.map(question => ({
      subject: question.subject || 'unknown',
      stem: question.stem,
      options: question.options || [],
      blanks: question.blanks || [],
      imageDescription: question.imageDescription || question.image_description || ''
    }));

    // Append new questions to results
    results.push(...newQuestions);

    // Write back to file
    writeResults(results);

    const subjects = [...new Set(newQuestions.map(q => q.subject))].join(', ');
    console.log(`✅ Saved ${newQuestions.length} question(s) (${subjects})`);
    return newQuestions;
  } catch (error) {
    console.error('❌ Error saving OCR result:', error);
    throw error;
  }
}

module.exports = {
  saveOcrResult
};
