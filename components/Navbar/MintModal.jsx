import React, { useContext, useEffect, useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { ModalContext } from "@/context/ModalContext";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "../Reusables/utility/Icons";
import DigitalAsset from "../Reusables/mint/DigitalAsset";
import Loader from "../Reusables/loan/Loader";
import MobileModal from "../Reusables/rent/Modals/MobileModal";
import Modal from "../Reusables/rent/Modals/Modal";

const MintModal = ({ loading }) => {
  const isBigScreen = useMediaQuery();
  const { modalData, setOpenModal } = useContext(ModalContext);
  const [error, setError] = useState(null);

  const transactionBaseUrl = "https://opencampus-codex.blockscout.com/tx/";

  return (
    <>
      {isBigScreen ? (
        <Modal
          headerText=""
          buttonText="Close"
          buttonHandler={() => setOpenModal(false)}
          loading={loading}
          bodyClasses={"!p-0"}
        >
          {loading ? (
            <div className="flex-col items-center font-numans h-full w-full flex p-6 py-12 gap-6 text-white">
              <Loader customMessage="Please wait for a while..." />
            </div>
          ) : (
            <div className="h-fit w-full relative">
              <div className="flex-col font-numans h-full w-full flex items-center justify-start  gap-3 text-white">
                <h5 className="text-xl text-center">
                  Congratulations! Your NFT is minted
                </h5>
                <h5 className=" text-sm">
                  Transaction Hash:{" "}
                  <Link
                    href={`${transactionBaseUrl}${modalData?.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-3 underline"
                  >
                    {modalData?.hash}
                  </Link>
                </h5>
                <h5 className="text-xl text-center">
                  Put Digital Asset to work
                </h5>
                <DigitalAsset isNav={true} modalData={modalData} />

                {error && <p className="text-red">{error}</p>}
              </div>
            </div>
          )}
        </Modal>
      ) : (
        <MobileModal />
      )}
    </>
  );
};

export default MintModal;
