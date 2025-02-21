import React, { useContext, useEffect, useMemo, useState } from "react";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";
import Image from "next/image";
import { utilityContext } from "@/context/UtilityContext";

const ExploreCategoryFilter = ({ selectedOptions, setSelectedOptions }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { rewardsOptionsData } = useContext(CreateUtilityContext);

  const { setUtilityData, fetchData, utilityData, initialUtilityData } =
    useContext(utilityContext);

  const rewardsOptions = useMemo(() => {
    return (
      rewardsOptionsData?.map((el) => {
        return {
          image: el?.image_url,
          value: el?.title,
          description: el?.description,
        };
      }) ?? []
    );
  }, [rewardsOptionsData]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    if (option === "View All") {
      setSelectedOptions(
        selectedOptions.length === option.length ? [] : option
      );
    } else {
      const updatedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((selected) => selected !== option)
        : [...selectedOptions, option];

      setSelectedOptions(updatedOptions);
    }
  };

  const isOptionSelected = (option) => {
    return selectedOptions.includes(option);
  };

  const displayText = "Benefit Type";

  return (
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
          className=" font-numans text-sm origin-top-right absolute right-0 mt-2 mx-2 sm:w-[180px] md:w-[200px] lg:w-[248px] rounded-md shadow-lg bg-[#1C1C1C]   focus:outline-none z-[899]"
          style={{ boxShadow: "0px 4px 0px 0px #026200" }}
        >
          <div className="p-2">
            {rewardsOptions.map((option, index) => (
              <React.Fragment key={option}>
                <label className="flex items-center justify-between  cursor-pointer mb-2 bg-[#2929293D] p-1.5 rounded-md">
                  <div className="flex gap-2">
                    <Image
                      src={option?.image}
                      height={64}
                      width={64}
                      className="h-4 w-4"
                      alt="#"
                    />
                    <span className="text-faded-white">{option?.value}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isOptionSelected(option?.value)}
                    onChange={() => handleOptionSelect(option?.value)}
                    className=" h-3 w-3 mr-2 !accent-[#269741]"
                  />
                </label>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreCategoryFilter;
