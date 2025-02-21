"use client";
import CenterNav from "@/components/CenterNav/CenterNav";
import Header from "@/components/Navbar/Header";
import Table from "@/components/Table/Table";
import { useState, useEffect, useContext } from "react";
import {
  BorrowModal,
  NFTMintingModal,
} from "@/components/Reusables/loan/Modals";
import { ModalContext } from "@/context/ModalContext";
import ViewModal from "@/components/Reusables/loan/Modals/CouterModal/ViewModal";
import { searchBorrow } from "@/utils/helperFunction";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import RequestOfferModal from "@/components/Reusables/loan/Modals/RequestOfferModal/RequestOfferModal";
import { ChainContext } from "@/context/ChainContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import ReactPortal from "@/components/Reusables/loan/Portal";
import { AiOutlineClose } from "react-icons/ai";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/Reusables/loan/Loader";
import { indexerAxiosInstance } from "@/services/axios";

const Borrow = () => {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [serachString, setSerachString] = useState("");
  const { modalType } = useContext(ModalContext);
  const { selectedChain, collections, chainDetail } = useContext(ChainContext);
  const matchesBigScreen = useMediaQuery();

  const { bestOffer, tvl, load } = useContext(PoolManagerContext);
  const { managerSignal, poolSignal, nftSignal } =
    useContext(PoolManagerContext);
  // const [tvl, setTvl] = useState(0);
  const [volume, setVolume] = useState(0);

  const debouncedSearch = useDebounce(serachString, 300);
  var pagename = "borrow";
  useEffect(() => {
    analytics.page("Borrow Page Viewed");
    analytics.track("dapp_loan_tab_borrow", {
      userLoggedIn: true,
    });
  }, []);

  useEffect(() => {
    const fetchOtherChainData = async () => {
      setHeaders([
        "Collection_Name",
        "Total_Liquidity",
        "Best_Offer",
        "Interest",
        "Duration",
        " ",
      ]);

      setData([]);
      setDisplayData([]);
      setLoading(true);

      try {
        if (bestOffer?.data) {
          const totalVolume = Object.values(bestOffer.data)
            .map((item) => Number(item?.pool?.totalVolume) || 0)
            .reduce((acc, volume) => acc + volume, 0);

          setVolume(totalVolume);
          setData(bestOffer.data);
          setDisplayData(bestOffer.data);
        }
      } catch (error) {
        console.error("Error fetching other chain data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedChain && selectedChain !== "Solana") {
      fetchOtherChainData();
    }
  }, [
    selectedChain,
    managerSignal,
    collections,
    nftSignal,
    poolSignal,
    chainDetail,
    bestOffer,
  ]);

  useEffect(() => {
    const filteredData = searchBorrow(data, debouncedSearch);
    setDisplayData(filteredData);
  }, [debouncedSearch, data]);

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
    const lendOpened = localStorage.getItem("lendOpened");
    if (!matchesBigScreen && !lendOpened) {
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
                    localStorage.setItem("borrowOpened", true);
                    setShowLendHeader(false);
                  }}
                />
              </div>
              <div className="whitespace-nowrap min-w-[35%]">
                <h5 className="text-sm">Borrow agains</h5>
                <p className="text-sm font-semibold text-green">
                  NFT instantly
                </p>
                <img
                  src={"/images/borrowHeader.png"}
                  alt=""
                  className="h-32 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-2xs text-green-6 font-bold">
                  Instantly take a loan against your NFTs. Escrow-free loans
                  allows you to keep the collateral NFT in your wallet. When you
                  accept a loan offer, a secure contract is created, freezing
                  the NFT in-wallet. Not repaying by the due date means the
                  lender can repossess your NFT. Successfully pay the loan in
                  full by the expiration date to automatically thaw the NFT.
                </p>
              </div>
            </div>
          </div>
        </ReactPortal>
      )}
      <Header />
      <CenterNav
        serachString={serachString}
        setSerachString={setSerachString}
        totalLoans={volume}
        totalVolume={Number(tvl)}
        pagename={pagename}
      />

      <div>
        {load ? (
          <Loader />
        ) : (
          <Table
            headers={headers}
            rows={displayData}
            loading={load}
            setLoading={setLoading}
          />
        )}
      </div>

      {modalType === "borrow" && <BorrowModal />}
      {modalType === "mint" && <NFTMintingModal />}
      {modalType === "request" && <RequestOfferModal />}
      {modalType === "view" && <ViewModal />}
    </div>
  );
};

export default Borrow;
