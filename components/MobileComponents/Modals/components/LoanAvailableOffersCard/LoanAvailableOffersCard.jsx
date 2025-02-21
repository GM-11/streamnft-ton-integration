import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChainContext } from "@/context/ChainContext";
import { ModalContext } from "@/context/ModalContext";

export const LoanAvailableOffersCard = ({
  liquidity,
  availableNFTs = 0,
  totalNFTs = 0,
  bestOffer,
  lastLoanTaken,
  lastBidAmount,
  apy,
  interestAmount, // for borrow page
  interestRate, // for borrow page
  setInterestState, // for borrow page
  setBorrowAmountState, // for borrow page
  setActualAmountBorrowed, // for borrow page
  duration,
  setSelectedTab,
  setApyState,
  setDurationState,
  offers,
  mainData,
  setIsLendOpenedFromOffersCard,
}) => {
  const { selectedChain, chainDetail } = useContext(ChainContext);

  const { setBorrowData, setLendData } = useContext(ModalContext);

  const router = useRouter();

  const [interestRateComputed, setInterestRateComputed] = useState("");

  useEffect(() => {
    if (router.pathname?.includes("borrow") && interestAmount && interestRate) {
      setInterestRateComputed(
        (chainDetail?.chain_id=="solana"
          ? interestAmount
          : chainDetail?.chain_id == "296"
          ? Number(interestAmount) / Math.pow(10, chainDetail?.currency_decimal)
          : ""
        )?.toFixed(3)
      );
    }
  }, [router]);

  return (
    <>
      <article class="rounded-xl w-full h-fit border border-gray-700 p-2 bg-gray-5 ">
        <div className="w-full flex items-center">
          {bestOffer ? (
            <>
              <div className="min-w-[125px] max-w-[125px]">
                <span className="block !text-sm font-normal">
                  {`${bestOffer}`}
                  <img
                    src={chainDetail?.currency_image_url??"https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"}
                    alt="Chain symbol"
                    className="ml-2 inline"
                    height={chainDetail?.chain_id=="solana" ? 15 : 25}
                    width={20}
                  />
                </span>
                <span className="font-medium !text-2xs">
                  {lastLoanTaken}
                  <span className="ml-1">last loan</span>
                </span>
              </div>
            </>
          ) : (
            <span className="font-medium min-w-[125px] max-w-[125px] text-2xs justify-center">
              Awaiting Lenders
              <span className="block mt-2 font-normal text-left text-white">
                <span className="font-medium">
                  {lastBidAmount / Math.pow(10, chainDetail?.currency_decimal)}{" "}
                  last loan taken
                </span>
              </span>
            </span>
          )}
          <h5 className="min-w-[50px] max-w-[50px] text-2xs">
            {router.pathname?.includes("borrow") ? interestRateComputed : apy} %
          </h5>
          <h5 className="min-w-[50px] max-w-[50px] text-2xs">
            {duration.toString()?.length > 3 ? duration?.toFixed(2) : duration}{" "}
            D
          </h5>
          <h5
            className="min-w-[75px] max-w-[75px] text-2xs cursor-pointer text-green underline capitalize font-semibold"
            onClick={() => {
              if (router.pathname.includes("borrow")) {
                setBorrowData(mainData);
                setSelectedTab("borrow");
              } else {
                setLendData(mainData);
                setSelectedTab("lend");
              }
              setIsLendOpenedFromOffersCard(true);
            }}
          >
            {router.pathname.includes("borrow") ? "Borrow" : "lend Now"}
          </h5>
        </div>
      </article>
    </>
  );
};
