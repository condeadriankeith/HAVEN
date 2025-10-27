const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 10;
  
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password validation:', isValid);
}

generateHash();