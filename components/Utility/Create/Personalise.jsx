import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Image from "next/image";
import { toast } from "react-toastify";
import Checkbox from "../../Reusables/utility/Checkbox";
import CreatorIcon from "../../../public/images/brand.png";
import ProviderIcon from "../../../public/images/nftProvider.png";
import Button from "../../Reusables/utility/Button";
import { RightAngleIcon, LeftIcon } from "../../Reusables/utility/Icons";

const CreatorComponent = ({ isSelected, onSelect }) => (
  <div
    className={`rounded-md w-full flex flex-col p-2 transition-all duration-300 ${
      isSelected ? "bg-green-4" : "bg-grayscale-17"
    }`}
  >
    <div
      className={`rounded relative ${
        isSelected ? "bg-grayscale-20" : "bg-grayscale-18"
      } flex flex-col justify-end items-center pt-6`}
    >
      <Checkbox
        checked={isSelected}
        onChange={onSelect}
        classes={"absolute top-3 left-3"}
      />
      <Image
        src={CreatorIcon}
        height={128}
        width={128}
        className="h-16 w-16 object-cover"
        alt="Quest"
      />
    </div>
    <h5
      className={`text-sm mt-2 ${
        isSelected ? "text-white" : "text-faded-white"
      }`}
    >
      Quest
    </h5>
    <p
      className={`text-xs mt-2 ${
        isSelected ? "text-white" : "text-faded-white"
      }`}
    >
      Looking to acquire NFT holders? Offer tangible benefits and get
      engagement.
    </p>
  </div>
);

const ProviderComponent = ({ isSelected, onSelect }) => (
  <div
    className={`rounded-md w-full flex flex-col p-2 transition-all duration-300 ${
      isSelected ? "bg-green-4" : "bg-grayscale-17"
    }`}
  >
    <div
      className={`rounded relative ${
        isSelected ? "bg-grayscale-20" : "bg-grayscale-18"
      } flex flex-col justify-end items-center pt-6`}
    >
      <Checkbox
        checked={isSelected}
        onChange={onSelect}
        classes={"absolute top-3 left-3"}
      />
      <Image
        src={ProviderIcon}
        height={128}
        width={128}
        className="h-16 w-16 object-cover"
        alt="NFT Creator"
      />
    </div>
    <h5
      className={`text-sm mt-2 ${
        isSelected ? "text-white" : "text-faded-white"
      }`}
    >
      Benefits
    </h5>
    <p
      className={`text-xs mt-2 ${
        isSelected ? "text-white" : "text-faded-white"
      }`}
    >
      Revitalize dormant NFT holders by offering exciting tangible benefits.
    </p>
  </div>
);

const Tooltip = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute hidden group-hover:block whitespace-nowrap bg-green-7 text-white text-xs rounded px-2 py-1 -translate-y-8 left-1/2 transform -translate-x-1/2">
        {text}
      </div>
    </div>
  );
};

const Personalise = ({ setCurrStep }) => {
  const { control, getValues, setValue } = useFormContext();
  const isProvider = useWatch({ name: "isProvider", control });
  const isCreator = useWatch({ name: "isCreator", control });

  const handleCheckboxChange = (name) => {
    const values = getValues();
    const newValue = !values[name];

    // Update form values
    setValue("isProvider", name === "isProvider" ? newValue : false);
    setValue("isCreator", name === "isCreator" ? newValue : false);
  };

  const handleOptionChange = (option) => {
    setValue("benefitUtilityType", option);
    setValue("targetCollection", option === "targetCollection");
    setValue("autotargetCollection", option === "autotargetCollection");
  };

  return (
    <div className="h-fit pt-20 !font-numans w-full rounded-2xl flex items-center justify-center p-8">
      <div className="max-w-[420px] h-fit flex flex-col gap-4">
        <h1 className="font-numans text-center text-green-10 text-xl">
          Create Your Personalized Benefit
        </h1>
        <h5 className="text-xs text-center text-grayscale-10 ">
          Tell us about yourself so we can tailor the creation experience just
          for you!
        </h5>
        <div className="h-[2px] w-full bg-grayscale-16"></div>
        <div className="mt-2 mb-4 w-full flex flex-col text-xs">
          <h5 className="text-white text-sm mb-4">
            Are you looking to create?
          </h5>
          {true && (
            <div className="h-fit w-full flex gap-4">
              {/* Creator Option */}
              <Controller
                name="isCreator"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <CreatorComponent
                    isSelected={field.value}
                    onSelect={() => handleCheckboxChange("isCreator")}
                  />
                )}
              />

              {/* Provider Option */}
              <Controller
                name="isProvider"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <ProviderComponent
                    isSelected={field.value}
                    onSelect={() => handleCheckboxChange("isProvider")}
                  />
                )}
              />
            </div>
          )}

          {isProvider && (
            <div className="mt-4 flex flex-col gap-4">
              {/* Options for Provider */}
              <div className="rounded-md flex flex-col p-2 bg-grayscale-17">
                <Controller
                  name="targetCollection"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <div
                      className={`rounded flex flex-row items-center w-full justify-between px-4`}
                    >
                      <div className="flex flex-col items-start">
                        <h5 className="text-sm text-white">
                          Target Collection
                        </h5>
                        <p className="text-xs text-faded-white">
                          Description for Target Collection
                        </p>
                      </div>

                      <Checkbox
                        checked={field.value}
                        onChange={() => {
                          handleOptionChange(
                            field.value ? null : "targetCollection"
                          );
                          setValue("targetCollection", !field.value);
                        }}
                        classes={"top-3 left-3"}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="rounded-md flex flex-col p-2 bg-grayscale-17">
                <Controller
                  name="autotargetCollection"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <div
                      className={`rounded flex flex-row items-center w-full justify-between px-4`}
                    >
                      <div className="flex flex-col items-start">
                        <h5 className="text-sm text-white">
                          Auto Target Collection
                        </h5>
                        <p className="text-xs text-faded-white">
                          Description for Auto Target Collection
                        </p>
                      </div>

                      <Tooltip text="This feature is coming soon!">
                        <span>
                          <Checkbox
                            checked={field.value}
                            onChange={() => {}}
                            classes={"top-3 left-3"}
                            disabled={true}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  )}
                />
              </div>
            </div>
          )}
        </div>
        <div className="h-[2px] w-full bg-grayscale-16"></div>
        <div className="w-full h-fit flex justify-between">
          <Button onClick={() => setCurrStep(0)}>
            <LeftIcon />
            Back
          </Button>
          <Button
            onClick={() => {
              if (!isCreator && !isProvider) {
                toast.error("Please select a profile to continue your journey");
              } else setCurrStep(2); // Proceed to the next step
            }}
          >
            Next
            <RightAngleIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Personalise;
