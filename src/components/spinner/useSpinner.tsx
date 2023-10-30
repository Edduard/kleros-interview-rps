import {useCallback, useState} from "react";

const useSpinner = () => {
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
  const [spinnerContent, setSpinnerContent] = useState("Loading ...");
  const [spinnerRootId, setSpinnerRootId] = useState("spinner-root");

  const handleSpinner = useCallback(
    (content: any = false, rootId = spinnerRootId) => {
      // setIsSpinnerVisible(!isSpinnerVisible);
      if (content) {
        setSpinnerContent(content);
      }
      setSpinnerRootId(rootId);

      return setIsSpinnerVisible;
    },
    [spinnerRootId]
  );

  return {isSpinnerVisible, handleSpinner, spinnerContent, spinnerRootId};
};

export default useSpinner;
