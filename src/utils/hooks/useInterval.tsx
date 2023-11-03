import {useCallback, useEffect, useRef} from "react";

const defaultIntervalInstance = null;
const defaultIntervalCallback = null;
const defaultIntervalTime = 0;

const useInterval = () => {
  const intervalInstance = useRef<any>(defaultIntervalInstance);
  const intervalCallback = useRef<any>(defaultIntervalCallback);
  const intervalTime = useRef<number>(defaultIntervalTime);

  const defineInterval = useCallback((callback: (args?: any) => any, ms: number) => {
    intervalCallback.current = callback;
    intervalTime.current = ms;

    if (intervalInstance.current) {
      clearInterval(intervalInstance.current);
    }
    // intervalInstance.current = setInterval(() => {
    //   callback();
    // }, intervalTime.current);
  }, []);

  const startInterval = useCallback((ms?: number) => {
    if (intervalInstance.current) {
      clearInterval(intervalInstance.current);
    }
    intervalInstance.current = setInterval(() => {
      if (intervalCallback.current) {
        intervalCallback.current();
      }
    }, ms || intervalTime.current);
  }, []);

  const pauseInterval = useCallback(() => {
    if (intervalInstance.current) {
      clearInterval(intervalInstance.current);
    }
  }, []);

  const resumeInterval = useCallback((ms?: number) => {
    intervalInstance.current = setInterval(() => {
      if (intervalCallback.current) {
        intervalCallback.current();
      }
    }, ms || intervalTime.current);
  }, []);

  const stopInterval = useCallback(() => {
    console.log("stopInterval");
    console.log("intervalInstance.current", intervalInstance.current);
    console.log("intervalCallback.current", intervalCallback.current);
    console.log("intervalTime.current", intervalTime.current);
    if (intervalInstance.current) {
      clearInterval(intervalInstance.current);

      intervalInstance.current = defaultIntervalInstance;
      intervalCallback.current = defaultIntervalCallback;
      intervalTime.current = defaultIntervalTime;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, [intervalInstance, stopInterval]);

  return {defineInterval, startInterval, pauseInterval, resumeInterval, stopInterval};
};

export default useInterval;
