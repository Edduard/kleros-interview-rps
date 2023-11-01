import {FC} from "react";
import ReactDOM from "react-dom";
import {SpinnerContentType} from "./spinnerContext";
import spinnerSvg from "./../../assets/kleros-logo-shape.svg";

const Spinner: FC<any> = ({content, rootId}: {content: SpinnerContentType; rootId: string}) => {
  const spinnerParent = document.getElementById(rootId);
  console.log("content, rootId", content, rootId);

  if (content && spinnerParent !== null) {
    return ReactDOM.createPortal(
      <>
        <div className={`spinner-backdrop`}></div>
        <div className="spinner-container">
          <img alt="" src={spinnerSvg} className="spinner" />
          <div className="mt-2 text-center">{content}</div>
        </div>
      </>,
      spinnerParent
    );
  } else return null;
};

export default Spinner;
