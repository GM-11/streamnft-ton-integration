import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import LuckyWheelImage from "../../../../public/images/luckywheel.png";
import CommunityImage from "../../../../public/images/community.png";
import { CloseIcon } from "../Icons";

const HowToRedeemModal = ({ open, handleClose }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 " />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto z-[10000]">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="h-fit max-w-[680px] bg-white gap-3 px-6 rounded-md p-6 flex flex-col items-start relative">
                <CloseIcon
                  size={21}
                  className="text-grayscale-21 cursor-pointer absolute top-7 right-7"
                  onClick={handleClose}
                />
                <h5 className="text-grayscale-21 text-[28px]">How To Redeem</h5>
                <p className="text-grayscale-4 text-left text-xs mt-2">
                  Corem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum, ac aliquet odio mattis.
                </p>
                <div className="h-48 w-full flex gap-6">
                  <div className="h-full grow flex-1 bg-white-4 rounded-lg p-6">
                    <Image
                      src={LuckyWheelImage}
                      alt="#"
                      className="h-12 w-auto object-contain"
                      height={128}
                      width={128}
                    />
                    <h5 className="text-grayscale-21 text-2xl text-left">
                      Lucky Wheel
                    </h5>
                    <p className="text-grayscale-4 text-[13px] text-left">
                      Use points to win NFT or rewards and maximize by offering
                      extra points to participate
                    </p>
                  </div>
                  <div className="h-full grow flex-1 bg-white-4 rounded-lg p-6">
                    <Image
                      src={CommunityImage}
                      alt="#"
                      className="h-12 w-auto object-contain"
                      height={128}
                      width={128}
                    />
                    <h5 className="text-grayscale-21 text-2xl text-left">
                      Community
                    </h5>
                    <p className="text-grayscale-4 text-[13px] text-left mt-2">
                      Create random art by utilizing points
                    </p>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HowToRedeemModal;
