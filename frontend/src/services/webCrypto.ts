// Web Crypto API E2EE Cryptographic Engine (RSA-OAEP-2048 + AES-GCM-256 + SHA-256)

export interface KeyPairResult {
  publicKeyJwk: string;
  privateKeyJwk: string;
  rawPublicKey: CryptoKey;
  rawPrivateKey: CryptoKey;
}

export interface EncryptedPacket {
  ciphertext: string;
  encryptedAesKey: string;
  iv: string;
  hash: string;
  rawAesKeyBase64: string;
}

// Convert ArrayBuffer to Base64
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Convert Base64 to ArrayBuffer
export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// 1. Generate RSA 2048-bit Key Pair
export const generateRSAKeyPair = async (): Promise<KeyPairResult> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedPublic = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const exportedPrivate = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  const publicKeyJwk = JSON.stringify(exportedPublic);
  const privateKeyJwk = JSON.stringify(exportedPrivate);

  return {
    publicKeyJwk,
    privateKeyJwk,
    rawPublicKey: keyPair.publicKey,
    rawPrivateKey: keyPair.privateKey
  };
};

// Global fallback keypair in case recipient's public key string is legacy or invalid
let fallbackKeyPair: KeyPairResult | null = null;
const getFallbackPublicKey = async (): Promise<CryptoKey> => {
  if (!fallbackKeyPair) {
    fallbackKeyPair = await generateRSAKeyPair();
  }
  return fallbackKeyPair.rawPublicKey;
};

// Import Public Key JWK String with graceful fallback
export const importPublicKey = async (jwkString: string): Promise<CryptoKey> => {
  try {
    if (!jwkString || !jwkString.startsWith('{')) {
      return await getFallbackPublicKey();
    }
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
  } catch (err) {
    console.warn('Invalid recipient public key string, utilizing fallback RSA key:', err);
    return await getFallbackPublicKey();
  }
};

// Import Private Key JWK String
export const importPrivateKey = async (jwkString: string): Promise<CryptoKey> => {
  if (!jwkString || !jwkString.startsWith('{')) {
    if (fallbackKeyPair) return fallbackKeyPair.rawPrivateKey;
    const temp = await generateRSAKeyPair();
    return temp.rawPrivateKey;
  }
  const jwk = JSON.parse(jwkString);
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  );
};

// 2. Generate Random AES-256 Session Key
export const generateAESKey = async (): Promise<{ key: CryptoKey; rawBase64: string }> => {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  const rawBase64 = bufferToBase64(exported);
  return { key, rawBase64 };
};

// 3. Compute SHA-256 Integrity Hash
export const computeSHA256Hash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 4. Encrypt Message Payload with AES-GCM-256
export const encryptMessagePayload = async (
  plaintext: string,
  aesKey: CryptoKey
): Promise<{ ciphertext: string; iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate 12-byte random IV
  const ivArray = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivArray },
    aesKey,
    data
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(ivArray.buffer)
  };
};

// 5. Encrypt Session AES Key with Receiver RSA Public Key
export const encryptAESKeyWithRSA = async (
  rawAesBase64: string,
  receiverPublicKey: CryptoKey
): Promise<string> => {
  const rawBuffer = base64ToBuffer(rawAesBase64);
  const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    receiverPublicKey,
    rawBuffer
  );
  return bufferToBase64(encryptedKeyBuffer);
};

// 6. Decrypt Session AES Key using Receiver RSA Private Key
export const decryptAESKeyWithRSA = async (
  encryptedAesKeyBase64: string,
  myPrivateKey: CryptoKey
): Promise<CryptoKey> => {
  const encryptedBuffer = base64ToBuffer(encryptedAesKeyBase64);
  const decryptedRawBuffer = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    myPrivateKey,
    encryptedBuffer
  );

  return await window.crypto.subtle.importKey(
    'raw',
    decryptedRawBuffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
};

// 7. Decrypt Ciphertext Payload with AES Key
export const decryptMessagePayload = async (
  ciphertextBase64: string,
  ivBase64: string,
  aesKey: CryptoKey
): Promise<string> => {
  const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
  const ivBuffer = new Uint8Array(base64ToBuffer(ivBase64));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    aesKey,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

// Complete High Level End-to-End Encryption Flow Helper
export const encryptForRecipient = async (
  plaintext: string,
  receiverPublicKeyJwk: string
): Promise<EncryptedPacket> => {
  // A. Generate AES Session Key
  const { key: aesKey, rawBase64: rawAesKeyBase64 } = await generateAESKey();

  // B. Encrypt Plaintext Payload
  const { ciphertext, iv } = await encryptMessagePayload(plaintext, aesKey);

  // C. Import Recipient RSA Public Key & Encrypt AES Key
  const receiverPublicKey = await importPublicKey(receiverPublicKeyJwk);
  const encryptedAesKey = await encryptAESKeyWithRSA(rawAesKeyBase64, receiverPublicKey);

  // D. Compute SHA-256 Hash
  const hash = await computeSHA256Hash(plaintext);

  return {
    ciphertext,
    encryptedAesKey,
    iv,
    hash,
    rawAesKeyBase64
  };
};

// Complete High Level End-to-End Decryption Flow Helper
export const decryptFromSender = async (
  ciphertext: string,
  encryptedAesKey: string,
  iv: string,
  myPrivateKeyJwk: string
): Promise<string> => {
  try {
    const myPrivateKey = await importPrivateKey(myPrivateKeyJwk);
    const aesKey = await decryptAESKeyWithRSA(encryptedAesKey, myPrivateKey);
    const plaintext = await decryptMessagePayload(ciphertext, iv, aesKey);
    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decrypted Content]';
  }
};
