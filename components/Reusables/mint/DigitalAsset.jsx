import React, { useContext } from "react";
import Link from "next/link";
import { ModalContext } from "@/context/ModalContext";
import { ChainContext } from "@/context/ChainContext";

const DigitalAsset = ({ isNav, modalData }) => {
  const { setOpenModal } = useContext(ModalContext);
  const { selectedChain } = useContext(ChainContext);

  const handleLinkClick = () => {
    setOpenModal(false);
  };

  return (
    <div className="grid grid-cols-4 gap-4 px-4">
      <Link
        href={`${
          process.env.NEXT_PUBLIC_BASE_URL ??
          "https://dapp-streamnft.vercel.app"
        }/${selectedChain}/loan/lend`}
        passHref
      >
        <div
          className="flex flex-col items-center p-4 bg-black-6-dark rounded-lg shadow-md cursor-pointer"
          onClick={handleLinkClick}
        >
          <img
            src="/images/loan_icon.svg"
            alt="Icon 1"
            className="w-8 h-8 mb-2"
          />
          <h3 className="text-lg font-semibold">Loan</h3>
        </div>
      </Link>

      <Link
        href={
          isNav
            ? `${
                process.env.NEXT_PUBLIC_BASE_URL ??
                "https://dapp-streamnft.vercel.app"
              }/explore/${modalData?.contract_address}`
            : `${
                process.env.NEXT_PUBLIC_BASE_URL ??
                "https://dapp-streamnft.vercel.app"
              }/explore`
        }
        passHref
      >
        <div
          className="flex flex-col items-center p-4 bg-black-6-dark rounded-lg shadow-md cursor-pointer"
          onClick={handleLinkClick}
        >
          <img
            src="/images/utility_icon.svg"
            alt="Icon 2"
            className="w-8 h-8 mb-2"
          />
          <h3 className="text-lg font-semibold">Perks</h3>
        </div>
      </Link>

      <Link
        href={
          isNav
            ? `${
                process.env.NEXT_PUBLIC_BASE_URL ??
                "https://dapp-streamnft.vercel.app"
              }/${selectedChain}/rent/${modalData?.name}/myassets`
            : `${
                process.env.NEXT_PUBLIC_BASE_URL ??
                "https://dapp-streamnft.vercel.app"
              }/${selectedChain}/rent`
        }
        passHref
      >
        <div
          className="flex flex-col items-center p-4 bg-black-6-dark rounded-lg shadow-md cursor-pointer"
          onClick={handleLinkClick}
        >
          <img
            src="/images/rent_icon.svg"
            alt="Icon 3"
            className="w-8 h-8 mb-2"
          />
          <h3 className="text-lg font-semibold">Library</h3>
        </div>
      </Link>

      <Link
        href={
          isNav
            ? `${
                process.env.NEXT_PUBLIC_BASE_URL ??
                "https://dapp-streamnft.vercel.app"
              }/${selectedChain}/discover/${modalData?.name}/myassets`
            : `${
                process.env.NEXT_PUBLIC_BASE_URL ??
                "https://dapp-streamnft.vercel.app"
              }/${selectedChain}/discover`
        }
        passHref
      >
        <div
          className="flex flex-col items-center p-4 bg-black-6-dark rounded-lg shadow-md cursor-pointer"
          onClick={handleLinkClick}
        >
          <img
            src="/images/mart_icon.svg"
            alt="Icon 4"
            className="w-8 h-8 mb-2"
          />
          <h3 className="text-lg font-semibold">Buy/Sell</h3>
        </div>
      </Link>
    </div>
  );
};

export default DigitalAsset;
