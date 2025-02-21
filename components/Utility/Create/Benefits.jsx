import React, { useContext, useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Input from "../../Reusables/utility/Input";
import Dropdown from "../../Reusables/utility/Dropdown";
import Radio from "../../Reusables/utility/Radio";
import DatePicker from "../../Reusables/utility/DatePicker";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";
import Image from "next/image";
import { MinusIcon, PlusIcon, TrashIcon } from "../../Reusables/utility/Icons";
import dynamic from "next/dynamic";
import { ChainContext } from "@/context/ChainContext";
import { useRouter } from "next/router";
const SingleSelectCheckbox = dynamic(
  () => import("../../Reusables/utility/SingleSelectCheckbox"),
  { ssr: false }
);

const Benefits = ({ setRewardData }) => {
  const { query } = useRouter();
  const { register, setValue, getValues, formState, control } =
    useFormContext();

  const expiringConditionData = useWatch({
    name: "expiringConditions",
    control,
  });

  const utilityTypeValue = useWatch({ name: "utilityType", control });

  const campaignMethod = useWatch({ name: "campaignMethod", control });

  const numberOfWinners = useWatch({ name: "numberOfWinners", control });

  const estimatedPrize = useWatch({ name: "estimatedPrize", control });

  const currency = useWatch({ name: "currency", control });

  const formValues = useWatch({ control });

  const { rewardsOptionsData } = useContext(CreateUtilityContext);

  const { chainDetails } = useContext(ChainContext);

  const MemoisedExpiringConditionsComponent = useMemo(() => {
    return (
      <>
        {expiringConditionData === "date_based" ? (
          <div className="flex w-full gap-4 mt-4">
            <div className="grow max-w-[50%] flex pr-4 flex-row-reverse border border-solid border-black-6 bg-grayscale-22 whitespace-nowrap items-center text-faded-white rounded-lg">
              <DatePicker
                name="rewardStartDate"
                placeholder={"Reward Start Date"}
                defaultValue={new Date()}
              />
            </div>
            <div className="grow max-w-[50%] flex pr-4 flex-row-reverse border border-solid border-black-6 bg-grayscale-22 whitespace-nowrap items-center text-faded-white rounded-lg">
              <DatePicker
                name="rewardEndDate"
                placeholder={"Reward End Date"}
                defaultValue={new Date()}
              />
            </div>
          </div>
        ) : expiringConditionData === "use_based" ? (
          <div className="grow">
            <Input
              reactHookFormRegister={{
                ...register("rewardUseCount"),
              }}
              placeholder="Set the use count for the reward"
              containerClasses={"mt-4 bg-grayscale-22"}
            />
          </div>
        ) : expiringConditionData === "time_based" ? (
          <div className="grow">
            <Input
              reactHookFormRegister={{
                ...register("rewardExpiry"),
              }}
              placeholder="Set the expiry duration in Days"
              containerClasses={"mt-4 bg-grayscale-22"}
            />
          </div>
        ) : null}
      </>
    );
  }, [expiringConditionData]);

  const selectedOptionsQuestions = useMemo(() => {
    const selectedOption = rewardsOptionsData?.find(
      (el) => el?.title === utilityTypeValue?.title
    );

    let formComponentsArray = [];

    if (
      selectedOption?.reward_type === "nft" ||
      selectedOption?.reward_type === "ft"
    ) {
      formComponentsArray.push(
        <>
          <div className="mb-6">
            <h5 className="mb-2 text-white text-sm">Select Chain </h5>

            <Dropdown
              name="contractChainId"
              placeholder={"Select Contract Chain"}
              valueContainerClasses={"!text-xs !bg-grayscale-22"}
              items={chainDetails?.map((el) => {
                return { label: el?.chain_name, value: el };
              })}
              onSelect={(el) => {
                setValue("contractChainId", el?.value?.chain_id);
              }}
              classes={{ optionsWrapper: "!bg-grayscale-22" }}
            />
          </div>

          {!!formState?.errors?.chainId && (
            <p className="text-remDays-block text-xs">
              {formState?.errors?.chainId?.message}
            </p>
          )}
        </>
      );
    }

    if (selectedOption?.form) {
      for (const item of selectedOption?.form) {
        formComponentsArray.push(
          <>
            <h5 className="mb-2 text-white text-sm">{item?.displayText}</h5>
            <Controller
              name={item?.displayText}
              control={control}
              render={({ field }) => (
                <Input
                  containerClasses={"bg-grayscale-22 mb-4"}
                  {...field}
                  placeholder={"Enter here ... "}
                  disableEffect={query?.id?.length > 0}
                />
              )}
            />
            {!!formState?.errors?.[`${item?.displayText}`] && (
              <p className="text-remDays-block text-xs">
                {formState?.errors?.[`${item?.displayText}`]?.message}
              </p>
            )}
          </>
        );
      }
      return formComponentsArray;
    }
  }, [utilityTypeValue, rewardsOptionsData]);

  const utilityTypeOptions = useMemo(() => {
    const selectedOption = rewardsOptionsData?.find(
      (el) => el?.title === utilityTypeValue?.title
    );

    if (selectedOption?.options?.length > 0) {
      return <SingleSelectCheckbox data={selectedOption?.options} />;
    }
  }, [utilityTypeValue, rewardsOptionsData]);

  const totalAmountValue = useMemo(() => {
    return numberOfWinners === "" || estimatedPrize === ""
      ? ""
      : `${currency} ${Number(numberOfWinners) * Number(estimatedPrize)}`;
  }, [numberOfWinners, estimatedPrize, currency]);

  useEffect(() => {
    const selectedOption = formValues?.utilityType;

    const enteredFormValues = selectedOption?.form?.map((el) => {
      return {
        [`${el.displayText}`]: formValues[el?.displayText],
        displayText: el?.displayText,
        storeAs: el?.storeAs,
      };
    });

    const selectedOptionValue = selectedOption?.options?.find(
      (el) => el?.title === formValues?.selectedOptionInUtilityType
    );

    const enteredOptionValues = selectedOptionValue?.form?.map((el) => {
      return {
        [`${el.displayText}`]: formValues[el?.displayText],
        displayText: el?.displayText,
        storeAs: el?.storeAs,
      };
    });

    const rewardData = {
      type: selectedOption?.reward_type ?? "url",
      count: formValues?.numberOfWinners,
      usage_type: formValues?.expiringConditions?.value,
      estimatedValue: formValues?.estimatedPrize,
      price_currency: formValues?.currency,
      expiry: new Date(formValues.raffleEndDate).getTime(),
      congratulationText: formValues?.congratulationText,
      totalAmount: formValues?.estimatedPrize * formValues?.numberOfWinners,
      secret: {},
    };

    if (enteredFormValues?.length > 0) {
      for (const item of enteredFormValues) {
        if (item.storeAs === "details") {
          rewardData[item.storeAs] = item[item.displayText]?.split(",");
        } else {
          rewardData[item.storeAs] = item[item.displayText];
        }
      }
    }

    if (enteredOptionValues?.length > 0) {
      for (const item of enteredOptionValues) {
        if (item.storeAs === "details") {
          rewardData[item.storeAs] = item[item.displayText].split(",");
        } else {
          rewardData[item.storeAs] = item[item.displayText];
        }
      }
    }

    if (rewardData?.type === "url") {
      rewardData.secret.value = formValues?.congratulationText ?? "";
    } else if (rewardData?.type === "nft") {
      rewardData.secret.value = rewardData?.value ?? "";
      rewardData.secret.details = rewardData?.details ?? [];
    } else if (rewardData?.type === "ft") {
      rewardData.secret.value = rewardData?.value ?? "";
      rewardData.secret.details = rewardData?.details ?? [];
    }

    setRewardData(rewardData);
  }, [formValues]);

  const raffleEndDateValue = useWatch({ name: "raffleEndDate", control });

  const selectedFormElementValue = useWatch({
    name: "selectedFormElement",
    control,
  });

  return (
    <>
      <h3 className="text-3xl">Rewards</h3>
      <div className="my-4 w-full  flex border-[#FFFFFF1A] border-t border-b border-solid">
        <div className="min-w-fit flex flex-col gap-4 items-start p-6">
          <h5 className="text-white text-lg">Utility Type</h5>
          <p className="text-faded-white text-sm">
            Select the reward <br /> type for the Utility
          </p>
        </div>
        <div className="grow flex flex-wrap gap-4 p-6 pr-0 border-[#FFFFFF1A] border-solid border-l">
          {rewardsOptionsData?.map((el) => (
            <div
              className={`w-fit px-3 flex items-center gap-6 cursor-pointer p-2 rounded-md transition-all duration-300 ${
                utilityTypeValue?.title === el?.title
                  ? "bg-green-4"
                  : "bg-[#171717]"
              } ${query?.id?.length > 0 && "pointer-events-none"}`}
              onClick={() => {
                if (getValues("utilityType")?.title === el?.title) {
                  setValue("utilityType", "");
                } else {
                  setValue("utilityType", el);
                  setValue("selectedFormElement", "utility-details");
                  setValue("congratulationText", el?.congratulationText);
                }
              }}
            >
              <div className="flex items-center text-white text-xs gap-2">
                <Image
                  src={el?.image_url}
                  className="h-5 w-5 object-cover"
                  height={48}
                  width={48}
                />
                {el?.title}
              </div>
              {!(query?.id?.length > 0) && (
                <>
                  {utilityTypeValue?.title === el?.title ? (
                    <MinusIcon color="#fff" size={21} />
                  ) : (
                    <PlusIcon color="#fff" size={21} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {utilityTypeValue?.title && (
        <div className="bg-grayscale-25 p-4 rounded-md w-full h-fit">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-lg text-faded-white">
                {utilityTypeValue?.title}
              </h5>
              <p className="mt-3 text-grayscale-10 text-xs">
                {utilityTypeValue?.description}
              </p>
            </div>
            {!(query?.id?.length > 0) && (
              <TrashIcon
                size={21}
                color="red"
                className="cursor-pointer"
                onClick={() => setValue("utilityType", "")}
              />
            )}
          </div>
          <div className="w-full my-4 flex gap-4 items-center justify-start border-b border-solid border-[#FFFFFF1A]">
            <h5
              className={`text-xs cursor-pointer transition-all duration-300 border-b-2 p-0.5 px-2 border-solid ${
                selectedFormElementValue === "utility-details"
                  ? "text-green-4 border-green-4"
                  : "text-faded-white border-transparent"
              } `}
              onClick={() => setValue("selectedFormElement", "utility-details")}
            >
              Reward Details
            </h5>
            <h5
              className={`text-xs cursor-pointer transition-all duration-300 border-b-2 p-0.5 px-2 border-solid ${
                selectedFormElementValue === "distribution-details"
                  ? "text-green-4 border-green-4"
                  : "text-faded-white border-transparent"
              } `}
              onClick={() =>
                setValue("selectedFormElement", "distribution-details")
              }
            >
              Distribution Details
            </h5>
          </div>
          <div className="my-2 p-2">
            {selectedFormElementValue === "utility-details" ? (
              <>
                <div className="mt-2">
                  <div className="w-full flex mt-2 mb-4 gap-4 items-start">
                    <div className="grow max-w-1/3">
                      <div className="w-full rounded-md flex whitespace-nowrap items-center text-faded-white">
                        <Input
                          label={"Number of winners"}
                          placeholder={"Set the number of winners"}
                          reactHookFormRegister={{
                            ...register("numberOfWinners"),
                          }}
                          containerClasses={"!bg-grayscale-22"}
                          labelClasses={"!text-sm"}
                          disableEffect={query?.id?.length > 0}
                        />
                      </div>
                      {!!formState?.errors?.numberOfWinners && (
                        <p className="text-remDays-block text-xs">
                          {formState?.errors?.numberOfWinners?.message}
                        </p>
                      )}
                    </div>
                    <div className="grow max-w-1/3">
                      <h5 className="text-white mb-2 !text-sm">
                        Reward value/Winner
                      </h5>
                      <div className="w-full flex whitespace-nowrap items-center text-faded-white  relative">
                        {/* {query?.id?.length > 0 && (
                          <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
                        )} */}
                        <Input
                          reactHookFormRegister={{
                            ...register("estimatedPrize"),
                          }}
                          containerClasses={"!bg-grayscale-22 !rounded-r-none"}
                        />

                        <div className="min-w-[100px] max-w-[100px]">
                          <Dropdown
                            name="currency"
                            items={[
                              { label: "USD", value: "USD" },
                              { label: "INR", value: "INR" },
                            ]}
                            valueContainerClasses={
                              "!rounded-l-none !bg-grayscale-22"
                            }
                          />
                        </div>
                      </div>
                      {!!formState?.errors?.estimatedPrize && (
                        <p className="text-remDays-block text-xs">
                          {formState?.errors?.estimatedPrize?.message}
                        </p>
                      )}
                    </div>
                    <div className="grow max-w-1/3 rounded-md flex whitespace-nowrap items-center text-faded-white">
                      <Input
                        label={"Total Reward Amount"}
                        value={totalAmountValue}
                        containerClasses={"!bg-grayscale-22"}
                        disabled
                        labelClasses={"!text-sm"}
                        disableEffect={false}
                      />
                    </div>
                  </div>
                </div>
                {selectedOptionsQuestions}
                {utilityTypeOptions}
                {utilityTypeValue?.showExpiryOption && (
                  <div className="w-full mt-2">
                    <h5 className="text-white mb-2">Reward Validity</h5>
                    <div className="w-full">
                      <Dropdown
                        placeholder={"Expiration conditions"}
                        name="expiringConditions"
                        items={[
                          // { label: "Use Based Expiry", value: "use_based" },
                          { label: "Time Bound Expiry", value: "date_based" },
                          { label: "None", value: "none" },
                        ]}
                        valueContainerClasses={"!bg-grayscale-22 !text-sm"}
                      />
                    </div>
                    <div className="w-full gap-4 flex">
                      {MemoisedExpiringConditionsComponent}
                    </div>
                  </div>
                )}
                {utilityTypeValue?.title && (
                  <div className="my-4">
                    <h5 className="mt-2 text-sm">Reward Experience</h5>
                    <Input
                      label={
                        "Leave a short message for the winners with details on how to claim their reward"
                      }
                      labelClasses={"!text-xs mt-1 !text-faded-white"}
                      mainContainerClassnames={"h-28"}
                      inputClasses={"h-full text-faded-white !bg-grayscale-22"}
                      multiline
                      placeholder={"Enter your message here"}
                      reactHookFormRegister={{
                        ...register("congratulationText"),
                      }}
                    />
                  </div>
                )}
              </>
            ) : selectedFormElementValue === "distribution-details" ? (
              <>
                <div className="grow w-full flex gap-4">
                  <div
                    className={`cursor-pointer rounded-lg grow h-12 flex  items-center justify-between px-4 transition-none duration-300 ${
                      query?.id?.length > 0 && "pointer-events-none"
                    } ${
                      campaignMethod === "raffle"
                        ? "bg-green-4 text-white"
                        : "bg-grayscale-22 text-grey"
                    }`}
                    onClick={() => setValue("campaignMethod", "raffle")}
                  >
                    <h5>Lucky Draw</h5>
                    <Radio name="campaignMethod" value="raffle" />
                  </div>
                  <div
                    className={`cursor-pointer grow rounded-lg h-12 flex  items-center justify-between px-4 transition-none duration-300 ${
                      query?.id?.length > 0 && "pointer-events-none"
                    } ${
                      campaignMethod === "first_come"
                        ? "bg-green-4 text-white"
                        : "bg-grayscale-22 text-grey"
                    }`}
                    onClick={() => setValue("campaignMethod", "first_come")}
                  >
                    <h5>Instant Reward</h5>
                    <Radio name="campaignMethod" value="first_come" />
                  </div>
                </div>
                <div className="w-full flex gap-4 my-4">
                  {campaignMethod === "raffle" ? (
                    <div className="w-full flex flex-col">
                      <div className="w-full flex gap-4">
                        <div className="max-w-[50%] grow">
                          <div className="flex flex-row-reverse rounded-md border border-solid border-grayscale-22 bg-grayscale-22 whitespace-nowrap items-center text-faded-white pr-3">
                            <h5 className={`font-medium text-base `}>
                              Start Date
                            </h5>
                            <DatePicker
                              name="raffleStartDate"
                              placeholder={"Enter the campaign start date"}
                              disableEffect={query?.id?.length > 0}
                              defaultValue={new Date()}
                            />
                          </div>
                          {!!formState?.errors?.raffleStartDate && (
                            <p className="text-remDays-block text-xs">
                              {formState?.errors?.raffleStartDate?.message}
                            </p>
                          )}
                        </div>
                        <div className="max-w-[50%] grow">
                          <div className="flex flex-row-reverse rounded-md border border-solid border-grayscale-22 bg-grayscale-22 whitespace-nowrap items-center text-faded-white pr-3">
                            <h5 className={`font-medium text-base`}>
                              Draw Date
                            </h5>
                            <DatePicker
                              name="raffleEndDate"
                              placeholder={"Enter the campaign end date"}
                              defaultValue={new Date()}
                            />
                          </div>
                          {!!formState?.errors?.raffleEndDate && (
                            <p className="text-remDays-block text-xs">
                              {formState?.errors?.raffleEndDate?.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full flex my-4 pr-10">
                        <div className="max-w-[50%] grow">
                          <div className="flex flex-row-reverse rounded-md border border-solid border-black-6 bg-grayscale-22 whitespace-nowrap items-center text-faded-white pr-3">
                            <h5 className={`font-medium text-base`}>
                              Claim date
                            </h5>
                            <DatePicker
                              name="raffleClaimDate"
                              placeholder={"Enter the last claiming date"}
                              minDate={
                                raffleEndDateValue !== ""
                                  ? new Date(raffleEndDateValue)
                                  : new Date(0, 0, 0, 0)
                              }
                            />
                          </div>
                          {!!formState?.errors?.claimingEndDate && (
                            <p className="text-remDays-block text-xs">
                              {formState?.errors?.claimingEndDate?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex gap-4">
                      <div className="max-w-[50%] grow">
                        <div className="flex flex-row-reverse rounded-md border border-solid border-grayscale-22 bg-grayscale-22 whitespace-nowrap items-center text-faded-white pr-3 relative">
                          {query?.id?.length > 0 && (
                            <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
                          )}
                          <h5 className={`font-medium text-base `}>
                            Start Date
                          </h5>
                          <DatePicker
                            name="raffleStartDate"
                            placeholder={"Enter the campaign start date"}
                            defaultValue={new Date()}
                          />
                        </div>
                        {!!formState?.errors?.raffleStartDate && (
                          <p className="text-remDays-block text-xs">
                            {formState?.errors?.raffleStartDate?.message}
                          </p>
                        )}
                      </div>
                      <div className="max-w-[50%] grow">
                        <div className="flex flex-row-reverse rounded-md border border-solid border-grayscale-22 bg-grayscale-22 whitespace-nowrap items-center text-faded-white pr-3">
                          <h5 className={`font-medium text-base`}>Draw Date</h5>
                          <DatePicker
                            name="raffleEndDate"
                            placeholder={"Enter the campaign end date"}
                          />
                        </div>
                        {!!formState?.errors?.raffleEndDate && (
                          <p className="text-remDays-block text-xs">
                            {formState?.errors?.raffleEndDate?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Benefits;
