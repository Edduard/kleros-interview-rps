import {FC, ReactNode, createContext, useCallback, useState} from "react";
import Spinner from "./spinner";
import {defaultSpinnerRoot} from "../../utils/redux/spinnerSlice";
import {useSelector} from "react-redux";
import {RootState} from "../../utils/redux/store";

export type SpinnerContentType = ReactNode | string;
export type SpinnersContentsType = {
  [key: string]: SpinnerContentType;
};
export type SpinnerContextType = {
  defineSpinner: (content: SpinnerContentType, rootId?: string | undefined) => void;
  isSpinnerVisible: (rootId?: string) => boolean;
  // spinnersContents: SpinnersContentsType;
};

const defaultSpinnersContents: SpinnersContentsType = {
  [defaultSpinnerRoot]: "Loading ...",
};

export const SpinnerContext = createContext<SpinnerContextType>({
  defineSpinner: (content: SpinnerContentType, rootId?: string | undefined) => {},
  isSpinnerVisible: (rootId?: string) => false,
  // spinnersContents: defaultSpinnersContents,
});

export const SpinnerProvider: FC<{children: any}> = ({children}) => {
  const [spinnersContents, setSpinnersContent] = useState<SpinnersContentsType>(defaultSpinnersContents);
  const spinnerStore = useSelector((state: RootState) => state.spinner);

  const defineSpinner = useCallback(
    (content: any = false, rootId = defaultSpinnerRoot) => {
      if (content && content !== spinnersContents) {
        setSpinnersContent((oldContent: SpinnersContentsType) => {
          return {...oldContent, [rootId]: content};
        });
      }
    },
    [spinnersContents]
  );

  const isSpinnerVisible = useCallback(
    (rootId = defaultSpinnerRoot) => {
      return spinnerStore.isSpinnerVisible[rootId];
    },
    [spinnerStore.isSpinnerVisible]
  );

  return (
    <SpinnerContext.Provider value={{isSpinnerVisible, defineSpinner}}>
      {Object.keys(spinnersContents).map((key: string) => {
        if (isSpinnerVisible(key)) {
          return <Spinner key={"spinner-" + key} content={spinnersContents[key]} rootId={key} />;
        } else return <div key={"spinner-" + key}></div>;
      })}
      {children}
    </SpinnerContext.Provider>
  );
};
