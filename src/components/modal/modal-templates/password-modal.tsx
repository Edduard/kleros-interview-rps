import {FC, useContext, useEffect, useState} from "react";
import {ModalContext} from "../modalContext";
import ActionButton from "../../action-button/action-button";
import {useForm} from "react-hook-form";

export enum passwordModalTypes {
  setPassword,
  getPassword,
}

const PasswordModal: FC<{
  type: passwordModalTypes;
  children: any;
  title: any;
  className?: string;
  onSuccess?: (args?: any) => void;
  onDismiss?: () => void;
}> = ({type, children, title, className = "", onDismiss = () => {}, onSuccess = () => {}}) => {
  const {handleModal} = useContext<any>(ModalContext);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalHidden, setIsModalHidden] = useState(true);
  const {
    register,
    handleSubmit,
    formState: {errors},
    setValue,
    setError,
    reset,
  } = useForm({mode: "onBlur"});

  const handleDismiss = () => {
    setButtonsDisabled(true);
    setIsModalOpen(false);
    setTimeout(() => {
      onDismiss();
      setButtonsDisabled(false);
      return handleModal();
    }, 300);
  };

  const handleSuccess = (args?: any) => {
    setButtonsDisabled(true);
    console.log("args", args);

    if (args && args.password !== args.repeatedPassword && type === passwordModalTypes.setPassword) {
      setError("repeatedPassword", {type: "custom", message: "Passwords don't match"});
      setButtonsDisabled(false);
    } else {
      reset();
      setTimeout(() => {
        onSuccess(args?.password);
        setButtonsDisabled(false);
        return handleModal();
      }, 300);
    }
  };

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (isModalOpen) setIsModalHidden(false);
  }, [isModalOpen]);

  return (
    <>
      <div className="modal-backdrop" onClick={handleDismiss}></div>
      <div
        className={`modal-content-container ${
          isModalHidden ? "hidden-modal" : isModalOpen ? "opened-modal" : "closed-modal"
        } ${className}`}>
        <div className={`modal-header d-flex justify-content-center p-2 header`}>
          <div className="text-bold">{title}</div>
          <div onClick={() => handleDismiss()} className="close-icon" tabIndex={0}></div>
        </div>

        <div className="modal-content">
          <div className="">{children}</div>

          <div>
            <form onSubmit={handleSubmit(handleSuccess)} className="form-container">
              <label className="" htmlFor="password">
                <input
                  className={`custom-input ${errors?.password ? "input-with-error" : ""}`}
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register("password", {validate: (value) => value?.length > 8})}
                  onChange={(e) => {
                    setValue("password", e.target.value, {shouldValidate: true});
                  }}></input>
                <div className={`${errors?.password ? "custom-input-text-error" : "invisible"}`}>
                  <div className="">{`Password is required`}</div>
                </div>
              </label>

              {type === passwordModalTypes.setPassword ? (
                <label className="" htmlFor="repeatedPassword">
                  <input
                    className={`custom-input ${errors?.repeatedPassword ? "input-with-error" : ""}`}
                    id="repeatedPassword"
                    type="password"
                    placeholder="Repeat password"
                    {...register("repeatedPassword", {validate: (value) => value?.length > 8})}
                    onChange={(e) => {
                      setValue("repeatedPassword", e.target.value, {shouldValidate: true});
                    }}></input>
                  <div className={`${errors?.repeatedPassword ? "custom-input-text-error" : "invisible"}`}>
                    <div className="">{`${
                      errors?.repeatedPassword?.message ? errors?.repeatedPassword?.message : "Password is required"
                    }`}</div>
                  </div>
                </label>
              ) : (
                <></>
              )}

              <div className="modal-action-area">
                {type === passwordModalTypes.setPassword ? (
                  <div className="d-flex gap-2 w-100">
                    <ActionButton
                      className={`button-outline-secondary ${buttonsDisabled ? "disabled" : ""}`}
                      content="Submit without password"
                      buttonType="reset"
                      onClick={() => handleSuccess()}></ActionButton>
                    <ActionButton
                      className={`button-secondary ${buttonsDisabled ? "disabled" : ""}`}
                      content="Safely submit your move"
                      buttonType="submit"></ActionButton>
                  </div>
                ) : (
                  <div className="d-flex gap-2 w-100">
                    <ActionButton
                      className={`w-100 button-outline-secondary ${buttonsDisabled ? "disabled" : ""}`}
                      content="I didn't use a password"
                      buttonType="reset"
                      onClick={() => handleSuccess()}></ActionButton>
                    <ActionButton
                      className={`w-100 button-secondary ${buttonsDisabled ? "disabled" : ""}`}
                      content="Reveal moves"
                      buttonType="submit"></ActionButton>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordModal;
