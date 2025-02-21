import React, { useContext } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import DropdownPopper from "../../Reusables/utility/DropdownPopper";
import "react-element-popper/build/element_popper.css";
import FormPopup from "./components/FormPopup";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";

const Eligibility = ({ rewardMethods, setTelegramBotVerified }) => {
  const methods = useFormContext();

  const { eligibilityOptions } = useContext(CreateUtilityContext);

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "formArray",
  });

  const arrayValue = useWatch({ control: methods.control });

  return (
    <>
      <div className="flex items-center flex-wrap gap-4 mb-4 border-2 border-solid border-grayscale-2 p-5 rounded-lg">
        {eligibilityOptions?.map((item, id) => {
          return (
            <DropdownPopper
              title={item.title}
              items={item?.options}
              image={item?.image_url}
              key={id}
              isActive={item?.active}
              onItemClick={(index) => {
                eligibilityOptions[id].active = true;
                append(item?.options?.[index]?.fields);
              }}
            />
          );
        })}
        {!!methods?.formState?.errors?.formArray && (
          <p className="text-remDays-block text-xs">
            {methods?.formState?.errors?.formArray?.message}
          </p>
        )}
      </div>
      <div className="">
        {fields?.map((field, index) => (
          <FormPopup
            data={field}
            key={field.id}
            title={field?.heading}
            closeHandler={() => {
              eligibilityOptions[field.parentIndex].active = false;
              remove(index);
            }}
            index={index}
            rewardMethods={rewardMethods}
            setTelegramBotVerified={setTelegramBotVerified}
          />
        ))}
      </div>
    </>
  );
};

export default Eligibility;
