"use client";
import React, { useRef, useContext, useMemo } from "react";
import { useFormContext, useController, useWatch } from "react-hook-form";
import { FiEdit2 } from "react-icons/fi";
import CustomInput from "./components/space/CustomInput";
import Select from "react-select";
import Button from "@/components/Reusables/utility/Button";
import { FaTwitter, FaDiscord, FaLink } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { ChainContext } from "@/context/ChainContext";

const BannerProfileUpload = ({ setValue, control, name }) => {
  const bannerRef = useRef(null);
  const profileRef = useRef(null);

  const bannerImageStored = useWatch({ name: `${name}.banner`, control });
  const profileImageStored = useWatch({ name: `${name}.profile`, control });

  const handleImageUpload = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const fileData = {
      id: uuidv4(),
      type: file.type,
      name: file.name,
      file: file,
    };

    reader.readAsDataURL(file);
    reader.onload = (e) => {
      fileData.data = e.target.result;
      setValue(`${name}.${type}`, [fileData]);
    };
  };

  const handleRemove = (type) => {
    setValue(`${name}.${type}`, []);
  };

  return (
    <div className="relative w-full mb-6">
      {/* Banner Section */}
      <div className="h-48 bg-black-5 rounded-md relative overflow-hidden">
        <label className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center bg-black bg-opacity-50">
          <input
            ref={bannerRef}
            type="file"
            className="hidden"
            onChange={(e) => handleImageUpload(e, "banner")}
          />
          {typeof bannerImageStored === "string" ? (
            <img
              src={bannerImageStored}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : bannerImageStored?.[0]?.data ? (
            <img
              src={bannerImageStored[0].data}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-lg">Upload Banner</div>
          )}
        </label>
      </div>

      {/* Profile Section */}
      <div className="absolute bottom-[-40px] left-8">
        <div className="relative w-28 h-28">
          <label className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <input
              ref={profileRef}
              type="file"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "profile")}
            />
            {typeof profileImageStored === "string" ? (
              <img
                src={profileImageStored}
                alt="Banner"
                className="w-full h-full object-cover rounded-full border-2 border-green-3"
              />
            ) : profileImageStored?.[0]?.data ? (
              <img
                src={profileImageStored[0].data}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-2 border-green-3"
              />
            ) : (
              <div className="w-28 h-28 bg-blackBlurred rounded-full flex flex-col gap-1 items-center justify-center">
                <span className="text-white text-2xl">
                  <FiEdit2 />
                </span>
                <p className="font-semibold text-[9px] text-faded-white text-center">
                  Your logo
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

const CustomMultiSelect = ({ label, name, options }) => {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    defaultValue: [],
  });

  const handleChange = (selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    onChange(values); // Use the onChange provided by useController
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-start mb-2">
        <label className="block w-[32%] text-white mr-4">{label}</label>
        <Select
          isMulti
          options={options}
          onChange={handleChange}
          className="basic-multi-select !text-black  flex-1"
          classNamePrefix="select"
          placeholder={`Select ${label}`}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#2d2d2d",
              color: "#444",
              borderColor: "#444",
              "&:hover": {
                borderColor: "#30B750",
              },
            }),
            menu: () => ({ backgroundColor: "#262626" }),
            menuList: () => ({ backgroundColor: "#262626" }),
            option: (base) => ({
              ...base,
              backgroundColor: "#262626",
              color: "white",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              textSize: "12px",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: "#30B750",
              color: "black",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "white",
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: "white",
              "&:hover": {
                backgroundColor: "red",
                color: "white",
              },
            }),
          }}
          value={value?.map((val) =>
            options.find((option) => option.value === val)
          )}
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error.message}</p>}
    </div>
  );
};

const Social = ({ label, name, placeholder, register, errors, icon }) => {
  return (
    <div className="flex items-start justify-between pb-4 w-full">
      <div className="w-full h-full relative">
        <div className="flex items-center bg-grayscale-22 h-12 rounded-lg px-4">
          {icon && (
            <div className="mr-2 text-green-3">
              {React.createElement(icon, { size: 20 })}
            </div>
          )}
          <input
            id={name}
            type="text"
            placeholder={placeholder}
            {...register(name)}
            className={`h-full w-full rounded-lg px-4 text-sm text-faded-white placeholder:text-faded-white bg-transparent focus:outline-none py-2 
              ${
                errors?.[name]
                  ? "border-red-500 focus:border-red-400"
                  : "border-gray-600 focus:border-blue-500"
              }`}
          />
        </div>
        {errors?.[name] && (
          <p className="text-red-500 mt-2 text-sm">{errors[name].message}</p>
        )}
      </div>
    </div>
  );
};

const CreateSpaceForm = ({ isEdit, onCancel }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const { chainDetails } = useContext(ChainContext);

  const chainOptions = useMemo(() => {
    return chainDetails.map((chain) => ({
      value: chain.chain_id,
      label: chain.chain_name,
    }));
  }, [chainDetails]);

  const categoryOptions = useMemo(
    () => [
      { value: "defi", label: "DeFi" },
      { value: "socialfi", label: "SocialFi" },
      { value: "nft", label: "NFT" },
      { value: "infrastructure", label: "Infrastructure" },
      { value: "consumer_app", label: "Consumer App" },
      { value: "payments", label: "Payments" },
    ],
    []
  );

  return (
    <div className="pb-12 mt-4 max-w-4xl mx-auto">
      <div className="p-4 bg-black-7 rounded-md">
        <BannerProfileUpload
          name="upload"
          setValue={setValue}
          control={control}
        />

        <div>
          <CustomInput
            label={"Name"}
            reactHookFormRegister={{ ...register("name") }}
            placeholder="Enter your space name"
          />
          {!errors?.name && (
            <p className="text-remDays-block">{errors?.name?.message}</p>
          )}
        </div>

        <div className="mb-8">
          <CustomInput
            label={"Description"}
            reactHookFormRegister={"space_description"}
            placeholder={"Tell us more about your space. What’s it all about?"}
            textEditor
            inputClasses={"w-full h-24 resize-none"}
          />
          {!errors?.space_description && (
            <p className="text-remDays-block">
              {errors?.space_description?.message}
            </p>
          )}
        </div>

        <CustomMultiSelect
          label="Primary Chains"
          name="primaryChains"
          options={chainOptions}
          register={register}
        />

        <CustomMultiSelect
          label="Space Category"
          name="spaceCategory"
          options={categoryOptions}
          register={register}
        />

        <div className="w-full mb-6">
          <h5 className="text-white mb-4">Socials</h5>
          <div className="flex gap-4">
            <Social
              label="Twitter"
              name="twitter"
              placeholder="Enter Twitter URL"
              register={register}
              errors={errors}
              icon={FaTwitter}
            />
            <Social
              label="Website"
              name="website"
              placeholder="Enter Website URL"
              register={register}
              errors={errors}
              icon={FaLink}
            />
            <Social
              label="Discord"
              name="discord"
              placeholder="Enter Discord URL"
              register={register}
              errors={errors}
              icon={FaDiscord}
            />
          </div>
        </div>

        <hr />

        <div className="flex space-x-4 w-full justify-between flex-row-reverse">
          <Button
            type="submit"
            className="p-2 px-8 flex items-center justify-center text-white bg-green-4 rounded-md mt-4"
          >
            {isEdit ? "Update Space" : "Create Space"}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            className="p-2 px-8 flex items-center justify-center text-white bg-red rounded-md mt-4"
            variant="outlined"
            shadowColor={"#F14242"}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceForm;
