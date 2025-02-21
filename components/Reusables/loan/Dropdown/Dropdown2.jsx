import { useSelect } from "downshift";
import { FaChevronDown } from "react-icons/fa";
import { useEffect } from "react";

function itemToString(item) {
  return item ? item.title : "";
}

function Dropdown2({
  classes,
  label,
  items,
  onSelect,
  placeholder,
  customComponent,
  isNFT,
  retainedValue,
  valueContainerClasses,
}) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps,
    selectItem,
  } = useSelect({
    items,
    itemToString,
    onSelectedItemChange: (e) => {
      onSelect(e?.selectedItem);
    },
  });

  useEffect(() => {
    selectItem(retainedValue);
  }, []);

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
          className={`flex items-center w-full  bg-mobile-modal-bg border-2 border-solid border-[#3d3d3d] first-line: px-4 justify-between cursor-pointer min-h-12 h-fit py-2 rounded-lg ${valueContainerClasses}`}
        >
          <div>
            <span
              className={`font-normal text-sm  ${
                classes?.selectedValue ?? ""
              } ${
                selectedItem?.label?.length > 0 ? "text-white" : "text-grey"
              }`}
            >
              {selectedItem ? selectedItem?.label : placeholder ?? "Select"}
            </span>
          </div>
          <div>
            <FaChevronDown
              className={`text-grey  ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </div>
        </div>
      </>
      <ul
        className={`w-full absolute z-[10000] py-4 ${!isOpen && "hidden"} ${
          classes?.list ?? ""
        }`}
        {...getMenuProps()}
      >
        <div
          className={`w-full bg-mobile-modal-bg rounded-lg border-2 border-solid border-grey p-2 max-h-64 overflow-y-auto ${
            classes?.optionsWrapper ?? ""
          }`}
        >
          {isOpen && (
            <>
              {items.map((item, index) => (
                <div
                  className={`my-1 p-1 flex gap-6 cursor-pointer hover:bg-gray33 transition-all duration-300 rounded-md ${
                    classes?.options ?? ""
                  }`}
                  key={`${index}`}
                  {...getItemProps({ item, index })}
                >
                  {item.label}
                </div>
              ))}
              {customComponent}
            </>
          )}
        </div>
      </ul>
    </div>
  );
}

export default Dropdown2;
