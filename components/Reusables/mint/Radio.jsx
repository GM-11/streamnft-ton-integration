import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

const Radio = ({ name, value, customBorder, customSelectBg }) => {
  const methods = useFormContext();

  const currValue = useWatch({ name, control: methods.control });

  return (
    <div>
      <div
        className={`w-5 h-5 rounded-full border-2 border-solid flex items-center justify-center cursor-pointer ${
          currValue === value ? customBorder ?? "border-white" : "border-green"
        }`}
        onClick={() => methods.setValue(name, value)}
      >
        <div
          className={`w-[10px] h-[10px] rounded-full  transition-all duration-250 ${
            currValue === value ? "scale-1" : "scale-0"
          } ${customSelectBg ?? "bg-white"}`}
        ></div>
      </div>
    </div>
  );
};

export default Radio;
