import React, { useContext, useEffect, useMemo, useState } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import Input from "../../Reusables/utility/Input";
import Dropdown from "../../Reusables/utility/Dropdown";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";
import FileUpload from "../../Reusables/utility/FileUpload";
import AddCollectionModal from "../../Reusables/utility/Modals/AddCollectionModal";
import { toast } from "react-toastify";
import nftCalls from "@/services/utility/nftCalls";
import NFTCollectionDropdown from "./components/NFTCollectionDropdown";
import { SpinnerIcon, TrashIcon } from "../../Reusables/utility/Icons";
import NftTrait from "./components/NftTrait";
import { useRouter } from "next/router";
import Image from "next/image";

const General = () => {
  const [openAddCollectionModal, setOpenAddCollectionModal] = useState(false);
  const { collectionsData } = useContext(CreateUtilityContext);
  const [searchString, setSearchString] = useState("");
  const [traitOptions, setTraitOptions] = useState([]);

  const { control, getValues, setValue, register, formState } =
    useFormContext();

  const { fetchUserCollections } = useContext(CreateUtilityContext);

  const { benefitTypeOptions, industryTypeOptions } =
    useContext(CreateUtilityContext);

  const { field } = useController({
    name: "description",
    defaultValue: "",
  });

  const formValues = useWatch({ control });

  const collectionOptions = useMemo(() => {
    return searchString?.length > 0
      ? collectionsData
          ?.filter((el) =>
            el?.tokenAddress
              ?.toLowerCase()
              ?.includes(searchString?.toLowerCase())
          )
          ?.map((el) => {
            return {
              tokenAddress: el?.tokenAddress,
              image_url: el?.image_url,
              name: el?.name,
              chainId: el?.chainId,
            };
          })
      : collectionsData?.map((el) => {
          return {
            tokenAddress: el?.tokenAddress,
            image_url: el?.image_url,
            name: el?.name,
            chainId: el?.chainId,
          };
        });
  }, [collectionsData, searchString]);

  const createCollection = async (token, chainId) => {
    toast(
      <div className="flex items-center space-x-3 bg-green-3 text-white rounded">
        <SpinnerIcon className="animate-spin text-white" />
        <span>Adding your collection</span>
      </div>,
      {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000000,
        className: "!bg-green-3",
        bodyClassName: "!bg-green-3",
      }
    );
    const response = await nftCalls.createCollection(token, chainId);

    if (response instanceof Error) {
      console.error("Error", response);
      toast.dismiss();
      toast.error("Something went wrong while adding collection");
    } else {
      toast.dismiss();
      toast.success("Collection Added successfully");
      fetchUserCollections();
    }
  };

  const fetchTraitOptions = async (tokenAddress) => {
    const response = await nftCalls.getTraitOptions(tokenAddress);
    if (response instanceof Error) {
      console.error("Error", response);
    } else {
      setTraitOptions(response?.data);
    }
  };

  useEffect(() => {
    if (formValues?.collection?.tokenAddress) {
      fetchTraitOptions(formValues.collection.tokenAddress);
    }
  }, [formValues?.collection?.tokenAddress]);

  const { query } = useRouter();
  const isSpace = formValues.spaceType ? true : false;
  // console.log({ formValues });

  return (
    <>
      <div className="pb-4">
        {isSpace && (
          <div
            className={`mb-4 p-4 bg-black-8 rounded-md relative ${
              query?.id?.length > 0
                ? "pointer-events-none"
                : "pointer-events-auto"
            }`}
          >
            <div className="mb-4">
              <h5>Chosen Space</h5>
              <div className="flex gap-4 items-center mt-2 bg-grayscale-22 rounded-md p-4">
                <img
                  src={formValues?.spaceType?.logo}
                  className="h-12 w-12 rounded-full"
                />
                <h5>{formValues?.spaceType?.spaceName}</h5>
              </div>
            </div>
          </div>
        )}
        {formValues?.isProvider && formValues?.targetCollection && (
          <div
            className={`mb-4 p-4 bg-black-8 rounded-md relative ${
              query?.id?.length > 0
                ? "pointer-events-none"
                : "pointer-events-auto"
            }`}
          >
            <h5 className="text-white mb-4">Choose Collection</h5>
            <div className="w-full h-fit ">
              {query?.id?.length > 0 && (
                <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
              )}
              <NFTCollectionDropdown
                items={collectionOptions}
                onSelect={(e) => {
                  setValue("collection", e);
                  setValue("tokenAddress", "");
                }}
                searchString={searchString}
                setSearchString={setSearchString}
                placeholder={
                  "Select target collection to offer exclusive benefits"
                }
                setOpenAddCollectionModal={setOpenAddCollectionModal}
              />
              {!!formState?.errors?.collection && (
                <p className="text-remDays-block">
                  {formState?.errors?.collection?.message}
                </p>
              )}
            </div>
            {formValues?.collection?.tokenAddress ? (
              <div className="flex gap-4 h-fit p-4 bg-black-3 mt-4 rounded-md">
                <div className="h-fit min-h-[210px] w-60 bg-dark-gray p-4 flex flex-col gap-2 rounded-md">
                  <img
                    alt="#"
                    src={formValues?.collection?.image_url}
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <h5 className="text-sm grow break-words">
                    <h5 className="mb-2 font-medium text-faded-white">
                      {formValues?.collection?.name}
                    </h5>
                    <p className="text-faded-white text-xs font-semibold">
                      CollectionID - {formValues?.collection?.tokenAddress}
                    </p>
                    <p className="text-faded-white text-xs font-semibold mt-2">
                      chainID - {formValues?.collection?.chainId}
                    </p>
                  </h5>
                  <div className="h-fit w-full flex items-center justify-between">
                    <h5 className="text-grayscale-10 text-sm">
                      {formValues?.collection?.nft_count}
                    </h5>
                    {!(query?.id?.length > 0) && (
                      <TrashIcon
                        color="#c15a5a"
                        size={16}
                        className="cursor-pointer"
                        onClick={() => {
                          setValue("collection", null);
                          setValue("tokenAddress", null);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="w-full max-w-[550px] overflow-hidden">
                  <div
                    className="overflow-x-auto"
                    style={{
                      "-ms-overflow-style": "none",
                      "scrollbar-width": "none",
                      "::-webkit-scrollbar": { display: "none" },
                    }}
                  >
                    <NftTrait
                      options={traitOptions}
                      tokenAddress={formValues?.collection?.tokenAddress}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}
        <div className="p-4 bg-black-8 rounded-md">
          <div className="w-full flex mt-2 gap-4 mb-6">
            <div className="w-3/4">
              <Input
                label={"Title"}
                reactHookFormRegister={{ ...register("title") }}
                placeholder="Give your benefit a catchy title"
              />
              {!!formState?.errors?.title && (
                <p className="text-remDays-block">
                  {formState?.errors?.title?.message}
                </p>
              )}
            </div>
            <div
              className={`w-1/4 ${
                query?.id?.length > 0 && "pointer-events-none"
              }`}
            >
              <h5 className="mb-2 text-white">Type</h5>
              <div className="relative h-fit w-full">
                {/* {query?.id?.length > 0 && (
                  <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
                )} */}
                <Dropdown
                  name="industryType"
                  items={industryTypeOptions}
                  onSelect={(e) => setValue("industryType", e)}
                  placeholder={"Industry Type"}
                  valueContainerClasses={"!bg-grayscale-22"}
                  classes={{ optionsWrapper: "!bg-grayscale-22" }}
                />
              </div>
              {!!formState?.errors?.industryType && (
                <p className="text-remDays-block">
                  {formState?.errors?.industryType?.message}
                </p>
              )}
            </div>
          </div>
          <div className="w-full mb-8">
            <Input
              label={"Description"}
              reactHookFormRegister={"description"}
              placeholder={
                "Tell us more about your benefit. What’s it all about?"
              }
              textEditor
              inputClasses={"w-full h-24 resize-none"}
            />

            {!!formState?.errors?.description && (
              <p className="text-remDays-block">
                {formState?.errors?.description?.message}
              </p>
            )}
          </div>
          <div className="w-full mb-4">
            <h5 className="mb-2 ">Image</h5>
            <FileUpload control={control} setValue={setValue} name="images" />
            {!!formState?.errors?.images && (
              <p className="text-remDays-block">
                {formState?.errors?.images?.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <AddCollectionModal
        open={openAddCollectionModal}
        handleClose={() => {
          setOpenAddCollectionModal(false);
          setValue("chainId", "");
          setValue("tokenAddress", "");
        }}
        onButtonClick={(e) => {
          createCollection(e?.tokenAddress, e?.chainId);
        }}
        method={"tokenAddress"}
        placeholder="Enter your collection's address here"
        buttonTitle="Proceed"
        title="Add New Collection"
      />
    </>
  );
};

export default General;
