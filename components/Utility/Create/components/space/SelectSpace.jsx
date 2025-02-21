"use client";
import React, { useContext, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Button from "@/components/Reusables/utility/Button";
import Input from "@/components/Reusables/utility/Input";
import {
  ArrowDown,
  RightAngleIcon,
} from "@/components/Reusables/utility/Icons";
import { SpaceContext } from "@/context/SpaceContext";
import { useRouter } from "next/navigation";

const SelectSpace = ({ setCurrStep }) => {
  const { spaces, setShowSpaceForm } = useContext(SpaceContext);
  const { setValue, control } = useFormContext();
  const [searchString, setSearchString] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const router = useRouter();

  const filteredSpaces = spaces.filter((option) => {
    const isNameMatch = option.spaceName
      .toLowerCase()
      .includes(searchString.toLowerCase());
    return isNameMatch;
  });

  const selectedSpaceType = useWatch({ name: "spaceType", control });

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setValue("spaceType", item);
    setIsOpen(false);
  };

  return (
    <div className="font-numans w-full min-h-[calc(100vh-150px)] max-w-4xl mx-auto relative flex flex-col items-center justify-center text-white py-12 mb-20">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Choose a Space for Your Project
      </h1>
      <p className="text-lg text-gray-400 mb-6 text-center">
        Selecting the right space is essential to get started. You can search
        through existing spaces or create a new one if it doesn’t exist.
      </p>

      <div className="font-numans w-full max-w-4xl mx-auto relative">
        <label className="font-medium text-base mb-2 block">
          Select Your Space
        </label>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center w-full bg-grayscale-22 px-4 justify-between cursor-pointer min-h-12 h-fit py-2 rounded-lg`}
        >
          <div className="flex items-center gap-2">
            {selectedSpaceType ? (
              <>
                <img
                  src={selectedSpaceType?.logo}
                  alt={selectedSpaceType?.spaceName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="font-normal text-sm text-faded-white">
                  {selectedSpaceType?.spaceName}
                </span>
              </>
            ) : (
              <span className="font-normal text-sm text-faded-white">
                Select Space
              </span>
            )}
          </div>

          <ArrowDown
            className={`text-grey ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>

        {isOpen && (
          <ul
            className={`absolute z-40 w-full bg-black-6-dark rounded-lg p-4 mt-2 max-h-60 overflow-y-auto`}
          >
            <Input
              placeholder="Search Your Space"
              containerClasses="mb-2"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
            {filteredSpaces.length > 0 ? (
              filteredSpaces.map((item) => (
                <li
                  key={item._id}
                  onClick={() => handleSelectItem(item)}
                  className="my-1 p-1.5 flex gap-2 items-center cursor-pointer hover:bg-grayscale-15 transition-all duration-300 rounded-md"
                >
                  <img
                    src={item.logo}
                    alt={item.spaceName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="font-medium text-base">
                    {item.spaceName}
                  </span>
                </li>
              ))
            ) : (
              <li className="my-1 p-1.5 flex gap-2 items-center">
                <span className="font-medium text-base">No results found</span>
              </li>
            )}
            <li className="my-1 p-1.5 flex gap-2 items-center cursor-pointer transition-all duration-300 rounded-md">
              <Button
                onClick={() => {
                  setShowSpaceForm(true);
                  router.push("/utility/manage");
                  setIsOpen(false);
                }}
                buttonClasses="w-full"
                variant="outlined"
              >
                + Create New Space
              </Button>
            </li>
          </ul>
        )}
      </div>

      <Button buttonClasses="mt-8" onClick={() => setCurrStep(1)}>
        Next
        <RightAngleIcon />
      </Button>
    </div>
  );
};

export default SelectSpace;
