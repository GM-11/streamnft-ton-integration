import React from "react";
import Image from "next/image";
import editIcon from "@/public/images/editLogo.svg";
import HapeImage from "@/public/images/hape.png";

const SpaceRow = ({ item, onEdit }) => {
  console.log({item})
  return (
    <>
      <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
        <div className="flex flex-row items-center gap-2">
          <Image
            src={item?.logo || HapeImage}
            alt={item?.spaceName ?? "Space"}
            style={{
              objectFit: "cover",
            }}
            width={30}
            height={30}
            className="w-[30px] h-[30px] rounded-full"
          />
          {item?.spaceName?.length > 30
            ? item?.spaceName.slice(0, 10) +
              "....." +
              item?.spaceName.slice(
                item?.spaceName.length - 10,
                item?.spaceName.length
              )
            : item?.spaceName ?? "N/A"}
        </div>
      </th>
      <td className="px-6 py-4">
        {item?.spaceDescription?.length > 40
          ? `${item?.spaceDescription.slice(0, 30)}...`
          : item?.spaceDescription ?? "No description"}
      </td>
      <td className="px-6 py-4">{item?.utilityCount ?? 0}</td>
      <td className="px-6 py-4">{item?.questCount ?? 0}</td>
      <td className="px-8 py-4 text-[#8FE6A4] flex flex-row gap-2 items-center">
        {item?.spaceCategory?.slice(0, 3).join(", ") ?? "No categories"}
        {item?.spaceCategory?.length > 3 && "..."}
      </td>
      <td className="px-6 py-4">
        <Image
          src={editIcon}
          alt="edit"
          className="w-7 h-7 cursor-pointer"
          onClick={() => onEdit(item)}
        />
      </td>
    </>
  );
};

export default SpaceRow;
