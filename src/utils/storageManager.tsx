import {Move} from "./constants/constants";
import {decryptText, encryptText, defaultEncryptionPassword} from "./crypto/encryption";

export const DEFAULT_MOVE_PATH = "kleros.rps.selected-move";
export const DEFAULT_SALT_PATH = "kleros.rps.salt";

export const safelyStoreSalt = async (salt: string, password?: string) => {
  const encryptionPassword = password || defaultEncryptionPassword;

  const encryptedSalt = encryptText(salt, encryptionPassword);

  localStorage.setItem(DEFAULT_SALT_PATH, await encryptedSalt);
};

export const safelyStoreMove = async (move: Move, password?: string) => {
  const encryptionPassword = password || defaultEncryptionPassword;
  const encryptedMove = encryptText(move.value.toString(), encryptionPassword);

  localStorage.setItem(DEFAULT_MOVE_PATH, await encryptedMove);
};

export const safelyGetSalt = async (password?: string) => {
  try {
    const encryptionPassword = password || defaultEncryptionPassword;
    const encryptedSalt = localStorage.getItem(DEFAULT_SALT_PATH) || "";

    const decryptedSalt = await decryptText(encryptedSalt, encryptionPassword);
    return decryptedSalt;
  } catch (error: any) {
    if (error?.message?.includes("OperationError") || error?.includes("OperationError")) {
      throw new Error("Invalid salt password !");
    }
  }
};

export const safelyGetMove = async (password?: string) => {
  try {
    const encryptionPassword = password || defaultEncryptionPassword;
    const encryptedMove = localStorage.getItem(DEFAULT_MOVE_PATH) || "";

    const decryptedMove = await decryptText(encryptedMove, encryptionPassword);
    return decryptedMove;
  } catch (error: any) {
    if (error?.message?.includes("OperationError") || error?.includes("OperationError")) {
      throw new Error("Invalid password!");
    }
  }
};
