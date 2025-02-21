import React, { useContext, useState } from "react";
import { PointsContext } from "@/context/PointsContext";
import { MdExpandLess } from "react-icons/md";
import { VerifiedIcon } from "@/components/Reusables/utility/Icons";

const MobileRow = ({ data }) => {
  const { walletConnected } = useContext(PointsContext);

  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div
      className={`block md:hidden w-full overflow-hidden bg-[#FFFFFF0F] my-2 transition-all duration-300 h-fit rounded-md ${
        openDropdown ? "max-h-56" : "max-h-24"
      }`}
    >
      <div className="h-24 px-4 w-full flex items-center justify-between">
        <h5 className="min-w-[100px] max-w-[100px] text-xs pr-5">
          {data?.displayname}
        </h5>
        <h5 className="min-w-[80px] max-w-[80px] text-2xs">
          {data?.isvariable ? `${data?.score}  ${data?.rateunit}` : data?.score}
        </h5>
        <div className="grow flex items-center justify-end gap-2">
          {walletConnected ? (
            <>
              {data?.isCompleted ? (
                <>
                  <VerifiedIcon size={21} color="#00bb34" className="inline" />
                </>
              ) : (
                <>
                  {data?.displayname?.includes("Telegram") ? (
                    <button className="text-2xs md:text-xs p-2 border relative border-solid border-grayscale rounded-md font-semibold font-numans text-white">
                      <span id="telegram-login">Verify</span>
                    </button>
                  ) : (
                    <button
                      className="text-2xs md:text-xs p-2 border border-solid border-grayscale rounded-md font-semibold font-numans text-white"
                      onClick={() => {
                        if (data?.type === "OnChain") {
                          window.open(data?.targetURL, "_blank");
                        } else {
                          if (data?.type?.toLowerCase() === "social") {
                            handlePostRedirect(data?.action);
                          } else {
                            data?.onClick();
                          }
                        }
                      }}
                    >
                      {data?.type === "OnChain" ? "Go to Dapp" : "Verify"}
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <button
                className="text-2xs md:text-xs p-2 border border-solid border-grayscale rounded-md font-semibold font-numans text-white"
                onClick={() => {
                  if (data?.type === "OnChain") {
                    window.open(data?.targetURL, "_blank");
                  } else {
                    const button = document.getElementById("connect-button");
                    if (button) {
                      button.click();
                    }
                  }
                }}
              >
                {data?.type === "OnChain" ? "Go to Dapp" : "Verify"}
              </button>
            </>
          )}
          <MdExpandLess
            className="text-faded-white"
            size={21}
            onClick={() => setOpenDropdown(!openDropdown)}
          />
        </div>
      </div>
      <div className="flex gap-6 px-4 pb-6">
        <div className="grow flex flex-col gap-3">
          <h5 className="text-xs">Frequency</h5>
          <p className="text-2xs">{data?.frequency}</p>
        </div>
        <div className="grow flex flex-col gap-3">
          <h5 className="text-xs">Conditions</h5>

          <h5 className="text-2xs text-grayscale-24">
            {data?.conditions ?? "-"}
          </h5>
        </div>
      </div>
    </div>
  );
};

export default MobileRow;
