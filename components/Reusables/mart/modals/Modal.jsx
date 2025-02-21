import React, { useContext, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import * as Styles from "./modalStyles";
import { CloseIcon } from "../../rent/Icons";
import Button from "../../rent/Button";
import { ModalContext } from "@/context/ModalContext";

const Modal = ({
  headerText,
  children,
  buttonText,
  buttonIcon,
  buttonHandler,
  disable,
  error = "",
  loading = false,
  bodyClasses,
  onClose,
}) => {
  const { openModal, setOpenModal } = useContext(ModalContext);

  const defaultCloseHandler = () => {
    setOpenModal(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Transition appear show={openModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        onClose={defaultCloseHandler}
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
          <div className="fixed inset-0  bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-visible">
          <div className="flex h-full items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-1/2 h-fit max-h-[600px] transform bg-[#121212] border-2 border-solid border-[#292929] text-left align-middle shadow-xl transition-all rounded-lg">
                {/* Modal Header */}
                {headerText?.length > 0 && (
                  <Styles.ModalHeader>
                    <h5>{headerText}</h5>
                    <Styles.Closebutton>
                      <CloseIcon size={28} onClick={defaultCloseHandler} />
                    </Styles.Closebutton>
                  </Styles.ModalHeader>
                )}

                {/* Modal Body */}
                <Styles.ModalBody className={bodyClasses}>
                  {children}
                </Styles.ModalBody>

                {/* Modal Footer */}
                {!loading && buttonText?.length > 0 && (
                  <Styles.ModalFooter>
                    <div className="flex items-center">
                      {error !== "" && (
                        <span className="text-red mr-2">ERROR :</span>
                      )}
                      <span className="text-white flex items-center">
                        {error}
                      </span>
                    </div>
                    <div className="max-w-24">
                      <Button
                        disabled={disable}
                        clickHandler={buttonHandler}
                        className={`${
                          !disable && "hover:bg-gradient-to-r"
                        } gap-2 flex !items-center !justify-center min-w-28  from-[#30B750] to-[#30B750]`}
                      >
                        {buttonText}{" "}
                        <span className="">
                          {buttonIcon ? buttonIcon : null}
                        </span>
                      </Button>
                    </div>
                  </Styles.ModalFooter>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
