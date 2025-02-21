import React, { useRef } from "react";
import { toast } from "react-toastify";
import { getFunctionParamsAndOutputs, parseAbi } from "@/utils/service";
import { FaEdit } from "react-icons/fa";
import { useFormContext, Controller } from "react-hook-form";

const Test = ({ index }) => {
  const methods = useFormContext();
  const { setValue, watch, control } = methods;
  const fileInputRef = useRef(null);

  const abi = watch(`formArray.${index}.abi`, "");
  const fileName = watch(`formArray.${index}.filename`, "");
  const selectedFunction = watch(`formArray.${index}.selectedFunction`, "");
  const params = watch(`formArray.${index}.params`, []);
  const output = watch(`formArray.${index}.output`, []);
  const showInputs = watch(`formArray.${index}.showInputs`, false);
  const contractAddress = watch(`formArray.${index}.contractAddress`, "");

  const handleFunctionSelection = (event) => {
    const func = event.target.value;
    setValue(`formArray.${index}.selectedFunction`, func);
    const { params, outputs } = getFunctionParamsAndOutputs(abi, func);
    setValue(`formArray.${index}.params`, params);
    setValue(
      `formArray.${index}.output`,
      outputs.filter((output) => !output.type.includes("[]"))
    );
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(`formArray.${index}.selectedFunction`, "");
        setValue(`formArray.${index}.params`, []);
        setValue(`formArray.${index}.output`, []);

        setValue(`formArray.${index}.abi`, e.target.result);
      };
      reader.readAsText(file);

      // Set the new file name
      setValue(`formArray.${index}.filename`, file.name);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (parseAbi(abi)) {
      toast.success("Form submitted successfully!");
    }
  };

  const renderFunctionOptions = () => {
    const parsedAbi = parseAbi(abi);
    return (
      parsedAbi?.map((func, index) => (
        <option key={index} value={func.name}>
          {func.name}
        </option>
      )) || []
    );
  };

  const renderParams = () =>
    params.length ? (
      params.map((param, index) => (
        <div key={index} className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-white">
            {param.name}
          </label>
          <Controller
            control={control}
            name={`formArray.${index}.params[${index}].value`}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`p-3 block w-full border-grayscale-5 rounded-md bg-black-7 text-white ${
                  param.isAddress ? "bg-gray-500" : ""
                }`}
                placeholder="Enter value"
                disabled={param.isAddress}
              />
            )}
          />
          <div className="flex items-center mt-2">
            <Controller
              control={control}
              name={`formArray.${index}.params[${index}].isAddress`}
              render={({ field }) => (
                <input
                  {...field}
                  type="checkbox"
                  className="h-4 w-4 text-green-4 focus:ring-green-4 border-grayscale-6 rounded"
                />
              )}
            />
            <p className="ml-2 text-xs">Variable Parameter</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-sm text-grayscale-6">No input parameters</p>
    );

  const renderOutputs = () =>
    output.length ? (
      output.map((param, index) => (
        <div key={index} className="flex flex-col">
          <label className="block text-sm font-medium text-white">
            {param.name}
          </label>
          <Controller
            control={control}
            name={`formArray.${index}.output[${index}].value`}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`p-3 block w-full border-grayscale-5 rounded-md bg-black-7 text-white ${
                  param.isAddress || !param.isRelevant ? "bg-gray-500" : ""
                }`}
                placeholder={
                  param.isAddress || !param.isRelevant ? "" : "Enter value"
                }
                disabled={param.isAddress || !param.isRelevant}
              />
            )}
          />

          <div className="flex gap-5">
            <div className="flex items-center mt-2">
              <Controller
                control={control}
                name={`formArray.${index}.output[${index}].isAddress`}
                render={({ field }) => (
                  <input
                    {...field}
                    type="checkbox"
                    className="h-4 w-4 text-green-4 focus:ring-green-4 border-grayscale-6 rounded"
                  />
                )}
              />
              <p className="ml-2 text-xs">Variable Output</p>
            </div>

            <div className="flex items-center mt-2">
              <Controller
                control={control}
                name={`formArray.${index}.output[${index}].isRelevant`}
                render={({ field }) => (
                  <input
                    {...field}
                    type="checkbox"
                    className="h-4 w-4 text-green-4 focus:ring-green-4 border-grayscale-6 rounded"
                  />
                )}
              />
              <p className="ml-2 text-xs">Relevant Output</p>
            </div>
          </div>

          {param.isRelevant && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-white">
                Operation
              </label>
              <Controller
                control={control}
                name={`formArray.${index}.output[${index}].operation`}
                render={({ field }) => (
                  <select
                    {...field}
                    className="p-3 block w-full border-grayscale-5 rounded-md bg-black-7 text-white"
                  >
                    <option value="">-- Select Operation --</option>
                    <option value="equals">Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                  </select>
                )}
              />
            </div>
          )}
        </div>
      ))
    ) : (
      <p className="text-sm text-grayscale-6">No output parameters</p>
    );

  return (
    <div className="w-full p-8 bg-black-6 rounded-lg shadow-lg text-white">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-start gap-8 w-full">
          <div className="w-full">
            <label className="block mb-2 text-center text-lg font-medium text-white">
              Upload Contract ABI JSON
            </label>

            {!fileName && !showInputs && (
              <div
                className="border-2 text-center flex items-center justify-center border-dashed border-grayscale-10 p-4 rounded-lg bg-black-7 h-36 w-auto hover:bg-black-6 cursor-pointer"
                onClick={handleEditClick}
              >
                <p className="text-sm text-white">
                  Click here to upload ABI file
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="file_input"
            />

            {fileName && (
              <div className="mt-4 flex bg-black-4 p-2 rounded-md mb-4 justify-between items-center">
                <span>{fileName}</span>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="text-green-5 hover:text-green-4 underline flex items-center"
                >
                  <FaEdit className="mr-2" />
                </button>
              </div>
            )}

            {abi && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    setValue(`formArray.${index}.showInputs`, !showInputs)
                  }
                  className="bg-green-4 hover:bg-green-5 text-white py-2 px-6 rounded-md"
                >
                  {showInputs ? "Hide Options" : "Show Options"}
                </button>
              </div>
            )}
          </div>

          {showInputs && abi && (
            <div className="flex flex-col gap-2 w-full">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contract Address
                </label>
                <Controller
                  control={control}
                  name={`formArray.${index}.contractAddress`}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="p-3 block w-full border-grayscale-5 rounded-md bg-black-7 text-white"
                      placeholder="Enter contract address"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Function
                </label>
                <select
                  value={selectedFunction}
                  onChange={handleFunctionSelection}
                  className="p-3 block w-full border-grayscale-5 rounded-md bg-black-7 text-white"
                >
                  <option value="">-- Select Function --</option>
                  {renderFunctionOptions()}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Input Parameters
                </label>
                {renderParams()}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Output Parameters
                </label>
                {renderOutputs()}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Test;
