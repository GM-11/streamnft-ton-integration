import React, { useState } from "react";
import FilterIcon from "../../public/images/filter.png";
import Image from "next/image";
import { AiOutlineClose } from "react-icons/ai";

const FilterComponent = ({ isFilterOpen, setIsFilterOpen }) => {
  // Controls the visibility of the filter panel
  const [openDropdown, setOpenDropdown] = useState({}); // Controls individual dropdowns

  // Toggle the filter menu
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Toggle individual dropdowns
  const toggleDropdown = (section) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      {isFilterOpen && (
        <div
          className={`mt-8 border p-4 relative border-grayscale-11 rounded-2xl bg-grayscale-11 shadow-md px-2 ${
            isFilterOpen ? "w-72" : "w-16"
          }`}
        >
          <div className="p-2 flex items-center justify-between w-full my-2">
            <h4
              className="text-lg font-semibold text-smoke flex gap-2 items-center"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
              }}
            >
              <Image
                src={FilterIcon}
                alt="filter-icon"
                height={128}
                width={128}
                className="min-h-6 max-h-6 min-w-6 max-w-6 object-contain invert"
              />
              {isFilterOpen && "Filter"}
            </h4>
            {isFilterOpen && (
              <div
                className="h-fit w-fit p-1 border border-solid border-smoke rounded-full cursor-pointer"
                onClick={() => setIsFilterOpen(false)}
              >
                <AiOutlineClose size={10} color="#fff" />
              </div>
            )}
          </div>
          {isFilterOpen &&
            [
              "Status",
              "Price",
              "Sub Category",
              "Traits",
              "Format",
              "Language",
              "Category",
            ].map((section) => (
              <div className="mb-4" key={section}>
                {/* Section Header */}
                <div
                  onClick={() => toggleDropdown(section)}
                  className="flex justify-between items-center px-4 py-2 text-sm font-medium text-smoke bg-transparent border-b border-jet-black rounded-lg cursor-pointer "
                >
                  <span>{section}</span>
                  <span>{openDropdown[section] ? "▲" : "▼"}</span>
                </div>

                {/* Dropdown Content */}
                {openDropdown[section] && (
                  <div className="mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {/* Replace this with actual filter options */}
                      Options for {section}...
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
};

export default FilterComponent;
