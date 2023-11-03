import {useCallback, useContext, useEffect, useRef, useState} from "react";
import "./host-room.scss";
import PageTitle from "../page-title/page-title";
import ActionButton from "../action-button/action-button";
import {Move, availableMoves, emptyMove, undisclosedMove} from "../../utils/constants/constants";
import useContract, {GameInfo} from "../../utils/hooks/useContract";
import {ModalContext} from "../modal/modalContext";
import PasswordModal, {passwordModalTypes} from "../modal/modal-templates/password-modal";
import {useNavigate} from "react-router-dom";
import useWallet from "../../utils/hooks/useWallet";
import {toast} from "react-toastify";
import {SpinnerContext} from "../spinner/spinnerContext";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../utils/redux/store";
import MovesOverview from "../moves-overview/moves-overview";
import Countdown from "../countdown/countdown";
import {explorersByChainId, safelyOpenExternalUrl} from "../../utils/utils";
import {hideSpinner, showSpinner} from "../../utils/redux/spinnerSlice";
import useInterval from "../../utils/hooks/useInterval";

const HostRoom = ({hostAddress, contractAddress}: {hostAddress: string; contractAddress: string}) => {
  const {hostMove, guestAddress, hostUsedPassword} = useSelector((state: RootState) => state.gameInfo);

  const [guestMove, setGuestMove] = useState<Move>(emptyMove);

  const [stakedAmount, setStakedAmount] = useState<string>("");
  const {isLoading, getContractInfo, solveGame} = useContract();
  const {walletInfo} = useWallet();
  const [waitingTimeInSeconds, setWaitingTimeInSeconds] = useState<number>();
  const [deadlineTimestamp, setDeadlineTimestamp] = useState<any>();
  const navigate = useNavigate();
  const {isSpinnerVisible, defineSpinner} = useContext(SpinnerContext);
  const interval = useRef<any>();
  const refreshInterval = 10000;
  const {defineInterval, startInterval, pauseInterval, resumeInterval, stopInterval} = useInterval();

  const dispatch = useDispatch();

  const checkGameStatus = useCallback(
    (gameInfo: GameInfo) => {
      console.log("checkGameStatus - gameInfo", gameInfo);
      console.log("checkGameStatus - walletInfo.allAccounts", walletInfo.allAccounts);
      console.log("checkGameStatus - walletInfo.currentAddress", walletInfo.currentAddress);
      console.log("gameInfo.guestMove", gameInfo.guestMove);
      console.log("emptyMove.value", emptyMove.value);

      if (gameInfo.guestMove !== emptyMove.value) {
        stopInterval();
        // clearInterval(interval.current);
        toast(`Opponent submitted its move. Please reveal your move!`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          type: "warning",
        });

        if (parseFloat(gameInfo.stakeAmount) === 0) {
          // Guest played its move
          // We only show the move in the state if the game ended (stakes has been collected)
          console.log("gameInfo.guestMove", gameInfo.guestMove);
          console.log("emptyMove.value", emptyMove.value);
          setGuestMove(
            availableMoves.find((m: Move) => {
              return m.value === gameInfo.guestMove;
            }) || undisclosedMove
          );
        } else {
          setGuestMove(undisclosedMove);
        }
      }

      if (gameInfo.lastActionAt + gameInfo.timeout < Date.now() / 1000) {
        console.log("gameInfo.lastActionAt + gameInfo.timeout", gameInfo.lastActionAt + gameInfo.timeout);
        console.log("Date.now() / 1000_______________________", Date.now() / 1000);
        console.log("now", new Date(Date.now()));
        console.log("then", new Date((gameInfo.lastActionAt + gameInfo.timeout) * 1000));

        // Deadline already passed. Nothing you can do
        stopInterval();
        // clearInterval(interval.current);
        navigate(`/timeout/${hostAddress}/${contractAddress}`);
        throw new Error(`Game already ended! You had ${Math.floor(gameInfo.timeout / 60)} minutes to show up.`);
      }

      if (gameInfo.hostAddress.toLowerCase() !== walletInfo.currentAddress.toLowerCase()) {
        if (walletInfo.allAccounts.map((a) => a.toLowerCase()).includes(gameInfo.hostAddress.toLowerCase())) {
          defineSpinner(
            <>
              <div className="spinner-description">Please change your address to {gameInfo.hostAddress}</div>
            </>
          );
          dispatch(showSpinner());

          throw new Error(`Wrong address selected in Metamask. Please change to ${gameInfo.hostAddress}`);
        } else {
          defineSpinner(
            <div className="d-flex flex-direction-column spinner-description">
              <div className="text-center">{`You are not invited in this room!`}</div>
              <div className="text-center mt-2">{`If one of these is your address: `}</div>
              <div className="text-center">{`${gameInfo.guestAddress}`}</div>
              <div className="text-center">{`${gameInfo.hostAddress}`}</div>
              <div className="text-center">{`Please switch to it in Metamask.`}</div>
              <div className="mt-2">Or play a new game</div>
              <ActionButton
                className="mt-2"
                content="Main screen"
                onClick={() => {
                  dispatch(hideSpinner());
                  stopInterval();
                  // clearInterval(interval.current);
                  navigate("/");
                }}></ActionButton>
            </div>
          );
          dispatch(showSpinner());

          throw new Error(
            `You are not invited in this room! If one of these is your address: ${gameInfo.guestAddress} or ${gameInfo.hostAddress} please switch to it in Metamask.`
          );
        }
      }

      // Close existing spinner if opened
      if (isSpinnerVisible()) {
        dispatch(hideSpinner());
      }

      setWaitingTimeInSeconds(gameInfo.lastActionAt + gameInfo.timeout - Date.now() / 1000);
    },
    [
      contractAddress,
      defineSpinner,
      dispatch,
      hostAddress,
      isSpinnerVisible,
      navigate,
      stopInterval,
      walletInfo.allAccounts,
      walletInfo.currentAddress,
    ]
  );

  const getGameInfo = useCallback(
    async (silentFetch = false) => {
      try {
        console.log("isLoading", isLoading);
        if (!isLoading || silentFetch) {
          const gameInfo = await getContractInfo(contractAddress, silentFetch);
          setStakedAmount(gameInfo.stakeAmount);

          checkGameStatus(gameInfo);

          setWaitingTimeInSeconds(gameInfo.lastActionAt + gameInfo.timeout - Date.now() / 1000);
          setDeadlineTimestamp(gameInfo.lastActionAt + gameInfo.timeout);
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
    },
    [checkGameStatus, contractAddress, getContractInfo, isLoading]
  );

  const {handleModal} = useContext<any>(ModalContext);
  const openPasswordModal: () => Promise<string | undefined> = useCallback(() => {
    return new Promise((resolve, reject) => {
      handleModal(
        <PasswordModal
          type={passwordModalTypes.getPassword}
          className="modal-regular"
          title="Please input password"
          onDismiss={() => {}}
          onSuccess={resolve}>
          <div>
            <p>What is the password that you set when starting the game?</p>
          </div>
        </PasswordModal>
      );
    });
  }, [handleModal]);

  const endGame = useCallback(async () => {
    try {
      pauseInterval();
      let password = undefined;
      if (hostUsedPassword) {
        password = await openPasswordModal();
        console.log("password", password);
      }

      const solvedGame = await solveGame(contractAddress, password);
      console.log("solvedGame", solvedGame);
      stopInterval();
      // clearInterval(interval.current);
      const gameInfo = await getContractInfo(contractAddress);
      console.log("gameInfo", gameInfo);

      setGuestMove(
        availableMoves.find((m: Move) => {
          return m.value === gameInfo.guestMove;
        }) || undisclosedMove
      );
    } catch (err: any) {
      console.error("Err", err);
      const readableError = err?.message || JSON.stringify(err);
      toast(`Error: ${readableError}`, {
        position: "bottom-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        type: "error",
      });
    }
  }, [contractAddress, getContractInfo, hostUsedPassword, openPasswordModal, pauseInterval, solveGame, stopInterval]);

  // useEffect(() => {
  //   console.log("hostAddress", hostAddress);
  //   console.log("contractAddress", contractAddress);
  //   getGameInfo();
  //   // Important, don't include getGameInfo in dependencies array in order to not trigger unwanted rerenders.
  // }, [hostAddress, contractAddress]);

  // useEffect(() => {
  //   getGameInfo();
  //   // Important, don't include getGameInfo in dependencies array in order to not trigger unwanted rerenders.
  // }, [hostAddress, contractAddress, getGameInfo]);

  useEffect(() => {
    getGameInfo();
    defineInterval(() => {
      getGameInfo(true);
    }, refreshInterval);
    startInterval();

    // return () => clearInterval(interval.current);

    // Important, don't include getGameInfo in dependencies array in order to not trigger unwanted rerenders.
  }, [hostAddress, contractAddress, walletInfo]);

  const copyInviteLink = useCallback(async () => {
    const baseURL = window.location.protocol + "//" + window.location.host;
    const inviteLink = `${baseURL}/room/${hostAddress}/${contractAddress}`;
    try {
      navigator.clipboard.writeText(inviteLink);
      toast(`Invite link copied to clipboard`, {
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
  }, [contractAddress, hostAddress]);

  const onCountdownEnd = useCallback(async () => {
    try {
      clearInterval(interval.current);
      navigate("/timeout/" + hostAddress + "/" + contractAddress);
      console.log("Countdown ended");
    } catch (err) {
      console.error("Err", err);
    }
  }, [contractAddress, hostAddress, navigate]);

  return (
    <div>
      <PageTitle
        className="gap-2"
        contentRows={[
          <div className="host-title">
            {guestMove.value === emptyMove.value || guestMove.value === undisclosedMove.value ? (
              <>
                {guestMove.value === emptyMove.value ? "Your opponent has" : "You have"}
                <Countdown onCountdownEnd={() => onCountdownEnd()} totalTime={waitingTimeInSeconds} />
              </>
            ) : (
              <>Game ended</>
            )}
          </div>,
          `${
            guestMove.value === emptyMove.value
              ? "Waiting for opponent to play its move"
              : guestMove.value === undisclosedMove.value
              ? "Please reveal the moves."
              : ""
          }`,
          <div>
            <div
              className="tooltip host-title-opponent-info"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(guestAddress);
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
              {`Playing against: `}
              {guestAddress.slice(0, 3) + "..." + guestAddress.slice(-3)}
              <span className="tooltip-text">{guestAddress}</span>
            </div>
          </div>,
        ]}
      />
      <div className="actions-container flex-direction-column">
        <div className={` purple-container mt-3`}>
          <MovesOverview myMove={hostMove} opponentMove={guestMove} stakeAmount={stakedAmount} />

          {guestMove.value === emptyMove.value ? (
            <ActionButton
              className={`w-100 button-outline-white`}
              content="Copy invite link"
              onClick={() => copyInviteLink()}></ActionButton>
          ) : (
            <>
              {guestMove.value !== undisclosedMove.value ? (
                <ActionButton
                  className="w-100"
                  content="Play again"
                  onClick={() => {
                    clearInterval(interval.current);
                    navigate("/");
                  }}></ActionButton>
              ) : (
                <>
                  <ActionButton
                    className="w-100"
                    content="Reveal moves and end game"
                    onClick={() => endGame()}></ActionButton>
                </>
              )}
            </>
          )}
        </div>
        <div className={`purple-container mt-2 mb-4`}>
          <h3 className="mt-0 mb-0">You are playing on the following smart contract:</h3>
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

export default HostRoom;
