import { ethers } from "ethers";

export const decodeCalldata = (
  calldata: `0x${string}`,
  functionSignature: string
) => {
  if (!calldata) {
    return { functionName: "unknown", functionArgs: [] as string[] };
  }

  return decodeArgsWithSignature(
    functionSignature,
    trimFunctionSelector(ethers.getBytes(calldata))
  );
};

function decodeArgsWithSignature(signature: string, calldata: Uint8Array) {
  const functionFragment = ethers.FunctionFragment.from(signature);

  const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
    functionFragment.inputs,
    calldata
  );

  return {
    functionName: functionFragment.name,
    functionArgs: functionFragment.inputs.map((type, index) =>
      decoded[index].toString()
    ),
  };
}

function trimFunctionSelector(bytes: Uint8Array) {
  return bytes.slice(4);
}
