import React, { useContext, useEffect, useMemo, useState } from "react";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";
import Image from "next/image";
import { utilityContext } from "@/context/UtilityContext";
import ClickAwayListener from "@/components/Reusables/ClickAwayListener";

const UtilityDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedRewardType, setSelectedRewardType } =
    useContext(utilityContext);

  const { rewardsOptionsData } = useContext(CreateUtilityContext);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    if (option === "View All") {
      setSelectedRewardType(
        selectedRewardType.length === option.length ? [] : option
      );
    } else {
      const updatedOptions = selectedRewardType.includes(option)
        ? selectedRewardType.filter((selected) => selected !== option)
        : [...selectedRewardType, option];

      setSelectedRewardType(updatedOptions);
    }
  };

  const isOptionSelected = (option) => {
    return selectedRewardType.includes(option);
  };

  const displayText = "Rewards Type";

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className="relative w-fit">
        <div className="font-numans w-fit whitespace-nowrap">
          <button
            type="button"
            className="flex justify-between items-center w-full p-2 text-2xs md:text-sm font-medium text-[#F1FCF3] bg-gray-1 rounded focus:outline-none"
            id="options-menu"
            onClick={toggleDropdown}
          >
            {displayText}
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
            className=" font-numans text-sm origin-top-right absolute right-0 mt-2 mx-2 w-[240px] rounded-md shadow-lg bg-[#1C1C1C]   focus:outline-none z-[899]"
            style={{ boxShadow: "0px 4px 0px 0px #026200" }}
          >
            <div className="p-2">
              {rewardsOptionsData.map((option, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <hr className="my-1 mx-4 border-[#092A13]/[.25] w-5/6" />
                  )}
                  <label className="flex items-center justify-between px-2 py-1 cursor-pointer">
                    <div className="flex gap-1 items-center">
                      <Image
                        src={option?.image_url}
                        height={24}
                        width={24}
                        className="h-6 w-6 object-contain"
                        alt="#"
                      />
                      <span className="text-faded-white text-xs">
                        {option?.title}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isOptionSelected(option?.title)}
                      onChange={() => handleOptionSelect(option?.title)}
                      className=" h-3 w-3 mr-2 !accent-[#269741]"
                    />
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default UtilityDropdown;
