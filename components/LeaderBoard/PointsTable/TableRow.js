import React, { useContext, useEffect } from "react";
import { PointsContext } from "@/context/PointsContext";
import { VerifiedIcon } from "@/components/Reusables/utility/Icons";
import MobileRow from "./MobileRow";
import { scoreBaseURL } from "@/services/axios";
import { useUserWalletContext } from "@/context/UserWalletContext";

const TableRow = ({ data, handlePostRedirect }) => {
  const { address } = useUserWalletContext();

  const {
    walletConnected,
    fetchUserTasksStatuses,
    setUserTasksStatuses,
    setOpenReferModal,
  } = useContext(PointsContext);

  const loadTelegramScript = () => {
    const botName =
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "streamnft_test_bot"
        : "streamnft_prod_bot";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute(
      "data-auth-url",
      `${scoreBaseURL}/telegram/auth/check/${address}`
    );
    script.setAttribute("data-request-access", "write");
    document.getElementById("telegram-login")?.appendChild(script);
  };

  useEffect(() => {
    if (data?.length > 0) {
      loadTelegramScript();
    }
  }, [data]);

  return (
    <>
      {data?.length < 0 ? (
        <h5>No Data Found</h5>
      ) : (
        data?.map((el,index) => {
          if (el?.display) {
            return (
              <div key={index}>
                <div
                  className={`w-full hidden md:flex relative overflow-hidden items-center transition-all duration-300 cursor-pointer mb-4 p-4 rounded-md bg-[#FFFFFF0F]`}
                
                >
                  <div className="md:grow min-w-[100px]">
                    <h5 className="text-2xs md:text-sm text-grayscale-24">
                      {el?.displayname}
                    </h5>
                  </div>
                  <div className="w-56 pr-16">
                    <h5 className="text-2xs md:text-sm text-grayscale-24">
                      {el?.isvariable
                        ? `${el?.score}  ${el?.rateunit}`
                        : el?.score}
                    </h5>
                    <h5 className="text-xs text-grayscale-6">
                      {el?.conditionsDesc}
                    </h5>
                  </div>
                  <div className="w-56 pr-8">
                    <h5 className="text-2xs md:text-xs text-grayscale-24">
                      {el?.conditions ?? "-"}
                    </h5>
                    <h5 className="text-xs text-grayscale-6">
                      {el?.conditionsDesc}
                    </h5>
                  </div>
                  <div className="w-28 pl-8">
                    <h5 className="text-2xs md:text-sm text-grayscale-24">
                      {el?.frequency}
                    </h5>
                  </div>
                  <div className="w-48 text-right">
                    {walletConnected ? (
                      <>
                        {el?.isCompleted ? (
                          <>
                            <VerifiedIcon
                              size={21}
                              color="#00bb34"
                              className="inline"
                            />
                          </>
                        ) : (
                          <>
                            {el?.displayname?.includes("Telegram") ? (
                              <button className="text-2xs md:text-xs p-2 border relative border-solid border-grayscale rounded-md font-semibold font-numans text-white">
                                <span id="telegram-login">Verify</span>
                              </button>
                            ) : (
                              <button
                                className="text-2xs md:text-xs p-2 border border-solid border-grayscale rounded-md font-semibold font-numans text-white"
                                onClick={async () => {
                                  if (el?.type === "OnChain") {
                                    window.open(el?.targetURL, "_blank");
                                  } else if (el?.action === "refer") {
                                    setOpenReferModal(true);
                                  } else if (
                                    el?.type?.toLowerCase() === "social"
                                  ) {
                                    const result =
                                      await fetchUserTasksStatuses();
                                    const isCurrentSocialTaskDone =
                                      result?.data?.message?.[el?.action];

                                    if (!isCurrentSocialTaskDone) {
                                      handlePostRedirect(el?.action);
                                    } else {
                                      setUserTasksStatuses(
                                        result?.data?.message
                                      );
                                    }
                                  } else {
                                    el?.onClick();
                                  }
                                }}
                              >
                                {el?.type === "OnChain"
                                  ? el?.action === "wallet"
                                    ? "Verify"
                                    : "Go to Dapp"
                                  : el?.action === "refer"
                                  ? "Refer"
                                  : "Verify"}
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
                            if (el?.type === "OnChain") {
                              window.open(el?.targetURL, "_blank");
                            } else if (el?.action === "refer") {
                              setOpenReferModal(true);
                            } else {
                              const button =
                                document.getElementById("connect-button");
                              if (button) {
                                button.click();
                              }
                            }
                          }}
                        >
                          {el?.type === "OnChain"
                            ? el?.action === "wallet"
                              ? "Verify"
                              : "Go to Dapp"
                            : el?.action === "refer"
                            ? "Refer"
                            : "Verify"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <MobileRow data={el} />
              </div>
            );
          }
        })
      )}
    </>
  );
};

export default TableRow;
