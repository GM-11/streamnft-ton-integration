import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

const Toggle = ({ name }) => {
  const [active, setActive] = useState(false);

  const methods = useFormContext();

  useEffect(() => {
    methods.setValue(name, active);
  }, [active, name, methods]);

  return (
    <div
      className={`h-[14px] w-8 rounded-full relative border-2 border-solid p-[1px] cursor-pointer transition-all duration-300 ${
        active ? "border-green" : "border-grey"
      }`}
      onClick={() => setActive(!active)}
    >
      <div
        className={`h-2 w-2 rounded-full absolute transition-all duration-300  ${
          active ? "bg-green right-0.5" : "bg-grey left-0.5"
        }`}
      ></div>
    </div>
  );
};

export default Toggle;
