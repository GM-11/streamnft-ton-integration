"use client";
import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import discordIcon from "../../public/images/discord.svg";
import twitterIcon from "../../public/images/twitter.svg";
import { UserNftContext } from "@/context/UserNftContext";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import HapeImage from "../../public/images/hape.png";

const Header = ({ data, userTransacted }) => {
  const [collection, setCollection] = useState({
    image: "",
    name: "",
    description: "",
    totalList: "",
    totalRent: "",
    total_volume: "",
  });
  const router = useRouter();
  const { manage } = useContext(UserNftContext);
  const { chainDetail, collections } = useContext(ChainContext);

  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleViewMore = () => {
    setShowFullDescription(!showFullDescription);
  };

  const symbol = router.query;

  async function getCollection() {
    const _collection = collections.filter((obj) => {
      const modifyObjName = obj.name.toLowerCase().replace(/[\s-]/g, "");
      const modifySymbol = symbol.symbol.toLowerCase().replace(/[\s-]/g, "");

      return modifyObjName === modifySymbol;
    });
    if (!(_collection === "undefined" || _collection.length === 0)) {
      setCollection(_collection[0]);
    }
  }

  useEffect(() => {
    if (!data) {
      getCollection();
    } else {
      setCollection(data);
    }
  }, [userTransacted, collections, manage]);

  // Check if the current pathname includes "mart"
  const isMartPath = router.pathname.includes("discover");

  return (
    <div className="p-0 md:p-10 h-fit">
      <div className="flex h-fit py-8 items-start text-jet-black bg-green-13 justify-start m-0 md:mt-2.5 md:mb-4 w-full max-w-[100vw] gap-6 px-2 pl-6 p-4 rounded-xl">
        <div className="w-fit h-full">
          {collection && collection?.image_url && (
            <Image
              src={collection?.image_url ? collection.image_url : HapeImage}
              alt="Collection Image"
              width={200}
              height={70}
              className="min-h-16 max-h-16 min-w-16 max-w-16 md:min-h-24 md:max-h-24 md:min-w-24 md:max-w-24 object-cover object-center items-center rounded-full"
            />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xs md:text-[20px] font-semibold">
              {collection.name}
            </h1>
            <div className="h-6 w-fit flex my-0 ml-6">
              <div className="h-6 w-6 flex items-center justify-center bg-gray-1 rounded-full border border-solid border-grayscale-5 cursor-pointer mr-4 transition-all duration-300 hover:bg-green-4 hover:scale-110 ">
                <Image src={twitterIcon} alt="twitter" />
              </div>
              <div className="h-6 w-6 flex items-center justify-center bg-gray-1 rounded-full border border-solid border-grayscale-5 cursor-pointer mr-4 transition-all duration-300 hover:bg-green-4 hover:scale-110">
                <Image src={discordIcon} alt="discord" />
              </div>
            </div>
          </div>
          <p className="hidden md:block text-xs pb-4 leading-5 pr-24 lg:pr-56  text-justify">
            {showFullDescription ||
            (collection.description && collection.description.length <= 136)
              ? collection.description
              : `${collection.description.slice(0, 316)}... `}
            {collection.description.length > 316 && (
              <span
                className="view-more cursor-pointer ml-4 font-bold text-green-4"
                onClick={handleViewMore}
              >
                {showFullDescription ? "View Less" : "View More"}
              </span>
            )}
          </p>
          <div className="h-[70px] w-full flex items-center justify-start gap-3 md:gap-6">
            <div className="w-fit">
              <h4 className="text-xs sm:text-base lg:text-xl font-semibold  whitespace-nowrap">
                {collection?.floor} {chainDetail?.currency_symbol}
              </h4>
              <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                Floor Price
              </h5>
            </div>

            <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>

            {/* Conditionally render Listed NFT and Total Rentals OR Total Volume */}
            {!isMartPath ? (
              <>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    {collection?.active_list}
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    Listed NFT
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    {collection?.active_rent}
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    Total Rentals
                  </h5>
                </div>
              </>
            ) : (
              <>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    --
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    Best Offer
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    --
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    24h Volume
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    --
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    24h Vol
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    --
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    24h Sales
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    {(
                      Number(collection?.total_volume) /
                      Math.pow(10, chainDetail?.currency_decimal)
                    )?.toFixed(2)}{" "}
                    {chainDetail?.currency_symbol}
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    All Volume
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    {collection?.total_list}
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    Listed
                  </h5>
                </div>
                <div className="h-9 w-0.5 rotate-[15deg] bg-bluish-grey"></div>
                <div className="w-fit">
                  <h4 className="text-xs sm:text-base lg:text-xl font-semibold ">
                    --
                  </h4>
                  <h5 className="text-2xs md:text-xs  whitespace-nowrap">
                    Owners
                  </h5>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
