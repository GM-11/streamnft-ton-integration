"use client";
import React, { useMemo } from "react";
import StarImage from "../../../public/images/star2.png";
import { useWatch } from "react-hook-form";
import Image from "next/image";
import { CircleCheckIcon } from "@/components/Reusables/utility/Icons";
import { useRouter } from "next/router";

const FormSteps = ({
  currStep,
  setCurrStep,
  personaliseMethods,
  generalMethods,
  benefitsMethods,
  eligibilityMethods,
}) => {
  const generalValues = useWatch({
    control: generalMethods.control,
  });

  const benefitsValues = useWatch({
    control: benefitsMethods.control,
  });

  const eligibilityValues = useWatch({
    control: eligibilityMethods.control,
  });

  const { query } = useRouter();

  const options = useMemo(() => {
    return [
      {
        title: "General",
        completed: false,
      },
      {
        title: "Benefits",
        completed: false,
      },
      {
        title: "Tasks",
        completed: false,
      },
    ];
  }, [benefitsValues, generalValues, eligibilityValues]);

  const practicesMessage = useMemo(() => {
    if (currStep === 2) {
      return (
        <div className="flex flex-col gap-1">
          <span className="mb-1 font-normal">
            This is the first content users see about your campaign, so be as
            descriptive as possible to attract a larger audience.
          </span>
          <span className="mb-1 font-normal">
            📛
            <span className="font-semibold text-white">Collection</span>: Ensure
            the collection address is correct to avoid fake or replica NFT
            collections.
          </span>
          <span className="mb-1 font-normal">
            🏷️ <span className="font-semibold text-white">Title</span>: Convey
            the value or utility being offered immediately
          </span>
          <span className="mb-1 font-normal">
            🏢 <span className="font-semibold text-white">Industry Type</span> :
            Use standardized industry classifications for consistency and easier
            navigation.
          </span>
          <span className="mb-1">
            📝<span className="font-semibold text-white">Description</span> :
            Provide a comprehensive description covering all aspects of the
            benefit, including what it is, how it works, and the value it
            provides
          </span>
        </div>
      );
    } else if (currStep === 3) {
      return (
        <div className="flex flex-col gap-1">
          <span className="mb-1">
            <span className="font-semibold text-white">Benefit Type</span>:
            Choose the type of benefit (discounts, exclusive content, special
            access) and ensure redemption details (link, code, etc.) are easily
            accessible.
          </span>
          <span className="mb-1">
            <span className="font-semibold text-white">
              ⏰ Expiration Conditions
            </span>{" "}
            : Clearly state the exact time and conditions for when the benefit
            expires.
          </span>
          <span className="mb-1">
            <span className="font-semibold text-white">
              📦 Distribution Methods
            </span>{" "}
            : Communicate availability and limits. Use first-come, first-serve
            for urgency and lucky draws for excitement and engagement.
          </span>
        </div>
      );
    } else if (currStep === 4) {
      return (
        <div className="flex flex-col gap-1">
          <span className="mb-1">
            🏆 Set specific tasks for user to get benefits. More task they
            complete, better their chances of winning!
          </span>
          <span className="mb-1">
            <span className="font-semibold text-white">Worth#entries</span> :
            Attribute a value to each task to incentivize participation
          </span>
        </div>
      );
    } else return "";
  }, [currStep]);

  return (
    <div className="flex flex-col items-start w-full font-numans min-w-[18rem] max-w-[18rem] pr-6">
      <div className="flex flex-col items-center h-fit w-full transition-all duration-300">
        {options?.map((item, index) => (
          <div
            className={`w-full mb-6 rounded-md cursor-pointer relative group ${
              query?.id?.length > 0 && index === 1 && "cursor-not-allowed"
            } ${
              currStep === index + 2 && !item?.completed
                ? "min-h-[4rem] bg-blue-4"
                : currStep < index + 2
                ? item?.completed
                  ? "min-h-[4rem] bg-transparent border-transparent border-solid border-2"
                  : "min-h-[4rem] bg-transparent border-grayscale-2 border-solid border-2"
                : "min-h-[4rem] bg-transparent"
            }`}
            onClick={() => {
              if (query?.id?.length > 0 && index === 1) {
                return;
              } else {
                setCurrStep(index + 2);
              }
            }}
            key={index}
          >
            <div
              className={`w-full rounded-md overflow-hidden ${
                currStep > index + 2 || item?.completed
                  ? "bg-green-4"
                  : currStep === index + 2
                  ? "bg-gray-30"
                  : "bg-transparent"
              } flex flex-col gap-3 h-full absolute -top-1 p-3`}
            >
              {(currStep > index + 2 || item?.completed) && (
                <div className="w-64 h-64 bg-whitish-green opacity-10 -top-12 rotate-[17.5deg] absolute -left-24"></div>
              )}
              {(currStep > index + 2 || item?.completed) && (
                <div className="w-64 h-64 bg-whitish-green opacity-10 -top-12 rotate-[17.5deg] absolute -left-[70px]"></div>
              )}
              {currStep === index + 2 && (
                <Image
                  src={StarImage}
                  className="absolute right-0 h-24 w-24 top-0 opacity-100"
                  alt="star-img"
                />
              )}
              <div className="w-full h-full max-h-[4rem] flex items-center relative justify-between">
                <div
                  className={`${
                    currStep < index + 2
                      ? item?.completed
                        ? "text-white"
                        : "text-grayscale-2"
                      : "text-white"
                  }`}
                >
                  {item?.title}
                </div>
                {currStep > index + 2 || item?.completed ? (
                  <CircleCheckIcon color="white" />
                ) : (
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                      currStep < index + 2
                        ? "bg-grayscale-3 text-grayscale-4"
                        : "bg-blue-4 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                )}
              </div>
            </div>
            {query?.id?.length > 0 && index === 1 && (
              <span className="absolute top-[125%] z-[10000] left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-green-4 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                This step is not editable
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="h-fit mt-4 w-full bg-grayscale-19 p-4 rounded-md flex flex-col">
        <div className="h-fit w-fit px-4 py-1 mb-4 gap-3 flex items-center bg-[#FFFFFF21] rounded-full">
          {/* <Image
            src={HelpIcon}
            height={128}
            width={128}
            className="h-4 w-4 object-contain"
            alt="#"
          /> */}
          <h5 className="text-green-5 !text-sm font-numans">Best Practices</h5>
        </div>
        <div className="grow flex flex-col gap-1.5">
          <div className="text-xs text-faded-white font-normal">
            {practicesMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSteps;
