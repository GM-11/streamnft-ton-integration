import React from "react";
import { SearchIcon } from "../../Reusables/utility/Icons";

const ExploreSearchBar = ({ value, onChange }) => {
  return (
    // <div className="flex font-numans text-sm items-center justify-center text-[#F1FCF3] grow">
    <div className="relative rounded overflow-hidden flex w-full text-[#F1FCF3]">
      <input
        type="text"
        className="px-4  py-2 w-full focus:outline-none bg-gray-1 !text-[#f1fcf3] placeholder-[#F1FCF3] text-sm"
        placeholder="Search for NFT"
        value={value}
        onChange={onChange}
      />
      <button className="flex items-center justify-center bg-gray-1 text-[#F1FCF3] px-4">
        <SearchIcon size={20} />
      </button>
    </div>
    // </div>
  );
};

export default ExploreSearchBar;
