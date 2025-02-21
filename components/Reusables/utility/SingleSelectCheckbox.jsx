import React, { useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import Input from "./Input";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
const Radio = dynamic(() => import("./Radio"), { ssr: false });

const SingleSelectCheckbox = ({ data }) => {
  const { register, setValue, watch } = useFormContext();
  const { query } = useRouter();
  const selectedOptionInUtilityType = watch("selectedOptionInUtilityType");
  const [selectedOptionLocal, setSelectedOptionLocal] = useState([
    {
      displayText: "enter comma seprated coupon codes",
      storeAs: "detail",
    },
    {
      displayText: "enter comma seprated coupon codes",
      storeAs: "detail",
    },
  ]);

  useEffect(() => {
    const selectedOption = data?.find(
      (el) => el?.title === selectedOptionInUtilityType
    );

    setSelectedOptionLocal(selectedOption?.form ?? []);
  }, [selectedOptionInUtilityType]);

  return (
    <>
      <div
        className={`flex gap-4 mt-8 mb-4 ${
          query?.id?.length > 0 && "pointer-events-none"
        }`}
      >
        {data?.map((el) => (
          <div className="flex gap-2">
            <Radio
              name={"selectedOptionInUtilityType"}
              value={el?.title}
              customSelectBg={"bg-green-4"}
              customBorder={"border-green-4"}
            />
            <h5 className="text-sm">{el?.title}</h5>
          </div>
        ))}
      </div>
      {selectedOptionLocal?.map((el) => (
        <Input
          placeholder={el?.displayText}
          reactHookFormRegister={{ ...register(`${el?.displayText}`) }}
          containerClasses={"bg-grayscale-22"}
          disableEffect={query?.id?.length > 0}
        />
      ))}
    </>
  );
};

export default SingleSelectCheckbox;
