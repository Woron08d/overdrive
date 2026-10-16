import crypto from 'crypto';
export function makeHash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
export function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}