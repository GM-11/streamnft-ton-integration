import { ModalContext } from "@/context/ModalContext";
import { useContext, useMemo } from "react";
import { useState } from "react";
import RadioButtons from "./RadioButtons";
import { useAccount, useBalance } from "wagmi";
import { HederaContext } from "@/context/HederaContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import {
  getUserBalance,
  updateOfferAmountHedera,
  updateOfferCountHedera,
} from "@/utils/hashConnectProvider";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ChainContext } from "@/context/ChainContext";
import { updateOfferAmountEvm, updateOfferCountEvm } from "@/utils/evmProvider";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import { getERC20Balance } from "@/utils/evmSdkCalls";
import { ethers } from "ethers";
import { useUserWalletContext } from "@/context/UserWalletContext";

const { default: Modal } = require("./Modal");

const EditModal = () => {
  const { editData, setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const [balance, setBalance] = useState(0);
  const [input, setInput] = useState(0);
  const [loading, setLoading] = useState(false);

  const [isUpdateAmountSelected, setIsUpdateAmountSelected] = useState(true); // State for checkbox
  const { address, isConnected } = useUserWalletContext();
  const { data, isFetched, isLoading, refetch } = useBalance({
    address: address,
  });
  const { isPaired } = useContext(HederaContext);
  const { setManagerSignal, managerSignal } = useContext(PoolManagerContext);
  const { signer: walletSigner } = useSigner();

  const setBal = async () => {
    if (chainDetail?.chain_id == "solana") {
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance((bal / LAMPORTS_PER_SOL).toFixed(5));
    } else if (chainDetail?.chain_id == "296") {
      const bal = await getUserBalance();
      setBalance(Number(bal).toFixed(2));
    } else if (selectedChain === "xrp") {
      const api = new RippleAPI({
        server: "wss://s.altnet.rippletest.net:51233",
      });
      api
        .connect()
        .then(() => {
          return api.getBalances(walletAddress);
        })
        .then((balances) => {
          setBalance(balances[0].value);
          // Fetch NFTs here (if applicable)
        })
        .catch(console.error);
    } else if (chainDetail?.evm && address) {
      let skaleBal = 0;

      // console.log({ editData });

      if (editData?.paymentToken?.length > 0) {
        skaleBal = await getERC20Balance(
          editData?.paymentToken,
          address,
          chainDetail?.chain_id,
          chainDetail?.rpc_url
        );
      } else {
        skaleBal = ethers?.formatEther(data?.value);
      }

      setBalance(skaleBal);
    } else {
    }
  };

  const handleRadioClick = (event) => {
    setIsUpdateAmountSelected(!isUpdateAmountSelected);
  };

  const handleEdit = async () => {
    setLoading(true);
    if (chainDetail?.chain_id == "296") {
      if (isUpdateAmountSelected) {
        try {
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
            // setPoolSignal(poolSignal+1);
            setOpenModal(false);
          });
        } catch (error) {
          toast.error("Transaction Failed!");
          setLoading(false);
          console.error(error);
        }
      } else {
        try {
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
            // setPoolSignal(poolSignal+1);
            setOpenModal(false);
          });
        } catch (error) {
          toast.error("Transaction Failed!");
          setLoading(false);
          console.error(error);
        }
      }
    } else {
      if (isUpdateAmountSelected) {
        try {
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
          console.error(error);
          setLoading(false);
        }
      } else {
        try {
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
          console.error(error);
        }
      }
    }
  };

  useEffect(() => {
    refetch();
    if (isPaired || isConnected) {
      setBal();
    }
  }, [isFetched, isLoading, data, isPaired, isConnected, selectedChain]);

  const requiredAmount = useMemo(() => {
    return !isUpdateAmountSelected
      ? Number(editData?.offer / Math.pow(10, chainDetail?.currency_decimal)) *
          input
      : Number(input);
  }, [input, editData, isUpdateAmountSelected]);

  // console.log({ requiredAmount });

  return (
    <Modal
      headerText="Edit your Offer"
      buttonText="Save"
      handelButton={() => {
        handleEdit();
        analytics.track(
          `dapp_loan_tab_offers_${editData?.collection_name}_edit_save`
        );
        const eventName = isUpdateAmountSelected
          ? `dapp_loan_tab_offers_${editData?.collection_name}_edit_update_amount_${input}`
          : `dapp_loan_tab_offers_${editData?.collection_name}_edit_update_offers_${input}`;

        analytics.track(eventName, {
          inputValue: input,
        });
      }}
      footerText={
        Number(balance) < Number(requiredAmount) ? (
          <div className="flex w-full text-[#e2e2e2] items-start text-xs font-medium !font-numans my-2">
            <span className="inline text-red mr-1 !font-numans">ERROR :</span>
            Insufficient
            <span className="inline text-red mx-1 !font-numans">funds</span>
            to add liquidity to the pool. Please refer to this
            <a
              href="https://portal.skale.space/bridge?from=mainnet&to=green-giddy-denebola&token=usdc&type=erc20"
              className="text-green-4 underline mx-0.5 !font-numans"
              target="_blank"
            >
              link
            </a>{" "}
            to add funds
          </div>
        ) : (
          "If loan is not paid then NFT will get transferred to Lender"
        )
      }
      disabled={Number(balance) < Number(requiredAmount)}
    >
      {loading ? (
        <div className="w-full items-center justify-center flex">
          <Loader customMessage={"Updating offer"} />
        </div>
      ) : (
        <div className="w-full">
          <div id="top-block" className="w-full">
            <h3 className="text-2xl font-normal text-numans text-[#5FD37A] mt-8 mb-2">
              {editData?.collection_name}
            </h3>
            <div className="flex w-full items-center bg-modal-header-bg rounded-md p-1 border-2 border-[#454745]">
              <img
                src={editData?.collection_logo}
                alt="#"
                className="h-[120px] w-[120px] p-1 rounded-lg"
              />
              <div className="w-full ml-8 h-fit flex">
                <div className="w-1/2 pr-4">
                  {" "}
                  <div className="flex items-center w-1/2 justify-between mb-5">
                    <h5 className="text-white text-numans text-sm font-regular">
                      Offer Price
                    </h5>
                    <p className="text-white text-numans text-sm font-regular">
                      {editData?.offer /
                        Math.pow(10, chainDetail?.currency_decimal)}
                    </p>
                  </div>
                  <div className="flex items-center w-1/2 justify-between ">
                    <h5 className="text-white text-numans text-sm font-regular">
                      No of Offer
                    </h5>
                    <p className="text-white text-numans text-sm font-regular">
                      {editData?.totalBids}
                    </p>
                  </div>
                </div>
                <div className="w-1/2 pl-4">
                  {" "}
                  <div className="flex items-center w-1/3 justify-between mb-5">
                    <h5 className="text-white text-poppins text-sm font-regular">
                      APY
                    </h5>
                    <div className="flex flex-row items-center gap-2 pl-2">
                      <p className="text-white text-poppins text-sm font-regular">
                        {editData?.apy}%
                      </p>
                      <img
                        className="h-4 w-4 cursor-pointer "
                        src="/images/info-circle.svg"
                        title="test"
                      />
                    </div>
                  </div>
                  <div className="flex items-center w-1/3 justify-between">
                    <h5 className="text-white text-poppins text-sm font-regular">
                      Duration
                    </h5>
                    <p className="text-white text-poppins text-sm font-regular">
                      {editData?.duration / 1440} D
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-fit mt-12 w-full">
            <div className="flex mb-4">
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

            {/* Conditionally rendered UI based on checkbox state */}
            <div className="w-full flex items-center h-[60px] mb-6">
              <div className="w-full flex items-center px-3 justify-between h-[60px] bg-modal-field-bg rounded-md">
                <input
                  id="new-offer-or-amount-input"
                  type="number"
                  placeholder={`${
                    isUpdateAmountSelected
                      ? `Enter The offer amount in ${chainDetail.currency_symbol}`
                      : "Enter the number of offers"
                  }`}
                  className="h-full placeholder:!text-row-dropdown-unselected !text-white placeholder:!font-poppins placeholder:!text-sm"
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                />
                <p className="font-poppins text-sm text-[#c4cac8] whitespace-nowrap font-normal ml-4">
                  you have
                  <span className="text-white mx-1">
                    {Number(balance).toFixed(3)}{" "}
                    {editData?.pool?.paymentTokenSymbol ??
                      chainDetail.currency_symbol}
                  </span>
                  left
                </p>
              </div>
            </div>
            {/* <div className="h-0.5 w-full opacity-10 bg-grey mt-10"></div> */}
          </div>
        </div>
      )}
    </Modal>
  );
};
export default EditModal;
