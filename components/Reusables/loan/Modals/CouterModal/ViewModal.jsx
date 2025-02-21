import React, { useContext, useState, useEffect } from "react";
import Modal from "../Modal";
import { ModalContext } from "@/context/ModalContext";
import { toast } from "react-toastify";
import { ChainContext } from "@/context/ChainContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { hederaAcceptOffer } from "@/utils/hashConnectProvider";
import Loader from "../../Loader";

const ViewModal = () => {
  const { viewData, setOpenModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const { selectedChain, chainDetail } = useContext(ChainContext);
  const {
    setManagerSignal,
    managerSignal,
    poolSignal,
    setPoolSignal,
    nftSignal,
    setNftSignal,
  } = useContext(PoolManagerContext);

  const handleView = async () => setOpenModal(false);

  const handleAcceptOffer = async () => {
    try {
      setLoading(true);

      await hederaAcceptOffer(
        viewData.token_address,
        viewData.token_id,
        Number(viewData?.proposed_offers?.amount),
        viewData.initializer_key,
        viewData.chain_id,
        chainDetail?.native_address
      );

      toast.success("Offer accepted successfully");
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Transaction failed");
    } finally {
      setManagerSignal(managerSignal + 1);
      setPoolSignal(poolSignal + 1);
      setNftSignal(nftSignal + 1);
      setLoading(false);
      setOpenModal(false);
    }
  };

  return (
    <Modal
      headerText="View Details"
      buttonText="Close"
      footerText={"Offers can be cancelled until it is taken by borrower"}
      handelButton={() => handleView()}
    >
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full">
          <div id="top-block" className="w-full">
            <h3 className="text-2xl font-black text-poppins text-green mt-3 mb-1">
              {viewData?.name}
            </h3>
            <div className="flex w-full items-center bg-modal-header-bg rounded-md p-1">
              <img
                src={viewData?.image}
                alt="#"
                className="h-[120px] w-[120px] rounded-lg"
              />
              <div className="w-full ml-8 h-fit">
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Interest
                  </h5>
                  <p className="text-green text-poppins text-sm font-medium">
                    {Number(viewData?.interestRateLender) / 1000}%
                  </p>
                </div>
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Duration
                  </h5>
                  <p className="text-white text-poppins text-sm font-medium">
                    {Number(viewData?.loanDurationInMinutes) / 1440} D
                  </p>
                </div>
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Bid Amount
                  </h5>
                  <p className="text-white text-poppins flex flex-row items-center gap-2 text-sm font-medium">
                    {Number(viewData?.bidAmount) /
                      Math.pow(10, chainDetail?.currency_decimal)}{" "}
                    <p className="text-white">{chainDetail?.currency_symbol}</p>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-0.5 w-full opacity-10 bg-grey my-4"></div>
          <div className="h-fit py-2 w-full">
            <h3 className="text-2xl font-black text-poppins text-green">
              <div className="proposed-offers-container">
                <h3 className="text-2xl font-black text-poppins text-green">
                  Proposed Offers
                  <span className="text-white ml-3 text-sm bg-greenBlurred px-2 py-1 rounded-full">
                    {viewData?.active &&
                    viewData?.proposedOffers &&
                    viewData.proposedOffers?.every((offer) => offer !== null) &&
                    viewData.proposedOffers.length > 0
                      ? viewData.proposedOffers.length
                      : 0}
                  </span>
                </h3>
                {viewData?.active &&
                viewData.proposedOffers?.every((offer) => offer !== null) &&
                viewData?.proposedOffers.length > 0 ? (
                  <ul className="proposed-offers-list max-h-[200px] overflow-y-auto">
                    {viewData.proposedOffers?.map((offer, index) => (
                      <li
                        key={index}
                        className="offer-item flex items-center justify-between py-2 px-6 my-3 bg-[#181818] rounded-md"
                      >
                        <div className="flex items-center space-x-4">
                          <p className="text-white text-lg font-semibold">
                            {offer?.amount}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            className="accept-button bg-[#30B750] text-white text-sm py-2 px-4 rounded hover:bg-greenBlurred focus:outline-none focus:ring focus:ring-green-300"
                            onClick={handleAcceptOffer}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="reject-button bg-[#a93737] text-white text-sm py-2 px-4 rounded hover:bg-[#7f2626] focus:outline-none focus:ring focus:ring-red-300"
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-offers-message text-gray-500 text-sm">
                    No proposed offers available
                  </p>
                )}
              </div>
            </h3>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewModal;
