import {FC} from "react";
import "./header.scss";
import WalletDetails from "../wallet-details/wallet-details";
import spinnerSvg from "./../../assets/kleros-logo-shape.svg";

const Header: FC = () => {
  return (
    <div className="page-header">
      <a href="/">
        <div className="header-logo">
          <img alt="" src={spinnerSvg} className="spinner" />
        </div>
      </a>
      <WalletDetails />
    </div>
  );
};
export default Header;
