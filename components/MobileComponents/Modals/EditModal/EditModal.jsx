import { useState, useContext, useEffect } from "react";
import { ModalContext } from "@/context/ModalContext";
import { HederaContext } from "@/context/HederaContext";
import { useAccount, useBalance } from "wagmi";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import RadioButtons from "@/components/Reusables/loan/Modals/RadioButtons";
import {
  getUserBalance,
  updateOfferAmountHedera,
  updateOfferCountHedera,
} from "@/utils/hashConnectProvider";
import { ChainContext } from "@/context/ChainContext";
import { AiOutlineClose } from "react-icons/ai";
import ReactPortal from "@/components/Reusables/loan/Portal";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { updateOfferAmountEvm, updateOfferCountEvm } from "@/utils/evmProvider";
import { useSigner } from "@/context/SignerContext";
import { Button2 } from "@/components/MobileComponents/Button";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

export default function EditModal({
  showModal,
  setShowModal,
  totalOffersByYou,
}) {
  const { editData, setOpenModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const [balance, setBalance] = useState(0);
  const [input, setInput] = useState(0);

  const [isUpdateAmountSelected, setIsUpdateAmountSelected] = useState(true); // State for checkbox
  const [active, setActive] = useState(0);
  const wallet = useWallet();
  const { connection } = useConnection();
  const { address, isConnected } = useUserWalletContext();
  const { data, isFetched, isLoading } = useBalance({
    address: address,
  });
  const { isPaired } = useContext(HederaContext);
  const { setManagerSignal, managerSignal } = useContext(PoolManagerContext);
  const { signer: walletSigner } = useSigner();

  const setBal = async () => {
    const bal = await getUserBalance();
    setBalance(Number(bal).toFixed(2));
  };

  const handleRadioClick = (event) => {
    setIsUpdateAmountSelected(!isUpdateAmountSelected);
  };

  const handleEdit = async () => {
    if (chainDetail?.chain_id == "296") {
      if (isUpdateAmountSelected) {
        try {
          setLoading(true);
          const diff =
            editData?.totalBids *
            (input -
              editData?.offer / Math.pow(10, chainDetail?.currency_decimal));
          updateOfferAmountHedera(
            editData?.bidManagerIndex,
            editData?.bidPoolIndex,
            Number(input),
            diff,
            chainDetail.chain_id,
            chainDetail?.contract_address,
            chainDetail?.native_address
          ).then(() => {
            setManagerSignal(managerSignal + 1);
            setUpdateCollectionsSignal(!updateCollectionsSignal);
            setLoading(false);
            setOpenModal(false);
          });
        } catch (error) {
          setLoading(false);
          setOpenModal(false);
          toast.error("Transaction Failed!");
          console.error(error);
        }
      } else {
        try {
          setLoading(true);
          const diff =
            (editData.offer / Math.pow(10, chainDetail?.currency_decimal)) *
            (input - editData.totalBids);
          updateOfferCountHedera(
            editData.bidManagerIndex,
            editData.bidPoolIndex,
            input,
            diff,
            chainDetail.chain_id,
            chainDetail?.contract_address,
            chainDetail?.native_address
          ).then(() => {
            setManagerSignal(managerSignal + 1);
            setUpdateCollectionsSignal(!updateCollectionsSignal);
            setLoading(false);
            setOpenModal(false);
          });
        } catch (error) {
          setLoading(false);
          setOpenModal(false);
          toast.error("Transaction Failed!");
          console.error(error);
        }
      }
    } else {
      if (isUpdateAmountSelected) {
        try {
          setLoading(true);
          const signer = walletSigner;
          const result = await updateOfferAmountEvm(
            Number(editData.bidManagerIndex),
            Number(editData.bidPoolIndex),
            input,
            chainDetail?.chain_id,
            signer,
            chainDetail?.currency_decimal,
            chainDetail?.contract_address,
            editData?.paymentToken,
            address
          );
          setManagerSignal(managerSignal + 1);
          setUpdateCollectionsSignal(!updateCollectionsSignal);
          setLoading(false);
          setOpenModal(false);
        } catch (error) {
          setLoading(false);
          setOpenModal(false);
          console.error(error);
        }
      } else {
        try {
          setLoading(true);
          const signer = walletSigner;
          const result = await updateOfferCountEvm(
            Number(editData.bidManagerIndex),
            Number(editData.bidPoolIndex),
            Number(input),
            chainDetail?.chain_id,
            signer,
            chainDetail?.contract_address,
            editData?.paymentToken,
            address
          );
          setManagerSignal(managerSignal + 1);
          setUpdateCollectionsSignal(!updateCollectionsSignal);
          setLoading(false);

          setOpenModal(false);
        } catch (error) {
          setLoading(false);
          setOpenModal(false);

          console.error(error);
        }
      }
    }
  };

  useEffect(() => {
    if (isPaired) {
      setBal();
    }
  }, [isFetched, isLoading, data, isPaired, selectedChain]);

  if (showModal)
    return (
      <ReactPortal wrapperId="react-portal-modal-container">
        <div className="overflow-y-auto overflow-x-hidden h-screen fixed top-0 right-0 left-0 z-[10000] bg-[rgba(0,0,0,0.8)] w-full md:inset-0 max-h-full flex flex-col items-center justify-end">
          <button
            type="button"
            className="rounded-full h-8 w-8 bg-mobile-modal-bg flex items-center justify-center"
            onClick={() => {
              setShowModal(false);
              analytics.track(
                `dapp_loan_tab_offers_${editData?.collection_name}_edit_close`
              );
              document.body.style.overflow = "auto";
            }}
          >
            <AiOutlineClose color="#fff" size={21} />
          </button>

          <div className="relative rounded-lg shadow w-full h-fit text-white bg-[#000f00] min-h-[420px] max-h-[420px] overflow-y-auto">
            {loading ? (
              <Loader />
            ) : (
              <>
                <div className="flex items-center justify-start p-4">
                  <h2 className="">Edit your Offer</h2>
                </div>

                <div className="flex justify-center items-center">
                  <div className="h-fit w-full p-2">
                    <div className="h-fit w-full flex gap-4 p-3 bg-field-bg-3 rounded-md">
                      <img
                        src={editData?.collection_logo || "/images/cuteape.png"}
                        height={80}
                        width={80}
                        alt="NFT"
                        className="rounded-lg max-w-[80px] max-h-[80px] "
                      />

                      <div className="flex flex-col gap-y-2 font-bold text-sm h-full my-auto">
                        <h5> {editData?.collection_name}</h5>
                        <div className="flex items-center">
                          <div className="text-row-dropdown-unselected min-w-[90px] max-w-[90px] text-xs font-medium">
                            APY:
                          </div>
                          <span className="font-normal">{editData?.apy}%</span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <div className="text-row-dropdown-unselected min-w-[90px] max-w-[90px] text-xs font-medium">
                              Duration:{" "}
                            </div>
                            <span className="font-normal">
                              {!Number.isInteger(editData?.duration / 1440)
                                ? (editData?.duration).toFixed(4)
                                : editData?.duration / 1440}
                              D
                            </span>{" "}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <div className="text-row-dropdown-unselected min-w-[90px] max-w-[90px] text-xs font-medium">
                              Offer Price :{" "}
                            </div>
                            <span className="font-normal">
                              {editData?.offer /
                                Math.pow(10, chainDetail?.currency_decimal)}
                            </span>{" "}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <div className="text-row-dropdown-unselected min-w-[90px] max-w-[90px] text-xs font-medium">
                              No of offer :{" "}
                            </div>
                            <span className="font-normal">
                              {totalOffersByYou}
                            </span>{" "}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full my-4">
                      <div className="flex mb-4 !text-xs">
                        <RadioButtons
                          label="Update Amount"
                          labelID="update-amount"
                          clickHandler={() => {
                            analytics.track(
                              `dapp_loan_tab_offers_${editData?.collection_name}_edit_update_amount`
                            );
                            handleRadioClick();
                          }}
                          checked={isUpdateAmountSelected}
                          groupName="updateOption"
                        />
                        <RadioButtons
                          label="Update No of Offers"
                          labelID="update-offers"
                          clickHandler={() => {
                            analytics.track(
                              `dapp_loan_tab_offers_${editData?.collection_name}_edit_update_offers`
                            );
                            handleRadioClick();
                          }}
                          checked={!isUpdateAmountSelected}
                          groupName="updateOption"
                        />
                      </div>

                      <div className="w-full flex p-3 items-center bg-field-bg-3 flex-row-reverse !text-xs">
                        <label
                          htmlFor="offer-amount"
                          className="m-2 font-medium whitespace-nowrap"
                        >
                          {isUpdateAmountSelected
                            ? "New Offer Amount"
                            : "New Offer Number"}
                        </label>
                        <div className="flex grow items-center">
                          <input
                            id="offer-amount"
                            type="number"
                            placeholder={`${
                              isUpdateAmountSelected
                                ? `Enter the offer amount in ${chainDetail?.currency_symbol}`
                                : "Enter the number of offers"
                            }`}
                            className="h-full w-full rounded-r-lg text-white focus:!outline-none  bg-transparent"
                            style={{ textIndent: "10px" }}
                            onChange={(e) => {
                              setInput(Number(e.target.value));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full absolute p-4 pr-20 flex items-end gap-4 justify-end bottom-0 bg-gray-7 border-t-2 border-solid border-modal-footer-text !text-xs">
                  <Button2
                    onClick={() => {
                      handleEdit();
                    }}
                  >
                    Save
                  </Button2>
                </div>
              </>
            )}
          </div>
        </div>
      </ReactPortal>
    );
  else return <></>;
}
