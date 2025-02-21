"use client";
import React, { useState, useContext, useMemo, useEffect } from "react";
import Benefits from "@/components/Utility/Create/Benefits";
import {
  FormSteps,
  Eligibility,
  Personalise,
  General,
} from "@/components/Utility";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Button from "@/components/Reusables/utility/Button";
import { generalDefaultValues } from "@/constants/defaultValues";
import formValidation from "@/hooks/formValidation";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { ChainContext } from "@/context/ChainContext";
import { useRouter } from "next/router";
import { HederaContext } from "@/context/HederaContext";
import { checkPairing } from "@/utils/HederaContract";
import { createCollectionAndUtility } from "@/utils/BackendCalls";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import SelectSpace from "@/components/Utility/Create/components/space/SelectSpace";
import { SpaceContext } from "@/context/SpaceContext";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";

const Create = () => {
  const [currStep, setCurrStep] = useState(0); // Keep track of the current step
  const [loading, setLoading] = useState(false);
  const [rewardData, setRewardData] = useState({});
  const [telegramBotVerified, setTelegramBotVerified] = useState(false);
  const [submitButtonActive, setSubmitButtonActive] = useState(false);
  const { address, isConnected, chainId: userChainId } = useUserWalletContext();
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const router = useRouter();
  const { accountId } = useContext(HederaContext);
  const { signer } = useSigner();
  const { setSpaceSignal, spaceSignal } = useContext(SpaceContext);
  const { checkLoginValidity, setIsTransactionOngoing, setIsTokenValid } =
    useUserWalletContext();

  const benefitsMethods = useForm({
    defaultValues: {
      utilityType: "",
      rewardStartDate: new Date(),
      rewardEndDate: "",
      rewardUseCount: "",
      rewardExpiry: "",
      numberOfWinners: 1,
      estimatedPrize: 1,
      raffleStartDate: new Date(),
      raffleEndDate: "",
      claimingEndDate: "",
      currency: "USD",
      campaignMethod: "first_come",
      expiringConditions: "date_based",
    },
  });

  const eligibilityMethods = useForm();

  const generalMethods = useForm({
    defaultValues: generalDefaultValues,
  });

  const benefitUtilityType = useWatch({
    name: "benefitUtilityType",
    control: generalMethods.control,
  });

  const nextHandler = async () => {
    if (currStep < 4 && currStep >= 0) {
      if (
        currStep === 3 &&
        benefitsMethods.getValues("selectedFormElement") !==
          "distribution-details"
      ) {
        benefitsMethods.setValue("selectedFormElement", "distribution-details");
        return;
      }
      setCurrStep(currStep + 1);
      window.scrollTo(0, 0);
    }

    if (currStep === 4) {
      if (
        !formValidation(2, generalMethods) ||
        !formValidation(3, benefitsMethods)
      ) {
        if (!formValidation(2, generalMethods)) {
          toast.error("Required fields are missing at General section.");
        }

        if (!formValidation(3, benefitsMethods)) {
          toast.error("Required fields are missing at Benefits section.");
        }
      } else {
        await handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    const isUserValid = await checkLoginValidity();
    if (isUserValid) {
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }

      setIsTransactionOngoing(true);
      if (chainDetail?.evm && isConnected && address) {
        setLoading(true);
        await createCollectionAndUtility({
          utility: generalMethods.getValues(),
          reward: {
            ...benefitsMethods.getValues(),
            completeRewardData: rewardData,
          },
          requirements: eligibilityMethods.getValues(),
          chainDetail,
          userAddress: chainDetail?.evm ? address : accountId,
          onComplete: () => {
            setLoading(false);
            setSpaceSignal(spaceSignal + 1);
            router.push("/utility/marketplace");
            setIsTransactionOngoing(false);
          },
          onError: () => {
            setLoading(false);
            setIsTransactionOngoing(false);
          },
          signer,
        });
      } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
        const checkPair = checkPairing();

        setLoading(true);
        await createCollectionAndUtility({
          utility: generalMethods.getValues(),
          reward: {
            ...benefitsMethods.getValues(),
            completeRewardData: rewardData,
          },
          requirements: eligibilityMethods.getValues(),
          chainDetail,
          userAddress: chainDetail?.evm ? address : accountId,
          onComplete: () => {
            setLoading(false);
            setSpaceSignal(spaceSignal + 1);
            router.push("/utility/marketplace");
            setIsTransactionOngoing(false);
          },
          onError: () => {
            setLoading(false);
            setIsTransactionOngoing(false);
          },
          signer,
        });
      }
    }
  };

  const saveForLaterHandler = () => {
    localStorage.setItem(
      "firstStepFormData",
      JSON.stringify(generalMethods.getValues())
    );
    localStorage.setItem(
      "secondStepFormData",
      JSON.stringify(benefitsMethods.getValues())
    );
    localStorage.setItem(
      "thirdStepFormData",
      JSON.stringify(eligibilityMethods.getValues())
    );
    toast.success("Your progress is saved successfully!");
  };

  const formArray = useWatch({
    name: "formArray",
    control: eligibilityMethods.control,
  });

  const isJoinTelegramTaskSelected = useMemo(() => {
    return formArray?.some((el) => el?.heading === "Join Telegram");
  }, [formArray]);

  useEffect(() => {
    if (isJoinTelegramTaskSelected) {
      if (telegramBotVerified) {
        setSubmitButtonActive(true);
      } else {
        setSubmitButtonActive(false);
      }
    } else {
      setSubmitButtonActive(true);
    }
  }, [isJoinTelegramTaskSelected, telegramBotVerified]);

  return (
    <div className="grow w-full px-8 lg:px-12 py-4 flex font-numans">
      {loading ? (
        <div className="h-full min-h-[400px] w-full flex flex-col items-center justify-center grow">
          <Loader customMessage={"Creating Utility"} />
        </div>
      ) : (
        <>
          {currStep === 0 ? (
            <FormProvider {...generalMethods}>
              <SelectSpace setCurrStep={setCurrStep} />
            </FormProvider>
          ) : currStep === 1 ? (
            <FormProvider {...generalMethods}>
              <Personalise setCurrStep={setCurrStep} />
            </FormProvider>
          ) : (
            <div className="flex grow rounded-lg py-4 pt-16 min-h-full">
              <FormSteps
                currStep={currStep}
                setCurrStep={setCurrStep}
                generalMethods={generalMethods}
                benefitsMethods={benefitsMethods}
                eligibilityMethods={eligibilityMethods}
              />
              <div className="h-full w-full grow">
                <div className="h-full flex flex-col w-full mb-4">
                  <div className="grow">
                    {currStep === 2 ? ( // General step
                      <FormProvider {...generalMethods}>
                        <General />
                      </FormProvider>
                    ) : currStep === 3 ? ( // Benefits step
                      <FormProvider {...benefitsMethods}>
                        <Benefits setRewardData={setRewardData} />
                      </FormProvider>
                    ) : currStep === 4 ? ( // Eligibility step
                      <FormProvider {...eligibilityMethods}>
                        <Eligibility
                          rewardMethods={benefitsMethods}
                          setTelegramBotVerified={setTelegramBotVerified}
                        />
                      </FormProvider>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="h-fit flex gap-8 items-center justify-between p-4 rounded-lg bg-black-6">
                    <div className="max-w-1/2 flex items-center gap-4"></div>
                    <div className="flex items-center gap-4">
                      <Button variant="outlined" onClick={saveForLaterHandler}>
                        Save for later
                        <img
                          src="/images/saveForLater.png"
                          alt="#"
                          className="h-4 w-auto object-cover"
                        />
                      </Button>
                      <Button
                        onClick={nextHandler}
                        disabled={!submitButtonActive}
                      >
                        {currStep === 4 ? "Submit" : "Next"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Create;
