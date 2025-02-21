import React from "react";

const ProgressBar = ({ value, color = "green" }) => {
  return (
    <div className="w-full h-full bg-[#8d8d8d] rounded-3xl">
      <div
        style={{ width: value }}
        className={`rounded-3xl h-full ${color === "green" ? "bg-green" : "bg-white"}`}
      ></div>
    </div>
  );
};

export default ProgressBar;
