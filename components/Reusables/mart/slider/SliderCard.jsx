import React, { useContext, useState } from "react";
import Image from "next/image";
import wallet1 from "../../../../public/images/Wallet.svg";
import viewIcon from "../../../../public/images/view.png";
import metadataIcon from "../../../../public/images/metadata.png";
import { IoEllipsisVerticalOutline } from "react-icons/io5";
import { ChainContext } from "@/context/ChainContext";
import { ScrollHeaderContext } from "@/context/ScrollHeaderContext";
import { useRouter } from "next/router";

const RentCard = ({ data }) => {
  const [openHovermenu, setOpenHovermenu] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const router = useRouter();
  const { pathname } = router;
  const { setSelectedNft } = useContext(ScrollHeaderContext);
  const { chainDetail, selectedChain, setCollectionId } =
    useContext(ChainContext);

  const handleClick = (item) => {
    const formattedName = item.name.replace(/\s+/g, "-").replace(/-+/g, "-");

    let basePath;
    if (pathname.includes("launchpad")) {
      basePath = "launchpad";
    } else if (pathname.includes("rent")) {
      basePath = "rent";
    } else {
      basePath = "mart";
    }

    const destinationPath =
      basePath === "launchpad"
        ? `/${selectedChain}/${basePath}/${formattedName}/${item.token_address}`
        : `/${selectedChain}/${basePath}/${formattedName}/marketplace`;

    router.push(destinationPath);

    setCollectionId(item.token_address);
    setSelectedNft(item.name);

    analytics.track(`dapp_${basePath}_${item.name}`);
  };

  return (
    <div>
      <div
        className={`rent relative flex w-full bg-[#1D1D1D] max-w-[238px] flex-col rounded-lg cursor-pointer`} // Added cursor-pointer for visual feedback
        onClick={() => handleClick(data)} // Make the whole card clickable
      >
        <div className="relative mx-2 mt-2 overflow-hidden text-white shadow-lg rounded-xl">
          <Image
            src={data.image_url}
            alt={data.name}
            height={160}
            width={276}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 w-full h-full to-bg-black-10 bg-gradient-to-r from-transparent via-transparent to-black/60"></div>

          <div className="!absolute top-2 left-2 p-1 text-[10px] text-white font-normal bg-[#292929] flex flex-row items-center justify-between rounded-md font-numans gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5FD37A]"></div>
            <span>Collection</span>
          </div>
        </div>

        <div
          className="absolute h-[32px] w-[32px] right-3 rounded-md top-6 flex items-center justify-center bg-[#000000] opacity-50 hover:opacity-100 hover:bg-gradient-to-r from-[#30B750] to-[#30B750]"
          onMouseEnter={() => setOpenHovermenu(true)}
          onMouseLeave={() => setOpenHovermenu(false)}
        >
          <div className="h-full w-full flex items-center justify-center">
            <IoEllipsisVerticalOutline size={21} color="#fff" />
          </div>
          <div className="relative">
            <div
              style={{
                opacity: openHovermenu ? "1" : "0",
                visibility: openHovermenu ? "visible" : "hidden",
              }}
              className="absolute top-3 right-0 py-2 z-50"
            >
              <div className="bg-gradient-to-r from-[#30B750] to-[#30B750] hover:bg-green-1 hover:text-green-2 h-fit w-40 rounded-md z-999">
                <div className="py-2 px-2 flex gap-4 hover:bg-green-1 hover:text-green-2">
                  <Image src={viewIcon} alt="" className="h-6 w-6" />
                  <h5 className="text-white font-poppins hover:text-green-2">
                    View
                  </h5>
                </div>
                <div className="py-2 px-2 flex gap-4 hover:bg-green-1 hover:text-green-2">
                  <Image src={metadataIcon} alt="" className="h-6 w-6" />
                  <h5 className="text-white font-poppins hover:text-green-2">
                    Metadata
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rent-text py-1 px-2">
          <div className="flex items-center justify-between">
            <h5 className={`font-numans text-[16px] `}>
              {data.name.length > 14
                ? data.name.slice(0, 14) + "..."
                : data.name}
            </h5>
          </div>
          <p className={`font-poppins text-[10px] text-green-1`}>
            Token Address: {data.token_address.slice(0, 4)}...
            {data.token_address.slice(-4)}
          </p>
        </div>

        <div className="pt-3 pb-4 px-2 flex flex-row gap-2">
          <button
            className={`rent-button w-full flex-row flex items-center justify-between font-numans text-sm border text-center border-solid px-[0.775rem] py-3 rounded-md ${
              showPrice ? "bg-[#30B750]" : ""
            }`}
            type="button"
            onMouseEnter={() => setShowPrice(true)}
            onMouseLeave={() => setShowPrice(false)}
          >
            <span className="text-white text-center flex items-center">
              {`Floor: ${data?.floor} ${chainDetail?.currency_symbol}`}
            </span>
            <Image src={wallet1} alt="wallet" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentCard;
