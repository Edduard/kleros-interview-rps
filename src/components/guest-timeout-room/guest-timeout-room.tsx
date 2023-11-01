import {useCallback, useContext, useEffect, useState} from "react";
import "./guest-timeout-room.scss";
import PageTitle from "../page-title/page-title";
import ActionButton from "../action-button/action-button";
import {Move, availableMoves, emptyMove, undisclosedMove} from "../../utils/constants/constants";
import useContract, {GameInfo} from "../../utils/hooks/useContract";
import {useNavigate} from "react-router-dom";
import useWallet from "../../utils/hooks/useWallet";
import {toast} from "react-toastify";
import {SpinnerContext} from "../spinner/spinnerContext";
import MovesOverview from "../moves-overview/moves-overview";
import {explorersByChainId, safelyOpenExternalUrl} from "../../utils/utils";
import {showSpinner, hideSpinner} from "../../utils/redux/spinnerSlice";
import {useDispatch} from "react-redux";

const GuestTimeoutRoom = ({hostAddress, contractAddress}: {hostAddress: string; contractAddress: string}) => {
  const [guestMove, setGuestMove] = useState<Move>(emptyMove);
  const [stakedAmount, setStakedAmount] = useState<string>("");
  const navigate = useNavigate();

  const {getContractInfo, timeoutContract} = useContract();
  const {isSpinnerVisible, defineSpinner} = useContext(SpinnerContext);
  const {walletInfo} = useWallet();
  const dispatch = useDispatch();

  const checkGameStatus = useCallback(
    (gameInfo: GameInfo) => {
      console.log("checkGameStatus - gameInfo", gameInfo);

      if (parseFloat(gameInfo.stakeAmount) === 0) {
        console.warn("Game ended. Check metamask to see if you won!");
      }

      if (gameInfo.guestMove !== emptyMove.value) {
        // Guest guest its move
        setGuestMove(
          availableMoves.find((m: Move) => {
            return m.value === gameInfo.guestMove;
          }) || emptyMove
        );
      }

      if (gameInfo.lastActionAt + gameInfo.timeout >= Date.now() / 1000) {
        // navigate(`/room/${contractAddress}`);
        throw new Error(`Game still on! You have ${Math.floor(gameInfo.timeout / 60)} minutes to play.`);
      }
      console.log("walletInfo.currentAddress", walletInfo.currentAddress);
      if (
        gameInfo.guestAddress.toLowerCase() !== walletInfo.currentAddress.toLowerCase() &&
        gameInfo.hostAddress.toLowerCase() !== walletInfo.currentAddress.toLowerCase()
      ) {
        if (
          walletInfo.allAccounts.map((a) => a.toLowerCase()).includes(gameInfo.guestAddress.toLowerCase()) ||
          walletInfo.allAccounts.map((a) => a.toLowerCase()).includes(gameInfo.hostAddress.toLowerCase())
        ) {
          defineSpinner(
            <div className="spinner-description">
              Please change your address to {gameInfo.guestAddress} or {gameInfo.hostAddress}
            </div>
          );
          dispatch(showSpinner());

          throw new Error(
            `Wrong address selected in Metamask. Please change to ${gameInfo.guestAddress} or ${gameInfo.hostAddress}`
          );
        } else {
          defineSpinner(
            <div className="d-flex flex-direction-column">
              <div className="spinner-description text-center">{`You are not invited in this room!`}</div>
              <div className="spinner-description text-center">{`If this is your address: ${gameInfo.guestAddress} please switch to it in Metamask.`}</div>
              <div className="mt-2">Or play a new game</div>
              <ActionButton
                className="mt-2"
                content="Main screen"
                onClick={() => {
                  dispatch(hideSpinner());
                  navigate("/");
                }}></ActionButton>
            </div>
          );
          dispatch(showSpinner());

          throw new Error(
            `You are not invited in this room! If this is your address: ${gameInfo.guestAddress} please switch to it in Metamask.`
          );
        }
      }

      // Close existing spinner if opened
      if (isSpinnerVisible()) {
        dispatch(hideSpinner());
      }
    },
    [walletInfo.currentAddress, walletInfo.allAccounts, isSpinnerVisible, navigate, defineSpinner]
  );

  const getGameInfo = useCallback(async () => {
    try {
      if (contractAddress) {
        const gameInfo = await getContractInfo(contractAddress);
        setStakedAmount(gameInfo.stakeAmount);
        checkGameStatus(gameInfo);
      }
    } catch (err: any) {
      console.error("Err", err);
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
    }
  }, [getContractInfo, contractAddress, checkGameStatus]);

  const triggerTimeout = useCallback(async () => {
    try {
      if (contractAddress) {
        await timeoutContract(contractAddress);
        getGameInfo();
        toast(`Successfully retrieved stake`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Err", err);
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
    }
  }, [contractAddress, getGameInfo, timeoutContract]);

  useEffect(() => {
    console.log("contractAddress", contractAddress);
    getGameInfo();
    // Important, don't include getGameInfo in dependencies array in order to not trigger unwanted rerenders.
  }, [contractAddress]);

  useEffect(() => {
    console.log("GuestTimeoutRoom rerender");
  });

  return (
    <div>
      {parseFloat(stakedAmount) !== 0 ? (
        <PageTitle
          className="gap-2"
          contentRows={[
            <div className="timeout-title">
              {guestMove.value !== emptyMove.value ? <>Your opponent has timed out</> : <>You timed out</>}
            </div>,
            <div className="timeout-title">
              {guestMove.value !== emptyMove.value ? (
                <>Redeem your prize here</>
              ) : (
                <>Opponent will get its stake back</>
              )}
            </div>,
          ]}
        />
      ) : (
        <PageTitle className="gap-2" contentRows={[<div className="timeout-title">Game ended</div>]} />
      )}

      <div className="actions-container flex-direction-column">
        <div className="purple-container mt-3">
          <MovesOverview myMove={guestMove} opponentMove={undisclosedMove} stakeAmount={stakedAmount} />
          {parseFloat(stakedAmount) !== 0 ? (
            <ActionButton
              className={`w-100 button-outline-white`}
              content={guestMove.value !== emptyMove.value ? "Redeem prize" : "Return stake to opponent"}
              onClick={() => triggerTimeout()}></ActionButton>
          ) : (
            <></>
          )}
        </div>
        <div className={`purple-container mt-2`}>
          <h3 className="mt-0 mb-0">You played on the following smart contract:</h3>
          <span className="mt-1">{contractAddress}</span>

          <ActionButton
            className={`w-100 button-outline-white`}
            content="See more on etherscan"
            onClick={() => {
              safelyOpenExternalUrl(`${explorersByChainId[walletInfo.chainId?.toString()]}/address/${contractAddress}`);
            }}></ActionButton>
        </div>
      </div>
    </div>
  );
};
export default GuestTimeoutRoom;
