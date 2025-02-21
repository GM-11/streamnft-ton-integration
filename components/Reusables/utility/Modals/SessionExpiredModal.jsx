import React, { useContext } from "react";
import Modal from "@/components/Reusables/utility/Modals/Modal";
import Button from "@/components/Reusables/utility/Button";
import { utilityContext } from "@/context/UtilityContext";
import { useAccount } from "wagmi";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { ChainContext } from "@/context/ChainContext";
import { useSigner } from "@/context/SignerContext";
import { CloseIcon } from "../Icons";
import walletIcon from "../../../../public/images/Wallet.svg";
import Image from "next/image";
import { useUserWalletContext } from "@/context/UserWalletContext";

const SessionExpiredModal = ({ open, handleClose }) => {
  const { isTokenSet } = useUserWalletContext();
  const { checkToken } = useContext(utilityContext);
  const { signer } = useSigner();
  const { openAccountModal } = useAccountModal();
  const { isConnected } = useUserWalletContext();
  const { openConnectModal } = useConnectModal();
  const { walletChanged } = useSigner();

  return (
    <Modal
      open={open}
      handleClose={() => {}}
      titleClasses="!text-xl !text-center"
      panelClasses="!max-w-xl p-6 bg-gray-800 rounded-lg shadow-xl animate-fadeIn"
    >
      <div
        className="absolute top-3 right-3 p-1 rounded-full border border-solid border-white cursor-pointer"
        onClick={handleClose}
      >
        <CloseIcon size={14} color="#fff" />
      </div>
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-white">
            {!isTokenSet
              ? "Sign In Required"
              : walletChanged
              ? "Wallet Changed!"
              : "Session Expired"}
          </h1>
          <p className="text-sm text-white">
            {walletChanged
              ? "Please re-sign with your new wallet"
              : !isTokenSet
              ? "Please sign in with your connected wallet"
              : "Your session has expired. Please re-sign to continue."}
          </p>
        </div>
        <Button
          buttonClasses="flex items-center gap-2 px-6 py-2  rounded-full text-white font-semibold"
          onClick={async () => {
            if (!isConnected) {
              openConnectModal();
            } else {
              if (signer) {
                localStorage.removeItem("token");
                await checkToken();
              }
            }
          }}
        >
          <Image src={walletIcon} alt="wallet logo" />
          Re-Sign
        </Button>
      </div>
    </Modal>
  );
};

export default SessionExpiredModal;
