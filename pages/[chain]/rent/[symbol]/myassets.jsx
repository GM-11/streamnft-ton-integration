"use client";
import React, { useContext, useEffect, useState, useMemo } from "react";
import Header from "@/components/symbol/Header";
import {
  LendModal,
  RentModal,
  CancelModal,
  WithdrawModal,
} from "@/components/Reusables/rent/Modals";
// const CardsSection = dynamic(() => import("@/components/symbol/CardsSection"));
const CenterBar = dynamic(() => import("@/components/symbol/CenterBar"));
import CardsSection from "@/components/symbol/CardsSection";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import {
  filterArray,
  searchArray,
  sortarrayAsc,
  sortarrayDes,
} from "@/utils/common";
import { Mixpanel } from "@/utils/mixpanel";
import { useAccount } from "wagmi";
import { HederaContext } from "@/context/HederaContext";
import { UserNftContext } from "@/context/UserNftContext";
import { ChainContext } from "@/context/ChainContext";
import { myasset } from "@/utils/assetInfo";
import useDebounce from "@/hooks/useDebounce";
import { ModalContext } from "@/context/ModalContext";
import dynamic from "next/dynamic";
import { useUserWalletContext } from "@/context/UserWalletContext";
import DiscoverCenterBar from "@/components/symbol/DiscoverCenterBar";
import FilterComponent from "@/components/symbol/DiscoverFilter";
import { useConnection } from "@/hooks/useTonConnection";

const lend = () => {
  const { modalType, setModalType } = useContext(ModalContext);
  const [lend, setLend] = useState([]);
  const [filter, setFilter] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [cardDatatype, setCardDatatype] = useState("Owned");
  const [rightSelect, setRightSelect] = useState("Price: Low to High");
  const [search, setSearch] = useState("");
  const [leftSelect, setLeftSelect] = useState("Duration");
  const [dataItem, setDataItem] = useState([]);
  const wallet = useWallet();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { isNftsLoaded, usersNftsByCollection } = useContext(UserNftContext);

  const { connected } = useWallet();
  const { isConnected, address } = useUserWalletContext();
  const conn = useConnection();
  const { isPaired, accountId, nftSignal } = useContext(HederaContext);

  const {
    selectedChain,
    chainDetail,
    collectionId,
    collections,
    userTransacted,
    setUserTransacted,
    tokenData,
  } = useContext(ChainContext);
  const debouncedSearch = useDebounce(search, 300);

  const sort = (val) => {
    let list = {};
    if (filter.length !== 0) {
      if (val === "Price: Low to High") {
        const listed = sortarrayAsc(filter?.listed, "p");
        const rented = sortarrayAsc(filter?.rented, "p");
        // const owned = sortarrayAsc(filter?.owned.concat(filter?.loanAssets), "p");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      } else if (val === "Price: High to Low") {
        const listed = sortarrayDes(filter?.listed, "p");
        const rented = sortarrayDes(filter?.rented, "p");
        // const owned = sortarrayDes(filter?.owned.concat(filter?.loanAssets), "p");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      } else if (val === "Duration: Low to High") {
        const listed = sortarrayAsc(filter?.listed, "d");
        const rented = sortarrayAsc(filter?.rented, "d");
        // const owned = sortarrayAsc(filter?.owned.concat(filter?.loanAssets), "d");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
        const [search, setSearch] = useState("");
      } else if (val === "Duration: High to Low") {
        const listed = sortarrayDes(filter?.listed, "d");
        const rented = sortarrayDes(filter?.rented, "d");
        // const owned = sortarrayDes(filter?.owned.concat(filter?.loanAssets), "d");
        const owned = sortarrayDes(filter?.owned, "d");
        list = { owned, listed, rented };
      }
      setFilter(list);
    }
  };

  const searchName = (val) => {
    let list = {};
    if (lend.length !== 0 && val.length > 0) {
      // const owned = searchArray(val, lend?.owned.concat(lend?.loanAssets));
      const owned = searchArray(val, lend?.owned);
      const listed = searchArray(val, lend?.listed);
      const rented = searchArray(val, lend?.rented);
      list = { owned, listed, rented };
      setFilter(list);
    }
    if (lend.length !== 0 && val.length === 0) {
      // const owned = lend?.owned.concat(lend?.loanAssets);
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

  // useEffect(() => {
  //   async function getTokenData() {
  //     try {
  //       if (!chainDetail?.chain_id || !collectionId) return;

  //       const data = await fetchTokenUtilityByCollection(collectionId, chainDetail.chain_id);
  //       setTokenData(data);
  //     } catch (error) {
  //       console.error("Error fetching token data:", error);
  //     }
  //   }

  //   getTokenData();
  // }, [chainDetail?.chain_id, collectionId]);

  useEffect(() => {
    if (cardDatatype === "Owned") {
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
    sort(rightSelect?.displayText);
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
    if (!isConnected && !isPaired && !connected) {
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
      (collection) => formattedName(collection.name) === formattedName(symbol),
    );

    const collectionId = matchingCollection
      ? matchingCollection.token_address
      : null;

    const selectedCollectionNfts = usersNftsByCollection;

    const lendingData = await myasset(
      chainId,
      userAddress,
      selectedCollectionNfts ?? [],
      collectionId,
      chainDetail,
      matchingCollection?.erc1155, //TODO
      matchingCollection?.payment_token,
    );

    if (isEmptyLendingData(lendingData)) {
      setMsg("You don’t own any NFT");
    } else {
      setMsg("");
    }

    setFilter(lendingData);

    setLend(lendingData);

    setLoading(false);
  }

  function getUserAddress() {
    switch (selectedChain) {
      case "Solana":
        return wallet.publicKey ? wallet?.publicKey.toString() : null;
      case "Hedera testnet":
        return accountId;
      case "Ton":
        return conn.sender.address;
      default:
        return address;
    }
  }

  function isEmptyLendingData(lendingData) {
    return (
      !lendingData.owned.length &&
      !lendingData.listed.length &&
      !lendingData.rented.length &&
      !lendingData.loanAssets.length
    );
  }

  useEffect(() => {
    if (chainDetail?.chain_id && collections && collectionId && isNftsLoaded) {
      getLendingData();
    }
  }, [
    connected,
    isPaired,
    isConnected,
    usersNftsByCollection,
    collectionId,
    chainDetail,
    isNftsLoaded,
    userTransacted,
  ]);

  const priceFilterHandler = (selectedOption) => {
    setRightSelect(selectedOption);
  };

  let tab = "my_assets_rent";

  return (
    <>
      <div className="min-h-screen mt-8">
        <Header userTransacted={userTransacted} />
        <DiscoverCenterBar
          selectBody={["Owned", "Listed", "Rented"]}
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
          loading={loading}
          setLoading={setLoading}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
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
            loading={loading}
            tab={tab}
            tokenData={tokenData}
          />
        </div>

        {modalType === "Lend" ? (
          <LendModal
            cardsData={dataItem}
            userTransacted={userTransacted}
            setUserTransacted={setUserTransacted}
            setCardDatatype={setCardDatatype}
          />
        ) : modalType === "Rent" ? (
          <RentModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
            userTransacted={userTransacted}
          />
        ) : modalType === "Cancel" ? (
          <CancelModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
            userTransacted={userTransacted}
          />
        ) : modalType === "Withdraw" ? (
          <WithdrawModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
            userTransacted={userTransacted}
          />
        ) : null}
      </div>
    </>
  );
};

export default lend;
