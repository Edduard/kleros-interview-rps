import React, {FC, useContext} from "react";
import ReactDOM from "react-dom";
import {SpinnerContext} from "./spinnerContext";
import spinnerSvg from "./../../assets/kleros-logo-shape.svg";

const Spinner: FC<any> = () => {
  const context: any = useContext(SpinnerContext);

  if (context?.isSpinnerVisible) {
    return ReactDOM.createPortal(
      <>
        <div className={`spinner-backdrop`}></div>
        <div className="spinner-container">
          <img alt="" src={spinnerSvg} className="spinner" />
          <div className="mt-2 text-center">{context?.spinnerContent}</div>
        </div>
      </>,
      document.getElementById(context?.spinnerRootId)!
    );
  } else return null;
};

export default Spinner;
