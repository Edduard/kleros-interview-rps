import {useContext} from "react";
import ReactDOM from "react-dom";
import {ModalContext} from "./modalContext";

const Modal = () => {
  let {modalContent, modal} = useContext<any>(ModalContext);
  if (modal) {
    return ReactDOM.createPortal(
      <>
        <div className="modal-wrapper">{modalContent}</div>
      </>,
      document.querySelector("#modal-container-root") || new DocumentFragment()
    );
  } else return null;
};

export default Modal;
