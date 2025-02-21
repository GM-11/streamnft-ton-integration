"use client";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { NftOffersRow } from "./Rows/Offer";
import useMediaQuery from "@/hooks/useMediaQuery";
import { UserNftContext } from "@/context/UserNftContext";
import { IoReload } from "react-icons/io5";
import { toast } from "react-toastify";

import { LendRow, BorrowRow, OffersRow, LoansRow } from "./Rows/index";
import { useAccount } from "wagmi";
import { useUserWalletContext } from "@/context/UserWalletContext";

const Table = ({ headers, rows, program, nft, setLoading, loading }) => {
  const router = useRouter();
  const isBigScreen = useMediaQuery();
  const [showTooltip, setShowTooltip] = useState(false);
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const { isConnected } = useUserWalletContext();

  return (
    <div className="w-full m-auto max-w-[1200px]">
      {isBigScreen && (
        <div className="w-full flex items-center justify-between h-16 rounded-t-lg bg-table-header">
          {headers.map((item, index) =>
            router.pathname.includes("offers") ? (
              <div
                className={`table-elements text-center ${item}  text-white font-normal text-base ${
                  item === "Collection/NFT_Name"
                    ? "w-[350px]"
                    : item === " "
                    ? "w-[150px]"
                    : item === "Status"
                    ? "w-[320px]"
                    : item === "View Txn"
                    ? "w-[200px]"
                    : "w-[250px]"
                }
                 ${
                   item === "APY"
                     ? "flex gap-2 justify-center items-center"
                     : ""
                 }`}
                key={index}
              >
                {item.replace("_", " ")}
                {item === "APY" ? (
                  <img
                    className="h-4 w-4 cursor-pointer "
                    src="/images/info-circle.svg"
                    title="test"
                  />
                ) : null}
              </div>
            ) : router.pathname.includes("loans") ? (
              <div
                className={`table-elements text-center ${item} text-white font-normal text-base ${
                  item === "NFT_Name"
                    ? "w-[350px]"
                    : item === " "
                    ? "w-[150px]"
                    : item === "Borrowed Amount"
                    ? "w-[320px]"
                    : item === "View Txn"
                    ? "w-[200px]"
                    : "w-[250px]"
                } ${
                  item === "APY" ? "flex gap-2 justify-center items-center" : ""
                }`}
                key={index}
              >
                {item.replace("_", " ")}
                {item === "APY" ? (
                  <img
                    className="h-4 w-4 cursor-pointer "
                    src="/images/info-circle.svg"
                    title="test"
                  />
                ) : null}
              </div>
            ) : router.pathname.includes("borrow") ? (
              <div
                className={`table-elements text-center ${item} text-white font-normal text-base ${
                  item === "Total_Liquidity"
                    ? "w-[350px]"
                    : item === " "
                    ? "w-[150px]"
                    : item === "Interest"
                    ? "w-[300px] pl-20"
                    : item === "Best_Offer"
                    ? "w-[200px]"
                    : "w-[250px] pl-20"
                } ${
                  item === "APY" ? "flex gap-2 justify-center items-center" : ""
                }`}
                key={index}
              >
                {item.replace("_", " ")}
                {item === "APY" ? (
                  <img
                    className="h-4 w-4 cursor-pointer "
                    src="/images/info-circle.svg"
                    title="test"
                  />
                ) : null}
              </div>
            ) : (
              <div
                className={`table-elements text-center ${item} text-white font-normal text-base ${
                  item === " " ? "w-[150px]" : "w-[200px]"
                } ${
                  item === "APY" ? "flex gap-2 justify-center items-center" : ""
                }`}
                key={index}
              >
                {item.replace("_", " ")}
                {item === "APY" ? (
                  <img
                    className="h-4 w-4 cursor-pointer "
                    src="/images/info-circle.svg"
                    title="test"
                  />
                ) : null}
              </div>
            )
          )}
          {isConnected ? (
            <button
              className="h-12 w-[150px] rounded-sm relative  flex items-center justify-center"
              onClick={async () => {
                if (!loading) {
                  setLoading(true);
                  await reloadNftCacheCall();
                  setLoading(false);
                  toast.dismiss();
                  toast.success("Nft's updated successfully");
                }
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <IoReload size={21} color="#fff" />
              {showTooltip && (
                <span
                  className={`z-[10000] rounded px-2 transition-all duration-300 absolute top-[110%] right-0 py-1 text-xs text-white bg-[#1f7634] mt-1 min-w-48 max-w-48 !font-numans `}
                >
                  Click here, To reload your NFT Data
                </span>
              )}
            </button>
          ) : (
            <div className="h-12 w-[150px]"></div>
          )}
        </div>
      )}

      {router.pathname.includes("lend") ? (
        isBigScreen ? (
          <div className="h-fit md:!h-[600px] overflow-y-auto">
            {rows
              ? (() => {
                  const bestEntries = Object.entries(rows);

                  bestEntries.sort(([i, a], [_, b]) => {
                    const priorityA = a?.pool?.loanPriority || 0;
                    const priorityB = b?.pool?.loanPriority || 0;

                    return priorityA === 1
                      ? -1
                      : priorityB === 1
                      ? 1
                      : priorityA - priorityB;
                  });

                  return bestEntries.map(([index, item], index2) => (
                    <LendRow
                      rowData={item}
                      key={index}
                      program={program}
                      bidManager=""
                      pagename="lend"
                      load={loading}
                      rowCount={index2 + 1}
                    />
                  ));
                })()
              : ""}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:!grid-cols-2 sm:!grid-cols-3 gap-4 md:hidden px-4">
            {rows
              ? (() => {
                  const bestEntries = Object.entries(rows);

                  bestEntries.sort(([i, a], [_, b]) => {
                    const priorityA = a?.pool?.loanPriority || 0;
                    const priorityB = b?.pool?.loanPriority || 0;

                    return priorityA === 1
                      ? -1
                      : priorityB === 1
                      ? 1
                      : priorityA - priorityB;
                  });

                  return bestEntries.map(([index, item], index2) => (
                    <LendRow
                      rowData={item}
                      key={index}
                      program={program}
                      bidManager=""
                      pagename="lend"
                      load={loading}
                      rowCount={index2 + 1}
                    />
                  ));
                })()
              : ""}
          </div>
        )
      ) : router.pathname.includes("offers") ? (
        isBigScreen ? (
          <div className="h-fit md:!h-[600px] overflow-y-auto">
            {rows?.map((item, index) => (
              <OffersRow
                rowData={item}
                key={index}
                pagename="offer"
                setLoading={setLoading}
                rowCount={index + 1}
              />
            ))}
            {nft?.map((item, index) => (
              <NftOffersRow
                rowData={item}
                key={index}
                pagename="offer"
                rowCount={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:!grid-cols-2 sm:!grid-cols-3 gap-4 md:hidden px-4">
            {rows?.map((item, index) => (
              <OffersRow
                rowData={item}
                key={index}
                pagename="offer"
                setLoading={setLoading}
                rowCount={index + 1}
              />
            ))}
            {nft?.map((item, index) => (
              <NftOffersRow
                rowData={item}
                key={index}
                pagename="offer"
                rowCount={index + 1}
              />
            ))}
          </div>
        )
      ) : router.pathname.includes("borrow") ? (
        isBigScreen ? (
          <div className="h-fit md:!h-[600px] overflow-y-auto">
            {rows
              ? (() => {
                  const bestEntries = Object.entries(rows);

                  bestEntries.sort(([i, a], [_, b]) => {
                    const priorityA = a?.pool?.loanPriority || 0;
                    const priorityB = b?.pool?.loanPriority || 0;

                    return priorityA === 1
                      ? -1
                      : priorityB === 1
                      ? 1
                      : priorityA - priorityB;
                  });

                  return bestEntries.map(([index, item], index2) => (
                    <BorrowRow
                      rowData={item}
                      key={index}
                      pagename="borrow"
                      load={loading}
                      rowCount={index2 + 1}
                    />
                  ));
                })()
              : ""}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:!grid-cols-2 sm:!grid-cols-3 gap-4 md:hidden px-4">
            {rows
              ? (() => {
                  const sortedEntries = Object.entries(rows);

                  sortedEntries.sort(([i, a], [_, b]) => {
                    const priorityA = a[0]?.pool?.loanPriority || 0;
                    const priorityB = b[0]?.pool?.loanPriority || 0;

                    return priorityA === 1
                      ? -1
                      : priorityB === 1
                      ? 1
                      : priorityA - priorityB;
                  });

                  return sortedEntries.map(([index, item], index2) => (
                    <BorrowRow
                      rowData={item}
                      key={index}
                      pagename="borrow"
                      load={loading}
                      rowCount={index2 + 1}
                    />
                  ));
                })()
              : ""}
          </div>
        )
      ) : router.pathname.includes("loans") ? (
        isBigScreen ? (
          <div className="h-fit md:!h-[600px] overflow-y-auto">
            {rows?.map((item, index) => (
              <LoansRow
                rowData={item}
                key={index}
                pagename="loans"
                rowCount={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:!grid-cols-2 sm:!grid-cols-3 gap-4 md:hidden px-4">
            {rows?.map((item, index) => (
              <LoansRow
                rowData={item}
                key={index}
                pagename="loans"
                rowCount={index + 1}
              />
            ))}
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  );
};

export default Table;
