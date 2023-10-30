import {useEffect, useState} from "react";
import useWallet from "../../utils/hooks/useWallet";

const ConnectMetamask = () => {
  const {walletInfo, initWalletConnection} = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    console.log("ConnectMetamask");
    console.log("isConnecting", isConnecting);
    console.log("walletInfo", walletInfo);
    if (!isConnecting && !walletInfo.allAccounts?.length) {
      const fetchData = async () => {
        try {
          console.log("initing");
          setIsConnecting(true);
          await initWalletConnection();
          setIsConnecting(false);
        } catch (err) {
          console.log("Err:", err);
        }
      };

      fetchData();
    }
  }, [initWalletConnection, isConnecting, walletInfo]);

  return (
    <>
      <div style={{height: "80vh"}}></div>
    </>
  );
};

export default ConnectMetamask;
