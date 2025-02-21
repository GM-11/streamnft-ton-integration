import { useContext, useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { ModalContext } from "@/context/ModalContext";
import { UserNftContext } from "@/context/UserNftContext";
import { hederaRequestOffer } from "@/utils/hashConnectProvider";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { ChainContext } from "@/context/ChainContext";
import { useAccount } from "wagmi";
import { evmRequestOffer } from "@/utils/evmProvider";
import Dropdown from "./Dropdown";
import { useSigner } from "@/context/SignerContext";
import Image from "next/image";
import Loader from "../../Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const RequestOfferModal = ({}) => {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(null);
  const [interest, setInterest] = useState(null);
  const [amount, setAmount] = useState(0);
  const [selected, setSelected] = useState({});
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { userNfts, fetching, reloadNftCacheCall } = useContext(UserNftContext);
  const { openModal, setOpenModal, requestBorrowData } =
    useContext(ModalContext);
  const { isConnected, address } = useUserWalletContext();
  const {
    setManagerSignal,
    managerSignal,
    poolSignal,
    setPoolSignal,
    nftSignal,
    setNftSignal,
  } = useContext(PoolManagerContext);
  const [collectionName, setCollectionName] = useState("");
  const [durationScale, setDurationScale] = useState("Custom");
  const [interestScale, setInterestScale] = useState("Custom");
  const { signer: walletSigner } = useSigner();

  const handelRequestOffer = async () => {
    if (chainDetail?.chain_id == "296") {
      try {
        if (!selected.serial_number) {
          toast.error("Select NFT to borrow");
          return;
        } else if (!duration || !interest || !amount) {
          toast.error("Fill the required details");
          return;
        }

        setLoading(true);
        await hederaRequestOffer(
          selected.token_id,
          selected.serial_number,
          duration * 1440,
          interest * 1000, // multiplied by decimal multiplier
          amount * Math.pow(10, chainDetail?.currency_decimal),
          chainDetail.chain_id,
          chainDetail?.contract_address,
          chainDetail?.native_address
        );
        toast.success("Request for new offer sent");
        setOpenModal(false);
      } catch (error) {
        console.error("reques offer error hedera", error);
        toast.error("Transaction Failed");
      } finally {
        setNftSignal(nftSignal + 1);
        setLoading(false);
      }
    } else if (chainDetail?.evm && selectedChain) {
      try {
        if (!selected.tokenId) {
          toast.error("Select NFT to borrow");
          return;
        } else if (!duration || !interest || !amount) {
          toast.error("Fill the required details");
          return;
        }
        let isErc1155;
        const walletAddress = address;
        const tokenType = selected?.tokenType ? selected?.tokenType : "ERC721";

        if (tokenType == "ERC1155") {
          isErc1155 = true;
        } else {
          isErc1155 = false;
        }

        setLoading(true);
        await evmRequestOffer(
          requestBorrowData,
          chainDetail?.chain_id,
          Number(selected.tokenId),
          walletSigner,
          duration * 1440,
          interest * 1000, //millisecond
          amount,
          chainDetail?.currency_decimal,
          walletAddress,
          chainDetail?.contract_address,
          isErc1155,
          async () => {
            await reloadNftCacheCall();
            setOpenModal(false);
            setLoading(false);
          },
          () => {
            setOpenModal(false);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("request offer error evm", error);
        setLoading(false);
      } finally {
        setManagerSignal(managerSignal + 1);
        setUpdateCollectionsSignal(!updateCollectionsSignal);
        setPoolSignal(poolSignal + 1);
        setNftSignal(nftSignal + 1);
      }
    }
  };

  const unitChangeHandler = (value) => {
    setDurationScale(value);
    if (value === "Custom") {
      setDuration(null);
    } else {
      const days = parseInt(value.split(" ")[0]);
      setDuration(days);
    }

    analytics.track(
      `dapp_loan_tab_borrow_${collectionName}_new_offer_${value}`
    );
  };

  const interestChangeHandler = (value) => {
    setInterestScale(value);
    if (value === "Custom") {
      setInterest(null);
    } else {
      const days = parseInt(value.split(" ")[0]);
      setInterest(days);
    }

    analytics.track(
      `dapp_loan_tab_borrow_${collectionName}_new_offer_${value}`
    );
  };

  useEffect(() => {
    if (!openModal) {
      setDuration(null);
      setInterest(null);
      setAmount(0);
      setSelected({});
      setCollectionName("");
    }
  }, [openModal]);

  useEffect(() => {
    setLoading(fetching);
  }, [fetching]);

  // const selectedCollectionTokens = useMemo(() => {
  //   return userNfts?.find((item) => {
  //     return (
  //       requestBorrowData?.toLowerCase() === item?.collection?.toLowerCase()
  //     );
  //   })?.tokenId;
  // }, [userNfts, requestBorrowData]);

  const selectedCollectionTokens = useMemo(() => {
    if (chainDetail?.chain_id == "solana") {
      return userNfts?.find((item) => {
        return (
          requestBorrowData?.toLowerCase() === item?.collection?.toLowerCase()
        );
      })?.tokenId;
    } else {
      return userNfts?.[0]?.tokenId;
    }
  }, [userNfts, requestBorrowData, selectedChain]);

  // console.log({ requestBorrowData, fetching, loading, userNfts });

  return (
    <Modal
      headerText="Request for new offer"
      buttonText="Borrow Offer"
      footerText={"Requests can be cancelled until they are accepted"}
      handelButton={() => {
        // Track button click event
        analytics.track(
          `dapp_loan_tab_borrow_${collectionName}_drop-down_nft_listing_new_offer_borrow`
        );
        handelRequestOffer();
      }}
      trackingData={{
        pagename: "borrow",
        collection_name: collectionName,
        tab: "new_offer",
      }}
    >
      {loading ? (
        <div className="w-full items-center justify-center flex">
          <Loader />
        </div>
      ) : (
        <div className="w-full px-4">
          <h5 className=" text-white my-4 text-lg font-semibold text-poppins">
            Select a NFT as collateral
          </h5>
          <div className="w-full max-h-[180px] flex items-start gap-8 overflow-x-auto whitespace-nowrap my-4">
            {selectedCollectionTokens?.length < 0 ? (
              <div className="min-h-fit min-w-fit">
                <h4 className="font-numans font-semibold text-xl mb-2 text-white">
                  No NFTs Found.
                </h4>
              </div>
            ) : (
              selectedCollectionTokens?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="min-h-fit min-w-fit flex overflow-x-auto"
                  >
                    <div
                      className="min-h-fit min-w-fit mr-4 mb-4"
                      onClick={() => setSelected(item)}
                      title={item.name}
                    >
                      <Image
                        src={item.image}
                        className={`h-[128px] w-[128px] object-cover rounded-xl ${
                          selected.tokenId === item.tokenId
                            ? "border-green border-4"
                            : "border-4x"
                        }`}
                        height={128}
                        width={128}
                        alt="item img"
                      />
                      <p className="font-numans text-white text-base mt-2 text-center">
                        Token #{Number(item.tokenId)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="h-fit my-4 py-2 w-full flex flex-col gap-4">
            <div className="w-full flex gap-2 flex-row">
              <div className="w-full flex flex-col items-start">
                <h5 className=" text-white text-xs text-poppins mb-2">
                  Loan Amount
                </h5>
                <div className=" h-fit  grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md ">
                  <p className="text-white text-[14px] mt-[2px]">
                    {chainDetail.currency_symbol}
                  </p>
                  <input
                    type="number"
                    placeholder={`Amount in ${chainDetail.currency_symbol}`}
                    className="h-full placeholder:font-numans placeholder:text-xs  !placeholder-[#c4cac8] !text-white"
                    onChange={(e) => {
                      setAmount(e.target.value);
                      analytics.track(
                        `dapp_loan_tab_borrow_${collectionName}_new_offer_${amount}`
                      );
                    }}
                    required
                  />
                </div>
              </div>
              <div className="w-full flex flex-col items-start">
                <h5 className=" text-white text-xs text-poppins mb-2">
                  Duration
                </h5>
                <div className=" h-fit  grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md">
                  {/* <select className="h-full bg-modal-field-bg-2 rounded-md text-white mt-1 w-[70px]"
                onChange={(e) => setDuration(e.target.value)}>
                  <option  value="">Days</option>
                   {durationOptions.map((option, index) => (
                  <option key={index} value={option}>{option} Days</option>
                ))}
                </select> */}
                  <Dropdown
                    body={["Custom", "3 Days", "7 Days", "14 Days"]}
                    state={durationScale}
                    changeHandler={unitChangeHandler}
                    height={"40px"}
                    width={"40px"}
                    noBorder={true}
                    noBackground={true}
                  />

                  <input
                    type="number"
                    placeholder="Loan Duration"
                    className="h-full  placeholder:font-numans placeholder:text-xs  !placeholder-[#c4cac8] !text-white"
                    onChange={(e) => {
                      const value = Math.floor(Number(e.target.value));
                      setDuration(value >= 0 ? value : "");
                      //
                      analytics.track(
                        `dapp_loan_tab_borrow_${collectionName}_new_offer_${value}`
                      );
                    }}
                    value={duration || ""}
                    step="1"
                    required
                  />
                </div>
              </div>
              <div className="w-full flex flex-col items-start">
                <h5 className=" text-white text-xs text-poppins mb-2">
                  Interest Rate
                </h5>
                <div className=" h-fit  grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md">
                  {/* <select className="h-full bg-modal-field-bg-2 rounded-md text-white mt-1 w-[40px]"
                onChange={(e) => setInterest(e.target.value)}>
                  <option  value="">%</option>
                   {interestOptions.map((option, index) => (
                  <option key={index} value={option}>{option} %</option>
                ))}
                </select> */}
                  <Dropdown
                    body={["Custom", "2 %", "5 %", "7 %"]}
                    state={interestScale}
                    changeHandler={interestChangeHandler}
                    height={"40px"}
                    width={"40px"}
                    noBorder={true}
                    noBackground={true}
                  />
                  <input
                    type="number"
                    placeholder="Interest Rate (%)"
                    className="h-full placeholder:font-numans placeholder:text-xs !placeholder-[#c4cac8] !text-white "
                    onChange={(e) => {
                      setInterest(e.target.value);
                    }}
                    value={interest || ""}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col items-start mt-5">
              <h5 className=" text-white text-xs text-poppins mb-2">
                Total Repay amount
              </h5>
              <div className=" h-fit  w-full grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md">
                <p className="text-modal-footer-text">
                  {chainDetail.currency_symbol}
                </p>
                <input
                  type="number"
                  placeholder={""}
                  className="h-full placeholder-font-numans placeholder:text-xs placeholder-[#c4cac8] w-full !text-white"
                  readOnly
                  value={(amount * (1 + interest / 100)).toFixed(2)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RequestOfferModal;
