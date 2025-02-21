import Button from "@/components/Reusables/loan/Button";
import { ModalContext } from "@/context/ModalContext";
import { useContext } from "react";
import { useRouter } from "next/router";
import { ChainContext } from "@/context/ChainContext";

export const LoanCard = ({
  isExpired,
  name = "Dead Pixels ",
  image = "/images/cuteape.png",
  totalLiquidity,
  bestOffer = 1000,
  lastLoanTaken,
  apy = "60%",
  duration = 14,
  setShowModal,
  yourOffer = "0",
  totalOffersByYou = "0",
  loanStatus = "Unclaimed",
  lendData = [],
  btnVal = "Cancel",
  borrowedAmount = "1",
  repaymentAmount = "2",
  handleClose,
  handleEdit,
  handleClaim,
  loansData = [],
  interestAmount = "1",
  borrowData = [],
  daysRemaining = 1,
  offers,
  offersTaken,
  setSelectedTab,
  tokenId,
}) => {
  const { setLendData, setModalType, setLoanData, setBorrowData } =
    useContext(ModalContext);

  const { chainDetail, setCollectionId } = useContext(ChainContext);
  const router = useRouter();

  return (
    <>
      <article
        className="rounded-xl bg-modal-field-bg-2 w-full text-2xs text-white  max-w-full xs:!max-w-[220px] p-2"
        style={{ boxShadow: "0px 4px 0px 0px #252525" }}
      >
        <div className="h-16 w-full mb-2 flex items-center gap-4 border-b border-solid border-gray-2">
          <img
            src={image}
            height={48}
            width={48}
            alt="NFT"
            className={`rounded-full items-center `}
          />
          <div>
            <h2 className="text-xs break-all">{name}</h2>{" "}
            {router.pathname.includes("loans") && (
              <p className="text-xs text-white">ID : #{tokenId}</p>
            )}
          </div>
        </div>
        <div className="flex w-full justify-between mb-2">
          <h5 className="text-table-button-border">
            {router.pathname?.includes("/loans")
              ? "Borrowed Amount"
              : router.pathname?.includes("/offers")
              ? "Your Offer"
              : "Liquidity"}
          </h5>
          <div className="flex flex-col items-end">
            <h5>
              {router.pathname?.includes("/offers") ? (
                yourOffer
              ) : router.pathname.includes("/loans") ? (
                <>{borrowedAmount}</>
              ) : (
                totalLiquidity
              )}
              <span className="ml-1">
                {chainDetail?.chain_id == "296"
                  ? "HBAR"
                  : (chainDetail?.chain_id == "solana") === "SOL"}
              </span>
            </h5>
            <h5 className="text-table-button-border">
              {router.pathname?.includes("/offers") ? (
                totalOffersByYou
              ) : router.pathname.includes("/loans") ? (
                ""
              ) : (
                <>
                  {offersTaken} / {offers}
                </>
              )}
            </h5>
          </div>
        </div>
        <div className="flex w-full justify-between mb-2">
          <h5 className="text-table-button-border">
            {router.pathname?.includes("/loans")
              ? "APY"
              : router.pathname?.includes("/offers")
              ? "APY"
              : "Best Offer"}
          </h5>
          <div className="flex flex-col items-end">
            <h5>
              {router.pathname.includes("offers") ||
              router.pathname.includes("/loans") ? (
                `${apy} %`
              ) : (
                <>
                  {bestOffer}
                  <span className="ml-1">
                    {chainDetail?.chain_id == "296"
                      ? "HBAR"
                      : (chainDetail?.chain_id == "solana") === "SOL"}
                  </span>
                </>
              )}
            </h5>
            {(router.pathname.includes("/borrow") ||
              router.pathname === "/[chain]") && (
              <h5 className="text-table-button-border">
                {lastLoanTaken}
                <span className="mx-[1px]">
                  {/* {chainDetail?.chain_id == "296"
                    ? "HBAR"
                    : (chainDetail?.chain_id=="solana") === "SOL"} */}
                </span>{" "}
                last taken
              </h5>
            )}
          </div>
        </div>
        <div className="flex w-full justify-between mb-2">
          <h5 className="text-table-button-border">
            {router.pathname?.includes("/loans")
              ? "Repayment"
              : router.pathname?.includes("/offers")
              ? "Status"
              : router.pathname?.includes("/borrow")
              ? "Interest"
              : "APY"}
          </h5>
          <div className="flex flex-col items-end">
            <h5>
              {router.pathname.includes("/offers")
                ? loanStatus
                : router.pathname.includes("/loans")
                ? `${Number(repaymentAmount).toFixed(3)} ${
                    chainDetail?.currency_symbol
                  }`
                : router.pathname.includes("/borrow")
                ? `${Number(interestAmount).toFixed(2)} %`
                : `${apy} %`}
            </h5>
          </div>
        </div>
        <div className="flex w-full justify-between mb-2">
          <h5 className="text-table-button-border">Duration</h5>
          <div className="flex flex-col items-end">
            <h5>
              {router.pathname.includes("loans")
                ? isExpired
                  ? "Expired"
                  : `${daysRemaining}`
                : `${duration} D`}
            </h5>
          </div>
        </div>

        {loanStatus !== "Active" && (
          <div
            className="col-span-5"
            style={{
              height: "1px",
              width: "100%",
              marginBottom: "5px",
              background: "#30365c",
            }}
          ></div>
        )}
        <div className="flex items-center justify-between py-2">
          {!(
            router.pathname?.includes("/offers") ||
            router.pathname?.includes("/loans")
          ) ? (
            <h5
              className="text-green-3 min-w-[40%] underline cursor-pointer"
              onClick={() => {
                setModalType("lend");
                setSelectedTab("offers");
                setLendData(lendData);
                setShowModal(true);
              }}
            >
              View more <br /> pools
            </h5>
          ) : (
            <div className="min-w-[1%] h-fit"></div>
          )}
          {router.pathname?.includes("lend") && (
            <div className="">
              <Button
                clickHandler={() => {
                  setModalType("lend");
                  setLendData(lendData);
                  setShowModal(true);
                  setSelectedTab("");
                }}
                classes={"!h-8 !px-2"}
              >
                <h5 className="!text-2xs">Lend</h5>
              </Button>
            </div>
          )}
          {router.pathname?.includes("borrow") && (
            <div className="flex flex-row justify-end">
              <Button
                clickHandler={() => {
                  setModalType("borrow");
                  setBorrowData(borrowData);
                  setCollectionId(borrowData?.pool?.tokenAddress);
                  setShowModal(true);
                  setSelectedTab("borrow");
                }}
                classes={"!h-8 !px-2"}
              >
                <h5 className="!text-2xs">Borrow</h5>
              </Button>
            </div>
          )}
          {router.pathname?.includes("offers") && (
            <div className="flex flex-row gap-2 justify-end">
              {loanStatus == "UnClaimed" ? (
                <>
                  <Button
                    clickHandler={() => handleEdit()}
                    classes={"!h-8 !px-2"}
                  >
                    <h5 className="!text-2xs">Edit</h5>
                  </Button>

                  <Button
                    clickHandler={() => handleClose()}
                    type="red"
                    classes={"!h-8 !px-2"}
                  >
                    <h5 className="!text-2xs">{btnVal}</h5>
                  </Button>
                </>
              ) : loanStatus == "Defaulted" ? (
                <Button
                  clickHandler={() => handleClaim()}
                  classes={"!h-8 !px-2"}
                >
                  <h5 className="!text-2xs">{btnVal}</h5>
                </Button>
              ) : loanStatus === "Awaiting buyer" ? (
                <>
                  <Button
                    clickHandler={() => handleClose()}
                    classes={"!h-8 !px-2"}
                    type={"red"}
                  >
                    <h5 className="!text-2xs">Cancel</h5>
                  </Button>
                  <Button
                    clickHandler={() => handleEdit()}
                    classes={"!h-8 !px-2"}
                  >
                    <h5 className="!text-2xs">Edit</h5>
                  </Button>
                </>
              ) : null}
            </div>
          )}
          {router.pathname?.includes("loans") && (
            <div className="col-span-5 flex flex-row gap-x-8 justify-end">
              {!isExpired ? (
                <Button
                  clickHandler={() => {
                    setShowModal(true);
                    setLoanData(loansData);
                  }}
                  classes={"!h-8 !px-2"}
                >
                  <h5 className="!text-2xs">{loansData.btnVal}</h5>
                </Button>
              ) : (
                <Button
                  clickHandler={() => {}}
                  type="red"
                  classes={"!h-8 !px-2"}
                >
                  <h5 className="!text-2xs">Defaulted</h5>
                </Button>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
};
