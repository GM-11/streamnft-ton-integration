"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import walletIcon from "../../public/images/Wallet.svg";
import Image from "next/image";
import { useState } from "react";
import { switchChain } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmiConfig";

export const ConnectButton2 = ({ chainDetail }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

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
              const buttonClass = `
                flex h-10 p-3 md:p-4 
                justify-center items-center gap-1 mr-2 md:mr-0 
                rounded bg-green-4 
                text-white text-sm 
                transition-all duration-200 ease-in-out 
                transform
                ${isPressed ? "scale-95" : "scale-100"} 
              `;

              const boxShadow = isPressed ? "none" : "4px 4px 0px 0px #0A7128";

              const handleMouseDown = () => {
                setIsPressed(true);
              };

              const handleMouseUp = () => {
                setIsPressed(false);
              };

              const handleMouseLeave = () => {
                setIsPressed(false);
              };

              if (connected) {
                return (
                  <div>
                    {chain.id !== Number(chainDetail?.chain_id) ? (
                      <button
                        onClick={async () => {
                          const response = await switchChain(wagmiConfig, {
                            chainId: Number(chainDetail?.chain_id),
                          });
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        type="button"
                        className={buttonClass}
                        id="connect-button"
                        style={{ boxShadow }}
                      >
                        Switch network
                      </button>
                    ) : (
                      <button
                        onClick={openAccountModal}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        type="button"
                        className={buttonClass}
                        id="connect-button"
                        style={{ boxShadow }}
                      >
                        {account.displayName}
                        <span>
                          <Image src={walletIcon} alt="wallet logo" />
                        </span>
                      </button>
                    )}
                  </div>
                );
              } else {
                return (
                  <button
                    onClick={openConnectModal}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    type="button"
                    className={buttonClass}
                    style={{ boxShadow }}
                    id="connect-button"
                  >
                    Connect
                    <span>
                      <Image src={walletIcon} alt="wallet logo" />
                    </span>
                  </button>
                );
              }
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
