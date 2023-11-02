import {useEffect, useRef, useState} from "react";
import useWallet from "../../utils/hooks/useWallet";

const ConnectMetamask = () => {
  const {walletInfo, initWalletConnection} = useWallet();
  const isConnecting = useRef(false);

  useEffect(() => {
    console.log("ConnectMetamask");
    console.log("isConnecting", isConnecting?.current);
    console.log("walletInfo", walletInfo);
    if (!isConnecting?.current) {
      const fetchData = async () => {
        try {
          console.log("initializing");
          isConnecting.current = true;
          await initWalletConnection();
        } catch (err) {
          console.log("Err:", err);
        } finally {
          isConnecting.current = false;
        }
      };

      fetchData();
    }
  }, [initWalletConnection, isConnecting, walletInfo]);

  return (
    <>
      <div style={{height: "80vh"}}>
        {/* <Spinner content={"Connecting your metamask"} rootId={"spinner-root"} /> */}
      </div>
    </>
  );
};

export default ConnectMetamask;
