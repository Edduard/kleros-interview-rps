import React, {useState, useEffect} from "react";

const Countdown = ({
  onCountdownEnd = (index: number) => {},
  totalTime = -1,
}: {
  onCountdownEnd: (...args: any) => any;
  totalTime?: number;
}) => {
  const [count, setCount] = useState(totalTime);

  useEffect(() => {
    setCount(totalTime);
  }, [totalTime]);

  useEffect(() => {
    if (count !== -1) {
      // -1 is the default value
      if (count > 0) {
        // Only start the countdown if the count is greater than 0
        const timerId = setInterval(() => {
          setCount((prevCount) => prevCount - 1);
        }, 1000);

        // Clear the interval when the component is unmounted or when the countdown reaches 0
        return () => clearInterval(timerId);
      } else {
        console.log("onCountdownEnd11", onCountdownEnd);
        onCountdownEnd();
      }
    }
  }, [count, onCountdownEnd]);

  return (
    <div>
      {count > 0 ? (
        <div className="d-flex">
          <div className="blue-container">
            {`${String(Math.floor(count / 60)).padStart(2, "0")}:${String(Math.floor(count % 60)).padStart(2, "0")}`}
          </div>
          {` minutes left`}
        </div>
      ) : (
        <p>failed to respond in time</p>
      )}
    </div>
  );
};

export default Countdown;
