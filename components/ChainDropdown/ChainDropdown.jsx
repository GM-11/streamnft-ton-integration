"use client";
import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import { switchChain } from "@wagmi/core";
import { ChainContext } from "@/context/ChainContext";
import * as chains from "@wagmi/core/chains";
import * as localChains from "@/constants/chain";
import { useRouter } from "next/router";
import Image from "next/image";
import { wagmiConfig } from "@/config/wagmiConfig";

const ChainDropdown = ({ changeHandler }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { chainDetails, selectedChain } = useContext(ChainContext);
  const btnRef = useRef();
  const router = useRouter();

  // Memoizing all chains to avoid recalculating on every render
  const availableChains = useMemo(() => {
    return {
      chainsArray: Object.values(chains),
      localChainsArray: Object.values(localChains),
    };
  }, []);

  // Function to add a chain to MetaMask
  const addChainToMetaMask = async (chainId) => {
    const { chainsArray, localChainsArray } = availableChains;

    const chain =
      chainsArray.find((chain) => chain.id === Number(chainId)) ??
      localChainsArray.find((chain) => chain.id === Number(chainId));

    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chain.id.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls?.default?.http],
            },
          ],
        });
      } catch (error) {
        console.error(`Failed to add ${chain.name} to MetaMask`, error);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const filteredChain = useMemo(() => {
    return chainDetails;
  }, [chainDetails]);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.body.addEventListener("click", closeDropdown);
    return () => {
      document.body.removeEventListener("click", closeDropdown);
    };
  }, []);

  const hedera_rent = "https://hedera-rent.streamnft.tech";
  const hedera_loan = "https://hedera-loan.streamnft.tech";
  const hederaSwitch = () => {
    if (router.pathname.includes("rent")) {
      window.open(hedera_rent, "_blank");
    } else if (router.pathname.includes("loan")) {
      window.open(hedera_loan, "_blank");
    }
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="font-numans relative text-left">
      <div className="mr-2">
        <button
          type="button"
          className="flex justify-center items-center w-full px-1 py-[9px] text-xs font-semibold md:text-sm md:font-medium bg-green-1 border border-green-2 rounded-md focus:outline-none gap-1"
          style={{ boxShadow: "4px 4px 0px 0px #0A7128" }}
          id="options-menu"
          onClick={toggleDropdown}
          ref={btnRef}
        >
          {filteredChain &&
            filteredChain.map((chain, index) => {
              if (
                String(chain.chain_name).toLowerCase() ===
                String(selectedChain).toLowerCase()
              ) {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2  font-semibold text-sm"
                  >
                    <Image
                      src={chain.chain_image_url}
                      alt={`${chain.chain_name} logo`}
                      height={20}
                      width={20}
                    />
                    <p className="whitespace-nowrap text-nowrap !text-green-2">
                      {chain?.chain_name}
                    </p>
                  </div>
                );
              }
            })}
          <svg
            className={`w-5 h-5 ml-2 -mr-1 ${
              isOpen ? "transform rotate-180" : ""
            }`}
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
        <div className="origin-top-right max-h-[350px] overflow-y-auto absolute right-0 mt-2 rounded-md shadow-lg bg-green-1 ring-1 ring-black ring-opacity-5 focus:outline-none border border-green-3">
          <div className="py-1">
            {filteredChain.map((chain, index) => {
              return (
                <button
                  key={index}
                  onClick={async () => {
                    localStorage.setItem(
                      "selectedChain",
                      chain.chain_name.toLowerCase(),
                    );
                    if (chain.evm) {
                      try {
                        const response = await switchChain(wagmiConfig, {
                          chainId: Number(chain.chain_id),
                        });
                        if (response?.name) {
                          changeHandler(chain.chain_name.toLowerCase());
                          setIsOpen(false);
                        }
                      } catch (error) {
                        console.error(error);
                        addChainToMetaMask(chain.chain_id)?.then(async () => {
                          await switchChain(wagmiConfig, {
                            chainId: Number(chain.chain_id),
                          });
                          changeHandler(chain.chain_name);
                        });
                      }
                    } else {
                      if (
                        chain.chain_id === "295" ||
                        chain.chain_id === "296"
                      ) {
                        hederaSwitch();
                        setIsOpen(false);
                        return;
                      }
                      changeHandler(chain.chain_name);
                      setIsOpen(false);
                    }
                  }}
                  className="px-4 py-2 text-xs min-w-48 whitespace-nowrap font-semibold text-green-2 md:text-sm md:font-medium items-center hover:bg-gray-100 hover:text-gray-900 flex flex-row w-full gap-2"
                >
                  <img
                    src={chain.chain_image_url}
                    alt={`${chain.chain_name} logo`}
                    height={20}
                    width={20}
                  />
                  {chain.chain_name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainDropdown;
