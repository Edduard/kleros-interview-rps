import {useCallback, useContext, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {ethers} from "ethers";
import {storeAllAccounts, storeChainId, storeCurrentAddress} from "../redux/walletSlice";
import {toast} from "react-toastify";
import {SpinnerContext} from "../../components/spinner/spinnerContext";
import {checkMetamaskAvailability, timeoutPromise} from "../utils";
import {useProvider} from "./web3ProviderContext";
import {hideSpinner, showSpinner} from "../redux/spinnerSlice";

const useWallet = () => {
  const {defineSpinner} = useContext(SpinnerContext);
  const dispatch = useDispatch();
  const {provider, refreshProvider} = useProvider();

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
      await refreshProvider();
      console.warn("error", error);
      throw error;
    }
  }, [dispatch, provider, refreshProvider]);

  const initWalletConnection = useCallback(async () => {
    console.log("initWalletConnection");
    defineSpinner(<div className="spinner-description">Please connect your Metamask wallet</div>);
    dispatch(showSpinner());
    try {
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
      dispatch(hideSpinner());
    }
  }, [defineSpinner, dispatch, getWalletInfo]);

  useEffect(() => {
    const changeEventHandlers = detectExtensionsChanges();
    return () => {
      removeWeb3ChangeListeners(changeEventHandlers);
    };
  }, [walletInfo, detectExtensionsChanges, removeWeb3ChangeListeners]);

  useEffect(() => {
    console.log("Init useWallet");
  }, []);

  return {walletInfo, initWalletConnection, getWalletInfo};
};

export default useWallet;
