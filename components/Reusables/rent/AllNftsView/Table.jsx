import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ScrollHeaderContext } from "@/context/ScrollHeaderContext";
import { ChainContext } from "@/context/ChainContext";

const Table = ({ collection, availableList }) => {
  const router = useRouter();
  const { pathname } = router;
  const { setSelectedNft } = useContext(ScrollHeaderContext);
  const { chainDetail, selectedChain, setCollectionId } =
    useContext(ChainContext);

  return (
    <div
      className="relative rounded-3xl hidden md:block overflow-x-auto border-[4px] border-solid"
      style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <div className="max-h-[550px] overflow-y-auto">
        <table className="w-full border-collapse text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase whitespace-nowrap w-full dark:text-gray-400">
            <tr>
              {[
                "Collection Name",
                "Listed NFT",
                "Total Rented",
                "Available for Rent",
                "Floor Price",
              ].map((field, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-center font-numans font-normal text-sm h-16 sticky top-0"
                  style={{
                    backgroundColor: "#1e1e1e",
                    borderTopLeftRadius: index === 0 ? "11px" : "0",
                    borderTopRightRadius: index === 4 ? "11px" : "0",
                    color: "#ffffff",
                  }}
                >
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="items-center font-numans w-full">
            {collection &&
              collection.map((item, index) => (
                <tr
                  className="text-center font-medium text-sm"
                  style={{ height: 14, wordBreak: "break-word" }}
                  key={index}
                >
                  <td
                    style={{ display: "flex", height: "72px" }}
                    className="cursor-pointer"
                  >
                    <div
                      className="w-[280px] flex flex-row items-center justify-start gap-[8px]"
                      style={{ paddingLeft: "46px" }}
                      onClick={() => {
                        const formattedName = item.name
                          .replace(/\s+/g, "-")
                          .replace(/-+/g, "-");

                        const basePath = pathname.includes("rent")
                          ? "rent"
                          : "mart";

                        router.push(
                          `/${selectedChain}/${basePath}/${formattedName}/marketplace`
                        );
                        setCollectionId(item.tokenAddress);
                        setSelectedNft(item.name);
                        analytics.track(`dapp_${basePath}_${item.name}`);
                      }}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={item.image ? item.image : item.image_url}
                          alt="#"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-row">
                        <h4 style={{ color: "white" }} id={item?.name}>
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "white" }}>
                    {typeof availableList === "number"
                      ? availableList
                      : item.total_list
                      ? item.total_list
                      : 0}
                  </td>
                  <td style={{ color: "white" }}>
                    {item.active_rent ? item.active_rent : 0}
                  </td>
                  <td style={{ color: "#8FE6A4" }}>
                    {typeof availableList === "number"
                      ? availableList
                      : item.active_list
                      ? item.active_list
                      : 0}
                  </td>
                  <td style={{ color: "white" }}>
                    <h4>
                      {item.floor} {chainDetail?.currency_symbol}
                    </h4>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
