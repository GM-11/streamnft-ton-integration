import React from "react";
import MobileModal from "./MobileModal";
import twitterIcon from "../../../../public/images/twittergreen.svg";
import discordIcon from "../../../../public/images/discordgreen.svg";
import reportIcon from "../../../../public/images/report.svg";
import explorerIcon from "../../../../public/images/explore.svg";
import Image from "next/image";
import Button from "../Button";

const UtilityDetailsModal = ({
  openModal,
  setOpenModal,
  backendData,
  currentData,
}) => {
  return (
    <MobileModal openModal={openModal} setOpenModal={setOpenModal}>
      <div className="h-fit w-full p-4 flex items-start justify-start flex-col pb-8 relative">
        <h5 className="my-3">Raffle Details</h5>
        <img
          src={currentData?.image_url}
          alt="Collection Image"
          className="h-36 w-full rounded-md items-start object-cover"
        />
        <div className="pt-4">
          <div className="flex items-center justify-between !pb-3">
            <h1 className="max-w-2/3 text-left">{currentData?.title}</h1>
            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full border border-solid border-green flex items-center justify-center">
                <Image src={twitterIcon} alt="#" height={12} width={12} />
              </div>
              <div className="h-6 w-6 rounded-full border border-solid border-green flex items-center justify-center">
                <Image src={discordIcon} alt="#" height={12} width={12} />
              </div>
            </div>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: currentData?.description,
            }}
            className="mt-2 text-2xs text-left text-grayscale-10"
          />{" "}
          <div className="font-numans flex flex-wrap gap-4 mt-4">
            <div className="min-w-[45%] flex flex-col items-start">
              <div className="text-[#656565] font-numans whitespace-nowrap text-[12px]">
                Created By
              </div>
              <div className="text-white">
                {currentData?.provider.slice(0, 4) +
                  "..." +
                  currentData?.provider.slice(-3)}
              </div>
            </div>
            <div className="min-w-[45%] flex flex-col items-start">
              <div className="whitespace-nowrap text-[#656565] font-numans text-[12px]">
                Participants
              </div>
              <h4 className="font-semibold text-xs text-white ">
                {" "}
                {backendData?.participant_length ?? 0}
              </h4>
            </div>
            <div className="min-w-[45%] flex flex-col items-start">
              <div className="whitespace-nowrap text-[#656565] font-numans text-[12px]">
                Winners
              </div>
              <h4 className="font-semibold text-xs text-white">
                {currentData?.reward?.count ?? "--"}
              </h4>
            </div>
            <div className="min-w-[45%] flex flex-col items-start">
              <div className="whitespace-nowrap text-[#656565] font-numans text-[12px]">
                Price value
              </div>
              <h4 className="!text-xs">
                {currentData?.reward?.currency}
                <span className="ml-1">
                  {currentData?.reward?.estimatedValue}
                </span>
              </h4>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 h-[72px] w-full bg-black border-t-2 border-solid border-gray-2 flex items-center justify-between px-4">
        <Button
          buttonClasses={
            "!bg-red !shadow-none min-w-[47%] max-w-[47%] !text-2xs gap-4"
          }
        >
          <h5>Report</h5>
          <Image src={reportIcon} alt="#" height={16} width={16} />
        </Button>
        <Button
          buttonClasses={
            "!shadow-none min-w-[47%] max-w-[47%] !text-2xs !m-0 gap-4"
          }
        >
          <h5 className="whitespace-nowrap">Check on explorer</h5>
          <Image src={explorerIcon} alt="#" height={16} width={16} />
        </Button>
      </div>
    </MobileModal>
  );
};

export default UtilityDetailsModal;
