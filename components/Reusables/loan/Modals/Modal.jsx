import React, { useEffect, useContext } from "react";
import { ModalContext } from "@/context/ModalContext";
import Button, { ModalButton, ModalButton2 } from "../Button";
import * as Styles from "./modalStyles";
import ReactPortal from "../Portal";
import footerIcon from "../../../../public/images/info-circle.svg";
import footerIcon2 from "../../../../public/images/info-circle-red.svg";

import Image from "next/image";

const Modal = ({
  headerText,
  children,
  buttonText,
  footerText,
  type,
  handelButton,
  buttonText2,
  handelButton2,
  trackingData,
  disabled,
}) => {
  const { openModal, setOpenModal, setModalType } = useContext(ModalContext);

  return openModal ? (
    <>
      <ReactPortal wrapperId="react-portal-modal-container">
        <Styles.Wrapper
          open={openModal}
          onClick={() => {
            setOpenModal(false);
            if (
              trackingData?.tab == "lend" ||
              trackingData?.pagename == "borrow"
            ) {
              analytics.track(
                `dapp_loan_tab_${trackingData?.pagename}_${trackingData?.collection_name}_drop-down_offers_${trackingData?.apy}_${trackingData?.duration}_${trackingData?.tab}_cancel`
              );
            } else {
              analytics.track(
                `dapp_loan_tab_${trackingData?.pagename}_${trackingData?.collection_name}_drop-down_nft_listing_${trackingData?.tab}_cancel`
              );
            }
          }}
        >
          <Styles.ModalBox
            onClick={(e) => e.stopPropagation()}
            className="border-2 border-solid border-modal-border bg-modal-background"
          >
            {type === "noHeaderAndFooter" ? (
              <>{children}</>
            ) : (
              <>
                <Styles.ModalHeader>
                  <h5 className="!font-numans text-xl !font-normal">
                    {headerText}
                  </h5>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 cursor-pointer"
                    onClick={() => {
                      setOpenModal(false);
                      setModalType("");
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Styles.ModalHeader>
                <Styles.ModalBody>{children}</Styles.ModalBody>
                <Styles.ModalFooter>
                  <h5 className="!font-numans text-sm !font-normal whitespace-nowrap text-modal-footer-text flex flex-row items-center gap-3">
                    {footerText && (
                      <Image
                        src={disabled ? footerIcon2 : footerIcon}
                        alt="footer icon"
                        className="w-4 h-4"
                      />
                    )}
                    {footerText}
                  </h5>
                  <div className="!flex !flex-row !items-center !gap-4">
                    <Button
                      clickHandler={() => {
                        handelButton();
                      }}
                      disabled={disabled}
                      id={buttonText}
                    >
                      {buttonText}
                    </Button>
                    {buttonText2 === "No, Cancel" && (
                      <Button
                        clickHandler={() => handelButton2()}
                        type="red"
                        disabled={disabled}
                        id={buttonText2}
                      >
                        {buttonText2}
                      </Button>
                    )}
                  </div>
                </Styles.ModalFooter>
              </>
            )}
          </Styles.ModalBox>
        </Styles.Wrapper>
      </ReactPortal>
    </>
  ) : null;
};

export default Modal;
