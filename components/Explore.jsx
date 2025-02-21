import React, { useContext, useEffect, useMemo, useState } from "react";
import { SearchBar } from "./Utility";
import CardGrid from "./Reusables/utility/CardGrid/CardGrid";
import { utilityContext } from "@/context/UtilityContext";
import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";
import { ReloadIcon } from "./Reusables/rent/Icons";
import { toast } from "react-toastify";
import ChainFilter from "./Reusables/utility/ChainFilter";
import Loader from "./Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";
import walletIcon from "../public/images/Wallet.svg";
import { useSigner } from "@/context/SignerContext";
import Button from "./Reusables/utility/Button";
import Image from "next/image";

const Explore = () => {
  const [searchString, setSearchString] = useState("");

  const [loading, setLoading] = useState(false);

  const [showTooltip, setShowTooltip] = useState(false);

  const [selectedTab, setSelectedTab] = useState("user");

  const [nftCardsData, setNftCardsData] = useState([]);

  const { isTokenValid } = useUserWalletContext();

  const { signer } = useSigner();

  const { chainDetail } = useContext(ChainContext);

  const {
    userNftCollectionData,
    allNftCollectionData,
    fetchUserNftCollectionData,
    fetchAllNftCollectionData,
    reloadNftCacheCall,
    updateExploreData,
    exploreSelectedChain,
    setExploreSelectedChain,
    checkToken,
  } = useContext(utilityContext);

  const { isConnected, address } = useUserWalletContext();

  const { isTokenSet } = useUserWalletContext();

  useEffect(() => {
    if (isConnected && userNftCollectionData?.length > 0 && isTokenSet) {
      setSelectedTab("user");
    } else {
      setSelectedTab("all");
    }
  }, [isConnected, userNftCollectionData, isTokenSet]);

  useEffect(() => {
    selectedTab === "all"
      ? setNftCardsData(allNftCollectionData)
      : setNftCardsData(userNftCollectionData);
  }, [allNftCollectionData, userNftCollectionData, selectedTab]);

  useEffect(() => {
    const handleSearchFilter = () => {
      let filteredData = [];

      if (!searchString || searchString.trim().length === 0) {
        if (selectedTab === "all") {
          filteredData = allNftCollectionData;
        } else {
          filteredData = userNftCollectionData;
        }
      } else {
        const collectionToSearch =
          selectedTab === "all" ? allNftCollectionData : userNftCollectionData;

        filteredData = collectionToSearch?.filter((el) =>
          el?.collection_name
            ?.toLowerCase()
            .includes(searchString.toLowerCase())
        );
      }

      setNftCardsData(filteredData);
    };

    handleSearchFilter();
  }, [
    searchString,
    isConnected,
    address,
    chainDetail,
    updateExploreData,
    isTokenValid,
    selectedTab,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (exploreSelectedChain?.chain_id?.length > 0) {
        setLoading(true);
        if (address?.length > 0 && isTokenSet) {
          await fetchUserNftCollectionData();
        }
        await fetchAllNftCollectionData();
        setLoading(false);
      }
    };

    fetchData();
  }, [exploreSelectedChain, address, isTokenSet]);

  return (
    <div className="px-2 md:px-8 lg:px-20 pt-16 h-fit min-h-[calc(100vh-300px)] lg:min-h-[calc(100vh-230px)]">
      <h5 className="w-full text-center text-base my-4">
        Discover 100+ tangible rewards available for NFTs
      </h5>
      <div className="md:my-5 flex flex-row flex-wrap gap-4 md:gap-0 items-center justify-between text-[#F1FCF3]">
        <div className="flex items-center gap-4 flex-col md:flex-row w-full md:w-fit">
          <div className="flex flex-row w-full items-center gap-4 border-2 border-solid border-green rounded-md p-0.5">
            <button
              className={`px-4 py-2 rounded transition-all duration-300 font-numans text-sm whitespace-nowrap grow ${
                selectedTab === "user" ? "bg-green-4" : "bg-transparent"
              }`}
              onClick={() => setSelectedTab("user")}
            >
              My NFTs
            </button>
            <button
              className={`px-4 py-2 rounded transition-all duration-300 font-numans text-sm whitespace-nowrap grow ${
                selectedTab === "all" ? "bg-green-4" : "bg-transparent"
              }`}
              onClick={() => setSelectedTab("all")}
            >
              All NFTs
            </button>
          </div>
          <SearchBar
            value={searchString}
            onChange={(e) => {
              setSearchString(e?.target?.value);
            }}
          />
        </div>

        <div className="flex flex-row items-center justify-between w-full md:w-fit md:justify-center gap-3 mt:2 md:mt-0">
          <ChainFilter
            selectedChain={exploreSelectedChain}
            setSelectedChain={setExploreSelectedChain}
          />

          {isConnected && (
            <button
              className="h-10 w-12 rounded-sm relative bg-gray-1 flex items-center justify-center"
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
                className={`z-[10000] rounded px-2 transition-all duration-300 absolute top-[110%] right-0 py-1 text-xs text-white bg-[#1f7634] mt-1 min-w-48 max-w-48 !font-numans ${
                  showTooltip ? "opacity-100" : "opacity-0"
                }`}
              >
                Click here, To reload your NFT Data
              </div>
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : selectedTab === "all" ? (
        <>
          {nftCardsData?.length <= 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
              <p className="text-[#F1FCF3] text-lg">
                No collections available at the moment
              </p>
            </div>
          ) : (
            <CardGrid data={nftCardsData} for="exploreUtility" />
          )}
        </>
      ) : selectedTab === "user" ? (
        <>
          {isConnected ? (
            !isTokenSet ? (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
                <p className="text-white text-lg mb-8">
                  Please sign in to view your collections
                </p>
                <Button
                  buttonClasses="flex items-center gap-2 px-6 py-2  rounded-full text-white bg-green-4 font-semibold"
                  onClick={async () => {
                    if (signer) {
                      localStorage.removeItem("token");
                      await checkToken();
                    }
                  }}
                >
                  <Image src={walletIcon} alt="wallet logo" />
                  Sign In
                </Button>
              </div>
            ) : (
              <>
                {nftCardsData?.length <= 0 ? (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
                    <p className="text-white text-lg">
                      No collections found for the connected wallet
                    </p>
                  </div>
                ) : (
                  <CardGrid data={nftCardsData} for="exploreUtility" />
                )}
              </>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
              <p className="text-[#F1FCF3] text-lg">
                Connect your wallet to view your NFTs
              </p>
            </div>
          )}
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Explore;
