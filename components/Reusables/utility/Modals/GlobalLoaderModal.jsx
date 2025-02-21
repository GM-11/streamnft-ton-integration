import React, { useContext } from "react";
import Modal from "@/components/Reusables/utility/Modals/Modal";
import { ChainContext } from "@/context/ChainContext";
import Loader from "@/components/Reusables/loan/Loader";

const GlobalLoaderModal = ({ open }) => {
  const { globalLoaderMessage } = useContext(ChainContext);

  return (
    <Modal
      open={open}
      handleClose={() => {}}
      titleClasses={"!text-xl"}
      panelClasses={"!max-w-xl"}
    >
      <div className="p-8 flex flex-col items-center justify-center gap-6">
        <Loader customMessage={globalLoaderMessage} />
      </div>
    </Modal>
  );
};

export default GlobalLoaderModal;
