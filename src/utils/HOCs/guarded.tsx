import {useEffect, useState} from "react";
import ConnectMetamask from "../../components/connectMetamask/connectMetamask";
import useWallet from "../hooks/useWallet";

type GuardedProps = {
  children: React.ReactNode;
};

const Guarded: React.FC<GuardedProps> = ({children}) => {
  const [isApproved, setIsApproved] = useState(false);
  const {walletInfo, getWalletInfo} = useWallet();

  useEffect(() => {
    const checkApproval = async () => {
      // const provider = (await detectEthereumProvider()) as ethers.providers.Web3Provider;
      // return provider;

      const accounts = await window.ethereum.request({method: "eth_accounts"});
      console.log("Approved accounts in metamask", accounts);
      console.log("guarded - walletInfo", walletInfo);

      if (accounts?.length > 0) {
        if (!walletInfo?.currentAddress?.length) {
          await getWalletInfo();
        }
        setIsApproved(true);
      } else {
        setIsApproved(false);
      }
    };
    if (!isApproved) {
      checkApproval();
    }
  }, [getWalletInfo, isApproved, walletInfo]);

  return isApproved ? <>{children}</> : <ConnectMetamask />;
};

export default Guarded;
