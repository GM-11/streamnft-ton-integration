import React from "react";
// import QuillTextEditor from "../QuillTextEditor";

const Input = ({
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
  readOnly,
  ...props
}) => {
  return (
    <div className={`flex flex-col w-full ${mainContainerClassnames}`}>
      {label && (
        <label className={`font-medium text-white mb-2  ${labelClasses ?? ""}`}>
          {label}
        </label>
      )}
      <div className="w-full h-full relative">
        {disableEffect && (
          <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
        )}
        {multiline ? (
          <textarea
            {...props}
            {...reactHookFormRegister}
            placeholder={placeholder}
            readOnly={readOnly}
            className={` h-12 w-full rounded-lg px-4 text-sm text-faded-white placeholder:text-faded-white bg-grayscale-22 focus:outline-none p-4 ${
              inputClasses ?? ""
            }`}
          />
        ) : textEditor ? (
          <textarea
            field={reactHookFormRegister}
            placeholder={placeholder}
            readOnly={readOnly}
          />
        ) : (
          <>
            {withGradientBorder ? (
              <div className="bg-black rounded-xl">
                <div className="bg-gradient-to-t border-[1.5px] border-[#ffffff30] rounded-xl from-[#255C7826] to-[#16194526] ">
                  <div className="flex items-center p-4">
                    {startIcon}
                    <input
                      {...reactHookFormRegister}
                      {...props}
                      placeholder={placeholder}
                      readOnly={readOnly}
                      className={`text-sm px-4 grow bg-[rgba(0,0,0,0)] text-faded-white placeholder:text-faded-white focus:outline-none bg-grayscale-22 ${
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
                {startIcon}
                <input
                  {...reactHookFormRegister}
                  {...props}
                  placeholder={placeholder}
                  type={type ?? "text"}
                  readOnly={readOnly}
                  className={`text-sm bg-transparent grow text-faded-white bg-clip-text placeholder:!text-faded-white focus:outline-none w-full  ${
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

export default Input;
