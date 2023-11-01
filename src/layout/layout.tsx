import {Outlet} from "react-router-dom";
import "./layout.scss";
import {ModalProvider} from "../components/modal/modalContext";
import ModalContainer from "../components/modal/modalContainer";
import {SpinnerProvider} from "../components/spinner/spinnerContext";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Web3ProviderProvider} from "../utils/hooks/web3ProviderContext";
import Header from "../components/header/header";

const Layout = () => {
  return (
    <div className="main-layout">
      <div id="spinner-root"></div>
      <SpinnerProvider>
        <ModalProvider>
          <Web3ProviderProvider>
            <Header />
            <Outlet />
          </Web3ProviderProvider>
          <ModalContainer />
        </ModalProvider>
      </SpinnerProvider>
      <ToastContainer />
    </div>
  );
};

export default Layout;
