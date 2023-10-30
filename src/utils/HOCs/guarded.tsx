import {useEffect, useState} from "react";
import ConnectMetamask from "../../components/connectMetamask/connectMetamask";
import useWallet from "../hooks/useWallet";

type GuardedProps = {
  children: React.ReactNode;
};

const Guarded: React.FC<GuardedProps> = ({children}) => {
  const [isApproved, setIsApproved] = useState(false);
  const {walletInfo} = useWallet();

  useEffect(() => {
    const checkApproval = async () => {
      const accounts = await window.ethereum.request({method: "eth_accounts"});
      if (accounts?.length > 0 || walletInfo.allAccounts?.length > 0) {
        setIsApproved(true);
      } else {
        setIsApproved(false);
      }
    };
    if (!isApproved) {
      checkApproval();
    }
  }, [isApproved, walletInfo.allAccounts?.length]);

  return isApproved ? <>{children}</> : <ConnectMetamask />;
};

export default Guarded;
