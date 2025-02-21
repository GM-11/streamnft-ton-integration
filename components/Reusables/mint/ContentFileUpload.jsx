import React, { useRef } from "react";
import { useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { CloseIcon } from "../rent/Icons";

const FileUpload = ({ control, setValue, name }) => {
  const fileRef = useRef(null);
  const filesStored = useWatch({ name, control });

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const fileData = {
      id: uuidv4(),
      type: file?.type,
      name: file?.name,
      file: file,
    };

    reader.readAsDataURL(file);
    reader.onload = (e) => {
      fileData["data"] = e.target.result;
      // Store the new file
      setValue(name, [fileData]); // Replace any previously uploaded files
    };
  };

  const handleRemove = (id) => {
    setValue(name, []); // Remove file from state
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* If there are no files uploaded, show the "Click to upload" section */}
      {!filesStored?.length ? (
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
            <p className="text-xs text-gray-400">SVG, PNG, JPG, or PDF</p>
          </div>
          <input
            ref={fileRef}
            id="dropzone-file"
            type="file"
            className="hidden"
            onChange={handleInputChange}
            onClick={(e) => (e.target.value = null)} // Clear previous selection
          />
        </label>
      ) : (
        // If there is an uploaded file, display its name and a remove button
        <div className="w-full flex justify-between items-center bg-grayscale-3 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7h18M3 11h18m-6 4H9m0 4h6m-9 0h6"
              />
            </svg>
            <span className="text-gray-300">{filesStored[0]?.name}</span>
          </div>
          <button
            onClick={() => handleRemove(filesStored[0]?.id)}
            className="text-red-500 hover:text-red-300 transition-colors"
            aria-label="Remove file"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
