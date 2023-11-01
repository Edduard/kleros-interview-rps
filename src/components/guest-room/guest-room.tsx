import {useCallback, useContext, useEffect, useRef, useState} from "react";
import "./guest-room.scss";
import PageTitle from "../page-title/page-title";
import MovePicker from "../move-picker/move-picker";
import ActionButton from "../action-button/action-button";
import {Move, availableMoves, emptyMove, undisclosedMove} from "../../utils/constants/constants";
import useContract, {GameInfo} from "../../utils/hooks/useContract";
import {useNavigate} from "react-router-dom";
import useWallet from "../../utils/hooks/useWallet";
import Countdown from "../countdown/countdown";
import {toast} from "react-toastify";
import {SpinnerContext} from "../spinner/spinnerContext";
import MovesOverview from "../moves-overview/moves-overview";
import {explorersByChainId, safelyOpenExternalUrl} from "../../utils/utils";
import {hideSpinner, showSpinner} from "../../utils/redux/spinnerSlice";
import {useDispatch} from "react-redux";

const GuestRoom = ({hostAddress, contractAddress}: {hostAddress: string; contractAddress: string}) => {
  const [selectedMove, setSelectedMove] = useState<Move>(emptyMove);
  const [guestMove, setGuestMove] = useState<Move>(emptyMove);
  const [stakedAmount, setStakedAmount] = useState<string>("");
  const [waitingTimeInSeconds, setWaitingTimeInSeconds] = useState<number>();
  const [deadlineTimestamp, setDeadlineTimestamp] = useState<number>(0);
  const [gameTimeout, setGameTimeout] = useState<number>(0);
  const navigate = useNavigate();
  const interval = useRef<any>();
  const refreshInterval = 10000;

  const {getContractInfo, submitGuestMove} = useContract();
  const {isSpinnerVisible, defineSpinner} = useContext(SpinnerContext);
  const {walletInfo} = useWallet();
  const dispatch = useDispatch();

  const onSelectMove = useCallback((selectedMove: number) => {
    setSelectedMove(availableMoves.find((move) => move.value === selectedMove) || emptyMove);
  }, []);

  const onCountdownEnd = useCallback(async () => {
    try {
      clearInterval(interval.current);
      navigate("/timeout/" + hostAddress + "/" + contractAddress);
      console.log("Countdown ended");
    } catch (err) {
      console.error("Err", err);
    }
  }, [contractAddress, hostAddress, navigate]);

  const submitMove = useCallback(
    async (move: Move) => {
      try {
        console.log("deadlineTimestamp", deadlineTimestamp);
        console.log("Date.now()", Date.now());
        if (deadlineTimestamp > Date.now() / 1000) {
          await submitGuestMove(move, contractAddress);
          setGuestMove(selectedMove);
          setDeadlineTimestamp(Date.now() / 1000 + gameTimeout);
          setWaitingTimeInSeconds(gameTimeout);
        } else {
          throw new Error("You weren't fast enough! Timeout reached!");
        }
      } catch (err) {
        console.error("Err", err);
      }
    },
    [contractAddress, deadlineTimestamp, gameTimeout, selectedMove, submitGuestMove]
  );

  const checkGameStatus = useCallback(
    (gameInfo: GameInfo) => {
      console.log("checkGameStatus - gameInfo", gameInfo);
      if (parseFloat(gameInfo.stakeAmount) === 0) {
        clearInterval(interval.current);
        toast(`Game ended. Check metamask to see if you won!`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          type: "warning",
        });
      }

      if (gameInfo.guestMove !== emptyMove.value) {
        // Guest guest its move
        setGuestMove(
          availableMoves.find((m: Move) => {
            return m.value === gameInfo.guestMove;
          }) || emptyMove
        );
      }

      if (gameInfo.lastActionAt + gameInfo.timeout < Date.now() / 1000) {
        clearInterval(interval.current);
        navigate(`/timeout/${hostAddress}/${contractAddress}`);
        throw new Error(`Game already ended! You had ${Math.floor(gameInfo.timeout / 60)} minutes to show up.`);
      }

      if (gameInfo.guestAddress.toLowerCase() !== walletInfo.currentAddress.toLowerCase()) {
        if (walletInfo.allAccounts.map((a) => a.toLowerCase()).includes(gameInfo.guestAddress.toLowerCase())) {
          defineSpinner(
            <div className="spinner-description">Please change your address to {gameInfo.guestAddress}</div>
          );
          dispatch(showSpinner());

          throw new Error(`Wrong address selected in Metamask. Please change to ${gameInfo.guestAddress}`);
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
                  clearInterval(interval.current);
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

      setWaitingTimeInSeconds(gameInfo.lastActionAt + gameInfo.timeout - Date.now() / 1000);
    },
    [
      walletInfo.currentAddress,
      walletInfo.allAccounts,
      isSpinnerVisible,
      navigate,
      hostAddress,
      contractAddress,
      defineSpinner,
      dispatch,
    ]
  );

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

  const getGameInfo = useCallback(
    async (silentFetch = false) => {
      try {
        const gameInfo = await getContractInfo(contractAddress, silentFetch);
        setStakedAmount(gameInfo.stakeAmount);
        checkGameStatus(gameInfo);
        setWaitingTimeInSeconds(gameInfo.lastActionAt + gameInfo.timeout - Date.now() / 1000);
        setDeadlineTimestamp(gameInfo.lastActionAt + gameInfo.timeout);
        setGameTimeout(gameInfo.timeout);
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
    [checkGameStatus, contractAddress, getContractInfo]
  );

  // useEffect(() => {
  //   console.log("hostAddress", hostAddress);
  //   console.log("contractAddress", contractAddress);

  //   getGameInfo();
  //   // Important, don't include getGameInfo in dependencies array in order to not trigger unwanted rerenders.
  // }, [hostAddress, contractAddress]);

  useEffect(() => {
    getGameInfo();
    clearInterval(interval.current);
    interval.current = setInterval(() => {
      getGameInfo(true);
    }, refreshInterval);
    return () => clearInterval(interval.current);
    // Important, don't include getGameInfo in dependencies array in order to not trigger unwanted rerenders.
  }, [hostAddress, contractAddress, walletInfo]);

  useEffect(() => {
    console.log("GuestRoom rerender");
  });

  return (
    <div>
      {parseFloat(stakedAmount) !== 0 ? (
        <PageTitle
          className="gap-2"
          contentRows={[
            <div className="guest-title">
              {guestMove.value === emptyMove.value ? "You have" : "Your opponent has"}
              <Countdown onCountdownEnd={() => onCountdownEnd()} totalTime={waitingTimeInSeconds} />
            </div>,
            `${
              guestMove.value === emptyMove.value ? "Please submit your move" : "Waiting for opponent to reveal moves"
            }`,
            <div>
              <div
                className="tooltip guest-title-opponent-info"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(hostAddress);
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
                {hostAddress.slice(0, 3) + "..." + hostAddress.slice(-3)}
                <span className="tooltip-text">{hostAddress}</span>
              </div>
            </div>,
          ]}
        />
      ) : (
        <PageTitle
          className="gap-2"
          contentRows={[
            `Game ended`,
            <div>
              <div
                className="tooltip guest-title-opponent-info"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(hostAddress);
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
                {`Played against: `}
                {hostAddress.slice(0, 3) + "..." + hostAddress.slice(-3)}
                <span className="tooltip-text">{hostAddress}</span>
              </div>
            </div>,
          ]}
        />
      )}

      <div className="actions-container">
        {guestMove.value === emptyMove.value ? (
          <>
            <MovePicker onSelect={onSelectMove} />
            {/* <div className={``}> */}
            <div className={`purple-container ${selectedMove.value > 0 ? "visible" : "invisible"}`}>
              <h3 className="mt-0">
                <div className="d-flex">
                  You selected <span className="blue-container">{selectedMove.name}</span>
                </div>
                <div className="d-flex">
                  Stake / bid amount: <span className="blue-container">{stakedAmount} ETH</span>
                </div>
              </h3>

              <ActionButton
                className={`w-100`}
                content="Submit move"
                onClick={() => submitMove(selectedMove)}></ActionButton>
            </div>
            {/* </div> */}
          </>
        ) : (
          <div className="purple-container mt-3">
            <MovesOverview myMove={guestMove} opponentMove={undisclosedMove} stakeAmount={stakedAmount} />
            <ActionButton
              className={`w-100 button-outline-white`}
              content="Copy invite link"
              onClick={() => copyInviteLink()}></ActionButton>
          </div>
        )}
      </div>
      <div className="actions-container mt-2">
        <div className={`purple-container mb-4`}>
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

export default GuestRoom;
