import React, { useState } from "react";
import GradientBorder from "../GradientBorder";
import { AiOutlineClose, AiOutlineRight } from "react-icons/ai";

const Filter = () => {
  const [openFilter, setOpenFilter] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState("");

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleClick = (title) => {
    if (selectedFilter.length > 0 && selectedFilter === title) {
      setSelectedFilter("");
    } else {
      setSelectedFilter(title);
    }
  };

  const isOptionPresent = (option) => {
    return selectedOptions.some((item) => item.value === option.value);
  };

  const optionClickHandler = (option) => {
    setSelectedFilter("");

    let filteredOptions = [];

    if (isOptionPresent(option)) {
      filteredOptions = selectedOptions.filter(
        (item) => item.value !== option.value
      );
    } else {
      filteredOptions = [...selectedOptions, option];
    }

    setSelectedOptions(filteredOptions);
  };

  const filterData = [
    {
      title: "Filter one",
      options: [
        { id: 1, label: "Option One", value: "filter-1-1" },
        { id: 2, label: "Option Two", value: "filter-1-2" },
        { id: 3, label: "Option Three", value: "filter-1-3" },
      ],
    },
    {
      title: "Filter two",
      options: [
        { id: 4, label: "Option One", value: "filter-2-1" },
        { id: 5, label: "Option Two", value: "filter-2-2" },
        { id: 6, label: "Option Three", value: "filter-2-3" },
      ],
    },
    {
      title: "Filter three",
      options: [
        { id: 7, label: "Option One", value: "filter-3-1" },
        { id: 8, label: "Option Two", value: "filter-3-2" },
        { id: 9, label: "Option Three", value: "filter-3-3" },
      ],
    },
  ];

  return (
    <div className="relative">
      <GradientBorder>
        <div
          className="text-white p-4 whitespace-nowrap flex items-center gap-4"
          onClick={() => setOpenFilter(!openFilter)}
        >
          <h1>Select Filter</h1>
          {selectedOptions.length > 0 && (
            <div
              className="rounded-md p-1 border border-solid border-white flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOptions([]);
              }}
            >
              <AiOutlineClose />
              <p className="text-sm text-white ">{selectedOptions?.length}</p>
            </div>
          )}
        </div>
      </GradientBorder>
      <GradientBorder
        outerContainerClassnames={`${
          openFilter ? "!max-h-[500px] " : "!max-h-0 !py-0"
        } !overflow-hidden transition-all duration-200 absolute top-16 z-10`}
        innerContainerClassnames=""
      >
        <div className="p-4 text-white">
          {filterData.map((item, index) => (
            <div key={index}>
              <div
                className="flex items-center cursor-pointer my-2"
                onClick={() => handleClick(item.title)}
              >
                <AiOutlineRight
                  className={`transition-all duration-200 mr-2 ${
                    selectedFilter === item.title ? "rotate-90" : "rotate-0"
                  }`}
                />
                <h5>{item.title}</h5>
              </div>
              <div
                className={`overflow-hidden my-2 h-fit origin-top transition-all duration-200 px-4 whitespace-nowrap ${
                  selectedFilter === item.title ? "max-h-[150px]" : "max-h-0"
                }`}
              >
                {item.options.map((option, index) => (
                  <h5
                    className={`my-2 p-2 rounded-lg cursor-pointer hover:bg-gray-600 ${
                      isOptionPresent(option) ? "bg-gray-400" : "bg-transparent"
                    }`}
                    key={index}
                    onClick={() => optionClickHandler(option)}
                  >
                    {option.label}
                  </h5>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GradientBorder>
    </div>
  );
};

export default Filter;
