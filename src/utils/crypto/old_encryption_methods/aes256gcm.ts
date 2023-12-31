// https://gist.github.com/rjz/15baffeab434b8125ca4d783f4116d81
// Demo implementation of using `aes-256-gcm` with node.js's `crypto` lib.
import crypto from "crypto-browserify";

export const bufferToArrayBuffer = (buf: Buffer): ArrayBuffer => {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
};

export const arrayBufferToBuffer = (ab: ArrayBuffer): Buffer => {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
};

export const aes256gcm = (key: any, nonce: Buffer) => {
  const ALGO = "aes-256-gcm";

  // encrypt returns base64-encoded ciphertext
  const encrypt = async (str: any) => {
    // The `iv` for a given key must be globally unique to prevent
    // against forgery attacks. `randomBytes` is convenient for
    // demonstration but a poor way to achieve this in practice.
    //

    const cipher = crypto.createCipheriv(ALGO, key, nonce);

    let aad = Buffer.from("kleros", "utf8");

    cipher.setAAD(Buffer.concat([aad]));

    let enc = cipher.update(str, "utf8", "hex");
    enc += cipher.final("hex");
    enc += cipher.getAuthTag().toString("hex");
    return [enc, nonce];
  };

  // decrypt decodes base64-encoded ciphertext into a utf8-encoded string
  const decrypt = async (enc: any, iv: any, authTag: any) => {
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAAD(Buffer.from("kleros", "utf8"));
    decipher.setAuthTag(authTag);

    let str = decipher.update(enc, undefined, "hex");
    str += decipher.final("hex");
    return Buffer.from(str, "hex");
  };

  return {
    encrypt,
    decrypt,
    bufferToArrayBuffer,
    arrayBufferToBuffer,
  };
};
