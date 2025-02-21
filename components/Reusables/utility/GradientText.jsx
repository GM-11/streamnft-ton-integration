import React from "react";

const GradientText = ({ classNames, children }) => {
  return (
    <h5
      className={`bg-gradient-to-tr text-transparent bg-clip-text from-[#00BB34] to-[#AFFF7E] ${classNames}`}
    >
      {children}
    </h5>
  );
};

export default GradientText;
