import {useCallback} from "react";
import "./intro.scss";
import ActionButton from "../../components/action-button/action-button";
import useWallet from "../../utils/hooks/useWallet";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import useContract from "../../utils/hooks/useContract";
import {ethers} from "ethers";

const Intro = () => {
  const {walletInfo, initWalletConnection} = useWallet();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
    setError,
  } = useForm({mode: "onBlur"});
  const {getContractInfo} = useContract();

  const createRoom = useCallback(async () => {
    try {
      await initWalletConnection();
      navigate("/start-game");
    } catch (err) {
      console.error("Err", err);
    }
  }, [initWalletConnection, navigate]);

  const joinRoom = useCallback(
    async (args?: any) => {
      try {
        console.log("args", args);
        await initWalletConnection();
        const gameInfo = await getContractInfo(args.contractAddress);
        console.log("gameInfo", gameInfo);
        console.log("walletInfo.currentAddress", walletInfo.currentAddress);

        if (
          gameInfo.guestAddress.toLowerCase() !== walletInfo.currentAddress.toLowerCase() &&
          gameInfo.hostAddress.toLowerCase() !== walletInfo.currentAddress.toLowerCase()
        ) {
          if (
            walletInfo.allAccounts.map((a) => a.toLowerCase()).includes(gameInfo.guestAddress.toLowerCase()) ||
            walletInfo.allAccounts.map((a) => a.toLowerCase()).includes(gameInfo.hostAddress.toLowerCase())
          ) {
            return setError("contractAddress", {type: "custom", message: "Please select the right Metamask account!"});
          } else {
            return setError("contractAddress", {type: "custom", message: "Not your room!"});
          }
        }

        if (parseFloat(gameInfo.stakeAmount) === 0) {
          return setError("contractAddress", {type: "custom", message: "Game already ended"});
        }

        // if (gameInfo.guestMove === emptyMove.value) {
        // }
        navigate(`/room/${gameInfo.hostAddress}/${args.contractAddress}`);
      } catch (err) {
        console.error("Err", err);
        setError("contractAddress", {type: "custom", message: "Invalid contract"});
      }
    },
    [getContractInfo, initWalletConnection, navigate, setError, walletInfo.allAccounts, walletInfo.currentAddress]
  );

  const validateContractAddress = (address: string) => {
    return ethers.utils.isAddress(address);
  };

  return (
    <div className="intro">
      <ActionButton content="Start new game" onClick={createRoom}></ActionButton>

      <h2 className="intro-divider">Or join an existing one</h2>
      <div className="purple-container">
        <form onSubmit={handleSubmit(joinRoom)} className="form-container">
          <label className="" htmlFor="contractAddress">
            <input
              className={`custom-input ${errors?.contractAddress ? "input-with-error" : ""}`}
              id="contractAddress"
              type="contractAddress"
              placeholder="Address of opponent's contract"
              {...register("contractAddress", {validate: validateContractAddress})}
              onChange={(e) => {
                setValue("contractAddress", e.target.value, {shouldValidate: true});
              }}></input>
            <div className={`${errors?.contractAddress ? "custom-input-text-error text-white" : "invisible"}`}>
              <div className="">
                {`${errors?.contractAddress?.message ? errors?.contractAddress?.message : "Invalid address"}`}
              </div>
            </div>
          </label>

          <ActionButton className="w-100" content="Join game" buttonType="submit"></ActionButton>
        </form>
      </div>
    </div>
  );
};

export default Intro;
