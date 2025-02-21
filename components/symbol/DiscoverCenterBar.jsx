import React, { useContext, useEffect, useMemo, useState } from "react";
import HorizontalSelect from "../Reusables/rent/HorizontalSelect";
import { useRouter } from "next/router";
import FilterIcon from "../../public/images/filterIcon.png";
import Image from "next/image";
import { UserNftContext } from "@/context/UserNftContext";
import { toast } from "react-toastify";
import { ReloadIcon } from "../Reusables/rent/Icons";
import Dropdown from "../Reusables/Dropdown";
import SearchBar from "../Reusables/SearchBar";

const DiscoverCenterBar = ({
  selectBody,
  rightSelect,
  setRightSelect,
  search,
  setSearch,
  tab,
  cardDatatype,
  setLoading,
  loading,
  isFilterOpen,
  setIsFilterOpen,
  setCardDatatype,
  customChangeHandler,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { reloadNftCacheCall } = useContext(UserNftContext);

  const router = useRouter();

  const isUserOnCoursePage = useMemo(() => {
    return router?.asPath?.includes("courses");
  }, [router]);

  return (
    <>
      {tab !== "rentals" && selectBody?.length > 0 && (
        <div className="h-fit w-full flex items-center justify-start px-12 border-b-2 border-solid border-grayscale-30">
          <HorizontalSelect
            body={selectBody}
            state={cardDatatype}
            changeHandler={setCardDatatype}
            customChangeHandler={customChangeHandler}
          />
        </div>
      )}
      <div className="flex items-center justify-between px-12 py-4">
        {tab === "rentals" ? (
          <div className="h-[1px] w-[1px]"></div>
        ) : (
          <div
            className="text-lg font-semibold text-black bg-grayscale-30 p-2 rounded-lg cursor-pointer flex gap-2 items-center"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Image
              src={FilterIcon}
              alt="filter-icon"
              height={128}
              width={128}
              className="min-h-6 max-h-6 min-w-6 max-w-6 object-contain"
            />
          </div>
        )}
        <div className="flex gap-4 items-center">
          <SearchBar
            value={search}
            onChange={(e) => {
              setSearch(e?.target?.value);
            }}
            placeholder={
              isUserOnCoursePage
                ? "Search courses by name"
                : "Search for tokens"
            }
            containerClasses={"!border-grayscale-30 !rounded-lg"}
            inputClasses={"!text-xs placeholder:!text-xs"}
          />
          {tab !== "my_assets_rent" && (
            <div className="relative w-[200px]">
              <Dropdown
                options={[
                  { displayText: "Price: Low to High" },
                  { displayText: "Price: High to Low" },
                  ...(router.pathname.includes("discover")
                    ? []
                    : [
                        { displayText: "Duration: Low to High" },
                        { displayText: "Duration: High to Low" },
                      ]),
                ]}
                selected={rightSelect}
                setSelected={setRightSelect}
                height={"60px"}
                width={"200px"}
                topContainerClasses="!rounded-lg !py-[10px]"
                dropdownClasses="!rounded-lg"
              />
            </div>
          )}
          {tab !== "mkt" && !isUserOnCoursePage && (
            <div
              className="text-lg font-semibold text-black bg-grayscale-30 border-2 border-solid border-grayscale-30 p-2 rounded-lg cursor-pointer flex gap-2 items-center relative"
              onClick={async () => {
                if (!loading) {
                  setLoading(true);
                  await reloadNftCacheCall();
                  setLoading(false);
                  toast.dismiss();
                  toast.info("Nft's updated successfully");
                }
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <ReloadIcon size={24} color="#fff" />
              <div
                className={`z-[10000] rounded px-2 transition-all duration-300 absolute top-[110%] right-0 py-1 text-xs bg-grayscale-30 text-jet-black border-2 border-solid border-grayscale-30 mt-1 min-w-48 max-w-48 ! ${
                  showTooltip ? "block" : "hidden"
                }`}
              >
                Click here, To reload your NFT Data
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DiscoverCenterBar;
