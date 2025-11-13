const fs = require('fs');
const path = require('path');

// Read the users CSV file
const usersFile = path.join(__dirname, '..', 'HAVEN', 'database', 'users.csv');
const usersData = fs.readFileSync(usersFile, 'utf8');

console.log('Users CSV content:');
console.log(usersData);

// Parse the CSV data
const lines = usersData.trim().split('\n');
const headers = lines[0].split(',');
console.log('\nHeaders:', headers);

// Parse each user
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  const user = {};
  for (let j = 0; j < headers.length; j++) {
    user[headers[j]] = values[j];
  }
  console.log(`\nUser ${i}:`, user);
}