import { ChainContext } from "@/context/ChainContext";
import { ModalContext } from "@/context/ModalContext";
import React, { useContext, useState } from "react";
import NFTSlider from "../components/NFTSlider/NFTSlider";
import { UserNftContext } from "@/context/UserNftContext";
import Loader from "@/components/Reusables/loan/Loader";

const RequestNFTModal = ({
  loading,
  amount,
  setAmount,
  duration,
  setDuration,
  interestRate,
  setInterestRate,
  selected,
  setSelected,
}) => {
  const { borrowData } = useContext(ModalContext);

  const { chainDetail } = useContext(ChainContext);

  const { fetching } = useContext(UserNftContext);

  return (
    <>
      {loading && fetching ? (
        <Loader />
      ) : (
        <div className="flex max-h-[490px] overflow-auto pb-24 pt-4 justify-center items-center flex-col">
          <NFTSlider selected={selected} setSelected={setSelected} />
          <div className="w-full h-fit p-2 gap-4 flex flex-col">
            <div className="w-full flex bg-field-bg-3 items-center p-4 rounded-md">
              <div className="w-full flex justify-between items-center grow">
                <p className="text-green text-left text-sm font-bold">
                  {chainDetail?.currency_symbol}
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e?.target?.value)}
                    className="grow h-8 outline-none ml-2 text-xs placeholder:text-xs border-none bg-transparent focus:outline-none focus:border-none"
                    placeholder="Enter amount here ..."
                  />
                </p>
              </div>
              <p className="text-poppins text-2xs w-fit text-white font-normal whitespace-nowrap">
                Borrow
              </p>
            </div>

            <div className="w-full p-4 bg-field-bg-3 flex items-center justify-between text-2xs text-table-header-text ">
              <h5 className="text-xs">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e?.target?.value)}
                  className="w-full h-8 outline-none ml-2 text-2xs placeholder:text-2xs border-none bg-transparent focus:outline-none focus:border-none"
                  placeholder="Enter duration here ..."
                />
              </h5>
              <p>Duration</p>
            </div>
            <div className="w-full p-4 bg-field-bg-3 flex items-center justify-between text-xs text-table-header-text ">
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e?.target?.value)}
                className="w-full h-8 outline-none ml-2 text-2xs placeholder:text-2xs border-none bg-transparent focus:outline-none focus:border-none"
                placeholder="Enter interest rate here ..."
              />
              <p>Interest Rate</p>
            </div>

            <div className="flex items-center p-4 justify-between bg-field-bg-3">
              <p className="text-green flex flex-col text-left text-sm font-bold">
                <span>
                  {chainDetail?.currency_symbol}
                  <span className="mx-1">{borrowData?.bestOffer}</span>
                </span>
                <span className="text-2xs text-table-row-subscript ml-1">
                  {borrowData?.interest_rate?.toFixed(3)}% interest
                </span>
              </p>
              <p className="text-2xs text-table-header-text">
                Total loan amount
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestNFTModal;
