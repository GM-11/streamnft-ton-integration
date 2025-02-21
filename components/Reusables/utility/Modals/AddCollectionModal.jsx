import React, { useContext } from "react";
import Modal from "./Modal";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import Input from "../Input";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { ChainContext } from "@/context/ChainContext";
import { toast } from "react-toastify";

const AddCollectionModal = ({
  open,
  handleClose,
  placeholder,
  method,
  title,
  buttonTitle,
  onButtonClick,
  customComponent,
}) => {
  const methods = useFormContext();
  const { chainDetails } = useContext(ChainContext);
  return (
    <Modal title={title} open={open} handleClose={handleClose}>
      <div className="min-h-[350px]">
        <FormProvider {...methods}>
          <div className="p-4 ">
            <Dropdown
              name="chainId"
              placeholder={"Select Chain"}
              valueContainerClasses={"!text-xs !bg-grayscale-22"}
              items={chainDetails?.map((el) => {
                return { label: el?.chain_name, value: el };
              })}
              onSelect={(el) => {
                methods.setValue("chainId", el?.value?.chain_id);
              }}
              classes={{ optionsWrapper: "!bg-grayscale-22" }}
            />
          </div>
          <div className="p-4">
            <Input
              placeholder={placeholder}
              reactHookFormRegister={{ ...methods.register(method) }}
              mainContainerClassnames={"pb-6"}
              inputClasses={"!bg-modal-field-bg-2 !text-xs"}
            />
            {customComponent}
            <Button
              onClick={() => {
                const formValues = methods.getValues();

                if (formValues?.chainId?.length <= 0) {
                  toast.error("Please select a chain.");
                } else if (formValues?.tokenAddress?.length <= 0) {
                  toast.error("Please provide token address");
                } else {
                  onButtonClick(methods.getValues());
                }
              }}
            >
              {buttonTitle}
            </Button>
          </div>
        </FormProvider>
      </div>
    </Modal>
  );
};

export default AddCollectionModal;
