"use client";
import React, { useState, useEffect, useContext } from "react";
import Header from "@/components/symbol/Header";
import { WithdrawModal } from "@/components/Reusables/rent/Modals";
import { useWallet } from "@solana/wallet-adapter-react";
import CardsSection from "@/components/symbol/CardsSection";
import { useRouter } from "next/router";
import {
  filterArray,
  searchArray,
  sortarrayAsc,
  sortarrayDes,
} from "@/utils/common";
import { Mixpanel } from "@/utils/mixpanel";
import { useAccount } from "wagmi";
import { UserNftContext } from "@/context/UserNftContext";
import { HederaContext } from "@/context/HederaContext";
import { ChainContext } from "@/context/ChainContext";
import { myrent } from "@/utils/assetInfo";
import useDebounce from "@/hooks/useDebounce";
import { ModalContext } from "@/context/ModalContext";
import CenterBar from "@/components/symbol/CenterBar";
import { useUserWalletContext } from "@/context/UserWalletContext";

const rent = () => {
  const [rent, setRent] = useState([]);
  const [filter, setFilter] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [cardDatatype, setCardDatatype] = useState("Rented");
  const [rightSelect, setRightSelect] = useState("Price: Low to High");
  const [search, setSearch] = useState("");
  const [leftSelect, setLeftSelect] = useState("Duration");
  const [dataItem, setDataItem] = useState([]);
  const [msg, setMsg] = useState("");
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isConnected, address } = useUserWalletContext();
  const { userNfts } = useContext(UserNftContext);
  const { isPaired, accountId, nftSignal } = useContext(HederaContext);
  const {
    selectedChain,
    chainDetail,
    collections,
    userTransacted,
    setUserTransacted,
    tokenData,
  } = useContext(ChainContext);
  const debouncedSearch = useDebounce(search, 300);
  const { modalType, setModalType } = useContext(ModalContext);
  const { connected } = useWallet();

  const sort = (val) => {
    let list = [];
    if (filter?.length !== 0) {
      if (val === "Price: Low to High") {
        const rented = sortarrayAsc(filter?.rented, "p");
        list = { rented };
      } else if (val === "Price: High to Low") {
        const rented = sortarrayDes(filter?.rented, "p");
        list = { rented };
      } else if (val === "Duration: Low to High") {
        const rented = sortarrayAsc(filter?.rented, "d");
        list = { rented };
      } else if (val === "Duration: High to Low") {
        const rented = sortarrayDes(filter?.rented, "d");
        list = { rented };
      }
      setFilter(list);
    }
  };

  const searchName = (val) => {
    let list = [];
    if (rent.length !== 0 && val?.length > 0) {
      const rented = searchArray(val, rent.rented);
      list = { rented };

      setFilter(list);
    }
    if (rent.length !== 0 && val.length === 0) {
      setFilter(rent);
    }
  };

  const filterList = (val) => {
    let list = [];
    if (rent.length !== 0 && val === "Change") {
      const rented = filterArray(val, rent.rented);
      list = { rented: rented };
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

  function isEmptyRentData(rentedData) {
    return !rentedData.rented.length;
  }

  const priceFilterHandler = (selectedOption) => {
    setRightSelect(selectedOption);
  };

  async function getRentedData() {
    if (!collections) {
      setLoading(true);
      return;
    }
    if (!isConnected && !isPaired && !connected) {
      setLoading(false);
      setMsg("Connect your wallet to see rented Assets");
      return;
    }
    setLoading(true);
    const symbol = router.query.symbol?.replace(/-/g, " ");
    const chainId = chainDetail?.chain_id;
    const userAddress = getUserAddress();

    if (!userAddress) {
      setLoading(false);
      setMsg("Connect your wallet to see rented Assets");
      return;
    }
    const formattedName = (str) => str.toLowerCase().replace(/[\s-]+/g, "");

    const matchingCollection = collections.find(
      (collection) => formattedName(collection.name) === formattedName(symbol)
    );

    const collectionId = matchingCollection
      ? matchingCollection.token_address
      : null;

    const rentedData = await myrent(
      chainId,
      userAddress,
      chainDetail,
      collectionId
    );

    if (isEmptyRentData(rentedData)) {
      setMsg("You don't have any active NFT Rentals");
    } else {
      setMsg("");
    }

    setRent(rentedData);
    setFilter(rentedData);
    setLoading(false);
  }

  useEffect(() => {
    setCardsData(filter.rented || []);
  }, [rent, cardDatatype, filter]);

  useEffect(() => {
    sort(rightSelect);
    Mixpanel.track("home_rentmkt_collection_rent_sort");
  }, [rent, rightSelect]);

  useEffect(() => {
    searchName(debouncedSearch);
    Mixpanel.track("home_rentmkt_collection_rent_search");
  }, [rent, debouncedSearch]);

  useEffect(() => {
    filterList(rent);
    Mixpanel.track("home_rentmkt_collection_rent_filter");
  }, [rent, leftSelect]);

  useEffect(() => {
    if (chainDetail?.chain_id && collections) {
      getRentedData();
    }
  }, [
    connected,
    isPaired,
    userTransacted,
    isConnected,
    userNfts,
    chainDetail,
    collections,
    nftSignal,
  ]);

  return (
    <>
      <div className="min-h-screen mt-8">
        <Header />
        <CenterBar
          showCenterBar={false}
          selectBody={["Rented"]}
          cardDatatype={cardDatatype}
          setCardDatatype={setCardDatatype}
          rightSelect={rightSelect}
          setRightSelect={setRightSelect}
          search={search}
          setSearch={setSearch}
          leftSelect={leftSelect}
          setLeftSelect={setLeftSelect}
          loading={loading}
          setLoading={setLoading}
          collections={collections}
          priceFilterHandler={priceFilterHandler}
        />
        <CardsSection
          setModalType={setModalType}
          setDataItem={setDataItem}
          cardsData={cardsData}
          cardDatatype={cardDatatype}
          msg={msg}
          loading={loading}
          tokenData={tokenData}
        />
        {modalType === "Withdraw" && (
          <WithdrawModal
            cardsData={dataItem}
            setUserTransacted={setUserTransacted}
          />
        )}
      </div>
    </>
  );
};

export default rent;
