import { toast } from "react-toastify";

export const parseAbi = (abi) => {
  try {
    return JSON.parse(abi);
  } catch (error) {
    toast.error("Invalid ABI. Please provide a valid JSON ABI.");
    return null;
  }
};

export const getFunctionParamsAndOutputs = (abi, functionName) => {
  const parsedAbi = parseAbi(abi);
  if (!parsedAbi) return { params: [], outputs: [] };

  const selectedFunctions = parsedAbi.filter(
    (func) => func.name === functionName && func.stateMutability === "view"
  );

  if (selectedFunctions.length === 0) return { params: [], outputs: [] };

  const selectedFunction = selectedFunctions[0];

  const params = selectedFunction.inputs
    ? selectedFunction.inputs.map((param, index) => ({
        name: param.name || `Input ${index + 1}`,
        isVariable: false,
        value: "",
      }))
    : [];

  const outputs = selectedFunction.outputs
    ? selectedFunction.outputs.map((param, index) => ({
        index,
        name: param.name || `Output ${index + 1}`,
        type: param.type,
        isVariable: false,
        value: "",
        isRelevant: false,
        operation: "equals",
      }))
    : [];

  return { params, outputs };
};
