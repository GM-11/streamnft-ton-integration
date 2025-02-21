import React, { useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import useDebounce from "@/hooks/useDebounce";
import SellModal from "@/components/Reusables/mart/modals/SellModal";
import FilterComponent from "@/components/symbol/DiscoverFilter";
import CardsSection from "@/components/symbol/CardsSection";
import Header from "@/components/symbol/Header";
import {
  filterArray,
  searchArray,
  sortarrayAsc,
  sortarrayDes,
} from "@/utils/common";
import { Mixpanel } from "@/utils/mixpanel";
import { HederaContext } from "@/context/HederaContext";
import { UserNftContext } from "@/context/UserNftContext";
import { ModalContext } from "@/context/ModalContext";
import { getUserSoldNftsData, myassetmart } from "@/utils/assetInfo";
import { ChainContext } from "@/context/ChainContext";
import DiscoverCenterBar from "@/components/symbol/DiscoverCenterBar";
import { useUserWalletContext } from "@/context/UserWalletContext";

const lend = () => {
  const { modalType } = useContext(ModalContext);
  const [lend, setLend] = useState([]);
  const [filter, setFilter] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [cardDatatype, setCardDatatype] = useState("Owned");
  const [selectedTabOption, setSelectedTabOption] = useState("My Assets");
  const [rightSelect, setRightSelect] = useState("Filter By Type");
  const [search, setSearch] = useState("");
  const [leftSelect, setLeftSelect] = useState("Duration");
  const [dataItem, setDataItem] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const { userNfts, usersNftsByCollection, isNftsLoaded } =
    useContext(UserNftContext);
  const { isConnected, address } = useUserWalletContext();
  const { isPaired, accountId } = useContext(HederaContext);
  const {
    selectedChain,
    chainDetail,
    collections,
    collectionId,
    userTransacted,
    tokenData,
  } = useContext(ChainContext);
  const debouncedSearch = useDebounce(search, 300);

  const [userNftState, setUserNftState] = useState(userNfts);

  const userNftToCheck = useMemo(
    () => JSON.stringify(userNftState),
    [userNftState]
  );

  const sort = (val) => {
    let list = {};
    if (filter.length !== 0) {
      if (val === "Price: Low to High") {
        const listed = sortarrayAsc(filter?.listed, "p");
        const rented = sortarrayAsc(filter?.rented, "p");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      } else if (val === "Price: High to Low") {
        const listed = sortarrayDes(filter?.listed, "p");
        const rented = sortarrayDes(filter?.rented, "p");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      } else if (val === "Duration: Low to High") {
        const listed = sortarrayAsc(filter?.listed, "d");
        const rented = sortarrayAsc(filter?.rented, "d");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      } else if (val === "Duration: High to Low") {
        const listed = sortarrayDes(filter?.listed, "d");
        const rented = sortarrayDes(filter?.rented, "d");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      }
      setFilter(list);
    }
  };

  const searchName = (val) => {
    let list = {};
    if (lend.length !== 0 && val.length > 0) {
      const owned = searchArray(val, lend?.owned ?? []);
      const listed = searchArray(val, lend?.listed ?? []);
      const rented = searchArray(val, lend?.rented ?? []);
      list = { owned, listed, rented };
      setFilter(list);
    }
    if (lend.length !== 0 && val.length === 0) {
      setFilter({ ...lend });
    }
  };

  const filterList = (val) => {
    if (lend.length !== 0 && val === "Change") {
      const listed = filterArray(val, lend.listed);
      const rented = filterArray(val, lend.rented);
      const owned = filterArray(val, lend.owned.concat(lend.loanAssets));
      setFilter({ owned, listed, rented });
    }
  };

  useEffect(() => {
    if (cardDatatype === "Owned") {
      //
      setCardsData(filter?.owned || []);
      Mixpanel.track("home_rentmkt_collection_lend_owned");
    } else if (cardDatatype === "Listed") {
      setCardsData(filter?.listed || []);
      Mixpanel.track("home_rentmkt_collection_lend_listed");
    } else if (cardDatatype === "Rented") {
      setCardsData(filter?.rented || []);
      Mixpanel.track("home_rentmkt_collection_lend_rented");
    } else return;
  }, [lend, filter, cardDatatype]);

  useEffect(() => {
    sort(rightSelect);
    Mixpanel.track("home_rentmkt_collection_lend_sort");
  }, [lend, rightSelect]);

  useEffect(() => {
    searchName(debouncedSearch);
    Mixpanel.track("home_rentmkt_collection_lend_search");
  }, [lend, debouncedSearch]);

  useEffect(() => {
    filterList(leftSelect);
    Mixpanel.track("home_rentmkt_collection_lend_filter");
  }, [lend, leftSelect]);

  async function getLendingData() {
    if (!collections) {
      setLoading(true);
      return;
    }
    if (!isConnected && !isPaired) {
      setLoading(false);
      setMsg("Connect your wallet to start lending");
      return;
    }
    setLoading(true);
    const symbol = router.query.symbol?.replace(/-/g, " ");
    const chainId = chainDetail?.chain_id;
    const userAddress = getUserAddress();
    if (!userAddress) {
      setLoading(false);
      setMsg("Connect your wallet to start lending");
      return;
    }
    const formattedName = (str) => str.toLowerCase().replace(/[\s-]+/g, "");

    const matchingCollection = collections.find(
      (collection) => formattedName(collection.name) === formattedName(symbol)
    );

    const collectionId = matchingCollection
      ? matchingCollection.token_address
      : null;

    const selectedCollectionNfts = usersNftsByCollection;

    const lendingData = await myassetmart(
      chainId,
      userAddress,
      selectedCollectionNfts,
      collectionId,
      chainDetail,
      matchingCollection?.ERC1155,
      address
    );

    // const soldNftData = await getUserSoldNftsData(
    //   chainId,
    //   collectionId,
    //   address
    // );

    if (isEmptyLendingData(lendingData)) {
      setMsg("You don’t own any NFT");
      setLoading(false);
    } else {
      setMsg("");
    }
    setFilter(lendingData);
    setLend(lendingData);
    // const owned = lendingData.owned.concat(lendingData.loanAssets);

    setLoading(false);
  }

  function getUserAddress() {
    switch (selectedChain) {
      case "Hedera testnet":
        return accountId;
      default:
        return address;
    }
  }

  function isEmptyLendingData(lendingData) {
    return !lendingData.owned.length && !lendingData.listed.length;
  }

  useEffect(() => {
    if (chainDetail?.chain_id && collections && collectionId) {
      getLendingData();
    }
  }, [
    isPaired,
    isConnected,
    userTransacted,
    chainDetail,
    collectionId,
    collections,
    isNftsLoaded,
    usersNftsByCollection,
  ]);

  var tab = "my_assets";

  return (
    <>
      <div className="min-h-screen">
        <Header userTransacted={userTransacted} />
        <DiscoverCenterBar
          selectBody={["My Assets", "Marketplace"]}
          rightSelect={rightSelect}
          setRightSelect={setRightSelect}
          search={search}
          setSearch={setSearch}
          tab={tab}
          cardDatatype={selectedTabOption}
          setLoading={setLoading}
          loading={loading}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          setCardDatatype={setSelectedTabOption}
          customChangeHandler={() => {
            const newPath = router?.asPath.replace(
              /\/myassets$/,
              "/marketplace"
            );
            router.push(newPath);
          }}
        />

        <div className="px-8 w-full flex justify-between">
          <FilterComponent
            cardDatatype={cardDatatype}
            setCardDatatype={setCardDatatype}
            rightSelect={rightSelect}
            setRightSelect={setRightSelect}
            search={search}
            setSearch={setSearch}
            leftSelect={leftSelect}
            setLeftSelect={setLeftSelect}
            tab={tab}
            collections={collections}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            setLoading={setLoading}
          />
          <CardsSection
            setDataItem={setDataItem}
            cardsData={cardsData}
            cardDatatype={cardDatatype}
            msg={msg}
            loading={loading}
            tab={tab}
            tokenData={tokenData}
          />
        </div>
        {modalType.toLowerCase() === "sell" ? (
          <SellModal cardsData={dataItem} />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default lend;
