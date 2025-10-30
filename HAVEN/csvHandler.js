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
  return new Promise((resolve) => {
    const checkLock = () => {
      if (!fileLocks.has(fileName)) {
        fileLocks.set(fileName, true);
        resolve();
      } else {
        setTimeout(checkLock, 10); // Check again in 10ms
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
    const lines = data.trim().split('\n');
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = parseCSVLine(lines[i]);
      const row = {};
      
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
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
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
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
      const lines = fileContent.split('\n');
      if (lines.length > 0) {
        headers = lines[0].split(',').map(h => h.trim());
      }
    }
    
    // Create data line
    const values = headers.map(header => {
      const value = rowData[header] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
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