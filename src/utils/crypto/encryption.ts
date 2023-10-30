// Source:
//
// https://github.com/xtrp/encrypt-with-password/blob/master/index.js

// atob and btoa for conversion between Base64 and text
import atob from "atob";
import btoa from "btoa";

// AES-JS for encryption
import aesjs from "aes-js";

// PBDKF2 for key derivation
import pbkdf2 from "pbkdf2";

// crypto for generating random cipher IV
import crypto from "crypto-browserify";
import {generateSalt} from "../utils";

export const defaultEncryptionPassword = "64b4c26ec7935a2da25ae0070900fbb7";

// encrypt text with AES-256 (CBC) using key derived from password argument
export const encryptText = (text: string, password: string) => {
  // convert text to base64

  console.log("text", text);
  const textInBase64 = btoa(encodeURIComponent(text));
  console.log("textInBase64", textInBase64);

  // add padding to text in base64 so that it is a multiple of 16 bytes long
  let textWithPadding = textInBase64;

  // if text isn't a multiple of 16 bytes, add necessary amount of "=" chars to make it so
  if (textWithPadding.length % 16 !== 0) {
    textWithPadding += "=".repeat(16 - (textWithPadding.length % 16));
  }

  // convert padded text to bytes and store in variable
  const textInBytes = aesjs.utils.utf8.toBytes(textWithPadding);

  const generatedSalt = generateSalt(16);

  // variable for key generated from password using KDF
  const derivedKey = pbkdf2.pbkdf2Sync(password, generatedSalt, 10000, 256 / 8, "sha512");

  // generate random IV and store in variable
  const generatedIV = crypto.randomBytes(16);

  // AES-CBC object
  const aesCBC = new aesjs.ModeOfOperation.cbc(derivedKey, generatedIV);

  // encrypted text (in bytes) using AES-CBC, and store encrypted bytes in variable
  const encryptedTextInBytes = aesCBC.encrypt(textInBytes);

  // convert encryptedTextInBytes to Hex to print/store (and put in variable)
  const encryptedTextInHex = aesjs.utils.hex.fromBytes(encryptedTextInBytes);

  // convert generated IV to Hex and store in variable
  const generatedIVInHex = aesjs.utils.hex.fromBytes(generatedIV);

  // create cipher text string with IV and encrypted hex, separated by a ":" (which is a non-hex string)
  const cipherText = generatedSalt + ":" + generatedIVInHex + ":" + encryptedTextInHex;
  console.log("cipherText", cipherText);

  // return cipher text, which includes IV, and encrypted text
  return cipherText;
};

// decrypt cipher text with AES-256 (CBC) using key derived from password argument
export const decryptText = (cipherText: string, password: string) => {
  // split cipherText into IV and encrypted text (separated by a colon) and store in variable
  const splitCipherText = cipherText.split(":");
  console.log("splitCipherText", splitCipherText);

  // store parts of splitCipherText variable into corresponding separate variables
  const salt = splitCipherText[0];
  const ivInHex = splitCipherText[1];
  const encryptedHex = splitCipherText[2];

  // variable for key generated from password using KDF
  const derivedKey = pbkdf2.pbkdf2Sync(password, salt, 10000, 256 / 8, "sha512");

  // convert IV and encrypted Hex to bytes and store in variable
  const iv = aesjs.utils.hex.toBytes(ivInHex);
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

  // AES-CBC object
  const aesCBC = new aesjs.ModeOfOperation.cbc(derivedKey, iv);

  // decrypt encrypted bytes and store in variable
  const decryptedBytes = aesCBC.decrypt(encryptedBytes);

  // convert decrypted bytes into decrypted text in base64
  let decryptedTextInBase64 = aesjs.utils.utf8.fromBytes(decryptedBytes);

  // remove padding from base64 decrypted Base64 text and store in variable
  decryptedTextInBase64 = decryptedTextInBase64.replace(/=/g, "");

  // convert decryptedTextInBase64 to text
  console.log("decryptedTextInBase64", decryptedTextInBase64);
  const decryptedText = decodeURIComponent(atob(decryptedTextInBase64));
  console.log("decryptedText", decryptedText);

  // return decrypted text
  return decryptedText;
};
