import Dropdown2 from "@/components/Reusables/loan/Dropdown/Dropdown2";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { LoanAvailableOffersCard } from "../components/LoanAvailableOffersCard/LoanAvailableOffersCard";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import ListingCard from "../components/ListingCard/ListingCard";
import { Button2 } from "@/components/MobileComponents/Button";
import { AccountId } from "@hashgraph/sdk";
import { HederaContext } from "@/context/HederaContext";
import Loader from "@/components/Reusables/loan/Loader";

const OffersModal = ({
  loading,
  availableDurations,
  availableDurationOptions,
  handelRequestModelOpen,
  rowData,
  selectedDays,
  setFilter,
  setIsLendOpenedFromOffersCard,
  setSelectedTab,
}) => {
  const [selectedOffer, setSelectedOffer] = useState("offer");
  const router = useRouter();
  const { nftPoolData } = useContext(PoolManagerContext);
  const { accountId } = useContext(HederaContext);

  const hashconnectData = JSON.parse(localStorage.getItem("hashconnectData"));

  const [initializer1, setInitializer1] = useState("0x");

  useEffect(() => {
    if (
      hashconnectData &&
      hashconnectData.pairingData &&
      hashconnectData.pairingData.length > 0
    ) {
      const length = hashconnectData.pairingData.length;
      const accountIds = hashconnectData.pairingData[length - 1]?.accountIds;

      if (accountIds && accountIds.length > 0) {
        const firstAccountId = accountIds[0];

        if (firstAccountId) {
          setInitializer1(
            "0x" +
              AccountId.fromString(firstAccountId)
                .toSolidityAddress()
                .toString()
          );
        }
      }
    }
  }, [hashconnectData, AccountId]);

  const initializer = useMemo(() => {
    accountId
      ? "0x" + AccountId.fromString(accountId).toSolidityAddress().toString()
      : initializer1;
  }, [accountId, initializer1]);

  const activeNftPools = useMemo(() => {
    const finalArray = [];

    const activeNfts = nftPoolData.filter((el) => el?.active === true);

    for (const item of activeNfts) {
      if (
        router.pathname.includes("borrow") &&
        item?.initializerKey?.toLowerCase() === initializer?.toLowerCase()
      ) {
        finalArray.push(item);
      } else if (!router.pathname.includes("borrow")) {
        finalArray.push(item);
      }
    }
    return finalArray;
  }, [nftPoolData, initializer, router]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-[500px] max-h-[500px] flex flex-col">
          <div className="w-full flex justify-between items-center">
            <div className="h-fit w-fit flex p-1 bg-black-2 rounded-md">
              <div
                className={`h-fit w-fit p-2 text-white rounded-md cursor-pointer transition-all duration-300 text-2xs ${
                  selectedOffer === "offer" ? "bg-black-3" : "bg-transparent"
                }`}
                onClick={() => setSelectedOffer("offer")}
              >
                Offers
              </div>
              <div
                className={`h-fit w-fit p-2 text-white rounded-md cursor-pointer transition-all duration-300 text-2xs ${
                  selectedOffer === "listing" ? "bg-black-3" : "bg-transparent"
                }`}
                onClick={() => setSelectedOffer("listing")}
              >
                NFT listing
              </div>
            </div>
            <div className="w-[120px] h-fit">
              {selectedOffer === "offer" ? (
                <Dropdown2
                  items={availableDurationOptions}
                  onSelect={(e) => {
                    setFilter(e);
                  }}
                  retainedValue={availableDurationOptions[0]}
                />
              ) : (
                <>
                  {router.pathname.includes("borrow") && (
                    <Button2
                      classes="text-2xs w-full flex items-center justify-center"
                      onClick={handelRequestModelOpen}
                    >
                      Place Offer
                    </Button2>
                  )}
                </>
              )}
            </div>
          </div>

          {selectedOffer === "offer" ? (
            <div
              className={`overflow-y-auto w-full m-2 flex flex-col gap-y-4 h-fit max-h-[400px] pb-12 no-scrollbar snap-y snap-mandatory no-scrollbar`}
            >
              <div className="w-full flex items-center">
                <h5 className="min-w-[125px] max-w-[125px] text-2xs">
                  Best Offer
                </h5>
                <h5 className="min-w-[50px] max-w-[50px] text-2xs">
                  {router.pathname?.includes("borrow")
                    ? "Interest rate"
                    : "APY"}
                </h5>
                <h5 className="min-w-[50px] max-w-[50px] text-2xs">Duration</h5>
                <h5 className="min-w-[75px] max-w-[75px] text-2xs"></h5>
              </div>
              {rowData
                .filter((item) => {
                  return (
                    item.loanDurationInMinutes ===
                      availableDurations[selectedDays] || selectedDays === -1
                  );
                })
                .map((item, index) => {
                  return (
                    <section key={index} className={` snap-center`}>
                      {router.pathname?.includes("borrow") ? (
                        <LoanAvailableOffersCard
                          mainData={item}
                          setActualAmountBorrowed={() => {}}
                          setInterestState={() => {}}
                          setBorrowAmountState={() => {}}
                          totalNFTs={item.offers}
                          interestAmount={item?.interest}
                          interestRate={item?.interest_rate}
                          offers={item.offers}
                          lastBidAmount={item.lastBidAmount}
                          setSelectedTab={setSelectedTab}
                          setDurationState={() => {}}
                          duration={item.loanDurationInMinutes / 1440}
                          availableNFTs={item.offers - item.offersTaken}
                          liquidity={item.liquidity}
                          bestOffer={item.bestOffer}
                          lastLoanTaken={item.lastLoan}
                          setApyState={() => {}}
                          apy={item?.poolPDA?.apy}
                          setIsLendOpenedFromOffersCard={
                            setIsLendOpenedFromOffersCard
                          }
                        />
                      ) : (
                        <LoanAvailableOffersCard
                          mainData={item}
                          totalNFTs={item.offers}
                          offers={item.offers}
                          lastBidAmount={item.lastBidAmount}
                          setSelectedTab={setSelectedTab}
                          setApyState={() => {}}
                          setDurationState={() => {}}
                          apy={item.apy}
                          duration={item.loanDurationInMinutes / 1440}
                          availableNFTs={item.offers - item.offersTaken}
                          liquidity={item.liquidity}
                          bestOffer={item.bestOffer}
                          lastLoanTaken={item.lastLoan}
                          setIsLendOpenedFromOffersCard={
                            setIsLendOpenedFromOffersCard
                          }
                        />
                      )}
                    </section>
                  );
                })}
            </div>
          ) : (
            <div
              className={`overflow-y-auto w-full m-2 flex flex-col gap-y-4 h-fit max-h-[400px] pb-12 no-scrollbar snap-y snap-mandatory no-scrollbar`}
            >
              {activeNftPools?.length <= 0 ? (
                <h5 className="text-white text-center my-4">
                  No Listings Found
                </h5>
              ) : (
                activeNftPools?.map((nftPool, index) => {
                  return <ListingCard data={nftPool} />;
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OffersModal;
