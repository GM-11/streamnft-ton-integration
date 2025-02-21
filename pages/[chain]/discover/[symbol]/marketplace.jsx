import React, { useState, useEffect, useContext } from "react";
import Header from "@/components/symbol/Header";
import CardsSection from "@/components/symbol/CardsSection";
import CenterBar from "@/components/symbol/CenterBar";
import { useRouter } from "next/router";
import { Mixpanel } from "@/utils/mixpanel";
import { useAccount } from "wagmi";
import { getMarketplaceData } from "@/utils/assetInfo";
import { HederaContext } from "@/context/HederaContext";
import useDebounce from "@/hooks/useDebounce";
import { ModalContext } from "@/context/ModalContext";
import BuyModal from "@/components/Reusables/mart/modals/BuyModal";
import {
  filterArray,
  searchArray,
  sortarrayAsc,
  sortarrayDes,
} from "@/utils/common";
import { ChainContext } from "@/context/ChainContext";
import FilterComponent from "@/components/symbol/DiscoverFilter";
import DiscoverCenterBar from "@/components/symbol/DiscoverCenterBar";
import { useUserWalletContext } from "@/context/UserWalletContext";

const rent = () => {
  const { modalType, setModalType } = useContext(ModalContext);
  const [nftData, setNftData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [cardDatatype, setCardDatatype] = useState("Available");
  const [selectedTabOption, setSelectedTabOption] = useState("Marketplace");
  const [rightSelect, setRightSelect] = useState("Filter By Type");
  const [search, setSearch] = useState("");
  const [leftSelect, setLeftSelect] = useState("Duration");
  const [dataItem, setDataItem] = useState([]);
  const [msg, setMsg] = useState("");
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const { address } = useUserWalletContext();
  const {
    selectedChain,
    chainDetail,
    collections,
    userTransacted,
    setUserTransacted,
    tokenData,
  } = useContext(ChainContext);
  const { accountId, nftSignal } = useContext(HederaContext);
  const debouncedSearch = useDebounce(search, 300);

  const sort = (val) => {
    let list = [];
    if (nftData.length !== 0) {
      if (val === "Price: Low to High") {
        const listed = sortarrayAsc(filter?.available, "p", "mart");
        const rented = sortarrayAsc(filter?.rented, "p", "mart");
        list = { available: listed, rented: rented };
      } else if (val === "Price: High to Low") {
        const listed = sortarrayDes(filter?.available, "p", "mart");
        const rented = sortarrayDes(filter?.rented, "p", "mart");
        list = { available: listed, rented: rented };
      } else if (val === "Duration: Low to High") {
        const listed = sortarrayAsc(filter?.available, "d");
        const rented = sortarrayAsc(filter?.rented, "d");
        list = { available: listed, rented: rented };
      } else if (val === "Duration: High to Low") {
        const listed = sortarrayDes(filter?.available, "d");
        const rented = sortarrayDes(filter?.rented, "d");
        list = { available: listed, rented: rented };
      }
      setFilter(list);
    }
  };

  const searchName = (val) => {
    let list = [];
    if (nftData.length !== 0 && val.length > 0) {
      const listed = searchArray(val, nftData.available);
      const rented = searchArray(val, nftData.rented);
      list = { available: listed, rented: rented };

      setFilter(list);
    }
    if (nftData.length !== 0 && val.length === 0) {
      setFilter(nftData);
    }
  };

  const filterList = (val) => {
    let list = [];
    if (rent.length !== 0 && val === "Change") {
      const listed = filterArray(val, rent.available);
      const rented = filterArray(val, rent.rented);
      list = { available: listed, rented: rented };

      setFilter(list);
    }
  };

  function getUserAddress() {
    switch (selectedChain) {
      case "Hedera testnet":
        return accountId;
      default:
        return address;
    }
  }

  async function getMarketPlaceDatas() {
    if (!collections) {
      setLoading(true);
      return;
    }

    setLoading(true);
    const symbol = router.query.symbol?.replace(/-/g, " ");
    const chainId = chainDetail?.chain_id;

    const formattedName = (str) => str.toLowerCase().replace(/[\s-]+/g, "");

    const matchingCollection = collections.find(
      (collection) => formattedName(collection.name) === formattedName(symbol)
    );

    const collectionId = matchingCollection
      ? matchingCollection.token_address
      : null;

    const marketplaceData = await getMarketplaceData(
      chainId,
      collectionId,
      chainDetail
    );

    if (isEmptyData(marketplaceData)) {
      setMsg("No NFT Available in this Collection");
    } else {
      setMsg("");
    }
    const userAddress = getUserAddress();

    if (!userAddress) {
      setDisable(true);
    } else {
      setDisable(false);
    }
    setNftData(marketplaceData);
    setFilter(marketplaceData);
    setLoading(false);
  }

  function isEmptyData(marketplaceData) {
    return !marketplaceData.available.length && !marketplaceData.rented.length;
  }

  useEffect(() => {
    if (cardDatatype === "Available") {
      setCardsData(filter?.available);
    } else if (cardDatatype === "Rented") {
      setCardsData(filter?.rented);
    } else return;
  }, [nftData, cardDatatype, filter]);

  useEffect(() => {
    sort(rightSelect?.displayText);
    //analytics.track(`dapp_rent_${collections[0]?.name}_mkt_sort_${rightSelect}`)
  }, [nftData, rightSelect]);

  useEffect(() => {
    searchName(debouncedSearch);
    Mixpanel.track("home_rentmkt_collection_rent_search");
  }, [nftData, debouncedSearch]);

  useEffect(() => {
    filterList(leftSelect);
    Mixpanel.track("home_rentmkt_collection_rent_filter");
  }, [nftData, leftSelect]);

  useEffect(() => {
    if (chainDetail?.chain_id && collections) {
      getMarketPlaceDatas();
    }
  }, [userTransacted, collections, nftSignal, chainDetail]);

  const priceFilterHandler = (selectedOption) => {
    setRightSelect(selectedOption);
  };
  var tab = "mkt";
  return (
    <>
      <div className="min-h-screen">
        <Header />
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
              /\/marketplace$/,
              "/myassets"
            );
            router.push(newPath);
          }}
        />
        <div className="flex px-12 gap-6">
          <FilterComponent
            showCenterBar={false}
            cardDatatype={cardDatatype}
            setCardDatatype={setCardDatatype}
            rightSelect={rightSelect}
            setRightSelect={setRightSelect}
            search={search}
            setSearch={setSearch}
            leftSelect={leftSelect}
            setLeftSelect={setLeftSelect}
            priceFilterHandler={priceFilterHandler}
            tab={tab}
            collections={collections}
            setLoading={setLoading}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />
          <CardsSection
            setModalType={setModalType}
            setDataItem={setDataItem}
            cardsData={cardsData}
            cardDatatype={cardDatatype}
            msg={msg}
            disable={disable}
            loading={loading}
            tab={tab}
            tokenData={tokenData}
            isFilterOpen={isFilterOpen}
          />
        </div>
        {modalType?.toLowerCase() === "buy" ? (
          <BuyModal cardsData={dataItem} />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default rent;
