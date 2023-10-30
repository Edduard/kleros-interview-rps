import React, {useCallback, useContext} from "react";
import "./intro.scss";
import ActionButton from "../../components/action-button/action-button";
import {SpinnerContext} from "../../components/spinner/spinnerContext";
import {ethers} from "ethers";
import {toast} from "react-toastify";
import useWallet from "../../utils/hooks/useWallet";

const Intro = () => {
  const {handleSpinner} = useContext(SpinnerContext);
  const wallet = useWallet();

  const createRoom = useCallback(async () => {
    wallet.initWalletConnection();
  }, [wallet]);

  return (
    <div className="intro above-cemicircle-container">
      <h1>
        Welcome to
        <br />
        Rock Paper Scissors Lizard Spock
      </h1>
      <ActionButton content="Start new game" onClick={createRoom}></ActionButton>

      <h2>Or join an existing one</h2>
      <div className="purple-container">
        <h2>Or join an existing one</h2>
      </div>
    </div>
  );
};

export default Intro;
