import Header from "@/components/Navbar/Header";
import { searchOffer } from "@/utils/helperFunction";
import Table from "@/components/Table/Table";
import React, { useState, useEffect, useMemo, useContext } from "react";
import { ModalContext } from "@/context/ModalContext";
import { AccountId } from "@hashgraph/sdk";
import { useAccount } from "wagmi";
import walletIcon from "../../../public/images/Wallet.svg";
import { HederaContext } from "@/context/HederaContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import EditModal from "@/components/Reusables/loan/Modals/EditModal";
import ClaimModal from "@/components/Reusables/loan/Modals/ClaimModal";
import { ChainContext } from "@/context/ChainContext";
import CenterNav from "@/components/CenterNav/CenterNav";
import useDebounce from "@/hooks/useDebounce";
import useMediaQuery from "@/hooks/useMediaQuery";
import ReactPortal from "@/components/Reusables/loan/Portal";
import { AiOutlineClose } from "react-icons/ai";
import { xrpOfferData } from "@/utils/xrpProvider";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { useSigner } from "@/context/SignerContext";
import { utilityContext } from "@/context/UtilityContext";
import Button from "@/components/Reusables/utility/Button";
import Image from "next/image";

function wait(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

const Offers = () => {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayData, setDisplayData] = useState([]);
  const [nftData, setNftData] = useState([]);
  const [serachString, setSerachString] = useState("");
  const [pair, setPair] = useState(false);
  const { address, isConnected } = useUserWalletContext();
  const { selectedChain, chainDetail, collections } = useContext(ChainContext);
  const { isPaired, accountId } = useContext(HederaContext);
  const { managerSignal, poolSignal, offers, getNftOffers } =
    useContext(PoolManagerContext);
  const { modalType } = useContext(ModalContext);
  const { isTokenSet } = useUserWalletContext();
  const [displayData1, setDisplayData1] = useState([]);

  const [data1, setData1] = useState([]);

  const debouncedSearch = useDebounce(serachString, 300);

  var pagename = "offer";

  useEffect(() => {
    analytics.page("Offer Page Viewed");
    analytics.track("dapp_loan_tab_offers", {
      userLoggedIn: true,
    });
  }, []);

  useEffect(() => {
    analytics.page("Offer Page Viewed");
    analytics.track("dapp_loan_tab_offers", {
      userLoggedIn: true,
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (chainDetail?.chain_id == "296" && isPaired) {
          setLoading(true);
          const solidityAddress =
            "0x" +
            AccountId?.fromString(accountId)?.toSolidityAddress()?.toString();
          const res = await getNftOffers(
            Number(chainDetail?.chain_id),
            solidityAddress
          );
          setNftData(res);
          setData1(res);
          setDisplayData1(res);
        } else if (chainDetail?.evm && isConnected) {
          setLoading(true);
          const res = await getNftOffers(
            Number(chainDetail?.chain_id),
            address
          );
          console.log("res", res);
          setNftData(res);
          setData1(res);
          setDisplayData1(res);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    selectedChain,
    isPaired,
    isConnected,
    managerSignal,
    collections,
    chainDetail,
    poolSignal,
    offers,
    isTokenSet,
  ]);

  useEffect(() => {
    setHeaders([
      "Collection/NFT_Name",
      "Status",
      "Your_Offer",
      "APY",
      "Duration",
      "View Txn",
      " ",
    ]);
  }, []);

  useEffect(() => {
    const listenStorageChange = async () => {
      await wait(1);

      if (
        JSON.parse(localStorage.getItem("connected")) === 1 &&
        localStorage.getItem("hashconnectData")
      ) {
        setPair(true);
      } else {
        setPair(false);
      }
    };
    window.addEventListener("storage", listenStorageChange);
    return () => window.removeEventListener("storage", listenStorageChange);
  }, []);

  const fetchDataForChain = async () => {
    try {
      if (!selectedChain) return;

      setLoading(true);
      setData(offers);
      setDisplayData(offers);
    } catch (error) {
      console.error("Error fetching data for chain:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataForChain();
  }, [
    selectedChain,
    isPaired,
    isConnected,
    managerSignal,
    poolSignal,
    chainDetail,
    pair,
    offers,
    isTokenSet,
  ]);

  useEffect(() => {
    if (data) {
      setDisplayData(searchOffer(data, debouncedSearch));
    }
    if (data1) {
      setDisplayData1(searchOffer(data1, debouncedSearch));
    }
  }, [debouncedSearch, data, data1]);

  const matchesBigScreen = useMediaQuery();

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
    const offersOpened = localStorage.getItem("offersOpened");
    if (!matchesBigScreen && !offersOpened) {
      setShowLendHeader(true);
      document.body.style.overflow = "hidden";
    }
  }, [matchesBigScreen, localStorageChange]);

  console.log({ offers });

  return (
    <div className="p-0 pb-16 pt-[52px]">
      {showLendHeader && (
        <ReactPortal wrapperId="react-portal-modal-container">
          <div
            className="h-screen w-screen absolute z-[1000] top-0 left-0 flex flex-col justify-end bg-blackBlurred"
            onClick={() => {
              document.body.style.overflow = "auto";
              localStorage.setItem("offersOpened", true);
              setShowLendHeader(false);
            }}
          >
            <div
              className="bg-green-1 h-fit w-full rounded-t-lg flex relative pt-10 px-4 gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute right-4 top-4">
                <AiOutlineClose
                  size={21}
                  className="cursor-pointer"
                  onClick={() => {
                    document.body.style.overflow = "auto";
                    localStorage.setItem("offersOpened", true);
                    setShowLendHeader(false);
                  }}
                />
              </div>
              <div className="whitespace-nowrap">
                <h5 className="text-sm text-green-2">Make loan offers on</h5>
                <p className="text-sm font-semibold text-green">
                  NFT Collection
                </p>
                <img
                  src={"/images/offerHeader.png"}
                  alt=""
                  className="h-32 object-contain w-auto"
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
        serachString={serachString}
        setSerachString={setSerachString}
        pagename={pagename}
      />
      <div>
        {loading ? (
          <Loader />
        ) : !isConnected ? (
          <div className="h-24 w-full flex items-center justify-center text-jet-black ">
            <h2 className="text-xl text-green-4">
              Connect your wallet to view your listed offers
            </h2>
          </div>
        ) : (
          <Table
            headers={headers}
            rows={displayData}
            nft={displayData1}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>

      {modalType === "edit" && <EditModal />}
      {modalType === "claim" && <ClaimModal />}
    </div>
  );
};

export default Offers;
