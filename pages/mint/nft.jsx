"use client";
import React, { useState, useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useAccount, useBalance } from "wagmi";
import { toast } from "react-toastify";
import { useSigner } from "@/context/SignerContext";
import { mintNftOpenCampus } from "@/utils/evmProvider";
import MintingCompleteModal from "@/components/Reusables/mint/MintingCompleteModal";
import NftIntroduction from "@/components/mint-form/NftIntroduction";
import NftDetails from "@/components/mint-form/NftDetails";
import Button from "@/components/Reusables/utility/Button";
import { formatEther } from "ethers";
import { removeHTMLTags } from "@/utils/generalUtils";
import { ModalContext } from "@/context/ModalContext";
import { AiOutlineInfoCircle, AiOutlineFileText } from "react-icons/ai";
import { UserNftContext } from "@/context/UserNftContext";
import { ImSpinner2 } from "react-icons/im";
import { useUserWalletContext } from "@/context/UserWalletContext";

const MintNFT = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const { setModalData, setOpenModal, setModalType, modalType } =
    useContext(ModalContext);
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const { address, isConnected } = useUserWalletContext();
  const { refetch: refetchBalance, data: balanceData } = useBalance({
    address,
  });
  const { signer } = useSigner();

  const requiredBalance = 0.0000145;
  const methods = useForm({
    mode: "all",
  });

  const steps = [
    {
      label: "Introduction",
      component: <NftIntroduction />,
      icon: <AiOutlineInfoCircle />,
    },
    {
      label: "Details",
      component: <NftDetails />,
      icon: <AiOutlineFileText />,
    },
  ];

  const handleNext = async () => {
    const result = await methods.trigger();
    if (result) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleStepClick = async (index) => {
    if (currentStep !== index) {
      const result = await methods.trigger();

      if (result) {
        setCurrentStep(index);
      } else {
        toast.error(
          "Please fill in all required fields before switching steps."
        );
      }
    }
  };

  const handleSubmit = async (data) => {
    if (!isConnected) {
      toast.error("Connect your wallet before minting");
      return;
    }

    setLoading(true);
    setOpenModal(true);
    setModalType("mintingcomplete");

    await refetchBalance();

    if (requiredBalance > parseFloat(formatEther(balanceData?.value))) {
      await setOpenModal(false);
      setModalType("");
      toast.dismiss();
      toast.error("You do not have enough balance to mint this NFT");
      setLoading(false);
      return;
    }

    const nftDescription = removeHTMLTags(data?.nft_description);

    const metadata = {
      ...(data?.tokenType?.value && { token_type: data?.tokenType?.value }),
      ...(data?.collection?.tokenType && {
        token_standard: data?.collection?.tokenType,
      }),
      ...(data?.collection?.name && {
        collection_name: data?.collection?.name,
      }),
      ...(data?.collection?.image && {
        collection_img: data?.collection?.image,
      }),
      ...(data?.content_category?.value && {
        content_category: data?.content_category?.value,
      }),
    };

    //
    await mintNftOpenCampus(
      signer,
      data?.address,
      data?.nft_name,
      nftDescription,
      data?.images[0]?.file,
      data?.content?.[0]?.file ?? undefined,
      data?.collection?.address,
      async (tx) => {
        await setLoading(false);
        await setModalData(tx);
        toast.dismiss();
        toast(
          <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
            <ImSpinner2 className="animate-spin text-white" />
            <span>Updating NFT Data</span>
          </div>,
          {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 5000000,
            className: "!bg-green-6",
            bodyClassName: "!bg-green-6",
          }
        );
        await reloadNftCacheCall();
        toast.dismiss();
        toast.success("NFT Data updated successfully");
        methods.reset();
        setCurrentStep(0);
      },
      async () => {
        await setOpenModal(false);
        setModalType("");
        toast.dismiss();
        toast.error("NFT Minting failed, Please try again");
        setLoading(false);
      },
      metadata,
      data?.mintType
    );
  };

  return (
    <div className="max-w-6xl mt-6 mx-auto">
      <h1 className="text-2xl font-bold text-center mb-5 text-white">
        Mint NFTs for your collection
      </h1>

      <div className="grid text-white grid-cols-4 gap-6">
        <div className="col-span-1">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  currentStep === index
                    ? "bg-green-4 text-white border border-white shadow-lg"
                    : "bg-grayscale-7 hover:bg-grayscale-6"
                }`}
                onClick={() => handleStepClick(index)} // Use the new handler
              >
                <div className="mr-2">{step.icon}</div> {/* Icon */}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 p-6 bg-grayscale-9 rounded-lg shadow-lg">
          <FormProvider {...methods}>
            {steps[currentStep].component}

            <div className="flex justify-between mt-6">
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  buttonClasses="!px-8 py-2 !bg-gray-3 !rounded-md text-white"
                  shadowColor="white-1"
                >
                  Back
                </Button>
              )}

              {currentStep < steps.length - 1 && (
                <Button
                  onClick={handleNext}
                  buttonClasses="!px-8 py-2 text-white rounded-md"
                >
                  Next
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button
                  buttonClasses="!px-8 py-2 text-white rounded-md"
                  onClick={methods.handleSubmit(handleSubmit)}
                >
                  Submit
                </Button>
              )}
            </div>
            {modalType === "mintingcomplete" && (
              <MintingCompleteModal loading={loading} />
            )}
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default MintNFT;
