import React, { useContext, useEffect, useState } from "react";
import { SearchBar, UtilityDropdown } from "@/components/Utility";
import { utilityContext } from "@/context/UtilityContext";
import CardGrid from "@/components/Reusables/utility/CardGrid/CardGrid";
import ChainFilter from "@/components/Reusables/utility/ChainFilter";
import Loader from "@/components/Reusables/loan/Loader";

const index = () => {
  const [selectedTabOption, setSelectedTabOption] = useState("live");
  const [selectedChain, setSelectedChain] = useState();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("rewards");

  const {
    setUtilityData,
    utilityData,
    initialUtilityData,
    selectedRewardType,
    fetchData,
  } = useContext(utilityContext);

  const [searchString, setSearchString] = useState("");

  const isUtilityLive = (date) => {
    const dateToCheck = new Date(date);

    const now = new Date();

    return dateToCheck > now;
  };

  useEffect(() => {
    const fn = async () => {
      await fetchData();
      setLoading(false);
    };

    fn();
  }, []);

  useEffect(() => {
    const fn = async () => {
      if (
        searchString?.length <= 0 &&
        selectedRewardType?.length <= 0 &&
        selectedChain?.chain_id?.length < 0
      ) {
        setLoading(true);
        await fetchData();
        setLoading(false);
      } else {
        let filteredByStatus = initialUtilityData?.filter((el) =>
          selectedTabOption === "live"
            ? isUtilityLive(el?.endDate)
            : !isUtilityLive(el?.endDate)
        );

        let filteredByName = filteredByStatus;

        if (searchString?.length > 0) {
          filteredByName = filteredByStatus.filter((item) =>
            item.title.toLowerCase().includes(searchString.toLowerCase())
          );
        }

        let filteredByRewardType = filteredByName;

        if (selectedRewardType?.length > 0) {
          filteredByRewardType = filteredByName.filter((item) =>
            selectedRewardType?.includes(item?.utilityType)
          );
        }

        let filteredByChainId = filteredByRewardType;

        if (selectedChain?.chain_id?.length > 0) {
          filteredByChainId = filteredByRewardType.filter(
            (item) => Number(item?.chainId) === Number(selectedChain?.chain_id)
          );
        }

        let filteredByTab = filteredByChainId;

        if (selectedTab === "quest") {
          filteredByTab = filteredByChainId.filter(
            (item) => item.utilityTag === "quest"
          );
        } else if (selectedTab === "rewards") {
          filteredByTab = filteredByChainId.filter(
            (item) => item.utilityTag !== "quest"
          );
        }

        setUtilityData(filteredByTab);
      }
    };

    fn();
  }, [
    selectedTabOption,
    initialUtilityData,
    searchString,
    selectedRewardType,
    selectedChain,
    selectedTab,
  ]);

  return (
    <div className="px-2 md:px-8 lg:px-20 grow w-full pt-24">
      <div className="flex flex-row flex-wrap items-center gap-4 justify-between text-[#F1FCF3]">
        <div className="flex items-center flex-row gap-4">
          <div className="flex flex-row items-center gap-4 border-2 border-solid border-green rounded-md p-0.5">
            <button
              className={`px-4 py-2 rounded transition-all duration-300 font-numans text-xs ${
                selectedTab === "quest" ? "bg-green-4" : "bg-transparent"
              }`}
              onClick={() => setSelectedTab("quest")}
            >
              Quests
            </button>

            <button
              className={`px-4 py-2 rounded transition-all duration-300 font-numans text-xs ${
                selectedTab === "rewards" ? "bg-green-4" : "bg-transparent"
              }`}
              onClick={() => setSelectedTab("rewards")}
            >
              Rewards
            </button>
          </div>
          <SearchBar
            value={searchString}
            onChange={(e) => setSearchString(e?.target?.value)}
          />
        </div>

        <div className="flex flex-row items-center justify-between w-full gap-4 md:w-fit md:justify-center mt:2 md:mt-0">
          <UtilityDropdown />
          <ChainFilter
            setSelectedChain={setSelectedChain}
            selectedChain={selectedChain}
          />
          <div className="flex justify-between items-center p-2 text-2xs md:text-sm font-medium text-[#F1FCF3] bg-gray-1 rounded focus:outline-none">
            <div
              className={`w-16 h-full flex items-center justify-center cursor-pointer text-[13px] transition-all duration-300 rounded-md ${
                selectedTabOption === "live" ? "bg-green-4" : ""
              }`}
              onClick={() => {
                setSelectedTabOption("live");
              }}
            >
              Live
            </div>
            <div
              className={`w-16 h-full flex items-center justify-center cursor-pointer text-[13px] transition-all duration-300 rounded-md ${
                selectedTabOption === "ended" ? "bg-green-4" : ""
              }`}
              onClick={() => {
                setSelectedTabOption("ended");
              }}
            >
              Ended
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader customMessage={"Loading rewards ..."} />
      ) : utilityData?.length <= 0 ? (
        <div className="h-96 w-full flex text-white items-center justify-center">
          No Rewards found, Please create one
        </div>
      ) : (
        <CardGrid for="allUtility" />
      )}
    </div>
  );
};

export default index;
