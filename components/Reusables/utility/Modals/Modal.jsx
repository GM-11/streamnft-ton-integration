"use client";
import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CloseIcon } from "../Icons";

const Modal = ({
  handleClose,
  open,
  title,
  children,
  titleClasses,
  panelClasses,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={handleClose}>
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

        <div className="fixed inset-0 overflow-y-auto z-[1000]">
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
              <Dialog.Panel
                className={`w-full max-w-2xl transform overflow-hidden rounded-md bg-modal-background border-2 border-solid border-modal-border !text-white text-left align-middle !font-numans shadow-xl z-[1000] transition-all relative ${panelClasses}`}
              >
                {title?.length > 0 && (
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    <div className="relative mb-2 flex w-full flex-row items-center justify-between p-4 border-b border-solid border-[#ddd]">
                      <p className={`text-base font-semibold ${titleClasses}`}>
                        {title}
                      </p>
                      <CloseIcon
                        color="#fff"
                        onClick={handleClose}
                        className="font-bold cursor-pointer"
                      />
                    </div>
                  </Dialog.Title>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
