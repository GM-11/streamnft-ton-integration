"use client";
import { useState, useContext, useEffect, useMemo } from "react";
import { ModalContext } from "@/context/ModalContext";
import { getUserBalance, hederaLendData } from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";
import { ethers } from "ethers";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";

import { PoolManagerContext } from "@/context/PoolManagerContext";

import { UserNftContext } from "@/context/UserNftContext";
import { ChainContext } from "@/context/ChainContext";
import RequestNFTModal from "./RequestNFTModal/RequestNFTModal";
import OffersModal from "./OffersModal/OffersModal";
import BorrowModal from "./BorrowModal/BorrowModal";
import LendModal from "./LendModal/LendModal";
import AddToCalendarModal from "@/components/Reusables/loan/Modals/AddToCalendarModal/AddToCalendarModal";

import ReactPortal from "@/components/Reusables/loan/Portal";

import { solanaLendData } from "@/utils/solanaProvider";
import { useUserWalletContext } from "@/context/UserWalletContext";

export default function Modals({
  showModal,
  setShowModal,
  rowData,
  selectedTab,
  setSelectedTab,
  mainRow,
}) {
  const [selected, setSelected] = useState([]);
  const [selectedDays, setSelectedDays] = useState(-1);
  const { selectedChain, chainDetail, collections } = useContext(ChainContext);
  // Lend Modal inputs
  const { lendData, setOpenModal, setBorrowData } = useContext(ModalContext);
  const { setFetching } = useContext(UserNftContext);

  const [displayData, setDisplayData] = useState([]);
  const [collection, setCollection] = useState({});
  const [loading, setLoading] = useState(false);
  const { bidPool, bidManager, setManagerSignal, managerSignal } =
    useContext(PoolManagerContext);
  const { isPaired } = useContext(HederaContext);
  const [loans, setLoans] = useState(0);
  const [volume, setVolume] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [isLendOpenedFromOffersCard, setIsLendOpenedFromOffersCard] =
    useState(false);
  const [selectedNFTForBorrow, setSelectedNFTForBorrow] = useState({
    serial_number: -1,
    token_id: -1,
  });

  const [balance, setBalance] = useState(0);
  const wallet = useWallet();
  const { connection } = useConnection();
  const { address } = useUserWalletContext();
  const [filter, setFilter] = useState(false);
  const [availableDurations, setAvailableDurations] = useState({});
  const [amount, setAmount] = useState("");

  const [duration, setDuration] = useState("");

  const [interestRate, setInterestRate] = useState("");

  const availableDuration = useMemo(() => {
    return rowData.offers
      ?.map(({ loanDurationInMinutes }) => loanDurationInMinutes)
      ?.sort((a, b) => a - b);
  }, [rowData.offers]);

  const availableDurationOptions = useMemo(() => {
    if (availableDuration?.length > 0) {
      const options = [{ label: "All", value: -1 }];

      for (const [index, item] of availableDuration.entries()) {
        options.push({
          label: Number.isInteger(Number(item) / 1440)
            ? item / 1440
            : (item / 1440).toFixed(4),
          value: index,
        });
      }

      return options;
    } else {
      return [];
    }
  }, [availableDuration]);

  const setBal = async () => {
    if (chainDetail?.chain_id == "solana") {
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance((bal / LAMPORTS_PER_SOL).toFixed(5));
    } else if (chainDetail?.chain_id == "296") {
      const bal = await getUserBalance();
      setBalance(Number(bal).toFixed(2));
    } else if (selectedChain === "mantle") {
      setBalance(ethers?.formatEther(data.value));
    }
  };

  const handelRequestModelOpen = () => {
    if (chainDetail?.chain_id == "296") {
      if (!isPaired) {
        return toast.error("Please connect your wallet");
      } else {
        setSelectedTab("request");
        setBorrowData(mainRow);
        setOpenModal(true);
      }
    } else {
      if (!isConnected) {
        toast.error("Connect your wallet");
        return;
      } else {
        setSelectedTab("request");
        setBorrowData(mainRow);
        setOpenModal(true);
        setRequestBorrowData(rowData[0]?.pool?.tokenAddress);
        setOpenModal(true);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    if (wallet.publicKey || isPaired || address) {
      setBal();
    }
    if (chainDetail?.chain_id == "296") {
      setCollection({});
      setDisplayData({});
      hederaLendData(bidPool, bidManager, collections, chainDetail).then(
        (resp) => {
          if (resp) {
            // sortData(resp);
            setCollection(resp);
            setDisplayData(resp);
            setLoading(false);
            const firstTotalLoans = Object.values(resp.sorteddata)
              .flatMap((a) => a)
              .find((obj) => obj.totalLoans !== undefined)?.totalLoans;
            const firstTotalVolume = Object.values(resp.sorteddata)
              .flatMap((a) => a)
              .find((obj) => obj.totalVolume !== undefined)?.totalVolume;
            setLoans(firstTotalLoans);
            setVolume(firstTotalVolume);
          }
        }
      );
    } else if (selectedChain === "mantle") {
      setCollection({});
      setDisplayData({});
      lendData().then((resp) => {
        if (resp) {
          // sortData(resp);
          setCollection(resp);
          setDisplayData(resp);
          setLoading(false);
        }
      });
    } else if (chainDetail?.chain_id == "solana") {
      setCollection({});
      setDisplayData({});
      solanaLendData(connection).then((resp) => {
        setCollection(resp);
        setDisplayData(resp);
        setLoading(false);
      });
    }
  }, [selectedChain, managerSignal, isPaired, address]);

  useEffect(() => {
    if (filter === "All") {
      setSelectedDays(-1);
    } else {
      setSelectedDays(filter?.value);
    }
  }, [filter]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  useEffect(() => {
    if (availableDuration?.length > 0) {
      const uniqueDurations = [...new Set(availableDuration)];
      setAvailableDurations(uniqueDurations);
    }
  }, [availableDuration]);

  if (showModal)
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div
          style={{ backgroundColor: "rgba(0,0,0, 0.8)" }}
          className="overflow-x-hidden h-screen fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 max-h-full z-[1002]"
        >
          <div className="relative w-full flex flex-col justify-end min-h-full">
            <div className="h-fit w-full flex items-center justify-center">
              <button
                type="button"
                className="rounded-full h-8 w-8 bg-mobile-modal-bg flex items-center justify-center"
                onClick={() => {
                  if (
                    (selectedTab === "lend" || selectedTab === "borrow") &&
                    isLendOpenedFromOffersCard
                  ) {
                    setSelectedTab("offers");
                  } else {
                    setShowModal(false);
                  }
                  document.body.style.overflow = "auto";
                }}
              >
                <AiOutlineClose color="#fff" size={21} />
              </button>
            </div>
            <div className="relative p-2 rounded-t-3xl shadow text-white min-h-[420px] max-h-[420px] pb-0 overflow-y-auto bg-mobile-modal-bg">
              <>
                {selectedTab === "borrow" ? (
                  <BorrowModal setShowModal={setShowModal} />
                ) : selectedTab === "request" ? (
                  <RequestNFTModal
                    loading={loading}
                    amount={amount}
                    setAmount={setAmount}
                    duration={duration}
                    setDuration={setDuration}
                    interestRate={interestRate}
                    setInterestRate={setInterestRate}
                    selected={selected}
                    setSelected={setSelected}
                  />
                ) : selectedTab === "offers" ? (
                  <OffersModal
                    loading={loading}
                    availableDurations={availableDurations}
                    availableDurationOptions={availableDurationOptions}
                    handelRequestModelOpen={handelRequestModelOpen}
                    rowData={rowData}
                    selectedDays={selectedDays}
                    setSelectedDays={setSelectedDays}
                    setSelectedTab={setSelectedTab}
                    setFilter={setFilter}
                    setIsLendOpenedFromOffersCard={
                      setIsLendOpenedFromOffersCard
                    }
                  />
                ) : selectedTab === "calendar" ? (
                  <AddToCalendarModal />
                ) : (
                  <LendModal setShowModal={setShowModal} />
                )}
              </>
            </div>
          </div>
        </div>
      </ReactPortal>
    );
  else return <></>;
}
