const fs = require('fs');
const path = require('path');

// Define the database directory
const DATABASE_DIR = path.join(__dirname, '../HAVEN/database');

// Function to clear users.csv and keep only the admin user
async function clearUsers() {
  try {
    const usersFilePath = path.join(DATABASE_DIR, 'users.csv');
    
    // Check if file exists
    if (!fs.existsSync(usersFilePath)) {
      console.log('users.csv file does not exist');
      return;
    }
    
    // Create content with only the admin user
    const adminUserContent = `id,email,phone,firstName,lastName,address,role,password
USR-0001,admin@example.com,123-456-7890,Admin,User,Default Admin Address,admin,$2a$10$G54sq85aYb484xKVawJfSOo5Lbop8/NywuR4ODvM9YKuo.HCaKQ8y
`;
    
    // Write only the admin user to the file
    fs.writeFileSync(usersFilePath, adminUserContent, 'utf8');
    
    console.log('Users cleared. Only admin user remains.');
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}

// Run the function
clearUsers();