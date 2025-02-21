import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useState } from "react";
import { ModalContext } from "@/context/ModalContext";
import Button from "../Button";
import {
  LendRentWrapper,
  LandingTopCardWrapper,
  LandingBottomCardWrapper,
} from "./cardStyles";
import viewIcon from "../../../../public/images/view.png";
import metadataIcon from "../../../../public/images/metadata.png";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import { IoEllipsisVerticalOutline } from "react-icons/io5";
import useMediaQuery from "@/hooks/useMediaQuery";
import { toast } from "react-toastify";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { utilityContext } from "@/context/UtilityContext";
import { removeQuery } from "@/utils/common";
import { isTokenExpired } from "@/utils/generalUtils";
import { useUserWalletContext } from "@/context/UserWalletContext";

export const LendRentCard = ({
  clickHandler,
  buttonValue,
  setModalType,
  data,
  setDataItem,
  disable,
  cardDatatype,
  tab,
  tokenData,
  cardIndex,
}) => {
  const { setOpenModal, setModalData } = useContext(ModalContext);
  const [revenue, setRevenue] = useState(0);
  const router = useRouter();
  const { isConnected } = useUserWalletContext();
  const { openConnectModal } = useConnectModal();
  const { chainDetail, selectedChain, collectionId } = useContext(ChainContext);
  const { checkLoginValidity } = useUserWalletContext();

  const isBigScreen = useMediaQuery();

  const [point, setPoint] = useState(3);

  const [currencyText, setCurrencyText] = useState("/HR");

  const text = chainDetail.currency_symbol + "/HR";

  const tokenId = router.query.tokenID === "" ? router.query.tokenID : "token";

  useEffect(() => {
    if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      setPoint(2);
    } else {
      setPoint(3);
    }
  }, [selectedChain]);

  const onMouseOverSetText = () => {
    if (
      data.buttonValue === "Rent" ||
      data.buttonValue === "Withdraw" ||
      data.buttonValue === "Cancel"
    )
      setCurrencyText(data.buttonValue);
  };

  const onMouseOutSetText = () => {
    if (
      data.buttonValue === "Rent" ||
      data.buttonValue === "Withdraw" ||
      data.buttonValue === "Cancel"
    )
      setCurrencyText(Number(data.ratePerHour).toFixed(point) + text);
  };

  const buttonHandler = async () => {
    const userIsValid = await checkLoginValidity();
    if (!userIsValid) {
      return;
    } else {
      if (data.buttonValue === "Lend") {
        setModalType("Lend");
        setOpenModal(true);
        setDataItem(data);
      }
      if (data.buttonValue === "Rent") {
        if (!isConnected) {
          openConnectModal();
        } else {
          setModalType("Rent");
          setOpenModal(true);
          setDataItem(data);
          analytics.track(`dapp_rent_${data?.name}_mkt_available_rent_button`, {
            nftData: data,
          });
        }
      }
      if (data.buttonValue === "Cancel") {
        setModalType("Cancel");
        setOpenModal(true);
        setDataItem(data);
      }
      if (
        data.buttonValue === "Withdraw" ||
        (data.buttonValue === "None" && router.pathname.includes("rentals"))
      ) {
        setModalType("Withdraw");
        setOpenModal(true);
        setDataItem(data);
      }
      setModalData(data);
    }
  };
  useEffect(() => {
    if (tokenId && data.tokenId === Number(tokenId)) {
      buttonHandler();
    }
  }, [tokenId]);

  const [openHovermenu, setOpenHovermenu] = useState(false);

  return (
    <LendRentWrapper onClick={clickHandler} className="md:!max-w-[250px]">
      <div
        className="absolute h-[32px] w-[32px] right-3 rounded-md top-3 flex  items-center justify-center bg-[#000000] opacity-50 z-50 hover:opacity-100 hover:bg-gradient-to-r from-[#30B750] to-[#30B750]"
        onMouseEnter={() => {
          setOpenHovermenu(true);
          analytics.track(
            `dapp_rent_${data?.name}_${tab}_${cardDatatype}_three_dots`,
            {
              nftData: data,
            },
          );
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
          className="absolute top-full right-0 py-2"
        >
          <div className="bg-green-4 h-fit w-40 rounded-md">
            <div
              className="p-2 flex gap-4 items-center"
              onClick={() => {
                // console.log(chainDetail);
                window.open(
                  `/${chainDetail.explorer_link}/${data.hederaTokenAddress}`,
                );
                analytics.track(
                  `dapp_rent_${data?.name}_${tab}_${cardDatatype}_three_dots_view`,
                  { nftData: data },
                );
              }}
            >
              <Image src={viewIcon} alt="viw icon" className="h-6 w-6" />
              <h5 className="text-white font-poppins">View</h5>
            </div>
            <div
              className="p-2 flex gap-4 items-center"
              onClick={() => {
                window.open(data.metadata_link);
                analytics.track(
                  `dapp_rent_${data?.name}_${tab}_${cardDatatype}_three_dots_metadata`,
                  { nftData: data },
                );
              }}
            >
              <Image src={metadataIcon} alt="meta-icon" className="h-6 w-6" />
              <h5 className="text-white font-poppins">Metadata</h5>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {data?.image ? (
          data.image.includes(".mp4") ? (
            <video
              className="rounded-md h-128 w-full object-cover image-position"
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
              className="rounded-md h-128 w-full object-cover image-position"
            />
          )
        ) : (
          <Image
            src="https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png"
            alt="default img"
            height={288}
            width={276}
            className="rounded-md h-128 w-full object-cover image-position"
          />
        )}

        <div
          className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-1 bg-black bg-opacity-80 rounded-md cursor-pointer hover:bg-opacity-90"
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_BASE_URL}/utility/explore/${collectionId}`,
              "_blank",
            )
          }
        >
          <span className="text-white hover:text-green">
            Available Benefits:
          </span>
          <span className="text-white">{tokenData?.utility_count}</span>
        </div>
      </div>

      {router.pathname.includes("remove") &&
      (buttonValue === "Cancel" || buttonValue === "Withdraw") ? (
        <div className="absolute top-1 left-3 py-2 flex gap-4">
          <Button
            id={`borrow-${cardIndex}`}
            clickHandler={() =>
              window.open("https://streamnft-loan.vercel.app/borrow")
            }
          >
            Borrow
          </Button>
        </div>
      ) : (
        ""
      )}
      {data?.privateRental &&
      (buttonValue === "Rent" || buttonValue === "Cancel") ? (
        <div className="absolute top-1 left-3 py-2 flex gap-4">
          <Button id={`private-rental-${cardIndex}`}>Private Rental</Button>
        </div>
      ) : (
        ""
      )}
      <div className="card-text-section">
        <div className="card-text">
          <h5 className="name-text">
            {data?.name
              ? data.name.length > 14
                ? data.name.substring(0, 14) + "... "
                : data.name + " "
              : null}{" "}
            #
            {data &&
              (data.serial_number ||
                (data.id && data.id.length > 14
                  ? data.id.slice(0, 12) + "..."
                  : data.id))}
          </h5>
          {data?.isErc1155 && (
            <h5 className="name-text h-fit w-fit bg-white/20 px-2 py-1 rounded-lg text-xs">
              <>(x{data?.balance})</>
            </h5>
          )}
          {data.rentType === "Fixed" && (
            <h5 className="fixed-duration-text !text-xs !whitespace-nowrap">
              {data.durationType}
            </h5>
          )}
        </div>
        {buttonValue !== "Lend" &&
          (["Withdraw", "None"].includes(data?.buttonValue) ||
            ["Cancel", "Rent"].includes(data?.buttonValue)) && (
            <div className="other-card-text">
              {["Withdraw", "None"].includes(data?.buttonValue) && (
                <h5>Time left : {data?.timeLeft}</h5>
              )}
              {["Cancel", "Rent"].includes(data?.buttonValue) && (
                <h5 className="!font-normal !text-xs">
                  Available for : {data?.timeLeft}
                </h5>
              )}
            </div>
          )}

        <div className="button-section !text-2xs md:!text-sm">
          {data.buttonValue !== "None" ? (
            <>
              <Button
                id={`${buttonValue}-${cardIndex}`}
                disable={disable}
                clickHandler={() => {
                  buttonHandler();
                  if (data.buttonValue === "Lend") {
                    analytics.track(
                      `dapp_rent_${data?.name}_my_assets_owned_lend`,
                      {
                        data: data,
                      },
                    );
                  }
                }}
                full
                className="hover:bg-gradient-to-r from-[#30B750] to-[#30B750]  text-center"
                onMouseOver={() => {
                  if (data.buttonValue === "Rent") {
                    analytics.track(
                      `dapp_rent_${data?.name}_mkt_available_hover_rent`,
                      {
                        data: data,
                      },
                    );
                  }
                  onMouseOverSetText();
                }}
                onMouseOut={onMouseOutSetText}
              >
                {data &&
                data.buttonValue !== "Lend" &&
                data.ownerShare &&
                Number(data.ownerShare) !== 100 &&
                Number(data.ownerShare) !== 0 &&
                Number(data.rate) > 0 ? (
                  <>
                    {currencyText.includes("/HR") ? (
                      <span className="flex flex-col">
                        <span className="text-xs lg:text-sm">
                          {Number(data.ratePerHour).toFixed(point) + " " + text}
                        </span>
                        <span className="text-xs lg:text-sm">
                          + {data.ownerShare}% Reward
                        </span>
                      </span>
                    ) : (
                      currencyText
                    )}
                  </>
                ) : data &&
                  data.buttonValue !== "Lend" &&
                  Number(data.ownerShare) !== 100 &&
                  Number(data.ownerShare) !== 0 &&
                  Number(data.rate) === 0 ? (
                  <>
                    {currencyText.includes("/HR") ? (
                      <span className="flex flex-col">
                        <span className="text-xs lg:text-sm">
                          {data.ownerShare}% Reward
                        </span>
                      </span>
                    ) : (
                      currencyText
                    )}
                  </>
                ) : data.buttonValue === "Lend" ? (
                  <span className="lendCTA text-xs lg:text-sm my-0 mx-auto">
                    {data.buttonValue}
                  </span>
                ) : revenue > 0 ? (
                  <span className="text-xs lg:text-sm my-0 mx-auto">
                    {revenue}% Reward{" "}
                  </span>
                ) : (
                  <span className="lendCTA text-xs md:text-sm my-0 mx-auto">
                    {currencyText.includes("/HR") ? (
                      <>
                        {" "}
                        {Number(data.ratePerHour).toFixed(point) + " " + text}
                      </>
                    ) : (
                      currencyText
                    )}
                  </span>
                )}
                {data.buttonValue === "Lend" ? (
                  <svg
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${
                      data.buttonValue === "Lend" ? "" : "ml-auto"
                    }`}
                  >
                    <path
                      d="M12.2302 9.09473C11.885 9.09473 11.6052 9.37456 11.6052 9.71973C11.6052 10.0649 11.885 10.3447 12.2302 10.3447H14.5029C14.8481 10.3447 15.1279 10.0649 15.1279 9.71973C15.1279 9.37456 14.8481 9.09473 14.5029 9.09473H12.2302Z"
                      fill="#F1FCF3"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.5728 1.81458C15.6373 2.18455 15.6529 2.62421 15.6572 3.12722C15.7295 3.16493 15.8005 3.20507 15.8702 3.24779C16.5149 3.64289 17.057 4.18497 17.4521 4.82972C17.8871 5.5396 18.0453 6.36233 18.1107 7.40802C18.1582 8.16875 18.1582 9.09404 18.1582 10.2305V10.254C18.1582 10.9057 18.1582 11.4862 18.1496 12.0028C18.123 13.6094 18.0189 14.7454 17.4521 15.6703C17.057 16.3151 16.5149 16.8572 15.8702 17.2523C15.2545 17.6296 14.5561 17.7977 13.7031 17.8788C12.8663 17.9584 11.8189 17.9584 10.4827 17.9584H7.91706C6.58093 17.9584 5.53343 17.9584 4.69662 17.8788C3.84367 17.7977 3.14525 17.6296 2.52956 17.2523C1.88482 16.8572 1.34273 16.3151 0.947634 15.6703C0.570342 15.0546 0.40219 14.3562 0.321091 13.5033C0.241525 12.6664 0.241529 11.619 0.241535 10.2828L0.241601 9.84472C0.23062 9.43291 0.233992 8.97254 0.237628 8.47614C0.239545 8.21451 0.241535 7.94286 0.241535 7.66305L0.241535 7.62691C0.241528 6.20005 0.241523 5.0802 0.333887 4.19142C0.428093 3.28492 0.623992 2.54554 1.06581 1.91157C1.33274 1.52854 1.65658 1.19063 2.02601 0.910803C2.64127 0.444775 3.36125 0.237604 4.23927 0.138431C5.09588 0.0416752 6.17351 0.041682 7.53859 0.0416906L12.0953 0.0416882C12.7608 0.0416593 13.3248 0.0416348 13.7745 0.104663C14.2548 0.171983 14.6956 0.321743 15.0482 0.689421C15.3544 1.00857 15.4994 1.39359 15.5728 1.81458ZM12.0514 1.29169C12.7728 1.29169 13.2483 1.29313 13.601 1.34256C13.9329 1.38909 14.062 1.46701 14.1461 1.55471C14.2239 1.63582 14.2941 1.75826 14.3413 2.02924C14.3729 2.21043 14.3902 2.43188 14.3993 2.71518C14.0553 2.65223 13.6841 2.61343 13.2798 2.58848C12.5214 2.54169 11.5998 2.54169 10.4692 2.54169H7.91707C6.58091 2.54169 5.53345 2.54168 4.69662 2.62125C3.84367 2.70235 3.14525 2.8705 2.52956 3.24779C2.19766 3.45118 1.89296 3.69352 1.62152 3.96876C1.71299 3.36265 1.86278 2.95423 2.09134 2.62626C2.28432 2.34934 2.51716 2.10689 2.78075 1.90723C3.14553 1.63093 3.61457 1.46694 4.37957 1.38053C5.15786 1.29262 6.16492 1.29169 7.57743 1.29169H12.0514ZM3.18269 4.31359C3.56896 4.07688 4.05348 3.93803 4.81494 3.86563C5.5857 3.79235 6.57384 3.79169 7.94987 3.79169H10.4499C11.6037 3.79169 12.4873 3.79196 13.2028 3.83611C13.9176 3.88022 14.4174 3.96621 14.8113 4.11582C14.9588 4.17185 15.0924 4.23719 15.2171 4.31359C15.6936 4.60562 16.0943 5.00629 16.3863 5.48284C16.5918 5.81821 16.7228 6.22585 16.8012 6.82201H12.2302C10.6298 6.82201 9.33244 8.11936 9.33244 9.71973C9.33244 11.3201 10.6298 12.6175 12.2302 12.6175H16.8827C16.8345 13.8344 16.7017 14.5025 16.3863 15.0172C16.0943 15.4938 15.6936 15.8944 15.2171 16.1865C14.8308 16.4232 14.3463 16.562 13.5848 16.6344C12.814 16.7077 11.8259 16.7084 10.4499 16.7084H7.94987C6.57384 16.7084 5.5857 16.7077 4.81494 16.6344C4.05348 16.562 3.56896 16.4232 3.18269 16.1865C2.70613 15.8944 2.30546 15.4938 2.01343 15.0172C1.77673 14.6309 1.63788 14.1464 1.56548 13.385C1.49219 12.6142 1.49153 11.6261 1.49153 10.25C1.49153 8.87399 1.49219 7.88586 1.56548 7.1151C1.63788 6.35364 1.77673 5.86911 2.01343 5.48284C2.30546 5.00629 2.70613 4.60562 3.18269 4.31359ZM10.5824 9.71973C10.5824 8.80972 11.3202 8.07201 12.2302 8.07201H16.8895C16.908 8.67528 16.9082 9.38704 16.9082 10.25C16.9082 10.6533 16.9082 11.0242 16.9062 11.3675H12.2302C11.3202 11.3675 10.5824 10.6297 10.5824 9.71973Z"
                      fill="#F1FCF3"
                    />
                  </svg>
                ) : (
                  isBigScreen && (
                    <svg
                      width="19"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`${
                        data.buttonValue === "Lend" ? "" : "ml-auto"
                      }`}
                    >
                      <path
                        d="M12.2302 9.09473C11.885 9.09473 11.6052 9.37456 11.6052 9.71973C11.6052 10.0649 11.885 10.3447 12.2302 10.3447H14.5029C14.8481 10.3447 15.1279 10.0649 15.1279 9.71973C15.1279 9.37456 14.8481 9.09473 14.5029 9.09473H12.2302Z"
                        fill="#F1FCF3"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.5728 1.81458C15.6373 2.18455 15.6529 2.62421 15.6572 3.12722C15.7295 3.16493 15.8005 3.20507 15.8702 3.24779C16.5149 3.64289 17.057 4.18497 17.4521 4.82972C17.8871 5.5396 18.0453 6.36233 18.1107 7.40802C18.1582 8.16875 18.1582 9.09404 18.1582 10.2305V10.254C18.1582 10.9057 18.1582 11.4862 18.1496 12.0028C18.123 13.6094 18.0189 14.7454 17.4521 15.6703C17.057 16.3151 16.5149 16.8572 15.8702 17.2523C15.2545 17.6296 14.5561 17.7977 13.7031 17.8788C12.8663 17.9584 11.8189 17.9584 10.4827 17.9584H7.91706C6.58093 17.9584 5.53343 17.9584 4.69662 17.8788C3.84367 17.7977 3.14525 17.6296 2.52956 17.2523C1.88482 16.8572 1.34273 16.3151 0.947634 15.6703C0.570342 15.0546 0.40219 14.3562 0.321091 13.5033C0.241525 12.6664 0.241529 11.619 0.241535 10.2828L0.241601 9.84472C0.23062 9.43291 0.233992 8.97254 0.237628 8.47614C0.239545 8.21451 0.241535 7.94286 0.241535 7.66305L0.241535 7.62691C0.241528 6.20005 0.241523 5.0802 0.333887 4.19142C0.428093 3.28492 0.623992 2.54554 1.06581 1.91157C1.33274 1.52854 1.65658 1.19063 2.02601 0.910803C2.64127 0.444775 3.36125 0.237604 4.23927 0.138431C5.09588 0.0416752 6.17351 0.041682 7.53859 0.0416906L12.0953 0.0416882C12.7608 0.0416593 13.3248 0.0416348 13.7745 0.104663C14.2548 0.171983 14.6956 0.321743 15.0482 0.689421C15.3544 1.00857 15.4994 1.39359 15.5728 1.81458ZM12.0514 1.29169C12.7728 1.29169 13.2483 1.29313 13.601 1.34256C13.9329 1.38909 14.062 1.46701 14.1461 1.55471C14.2239 1.63582 14.2941 1.75826 14.3413 2.02924C14.3729 2.21043 14.3902 2.43188 14.3993 2.71518C14.0553 2.65223 13.6841 2.61343 13.2798 2.58848C12.5214 2.54169 11.5998 2.54169 10.4692 2.54169H7.91707C6.58091 2.54169 5.53345 2.54168 4.69662 2.62125C3.84367 2.70235 3.14525 2.8705 2.52956 3.24779C2.19766 3.45118 1.89296 3.69352 1.62152 3.96876C1.71299 3.36265 1.86278 2.95423 2.09134 2.62626C2.28432 2.34934 2.51716 2.10689 2.78075 1.90723C3.14553 1.63093 3.61457 1.46694 4.37957 1.38053C5.15786 1.29262 6.16492 1.29169 7.57743 1.29169H12.0514ZM3.18269 4.31359C3.56896 4.07688 4.05348 3.93803 4.81494 3.86563C5.5857 3.79235 6.57384 3.79169 7.94987 3.79169H10.4499C11.6037 3.79169 12.4873 3.79196 13.2028 3.83611C13.9176 3.88022 14.4174 3.96621 14.8113 4.11582C14.9588 4.17185 15.0924 4.23719 15.2171 4.31359C15.6936 4.60562 16.0943 5.00629 16.3863 5.48284C16.5918 5.81821 16.7228 6.22585 16.8012 6.82201H12.2302C10.6298 6.82201 9.33244 8.11936 9.33244 9.71973C9.33244 11.3201 10.6298 12.6175 12.2302 12.6175H16.8827C16.8345 13.8344 16.7017 14.5025 16.3863 15.0172C16.0943 15.4938 15.6936 15.8944 15.2171 16.1865C14.8308 16.4232 14.3463 16.562 13.5848 16.6344C12.814 16.7077 11.8259 16.7084 10.4499 16.7084H7.94987C6.57384 16.7084 5.5857 16.7077 4.81494 16.6344C4.05348 16.562 3.56896 16.4232 3.18269 16.1865C2.70613 15.8944 2.30546 15.4938 2.01343 15.0172C1.77673 14.6309 1.63788 14.1464 1.56548 13.385C1.49219 12.6142 1.49153 11.6261 1.49153 10.25C1.49153 8.87399 1.49219 7.88586 1.56548 7.1151C1.63788 6.35364 1.77673 5.86911 2.01343 5.48284C2.30546 5.00629 2.70613 4.60562 3.18269 4.31359ZM10.5824 9.71973C10.5824 8.80972 11.3202 8.07201 12.2302 8.07201H16.8895C16.908 8.67528 16.9082 9.38704 16.9082 10.25C16.9082 10.6533 16.9082 11.0242 16.9062 11.3675H12.2302C11.3202 11.3675 10.5824 10.6297 10.5824 9.71973Z"
                        fill="#F1FCF3"
                      />
                    </svg>
                  )
                )}
              </Button>
              {data.buttonValue === "Lend" ? null : (
                <Button
                  id={`link-button-${cardIndex}`}
                  disable={disable}
                  clickHandler={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard
                        .writeText(
                          `${process.env.NEXT_PUBLIC_BASE_URL}/${selectedChain}/rent/${router?.query?.symbol}/marketplace?token=${data?.id}&share=true`,
                        )
                        .then(() => {
                          toast.success("link copied to clipboard");
                        })
                        .catch((err) => {
                          console.error("Failed to copy the link: ", err);
                        });
                    } else {
                      console.error("Clipboard API not supported");
                    }
                  }}
                  className="hover:bg-gradient-to-r from-[#30B750] to-[#30B750]"
                >
                  <svg
                    width="17"
                    height="10"
                    viewBox="0 0 17 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.86662 9.86665C5.25322 9.86665 5.56662 9.55325 5.56662 9.16665C5.56662 8.78005 5.25322 8.46665 4.86662 8.46665V9.86665ZM11.5333 8.46665C11.1467 8.46665 10.8333 8.78005 10.8333 9.16665C10.8333 9.55325 11.1467 9.86665 11.5333 9.86665V8.46665ZM11.5333 0.133313C11.1467 0.133313 10.8333 0.446714 10.8333 0.833313C10.8333 1.21991 11.1467 1.53331 11.5333 1.53331V0.133313ZM4.86662 1.53331C5.25322 1.53331 5.56662 1.21991 5.56662 0.833313C5.56662 0.446714 5.25322 0.133313 4.86662 0.133313V1.53331ZM4.86662 4.29998C4.48002 4.29998 4.16662 4.61338 4.16662 4.99998C4.16662 5.38658 4.48002 5.69998 4.86662 5.69998V4.29998ZM11.5333 5.69998C11.9199 5.69998 12.2333 5.38658 12.2333 4.99998C12.2333 4.61338 11.9199 4.29998 11.5333 4.29998V5.69998ZM4.86662 8.46665C2.95203 8.46665 1.39995 6.91457 1.39995 4.99998H-4.88162e-05C-4.88162e-05 7.68777 2.17883 9.86665 4.86662 9.86665V8.46665ZM15 4.99998C15 6.91457 13.4479 8.46665 11.5333 8.46665V9.86665C14.2211 9.86665 16.4 7.68777 16.4 4.99998H15ZM11.5333 1.53331C13.4479 1.53331 15 3.08539 15 4.99998H16.4C16.4 2.31219 14.2211 0.133313 11.5333 0.133313V1.53331ZM4.86662 0.133313C2.17883 0.133313 -4.88162e-05 2.31219 -4.88162e-05 4.99998H1.39995C1.39995 3.08539 2.95203 1.53331 4.86662 1.53331V0.133313ZM4.86662 5.69998H11.5333V4.29998H4.86662V5.69998Z"
                      fill="#F1FCF3"
                    />
                  </svg>
                </Button>
              )}
            </>
          ) : (
            <div></div>
            // <button
            //   className="hover:bg-gradient-to-r from-[#30B750] to-[#30B750] !h-fit !px-4 !py-2 grow !justify-center !items-center flex-1 font-medium w-full border mt-1 border-solid border-white transition-all duration-300 rounded-lg"
            //   onClick={() =>
            //     window.open(
            //       `/view/${data?.tokenAddress}/${data?.tokenId}`,
            //       "_blank"
            //     )
            //   }
            // >
            //   View
            // </button>
          )}
        </div>
      </div>
    </LendRentWrapper>
  );
};

export const LandingTopCard = ({ data, clickHandler }) => {
  return (
    <LandingTopCardWrapper onClick={clickHandler}>
      <img src={data && data.image} alt="" />
      <div className="text-wrapper">
        <h1>{data && data.name}</h1>
        <div>
          <p>
            Listed Assets <span>{data && data.list}</span>
          </p>
          <div className="dot"></div>
          <p>
            Total Rentals <span>{data && data.rent}</span>
          </p>
        </div>
      </div>
    </LandingTopCardWrapper>
  );
};
export const LandingBottomCard = ({ data, clickHandler }) => {
  return (
    <LandingBottomCardWrapper onClick={clickHandler}>
      <img src={data && data.image} alt="" className="bg-image" />
      <img src={data && data.image} alt="" className="round-image" />
      <div className="text-wrapper">
        <h1>
          {data && data.name.length > 10
            ? `${data.name.substr(0, 10)}..`
            : data.name}{" "}
        </h1>
        <div>
          <p>
            Listed Assets <span>{data && data.list}</span>
          </p>
          <div className="dot"></div>
          <p>
            Total Rentals <span>{data && data.rent}</span>
          </p>
        </div>
      </div>
    </LandingBottomCardWrapper>
  );
};
