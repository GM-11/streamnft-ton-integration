import React, { useContext, useMemo, useState } from "react";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import ClickAwayListener from "@/components/Reusables/ClickAwayListener";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";

const ChainFilter = ({ selectedChain, setSelectedChain }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { chainDetails } = useContext(ChainContext);
  const { chainId: currentChainId } = useAccount();
  const router = useRouter();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const displayText = useMemo(() => {
    return selectedChain?.chain_name ?? "Filter by chain";
  }, [selectedChain]);

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className="relative w-fit">
        <div className="font-numans w-fit whitespace-nowrap">
          <button
            type="button"
            className="flex justify-between items-center w-[200px] p-2 text-2xs md:text-sm font-medium text-[#F1FCF3] bg-gray-1 rounded focus:outline-none"
            id="options-menu"
            onClick={toggleDropdown}
          >
            <div className="flex gap-2 items-center">
              {selectedChain?.chain_image_url?.length > 0 && (
                <img
                  src={selectedChain?.chain_image_url}
                  className="h-6 w-6 object-contain"
                  alt="#"
                />
              )}
              {displayText}
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
            className="font-numans text-sm origin-top-right absolute right-0 mt-2 mx-2 rounded-md shadow-lg bg-[#1C1C1C] focus:outline-none z-[899]"
            style={{
              width: "200px", // Ensure width matches the button
              maxHeight: "300px", // Set a fixed max height
              overflowY: "auto", // Enable vertical scrolling
              boxShadow: "0px 4px 0px 0px #026200",
            }}
          >
            <div className="p-2">
              {chainDetails &&
                chainDetails.map((option, index) => (
                  <div
                    onClick={async () => {
                      setSelectedChain(option);
                      if (router.asPath?.includes("explore")) {
                        localStorage.setItem(
                          "exploreSelectedChainId",
                          option?.chain_id
                        );
                      }
                      if (
                        option?.evm &&
                        Number(currentChainId) !== Number(option?.chain_id)
                      ) {
                      }
                      setIsOpen(false);
                    }}
                    key={index}
                  >
                    {index > 0 && (
                      <hr className="my-1 mx-4 border-[#092A13]/[.25] w-5/6" />
                    )}
                    <label className="flex items-center justify-between px-2 py-1 cursor-pointer">
                      <div className="flex gap-4 items-center">
                        <img
                          src={option?.chain_image_url}
                          className="h-6 w-6 object-contain"
                          alt="#"
                        />
                        <span className="text-faded-white text-xs">
                          {option?.chain_name}
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

export default ChainFilter;
