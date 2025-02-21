import React, { useState } from "react";

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className="cursor-pointer"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute left-1/2 bottom-5 transform -translate-x-1/2 mt-2 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg z-10">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
