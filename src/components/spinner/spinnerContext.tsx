import React, {FC, SetStateAction} from "react";
import useSpinner from "./useSpinner";
import Spinner from "./spinner";

type Dispatch<A> = (value: A) => void;

const SpinnerContext = React.createContext({
  spinnerContent: "",
  handleSpinner: (content: any | undefined, rootId?: string | undefined) => {
    return "" as unknown as Dispatch<SetStateAction<boolean>>;
  },
  isSpinnerVisible: false,
  spinnerRootId: "spinner-root",
});

const SpinnerProvider: FC<{children: any}> = ({children}) => {
  const {isSpinnerVisible, handleSpinner, spinnerContent, spinnerRootId} = useSpinner();
  return (
    <SpinnerContext.Provider value={{isSpinnerVisible, handleSpinner, spinnerContent, spinnerRootId}}>
      <Spinner />
      {children}
    </SpinnerContext.Provider>
  );
};

export {SpinnerContext, SpinnerProvider};
