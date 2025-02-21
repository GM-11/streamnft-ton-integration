import React, { forwardRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useFormContext } from "react-hook-form";

const DatePicker = ({
  name,
  placeholder,
  defaultValue,
  minDate,
  disableEffect,
}) => {
  const { control } = useFormContext();

  const [hours, setHours] = useState(null);

  const [minutes, setMinutes] = useState(null);

  const CustomInput = forwardRef(({ value, onClick }, ref) => {
    return (
      <button
        className={`flex items-center min-w-full rounded-lg  px-3 py-2 text-sm h-12 outline-none justify-start gap-3 text-faded-white`}
        onClick={onClick}
        ref={ref}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-5 text-gray-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
          />
        </svg>
        {value === "" ? placeholder : value + " UTC"}
      </button>
    );
  });

  CustomInput.displayName = "CustomInput";

  return (
    <div className="relative w-full">
      {disableEffect && (
        <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => {
          const { onChange, value, name, ref } = field;

          return (
            <ReactDatePicker
              onChange={onChange}
              selected={value}
              dateFormat="dd-MM-yyyy (h:mm aa)"
              name={name}
              ref={ref}
              minDate={minDate ?? new Date()}
              customInput={<CustomInput />}
              minTime={
                minDate?.setHours(minDate?.getHours()) ??
                new Date().setHours(0, 0, 0, 0)
              }
              maxTime={new Date().setHours(23, 59, 59, 999)}
              className="border border-gray-200 px-4 py-2 text-gray-500 outline-none "
              placeholderText="DD-MM-YYYY"
              popperPlacement="bottom"
              showTimeSelect
            />
          );
        }}
      />
    </div>
  );
};

export default DatePicker;
