import React, { useContext, useEffect, useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import Modal from "../rent/Modals/Modal";
import MobileModal from "../rent/Modals/MobileModal";
import { ModalContext } from "@/context/ModalContext";
import ProgressBar from "../loan/ProgressBar";
import { ArrowIcon } from "../utility/Icons";
import Loader from "../loan/Loader";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import DigitalAsset from "./DigitalAsset"; // Import the DigitalAsset component

const MintingCompleteModal = ({ loading }) => {
  const isBigScreen = useMediaQuery();
  const { modalData, setOpenModal } = useContext(ModalContext);

  const [nftMetadata, setNftMetadata] = useState(null);
  const [error, setError] = useState(null);

  // Base URL for BlockScout transaction hash link
  const transactionBaseUrl = "https://opencampus-codex.blockscout.com/tx/";

  useEffect(() => {
    const fetchMetadata = async () => {
      if (modalData?.ipfsUrl) {
        try {
          const response = await axios.get(modalData.ipfsUrl);
          setNftMetadata(response.data);
        } catch (err) {
          console.error("Error fetching IPFS metadata:", err);
          setError("Failed to load NFT metadata.");
        }
      }
    };

    if (!loading && modalData?.ipfsUrl) {
      fetchMetadata();
    }
  }, [loading, modalData?.ipfsUrl]);

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
              <Loader />
              <h5 className="!text-xl">Please wait, while we mint your NFT</h5>
              <div className="w-fit gap-4 flex">
                <p>Uploading Content</p>
                <ArrowIcon color="#fff" size="21" />
                <p>Publish to IPFS</p>
                <ArrowIcon color="#fff" size="21" />
                <p>Mint NFT</p>
              </div>
            </div>
          ) : (
            <div className="h-fit w-full relative">
              <div className="flex-col font-numans h-full w-full flex items-center justify-center p-6 py-12 gap-3 text-white">
                {nftMetadata?.image && (
                  <div className="w-full  flex justify-center mt-4">
                    <Image
                      src={nftMetadata.image}
                      alt="Minted NFT"
                      className="object-contain max-w-full max-h-40 rounded-md border-2 border-green-1"
                      width={200}
                      height={200}
                      priority // Load image eagerly
                    />
                  </div>
                )}

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

                {modalData?.ipfsUrl && (
                  <h5 className=" gap-2 flex text-nowrap text-sm">
                    IPFS URL:{" "}
                    <Link
                      href={modalData.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-3 underline whitespace-break-spaces"
                    >
                      {modalData.ipfsUrl}
                    </Link>
                  </h5>
                )}

                <h5 className="text-xl text-center">
                  Put Digital Asset to work
                </h5>
                <DigitalAsset isNav={false} />
                {error && <p className="text-red-500">{error}</p>}
              </div>
              <ProgressBar />
            </div>
          )}
        </Modal>
      ) : (
        <MobileModal />
      )}
    </>
  );
};

export default MintingCompleteModal;
