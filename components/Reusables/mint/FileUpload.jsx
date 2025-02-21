"use client";
import React, { useRef } from "react";
import { useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import UploadImage from "../../../public/images/fileImage.png";
import { CloseIcon } from "../rent/Icons";

const FileUpload = ({ control, setValue, name }) => {
  const fileRef = useRef(null);

  const filesStored = useWatch({ name, control });

  const fileUploadClickHandler = () => {
    fileRef?.current?.click();
  };

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
      setValue(name, [fileData]);
    };
    //
  };

  const FileImage =
    "https://utilityimages.s3.ap-south-1.amazonaws.com/image12024-08-15T14-26-33.png";

  const handleRemove = (id) => {
    setValue(name, []);
  };

  return (
    <div className="h-fit">
      <div
        className="h-[4rem] bg-grayscale-22 rounded-lg gap-4 flex items-center justify-between px-4 cursor-pointer"
        onClick={fileUploadClickHandler}
      >
        <h5 className="text-faded-white text-base">Upload file</h5>
        <div className="text-sm font-medium flex items-center gap-3 justify-center text-grey bg-black-7-dark p-2 px-4 rounded-md">
          <img
            src={UploadImage.src}
            className="h-4 w-auto object-contain"
            alt="Default upload icon"
          />
          Browse Here
        </div>

        <input
          ref={fileRef}
          type="file"
          name="select-image"
          id="select-image"
          onChange={handleInputChange}
          className="hidden"
          required
        />
      </div>

      {filesStored?.length > 0 && (
        <div className="h-32 flex items-center gap-4 mt-4">
          <div className="relative">
            <div
              className="absolute top-1 right-1 bg-grey rounded-full flex items-center justify-center h-5 w-5 cursor-pointer"
              onClick={() => handleRemove(filesStored?.[0]?.id)}
            >
              <CloseIcon className="h-3 w-3 text-white" />
            </div>
            <img
              src={filesStored?.[0]?.data}
              alt="Uploaded or default"
              className="h-28 w-28 object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
