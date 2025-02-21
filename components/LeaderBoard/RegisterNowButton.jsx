"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const RegisterNowButton = () => {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col">
        <h5 className="text-xs mb-2">Not Registered Yet ?</h5>
        <p className="text-2xs text-grayscale-5 mb-2">
          Embark on your Season 0 journey, explore uncharted realms, and collect
          points along the way.
        </p>
      </div>
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => {
          const ready = mounted;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="flex h-10 whitespacec-nowrap text-2xs md:text-sm whitespace-nowrap !p-1 md:p-4 justify-center items-center gap-1 mr-2 md:mr-0 rounded bg-green-4 shadow-lg text-white"
                    style={{ boxShadow: "4px 4px 0px 0px #0A7128" }}
                  >
                    Register now
                  </button>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default RegisterNowButton;
