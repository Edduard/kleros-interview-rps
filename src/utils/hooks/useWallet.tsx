import {useCallback, useContext, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState, StoreDispatch, resetAllStores} from "../redux/store";
import {ethers} from "ethers";
import {resetWalletState, storeAllAccounts, storeChainId, storeCurrentAddress} from "../redux/walletSlice";
import {toast} from "react-toastify";
import {SpinnerContext} from "../../components/spinner/spinnerContext";
import {checkMetamaskAvailability, timeoutPromise} from "../utils";
import {useProvider} from "./web3ProviderContext";
import {hideSpinner, showSpinner} from "../redux/spinnerSlice";

const useWallet = () => {
  const {defineSpinner} = useContext(SpinnerContext);
  const dispatch = useDispatch<StoreDispatch>();
  const {provider} = useProvider();
  const [isLoading, setIsLoading] = useState(false);

  const walletInfo = useSelector((state: RootState) => state.wallet);

  const detectExtensionsChanges = useCallback(() => {
    const _disconnectHandler = async () => {
      console.log("_disconnectHandler");
      dispatch(resetAllStores());
    };

    const accountChangedHandler = async (accounts: any) => {
      console.log("accountChangedHandler", accounts);
      if (accounts?.length > 0) {
        dispatch(storeAllAccounts(accounts));
        dispatch(storeCurrentAddress(accounts[0]));
      } else {
        _disconnectHandler();
      }
    };
    window?.ethereum?.on("accountsChanged", accountChangedHandler);

    const chainChangedHandler = async (chainId: any) => {
      const newChainId = ethers.BigNumber.from(chainId).toNumber();
      console.log("chainChangedHandler", newChainId);
      dispatch(storeChainId(newChainId));
    };
    window?.ethereum?.on("chainChanged", chainChangedHandler);

    return {
      accountsChanged: accountChangedHandler,
      chainChanged: chainChangedHandler,
      disconnect: _disconnectHandler,
    };
  }, [dispatch]);

  const removeWeb3ChangeListeners = useCallback((changeEventHandlers: any) => {
    console.log("Removing web3 change listeners", changeEventHandlers);
    window?.ethereum?.removeListener("accountsChanged", changeEventHandlers.accountsChanged);
    window?.ethereum?.removeListener("chainChanged", changeEventHandlers.chainChanged);
  }, []);

  const getWalletInfo = useCallback(async () => {
    try {
      console.log("getWalletInfo");
      console.log("provider", provider);

      // getNetwork() sometimes hangs out if user changed wallets in between dApp usage
      const net = await timeoutPromise(provider?.getNetwork(), {
        ms: 3000,
        errorMessage: "Metamask error. Please try again",
      });
      console.log("net", net);

      const metamaskCurrentChainId = net?.chainId;
      console.log("metamaskCurrentChainId", metamaskCurrentChainId);

      const accounts: string[] = await provider?.send("eth_requestAccounts", []);
      console.log("accounts", accounts);

      dispatch(storeAllAccounts(accounts));
      dispatch(storeChainId(metamaskCurrentChainId || 0));
      dispatch(storeCurrentAddress(accounts[0]));

      return {
        provider: provider,
        currentAddress: accounts[0],
        allAccounts: accounts,
        chainId: metamaskCurrentChainId,
      };
    } catch (error: any) {
      // await refreshProvider();
      console.warn("error", error);
      throw error;
    }
  }, [dispatch, provider]);

  const initWalletConnection = useCallback(
    async (silentFetch = false) => {
      console.log("initWalletConnection");
      if (!silentFetch) {
        defineSpinner(<div className="spinner-description">Connecting your Metamask wallet</div>);
      }
      try {
        if (!silentFetch) {
          dispatch(showSpinner());
          setIsLoading(true);
        }
        checkMetamaskAvailability();
        console.log("Metamask available");
        const externalNetworkDetails = await getWalletInfo();
        console.log("externalNetworkDetails", externalNetworkDetails);
        return externalNetworkDetails;
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
        if (!silentFetch) {
          dispatch(hideSpinner());
          setIsLoading(false);
        }
      }
    },
    [defineSpinner, dispatch, getWalletInfo]
  );

  useEffect(() => {
    const changeEventHandlers = detectExtensionsChanges();
    return () => {
      removeWeb3ChangeListeners(changeEventHandlers);
    };
  }, [walletInfo, detectExtensionsChanges, removeWeb3ChangeListeners]);

  // useEffect(() => {
  //   const getInfo = async () => {
  //     try {
  //       const accounts = await window.ethereum.request({method: "eth_accounts"});
  //       console.log("Approved accounts in metamask", accounts);
  //       if (!walletInfo?.currentAddress?.length) {
  //         if (accounts?.length > 0) {
  //           // await getWalletInfo();
  //           await initWalletConnection();
  //         } else {
  //           throw new Error("Wallet not connected!");
  //         }
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getInfo();
  // }, []);

  return {walletInfo, initWalletConnection, getWalletInfo};
};

export default useWallet;
