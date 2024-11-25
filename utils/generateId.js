const crypto = require('crypto');

const generateUniqueString = () => {
    return crypto.randomBytes(16).toString('hex'); // Generates a 32-character hex string
};

const generateQuickQuiteId = () => {
    const prefix = 'QQ';
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);  // Generate a random 8-digit number
    return prefix + randomDigits;
};

module.exports = {generateUniqueString, generateQuickQuiteId}