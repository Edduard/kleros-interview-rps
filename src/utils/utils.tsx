export const generateSalt = (size: number) => {
  return window.crypto.getRandomValues(Buffer.alloc(size)).toString("hex");
};

export const safelyOpenExternalUrl = (url: string) => {
  console.log("safelyOpenExternalUrl", url);
  const newTab = window.open(url, "_blank", "noopener,noreferrer");
  if (newTab) newTab.opener = null;
};

export const checkMetamaskAvailability = () => {
  if (!(typeof window.ethereum !== "undefined")) {
    // @ts-ignore
    if (!!window.chrome) {
      setTimeout(() => {
        const newWindow = window.open(
          "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
          "_blank"
        );
        if (newWindow) newWindow.opener = null;
      }, 2500);
      throw new Error("Please install Metamask. Redirecting to extension...");
    } else {
      throw new Error("Please install Metamask Extension.");
    }
  } else {
    if (!window?.ethereum?.isMetaMask) {
      // @ts-ignore
      if (!!window.chrome) {
        setTimeout(() => {
          const newWindow = window.open(
            "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
            "_blank"
          );
          if (newWindow) newWindow.opener = null;
        }, 2500);
        throw new Error("Please install Metamask. Redirecting to extension...");
      } else {
        throw new Error("Please install Metamask Extension.");
      }
    }
  }
};

export const explorersByChainId: {[key: string]: string} = {
  "11155111": "https://sepolia.etherscan.io",
};

export const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

type TimeoutOptionsType = {ms: number; errorMessage?: string};

export const timeoutPromise = <K, T = void>(func: Promise<T>, options?: TimeoutOptionsType) => {
  const timeout = options?.ms ?? 3000;
  const errorMessage = options?.errorMessage ?? `Request timed out after ${timeout}ms`;

  return Promise.race([
    wait(timeout).then(() => {
      throw new Error(errorMessage);
    }),
    func,
  ]);
};
