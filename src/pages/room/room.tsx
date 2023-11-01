import {useEffect} from "react";
import "./room.scss";
import {useParams} from "react-router-dom";
import useWallet from "../../utils/hooks/useWallet";
import HostRoom from "../../components/host-room/host-room";
import GuestRoom from "../../components/guest-room/guest-room";
import RoomNotFound from "../room-not-found/room-not-found";

const Room = () => {
  const {walletInfo} = useWallet();
  const {hostAddress, contractAddress} = useParams();

  useEffect(() => {
    console.log("R hostAddress", hostAddress);
    console.log("R contractAddress", contractAddress);
  }, [hostAddress, contractAddress]);
  return (
    <>
      {contractAddress && hostAddress ? (
        <>
          {walletInfo.currentAddress.toLowerCase() === hostAddress?.toLowerCase() ? (
            <HostRoom hostAddress={hostAddress} contractAddress={contractAddress} />
          ) : (
            <GuestRoom hostAddress={hostAddress} contractAddress={contractAddress} />
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

export default Room;
