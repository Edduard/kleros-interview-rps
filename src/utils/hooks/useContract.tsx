import {useCallback, useContext, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {ethers} from "ethers";
import {toast} from "react-toastify";
import {SpinnerContext} from "../../components/spinner/spinnerContext";
import {generateSalt} from "../utils";
import {safelyGetMove, safelyGetSalt, safelyStoreMove, safelyStoreSalt} from "../storageManager";
import {Move, availableMoves, emptyMove} from "../constants/constants";
import RPSContract from "./../contracts/RPS.json";
import {useProvider} from "./web3ProviderContext";
import {storeGuestAddress, storeHostMove} from "../redux/gameInfoSlice";
import {hideSpinner, showSpinner} from "../redux/spinnerSlice";

export type GameInfo = {
  hostAddress: string;
  guestAddress: string;
  hashedHostMove: string;
  guestMove: number;
  stakeAmount: string;
  lastActionAt: number;
  timeout: number;
};

const useContract = () => {
  const {defineSpinner} = useContext(SpinnerContext);
  const {provider} = useProvider();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const verifyBytecode = useCallback(
    async (_contractAddress: string) => {
      try {
        const deployedBytecode = await provider.getCode(_contractAddress);
        console.log("deployedBytecode.toLowerCase()", deployedBytecode.toLowerCase());
        console.log("RPSContract.deployedBytecode.toLowerCase()", RPSContract.deployedBytecode.toLowerCase());

        if (deployedBytecode.toLowerCase() === RPSContract.deployedBytecode.toLowerCase()) {
          console.log("Bytecode verification passed");
        } else {
          console.log("Bytecode verification NOT passed");
          throw new Error("WARNING! The player who invited you deployed a malicious version of a smart contract.");
        }
      } catch (error: any) {
        console.error("Error verifying bytecode:", error);
        throw new Error(error?.message || error || "Error verifying contract");
      }
    },
    [provider]
  );

  const getContractInfo = useCallback(
    async (contractAddress: string, silentFetch = false) => {
      console.log("getContractInfo- dispatch:", dispatch);
      console.log("getContractInfo- defineSpinner:", defineSpinner);
      console.log("getContractInfo- provider:", provider);

      if (!silentFetch) {
        defineSpinner(<div className="spinner-description">Getting game info ...</div>);
      }
      try {
        if (!silentFetch) {
          dispatch(showSpinner());
          setIsLoading(true);
        }
        const contract = new ethers.Contract(contractAddress, RPSContract.abi, provider);
        console.log("contract", contract);

        const [
          hostAddress,
          guestAddress,
          hashedHostMove,
          guestMove,
          rawStakeAmount,
          rawLastActionTimestamp,
          rawTimeout,
        ] = await Promise.all([
          contract.j1(),
          contract.j2(),
          contract.c1Hash(),
          contract.c2(),
          contract.stake(),
          contract.lastAction(),
          contract.TIMEOUT(),
        ]);

        console.log("hostAddress", hostAddress);
        console.log("guestAddress", guestAddress);

        dispatch(storeGuestAddress(guestAddress));

        const stakeAmount = ethers.utils.formatUnits(rawStakeAmount);
        console.log("stakeAmount", stakeAmount);

        const lastActionAt = ethers.BigNumber.from(rawLastActionTimestamp).toNumber();
        console.log("lastActionAt", lastActionAt);

        const timeout = ethers.BigNumber.from(rawTimeout).toNumber();
        console.log("timeout", timeout);

        const c1Hash = await contract.c1Hash();
        console.log("c1Hash", c1Hash);

        const gameInfo: GameInfo = {
          hostAddress,
          guestAddress,
          hashedHostMove,
          guestMove,
          stakeAmount,
          lastActionAt,
          timeout,
        };

        return gameInfo;
      } catch (error: any) {
        console.error("Error reading contract:", error);
        throw new Error(error?.message || error || "Error reading contract");
      } finally {
        if (!silentFetch) {
          dispatch(hideSpinner());
          setIsLoading(false);
        }
      }
    },
    [dispatch, defineSpinner, provider]
  );

  const timeoutContract = useCallback(
    async (contractAddress: string, silentFetch = false) => {
      if (!silentFetch) {
        defineSpinner(<div className="spinner-description">Returning stake ...</div>);
      }

      try {
        if (!silentFetch) {
          dispatch(showSpinner());
          setIsLoading(true);
        }
        const contract = new ethers.Contract(contractAddress, RPSContract.abi, provider);
        console.log("contract", contract);

        // Connect to the user's wallet
        const signer = provider.getSigner();
        const signedContract = contract.connect(signer);

        let transaction;
        const gameInfo = await getContractInfo(contractAddress, true);
        console.log("gameInfo", gameInfo);

        console.log("ethers.utils.parseUnits(gameInfo.stakeAmount)", ethers.utils.parseUnits(gameInfo.stakeAmount));
        console.log("ethers.BigNumber.from(0)", ethers.BigNumber.from(0));
        console.log(
          "ethers.utils.parseUnits(gameInfo.stakeAmount).gt(ethers.BigNumber.from(0))",
          ethers.utils.parseUnits(gameInfo.stakeAmount).gt(ethers.BigNumber.from(0))
        );

        // if (parseFloat(gameInfo.stakeAmount) > 0) {
        if (ethers.utils.parseUnits(gameInfo.stakeAmount).gt(ethers.BigNumber.from(0))) {
          if (Date.now() / 1000 > gameInfo.lastActionAt + gameInfo.timeout) {
            if (gameInfo.guestMove !== emptyMove.value) {
              transaction = await signedContract.j1Timeout();
            } else {
              transaction = await signedContract.j2Timeout();
            }
            await transaction.wait();
          }
        } else {
          throw new Error("Stake already collected");
        }

        return transaction;
      } catch (error: any) {
        console.error("Error reading contract:", error);
        throw new Error(error?.message || error || "Error reading contract");
      } finally {
        if (!silentFetch) {
          dispatch(hideSpinner());
          setIsLoading(false);
        }
      }
    },
    [defineSpinner, provider, getContractInfo, dispatch]
  );

  const solveGame = useCallback(
    async (contractAddress: string, password?: string, silentFetch = false) => {
      if (!silentFetch) {
        defineSpinner(<div className="spinner-description">Revealing moves ...</div>);
      }

      try {
        if (!silentFetch) {
          dispatch(showSpinner());
          setIsLoading(true);
        }
        const verifiedContractAddress = await verifyBytecode(contractAddress);
        console.log("verifiedContractAddress", verifiedContractAddress);

        const contract = new ethers.Contract(contractAddress, RPSContract.abi, provider);
        console.log("contract", contract);

        // Connect to the user's wallet
        const signer = provider.getSigner();
        const signedContract = contract.connect(signer);

        const move = await safelyGetMove(password);

        if (move?.length) {
          const hostMove = availableMoves.find((m: Move) => {
            return m.value === parseInt(move);
          });
          if (hostMove) {
            dispatch(storeHostMove(hostMove));
          }
        }
        const salt = (await safelyGetSalt(password)) || "";
        console.log("move", move);
        console.log("salt", salt);

        const bufferSalt = Buffer.from(salt, "hex");
        const numberSalt = ethers.BigNumber.from(bufferSalt);
        console.log("numberSalt", numberSalt);

        const transaction = await signedContract.solve(ethers.BigNumber.from(move), numberSalt);
        await transaction.wait();
        return transaction;
      } catch (error: any) {
        console.log("Error reading contract:", error);
        console.log("error?.message reading contract:", error?.message);
        if (error?.message?.includes("OperationError")) {
          throw new Error("Invalid password!");
        }
        throw new Error(error?.message || error || "Error reading contract");
      } finally {
        if (!silentFetch) {
          dispatch(hideSpinner());
          setIsLoading(false);
        }
      }
    },
    [defineSpinner, dispatch, provider, verifyBytecode]
  );

  const submitGuestMove = useCallback(
    async (move: Move, contractAddress: string, silentFetch = false) => {
      if (!silentFetch) {
        defineSpinner(<div className="spinner-description">Submitting move ...</div>);
      }
      try {
        if (!silentFetch) {
          dispatch(showSpinner());
          setIsLoading(true);
        }
        const verifiedContractAddress = await verifyBytecode(contractAddress);
        console.log("verifiedContractAddress", verifiedContractAddress);

        const contract = new ethers.Contract(contractAddress, RPSContract.abi, provider);
        console.log("contract", contract);

        // Connect to the user's wallet
        const signer = provider.getSigner();
        const signedContract = contract.connect(signer);

        const stake = ethers.utils.parseEther(ethers.utils.formatUnits(await contract.stake()));
        const overrides = {
          value: stake,
        };
        console.log("overrides", overrides);
        console.log("ethers.BigNumber.from(move.value)", ethers.BigNumber.from(move.value));

        const transaction = await signedContract.play(ethers.BigNumber.from(move.value), overrides);
        await transaction.wait();
        return transaction;
      } catch (error: any) {
        console.error("Error reading contract:", error);
        throw new Error(error?.message || error || "Error reading contract");
      } finally {
        if (!silentFetch) {
          dispatch(hideSpinner());
          setIsLoading(false);
        }
      }
    },
    [defineSpinner, dispatch, provider, verifyBytecode]
  );

  const hashMove = useCallback(async (move: Move, salt: string) => {
    const amount = ethers.BigNumber.from(move.value);

    console.log(`Buffer.from(salt, "hex")`, Buffer.from(salt, "hex"));

    const numberSalt = ethers.BigNumber.from(Buffer.from(salt, "hex"));
    console.log("numberSalt", numberSalt);
    const byteAmount = ethers.utils.hexZeroPad(amount.toHexString(), 8);
    const paddedSalt = ethers.utils.hexZeroPad(numberSalt.toHexString(), 256);
    console.log("byteAmount", byteAmount);

    const hashedMove = ethers.utils.solidityKeccak256(["uint8", "uint256"], [byteAmount, paddedSalt]);

    return hashedMove;
  }, []);

  const deployContract = useCallback(
    async (move: Move, salt: string, amount: string, guestAddress: string) => {
      try {
        const hashedMove = await hashMove(move, salt);
        console.log("hashedMove", hashedMove);

        // Connect to the user's wallet
        const signer = provider.getSigner();

        // Deploy the contract
        const factory = new ethers.ContractFactory(RPSContract.abi, RPSContract.bytecode, signer);
        console.log("factory", factory);
        const deploymentOverrides = {
          value: ethers.utils.parseEther(amount),
        };

        console.log("hashedMove, userAddress, deploymentOverrides", hashedMove, guestAddress, deploymentOverrides);

        const contract = await factory.deploy(hashedMove, guestAddress, deploymentOverrides);
        console.log("contract", contract);
        await contract.deployed();
        console.log("contract.deployed", contract);

        return contract.address;
      } catch (error: any) {
        console.error("Error deploying contract:", error);
        throw new Error(error?.message || error || "Error deploying contract");
      }
    },
    [hashMove, provider]
  );

  const startDeployment = useCallback(
    async (move: Move, amount: string, guestAddress: string, password?: string, silentFetch = false) => {
      if (!silentFetch) {
        defineSpinner(<div className="spinner-description">Deploying smart contract ...</div>);
      }
      try {
        if (!silentFetch) {
          dispatch(showSpinner());
          setIsLoading(true);
        }
        console.log("startDeployment - password", password);

        const salt = generateSalt(16);
        console.log("salt", salt);

        await safelyStoreSalt(salt, password);
        await safelyStoreMove(move, password);

        const deployedContractAddress = await deployContract(move, salt, amount, guestAddress);
        console.log("deployedContractAddress", deployedContractAddress);

        const verifiedContractAddress = await verifyBytecode(deployedContractAddress);
        console.log("verifiedContractAddress", verifiedContractAddress);

        return deployedContractAddress;
      } catch (err: any) {
        console.error(err);
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
        throw new Error(readableError);
      } finally {
        if (!silentFetch) {
          dispatch(hideSpinner());
          setIsLoading(false);
        }
      }
    },
    [defineSpinner, deployContract, verifyBytecode, dispatch]
  );

  useEffect(() => {
    console.log("Init useContract");
  }, []);

  useEffect(() => {
    console.log("UseContract rerender");
  });

  return {
    isLoading,
    startDeployment,
    solveGame,
    hashMove,
    submitGuestMove,
    getContractInfo,
    timeoutContract,
  };
};

export default useContract;
