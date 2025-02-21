import React, { useContext, useMemo } from "react";
import CardArrowImage from "../../../../public/images/card-arrow-right.svg";
import Image from "next/image";
import HapeImage from "../../../../public/images/hape.png";
import { utilityContext } from "@/context/UtilityContext";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import Link from "next/link";
import useMediaQuery from "@/hooks/useMediaQuery";
import htmlTruncate from "html-truncate";
import SmileysImage from "../../../../public/images/smileys.svg";
import MarketplaceCardIcon from "../../../../public/images/marketplace-icon.svg";

const CardGrid = (props) => {
  const { utilityData } = useContext(utilityContext);

  const sortedUtilityData = useMemo(() => {
    return utilityData
      .map((item) => ({
        ...item,
        entries:
          item.selectionType === "raffle"
            ? item?.raffle?.totalEntries
            : item?.winners?.length,
      }))
      .sort((a, b) => {
        if (a?.priority === 1 && b?.priority !== 1) {
          return -1; // a comes first
        }
        if (a?.priority !== 1 && b?.priority === 1) {
          return 1; // b comes first
        }

        if (
          a.selectionType === "first_come" &&
          b.selectionType !== "first_come"
        ) {
          return -1; // a comes first
        }
        if (
          a.selectionType !== "first_come" &&
          b.selectionType === "first_come"
        ) {
          return 1; // b comes first
        }

        return b.entries - a.entries;
      });
  }, [utilityData]);

  const { ref } = useHorizontalScroll();

  const isBigScreen = useMediaQuery;

  const capitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };

  const isUtilityLive = (date) => {
    const dateToCheck = new Date(date);
    const now = new Date();
    return dateToCheck > now;
  };

  const cardBgColors = [
    { bgColor: "bg-[#EDF1FE]", borderColor: "border-[#ACBBFF80]" },
    { bgColor: "bg-[#FDF8C2]", borderColor: "border-[#ACBBFF80]" },
    { bgColor: "bg-[#EBFBCA]", borderColor: "border-[#ACBBFF80]" },
    { bgColor: "bg-[#FDE1E1]", borderColor: "border-[#ACBBFF80]" },
    { bgColor: "bg-[#FEECD4]", borderColor: "border-[#ACBBFF80]" },
  ];

  return (
    <div
      ref={props?.for === "allUtility" ? null : ref}
      className={`h-fit w-full flex flex-wrap justify-start   ${
        props?.for !== "allUtility" && "w-full overflow-y-scroll scrollbar-hide"
      }`}
    >
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full !gap-3 pb-8">
        {props?.for === "SingleUtility"
          ? sortedUtilityData.slice(-5).map((item, index) => (
              <Link key={index} href={`/utility/${item.utilityId}`}>
                <div
                  key={index}
                  className="relative flex w-full max-w-[17rem] flex-col rounded-3xl p-2 bg-gray-1 mt-6"
                >
                  <div className="relative overflow-hidden text-green">
                    <div
                      className={`py-4 px-2 rounded-3xl h-56 flex items-center justify-center overflow-hidden ${
                        cardBgColors[index % cardBgColors.length]?.bgColor
                      }`}
                    >
                      <img
                        src={item?.image_url ?? HapeImage}
                        alt="collection img"
                        className={`h-32 object-cover w-full rounded-2xl border-4 border-solid ${
                          cardBgColors[index % cardBgColors.length]?.borderColor
                        }`}
                        onError={(e) => {
                          e.target.src = HapeImage;
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute bottom-0 w-full bg-black/50 rounded-b-3xl px-4 py-[3px] text-left">
                        <p className="text-2xs md:text-xs font-medium text-white">
                          Owner:{" "}
                          {!item?.provider
                            ? ""
                            : item?.provider?.slice(0, 4) +
                              "..." +
                              item?.provider?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="!absolute top-2 left-4 h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-full text-center align-middle   text-2xs font-medium  transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                      <span>
                        {props?.for === "allUtility" ? (
                          new Date(item?.raffle?.raffleStartTime).getTime() >
                          new Date().getTime() ? (
                            // Starting Soon
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 text-white   left-6 bg-[#3776FF] rounded whitespace-nowrap p-1 flex flex-row gap-1 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#8AC4FF" />
                              </svg>
                              Starting Soon
                            </span>
                          ) : new Date(item?.raffle?.raffleEndTime).getTime() >
                            new Date().getTime() ? (
                            // Ongoing
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 text-white left-10 bg-[#30b750] rounded whitespace-nowrap p-1 flex flex-row gap-1 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#8FE6A4" />
                              </svg>
                              Ends in{" "}
                              {(
                                (new Date(
                                  item?.raffle?.raffleEndTime
                                ).getTime() -
                                  new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                              ).toFixed(0)}{" "}
                              Days
                            </span>
                          ) : (
                            // Ended
                            <span
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 text-white left-4 ${
                                !item?.endDate || isUtilityLive(item?.endDate)
                                  ? "bg-green"
                                  : "bg-[#fa6f6f]"
                              } rounded whitespace-nowrap p-1 flex flex-row gap-1 items-center`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#FFC9C9" />
                              </svg>
                              {!item?.endDate || isUtilityLive(item?.endDate)
                                ? "Live"
                                : "Ended"}
                            </span>
                          )
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 pt-2 flex flex-col min-h-36 items-start justify-between py-2">
                    <h5 className="block text-xs md:text-base font-medium whitespace-nowrap text-white">
                      {capitalizeFirstLetter(
                        item.title
                          ? item.title.length > 25
                            ? item.title.slice(0, 25) + "..."
                            : item.title
                          : item.name
                      )}
                    </h5>

                    <div
                      dangerouslySetInnerHTML={{
                        __html: htmlTruncate(item?.description, 50),
                      }}
                      className="text-xs font-medium flex min-h-8 items-start justify-start text-[#7C7C7C]"
                    />

                    <div className="flex items-center gap-3 w-full border-t border-solid border-softGray pt-2">
                      <div className="min-h-10 max-h-10 min-w-10 max-w-10 flex items-center justify-center bg-green/15 rounded-full">
                        <Image
                          src={MarketplaceCardIcon}
                          alt="entries-icon"
                          className="h-4 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <h5 className="text-xs antialiased font-medium leading-snug tracking-normal text-white">
                          Total Entries
                        </h5>
                        <p className="text-base font-semibold">
                          {(item?.selectionType === "raffle"
                            ? item?.raffle?.totalEntries
                            : item?.winners?.length) ?? 0}
                        </p>
                      </div>
                      <Image
                        src={CardArrowImage}
                        alt="arrow-icon"
                        className="h-4 w-auto object-contain absolute bottom-7 right-4"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          : props?.for === "exploreUtility"
          ? props?.data?.map((item, index) => (
              <Link key={index} href={`/utility/explore/${item.collection}`}>
                <div
                  key={index}
                  className="relative flex w-full grow flex-col rounded-3xl bg-grayscale-30 overflow-hidden mt-4"
                >
                  <div className="relative overflow-hidden">
                    <div className="h-fit w-full relative">
                      <img
                        src={item?.collection_image}
                        alt="collection img"
                        className="h-32 md:h-48 w-full object-cover"
                        height={256}
                        width={256}
                      />
                      <div className="h-6 w-full md:hidden absolute flex items-center px-2 bottom-0 text-green-10 text-2xs">
                        {item?.nft_count > 0 &&
                          `${item.nft_count} NFTs available`}
                      </div>
                    </div>

                    <div className="!absolute bg-black/40 px-3 py-1 top-2 left-2 h-fit w-fit select-none rounded text-white text-center align-middle   text-2xs font-medium  transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                      <span>NFT Collection</span>
                    </div>
                  </div>
                  <div className="flex flex-row items-end justify-between p-4">
                    <div className="min-h-[64px] flex flex-col items-start gap-2">
                      <h5 className="block text-sm font-medium break-words text-smoke min-h-8">
                        {capitalizeFirstLetter(
                          item.collection_name
                            ? isBigScreen
                              ? item.collection_name.length > 25
                                ? item.collection_name.slice(0, 25) + "..."
                                : item.collection_name
                              : item.collection_name.length > 50
                              ? item.collection_name.slice(0, 50) + "..."
                              : item.collection_name
                            : "Free Giveaway : StreamNFT Utility token".slice(
                                0,
                                25
                              ) + "..."
                        )}
                      </h5>
                      <div className="w-full flex items-center gap-3">
                        <div className="bg-[#00bb34]/15 h-10 w-10 rounded-full flex items-center justify-center">
                          <Image
                            src={SmileysImage}
                            alt="smiley-image"
                            className="h-6 w-auto object-contain"
                          />
                        </div>
                        <div className="flex flex-col items-start">
                          <h5 className="text-sm font-medium leading-snug tracking-normal text-smoke">
                            {item.utility_count} Rewards Available
                          </h5>
                          <p className="hidden font-medium md:block text-2xs text-right my-1 md:m-0 text-green-4    ">
                            {item?.nft_count > 0 &&
                              `${item.nft_count} NFTs available`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          : sortedUtilityData?.map((item, index) => (
              <Link key={index} href={`/utility/${item.utilityId}`}>
                <div
                  key={index}
                  className="relative flex w-full max-w-[17rem] flex-col rounded-3xl p-2 bg-gray-1 mt-6"
                >
                  <div className="relative overflow-hidden text-green">
                    <div
                      className={`py-4 px-2 rounded-3xl h-56 flex items-center justify-center overflow-hidden ${
                        cardBgColors[index % cardBgColors.length]?.bgColor
                      }`}
                    >
                      <img
                        src={item?.image_url ?? HapeImage}
                        alt="collection img"
                        className={`h-32 object-cover w-full rounded-2xl border-4 border-solid ${
                          cardBgColors[index % cardBgColors.length]?.borderColor
                        }`}
                        onError={(e) => {
                          e.target.src = HapeImage;
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute bottom-0 w-full bg-black/50 rounded-b-3xl px-4 py-[3px] text-left">
                        <p className="text-2xs md:text-xs font-medium text-white">
                          Owner:{" "}
                          {!item?.provider
                            ? ""
                            : item?.provider?.slice(0, 4) +
                              "..." +
                              item?.provider?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="!absolute top-2 left-4 h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-full text-center align-middle   text-2xs font-medium  transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                      <span>
                        {props?.for === "allUtility" ? (
                          new Date(item?.raffle?.raffleStartTime).getTime() >
                          new Date().getTime() ? (
                            // Starting Soon
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 text-jet-black left-6 bg-[#3776FF] rounded whitespace-nowrap p-1 flex flex-row gap-1 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#8AC4FF" />
                              </svg>
                              Starting Soon
                            </span>
                          ) : new Date(item?.raffle?.raffleEndTime).getTime() >
                            new Date().getTime() ? (
                            // Ongoing
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 text-jet-black left-10 bg-[#30b750] rounded whitespace-nowrap p-1 flex flex-row gap-1 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#8FE6A4" />
                              </svg>
                              Ends in{" "}
                              {(
                                (new Date(
                                  item?.raffle?.raffleEndTime
                                ).getTime() -
                                  new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                              ).toFixed(0)}{" "}
                              Days
                            </span>
                          ) : (
                            // Ended
                            <span
                              className={`absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 text-white left-4 ${
                                !item?.endDate || isUtilityLive(item?.endDate)
                                  ? "bg-green"
                                  : "bg-[#fa6f6f]"
                              } rounded whitespace-nowrap p-1 flex flex-row gap-1 items-center`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="4"
                                height="4"
                                viewBox="0 0 4 4"
                                fill="none"
                              >
                                <circle cx="2" cy="2" r="2" fill="#FFC9C9" />
                              </svg>
                              {!item?.endDate || isUtilityLive(item?.endDate)
                                ? "Live"
                                : "Ended"}
                            </span>
                          )
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 pt-2 flex flex-col min-h-36 items-start justify-between py-2">
                    <h5 className="block text-xs md:text-base font-medium whitespace-nowrap text-smoke">
                      {capitalizeFirstLetter(
                        item.title
                          ? item.title.length > 22
                            ? item.title.slice(0, 22) + "..."
                            : item.title
                          : item.name
                      )}
                    </h5>

                    <div
                      dangerouslySetInnerHTML={{
                        __html: htmlTruncate(item?.description, 50),
                      }}
                      className="text-xs font-medium flex min-h-8 items-start justify-start text-[#7C7C7C]"
                    />

                    <div className="flex items-center gap-3 w-full border-t border-solid border-softGray pt-2">
                      <div className="min-h-10 max-h-10 min-w-10 max-w-10 flex items-center justify-center bg-green/15 rounded-full">
                        <Image
                          src={MarketplaceCardIcon}
                          alt="entries-icon"
                          className="h-4 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <h5 className="text-xs antialiased font-medium leading-snug tracking-normal text-smoke">
                          Total Entries
                        </h5>
                        <p className="text-base font-semibold">
                          {(item?.selectionType === "raffle"
                            ? item?.raffle?.totalEntries
                            : item?.winners?.length) ?? 0}
                        </p>
                      </div>
                      <Image
                        src={CardArrowImage}
                        alt="arrow-icon"
                        className="h-4 w-auto object-contain absolute bottom-7 right-4"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default CardGrid;
