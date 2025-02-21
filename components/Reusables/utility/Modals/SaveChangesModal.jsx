import React from "react";
import Modal from "./Modal";
import Button from "../Button";
import Loader from "../../loan/Loader";

const SaveChangesModal = ({
  open,
  handleClose,
  onSave,
  onDiscard,
  onCancel,
  loading,
}) => {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      titleClasses={"!text-xl"}
      panelClasses={"!max-w-4xl"}
    >
      {loading ? (
        <>
          <Loader customMessage={"Updating Utility Data"} />
        </>
      ) : (
        <>
          <div className="min-h-fit text-white p-8">
            <p>Are you sure you want to discard these changes?</p>
          </div>
          <div className="h-fit p-3 border-t-2 border-solid border-white/10 flex items-center gap-6 justify-end">
            <Button
              onClick={onSave}
              buttonClasses={"bg-green-4 border-green-4 !text-xs"}
            >
              Save Changes
            </Button>
            <Button
              onClick={onDiscard}
              buttonClasses={"bg-green-4 border-green-4 !text-xs"}
            >
              Discard Changes
            </Button>
            <Button
              onClick={onCancel}
              buttonClasses={"bg-green-4 border-green-4 !text-xs"}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SaveChangesModal;
