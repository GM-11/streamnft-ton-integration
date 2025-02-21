// components/ProgressBar.js
import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1 bg-grey relative mt-3 mb-16">
      <div
        className="bg-green h-full rounded-full text-right"
        style={{ width: `${progress}%` }}
      ></div>
      <div
        className={`absolute -top-1.5 left-1/3 transform -translate-x-1/2 h-full flex items-center flex-col text-sm ${
          progress > 33 ? "text-green" : "text-white"
        }`}
      >
        <div
          className={`min-h-[16px] w-1 border-r-2 ${
            progress > 33 ? "border-green" : "border-grey"
          }`}
        ></div>
        <h5>5 Days</h5>
        <p className="text-xs text-grey">(25% Bonus)</p>
      </div>
      <div
        className={`absolute -top-1.5 left-2/3 transform -translate-x-1/2 h-full flex items-center flex-col text-sm ${
          progress > 66 ? "text-green" : "text-white"
        }`}
      >
        <div
          className={`min-h-[16px] w-1 border-r-2 ${
            progress > 66 ? "border-green" : "border-grey"
          }`}
        ></div>
        <h5>10 Days</h5>
        <p className="text-xs text-grey">(50% Bonus)</p>
      </div>
      <div
        className={`absolute -top-1.5 right-0 h-full flex items-end flex-col text-sm ${
          progress >= 100 ? "text-green" : "text-white"
        }`}
      >
        <div
          className={`min-h-[16px] w-1 border-r-2 ${
            progress >= 100 ? "border-green" : "border-grey"
          }`}
        ></div>
        <h5 className="whitespace-nowrap">15 Days</h5>
        <p className="text-xs text-grey whitespace-nowrap">(100% Bonus)</p>
      </div>
    </div>
  );
};

export default ProgressBar;
