const fs = require('fs');
const path = require('path');

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to check if a directory exists
function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
}

// Function to get directory contents
function getDirContents(dirPath) {
  try {
    return fs.readdirSync(dirPath);
  } catch (error) {
    return [];
  }
}

console.log('=== HAVEN Project Structure Verification ===\n');

// Check root directories
const rootDirs = ['HAVEN', 'mobile', 'desktop', 'docs'];
rootDirs.forEach(dir => {
  const exists = dirExists(dir);
  console.log(`📁 ${dir}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

console.log('\n=== Backend API Server (HAVEN/) ===');
const backendFiles = [
  'package.json',
  'server.js',
  '.env',
  'test-api.js',
  'generate-hash.js'
];

backendFiles.forEach(file => {
  const exists = fileExists(path.join('HAVEN', file));
  console.log(`📄 ${file}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

console.log('\n=== Mobile Application (mobile/) ===');
const mobileFiles = [
  'package.json',
  'App.js',
  'app.json'
];

mobileFiles.forEach(file => {
  const exists = fileExists(path.join('mobile', file));
  console.log(`📄 ${file}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

const mobileDirs = ['assets'];
mobileDirs.forEach(dir => {
  const exists = dirExists(path.join('mobile', dir));
  console.log(`📁 ${dir}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

console.log('\n=== Desktop Application (desktop/) ===');
const desktopFiles = [
  'pom.xml'
];

desktopFiles.forEach(file => {
  const exists = fileExists(path.join('desktop', file));
  console.log(`📄 ${file}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

const desktopDirs = [
  'src',
  'src/main',
  'src/main/java',
  'src/main/java/com',
  'src/main/java/com/haven',
  'src/main/java/com/haven/desktop'
];

desktopDirs.forEach(dir => {
  const exists = dirExists(path.join('desktop', dir));
  console.log(`📁 ${dir}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

const desktopJavaFiles = [
  'src/main/java/com/haven/desktop/Main.java',
  'src/main/java/com/haven/desktop/HAVENDesktopApp.java'
];

desktopJavaFiles.forEach(file => {
  const exists = fileExists(path.join('desktop', file));
  console.log(`📄 ${path.basename(file)}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

console.log('\n=== Documentation (docs/) ===');
const docFiles = [
  'PROJECT_STRUCTURE.md',
  'SYSTEM_SUMMARY.md',
  'FINAL_SUMMARY.md',
  'SYSTEM_ARCHITECTURE.md'
];

docFiles.forEach(file => {
  const exists = fileExists(path.join('docs', file));
  console.log(`📄 ${file}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

console.log('\n=== Root Directory Files ===');
const rootFiles = [
  'README.md',
  'init.sh',
  'init.bat',
  'run.sh',
  'run.bat'
];

rootFiles.forEach(file => {
  const exists = fileExists(file);
  console.log(`📄 ${file}: ${exists ? '✅ FOUND' : '❌ MISSING'}`);
});

console.log('\n=== Verification Complete ===');
console.log('Project structure verification finished.');