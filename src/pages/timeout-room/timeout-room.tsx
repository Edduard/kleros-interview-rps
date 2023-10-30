import {useEffect} from "react";
import "./timeout-room.scss";
import {useParams} from "react-router-dom";
import useWallet from "../../utils/hooks/useWallet";
import RoomNotFound from "../room-not-found/room-not-found";
import HostTimeoutRoom from "../../components/host-timeout-room/host-timeout-room";
import GuestTimeoutRoom from "../../components/guest-timeout-room/guest-timeout-room";

const TimeoutRoom = () => {
  const {walletInfo} = useWallet();
  const {hostAddress, contractAddress} = useParams();

  useEffect(() => {
    console.log("TR hostAddress", hostAddress);
    console.log("TR contractAddress", contractAddress);
  }, [hostAddress, contractAddress]);
  return (
    <>
      {contractAddress && hostAddress ? (
        <>
          {walletInfo.currentAddress.toLowerCase() === hostAddress?.toLowerCase() ? (
            <HostTimeoutRoom hostAddress={hostAddress} contractAddress={contractAddress} />
          ) : (
            <GuestTimeoutRoom hostAddress={hostAddress} contractAddress={contractAddress} />
          )}
        </>
      ) : (
        <>
          <RoomNotFound />
        </>
      )}
    </>
  );
};

export default TimeoutRoom;
