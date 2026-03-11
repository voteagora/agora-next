export type TransactionBuilderMode = "raw" | "explicit" | "simple";

export interface ParsedFunction {
  name: string;
  inputs: {
    name: string;
    type: string;
    components?: any[]; // For tuple types
  }[];
  stateMutability: string;
  signature: string; // e.g. "transfer(address,uint256)"
}

export interface ContractABI {
  address: string;
  abi: any[]; // JSON ABI
  functions: ParsedFunction[];
}

export interface MacroArgument {
  name: string;
  type: string; // "address", "uint256", "amount" (specialized), etc.
  label?: string; // Friendly label for UI
  description?: string;
  value?: string;
  isTarget?: boolean; // If true, this arg populates the transaction 'target'
  isValue?: boolean; // If true, this arg populates the transaction 'value'
}

export interface TransactionMacro {
  id: string;
  name: string;
  description: string;
  contractAddress?: string; // If fixed
  functionName?: string; // If fixed
  abi?: any[]; // If fixed
  funcName?: string; // Alias for internal logic
  args: MacroArgument[];
  // Function to generate the transaction data from args
  generate: (args: Record<string, string>) => {
    target: string;
    value: string;
    calldata: string;
    signature: string;
  };
}
