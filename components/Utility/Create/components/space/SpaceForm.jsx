"use client";
import React, { useContext } from "react";
import { removeHTMLTags } from "@/utils/generalUtils";
import { useForm, FormProvider } from "react-hook-form";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { utilityAxiosInstance } from "@/services/axios";
import { ImSpinner2 } from "react-icons/im";
import CreateSpaceForm from "../../CreateSpace";
import { SpaceContext } from "@/context/SpaceContext";
import { uploadImages } from "@/utils/BackendCalls";
import { useUserWalletContext } from "@/context/UserWalletContext";

function isStringOrObject(variable) {
  return (
    typeof variable === "object" &&
    variable !== null &&
    !Array.isArray(variable)
  );
}

const showSpinnerToast = (message, autoClose = 5000000) => {
  toast(
    <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
      <ImSpinner2 className="animate-spin text-white" />
      <span>{message}</span>
    </div>,
    {
      position: toast.POSITION.TOP_RIGHT,
      autoClose,
      className: "!bg-green-6",
      bodyClassName: "!bg-green-6",
    }
  );
};

const showSuccessToast = (message) => {
  toast(
    <div className="flex items-start gap-2 flex-col space-x-3 bg-green-6 text-white rounded">
      <span>{message}</span>
    </div>,
    {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
      className: "!bg-green-6 !h-fit",
      bodyClassName: "!bg-green-6 !h-fit",
    }
  );
};

const CreateSpacePage = ({ onSuccess, item }) => {
  const { isConnected, address } = useUserWalletContext();

  const createSpaceMethods = useForm({
    mode: "all",
    defaultValues: {
      name: item?.spaceName || "",
      space_description: item?.spaceDescription || "",
      upload: {
        profile: item?.logo || [],
        banner: item?.banner || [],
      },
      primaryChains: item?.primaryChains || [],
      spaceCategory: item?.spaceCategory || [],
      twitter: item?.socials?.twitter || "",
      website: item?.socials?.website || "",
      discord: item?.socials?.discord || "",
    },
  });

  const { setSpaceSignal, spaceSignal } = useContext(SpaceContext);

  const handleCancel = () => {
    createSpaceMethods.reset();

    onSuccess();
  };

  const handleSubmit = async (data) => {
    if (!isConnected) {
      toast.error("Connect your wallet before creating a space");
      return;
    }

    const spaceDescription = removeHTMLTags(data?.space_description);

    let logo = item?.logo || "";
    let banner = item?.banner || "";

    showSpinnerToast("Uploading Images...");

    if (data?.upload?.profile) {
      const profileImages = data?.upload?.profile?.[0];
      if (isStringOrObject(profileImages)) {
        const uploadedImage = await uploadImages([profileImages]);
        logo = uploadedImage?.[0];
      }
    }

    if (data?.upload?.banner) {
      const bannerImages = data?.upload?.banner?.[0];
      if (isStringOrObject(bannerImages)) {
        const uploadedImage = await uploadImages([bannerImages]);
        banner = uploadedImage?.[0];
      }
    }

    const requestBody = {
      wallet: address,
      spaceName: data?.name,
      spaceDescription: spaceDescription,
      logo: logo,
      primaryChains: data?.primaryChains,
      spaceCategory: data?.spaceCategory,
      banner: banner,
      socials: {
        twitter: data?.twitter,
        website: data?.website,
        discord: data?.discord,
      },
    };

    try {
      toast.dismiss();
      const action = item ? "Updating Space..." : "Creating Space...";
      showSpinnerToast(action);

      const response = item
        ? await utilityAxiosInstance.put(`/space/${item._id}`, requestBody)
        : await utilityAxiosInstance.post("/space", requestBody);

      toast.dismiss();
      showSuccessToast(
        item ? "Space updated successfully!" : "Space created successfully!"
      );
      await setSpaceSignal(spaceSignal + 1);
      onSuccess();
    } catch (error) {
      console.error("Error processing space:", error);
      toast.dismiss();
      toast.error(item ? "Error updating space" : "Error creating space");
    }
  };

  return (
    <FormProvider {...createSpaceMethods}>
      <form onSubmit={createSpaceMethods.handleSubmit(handleSubmit)}>
        <CreateSpaceForm isEdit={!!item} onCancel={handleCancel} />
      </form>
    </FormProvider>
  );
};

export default CreateSpacePage;
