"use client";
import CenterNav from "@/components/CenterNav/CenterNav";
import Header from "@/components/Navbar/Header";
import { LendModal, NFTMintingModal } from "@/components/Reusables/loan/Modals";
import Table from "@/components/Table/Table";
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { ModalContext } from "@/context/ModalContext";
import { searchLend } from "@/utils/helperFunction";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import CounterModal from "@/components/Reusables/loan/Modals/CouterModal/CounterModal";
import { ChainContext } from "@/context/ChainContext";
import { AiOutlineClose } from "react-icons/ai";
import ReactPortal from "@/components/Reusables/loan/Portal";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/Reusables/loan/Loader";
import { useRouter } from "next/router";

const Index = () => {
  const [headers, setHeaders] = useState([
    "Collection_Name",
    "Total_Liquidity",
    "Best_Offer",
    "APY",
    "Duration",
  ]);
  const [collection, setCollection] = useState({});
  const [displayData, setDisplayData] = useState({});
  const [searchString, setSearchString] = useState("");
  const [loading, setLoading] = useState(true);
  const matchesBigScreen = useMediaQuery();
  const { modalType } = useContext(ModalContext);
  const isBigScreen = useMediaQuery();
  const router = useRouter();

  const { tvl, managerSignal, bestOffer, load } =
    useContext(PoolManagerContext);

  // const [tvl, setTvl] = useState(0);
  const [volume, setVolume] = useState(0);
  const { selectedChain, chainDetail } = useContext(ChainContext);
  const debouncedSearch = useDebounce(searchString, 300);

  useEffect(() => {
    analytics.page("dapp_loan_tab_lend");
    analytics.track("dapp_loan_tab_lend", {
      userLoggedIn: true,
    });
  }, []);

  const fetchData = async () => {
    setHeaders([
      "Collection_Name",
      "Total_Liquidity",
      "Best_Offer",
      "APY",
      "Duration",
    ]);
    setLoading(true);

    try {
      setCollection({});
      setDisplayData({});

      if (bestOffer?.data) {
        setCollection(bestOffer?.data);
        setDisplayData(bestOffer?.data);

        const totalVolume = Object.values(bestOffer.data)
          .map((item) => Number(item?.pool?.totalVolume) || 0)
          .reduce((acc, volume) => acc + volume, 0);

        setVolume(totalVolume);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChain, chainDetail, managerSignal, bestOffer, router]);

  useEffect(() => {
    setDisplayData(searchLend(collection, debouncedSearch));
  }, [debouncedSearch, collection]);

  const pagename = "Lend";

  const [showLendHeader, setShowLendHeader] = useState(false);

  const [localStorageChange, setLocalStorageChange] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setLocalStorageChange((prevState) => !prevState);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
          <LendHeader setShowLendHeader={setShowLendHeader} />
        </ReactPortal>
      )}
      <Header />
      <CenterNav
        searchString={searchString}
        setSearchString={setSearchString}
        totalLoans={volume}
        totalVolume={Number(tvl)}
        pagename="Lend"
      />
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

      {isBigScreen && (
        <>
          {modalType?.toLowerCase() === "lend" ? (
            <LendModal />
          ) : modalType?.toLowerCase() === "mint" ? (
            <NFTMintingModal />
          ) : modalType?.toLowerCase() === "counter" ? (
            <CounterModal />
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

const LendHeader = ({ setShowLendHeader }) => (
  <div
    className="h-full w-full absolute z-[1000] top-0 left-0 flex flex-col justify-end bg-blackBlurred"
    onClick={() => {
      document.body.style.overflow = "auto";
      localStorage.setItem("lendOpened", true);
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
            localStorage.setItem("lendOpened", true);
            setShowLendHeader(false);
          }}
        />
      </div>
      <div className="whitespace-nowrap">
        <h5 className="text-sm text-green-2">Make loan offers on</h5>
        <p className="text-sm font-semibold text-green">NFT Collection</p>
        <img
          src="/images/lendHeader.png"
          alt=""
          className="h-32 w-auto object-contain"
        />
      </div>
      <div>
        <p className="text-2xs text-green-6 font-bold">
          Browse collections below, and name your price. The current best offer
          will be shown to borrowers. To take your offer, they lock in an NFT
          from that collection to use as collateral. You will be repaid at the
          end of the loan, plus interest. If they fail to repay, you get to keep
          the NFT.
        </p>
      </div>
    </div>
  </div>
);

export default Index;
