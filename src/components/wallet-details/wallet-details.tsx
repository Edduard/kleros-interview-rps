import {FC} from "react";
import "./wallet-details.scss";
import {toast} from "react-toastify";
import {useSelector} from "react-redux";
import {RootState} from "../../utils/redux/store";

const WalletDetails: FC = () => {
  // const {walletInfo} = useWallet();
  const walletInfo = useSelector((state: RootState) => state.wallet);

  return (
    <div className="wallet-details">
      {walletInfo.currentAddress ? (
        <>
          <div
            className="tooltip wallet-info-item"
            onClick={() => {
              try {
                navigator.clipboard.writeText(walletInfo.currentAddress);
                toast(`Address copied to clipboard`, {
                  position: "bottom-center",
                  autoClose: 2500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: true,
                  type: "success",
                });
              } catch (err) {
                console.error(err);
              }
            }}>
            {`Connected with: `}
            {walletInfo.currentAddress.slice(0, 3) + "..." + walletInfo.currentAddress.slice(-3)}
            <span className="tooltip-text">{walletInfo.currentAddress}</span>
          </div>
        </>
      ) : (
        <></>
      )}

      {walletInfo.chainId ? (
        <>
          <div
            className="tooltip wallet-info-item"
            onClick={() => {
              try {
                navigator.clipboard.writeText(walletInfo.chainId?.toString());
                toast(`Chain ID copied to clipboard`, {
                  position: "bottom-center",
                  autoClose: 2500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: true,
                  type: "success",
                });
              } catch (err) {
                console.error(err);
              }
            }}>
            {`Chain ID: `}
            {walletInfo.chainId}
            <span className="tooltip-text">{walletInfo.chainId}</span>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
export default WalletDetails;
