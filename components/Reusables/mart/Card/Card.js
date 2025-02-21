import { useContext, useState } from "react";
import { LendRentWrapper } from "./cardStyles";
import viewIcon from "../../../../public/images/view.png";
import metadataIcon from "../../../../public/images/metadata.png";
import Image from "next/image";
import { IoEllipsisVerticalOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { ModalContext } from "@/context/ModalContext";
import { ChainContext } from "@/context/ChainContext";
import { cancelListingCall } from "@/utils/evmProvider";
import { UserNftContext } from "@/context/UserNftContext";
import { removeQuery } from "@/utils/common";
import { useSigner } from "@/context/SignerContext";
import { useRouter } from "next/router";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";
import ThinArrowIcon from "../../../../public/images/thin-arrow.png";

export const LendRentCard = ({
  clickHandler,
  buttonValue,
  data,
  tokenData,
}) => {
  const { setOpenModal, setModalData, setModalType } = useContext(ModalContext);
  const [openHovermenu, setOpenHovermenu] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);
  const {
    chainDetail,
    userTransacted,
    setUserTransacted,
    collectionId,
    selectedChain,
  } = useContext(ChainContext);
  const { reloadNftCacheCall, addTokenInNftArray } = useContext(UserNftContext);
  const { signer } = useSigner();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkLoginValidity, setIsTransactionOngoing, setIsTokenValid } =
    useUserWalletContext();

  // Use useAccount to check wallet connection status
  const { isConnected, address } = useUserWalletContext();
  const { openConnectModal } = useConnectModal(); // Get the openConnectModal function

  const buttonClickHandler = async (e) => {
    if (buttonValue?.toLowerCase() === "cancel") {
      const isUserValid = await checkLoginValidity();
      if (!isUserValid) {
        return;
      }
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }
      setLoading(true);
      setIsTransactionOngoing(true);
      try {
        const response = await cancelListingCall(
          data?.tokenId,
          data?.tokenAddress,
          chainDetail?.chain_id,
          signer,
          data?.isErc1155,
          chainDetail?.contract_address,
          address
        );

        if (response) {
          addTokenInNftArray(data?.tokenId);
          reloadNftCacheCall();
          setUserTransacted(!userTransacted);
          toast.dismiss();
          toast.success("Listing Cancelled successfully");
        }
      } catch (error) {
        console.error("Error during NFT cancellation:", error);
        toast.dismiss();
        toast.error("Failed to cancel listing. Please try again.");
      } finally {
        setLoading(false);
        setIsTransactionOngoing(false);
      }
    } else {
      if (buttonValue?.toLowerCase() === "sell") {
        const isUserValid = await checkLoginValidity();
        if (!isUserValid) {
          return;
        }

        setOpenModal(true);
        setModalData(data);
        setModalType(buttonValue);
      } else {
        router.push(
          `/${selectedChain}/discover/${router?.query?.symbol}/${data?.id}`
        );
      }
    }
  };

  return (
    <LendRentWrapper
      onClick={clickHandler}
      className="grow justify-self-center w-full shadow rounded-3xl overflow-hidden"
      onMouseEnter={() => {
        if (buttonValue?.toLowerCase() === "buy") {
          setShowBuyButton(true);
        }
      }}
      onMouseLeave={() => {
        if (buttonValue?.toLowerCase() === "buy") {
          setShowBuyButton(false);
        }
      }}
    >
      <div
        className="absolute h-[32px] w-[32px] right-3 rounded-lg top-3 flex  items-center justify-center bg-green-4 z-50 hover:opacity-100z"
        onMouseEnter={() => {
          setOpenHovermenu(true);
        }}
        onMouseLeave={() => {
          setOpenHovermenu(false);
        }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <IoEllipsisVerticalOutline size={21} color="#fff" />
        </div>

        <div
          style={{
            opacity: openHovermenu ? "1" : "0",
            visibility: openHovermenu ? "visible" : "hidden",
          }}
          className="absolute top-full right-0 py-2 "
        >
          <div className="bg-green-4 h-fit w-40 rounded-lg">
            <div
              className="p-2 flex gap-4 items-center"
              onClick={() => {
                window.open(
                  `${chainDetail.explorer_link + data.hederaTokenAddress}`
                );
              }}
            >
              <Image src={viewIcon} alt="view icon" className="h-6 w-6" />
              <h5 className="text-white text-xs  ">View</h5>
            </div>
            <div
              className="p-2 flex gap-4 items-center"
              onClick={() => {
                window.open(data.metadata_link);
              }}
            >
              <Image src={metadataIcon} alt="meta-icon" className="h-6 w-6" />
              <h5 className="text-white text-xs  ">Metadata</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {data?.image ? (
          data.image.includes(".mp4") ? (
            <video
              className=" h-[220px] w-full object-cover image-position"
              autoPlay
              loop
              muted
              src={removeQuery(data?.image)}
              type="video/mp4"
            ></video>
          ) : (
            <img
              src={removeQuery(data?.image)}
              alt="nft img"
              height={288}
              width={276}
              className=" h-[220px] w-full object-cover image-position"
            />
          )
        ) : (
          <Image
            src="https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png"
            alt="default img"
            height={288}
            width={276}
            className=" h-128 w-full object-cover image-position"
          />
        )}

        <div
          className="absolute bottom-0 left-0 right-0 flex items-center pl-3 gap-2 p-1 bg-faded-white bg-opacity-80 cursor-pointer hover:bg-opacity-90"
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_BASE_URL}/utility/explore/${collectionId}`,
              "_blank"
            )
          }
        >
          <span className="text-jet-black text-sm font-semibold">
            Available Perks:
          </span>
          <span className="text-jet-black text-sm">
            {tokenData?.utility_count}
          </span>
        </div>
      </div>

      <div
        className="p-4"
        onClick={() => {
          buttonClickHandler();
        }}
      >
        <div className="flex flex-col items-start gap-2 relative">
          <h5 className="text-smoke text-sm">
            {data?.name
              ? data.name.length > 12
                ? data.name.substring(0, 12) + "... "
                : data.name + " "
              : null}{" "}
            #
            {data &&
              (data.serial_number ||
                (data.id && data.id.length > 12
                  ? data.id.slice(0, 12) + "..."
                  : data.id))}
          </h5>
          {data?.tokenType === "ERC1155" && (
            <p className="text-smoke text-sm">Balance:{data?.balance}</p>
          )}
          {data.rentType === "Fixed" && (
            <h5 className="text-smoke text-sm">{data.durationType}</h5>
          )}
          <div className="w-full flex items-center justify-between">
            {data?.rate && (
              <h5 className="text-xl font-semibold uppercase">
                {data?.rate} {chainDetail?.currency_symbol}
              </h5>
            )}
          </div>
          <Image
            src={ThinArrowIcon}
            alt="#"
            className="h-5 w-auto object-contain invert absolute bottom-2 right-0"
          />
        </div>
        <div
          className={`w-full h-fit bg-[#1d1d1d] absolute bottom-2 left-0 py-2 px-3 transition-all duration-200 ease-in-out ${
            showBuyButton
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <button
            className="w-full flex items-center justify-center bg-green-4 text-white rounded-2xl text-xs py-2"
            onClick={(e) => {
              if (isConnected) {
                e.stopPropagation();
                setOpenModal(true);
                setModalData(data);
                setModalType(buttonValue);
              } else {
                openConnectModal();
              }
            }}
          >
            Buy Now{" "}
          </button>
        </div>
        <div className="flex justify-between w-full items-center !text-2xs md:!text-sm">
          {/* {buttonValue && (
            <div className="flex justify-between w-full gap-4  items-center">
              <button
                className="!h-fit !px-4 !py-2 grow !justify-center !items-center flex-1 font-medium w-full border mt-1 border-solid border-jet-black hover:bg-slate-blue hover:text-white transition-all duration-300 rounded-lg text-jet-black"
                disabled={loading}
              >
                {loading ? (
                  "Loading..."
                ) : buttonValue.toLowerCase() === "buy" ? (
                  <>
                    {buttonValue} ({data?.rate} {chainDetail?.currency_symbol})
                  </>
                ) : (
                  <>{buttonValue}</>
                )}
              </button>

              {!router.pathname.includes("marketplace") && (
                <button
                  className="!h-fit !px-4 !py-2 grow !justify-center !items-center flex-1 font-medium w-full border mt-1 border-solid border-jet-black text-jet-black hover:bg-slate-blue hover:text-white transition-all duration-300 rounded-lg"
                  onClick={() =>
                    window.open(
                      `/view/${data?.tokenAddress}/${data?.tokenId}`,
                      "_blank"
                    )
                  }
                >
                  View
                </button>
              )}
            </div>
          )} */}
        </div>
      </div>
    </LendRentWrapper>
  );
};
