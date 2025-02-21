"use client";
import React from "react";
import { useAccount } from "wagmi";
import UtilityRow from "../rows/Utility";
import QuestRow from "../rows/Quest";
import SpaceRow from "../rows/Space";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const Table = ({ data, columns, selectedButton, loading, onEdit }) => {
  const { isConnected } = useUserWalletContext();

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-xl w-full mx-auto">
      <table className="w-full text-sm text-left rtl:text-right text-green-3">
        <thead className="font-numans bg-white bg-opacity-[0.05] text-base text-white font-normal h-[56px] ">
          <tr className="mb-6">
            {columns.map((field, index) => (
              <th key={index} scope="col" className="px-6 py-3 font-normal">
                {field}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                <Loader />
              </td>
            </tr>
          ) : !isConnected ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-3xl py-8"
              >
                Please connect your wallet
              </td>
            </tr>
          ) : (
            data?.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="bg-white bg-opacity-[0.02] border-l-2 border-[#7C7C7C] text-white font-numans">
                  {selectedButton === "quest" && <QuestRow item={item} />}
                  {selectedButton === "space" && (
                    <SpaceRow item={item} onEdit={onEdit} />
                  )}
                  {selectedButton === "utility" && <UtilityRow item={item} />}
                </tr>
                {index !== data.length - 1 && (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="my-3" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
