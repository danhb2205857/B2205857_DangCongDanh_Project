import bcrypt from 'bcrypt';

/**
 * Password utility functions
 */

const SALT_ROUNDS = 12;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message);
  }
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error comparing password: ' + error.message);
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password) {
    result.isValid = false;
    result.errors.push('Mật khẩu là bắt buộc');
    return result;
  }

  if (password.length < 6) {
    result.isValid = false;
    result.errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (password.length > 128) {
    result.isValid = false;
    result.errors.push('Mật khẩu không được vượt quá 128 ký tự');
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Mật khẩu phải chứa ít nhất một chữ cái');
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('Mật khẩu phải chứa ít nhất một số');
  }

  // Check for common weak passwords
  const weakPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '1234567', '1234567890', 'qwerty', 'abc123', 'password123'
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    result.isValid = false;
    result.errors.push('Mật khẩu quá yếu, vui lòng chọn mật khẩu khác');
  }

  return result;
};

/**
 * Generate a random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Generated password
 */
export const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required type
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export default {
  hashPassword,
  comparePassword,
  validatePassword,
  generatePassword
};