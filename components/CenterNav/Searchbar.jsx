import React from "react";
import { IoIosSearch } from "react-icons/io";

const SearchBar = ({ pagename, changeHandler, state }) => {
  const handleSearchBarClick = () => {
    analytics.track(`dapp_loan_tab_${pagename}_search_${state}`, {
      page: pagename,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchBarClick();
    }
  };

  return (
    <div className="flex font-numans text-sm items-center justify-center text-[#F1FCF3] grow sm:!max-w-64">
      <div className="relative rounded overflow-hidden flex w-full text-[#F1FCF3]">
        <input
          type="text"
          className="px-4  py-2 w-full focus:outline-none bg-[#292929] !text-[#F1FCF3] placeholder-[#F1FCF3]"
          placeholder="Search for collection"
          value={state}
          onChange={(e) => changeHandler(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="flex items-center justify-center bg-[#292929] text-[#F1FCF3] px-4"
          onClick={handleSearchBarClick}
        >
          <IoIosSearch size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
