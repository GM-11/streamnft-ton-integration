import { useController, useFormContext } from "react-hook-form";
import FileUpload from "../Reusables/mint/FileUpload";
import Input from "../Reusables/utility/Input";
import CollectionDropdown from "../Reusables/mint/CollectionDropdown";

const NftIntroduction = () => {
  const { control, getValues, setValue, register, formState } =
    useFormContext();

  return (
    <div className="p-4 bg-black-8 rounded-md">
      <div className="w-full mt-2 gap-4 mb-6">
        <CollectionDropdown />
      </div>
      <div className="flex flex-col mt-2 gap-2 w-full mb-6">
        <Input
          label="NFT Name"
          reactHookFormRegister={{
            ...register("nft_name", {
              required: "Nft name is required",
            }),
          }}
          placeholder="Enter your NFT name"
        />
        {!!formState?.errors?.nft_name && (
          <p className="text-red text-sm">
            {formState?.errors?.nft_name?.message}
          </p>
        )}
      </div>

      {/* nft_description Input */}
      <div className="w-full mb-6">
        <Input
          label="Nft Description"
          reactHookFormRegister={"nft_description"}
          placeholder="Give a short Description of your nft"
          textEditor
          inputClasses="w-full h-24 resize-none"
        />
        {!!formState?.errors?.nft_description && (
          <p className="text-red text-sm">
            {formState?.errors?.nft_description?.message}
          </p>
        )}
      </div>

      <div className="w-full mb-6 ">
        <h5 className="py-2">Image</h5>
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

export default NftIntroduction;
