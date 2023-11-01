export const defaultEncryptionPassword = "64b4c26ec7935a2da25ae0070900fbb7";

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const importedKey = await window.crypto.subtle.importKey("raw", passwordBuffer, {name: "PBKDF2"}, false, [
    "deriveKey",
  ]);
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    importedKey,
    {name: "AES-GCM", length: 256},
    true,
    ["encrypt", "decrypt"]
  );
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const byteString = Array.from(byteArray)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(byteString);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const byteString = atob(base64);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return byteArray.buffer;
}

export async function encryptText(data: string, password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoder.encode(data)
    );
    const combinedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedData.byteLength);
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.byteLength);
    combinedBuffer.set(new Uint8Array(encryptedData), salt.byteLength + iv.byteLength);
    return arrayBufferToBase64(combinedBuffer.buffer);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function decryptText(encryptedBase64: string, password: string): Promise<string> {
  try {
    const encryptedData = base64ToArrayBuffer(encryptedBase64);
    const decoder = new TextDecoder();
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);
    const key = await deriveKey(password, new Uint8Array(salt));
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      data
    );
    return decoder.decode(decryptedData);
  } catch (error: any) {
    throw new Error(error);
  }
}
