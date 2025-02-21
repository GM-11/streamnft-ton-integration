"use client";
import React, { useState, useMemo, useEffect, useContext } from "react";
import TagList from "../slider/Tag";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChainContext } from "@/context/ChainContext";

const Section1 = ({
  data,
  activeTag,
  setActiveTag,
  cardsData,
  selectedCategories,
  tagsArray,
}) => {
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    setCategoriesData(selectedCategories);
  }, [selectedCategories]);

  const router = useRouter();

  const { selectedChain } = useContext(ChainContext);

  return (
    <div className="bg-custom-gradient pt-12 h-auto ">
      <div className="mx-8 pt-2">
        <div className="flex justify-between items-center w-full">
          <TagList
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            tagsArray={tagsArray}
          />
        </div>
      </div>

      {cardsData.length > 0 && (
        <div className="w-full px-24 h-fit flex items-center justify-between relative">
          {/* {isScrolled && ( */}
          <button
            onClick={() => {
              const container = document.querySelector("#scroll-container");
              container.scrollBy({
                left: -316,
                behavior: "smooth",
              });
            }}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/30 rounded-full p-2 z-10"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {/* )} */}
          <div
            id="scroll-container"
            className="flex w-full flex-nowrap overflow-x-auto scrollbar-hide gap-4 mt-6"
          >
            {cardsData?.map((el) => {
              console.log(el);
              return (
                <div
                  className="h-[400px] grow min-w-[360px] max-w-[360px] rounded-[28px] relative bg-white-5 overflow-hidden cursor-pointer group"
                  onClick={() =>
                    router.push(
                      `/${selectedChain}/discover/${el?.name}/marketplace `
                    )
                  }
                >
                  <div className="h-full w-full absolute top-0 left-0 bg-black/20"></div>
                  <Image
                    src={el?.image}
                    height={500}
                    width={500}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                  <div className="absolute top-3 left-3 flex gap-3">
                    <div className="h-fit w-fit text-xs px-3 py-1.5 rounded-full bg-yellow-500 text-white font-semibold ">
                      Collection
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-0 px-4 w-full flex items-center justify-between max-w-full">
                    <div>
                      <h5 className="text-sm font-semibold text-white">
                        {el?.name}
                      </h5>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-fit bg-black/75 flex flex-col items-start p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h5 className="text-white text-center text-lg font-bold">
                      {el?.name}
                    </h5>
                    <p className="text-white text-xs font-medium leading-[21.84px] my-3">
                      {el?.description?.length > 100
                        ? `${el?.description?.slice(0, 100)}...`
                        : el?.description}
                    </p>
                    <button className="bg-green-4 w-full text-white text-xs font-semibold leading-[21.84px] px-4 py-2 rounded-full">
                      Explore all
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              const container = document.querySelector("#scroll-container");
              container.scrollBy({
                left: +316,
                behavior: "smooth",
              });
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/30 rounded-full p-2 z-10 rotate-180"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Section1;
