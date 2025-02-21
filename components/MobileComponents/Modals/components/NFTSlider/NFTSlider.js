import React, { useContext, useMemo, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { UserNftContext } from "@/context/UserNftContext";
import { AccountId } from "@hashgraph/sdk";
import { ModalContext } from "@/context/ModalContext";
import { MdExpandLess } from "react-icons/md";
import { ChainContext } from "@/context/ChainContext";

const NFTSlider = ({ selected, setSelected }) => {
  const images = [
    "https://via.placeholder.com/500",
    "https://via.placeholder.com/600",
    "https://via.placeholder.com/700",
    "https://via.placeholder.com/800",
    "https://via.placeholder.com/900",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const { userNfts } = useContext(UserNftContext);

  const { borrowData } = useContext(ModalContext);

  const { selectedChain } = useContext(ChainContext);

  const nextSlide = () => {
    const newIndex = (currentIndex + 2) % processedNftData.length;
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex =
      (currentIndex - 2 + processedNftData.length) % processedNftData.length;
    setCurrentIndex(newIndex);
  };

  const processedNftData = useMemo(() => {
    return userNfts?.[0]?.tokenId?.map((item, index) => {
      return (
        <div
          className="min-h-fit min-w-[84px] max-w-[84px]"
          id={item.account_id}
          onClick={() => {
            setSelected(item);
          }}
          title={item.name}
          key={index}
        >
          <img
            src={item.image}
            className={`h-[128px] w-[128px] object-cover rounded-xl ${
              selected.tokenId === item.tokenId
                ? "border-green border-4"
                : "border-4x"
            }`}
          />
          <p className="font-numans text-white text-base mt-2 text-center">
            Token #{Number(item.tokenId)}
          </p>
        </div>
      );
    });
  }, [userNfts, AccountId, borrowData, currentIndex, selected, selectedChain]);

  return (
    <div className="flex items-center w-full relative px-4 gap-4">
      {processedNftData?.length > 0 ? (
        <>
          <button
            onClick={prevSlide}
            className="h-fit w-fit p-0 rounded-full border border-solid border-white"
          >
            <MdExpandLess size={18} color="#fff" className="-rotate-90" />
          </button>
          <div className="grow flex items-center justify-center">
            <div className="grow max-w-[200px] overflow-hidden">
              <div
                className="overflow-hidden flex min-w-fit transition-transform gap-4 duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}px)` }}
              >
                {processedNftData}
              </div>
            </div>
          </div>
          <button
            onClick={nextSlide}
            className="h-fit w-fit p-0 rounded-full border border-solid border-white"
          >
            <MdExpandLess size={18} color="#fff" className="rotate-90" />
          </button>
        </>
      ) : (
        <div className="grow my-4">No NFTs Found</div>
      )}
    </div>
  );
};

export default NFTSlider;
