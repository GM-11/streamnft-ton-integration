import React, { useMemo } from "react";
import { PlusIcon, TrashIcon } from "../../../Reusables/utility/Icons";
import Dropdown from "../../../Reusables/utility/Dropdown";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useRouter } from "next/router";

const NftTrait = ({ options, tokenAddress }) => {
  const methods = useFormContext();

  const { query } = useRouter();

  const { fields, append, remove, update } = useFieldArray({
    control: methods.control,
    name: "traitsArray",
  });

  const traitsArrayValue = useWatch({
    name: "traitsArray",
    control: methods.control,
  });

  const handleAddTrait = (index) => {
    append({
      name: `Nft Trait ${traitsArrayValue?.length + 1}`,
      selectedOption: "",
      selectedTag: "",
      tags: [],
    });
  };

  const handleDeleteTrait = (index) => {
    remove(index);
  };

  const traitKeysOptions = useMemo(() => {
    return Object.keys(options)?.map((el) => {
      return { label: el, value: el };
    });
  }, [options]);

  const traitValuesOptions = (index) => {
    return options[traitsArrayValue[index]?.selectedOption]?.map((el) => {
      return { label: el, value: el };
    });
  };

  return (
    <div className="flex flex-col items-start justify-between">
      <div className="w-full overflow-hidden">
        <div
          className="flex flex-row items-start gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {fields?.map((field, index) => (
            <div
              key={field?.id}
              className="flex flex-col gap-4 bg-[#161414] rounded-md px-2 py-2 min-w-[240px] pb-2"
            >
              <div className="flex bg-dark-gray p-2 rounded-lg justify-between items-center">
                <div className="mr-2 text-faded-white text-sm">
                  {field?.name}
                </div>
                <button
                  className="text-red-500 hover:text-red-700 transition duration-300"
                  onClick={() => handleDeleteTrait(index)}
                >
                  {!(query?.id?.length > 0) && (
                    <TrashIcon
                      color="#c15a5a"
                      size={16}
                      className="cursor-pointer"
                    />
                  )}
                </button>
              </div>

              <Dropdown
                withPortal
                items={traitKeysOptions}
                name={`traitsArray.${index}.selectedOption`}
              />
              <div className="flex flex-wrap gap-2 p-2 text-sm font-medium text-[#656565] rounded-md font-numans bg-[#1f1f1f] h-20 w-56  overflow-hidden">
                <Dropdown
                  withPortal
                  items={traitValuesOptions(index)}
                  name={`traitsArray.${index}.selectedTag`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-center gap-2 mt-1">
        <PlusIcon size={14} color="#bdbdbd" />
        <button
          className="text-[#BDBDBD] text-xs font-numans"
          onClick={handleAddTrait}
        >
          Add another trait
        </button>
      </div>
    </div>
  );
};

export default NftTrait;
