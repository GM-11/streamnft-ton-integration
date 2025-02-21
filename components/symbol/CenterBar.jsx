"use client";
import React, { useState, useContext } from "react";
import Dropdown from "../Reusables/rent/Dropdown/Dropdown";
import HorizontalSelect from "../Reusables/rent/HorizontalSelect";
import SearchBar from "../Reusables/rent/SearchBar/SearchBar";
import FilterBar from "../Reusables/rent/FilterBar/FilterBar";
import MobileScrollHeader from "../Reusables/rent/ScrollHeader/MobileScrollHeader";
import { ReloadIcon } from "../Reusables/rent/Icons";
import { UserNftContext } from "@/context/UserNftContext";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";
import { HederaContext } from "@/context/HederaContext";
import { useRouter } from "next/router";

const CenterBar = ({
  showCenterBar = true,
  cardDatatype,
  setCardDatatype,
  selectBody,
  rightSelect,
  setRightSelect,
  search,
  setSearch,
  loading,
  setLoading,
  collections,
  priceFilterHandler,
  tab,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const router = useRouter();

  return (
    <div className="flex flex-wrap md:flex-nowrap md:items-center items-start justify-start md:justify-between w-full px-4 md:px-12 gap-2 mt-[1.2rem]">
      {/* <div className="grow max-w-[33%] flex-row items-center justify-start hidden md:flex ">
        <FilterBar
          placeholder="Search Here ..."
          state={search}
          changeHandler={setSearch}
        />
        <SearchBar
          placeholder="Search for NFT"
          state={search}
          section="rent-details"
          changeHandler={(search) => {
            setSearch(search);
            analytics.track(
              `dapp_rent_${collections[0]?.name}_${tab}_${search}`
            );
          }}
          isCollection="false"
          tab={tab}
        />
      </div> */}
      <div className="w-fit items-center justify-center flex">
        {showCenterBar && (
          <HorizontalSelect
            body={selectBody}
            state={cardDatatype}
            changeHandler={(item) => {
              setCardDatatype(item);
              analytics.track(
                `dapp_rent_${collections[0]?.name}_${tab}_${item}`
              );
              if (item === "Available") {
                analytics.track(
                  `dapp_rent_${collections[0]?.name}_mkt_available`
                );
              } else if (item === "Rented") {
                analytics.track(`dapp_rent_${collections[0]?.name}_mkt_rented`);
              } else return;
            }}
          />
        )}
      </div>
      <div className="hidden md:flex grow max-w-[33%] justify-end items-center">
        {cardDatatype !== "Owned" && (
          <Dropdown
            body={[
              "Price: Low to High",
              "Price: High to Low",
              ...(router.pathname.includes("mart")
                ? []
                : ["Duration: Low to High", "Duration: High to Low"]),
            ]}
            state={rightSelect}
            changeHandler={(rightSelect) => {
              setRightSelect(rightSelect);
              analytics.track(
                `dapp_rent_${collections[0]?.name}_${tab}_sort_${rightSelect}`
              );
            }}
            height={"60px"}
            width={"200px"}
            onSelect={priceFilterHandler}
          />
        )}

        <button
          className="h-12 w-12 rounded-md ml-4 relative bg-gray-1 flex items-center justify-center"
          onClick={async () => {
            if (!loading) {
              setLoading(true);
              await reloadNftCacheCall();
              setLoading(false);
              toast.dismiss();
              toast.success("Nft's updated successfully");
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <ReloadIcon size={21} color="#fff" />
          <div
            className={`z-[10000] rounded px-2 transition-all duration-300 absolute top-[110%] right-0 py-1 text-xs text-white bg-[#1f7634] mt-1 min-w-48 max-w-48 !  ${
              showTooltip ? "block" : "hidden"
            }`}
          >
            Click here, To reload your NFT Data
          </div>
        </button>
      </div>

      {/* Mobile center bar */}
      <MobileScrollHeader
        setRightSelect={setRightSelect}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
};

export default CenterBar;
