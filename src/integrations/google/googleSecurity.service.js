const crypto = require('crypto');
const AppError = require('../../utils/AppError');

const getEncryptionKey = () => {
  const value = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!/^[a-fA-F0-9]{64}$/.test(value || '')) {
    throw new AppError('Google token encryption is not configured', 503);
  }
  return Buffer.from(value, 'hex');
};

const encrypt = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.');
};

const decrypt = (value) => {
  const [ivText, tagText, encryptedText] = value.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64url')), decipher.final()]).toString('utf8');
};

const getStateSecret = () => {
  if (!process.env.GOOGLE_OAUTH_STATE_SECRET) throw new AppError('Google OAuth state secret is not configured', 503);
  return process.env.GOOGLE_OAUTH_STATE_SECRET;
};

const createOAuthState = (userId) => {
  const payload = Buffer.from(JSON.stringify({ userId, issuedAt: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const verifyOAuthState = (state) => {
  const [payload, signature] = String(state || '').split('.');
  const expected = crypto.createHmac('sha256', getStateSecret()).update(payload || '').digest('base64url');
  if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new AppError('Invalid Google OAuth state', 400);
  }

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new AppError('Invalid Google OAuth state', 400);
  }
  if (!decoded.userId || Date.now() - decoded.issuedAt > 10 * 60 * 1_000) {
    throw new AppError('Expired Google OAuth state', 400);
  }
  return decoded.userId;
};

module.exports = { encrypt, decrypt, createOAuthState, verifyOAuthState };
