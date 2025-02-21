import React, { useMemo, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { MdExpandLess } from "react-icons/md";
import { useRouter } from "next/router";

const NFTSlider = ({ selectedNft, setSelectedNft, tokens }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    const newIndex = (currentIndex + 2) % tokens.length;
    setCurrentIndex(newIndex);
  };

  const prevSlide = () => {
    const newIndex = (currentIndex - 2 + tokens.length) % tokens.length;
    setCurrentIndex(newIndex);
  };

  return (
    <>
      {/*  Desktop Component */}
      <div className="hidden md:flex max-w-full h-fit max-h-[180px] py-4 items-start gap-8 overflow-x-auto whitespace-nowrap">
        {tokens?.length < 0 ? (
          <div className="min-h-fit min-w-fit">
            <h4 className="font-numans font-semibold text-xl mb-2 text-white">
              No NFTs Found.
            </h4>
          </div>
        ) : (
          tokens?.map((item, index) => {
            return (
              <div
                key={index}
                className="min-h-fit min-w-fit flex overflow-x-auto"
              >
                <div
                  className="min-h-fit min-w-fit mr-4 mb-4"
                  onClick={() => {
                    setSelectedNft(item);
                  }}
                >
                  <div className="relative h-[96px] w-[96px]">
                    <img
                      src={item.image}
                      className={`min-h-[96px] min-w-[96px] max-h-[96px] max-w-[96px] object-cover rounded-xl  ${
                        selectedNft?.tokenId === item.tokenId
                          ? "border-green border-4"
                          : "border-4x"
                      }`}
                    />
                  </div>
                  <p className="font-numans text-white text-base mt-2 text-center">
                    Token #{Number(item.tokenId)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile component */}
      <div className="flex md:hidden items-center w-full relative px-4 gap-4">
        {tokens?.length > 0 ? (
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
                  {tokens?.map((item, index) => {
                    return (
                      <div
                        className="min-h-fit min-w-[84px] max-w-[84px]"
                        id={item.account_id}
                        onClick={() => {
                          setSelectedNft(item);
                        }}
                        title={item.name}
                        key={index}
                      >
                        <img
                          src={item.image}
                          className={`h-[96px] w-[96px] object-cover rounded-xl ${
                            selectedNft.tokenId === item.tokenId
                              ? "border-green border-4"
                              : "border-4x"
                          }`}
                        />
                        <p className="font-numans text-white text-xs mt-2 text-center">
                          Token #{Number(item.tokenId)}
                        </p>
                      </div>
                    );
                  })}
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
    </>
  );
};

export default NFTSlider;
