import React from "react";
import { SearchIcon } from "../../Reusables/utility/Icons";

const SearchBar = ({ value, onChange, placeholder, containerClasses }) => {
  return (
    <div
      className={`relative rounded overflow-hidden flex w-full md:max-w-[250px] text-[#F1FCF3] ${containerClasses}`}
    >
      <input
        type="text"
        className="px-4 h-10 w-full focus:outline-none bg-gray-1 !text-[#f1fcf3] placeholder-[#F1FCF3] text-sm"
        placeholder={placeholder ?? "Search for collection"}
        value={value}
        onChange={onChange}
      />
      <button className="flex items-center justify-center bg-gray-1 text-[#F1FCF3] px-4">
        <SearchIcon size={20} />
      </button>
    </div>
  );
};

export default SearchBar;
