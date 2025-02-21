"use client";
import React, { useState, useEffect, useContext } from "react";
import { ModalContext } from "@/context/ModalContext";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  hashapackPairingData,
  hederaLoanData,
} from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { walletAddress, xrpLoanData } from "@/utils/xrpProvider";
import { ChainContext } from "@/context/ChainContext";
import CenterNav from "@/components/CenterNav/CenterNav";
import Header from "@/components/Navbar/Header";
import AddToCalendarModal from "@/components/Reusables/loan/Modals/AddToCalendarModal/AddToCalendarModal";
import Table from "@/components/Table/Table";
import { searchOffer } from "@/utils/helperFunction";
import { useAccount } from "wagmi";
import useMediaQuery from "@/hooks/useMediaQuery";
import ReactPortal from "@/components/Reusables/loan/Portal";
import { AiOutlineClose } from "react-icons/ai";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const Loans = () => {
  const { modalType } = useContext(ModalContext);
  const { selectedChain, collections, chainDetail } = useContext(ChainContext);
  const { isPaired } = useContext(HederaContext);
  const { nftPoolData } = useContext(PoolManagerContext);
  const { isConnected, address } = useUserWalletContext();
  const wallet = useWallet();

  const [headers] = useState([
    "NFT_Name",
    "Borrowed Amount",
    "APY",
    "Repayment",
    "Duration",
    "View Txn",
    " ",
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayData, setDisplayData] = useState([]);
  const [searchString, setSearchString] = useState("");
  const debouncedSearch = useDebounce(searchString, 300);
  const matchesBigScreen = useMediaQuery();

  const pagename = "loans";

  useEffect(() => {
    analytics.page("Loans Page Viewed");
    analytics.track("dapp_loan_tab_loans", {
      userLoggedIn: true,
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let loanData = [];
      if (chainDetail?.chain_id === "solana" && wallet.connected) {
        loanData = await hederaLoanData(
          wallet.publicKey.toBase58(),
          collections,
          nftPoolData,
          chainDetail.chain_id,
          chainDetail
        );
      } else if (chainDetail?.chain_id === "296" && isPaired) {
        loanData = await hederaLoanData(
          hashapackPairingData().accountIds[0] ?? "",
          collections,
          nftPoolData,
          chainDetail.chain_id,
          chainDetail
        );
      } else if (selectedChain === "xrp") {
        loanData = await xrpLoanData(walletAddress);
      } else if (
        isConnected &&
        collections &&
        nftPoolData &&
        chainDetail?.evm
      ) {
        loanData = await hederaLoanData(
          address,
          collections,
          nftPoolData,
          chainDetail?.chain_id,
          chainDetail
        );
      }
      console.log({ loanData });
      setRows(loanData);
      setDisplayData(loanData);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    wallet.connected,
    isPaired,
    selectedChain,
    collections,
    nftPoolData,
    chainDetail,
    isConnected,
  ]);

  useEffect(() => {
    setDisplayData(searchOffer(rows, debouncedSearch));
  }, [debouncedSearch, rows]);

  const [showLendHeader, setShowLendHeader] = useState(false);
  const [localStorageChange, setLocalStorageChange] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setLocalStorageChange((prevState) => !prevState);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loansOpened = localStorage.getItem("loansOpened");
    if (!matchesBigScreen && !loansOpened) {
      setShowLendHeader(true);
      document.body.style.overflow = "hidden";
    }
  }, [matchesBigScreen, localStorageChange]);

  return (
    <div className="p-0 pb-16 pt-[52px]">
      {showLendHeader && (
        <ReactPortal wrapperId="react-portal-modal-container">
          <div
            className="h-screen w-screen absolute z-[1000] top-0 left-0 flex flex-col justify-end bg-blackBlurred"
            onClick={() => {
              document.body.style.overflow = "auto";
              localStorage.setItem("loansOpened", true);
              setShowLendHeader(false);
            }}
          >
            <div
              className="bg-green-1 h-fit w-full rounded-t-lg flex relative pt-10 px-4 gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute right-3 top-3">
                <AiOutlineClose
                  size={21}
                  className="cursor-pointer"
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    localStorage.setItem("loansOpened", true);
                    setShowLendHeader(false);
                  }}
                />
              </div>
              <div className="whitespace-nowrap min-w-[47%] max-w-[47%]">
                <h5 className="text-sm text-green-2">Make loan offers on</h5>
                <p className="text-sm font-semibold text-green">
                  NFT Collection
                </p>
                <img
                  src={"/images/loanHeader.png"}
                  alt=""
                  className="h-32 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-2xs text-green-6 font-bold">
                  Browse collections below, and name your price. The current
                  best offer will be shown to borrowers. To take your offer,
                  they lock in an NFT from that collection to use as collateral.
                  You will be repaid at the end of the loan, plus interest. If
                  they fail to repay, you get to keep the NFT.
                </p>
              </div>
            </div>
          </div>
        </ReactPortal>
      )}
      <Header />
      <CenterNav
        serachString={searchString}
        setSerachString={setSearchString}
        pagename={pagename}
      />
      <div>
        {loading ? (
          <Loader />
        ) : !isConnected ? (
          <div className="h-24 w-full flex items-center justify-center text-white">
            <h1 className="text-xl font-semibold">
              Connect your wallet to view your loans
            </h1>
          </div>
        ) : (
          <Table headers={headers} rows={displayData} loading={loading} />
        )}
      </div>
      {modalType === "loan" && <AddToCalendarModal />}
    </div>
  );
};

export default Loans;
