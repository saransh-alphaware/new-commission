// Cryptographic configuration constants
const PBKDF2_ITERATIONS = 150000;
const SALT_LENGTH_BYTES = 16;
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BITS = 256;
const GCM_TAG_LENGTH_BITS = 128;
const SCHEME = "v1";

// Helper functions for base64 conversions in the browser
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


export async function encrypt(plaintext, aad = null) {
  if (!plaintext) {
    throw new Error("plaintext is required");
  }

  const passphrase = import.meta.env.VITE_PASSPHRASE;

  // Generate random Salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));

  // Derive key using PBKDF2
  const passphraseBytes = new TextEncoder().encode(passphrase);
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passphraseBytes,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: KEY_LENGTH_BITS,
    },
    false,
    ["encrypt"],
  );

  // Encrypt
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const encryptParams = {
    name: "AES-GCM",
    iv: iv,
    tagLength: GCM_TAG_LENGTH_BITS,
  };

  if (aad) {
    encryptParams.additionalData = new TextEncoder().encode(aad);
  }

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    encryptParams,
    key,
    plaintextBytes,
  );

  return [
    SCHEME,
    bufferToBase64(salt),
    bufferToBase64(iv),
    bufferToBase64(ciphertextBuffer),
  ].join("$");
}

// Default export of the functional API for ease of migration
export default {
  encrypt,
};
