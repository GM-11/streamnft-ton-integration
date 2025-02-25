"use client";
import React, { useState, useEffect, useContext } from "react";
import Header from "@/components/symbol/Header";
import { TonConnectButton } from "@tonconnect/ui-react";
import {
  LendModal,
  RentModal,
  CancelModal,
  WithdrawModal,
} from "@/components/Reusables/rent/Modals";
import { useWallet } from "@solana/wallet-adapter-react";
import CardsSection from "@/components/symbol/CardsSection";
import CenterBar from "@/components/symbol/CenterBar";
import { useRouter } from "next/router";
import {
  filterArray,
  searchArray,
  sortarrayAsc,
  sortarrayDes,
} from "@/utils/common";
import { Mixpanel } from "@/utils/mixpanel";
import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";
import { marketplace } from "@/utils/assetInfo";
import { HederaContext } from "@/context/HederaContext";
import useDebounce from "@/hooks/useDebounce";
import { ModalContext } from "@/context/ModalContext";
import { toast } from "react-toastify";
import { useUserWalletContext } from "@/context/UserWalletContext";
import DiscoverCenterBar from "@/components/symbol/DiscoverCenterBar";
import FilterComponent from "@/components/symbol/DiscoverFilter";
import { processTonRent } from "@/utils/tonProvider";
import { useConnection } from "@/hooks/useTonConnection";

const rent = () => {
  const { modalType, setModalType, setOpenModal } = useContext(ModalContext);
  const [nftData, setNftData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [cardDatatype, setCardDatatype] = useState("Available");
  const [rightSelect, setRightSelect] = useState("Price: Low to High");
  const [search, setSearch] = useState("");
  const [leftSelect, setLeftSelect] = useState("Duration");
  const [dataItem, setDataItem] = useState([]);
  const [msg, setMsg] = useState("");
  const [disable, setDisable] = useState(false);
  const wallet = useWallet();
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
  const conn = useConnection();

  const sort = (val) => {
    let list = [];
    if (nftData.length !== 0) {
      if (val === "Price: Low to High") {
        const listed = sortarrayAsc(filter?.available, "p");
        const rented = sortarrayAsc(filter?.rented, "p");
        list = { available: listed, rented: rented };
      } else if (val === "Price: High to Low") {
        const listed = sortarrayDes(filter?.available, "p");
        const rented = sortarrayDes(filter?.rented, "p");
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
      case "Solana":
        return wallet?.publicKey?.toString();
      case "Hedera testnet":
        return accountId;
      default:
        return address;
    }
  }

  async function getMarketPlaceData() {
    if (!collections) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const symbol = router.query.symbol?.replace(/-/g, " ");
    const chainId = chainDetail.chain_id;

    const formattedName = (str) => str.toLowerCase().replace(/[\s-]+/g, "");

    const matchingCollection = collections.find(
      (collection) => formattedName(collection.name) === formattedName(symbol),
    );

    const collectionId = matchingCollection
      ? matchingCollection.token_address
      : null;

    const marketplaceData = await marketplace(
      chainId,
      collectionId,
      chainDetail,
      matchingCollection?.payment_token,
      address,
    );

    console.log(marketplaceData);

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
    if (!marketplaceData) {
      return true;
    }

    if (marketplace.available && marketplace.rented) {
      return (
        !marketplaceData.available.length && !marketplaceData.rented.length
      );
    } else {
      return false;
    }
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
      getMarketPlaceData();
    }
  }, [userTransacted, collections, nftSignal, chainDetail, address]);

  const priceFilterHandler = (selectedOption) => {
    setRightSelect(selectedOption);
  };
  var tab = "mkt";

  useEffect(() => {
    if (router?.query?.token && router?.query?.share && cardsData?.length > 0) {
      const selectedToken =
        cardsData?.find(
          (el) => Number(el?.id) === Number(router?.query?.token),
        ) ?? {};
      if (Object.keys(selectedToken)?.length > 0) {
        setDataItem(selectedToken);
        setModalType("Rent");
        setOpenModal(true);
      } else {
        toast.dismiss();
        toast.error("Token not on marketplace");
      }
    }
  }, [cardsData, router]);

  return (
    <>
      <div className="min-h-screen mt-8">
        <Header />
        <DiscoverCenterBar
          selectBody={["Available", "Rented"]}
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
            disable={disable}
            loading={loading}
            tab={tab}
            tokenData={tokenData}
          />
        </div>

        {modalType === "Lend" ? (
          <LendModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
          />
        ) : modalType === "Rent" ? (
          <RentModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
          />
        ) : modalType === "Cancel" ? (
          <CancelModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
          />
        ) : modalType === "Withdraw" ? (
          <WithdrawModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
          />
        ) : null}
      </div>
    </>
  );
};

export default rent;
