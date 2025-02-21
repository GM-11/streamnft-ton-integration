import { CollectionContext } from "@/context/CollectionContext";
import React, { useContext, useState } from "react";
import ViewAllButton from "../../../../public/images/viewAllButton.png";
import TrendingIconImage from "../../../../public/images/trendingIcon.png";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";

const CollectionTableSection = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [activeDateFilter, setActiveDateFilter] = useState("1D");

  const { collections, chainDetail } = useContext(ChainContext);

  const [firstHalf, secondHalf] = React.useMemo(() => {
    const mid = Math.ceil(collections?.length / 2);
    return [collections?.slice(0, mid) || [], collections?.slice(mid) || []];
  }, [collections]);

  return (
    <div className="mt-16 h-fit p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex items-end justify-between">
          <h1 className="text-5xl leading-[58.24px] font-bold text-white text-left">
            Discover the coolest collections!
          </h1>
        </div>

        <div className="flex w-full justify-between items-center mb-6">
          <div className="flex justify-start bg-jet-black w-fit p-1 rounded-full">
            <button
              className={`px-4 py-2 rounded-full mr-2 flex items-center gap-2 ${
                activeTab === "trending"
                  ? "bg-green-1 text-green-4"
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
              className={`px-4 py-2 rounded-full ${
                activeTab === "top"
                  ? "bg-green-1 text-green-4"
                  : "bg-transparent text-neutral-300"
              }`}
              onClick={() => setActiveTab("top")}
            >
              Top
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex justify-center space-x-4 bg-jet-black p-1.5 rounded-full">
              <button
                className={`px-3 py-1 text-sm rounded-full  ${
                  activeDateFilter === "1D"
                    ? "bg-green-1 text-green-4"
                    : "bg-transparent text-neutral-300"
                }`}
                onClick={() => setActiveDateFilter("1D")}
              >
                1D
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full ${
                  activeDateFilter === "3D"
                    ? "bg-green-1 text-green-4"
                    : "bg-transparent text-neutral-300"
                }`}
                onClick={() => setActiveDateFilter("3D")}
              >
                3D
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full  ${
                  activeDateFilter === "1M"
                    ? "bg-green-1 text-green-4"
                    : "bg-transparent text-neutral-300"
                }`}
                onClick={() => setActiveDateFilter("1M")}
              >
                1M
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-full text-white ${
                  activeDateFilter === "1Y"
                    ? "bg-green-1 text-green-4"
                    : "bg-transparent text-neutral-300"
                }`}
                onClick={() => setActiveDateFilter("1Y")}
              >
                1Y
              </button>
            </div>
            <button
              className={`px-6 py-2.5 bg-jet-black flex items-center justify-center gap-4 text-sm rounded-full text-white `}
              onClick={() => window.open("/discover/collection", "_self")}
            >
              View All
              <Image
                src={ViewAllButton}
                alt="view-button"
                className="h-5 w-auto object-contain invert"
              />
            </button>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Table */}
          <div
            className="relative rounded-3xl hidden md:block p-4 bg-grayscale-21 overflow-x-auto border-[4px] border-solid"
            style={{ borderColor: "rgba(0,0,0, 0.05)" }}
          >
            <div className="max-h-[550px] overflow-y-auto">
              <table className="w-full border-collapse text-sm text-left rtl:text-right text-white p-2">
                <thead className="text-xs text-white uppercase whitespace-nowrap w-full bg-gray-5 !rounded-3xl">
                  <th className="p-2.5">Rank</th>
                  <th className="p-2.5">Collection</th>
                  <th className="p-2.5">Floor Price</th>
                  <th className="p-2.5">Volume</th>
                </thead>
                <tbody className="">
                  {firstHalf?.map((item, index) => (
                    <tr key={index} className="">
                      <td className="p-2.5">{item.rank ?? index + 1}</td>
                      <td className="p-2.5 flex items-center gap-2">
                        <img
                          src={item?.image}
                          alt="collection-image"
                          className="min-h-8 min-w-8 max-h-8 max-w-8 object-cover rounded-full border-2 border-solid border-smoke"
                        />
                        {item.name}
                      </td>
                      <td className="p-2.5">
                        {`${item.floor} EDU` ?? "150 EDU"}
                      </td>
                      <td className="p-2.5">
                        {(
                          Number(item?.total_volume) /
                          Math.pow(10, chainDetail?.currency_decimal)
                        )?.toFixed(2)}{" "}
                        {chainDetail?.currency_symbol ?? "200 EDU"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="relative rounded-3xl hidden md:block p-4 bg-grayscale-21 overflow-x-auto border-[4px] border-solid"
            style={{ borderColor: "rgba(0,0,0, 0.05)" }}
          >
            <div className="max-h-[550px] overflow-y-auto">
              <table className="w-full border-collapse text-sm text-left rtl:text-right !text-white p-2">
                <thead className="text-xs text-white uppercase whitespace-nowrap w-full bg-gray-5 !rounded-3xl">
                  <th className="p-2.5">Rank</th>
                  <th className="p-2.5">Collection</th>
                  <th className="p-2.5">Floor Price</th>
                  <th className="p-2.5">Volume</th>
                </thead>
                <tbody className="">
                  {secondHalf.map((item, index) => {
                    return (
                      <tr key={index} className="">
                        <td className="p-2.5">
                          {item.rank ?? firstHalf?.length + index + 1}
                        </td>
                        <td className="p-2.5 flex items-center gap-2">
                          <img
                            src={item?.image}
                            alt="collection-image"
                            className="min-h-8 min-w-8 max-h-8 max-w-8 object-cover rounded-full border-2 border-solid border-smoke"
                          />
                          {item.name}
                        </td>
                        <td className="p-2.5">
                          {`${item.floor} EDU` ?? "150 EDU"}
                        </td>
                        <td className="p-2.5">
                          {(
                            Number(item?.total_volume) /
                            Math.pow(10, chainDetail?.currency_decimal)
                          )?.toFixed(2)}{" "}
                          {chainDetail?.currency_symbol ?? "200 EDU"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionTableSection;
