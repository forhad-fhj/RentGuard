#!/usr/bin/env node

/**
 * Generate secure random secrets for RentGuard
 * Run: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Secret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('\n🔐 RentGuard Secret Key Generator\n');
console.log('=' .repeat(50));
console.log('\nCopy these values to your backend/.env file:\n');

console.log('JWT_SECRET=' + generateSecret(32));
console.log('JWT_REFRESH_SECRET=' + generateSecret(32));
console.log('ENCRYPTION_KEY=' + generateSecret(16)); // 32 chars hex = 16 bytes

console.log('\n' + '='.repeat(50));
console.log('\n✅ Secrets generated! Copy them to backend/.env\n');
console.log('⚠️  Keep these secrets secure and never commit them to git!\n');
