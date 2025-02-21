import { useFormContext, Controller } from "react-hook-form";
import ReactDOM from "react-dom";
import Downshift from "downshift";
import { ArrowDown } from "./Icons";
import { useState, useRef, useEffect } from "react";

const Dropdown = ({
  items,
  label,
  name,
  customComponent,
  classes,
  valueContainerClasses,
  onSelect,
  placeholder,
  withPortal = false,
}) => {
  const { control } = useFormContext();
  const [dropdownPosition, setDropdownPosition] = useState({});
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY, // Position the dropdown below the button
        left: rect.left + window.scrollX, // Align the dropdown with the button's left edge
      });
    }
  }, [buttonRef.current]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        return (
          <Downshift
            onChange={(selection) => {
              onChange(selection.value);
              onSelect && onSelect(selection);
            }}
            itemToString={(item) => (item ? item.label : "")}
            selectedItem={items?.find((item) => item?.value === value)}
          >
            {({
              getLabelProps,
              getToggleButtonProps,
              getMenuProps,
              getItemProps,
              isOpen,
              selectedItem,
            }) => (
              <div className="font-numans !text-white w-full relative">
                <label
                  {...getLabelProps()}
                  className={`font-medium text-base mb-2 text-white ${
                    classes?.label ?? ""
                  }`}
                >
                  {label}
                </label>
                <button
                  {...getToggleButtonProps()}
                  ref={buttonRef}
                  className={`flex items-center w-full text-faded-white bg-black-6 first-line: px-4 justify-between cursor-pointer min-h-12 h-fit py-2 rounded-lg ${valueContainerClasses}`}
                >
                  {selectedItem
                    ? selectedItem.label
                    : placeholder ?? "Select an item"}
                  <ArrowDown
                    className={`text-grey  ${
                      isOpen ? "rotate-180" : "rotate-0"
                    } transition-all duration-300`}
                  />
                </button>
                {isOpen &&
                  (withPortal ? (
                    ReactDOM.createPortal(
                      <ul
                        className={`absolute z-10 py-4 bg-black-6-dark rounded-lg border-2 border-solid border-grey p-2 ${
                          classes?.list ?? ""
                        }`}
                        {...getMenuProps()}
                        style={{
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          width: buttonRef.current?.offsetWidth,
                          maxHeight: "fit-content",
                          marginTop: "4px",
                          borderRadius: "0.5rem",
                          border: "1px solid #ddd",
                          backgroundColor: "#333",
                        }}
                      >
                        <div
                          className={`max-h-[150px] overflow-y-auto ${
                            classes?.optionsWrapper ?? ""
                          }`}
                        >
                          {items?.length <= 0 ? (
                            <h5>No trait values found</h5>
                          ) : (
                            items.map((item, index) => (
                              <li
                                className={`my-1 p-1 flex gap-6 !font-numans !font-normal text-white !text-sm cursor-pointer hover:bg-gray33 transition-all duration-300 rounded-md ${
                                  classes?.options ?? ""
                                }`}
                                key={item.value} // Use item.value as key to avoid potential issues
                                {...getItemProps({ item, index })}
                              >
                                {item.label}
                              </li>
                            ))
                          )}
                          {customComponent}
                        </div>
                      </ul>,
                      document.body
                    )
                  ) : (
                    <>
                      <ul
                        className={`w-full absolute z-10 py-4 ${
                          !isOpen && "hidden"
                        } ${classes?.list ?? ""}`}
                        {...getMenuProps()}
                      >
                        <div
                          className={`w-full bg-black-6-dark rounded-lg border-2 border-solid border-grey p-2 max-h-64 overflow-y-auto ${
                            classes?.optionsWrapper ?? ""
                          }`}
                        >
                          {items?.length <= 0 ? (
                            <h5>No trait values found</h5>
                          ) : (
                            items.map((item, index) => (
                              <li
                                className={`my-1 p-1 flex gap-6 !font-numans !font-normal text-white !text-sm cursor-pointer hover:bg-gray33 transition-all duration-300 rounded-md ${
                                  classes?.options ?? ""
                                }`}
                                key={item.value} // Use item.value as key to avoid potential issues
                                {...getItemProps({ item, index })}
                              >
                                {item.label}
                              </li>
                            ))
                          )}
                          {customComponent}
                        </div>
                      </ul>
                    </>
                  ))}
              </div>
            )}
          </Downshift>
        );
      }}
    />
  );
};

export default Dropdown;
