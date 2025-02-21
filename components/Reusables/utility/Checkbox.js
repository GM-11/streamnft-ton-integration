import React from "react";
import { CheckIcon } from "./Icons";

const Checkbox = ({ checked, onChange, classes, ...props }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${classes}`}>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <span
        className={`w-5 h-5 flex items-center justify-center border-2 rounded ${
          checked
            ? "bg-green-500 border-green"
            : "bg-transparent border-faded-white"
        }`}
      >
        {checked && (
          <div className="h-5 w-5 rounded flex items-center justify-center bg-green">
            <CheckIcon color="#000" size={14} />
          </div>
        )}
      </span>
    </label>
  );
};

export default Checkbox;
