import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState, useContext } from "react";
import { IoSearch } from "react-icons/io5";
import { ChainContext } from "@/context/ChainContext";

const SearchBar = ({
  placeholder,
  state,
  changeHandler,
  onSearch,
  isCollection,
  tab,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { collections } = useContext(ChainContext);

  const inputRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const { symbol } = router.query;

  useEffect(() => {
    if (isExpanded) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setIsExpanded(false);
      if (symbol && isCollection === "true") {
        onSearch(pathname, state);
      }
    }
  };

  return (
    <div className="relative flex flex-row items-center pr-2">
      <input
        ref={inputRef}
        className={`h-12 ${
          isExpanded ? "px-4  w-48" : "px-0 w-0"
        } text-white rounded-l focus:outline-none transition-all duration-50`}
        style={{ backgroundColor: "#292929", outline: "none" }}
        type="text"
        placeholder={placeholder}
        value={state}
        onChange={(e) => {
          changeHandler(e.target.value);

          analytics.track(`dapp_rent_${collections[0]?.name}_${tab}_${state}`);
        }}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        onKeyDown={handleKeyPress}
      />

      <button
        className={`h-12 w-12 focus:outline-none hover:bg-gray-2 transition-all duration-50 ${
          isExpanded ? "rounded-r" : "rounded"
        }`}
        style={{ backgroundColor: "#292929", outline: "none" }}
        onClick={() => {
          setIsExpanded((prevValue) => !prevValue);
        }}
      >
        <IoSearch
          className="h-6 w-6 text-center mx-auto text-white"
          onClick={() => {
            //analytics.track(`dapp_rent_${collections[0]?.name}_${tab}_search_collection`);
          }}
        />
      </button>
    </div>
  );
};

export default SearchBar;
