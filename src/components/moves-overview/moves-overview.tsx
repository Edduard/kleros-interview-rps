import React, {useCallback} from "react";
import "./moves-overview.scss";
import {Move, emptyMove, undisclosedMove} from "../../utils/constants/constants";

const aBeatsB = (a: number, b: number) => {
  if (a % 2 === b % 2) return a < b;
  else return a > b;
};

const MovesOverview = React.memo(
  ({
    myMove,
    opponentMove,
    stakeAmount,
    userTimedOut = false,
    opponentTimedOut = false,
  }: {
    myMove: Move;
    opponentMove: Move;
    stakeAmount: string;
    userTimedOut?: boolean;
    opponentTimedOut?: boolean;
  }) => {
    const getWinningStatus = useCallback(() => {
      console.log("myMove", myMove);
      console.log("opponentMove", opponentMove);

      switch (true) {
        case userTimedOut === true: {
          return "userTimedOut";
        }

        case opponentTimedOut === true: {
          return "opponentTimedOut";
        }

        case opponentMove.value === undisclosedMove.value || opponentMove.value === emptyMove.value: {
          return "undisclosed";
        }

        case myMove.value === opponentMove.value: {
          return "tie";
        }

        case aBeatsB(myMove.value, opponentMove.value): {
          return "winner";
        }

        case !aBeatsB(myMove.value, opponentMove.value): {
          return "loser";
        }

        default: {
          return "undisclosed";
        }
      }
    }, [myMove, opponentMove, opponentTimedOut, userTimedOut]);

    return (
      <>
        {parseFloat(stakeAmount) !== 0 ? (
          <h1 className="w-100 text-center mt-0 mb-0">{stakeAmount} ETH at stake</h1>
        ) : (
          <h3 className="w-100 text-center mt-0 mb-0">
            <h3 className="mt-0">Check your ETH balance in Metamask</h3>
          </h3>
        )}
        <div className="moves-overview-container">
          <div className={`moves-container ${getWinningStatus()}`}>
            <div className="move-item-container">
              <h3>You</h3>
              <div className={`move-item host`}>
                <img src={myMove.imageSrc} alt={myMove.name} className="" />
              </div>
            </div>
            <div className="versus">VS</div>
            <div className="move-item-container">
              <h3>Your opponent</h3>
              <div className={`move-item guest`}>
                <img src={opponentMove.imageSrc} alt={opponentMove.name} className="" />
              </div>
            </div>
          </div>
        </div>

        {(() => {
          switch (getWinningStatus()) {
            case "winner": {
              return (
                <div className="w-100 text-center">
                  <h1>Winner !</h1>
                  <h2 className="w-100 text-center mt-0 mb-0">You win {stakeAmount} ETH !</h2>
                  <p>Funds will arrive in your wallet soon</p>
                </div>
              );
            }
            case "loser": {
              return (
                <div className="w-100 text-center">
                  <h1>You lost !</h1>
                  <h2 className="w-100 text-center mt-0 mb-0">You lost your stake !</h2>
                  <p>Better luck next time!</p>
                </div>
              );
            }
            case "tie": {
              return (
                <div className="w-100 text-center">
                  <h1>Tied !</h1>
                  <h2 className="w-100 text-center mt-0 mb-0">You get your stake back !</h2>
                  <p>Funds will arrive in your wallet soon</p>
                </div>
              );
            }
            case "userTimedOut": {
              return (
                <div className="w-100 text-center">
                  <h1>You timed out !</h1>
                  <h2 className="w-100 text-center mt-0 mb-0">You lost your stake !</h2>
                  <p>Be on time next time!</p>
                </div>
              );
            }
            case "opponentTimedOut": {
              return (
                <div className="w-100 text-center">
                  <h1>Your opponent timed out !</h1>
                  <h2 className="w-100 text-center mt-0 mb-0">You win the stake !</h2>
                  <p>Funds will arrive in your wallet soon</p>
                </div>
              );
            }

            default: {
              return <></>;
            }
          }
        })()}
      </>
    );
  }
);

export default MovesOverview;
