"use client"
import React, { useContext, useRef, useState } from "react";
import { ChainContext } from "@/context/ChainContext";
import { toast } from "react-toastify";
import Modal from "../../utility/Modals/Modal";
import Button from "../../utility/Button";
import { FaChevronDown } from "react-icons/fa"; // Importing Chevron icon from react-icons

const Input = ({
  placeholder,
  value,
  onChange,
  mainContainerClassnames = "",
  inputClasses = "",
  type = "text",
}) => {
  return (
    <div className={`w-full ${mainContainerClassnames}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 ${inputClasses}`}
      />
    </div>
  );
};




const Dropdown = ({
  placeholder,
  items,
  onSelect,
  valueContainerClasses = "",
  classes = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");

  const handleItemClick = (item) => {
    setSelectedItem(item.label);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative w-full">
      {/* Dropdown header */}
      <div
        className={`cursor-pointer flex items-center justify-between px-4 py-2 border border-gray-300 rounded ${valueContainerClasses}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white">{selectedItem || placeholder}</span>
        <FaChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
      
      {/* Dropdown options */}
      {isOpen && (
        <ul
          className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white shadow-lg border border-gray-300 rounded transition-opacity duration-300 ${classes.optionsWrapper}`}
        >
          {items.map((item, index) => (
            <li
              key={index}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-200 ${classes.optionItem}`}
              onClick={() => handleItemClick(item)}
            >
              <span className="text-white">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};



const PostCollectionModal = ({
  open,
  handleClose,
  placeholder,
  title,
  buttonTitle,
  onButtonClick,
  customComponent,
}) => {
  const [chainId, setChainId] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [filesStored, setFilesStored] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();
  const { chainDetails, chainDetail } = useContext(ChainContext);

  const handleSubmit = async () => {
    if (!chainId) {
      toast.error("Please select a chain.");
    } else if (!tokenAddress) {
      toast.error("Please provide a token address.");
    } else {
      await onButtonClick({ chainId, tokenAddress, chainDetail });
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only PNG or JPG files are allowed.");
        return;
      }
      setFilesStored([file]);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = () => {
    setFilesStored([]);
    setImagePreview(null);
  };

  return (
    <Modal title={title} open={open} handleClose={handleClose}>
      <div className="min-h-[350px]">
        <div className="p-4">
          <Dropdown
            placeholder={"Select Chain"}
            valueContainerClasses={"!text-xs !bg-grayscale-22"}
            items={chainDetails?.map((el) => {
              return { label: el?.chain_name, value: el };
            })}
            onSelect={(el) => setChainId(el?.value?.chain_id)}
            classes={{ optionsWrapper: "!bg-grayscale-22" }}
          />
        </div>
        <div className="p-4">
          <Input
            placeholder={placeholder}
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            mainContainerClassnames={"pb-6"}
            inputClasses={"!bg-grayscale-22 !text-xs"}
          />
          <div className="flex flex-col items-center justify-center w-full mb-4">
            {!filesStored.length ? (
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-600 bg-grayscale-3 hover:border-gray-500 hover:bg-grayscale-2 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400"> PNG or JPG</p>
                </div>
                <input
                  ref={fileRef}
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </label>
            ) : (
              <div className="w-full flex justify-between items-center bg-grayscale-3 p-4 rounded-lg">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">{filesStored[0]?.name}</span>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-300 transition-colors"
                  aria-label="Remove file"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {customComponent}
          <Button onClick={handleSubmit}>{buttonTitle}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PostCollectionModal;
