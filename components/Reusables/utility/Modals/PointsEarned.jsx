import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const PointsEarnedModal = ({ open, handleClose }) => {
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
              <div className="h-24 bg-green-4 flex items-center gap-3 px-6 rounded-md">
                <div className="h-20 w-20 rounded-md bg-green-12/30"></div>
                <div className="flex flex-col gap-4 items-start">
                  <h5>+10 Points</h5>
                  <p className="text-xs text-green-5">
                    you have received 10 points
                    <br /> for connecting your walllet
                  </p>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PointsEarnedModal;
