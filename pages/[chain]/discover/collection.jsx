import Image from "next/image";
import React, { useContext, useState } from "react";
import BookmarkIcon from "../../../public/images/bookmark.png";
import TrendingIconImage from "../../../public/images/trendingIcon.png";
import { ChainContext } from "@/context/ChainContext";

const collection = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [activeDateFilter, setActiveDateFilter] = useState("1D");

  const { collections, chainDetail } = useContext(ChainContext);

  return (
    <div className="p-12 pb-48">
      <div className="flex w-full items-center justify-between mb-6">
        <h2 className="text-5xl ">All Collections</h2>
        <div className="flex justify-end items-center gap-4">
          <div className="flex justify-start bg-jet-black w-fit p-1.5 rounded-full">
            <button
              className={`px-3 py-1.5 text-sm rounded-full mr-2 flex items-center gap-2 ${
                activeTab === "trending"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveTab("trending")}
            >
              Trending
              {activeTab === "trending" && (
                <Image
                  src={TrendingIconImage}
                  alt="#"
                  className="h-4 w-auto object-contain"
                />
              )}
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-full ${
                activeTab === "top"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveTab("top")}
            >
              Top
            </button>
          </div>
          <div className="flex justify-center space-x-4 bg-jet-black p-1.5 rounded-full">
            <button
              className={`px-3 py-1.5 text-sm rounded-full  ${
                activeDateFilter === "1D"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveDateFilter("1D")}
            >
              1D
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full text-jet-black ${
                activeDateFilter === "3D"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveDateFilter("3D")}
            >
              3D
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full text-jet-black ${
                activeDateFilter === "1M"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveDateFilter("1M")}
            >
              1M
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full text-jet-black ${
                activeDateFilter === "1Y"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveDateFilter("1Y")}
            >
              1Y
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full text -jet-black ${
                activeDateFilter === "all"
                  ? "bg-faded-green text-green-6"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveDateFilter("all")}
            >
              Watchlist
            </button>
          </div>
        </div>
      </div>
      <div
        className="relative rounded-3xl hidden md:block p-4 bg-jet-black overflow-x-auto border-[4px] border-solid"
        style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <div className="max-h-[550px] overflow-y-auto">
          <table className="w-full border-collapse text-sm text-left rtl:text-right !text-smoke p-2 ">
            <thead className="text-xs uppercase whitespace-nowrap w-full bg-gray-5 rounded-2xl">
              <th className="p-2.5 text-smoke font-semibold">Rank</th>
              <th className="p-2.5 text-smoke font-semibold">Collection</th>
              <th className="p-2.5 text-smoke font-semibold">Floor Price</th>
              <th className="p-2.5 text-smoke font-semibold">Volume</th>
              <th className="p-2.5 text-smoke font-semibold">% Change</th>
              <th className="p-2.5 text-smoke font-semibold">sales</th>
              <th className="p-2.5 text-smoke font-semibold"></th>
            </thead>
            <tbody className="">
              {collections.map((item, index) => (
                <tr key={index} className="">
                  <td className="p-2.5 font-medium "># {index + 1}</td>
                  <td className="p-2.5 flex items-center gap-2 font-medium">
                    <img
                      src={item?.image}
                      alt="collection-image"
                      className="min-h-8 min-w-8 max-h-8 max-w-8 object-cover rounded-full border-2 border-solid border-smoke"
                    />
                    {item.name}
                  </td>
                  <td className="p-2.5 font-medium">
                    {`${item.floor} EDU` ?? "150 EDU"}
                  </td>
                  <td className="p-2.5 font-medium">
                    {(
                      Number(item?.total_volume) /
                      Math.pow(10, chainDetail?.currency_decimal)
                    )?.toFixed(2)}{" "}
                    {chainDetail?.currency_symbol ?? "200 EDU"}
                  </td>
                  <td className="p-2.5 font-medium ">
                    {/* {item.changePercentage}  */}
                    --
                  </td>
                  <td className="p-2.5 font-medium ">
                    {/* {item.sales} */} --
                  </td>
                  <td className="p-2.5 font-medium ">
                    <Image
                      src={BookmarkIcon}
                      alt="#"
                      className="h-5 w-auto object-contain invert cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default collection;
