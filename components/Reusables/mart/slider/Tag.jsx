import React from "react";
import RightArrowImage from "../../../../public/images/arrow-square-right.png";
import Image from "next/image";

const Tag = ({ text, isActive, onClick }) => {
  return (
    <span
      onClick={onClick}
      className={`cursor-pointer px-3 py-1 text-sm rounded-full transition-all duration-300 relative ${
        isActive ? "text-white" : "text-[#ddd]"
      }`}
    >
      {text}
      {isActive && (
        <div className="h-1 w-1 rounded-full bg-white mx-auto"></div>
      )}
    </span>
  );
};

const TagList = ({ activeTag, setActiveTag, tagsArray }) => {
  return (
    <div className="flex justify-between items-center w-full ">
      <div className="flex gap-2">
        {tagsArray.map((tag, index) => (
          <Tag
            key={index}
            text={tag}
            isActive={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </div>
      <div
        onClick={() => {}}
        className={`cursor-pointer px-4 py-2 text-sm flex gap-2 items-center rounded-full transition-all duration-300 relative border-2 border-solid border-mist-blue`}
      >
        <p className="text-white">View All</p>
        <Image
          src={RightArrowImage}
          alt="#"
          className="h-4 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default TagList;
