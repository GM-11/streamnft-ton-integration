import React, { useMemo, useState } from "react";
import ClickAwayListener from "@/components/Reusables/ClickAwayListener";

const Dropdown = ({
  selected,
  setSelected,
  options,
  placeholder = "Select an option",
  width = "200px",
  onOptionClick = () => {},
  topContainerClasses = "",
  dropdownClasses = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className="relative w-fit">
        <div className="w-fit whitespace-nowrap">
          <button
            type="button"
            className={`flex justify-between items-center p-2 md:text-sm font-medium text-white bg-gray-1 border-2 border-solid border-gray-1 rounded-full focus:outline-none w-[${width}] ${topContainerClasses}`}
            id="options-menu"
            onClick={toggleDropdown}
          >
            <div className="flex gap-2 items-center !text-xs">
              {selected?.image && (
                <img
                  src={selected?.image}
                  className="h-6 w-6 object-contain"
                  alt={selected?.displayText}
                />
              )}
              {selected?.displayText ?? placeholder}
            </div>
            <svg
              className={`w-5 h-5 ml-2 ${isOpen ? "transform rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
        </div>

        {isOpen && (
          <div
            className={`text-sm origin-top-right absolute right-0 mt-2 mx-2 rounded-3xl shadow-lg bg-gray-1 border-2 border-solid border-gray-1 focus:outline-none z-[899] ${dropdownClasses}`}
            style={{
              width,
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <div className="p-2">
              {options?.map((option, index) => (
                <div
                  onClick={() => {
                    setSelected(option);
                    onOptionClick(option);
                    setIsOpen(false);
                  }}
                  key={index}
                >
                  <label className="flex items-center justify-between hover:bg-grayscale-2 rounded-full transition-all duration-150 px-2 py-1 cursor-pointer">
                    <div className="flex gap-4 items-center">
                      {option?.image && (
                        <img
                          src={option?.image}
                          className="h-6 w-6 object-contain"
                          alt={option?.displayText}
                        />
                      )}
                      <span className="text-white text-xs">
                        {option?.displayText}
                      </span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default Dropdown;
