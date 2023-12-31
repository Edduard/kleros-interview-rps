import {useCallback} from "react";
import "./intro.scss";
import ActionButton from "../../components/action-button/action-button";
import useWallet from "../../utils/hooks/useWallet";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import useContract from "../../utils/hooks/useContract";
import {ethers} from "ethers";

const Intro = () => {
  const {initWalletConnection} = useWallet();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
    setError,
  } = useForm({mode: "onBlur"});
  const {getContractInfo} = useContract();
  const {walletInfo} = useWallet();

  const createRoom = useCallback(async () => {
    try {
      if (!walletInfo?.currentAddress?.length) {
        // We do this because we are on a non-guarded page
        await initWalletConnection();
      }
      console.log("createRoom");
      // await initWalletConnection();
      navigate("/start-game");
    } catch (err) {
      console.error("Err", err);
    }
  }, [initWalletConnection, navigate, walletInfo?.currentAddress]);

  const joinRoom = useCallback(
    async (args?: any) => {
      try {
        let walletDetails;
        if (!walletInfo?.currentAddress?.length) {
          // We do this because we are on a non-guarded page
          walletDetails = await initWalletConnection();
        } else {
          walletDetails = walletInfo;
        }
        console.log("args", args);
        // await initWalletConnection();
        const gameInfo = await getContractInfo(args.contractAddress);
        console.log("walletDetails.currentAddress", walletDetails.currentAddress);
        console.log("walletDetails.allAccounts", walletDetails.allAccounts);
        console.log("wallet.currentAddress", walletDetails.currentAddress);

        if (
          gameInfo.guestAddress.toLowerCase() !== walletDetails.currentAddress.toLowerCase() &&
          gameInfo.hostAddress.toLowerCase() !== walletDetails.currentAddress.toLowerCase()
        ) {
          if (
            walletDetails.allAccounts
              .map((a: string) => a.toLowerCase())
              .includes(gameInfo.guestAddress.toLowerCase()) ||
            walletDetails.allAccounts.map((a: string) => a.toLowerCase()).includes(gameInfo.hostAddress.toLowerCase())
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
      } catch (err: any) {
        console.error("Err", err);
        setError("contractAddress", {type: "custom", message: err?.message ?? "Invalid contract"});
      }
    },
    [getContractInfo, initWalletConnection, navigate, setError, walletInfo]
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
