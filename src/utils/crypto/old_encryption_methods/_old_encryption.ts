import crypto from "crypto-browserify";
import argon2 from "argon2-browser";
import {aes256gcm} from "./aes256gcm";

//
// Version 1 of encryption
//
// export const encryptText = (text: string, password: string) => {
//   const iv = crypto.randomBytes(16);
//   const key = crypto.scryptSync(password, "salt", 32);
//   const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return iv.toString("hex") + ":" + encrypted;
// };

// export const decryptText = (encryptedText: string, password: string) => {
//   const parts = encryptedText.split(":");
//   const iv = Buffer.from(parts.shift()!, "hex");
//   const encrypted = parts.join(":");
//   const key = crypto.scryptSync(password, "salt", 32);
//   const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
//   let decrypted = decipher.update(encrypted, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// };

//
// Version 2 of encryption
//
// export const encryptText = async (text: string, password: string) => {
//   let salt: Buffer = Buffer.alloc(16);
//   let nonce: Buffer = Buffer.alloc(12);

//   salt = window.crypto.getRandomValues(Buffer.alloc(16));
//   nonce = window.crypto.getRandomValues(Buffer.alloc(12));

//   const key = await argon2.hash({
//     pass: password,
//     salt: salt,
//     mem: 64 * 1024,
//     time: 1, // iterations
//     parallelism: 4,
//     hashLen: 32, // length
//     type: argon2.ArgonType.Argon2id, // Argon2d, Argon2i, Argon2id
//   });

//   const aesCipher = aes256gcm(key.hash, nonce);
//   let [encrypted, aesNonce] = await aesCipher.encrypt(text);
//   console.log("aesNonce", aesNonce);
//   return encrypted.toString("hex");
// };

// export const decryptText = (encryptedText: string, password: string) => {
//   const ALGO = "aes-256-gcm";

//   // const decipher = crypto.createDecipheriv(ALGO, key, iv);
//   // decipher.setAAD(Buffer.from("zenon", "utf8"));
//   // decipher.setAuthTag(authTag);

//   // let str = decipher.update(enc, undefined, "hex");
//   // str += decipher.final("hex");
//   // return Buffer.from(str, "hex");
// };

//
// Version 3 of encryption
//
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
}

export async function decryptText(encryptedBase64: string, password: string): Promise<string> {
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
}
