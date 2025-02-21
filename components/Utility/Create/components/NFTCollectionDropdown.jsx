import { useSelect } from "downshift";
import { ArrowDown, PlusIcon } from "../../../Reusables/utility/Icons";
import { useEffect } from "react";
import Button from "../../../Reusables/utility/Button";
import Input from "../../../Reusables/utility/Input";
import { useFormContext, useWatch } from "react-hook-form";

function itemToString(item) {
  return item ? item.title : "";
}

function NFTCollectionDropdown({
  classes,
  label,
  items,
  onSelect,
  placeholder,
  valueContainerClasses,
  setOpenAddCollectionModal,
  searchString,
  setSearchString,
}) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps,
    selectItem,
    closeMenu,
  } = useSelect({
    items,
    itemToString,
    onSelectedItemChange: (e) => {
      onSelect(e?.selectedItem);
    },
  });

  const methods = useFormContext();

  const collectionValue = useWatch({
    name: "collectionFromBackend",
    control: methods.control,
  });

  const collectionFormValue = useWatch({
    name: "collection",
    control: methods.control,
  });

  useEffect(() => {
    if (collectionValue?.length > 0) {
      const selectedItem = items?.find(
        (el) => el?.tokenAddress === collectionValue
      );
      selectItem(selectedItem);
      methods.setValue("collection", selectedItem);
      methods.setValue("collectionFromBackend", "");
    }
  }, [collectionValue]);

  return (
    <div className="font-numans !text-white w-full relative">
      <>
        {label && (
          <label
            {...getLabelProps()}
            className={`font-medium text-base mb-2 text-white ${
              classes?.label ?? ""
            }`}
          >
            {label}
          </label>
        )}
        <div
          {...getToggleButtonProps()}
          className={`flex items-center w-full  bg-grayscale-22 first-line: px-4 justify-between cursor-pointer min-h-12 h-fit py-2 rounded-lg ${valueContainerClasses}`}
        >
          <div>
            <span
              className={`font-normal text-sm  ${
                classes?.selectedValue ?? ""
              } ${
                selectedItem?.tokenAddress?.length > 0
                  ? "text-faded-white"
                  : "text-faded-white"
              }`}
            >
              {collectionFormValue
                ? collectionFormValue?.name
                : placeholder ?? "Select"}
            </span>
          </div>
          <div>
            <ArrowDown
              className={`text-grey  ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </div>
        </div>
      </>
      <ul
        className={`w-full mt-2 absolute z-[999] p-4 bg-black-6-dark rounded-lg ${
          !isOpen && "hidden"
        } ${classes?.list ?? ""}`}
        {...getMenuProps()}
      >
        <div
          className={`w-full max-h-64 overflow-y-auto scrollbar-hide ${
            classes?.optionsWrapper ?? ""
          }`}
        >
          {isOpen && (
            <>
              <Input
                placeholder={"Search collections by their address"}
                containerClasses={"border border-solid border-gray-2 mb-2"}
                value={searchString}
                onChange={(e) => setSearchString(e?.target?.value)}
              />
              {items.map((item, index) => (
                <div
                  className={`my-1 p-1.5 flex gap-6 items-center cursor-pointer bg-grayscale-15 transition-all duration-300 rounded-md`}
                  key={`${index}`}
                  {...getItemProps({ item, index })}
                >
                  <img
                    src={item?.image_url}
                    alt="#"
                    className=" h-12 w-12 rounded-full object-cover"
                  />
                  <div className="grow flex flex-col gap-1">
                    <h5 className="font-medium text-base">
                      {item?.name} (
                      {item?.tokenAddress?.slice(0, 4) +
                        "..." +
                        item?.tokenAddress?.slice(-4)}
                      )
                    </h5>
                  </div>
                  <div className="h-full w-16 flex items-center justify-center ">
                    <PlusIcon size={21} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="h-fit py-2 w-full flex items-center text-grayscale-10 justify-between">
          <h5>Could not find your collection ? Add one</h5>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenAddCollectionModal(true);
              closeMenu();
            }}
          >
            Add your NFT Collection
          </Button>
        </div>
      </ul>
    </div>
  );
}

export default NFTCollectionDropdown;
