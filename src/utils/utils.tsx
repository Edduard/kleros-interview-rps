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
