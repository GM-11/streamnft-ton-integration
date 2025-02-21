"use client";
import React, { useState, useEffect, useContext } from "react";
import { utilityContext } from "@/context/UtilityContext";
import { SearchBar } from "@/components/Utility";
import ChainFilter from "@/components/Reusables/utility/ChainFilter";
import ManageFrame from "@/components/Reusables/utility/manage/ManageFrame";
import Selector from "@/components/Reusables/utility/manage/table/Selector";
import { SpaceContext } from "@/context/SpaceContext";
import { IoMdAdd } from "react-icons/io";
import Button from "@/components/Reusables/utility/Button";
import { useRouter } from "next/router";

const Manage = () => {
  const [selectedTabOption, setSelectedTabOption] = useState("live");
  const [selectedChain, setSelectedChain] = useState();
  const [searchString, setSearchString] = useState("");
  const [selectedButton, setSelectedButton] = useState("space");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { spaces, showSpaceForm, setShowSpaceForm } = useContext(SpaceContext);

  const {
    setUserUtilityData,
    fetchUserUtilityData,
    userUtilityData,
    selectedRewardType,
    initialUserUtilityData,
  } = useContext(utilityContext);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserUtilityData();
      setLoading(false);
    };

    setShowSpaceForm(false);
    loadData();
  }, []);

  useEffect(() => {
    if (
      searchString?.length <= 0 &&
      selectedRewardType?.length <= 0 &&
      selectedChain?.chain_id?.length < 0
    ) {
      fetchUserUtilityData();
    } else {
      let filteredByStatus = initialUserUtilityData;
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

      setUserUtilityData(filteredByChainId);
    }
  }, [
    selectedTabOption,
    initialUserUtilityData,
    searchString,
    selectedRewardType,
    selectedChain,
  ]);

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName.toLowerCase());
  };

  const manage_data = {
    utility: userUtilityData,
    quest: userUtilityData?.filter((el) => el?.utilityTag === "quest"),
    space: spaces,
  };

  return (
    <div className="font-numans p-12 mt-8">
      {!showSpaceForm && (
        <div className="flex flex-row items-center justify-between">
          {selectedButton !== "space" ? (
            <SearchBar
              value={searchString}
              onChange={(e) => setSearchString(e?.target?.value)}
              placeholder="Search for utility by name"
              containerClasses={"!max-w-[300px]"}
            />
          ) : (
            <div></div>
          )}
          <div className="flex flex-row items-center justify-between w-full gap-4 md:w-fit md:justify-center mt:2 md:mt-0">
            {/* {selectedButton === "utility" && (
              <>
                <ChainFilter
                  setSelectedChain={setSelectedChain}
                  selectedChain={selectedChain}
                />
              </>
            )} */}

            <div>
              <Button
                type="button"
                onClick={() => {
                  selectedButton === "space"
                    ? setShowSpaceForm(true)
                    : router.push("/utility/create");
                }}
                className="p-2 text-xs flex items-center justify-center text-white bg-green-4 rounded-md "
              >
                Create {selectedButton}
                <IoMdAdd />
              </Button>
            </div>

            <Selector
              selectedButton={selectedButton}
              handleButtonClick={handleButtonClick}
            />
          </div>
        </div>
      )}
      <div className="table-section text-green p-8 font-numans">
        <ManageFrame
          data={manage_data}
          selectedButton={selectedButton}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Manage;
