// Utility functions for StudySphere application

/**
 * Generate a user-friendly file size string
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate PDF file before upload
 * @param {File} file - File object to validate
 * @returns {Object} - Validation result { isValid: boolean, error?: string }
 */
export function validatePDFFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf'];
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF files are allowed' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size must be less than ${formatFileSize(maxSize)}` };
  }
  
  return { isValid: true };
}

/**
 * Calculate quiz score percentage
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} - Percentage score (0-100)
 */
export function calculateQuizScore(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Get quiz performance message based on score
 * @param {number} percentage - Score percentage (0-100)
 * @returns {Object} - Performance data { message: string, emoji: string, color: string }
 */
export function getQuizPerformance(percentage) {
  if (percentage >= 90) return { 
    message: 'Outstanding! You\'ve mastered this material!', 
    emoji: '🏆', 
    color: 'text-yellow-600' 
  };
  if (percentage >= 80) return { 
    message: 'Excellent work! You have a strong understanding.', 
    emoji: '🥇', 
    color: 'text-green-600' 
  };
  if (percentage >= 70) return { 
    message: 'Good job! You\'re on the right track.', 
    emoji: '🥈', 
    color: 'text-green-500' 
  };
  if (percentage >= 60) return { 
    message: 'Not bad! Review the material and try again.', 
    emoji: '🥉', 
    color: 'text-yellow-500' 
  };
  return { 
    message: 'Keep studying! Practice makes perfect.', 
    emoji: '📚', 
    color: 'text-red-500' 
  };
}

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted time string
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate sample questions for Q&A demo
 * @returns {Array} - Array of sample question strings
 */
export function getSampleQuestions() {
  return [
    "What are the main topics covered in this document?",
    "Can you summarize the key points?",
    "What are the most important concepts?",
    "Are there any practical examples mentioned?",
    "What conclusions does the document reach?",
    "How does this relate to current industry practices?",
    "What are the benefits mentioned?",
    "Are there any limitations discussed?",
    "What recommendations are provided?",
    "How can I apply this information?"
  ];
}

/**
 * Local storage helper functions
 */
export const storage = {
  /**
   * Get document ID from localStorage
   * @returns {string|null} - Document ID or null if not found
   */
  getDocumentId() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('document_id');
    }
    return null;
  },
  
  /**
   * Set document ID in localStorage
   * @param {string} documentId - Document ID to store
   */
  setDocumentId(documentId) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('document_id', documentId);
    }
  },
  
  /**
   * Clear document ID from localStorage
   */
  clearDocumentId() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('document_id');
    }
  },
  
  /**
   * Get quiz results from localStorage
   * @returns {Object|null} - Quiz results or null if not found
   */
  getQuizResults() {
    if (typeof window !== 'undefined') {
      const results = localStorage.getItem('quiz_results');
      return results ? JSON.parse(results) : null;
    }
    return null;
  },
  
  /**
   * Set quiz results in localStorage
   * @param {Object} results - Quiz results to store
   */
  setQuizResults(results) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quiz_results', JSON.stringify(results));
    }
  }
};

/**
 * API error handler
 * @param {Response} response - Fetch response object
 * @returns {Promise} - Throws error with message or returns response
 */
export async function handleAPIError(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.details || `API Error: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response;
}

/**
 * Debounce function for search/input optimization
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}