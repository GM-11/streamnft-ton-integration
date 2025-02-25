import QuillTextEditor from "@/components/Reusables/QuillTextEditor";
import React from "react";

const CustomInput = ({
  reactHookFormRegister,
  label,
  labelClasses,
  multiline,
  containerClasses,
  inputClasses,
  startIcon,
  withGradientBorder,
  textEditor,
  mainContainerClassnames,
  type,
  methods,
  placeholder,
  disableEffect,
  ...props
}) => {
  return (
    <div
      className={`flex items-start justify-between pb-4 pt-8 w-full ${
        mainContainerClassnames ?? ""
      }`}
    >
      {label && (
        <label className={`font-medium w-1/2 text-white ${labelClasses ?? ""}`}>
          {label}
        </label>
      )}
      <div className="w-full h-full relative ml-4">
        {disableEffect && (
          <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
        )}

        {multiline ? (
          <textarea
            {...props}
            {...reactHookFormRegister}
            placeholder={placeholder}
            className={`h-8 w-full rounded-lg px-4 text-sm text-faded-white placeholder:text-faded-white bg-grayscale-22 focus:outline-none py-2 ${
              inputClasses ?? ""
            }`}
          />
        ) : textEditor ? (
          <QuillTextEditor
            field={reactHookFormRegister}
            placeholder={placeholder}
          />
        ) : (
          <>
            {withGradientBorder ? (
              <div className="bg-black rounded-xl">
                <div className="bg-gradient-to-t border-[1.5px] border-[#ffffff30] rounded-xl from-[#255C7826] to-[#16194526]">
                  <div className="flex items-center p-4">
                    {startIcon && <div className="mr-2">{startIcon}</div>}
                    <input
                      {...reactHookFormRegister}
                      {...props}
                      placeholder={placeholder}
                      className={`text-sm px-4 grow bg-[rgba(0,0,0,0)] bg-clip-text text-faded-white placeholder:text-faded-white focus:outline-none bg-grayscale-22 py-2 ${
                        inputClasses ?? ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`flex items-center bg-grayscale-22 h-12 rounded-lg px-4 ${containerClasses}`}
              >
                {startIcon && <div className="mr-2">{startIcon}</div>}
                <input
                  {...reactHookFormRegister}
                  {...props}
                  placeholder={placeholder}
                  type={type ?? "text"}
                  className={`text-sm bg-[rgba(0,0,0,0)] bg-clip-text grow text-faded-white placeholder:text-faded-white focus:outline-none w-full py-2 ${
                    inputClasses ?? ""
                  }`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomInput;
