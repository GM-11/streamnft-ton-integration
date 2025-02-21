import React from "react";
import { SearchIcon } from "./utility/Icons";

const SearchBar = ({
  value,
  onChange,
  placeholder,
  containerClasses,
  inputClasses,
}) => {
  return (
    <div
      className={`relative overflow-hidden flex w-full border-2 border-solid border-gray-1 rounded-full md:max-w-[250px] text-white ${containerClasses}`}
    >
      <button className="flex items-center justify-center bg-gray-1 text-white pl-4">
        <SearchIcon size={20} />
      </button>
      <input
        type="text"
        className={`px-4 h-10 w-full focus:outline-none bg-gray-1 !text-white placeholder:text-white text-sm ${inputClasses}`}
        placeholder={placeholder ?? "Search for collection"}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
