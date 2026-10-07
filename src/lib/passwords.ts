/**
 * Password hashing utilities using Web Crypto API (no native dependencies).
 * Uses PBKDF2 with SHA-256, 100_000 iterations, and a 16-byte random salt.
 *
 * Stored format: `pbkdf2:sha256:100000:<base64-salt>:<base64-hash>`
 */

const ALGORITHM = 'PBKDF2';
const HASH = 'SHA-256';
const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

function toBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  return Buffer.from(buffer as any).toString('base64');
}

function fromBase64(b64: string): Uint8Array {
  const buf = Buffer.from(b64, 'base64');
  const arr = new Uint8Array(buf.length);
  arr.set(buf);
  return arr;
}

/**
 * Hash a plaintext password. Returns a portable string.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    ALGORITHM,
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations: ITERATIONS, hash: HASH },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const saltB64 = toBase64(salt);
  const hashB64 = toBase64(derivedBits);

  return `pbkdf2:sha256:${ITERATIONS}:${saltB64}:${hashB64}`;
}

/**
 * Verify a plaintext password against a stored hash string.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') {
    return false;
  }

  const iterations = parseInt(parts[2], 10);
  const salt = fromBase64(parts[3]);
  const expectedHash = fromBase64(parts[4]);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    ALGORITHM,
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt: salt as any as BufferSource, iterations, hash: HASH },
    keyMaterial,
    expectedHash.length * 8,
  );

  const derived = new Uint8Array(derivedBits);

  // Constant-time comparison
  if (derived.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) {
    diff |= derived[i] ^ expectedHash[i];
  }
  return diff === 0;
}
