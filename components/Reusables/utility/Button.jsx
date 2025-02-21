import React, { useState } from "react";

const Button = ({
  children,
  variant,
  onClick,
  buttonClasses,
  shadowColor,
  type = "button",
  disableWithoutEffect,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const boxShadow =
    isPressed || props.disabled
      ? "none"
      : variant === "outlined"
      ? `4px 4px 0px 0px #525252`
      : `4px 4px 0px 0px ${shadowColor ?? "#0A7128"}`;

  const buttonClass = `
    flex h-10 p-3 md:p-4 justify-center items-center gap-1 mr-2 md:mr-0 rounded-md 
    bg-green-4 shadow-lg text-white text-sm transition-all duration-200 ease-in-out transform disabled:bg-grayscale-7 relative group
    ${isPressed ? "scale-95" : "scale-100"} 
    ${
      variant === "outlined"
        ? "border-grayscale bg-transparent border-solid border"
        : ""
    }
    ${buttonClasses}
  `;

  const handleMouseDown = () => {
    !disableWithoutEffect && setIsPressed(true);
  };

  const handleMouseUp = () => {
    !disableWithoutEffect && setIsPressed(false);
  };

  const handleMouseLeave = () => {
    !disableWithoutEffect && setIsPressed(false);
  };

  return (
    <button
      type={type} // Use the passed type prop
      className={buttonClass}
      style={{ boxShadow }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
