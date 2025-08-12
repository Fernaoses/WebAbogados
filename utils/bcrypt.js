const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

function hash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashed = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return `${salt}$${hashed}`;
}

function compare(password, stored) {
  const [salt, hashed] = stored.split('$');
  const verify = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hashed, 'hex'), Buffer.from(verify, 'hex'));
}

module.exports = { hash, compare };
