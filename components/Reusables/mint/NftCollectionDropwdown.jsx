import { useSelect } from "downshift";
import { ArrowDown, PlusIcon } from "../utility/Icons";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Button from "../utility/Button";
import Input from "../utility/Input";

function itemToString(item) {
  return item ? item.name : ""; // Use 'name' instead of 'title'
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
  isMint,
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
      const selectedItem = items?.find((el) => el?.address === collectionValue);
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
          className={`flex items-center w-full bg-grayscale-22 px-4 justify-between cursor-pointer min-h-12 h-fit py-2 rounded-lg ${valueContainerClasses}`}
        >
          <div className="flex items-center gap-2">
            {isMint && collectionFormValue?.image && (
              <img
                src={collectionFormValue?.image}
                alt={collectionFormValue?.name ?? "Selected NFT"}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}

            <span
              className={`font-normal text-sm ${classes?.selectedValue ?? ""} ${
                selectedItem?.address?.length > 0
                  ? "text-faded-white"
                  : "text-faded-white"
              }`}
            >
              {collectionFormValue ? (
                <>
                  {collectionFormValue?.name} (
                  {collectionFormValue?.address?.slice(0, 4) +
                    "..." +
                    collectionFormValue?.address?.slice(-4)}
                  )
                </>
              ):placeholder || "Select"}
            </span>
          </div>
          <div>
            <ArrowDown
              className={`text-grey ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </div>
        </div>
      </>
      <ul
        className={`w-full mt-2 absolute z-40 p-4 bg-black-6-dark rounded-lg ${
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
                    src={item?.image}
                    alt="#"
                    className=" h-12 w-12 rounded-full object-cover"
                  />
                  <div className="grow flex flex-col gap-1">
                    <h5 className="font-medium text-base">
                      {item?.name} (
                      {item?.address?.slice(0, 4) +
                        "..." +
                        item?.address?.slice(-4)}
                      )
                    </h5>
                    <p className="text-sm text-gray-500">
                      Token Type: {item?.tokenType}
                    </p>
                  
                  </div>
                  <div className="h-full w-16 flex items-center justify-center ">
                    <PlusIcon size={21} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {!isMint && (
          <div className="h-fit py-2 w-full flex items-center text-grayscale-10 justify-between">
            <h5>Could not find your collection? Add one</h5>
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
        )}
      </ul>
    </div>
  );
}

export default NFTCollectionDropdown;
