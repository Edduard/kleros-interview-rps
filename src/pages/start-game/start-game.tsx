import {useCallback, useContext, useMemo, useState} from "react";
import "./start-game.scss";
import PageTitle from "../../components/page-title/page-title";
import MovePicker from "../../components/move-picker/move-picker";
import ActionButton from "../../components/action-button/action-button";
import {Move, availableMoves, emptyMove} from "../../utils/constants/constants";
import {useForm} from "react-hook-form";
import useContract from "../../utils/hooks/useContract";
import {ModalContext} from "../../components/modal/modalContext";
import PasswordModal, {passwordModalTypes} from "../../components/modal/modal-templates/password-modal";
import {useNavigate} from "react-router-dom";
import useWallet from "../../utils/hooks/useWallet";
import {useDispatch} from "react-redux";
import {storeGuestAddress, storeHostMove, storeHostUsedPassword} from "../../utils/redux/gameInfoSlice";

const StartGame = () => {
  const [selectedMove, setSelectedMove] = useState<Move>(emptyMove);
  const [stakedAmount, setStakedAmount] = useState<string>("");
  const {startDeployment, getContractInfo} = useContract();
  const {walletInfo} = useWallet();
  const [guestAddress, setGuestAddress] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm({mode: "onBlur"});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSelectMove = useCallback((selectedMove: number) => {
    setSelectedMove(availableMoves.find((move) => move.value === selectedMove) || emptyMove);
  }, []);

  const getStepContent = useCallback(() => {
    if (Object.keys(errors).length > 0) {
      return [`Please fill all fields`];
    } else {
      switch (true) {
        case selectedMove.value > 0 && !(parseFloat(stakedAmount) > 0) && !(guestAddress.length > 0): {
          return [`Step 2.`, `How much do you want to bid?`];
        }
        case selectedMove.value > 0 && parseFloat(stakedAmount) > 0 && !(guestAddress.length > 0): {
          return [`Step 3.`, `Type your opponent's address`];
        }
        case selectedMove.value > 0 && parseFloat(stakedAmount) > 0 && guestAddress.length > 0: {
          return [`Step 4.`, `Submit your move!`];
        }
        default: {
          return [`Step 1.`, `Pick your move`];
        }
      }
    }
  }, [errors, guestAddress.length, selectedMove.value, stakedAmount]);

  const {handleModal} = useContext<any>(ModalContext);

  const openPasswordModal: () => Promise<string | undefined> = useCallback(() => {
    return new Promise((resolve, reject) => {
      handleModal(
        <PasswordModal
          type={passwordModalTypes.setPassword}
          className="modal-wider"
          title="Do you want to secure your move with a password?"
          onDismiss={() => {}}
          onSuccess={resolve}>
          <div>
            <h2 className="w-100 text-center mt-0 text-primary">Optionally set up a password</h2>
            <p>
              Setting up a password will secure your funds in case of a malicious browser extension tries to read what
              move you played, possibly giving an unfair advantage to your opponent
            </p>
            <div className="text-primary">
              <h4>Be careful !</h4>
              <h4>This password CANNOT be recovered and it is REQUIRED when revealing your move</h4>
            </div>
          </div>
        </PasswordModal>
      );
    });
  }, [handleModal]);

  const startGame = useCallback(async () => {
    try {
      const password = await openPasswordModal();
      console.log("password", password);

      dispatch(storeHostUsedPassword(!!password?.length));

      const deployedContractAddress = await startDeployment(selectedMove, stakedAmount, guestAddress, password);
      // ToDo: put this back
      await getContractInfo(deployedContractAddress);
      console.log("selectedMove", selectedMove);

      dispatch(storeHostMove(selectedMove));
      dispatch(storeGuestAddress(guestAddress));

      // ToDo: Delete this
      // Opponent address: 0x31Fdef30566a76D25E03Efa39A466ac5B6DA39Ea
      // Stake: 0.0001

      // revealMove - password 123456789
      // decryptedMove 1
      // decryptedSalt 275d4a05b6298b06e789b9c6cc15059a
      // deployedContractAddress 0xfDA73b2c394e19cB5cfA842bA7DA5FBA57d63140
      // await getContractInfo("0xfDA73b2c394e19cB5cfA842bA7DA5FBA57d63140");

      navigate("/room/" + walletInfo.currentAddress + "/" + deployedContractAddress);

      // await contract.revealMove(password);
    } catch (err) {
      console.error("Err", err);
    }
  }, [
    openPasswordModal,
    startDeployment,
    selectedMove,
    stakedAmount,
    guestAddress,
    getContractInfo,
    dispatch,
    navigate,
    walletInfo.currentAddress,
  ]);

  return (
    <div>
      <PageTitle contentRows={getStepContent()} />
      <div className="actions-container">
        <MovePicker onSelect={onSelectMove} />
        <div className={`${selectedMove.value > 0 ? "visible" : "invisible"} purple-container`}>
          <h2 className="mt-0 d-flex">
            You selected <span className="blue-container">{selectedMove.name}</span>
          </h2>

          <form onSubmit={handleSubmit(startGame)} className="form-container">
            <label className="" htmlFor="stakeAmount">
              <input
                className={`custom-input ${errors?.stakeAmount ? "input-with-error" : ""}`}
                id="stakeAmount"
                type="number"
                placeholder="Stake / Bid (ETH)"
                value={stakedAmount}
                {...register("stakeAmount", {validate: (value) => parseFloat(value) > 0})}
                onChange={(e) => {
                  setStakedAmount(e.target.value);
                  setValue("stakeAmount", e.target.value, {shouldValidate: true});
                }}></input>
              <div className={`${errors?.stakeAmount ? "custom-input-text-error text-white" : "invisible"}`}>
                <div className="">{`Stake should be > 0`}</div>
              </div>
            </label>

            <label className="" htmlFor="guestAddress">
              <input
                className={`custom-input ${errors?.guestAddress ? "input-with-error" : ""}`}
                id="guestAddress"
                type="text"
                placeholder="Address of opponent's contract"
                value={guestAddress}
                {...register("guestAddress", {validate: (value) => value?.length > 0})}
                onChange={(e) => {
                  setGuestAddress(e.target.value);
                  setValue("guestAddress", e.target.value, {shouldValidate: true});
                }}></input>
              <div className={`${errors?.guestAddress ? "custom-input-text-error text-white" : "invisible"}`}>
                <div className="">{`Opponent's address is required`}</div>
              </div>
            </label>
            <ActionButton className="w-100" content="Start game" buttonType="submit"></ActionButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartGame;
