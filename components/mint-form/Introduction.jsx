"use client";
import { useController, useFormContext, useWatch } from "react-hook-form";
import FileUpload from "../Reusables/mint/FileUpload";
import Dropdown from "../Reusables/utility/Dropdown";
import Input from "../Reusables/utility/Input";
import { useContext, useMemo } from "react";
import { ChainContext } from "@/context/ChainContext";

const Introduction = () => {
  const { control, getValues, setValue, register, formState } =
    useFormContext();

  const { field } = useController({
    name: "collection_description",
    defaultValue: "",
  });
  const { chainDetails } = useContext(ChainContext);

  // Memoize the network options to optimize performance
  const networkOptions = useMemo(() => {
    return chainDetails.map((chain) => ({
      label: chain.chain_name,
      value: chain.chain_id,
    }));
  }, [chainDetails]);

  return (
    <div className="p-4 bg-black-8 rounded-md">
      {/* Title and network Type Section */}
      <div className="w-full flex mt-2 gap-4 mb-6">
        {/* Title Input */}
        <div className="w-3/4 flex items-start gap-2">
          <div className="flex w-3/4 flex-col">
            <Input
              label="Collection Name"
              reactHookFormRegister={{
                ...register("collection_name", {
                  required: "Collection name is required",
                }),
              }}
              placeholder="Enter your collection name"
            />
            {!!formState?.errors?.collection_name && (
              <p className="text-red text-sm">
                {formState?.errors?.collection_name?.message}
              </p>
            )}
          </div>

          <div className="flex w-1/4 flex-col items-center gap-1">
            <Input
              label="Symbol"
              reactHookFormRegister={{
                ...register("symbol"),
              }}
              placeholder="Collection symbol"
            />
            {!!formState?.errors?.symbol && (
              <p className="text-red text-sm">
                {formState?.errors?.symbol?.message}
              </p>
            )}
          </div>
        </div>

        {/* Network Type Dropdown */}
        <div className="w-1/4">
          <h5 className="font-medium text-white mb-2">Network</h5>
          <div className="relative h-fit w-full">
            <Dropdown
              name="network"
              items={networkOptions}
              onSelect={(e) => setValue("network", e)}
              placeholder="Choose Network"
              valueContainerClasses="!bg-grayscale-22 !whitespace-nowrap"
              classes={{ optionsWrapper: "!bg-grayscale-22" }}
            />
          </div>
          {!!formState?.errors?.network && (
            <p className="text-red text-sm">
              {formState?.errors?.network?.message}
            </p>
          )}
        </div>
      </div>

      {/* Collection Description Input */}
      <div className="w-full mb-6">
        <Input
          label="Description"
          reactHookFormRegister={"collection_description"}
          placeholder="Give a short description of your collection"
          textEditor
          inputClasses="w-full h-24 resize-none"
        />
        {!!formState?.errors?.collection_description && (
          <p className="text-red text-sm">
            {formState?.errors?.collection_description?.message}
          </p>
        )}
      </div>

      {/* File Upload */}
      <div className="w-full mb-4">
        <h5 className="mb-2">Image</h5>
        <FileUpload control={control} setValue={setValue} name="images" />
        {!!formState?.errors?.images && (
          <p className="text-red text-sm">
            {formState?.errors?.images?.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Introduction;
