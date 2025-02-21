import React, { useContext, useState } from "react";
import { CloseIcon } from "../../../Reusables/utility/Icons";
import Input from "../../../Reusables/utility/Input";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Checkbox from "../../../Reusables/utility/Checkbox";
import Button from "../../../Reusables/utility/Button";
import utilityCalls from "@/services/utility/utilityCalls";
import Test from "../../../Test";
import { ChainContext } from "@/context/ChainContext";

const FormPopup = ({
  data,
  title,
  closeHandler,
  index,
  rewardMethods,
  setTelegramBotVerified,
  key,
}) => {
  const methods = useFormContext();
  const [botVerified, setBotVerified] = useState(false);
  const [verifiedButtonClicked, setVerifiedButtonClicked] = useState(false);
  const [checkingBotStatus, setCheckingBotStatus] = useState(false);
  const { chainDetail } = useContext(ChainContext);

  const campaignMethod = useWatch({
    name: "campaignMethod",
    control: rewardMethods.control,
  });

  const inviteLinkValue = useWatch({
    name: `formArray.${index}.targetURL`,
    control: methods.control,
  });

  const checkTelegramBotStatus = async () => {
    setCheckingBotStatus(true);
    try {
      const encodedUrl = encodeURIComponent(inviteLinkValue);
      const response = await utilityCalls.checkTelegramBotStatus(
        encodedUrl,
        chainDetail?.chain_id
      );

      if (response?.data?.success) {
        setVerifiedButtonClicked(true);
        setCheckingBotStatus(false);

        setBotVerified(true);
        setTelegramBotVerified(true);
      } else {
        setVerifiedButtonClicked(true);
        setCheckingBotStatus(false);

        setBotVerified(false);
        setTelegramBotVerified(false);
      }
    } catch (error) {}
  };

  const botName =
    process.env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "streamnft_test_bot"
      : "streamnft_prod_bot";

  return (
    <>
      <div className="text-white bg-transparent rounded-lg min-h-fit pb-16 mb-6 border-2 border-solid border-blue-5">
        <div className="flex justify-between items-center px-6 py-4 bg-blue-5  mb-4 rounded-t-lg">
          <span>{title}</span>
          <CloseIcon onClick={closeHandler} className="cursor-pointer" />
        </div>
        <div className="px-6">
          <div className="flex items-center gap-6 w-full mb-4">
            {campaignMethod === "raffle" && (
              <div className="flex items-center gap-2 w-1/3 whitespace-nowrap">
                <h5>Worth# Entries</h5>
                <Input
                  containerClasses={"max-w-[150px]"}
                  reactHookFormRegister={{
                    ...methods.register(`formArray.${index}.entries`),
                  }}
                />
              </div>
            )}
            <Controller
              name={`formArray.${index}.mandatory`}
              control={methods.control}
              render={({ field }) => {
                return (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      {...field}
                      onChange={(e) => {
                        field?.onChange(e?.target?.checked);
                      }}
                      checked={field.value}
                    />
                    <h5>Mandatory</h5>
                  </div>
                );
              }}
            />
          </div>
          {data?.heading?.toLowerCase() === "join telegram" ? (
            <div className="my-2 ">
              {botVerified && verifiedButtonClicked ? (
                <h5 className="text-sm mt-5 text-green">
                  Your Link is verified successfully. You can proceed now
                </h5>
              ) : !botVerified && verifiedButtonClicked ? (
                <h5 className="text-sm mt-5 text-red">
                  Looks like you haven't integrated our bot yet. Please
                  integrate it, and try again
                </h5>
              ) : (
                <>
                  <h5>
                    Please Follow these steps, To integrate your telegram with
                    our platform
                    <span className="mt-5 text-sm block">
                      Step 1: Please add our bot ( @{botName} ) as an admin to
                      your Telegram group/channel
                    </span>
                    <span className="mt-2 text-sm block">
                      Step 2: Please provide us your group invite url, For us to
                      verify
                    </span>
                  </h5>
                </>
              )}
              <div className="w-full flex gap-4 mt-4">
                <Input
                  // label={el?.title}
                  placeholder={"Enter the group link here..."}
                  mainContainerClassnames={"grow"}
                  reactHookFormRegister={{
                    ...methods.register(`formArray.${index}.targetURL`),
                  }}
                />
                {checkingBotStatus ? (
                  <div className="h-full w-36 max-w-[144px] flex flex-col items-center justify-center grow ">
                    <div className="lds-dual-ring"></div>
                  </div>
                ) : (
                  <Button
                    buttonClasses="w-36"
                    onClick={() => checkTelegramBotStatus()}
                  >
                    Verify
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {data?.form?.map((el, idx) => (
                <Input
                  label={el?.title}
                  placeholder={"Enter here ..."}
                  mainContainerClassnames={"mt-6"}
                  reactHookFormRegister={{
                    ...methods.register(`formArray.${index}.${el?.storeAs}`),
                  }}
                />
              ))}
            </>
          )}

          {data?.heading?.toLowerCase() === "onchain task" && (
            <div className="my-2 w-full ">
              <Test index={index} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormPopup;
