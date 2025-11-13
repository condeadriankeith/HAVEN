const fs = require('fs');
const path = require('path');

// Define the database directory
const DATABASE_DIR = path.join(__dirname, 'database');

// Ensure database directory exists
if (!fs.existsSync(DATABASE_DIR)) {
  fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

// Simple file locking mechanism
const fileLocks = new Map();

/**
 * Acquire a lock for a file
 * @param {string} fileName - Name of the file to lock
 * @returns {Promise} Promise that resolves when lock is acquired
 */
function acquireLock(fileName) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // Max 1 second wait
    
    const checkLock = () => {
      if (!fileLocks.has(fileName)) {
        fileLocks.set(fileName, true);
        resolve();
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error(`Failed to acquire lock for ${fileName} after ${maxAttempts} attempts`));
        } else {
          setTimeout(checkLock, 10); // Check again in 10ms
        }
      }
    };
    checkLock();
  });
}

/**
 * Release a lock for a file
 * @param {string} fileName - Name of the file to unlock
 */
function releaseLock(fileName) {
  fileLocks.delete(fileName);
}

/**
 * Read CSV file and parse into array of objects
 * @param {string} fileName - Name of the CSV file
 * @returns {Array} Array of objects representing CSV rows
 */
async function readCSV(fileName) {
  await acquireLock(fileName);
  try {
    const filePath = path.join(DATABASE_DIR, fileName);
    
    // If file doesn't exist, create it with headers
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    // Handle both Windows (\r\n) and Unix (\n) line endings
    const lines = data.trim().split(/\r?\n/);
    
    if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = parseCSVLine(lines[i]);
      const row = {};
      
      for (let j = 0; j < headers.length; j++) {
        // Handle missing values
        row[headers[j]] = j < values.length ? values[j] : '';
      }
      
      rows.push(row);
    }
    
    return rows;
  } finally {
    releaseLock(fileName);
  }
}

/**
 * Parse a CSV line handling quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of field values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quotes inside quoted field
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current);
  
  return result;
}

/**
 * Write array of objects to CSV file
 * @param {string} fileName - Name of the CSV file
 * @param {Array} data - Array of objects to write
 * @param {Array} headers - Column headers in order
 */
async function writeCSV(fileName, data, headers) {
  await acquireLock(fileName);
  try {
    const filePath = path.join(DATABASE_DIR, fileName);
    
    // Validate inputs
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    if (!Array.isArray(headers)) {
      throw new Error('Headers must be an array');
    }
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    for (const row of data) {
      if (!row || typeof row !== 'object') {
        throw new Error('Each row must be an object');
      }
      
      const values = headers.map(header => {
        const value = row[header];
        
        // Handle missing values
        if (value === undefined || value === null) {
          return '';
        }
        
        // Convert to string if needed
        const stringValue = String(value);
        
        // Escape quotes and wrap in quotes if contains comma or quote
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += values.join(',') + '\n';
    }
    
    fs.writeFileSync(filePath, csvContent, 'utf8');
  } finally {
    releaseLock(fileName);
  }
}

/**
 * Append a row to CSV file
 * @param {string} fileName - Name of the CSV file
 * @param {Object} rowData - Object containing row data
 */
async function appendToCSV(fileName, rowData) {
  await acquireLock(fileName);
  try {
    const filePath = path.join(DATABASE_DIR, fileName);
    
    // Validate row data
    if (!rowData || typeof rowData !== 'object') {
      throw new Error('Invalid row data provided');
    }
    
    // If file doesn't exist, we need headers
    const fileExists = fs.existsSync(filePath);
    let headers = Object.keys(rowData);
    
    if (!fileExists) {
      // Create file with headers
      const headerLine = headers.join(',') + '\n';
      fs.writeFileSync(filePath, headerLine, 'utf8');
    } else {
      // Read headers from existing file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Handle both Windows (\r\n) and Unix (\n) line endings
      const lines = fileContent.split(/\r?\n/);
      if (lines.length > 0 && lines[0].trim() !== '') {
        headers = lines[0].split(',').map(h => h.trim());
      }
    }
    
    // Create data line
    const values = headers.map(header => {
      const value = rowData[header];
      
      // Handle missing values
      if (value === undefined || value === null) {
        return '';
      }
      
      // Convert to string if needed
      const stringValue = String(value);
      
      // Escape quotes and wrap in quotes if contains comma or quote
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    
    const dataLine = values.join(',') + '\n';
    fs.appendFileSync(filePath, dataLine, 'utf8');
  } finally {
    releaseLock(fileName);
  }
}

module.exports = {
  readCSV,
  writeCSV,
  appendToCSV
};