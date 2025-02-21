"use client";
import Image from "next/image";
import React, { useContext } from "react";
import { ChainContext } from "@/context/ChainContext";
import { useRouter } from "next/router";
import HapeImage from "../../../../public/images/hape.png";

const MobileCard = ({ data }) => {
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const router = useRouter();

  return (
    <div
      className="h-fit grow bg-black-6 text-white text-2xs rounded-lg !font-numans p-3"
      style={{ boxShadow: "0px 4px 0px 0px #252525" }}
    >
      <div className="w-full h-fit pb-2 flex items-center gap-4 border-b-2 border-solid border-black-7">
        <Image
          src={data?.image ?? HapeImage}
          height={20}
          width={20}
          className="rounded-full"
          alt="data img"
        />
        <p className="text-2xs">{data?.name}</p>
      </div>
      <div className="border-b-2 border-solid border-black-7 w-full">
        <div className="py-2 flex items-center justify-between w-full">
          <h5 className="text-grayscale">Listed NFT</h5>
          <p>{data?.total_list}</p>
        </div>
        <div className="py-2 flex items-center justify-between w-full">
          <h5 className="text-grayscale">Total Rented</h5>
          <p>{data?.active_rent}</p>
        </div>
        <div className="py-2 flex items-center justify-between w-full">
          <h5 className="text-grayscale">Floor Price</h5>
          <p>
            {data?.floor} {chainDetail?.currency_symbol}
          </p>
        </div>
      </div>
      <div className="py-2 flex items-center justify-between w-full">
        <h5 className="text-green-3 flex flex-col underline cursor-pointer">
          {data?.active_list} available <span>for rent</span>
        </h5>
        <button
          className="h-fit w-fit px-4 py-2 bg-gray-1 rounded-md"
          style={{ boxShadow: "0px 1px 0px 0px #FFFFFF26" }}
          onClick={() => {
            const formattedName = data?.name
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-");
            router.push(`/${selectedChain}/rent/${formattedName}/marketplace`);
            // Mixpanel.track("home_rentmkt_collection", {
            //   collectionName: data?.name,
            // });
          }}
        >
          Explore
        </button>
      </div>
    </div>
  );
};

export default MobileCard;
