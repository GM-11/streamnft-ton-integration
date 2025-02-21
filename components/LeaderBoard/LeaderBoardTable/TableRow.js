import Image from "next/image";
import RewardImage from "../../../public/images/rewardIcon.png";
import { CopyIcon } from "../../Reusables/utility/Icons";
import React, { useState } from "react";
import { toast } from "react-toastify";

const TableRow = ({ data }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.dismiss();
      toast.success("Wallet address copied to clipboard");
    } catch (error) {}
  };


  console.log({data})
  return (
    <>
      {data?.length < 0 ? (
        <h5>No Data Found</h5>
      ) : (
        data?.map((el, index) => (
          <div
            className={`w-full relative overflow-hidden flex items-center transition-all duration-300 cursor-pointer mb-4 p-4 rounded-md border-b-2 border-solid ${
              selectedRow === index
                ? "bg-green-8 border-[#C0F2CB]"
                : "bg-grayscale-11 border-transparent"
            }`}
            // onClick={() => setSelectedRow(index)}
            key={index}
          >
            <div className="w-20 sm:w-36">
              <h5 className="text-sm text-grayscale-24">{index + 1}</h5>
            </div>
            <div className="grow max-w-sm flex gap-2 items-center justify-start sm:justify-center">
              <h5 className="text-sm text-grayscale-24 flex items-center gap-2">
                {el?.address?.slice(0, 8)}...{el?.address?.slice(-8)}
                <CopyIcon
                  className="text-green-5 cursor-pointer"
                  size={14}
                  onClick={() => copyToClipboard(el?.address)}
                />
                {/* {el?.address} */}
              </h5>
            </div>
            <div className="w-24 sm:grow items-center justify-start sm:justify-center flex">
              <div
                className={`rounded-md max-w-[90px] px-3 py-1 flex items-center ${
                  selectedRow === el?.place ? "bg-[#1F7634]" : "bg-grayscale-23"
                } gap-2`}
              >
                <Image
                  src={RewardImage}
                  className="h-5 w-5 rounded-full object-cover"
                  alt="profile_image"
                  height={64}
                  width={64}
                />
                <h5>{el?.score}</h5>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default TableRow;
