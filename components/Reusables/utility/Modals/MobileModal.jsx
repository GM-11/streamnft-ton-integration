import React, { useEffect, useContext, Fragment } from "react";
import { CloseIcon } from "../Icons";
import { Dialog, Transition } from "@headlessui/react";

const MobileModal = ({ children, openModal, setOpenModal }) => {
  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [openModal]);

  return (
    <Transition appear show={openModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={() => {
          setOpenModal(false);
          document.body.style.overflow = "auto";
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0  bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-visible">
          <div className="flex h-full items-center justify-center text-center ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-screen flex flex-col justify-end">
                <div className="flex items-center justify-center h-16 w-full">
                  <div
                    className="h-8 w-8 flex items-center justify-center rounded-full cursor-pointer bg-[#353535]"
                    onClick={() => {
                      setOpenModal(false);
                      document.body.style.overflow = "auto";
                    }}
                  >
                    <CloseIcon size={21} color="#fff" />
                  </div>
                </div>
                <div className="w-full max-h-[420px] min-h-[420px] overflow-y-auto relative transform bg-[#121212] transition-all rounded-t-lg">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileModal;
