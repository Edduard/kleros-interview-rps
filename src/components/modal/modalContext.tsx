import {createContext} from "react";
import useModal from "./useModal";
import Modal from "./modal";

let ModalContext: any;
let {Provider} = (ModalContext = createContext<any>(""));

const ModalProvider = ({children}: any) => {
  let {modal, handleModal, modalContent} = useModal();
  return (
    <Provider value={{modal, handleModal, modalContent}}>
      <Modal />
      {children}
    </Provider>
  );
};

export {ModalContext, ModalProvider};
