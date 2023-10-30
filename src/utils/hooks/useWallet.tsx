import {useCallback, useContext, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {ethers} from "ethers";
import {storeAllAccounts, storeChainId, storeCurrentAddress} from "../redux/walletSlice";
import {toast} from "react-toastify";
import {SpinnerContext} from "../../components/spinner/spinnerContext";
import {checkMetamaskAvailability} from "../utils";
import {useProvider} from "./web3ProviderContext";

const useWallet = () => {
  const {handleSpinner} = useContext(SpinnerContext);
  const dispatch = useDispatch();
  const provider = useProvider();

  const walletInfo = useSelector((state: RootState) => state.wallet);

  const detectExtensionsChanges = useCallback(() => {
    const accountChangedHandler = async (accounts: any) => {
      console.log("accountChangedHandler", accounts);

      dispatch(storeAllAccounts(accounts));
      dispatch(storeCurrentAddress(accounts[0]));
    };
    window?.ethereum?.on("accountsChanged", accountChangedHandler);

    const chainChangedHandler = async (chainId: any) => {
      const newChainId = ethers.BigNumber.from(chainId).toNumber();
      console.log("chainChangedHandler", newChainId);
      dispatch(storeChainId(newChainId));

      // window.location.reload();
    };
    window?.ethereum?.on("chainChanged", chainChangedHandler);

    return {
      accountsChanged: accountChangedHandler,
      chainChanged: chainChangedHandler,
    };
  }, [dispatch]);

  const removeWeb3ChangeListeners = useCallback((changeEventHandlers: any) => {
    console.log("Removing web3 change listeners", changeEventHandlers);
    window?.ethereum?.removeListener("accountsChanged", changeEventHandlers.accountsChanged);
    window?.ethereum?.removeListener("chainChanged", changeEventHandlers.chainChanged);
  }, []);

  const getWalletInfo = useCallback(async () => {
    const metamaskCurrentChainId = (await provider?.getNetwork())?.chainId;

    const accounts = await provider?.send("eth_requestAccounts", []);
    console.log("accounts", accounts);

    dispatch(storeAllAccounts(accounts));
    dispatch(storeChainId(metamaskCurrentChainId || 0));
    dispatch(storeCurrentAddress(accounts[0]));

    return {
      provider: provider,
      address: accounts[0],
      chainId: metamaskCurrentChainId,
    };
  }, [dispatch, provider]);

  const initWalletConnection = useCallback(async () => {
    console.log("initWalletConnection");
    const showSpinner = handleSpinner(<div className="spinner-description">Please connect your Metamask wallet</div>);
    showSpinner(true);
    try {
      checkMetamaskAvailability();
      const externalNetworkDetails = await getWalletInfo();
      console.log("externalNetworkDetails", externalNetworkDetails);
    } catch (err: any) {
      console.error(err);
      const readableError = err?.message || JSON.stringify(err);
      toast(`Error: ${readableError}`, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        type: "error",
      });
      throw new Error(readableError);
    } finally {
      showSpinner(false);
    }
  }, [getWalletInfo, handleSpinner]);

  useEffect(() => {
    const changeEventHandlers = detectExtensionsChanges();
    return () => {
      removeWeb3ChangeListeners(changeEventHandlers);
    };
  }, [detectExtensionsChanges, removeWeb3ChangeListeners]);

  useEffect(() => {
    console.log("Init useWallet");
  }, []);

  return {walletInfo, initWalletConnection, getWalletInfo};
};

export default useWallet;
