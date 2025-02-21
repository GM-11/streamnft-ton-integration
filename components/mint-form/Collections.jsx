import { useFormContext, useWatch } from "react-hook-form";
import { useState } from "react";
import Radio from "../Reusables/mint/Radio";
import Input from "../Reusables/utility/Input";
import ToggleSwitch from "./Toggle";
import Dropdown from "../Reusables/utility/Dropdown";

const Collection = () => {
  const {
    register,
    formState: { errors },
    setValue,
    control
  } = useFormContext();
  
  const [isDerivative, setIsDerivative] = useState(false);
  const [isLimitedSupply, setIsLimitedSupply] = useState(false);
  const [isRoyaltiesEnforceable, setIsRoyaltiesEnforceable] = useState(false);

  const categoryOptions = [
    { label: "Art", value: "art" },
    { label: "Collectibles", value: "collectibles" },
    { label: "Gaming", value: "gaming" },
    { label: "Lifestyle", value: "lifestyle" },
    { label: "Community", value: "community" },
    { label: "PFPs", value: "pfps" },
  ];

  const tokenTypeOptions = [
    { label: "ERC-721", value: "erc-721" },
    { label: "ERC-1155", value: "erc-1155" },
    { label: "ERC-7066", value: "erc-7066" },
    { label: "ERC-7721", value: "erc-7721" },
  ];

  const mintTypeOptions = [
    { label: "Public Mint (SBT, Certificates)", value: "public" },
    { label: "Private Mint", value: "private" },
  ];

  const mintTypeValue = useWatch({
    control,
    name: "mintType",
  });

  return (
    <div className="bg-black-8 p-4 rounded-md">
      {/* Category and Token Type Fields in a Row */}
      <div className="flex mb-6 gap-4">
        <div className="w-1/2">
          <h5 className="font-medium text-white mb-2">Category</h5>
          <Dropdown
            name="category"
            items={categoryOptions}
            onSelect={(value) => setValue("category", value)}
            placeholder="Select a category"
            valueContainerClasses="!bg-grayscale-22 !whitespace-nowrap"
            classes={{ optionsWrapper: "!bg-grayscale-22" }}
          />
          {errors.category && (
            <p className="text-red text-sm">{errors.category.message}</p>
          )}
        </div>

        <div className="w-1/2">
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

      {/* Token Supply Toggle */}
      <div className="flex mb-6 gap-4">
        <div className="w-1/2">
          <label className="font-medium text-white mb-2">Token Supply</label>
          <ToggleSwitch
            checked={isLimitedSupply}
            onChange={(checked) => {
              setIsLimitedSupply(checked);
              setValue("tokenSupply", checked ? "Limited" : "Unlimited");
            }}
            onLabel="Limited"
            offLabel="Unlimited"
          />
          {isLimitedSupply && (
            <Input
              reactHookFormRegister={register("tokenSupply")}
              placeholder="Enter token supply"
              type="number"
              mainContainerClassnames="mt-3"
            />
          )}
          {errors.tokenSupply && (
            <p className="text-red text-sm">{errors.tokenSupply.message}</p>
          )}
        </div>

        {/* Royalties Toggle */}
        <div className="w-1/2">
          <label className="font-medium text-white mb-2">Royalties (%)</label>
          <ToggleSwitch
            checked={isRoyaltiesEnforceable}
            onChange={(checked) => {
              setIsRoyaltiesEnforceable(checked);
              setValue(
                "royalties",
                checked ? "Enforceable" : "Non-Enforceable"
              );
            }}
            onLabel="Enforceable"
            offLabel="Non-Enforceable"
          />
          {isRoyaltiesEnforceable && (
            <Input
              reactHookFormRegister={register("royalties")}
              placeholder="Enter royalties (%)"
              type="number"
              mainContainerClassnames="mt-3"
            />
          )}
          {errors.royalties && (
            <p className="text-red text-sm">{errors.royalties.message}</p>
          )}
        </div>
      </div>

      {/* Mint Type Field as Radio Buttons */}
      <div className="mb-2">
        <h5 className="font-medium text-white mb-2">Mint Type</h5>
        <div className="flex flex-row gap-4 text-xs">
          {mintTypeOptions.map((option) => (
            <label key={option.value} className="flex items-center mb-2">
              <Radio
                name="mintType"
                value={option.value}
                customBorder="border-green"
                customSelectBg="bg-green"
                onChange={() => {
                  setValue("mintType", option.value);
                }}
              />
              <span className="ml-2 text-white">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.mintType && (
          <p className="text-red text-sm">{errors.mintType.message}</p>
        )}
      </div>

      {/* Mint Price Input (Conditional) */}
      {mintTypeValue === "public" && (
        <div className="mb-6">
          <Input
            label="Mint Price"
            reactHookFormRegister={register("mintPrice", {
              required: "Mint price is required for public mint",
            })}
            placeholder="Enter mint price"
            type="number"
          />
          {errors.mintPrice && (
            <p className="text-red text-sm">{errors.mintPrice.message}</p>
          )}
        </div>
      )}

      {/* Is Derivative Toggle */}
      <div className="mb-6">
        <label className="font-medium text-white mb-2">
          Is your creation derivative of existing resources?
        </label>
        <ToggleSwitch
          checked={isDerivative}
          onChange={(checked) => {
            setIsDerivative(checked);
            setValue("isDerivative", checked);
          }}
        />
      </div>

      {/* Conditional Fields when Is Derivative is True */}
      {isDerivative && (
        <div className="flex mb-6 gap-4">
          <div className="w-1/2">
            <Input
              label="Original Name"
              reactHookFormRegister={register("originalName", {
                required: "Original name is required",
              })}
              placeholder="Enter original name"
            />
            {errors.originalName && (
              <p className="text-red text-sm">{errors.originalName.message}</p>
            )}
          </div>

          <div className="w-1/2">
            <Input
              label="Link to the Original Artwork"
              reactHookFormRegister={register("originalArtworkLink", {
                required: "Link to the original artwork is required",
              })}
              placeholder="Enter link to original artwork"
            />
            {errors.originalArtworkLink && (
              <p className="text-red text-sm">
                {errors.originalArtworkLink.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
