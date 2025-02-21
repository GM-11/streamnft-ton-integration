"use client";
import React, { useState, useEffect, useMemo, useContext } from "react";
import SaveChangesModal from "@/components/Reusables/utility/Modals/SaveChangesModal";
import { useRouter } from "next/router";
import {
  Benefits,
  Eligibility,
  FormSteps,
  General,
} from "@/components/Utility";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Button from "@/components/Reusables/utility/Button";
import utilityCalls from "@/services/utility/utilityCalls";
import { useAccount } from "wagmi";
import {
  reversePrepareRequirements,
  updateCollectionAndUtility,
} from "@/utils/BackendCalls";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";
import { ChainContext } from "@/context/ChainContext";
import formValidation from "@/hooks/formValidation";
import { useSigner } from "@/context/SignerContext";
import { toast } from "react-toastify";
import { checkPairing } from "@/utils/HederaContract";
import { utilityContext } from "@/context/UtilityContext";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const index = () => {
  const [currStep, setCurrStep] = useState(2);
  const [loading, setLoading] = useState(true);
  const [rewardData, setRewardData] = useState({});
  const [telegramBotVerified, setTelegramBotVerified] = useState(true);
  const [submitButtonActive, setSubmitButtonActive] = useState(false);
  const [backendDataFetched, setBackendDataFetched] = useState(true);
  const [allowNavigation, setAllowNavigation] = useState(false);

  const router = useRouter();
  const benefitsMethods = useForm();
  const eligibilityMethods = useForm();
  const generalMethods = useForm();
  const { address, isConnected } = useUserWalletContext();
  const { signer } = useSigner();
  const { rewardsOptionsData, eligibilityOptions, setEligibilityOptions } =
    useContext(CreateUtilityContext);
  const { showPageSwitchModal, setShowPageSwitchModal, clickedLink } =
    useContext(utilityContext);
  const { chainDetail, selectedChain } = useContext(ChainContext);

  const formArray = useWatch({
    name: "formArray",
    control: eligibilityMethods.control,
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!allowNavigation) {
        event.preventDefault();
        event.returnValue = "";
        router.events.emit("routeChangeError");
        throw "Route change aborted.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router, allowNavigation]);

  const getPageData = async () => {
    try {
      setBackendDataFetched(true);
      setLoading(true);
      const response = await utilityCalls.getUtilityDetails(
        router?.query?.id,
        address
      );

      const utilityData = response?.data?.collectionUtility;

      setRewardData(utilityData?.reward);

      const generalFormData = {
        title: utilityData?.title,
        description: utilityData?.description,
        industryType: {
          label: utilityData?.industry_type,
          value: utilityData?.industry_type,
        },
        collectionFromBackend: utilityData?.target?.[0]?.collection,
        tokenAddress: utilityData?.target?.[0]?.collection,
        images: [utilityData?.image_url],
        traitsArray: utilityData?.target?.[0]?.traits?.map((el, idx) => {
          return {
            name: `NFT Trait ${idx + 1}`,
            selectedOption: el?.key,
            selectedTag: el?.value,
          };
        }),
      };

      generalMethods.reset(generalFormData);

      const selectedUtilityType = rewardsOptionsData?.find(
        (el) => el?.title === utilityData?.utilityType
      );

      const benefitsFormData = {
        utilityType: selectedUtilityType,
        selectedFormElement: "utility-details",
        campaignMethod: utilityData?.selectionType,
        congratulationText: utilityData?.reward?.congratulationText,
        reward_type: utilityData?.reward?.type ?? "url",
        numberOfWinners: utilityData?.reward?.count,
        // expiringConditions: utilityData?.expiringConditions?.value,
        estimatedPrize: utilityData?.reward?.estimatedValue,
        currency: utilityData?.reward?.currency,
        expiry: new Date(utilityData.reward?.raffleEndDate).getTime(),
        congratulationText: utilityData?.reward?.congratulationText,
        totalAmount:
          utilityData?.reward?.estimatedValue * utilityData?.reward?.count,
        raffleStartDate: new Date(utilityData?.startDate), //ok
        raffleEndDate: new Date(utilityData?.endDate),
        raffleClaimDate: new Date(utilityData?.raffle?.claimDate), //ok
      };

      benefitsMethods.reset(benefitsFormData);

      const eligibilities = Object.keys(utilityData?.eligible);

      const selectedEligibilities = eligibilityOptions?.map((el) =>
        eligibilities?.includes(el?.title)
          ? { ...el, active: true }
          : { ...el, active: false }
      );

      setEligibilityOptions(selectedEligibilities);

      const eligibilityFormData = reversePrepareRequirements(
        selectedEligibilities,
        utilityData?.eligible
      );

      eligibilityMethods.reset({ formArray: eligibilityFormData });

      setBackendDataFetched(false);
      setLoading(false);
    } catch (e) {}
  };

  useEffect(() => {
    if (
      router?.query?.id?.length > 0 &&
      eligibilityOptions?.length > 0 &&
      rewardsOptionsData?.length > 0 &&
      backendDataFetched
    ) {
      getPageData();
    }
  }, [router, rewardsOptionsData, eligibilityOptions]);

  const handleSaveChanges = async () => {
    try {
      if (chainDetail?.evm && isConnected && address) {
        setLoading(true);
        setAllowNavigation(true);
        await updateCollectionAndUtility({
          id: router?.query?.id,
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
            router.push("/utility/manage");
            setShowPageSwitchModal(false);
          },
          onError: () => {
            setLoading(false);
            setShowPageSwitchModal(false);
          },
          signer,
        });
      } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
        setAllowNavigation(true);
        const checkPair = checkPairing();
        if (!checkPair && accountId !== null) {
          setLoading(false);
          toast.error("Connect your wallet");
          return;
        }
        setLoading(true);
        await updateCollectionAndUtility({
          id: router?.query?.id,
          utility: generalMethods.getValues(),
          reward: {
            ...benefitsMethods.getValues(),
            completeRewardData: rewardData,
          },
          requirements: eligibilityMethods.getValues(),
          chainDetail,
          userAddress: chainDetail?.evm ? address : accountId,
          onComplete: () => {
            window.removeEventListener("beforeunload", () => {});

            setLoading(false);
            router.push("/utility/manage");
            setShowPageSwitchModal(false);
          },
          onError: () => {
            setLoading(false);
            setShowPageSwitchModal(false);
          },
          signer,
        });
      }
    } catch (error) {
      setLoading(false);
      setAllowNavigation(false);

      setShowPageSwitchModal(false);
      console.error("Error occurred while saving changes:", error);
      toast.error("An error occurred while saving changes. Please try again.");
    }
  };

  const handleDiscardChanges = () => {
    setShowPageSwitchModal(false);
    router.push(clickedLink);
  };

  const handleCancel = () => {
    setShowPageSwitchModal(false);
  };

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

  const nextHandler = async () => {
    if (currStep < 4 && currStep >= 0) {
      if (currStep === 2) {
        setCurrStep(currStep + 2);
        window.scrollTo(0, 0);
      }
    }

    if (currStep === 4) {
      if (!formValidation(2, generalMethods)) {
        if (!formValidation(2, generalMethods)) {
          toast.error("Required fields are missing at General section.");
        }
      } else {
        if (chainDetail?.evm && isConnected && address) {
          setLoading(true);
          setAllowNavigation(true);
          await updateCollectionAndUtility({
            id: router?.query?.id,
            utility: generalMethods.getValues(),
            reward: {
              ...benefitsMethods.getValues(),
              completeRewardData: rewardData,
            },
            requirements: eligibilityMethods.getValues(),
            chainDetail,
            userAddress: chainDetail?.evm ? address : accountId,
            onComplete: async () => {
              setLoading(false);
              window.open("/utility/manage", "_self");
            },
            onError: () => {
              setAllowNavigation(false);
              setLoading(false);
            },
            signer,
          });
        } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
          const checkPair = checkPairing();
          setAllowNavigation(true);
          if (!checkPair && accountId !== null) {
            setLoading(false);
            toast.error("Connect your wallet");
            return;
          }
          setLoading(true);
          await updateCollectionAndUtility({
            id: router?.query?.id,
            utility: generalMethods.getValues(),
            reward: {
              ...benefitsMethods.getValues(),
              completeRewardData: rewardData,
            },
            requirements: eligibilityMethods.getValues(),
            chainDetail,
            userAddress: chainDetail?.evm ? address : accountId,
            onComplete: async () => {
              setLoading(false);
              window.open("/utility/manage", "_self");
            },
            onError: () => {
              setAllowNavigation(false);

              setLoading(false);
            },
            signer,
          });
        }
      }
    }
  };

  return (
    <>
      <>
        <div className="grow w-full px-8 lg:px-12 py-4 pt-8 flex font-numans">
          {loading && !showPageSwitchModal ? (
            <div className="w-full flex items-center justify-center h-48">
              <Loader
                customMessage={
                  backendDataFetched
                    ? "Fetching utility data"
                    : "Updating Utility Data ..."
                }
              />
            </div>
          ) : (
            <>
              <div className="flex grow rounded-lg py-4 min-h-full">
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
                      {currStep === 2 ? (
                        <FormProvider {...generalMethods}>
                          <General />
                        </FormProvider>
                      ) : currStep === 3 ? (
                        <FormProvider {...benefitsMethods}>
                          <Benefits setRewardData={setRewardData} />
                        </FormProvider>
                      ) : currStep === 4 ? (
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
                        <Button variant="outlined">
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
                          {currStep === 3 ? "Update" : "Next"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
      <SaveChangesModal
        open={showPageSwitchModal}
        handleClose={handleCancel}
        onSave={handleSaveChanges}
        onDiscard={handleDiscardChanges}
        onCancel={handleCancel}
        loading={loading}
      />
    </>
  );
};

export default index;
