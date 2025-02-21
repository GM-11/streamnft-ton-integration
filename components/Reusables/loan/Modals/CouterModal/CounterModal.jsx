import React, { useContext, useState } from "react";
import Modal from "../Modal";
import { ModalContext } from "@/context/ModalContext";
import { toast } from "react-toastify";
import { hederaProposedOffer } from "@/utils/hashConnectProvider";
import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";
import Loader from "../../Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const CounterModal = () => {
  const { counterData, setOpenModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const { selectedChain, chainDetail } = useContext(ChainContext);
  const { address } = useUserWalletContext();

  const handleCounter = async () => {
    try {
      setLoading(true);

      await hederaProposedOffer(
        bidAmount,
        counterData?.id,
        chainDetail?.chain_id
      );

      setLoading(false);
      setOpenModal(false);

      toast.success("Request for a new offer sent");
    } catch (error) {
      console.error("Error occurred while handling counter:", error);

      toast.error("Failed to send the offer. Please try again later.");

      setLoading(false);
    }
  };

  return (
    <Modal
      headerText="Counter Details"
      buttonText="Counter"
      footerText={"Offers can be cancelled until it is taken by borrower"}
      handelButton={handleCounter}
    >
      {loading ? (
        <div className="w-full items-center justify-center flex">
          <Loader />
        </div>
      ) : (
        <div className="w-full">
          <div id="top-block" className="w-full">
            <h3 className="text-2xl font-black text-poppins text-green my-4">
              {counterData?.name}
            </h3>
            <div className="flex w-full items-center bg-modal-header-bg rounded-md p-1">
              <img
                src={counterData?.image}
                alt="#"
                className="h-[120px] w-[120px] rounded-lg"
              />
              <div className="w-full ml-8 h-fit">
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Interest
                  </h5>
                  <p className="text-green text-poppins text-sm font-medium">
                    {Number(counterData?.interestRateLender) / 1000}%
                  </p>
                </div>
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Duration
                  </h5>
                  <p className="text-white text-poppins text-sm font-medium">
                    {Number(counterData?.loanDurationInMinutes) / 1440} D
                  </p>
                </div>
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Bid Amount
                  </h5>
                  <p className="text-white text-poppins flex flex-row items-center gap-2 text-sm font-medium">
                    {Number(counterData?.bidAmount) /
                      Math.pow(10, chainDetail?.currency_decimal)}{" "}
                    <p className="text-white">
                      {chainDetail?.chain_id == "solana"
                        ? "SOL"
                        : chainDetail?.chain_id == "296"
                        ? chainDetail.currency_symbol
                        : selectedChain === "xrp"
                        ? "XRP"
                        : "MNT"}
                    </p>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-0.5 w-full opacity-10 bg-grey my-4"></div>
          <div className="h-fit py-2 w-full">
            <div className="w-full flex items-center px-3 justify-between h-[60px] bg-modal-field-bg rounded-md mb-10">
              <div className="w-full h-fit flex items-center">
                <input
                  type="number"
                  placeholder={"Enter Counter Offer amount here"}
                  className="h-full placeholder:!text-row-dropdown-unselected !text-white"
                  onChange={(e) => {
                    setBidAmount(e.target.value);
                  }}
                />

                <p className="text-poppins text-sm text-gray-3d whitespace-nowrap font-normal ml-4">
                  <span className="text-table-row-subscript mx-1">
                    {chainDetail?.chain_id == "solana"
                      ? "sol"
                      : chainDetail?.chain_id == "296"
                      ? chainDetail.currency_symbol
                      : selectedChain === "xrp"
                      ? "XRP"
                      : "MNT"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CounterModal;
