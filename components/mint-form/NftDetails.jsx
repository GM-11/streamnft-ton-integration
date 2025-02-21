import { useFormContext, useWatch } from "react-hook-form";
import { useState } from "react";
import Input from "../Reusables/utility/Input";
import Dropdown from "../Reusables/utility/Dropdown";
import { useAccount } from "wagmi";
import ToggleSwitch from "./Toggle";
import FileUpload from "../Reusables/mint/ContentFileUpload";
import Radio from "../Reusables/mint/Radio";
import { useUserWalletContext } from "@/context/UserWalletContext";

const NftDetails = () => {
  const {
    register,
    formState: { errors },
    setValue,
    control,
  } = useFormContext();
  const [isSecured, setIsSecured] = useState(false);
  const { address: userWalletAddress } = useUserWalletContext();

  const contentCategoryOptions = [
    { label: "Book", value: "book" },
    { label: "Video Courses", value: "video_courses" },
    { label: "Lecture Notes", value: "lecture_notes" },
    { label: "Academic", value: "academic" },
    { label: "Audio Book", value: "audio_book" },
    { label: "Podcasts", value: "podcasts" },
    { label: "Others", value: "others" },
  ];

  const tokenTypeOptions = [
    { label: "General", value: "general" },
    { label: "Subscriptions", value: "subscriptions" },
    { label: "Certifications", value: "certifications" },
    { label: "Tickets", value: "tickets" },
    { label: "Tokenised Scholarships", value: "tokenised_scholarships" },
    { label: "Digital Portfolios", value: "digital_portfolios" },
    { label: "Alumni Networks and Engagement", value: "alumni_networks" },
  ];

  const isSecuredValue = useWatch({
    control,
    name: "isSecured",
    defaultValue: false,
  });

  const mintTypeOptions = [
    { label: "Public Mint", value: "public" },
    { label: "Private Mint", value: "private" },
  ];

  const mintTypeValue = useWatch({
    control,
    name: "mintType",
    defaultValue: "public",
  });

  const collectionType = useWatch({
    control,
    name: "collection",
  });

  return (
    <div className="bg-black-8 p-4 rounded-md">
      <div className="flex mb-6 gap-4">
        <div className="w-full">
          <h5 className="font-medium text-white mb-2">Token Type</h5>
          <Dropdown
            name="tokenType"
            items={tokenTypeOptions}
            onSelect={(value) => setValue("tokenType", value)}
            placeholder="Select a token type"
            valueContainerClasses="!bg-grayscale-22 !whitespace-nowrap"
            classes={{ optionsWrapper: "!bg-grayscale-22" }}
          />
          {errors.tokenType && (
            <p className="text-red text-sm">{errors.tokenType.message}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="font-medium text-white mb-2">
          Do you want to add a token-gated secured content?
        </label>
        <ToggleSwitch
          checked={isSecured}
          onChange={(checked) => {
            setIsSecured(checked);
            setValue("isSecured", checked);
          }}
        />

        {isSecuredValue && (
          <>
            <div className="w-full mt-4">
              <h5 className="font-medium text-white mb-2">Content Category</h5>
              <Dropdown
                name="content_category"
                items={contentCategoryOptions}
                onSelect={(value) => setValue("content_category", value)}
                placeholder="Select a Category"
                valueContainerClasses="!bg-grayscale-22 !whitespace-nowrap"
                classes={{ optionsWrapper: "!bg-grayscale-22" }}
              />
              {errors.content_category && (
                <p className="text-red text-sm">
                  {errors.content_category.message}
                </p>
              )}
            </div>
            <div className="w-full mb-4 mt-4">
              <h5 className="mb-2 mt-4">Content</h5>
              <FileUpload
                control={control}
                setValue={setValue}
                name="content"
              />
              {errors?.content && (
                <p className="text-red text-sm">{errors?.content?.message}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mb-6">
        <h5 className="font-medium text-white mb-2">Mint Type</h5>
        <div className="flex flex-row gap-4 text-xs">
          {mintTypeOptions.map((option) => (
            <label key={option.value} className="flex items-center mb-2">
              <Radio
                name="mintType"
                value={option.value}
                customBorder="border-green"
                customSelectBg="bg-green"
              />
              <span className="ml-2 text-white">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.mintType && (
          <p className="text-red text-sm">{errors.mintType.message}</p>
        )}
      </div>

      {/* Conditionally Rendered Wallet Address Input */}
      {mintTypeValue === "private" && (
        <div className="mb-6">
          <Input
            label="Avail to"
            reactHookFormRegister={register("address", {
              required: "Address is required",
            })}
            placeholder="Enter wallet address"
            inputClasses="w-full"
            defaultValue={userWalletAddress}
          />
          {errors.address && (
            <p className="text-red text-sm">{errors.address.message}</p>
          )}
        </div>
      )}

      {/* Conditionally Rendered Token Supply Input for ERC1155 */}
      {collectionType?.tokenType === "ERC1155" && (
        <div className="mb-6">
          <Input
            label="Token Supply"
            reactHookFormRegister={register("tokenSupply", {
              required: "Token Supply is required",
            })}
            placeholder="Enter token supply"
            inputClasses="w-full"
          />
          {errors.tokenSupply && (
            <p className="text-red text-sm">{errors.tokenSupply.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NftDetails;
