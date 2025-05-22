import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  SetStateAction,
  ReactNode,
  useEffect,
} from "react";
import { useAccount } from "wagmi";

type SelectedWalletContextType = {
  selectedWalletAddress?: `0x${string}`;
  isSelectedPrimaryAddress: boolean;
  setSelectedWalletAddress: Dispatch<SetStateAction<`0x${string}` | undefined>>;
};

const SelectedWalletContext = createContext<SelectedWalletContextType>({
  selectedWalletAddress: undefined,
  isSelectedPrimaryAddress: false,
  setSelectedWalletAddress: () => {},
});

export function useSelectedWallet() {
  return useContext(SelectedWalletContext);
}

export const SelectedWalletProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<
    `0x${string}` | undefined
  >(undefined);

  const { address } = useAccount();

  useEffect(() => {
    if (address && !selectedWalletAddress) {
      setSelectedWalletAddress(address);
    } else if (address && address !== selectedWalletAddress) {
      setSelectedWalletAddress(address);
    }
  }, [address]);

  return (
    <SelectedWalletContext.Provider
      value={{
        selectedWalletAddress,
        setSelectedWalletAddress,
        isSelectedPrimaryAddress:
          selectedWalletAddress === address || !selectedWalletAddress,
      }}
    >
      {children}
    </SelectedWalletContext.Provider>
  );
};

export default SelectedWalletProvider;
