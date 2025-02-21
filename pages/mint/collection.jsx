"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Introduction from "@/components/mint-form/Introduction";
import Collection from "@/components/mint-form/Collections";
import Details from "@/components/mint-form/Details";
import Button from "@/components/Reusables/utility/Button";
import MyNFT from "@/constants/Dynamic721";
import { ethers } from "ethers";
import { switchUserChain } from "@/utils/evmProvider";
import { toast } from "react-toastify";
import { shopAxiosInstance } from "@/services/axios";
import { removeHTMLTags } from "@/utils/generalUtils";
import { AiOutlineInfoCircle, AiOutlineFileText } from "react-icons/ai";
import { wagmiConfig } from "@/config/wagmiConfig";

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);

  const methods = useForm({
    mode: "all",
  });

  const steps = [
    {
      label: "Introduction",
      component: <Introduction key="step-1" />,
      icon: <AiOutlineInfoCircle />,
    },
    {
      label: "Collection",
      component: <Collection key="step-2" />,
      icon: <AiOutlineInfoCircle />,
    },
    {
      label: "Social Details",
      component: <Details key="step-3" />,
      icon: <AiOutlineFileText />,
    },
  ];

  const onSubmit = async (data) => {
    if (currentStep === steps.length - 1) {
      await deployContract(data);
    } else {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const deployContract = async (formData) => {
    setLoading(true);
    setError(null);

    const {
      collection_name,
      symbol,
      network,
      tokenType,
      discordLink,
      twitterLink,
      websiteLink,
      collection_description,
      category,
      tokenSupply,
      royalties,
      mintType,
      originalArtworkLink,
      originalName,
      isDerivative,
      images,
      mintPrice,
    } = formData;

    if (!window.ethereum) {
      setError("MetaMask is required to deploy the contract.");
      toast.error("MetaMask is required to deploy the contract.");
      setLoading(false);
      return;
    }

    try {
      await switchUserChain(network.value, wagmiConfig);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (tokenType.value === "erc-721") {
        const contractFactory = new ethers.ContractFactory(
          MyNFT.abi,
          MyNFT.bytecode,
          signer
        );
        const contract = await contractFactory.deploy(collection_name, symbol);

        console.log(
          "Deployment transaction sent:",
          contract.deploymentTransaction()
        );
        await contract.waitForDeployment();

        const deployedAddress = contract.target;
        setContractAddress(deployedAddress);
        console.log("Contract deployed at:", deployedAddress);
        toast.success(`Contract deployed at: ${deployedAddress}`);

        // current date in the format dd/mm/yyyy
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${
          currentDate.getMonth() + 1
        }/${currentDate.getFullYear()}`;

        const postCollection = {
          name: collection_name,
          symbol: symbol,
          tokentype: tokenType.value,
          creator: signer.address,
          image: images[0].file,
          featured: true,
          minttype: mintType ?? "public",
          chainid: network.value,
          description: removeHTMLTags(collection_description),
          category: category.value,
          tokensupplies: tokenSupply ?? "0",
          royalties: royalties ?? 0,
          parent: isDerivative,
          twitterlink: twitterLink || "",
          discordlink: discordLink || "",
          websitelink: websiteLink || "",
          tokenminted: null,
          collectionaddress: deployedAddress,
          mintprice: mintPrice,
          listdate: formattedDate,
        };

        await shopAxiosInstance.post(
          "/collection/addCollection",
          postCollection,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("NFT collection created successfully!");
        methods.reset();
        setCurrentStep(0);
      }
    } catch (error) {
      console.error("Failed to deploy contract", error);
      setError(`Failed to deploy contract: ${error.message}`);
      toast.error("Failed to deploy contract");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const result = await methods.trigger();
    if (result) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const goBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  return (
    <div className="max-w-6xl mt-6 mx-auto">
      {/* Main Heading */}
      <h1 className="text-2xl font-bold text-center mb-5 text-white">
        Create Your Collection
      </h1>

      <div className="grid text-white grid-cols-4 gap-6">
        {/* Left side for step navigation */}
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
                onClick={() => setCurrentStep(index)}
              >
                <div className="mr-2">{step.icon}</div> {/* Icon */}
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right side for form */}
        <div className="col-span-3 p-6 bg-grayscale-9 rounded-lg shadow-lg">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {steps[currentStep].component}

              <div className="flex justify-between mt-6">
                {currentStep > 0 && (
                  <Button
                    onClick={goBack}
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
                    disabled={methods.formState.isSubmitting}
                    type="submit"
                  >
                    {loading ? "Deploying contract..." : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
