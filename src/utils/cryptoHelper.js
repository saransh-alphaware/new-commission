import CryptoJS from 'crypto-js';

// Access the secret key from environment variables
const secretKey = import.meta.env.VITE_APP_ENCRYPT_SECRET;
const SECRET_KEY = import.meta.env.VITE_APP_AADHAR_AND_PAN_ENCRYPT_SECRET;

// Encrypt the ID
export const encryptId = (id) => {
  if (!secretKey) {
    throw new Error("Encryption secret key is missing");
  }
  return CryptoJS.AES.encrypt(id, secretKey).toString();
};

export const encryptAadharId = (id) => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

  const encrypted = CryptoJS.AES.encrypt(
    id,
    key,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return encrypted.toString(); // Base64 (same as Java)
};

// Decrypt the ID
export const decryptId = (encryptedId) => {
  if (!secretKey) {
    throw new Error("Encryption secret key is missing");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedId, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
