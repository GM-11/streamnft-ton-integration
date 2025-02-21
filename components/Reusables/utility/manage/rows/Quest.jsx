"use client";
import React from "react";
import { removeHTMLTags } from "@/utils/generalUtils";
import HapeImage from "@/public/images/hape.png";
import Image from "next/image";
import editIcon from "@/public/images/editLogo.svg";
import Loader from "@/components/Reusables/loan/Loader";
import { useRouter } from "next/navigation";

const capitalizeFirstLetter = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

const isUtilityLive = (date) => {
  const dateToCheck = new Date(date);
  const now = new Date();
  return dateToCheck > now;
};

const QuestRow = ({ item }) => {
  const router = useRouter();
  return (
    <>
      {!item || Object.keys(item).length === 0 ? (
        <Loader />
      ) : (
        <>
          <>
            <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
              <div className="flex flex-row items-center gap-2">
                <img
                  src={item?.image_url ?? HapeImage}
                  alt={item?.title ?? "Untitled"}
                  style={{
                    objectFit: "cover",
                  }}
                  className="w-[30px] h-[30px] rounded-full"
                />
                {item?.title?.length > 30
                  ? capitalizeFirstLetter(item?.title?.slice(0, 10)) +
                    "....." +
                    item?.title.slice(
                      item?.title.length - 10,
                      item?.title.length
                    )
                  : capitalizeFirstLetter(item?.title ?? "Untitled")}
              </div>
            </th>
            <td className="px-6 py-4">
              {removeHTMLTags(item?.description || "No description available")}
            </td>

            <td className="px-6 py-4">{item?.participants?.length ?? 0}</td>
            <td
              className={`px-8 py-4 flex flex-row gap-2 items-center ${
                isUtilityLive(item?.endDate) ? "text-[#8FE6A4]" : "text-red"
              }`}
            >
              {isUtilityLive(item?.endDate) ? "Live" : "Ended"}
            </td>

            <td
              onClick={() => router.push(`/utility/manage/${item?.utilityId}`)}
            >
              <Image
                src={editIcon}
                alt="edit"
                className="w-7 h-7 cursor-pointer"
              />
            </td>
          </>
        </>
      )}
    </>
  );
};

export default QuestRow;
