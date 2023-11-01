import {FC, createContext, useContext, useEffect, useState} from "react";
import {ethers} from "ethers";
import {checkMetamaskAvailability} from "../utils";
import {toast} from "react-toastify";
import {SpinnerContext} from "../../components/spinner/spinnerContext";
import {showSpinner} from "../redux/spinnerSlice";
import {useDispatch} from "react-redux";

const ProviderContext = createContext<ethers.providers.Web3Provider | null>(null);

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error("Web3Provider is not available");
  }
  return context;
};

export const Web3ProviderProvider: FC<{children: any}> = ({children}) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const {defineSpinner} = useContext(SpinnerContext);
  const dispatch = useDispatch();

  useEffect(() => {
    const getProvider = () => {
      try {
        checkMetamaskAvailability();
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        return web3Provider;
      } catch (err: any) {
        console.error(err);
        const readableError = err?.message || JSON.stringify(err);
        defineSpinner(<div className="spinner-description">{readableError}</div>);
        dispatch(showSpinner());

        toast(`Error: ${readableError}`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          type: "error",
        });

        return null;
      }
    };

    const _provider = getProvider();
    setProvider(_provider);
  }, [defineSpinner, dispatch]);

  if (provider !== null) return <ProviderContext.Provider value={provider}>{children}</ProviderContext.Provider>;
  else
    return (
      <>
        <div style={{height: "80vh"}}></div>
      </>
    );
};
