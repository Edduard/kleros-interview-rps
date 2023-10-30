import React, {FC} from "react";
import "./action-button.scss";

const ActionButton: FC<{
  className?: string;
  onClick?: (args?: any) => any;
  content?: string;
  buttonType?: "button" | "submit" | "reset" | undefined;
}> = ({className = "", onClick = (args?: any) => {}, content = "Go", buttonType}) => {
  return (
    <button className={`action-button ${className}`} onClick={onClick} tabIndex={0} type={buttonType}>
      {content}
    </button>
  );
};

export default ActionButton;
