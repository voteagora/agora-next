import {
  createContext,
  useContext,
  useState,
  useEffect,
  type Dispatch,
  SetStateAction,
} from "react";
import { useAccount } from "wagmi";

type AgoraContextType = {
  isConnected: boolean;
  isDelegatesFiltering: boolean;
  setIsDelegatesFiltering: Dispatch<SetStateAction<boolean>>;
};

const AgoraContext = createContext<AgoraContextType>({
  isConnected: false,
  isDelegatesFiltering: false,
  setIsDelegatesFiltering: (refetchDelegate) => {},
});

export function useAgoraContext() {
  return useContext(AgoraContext);
}

const AgoraProvider = ({ children }: { children: React.ReactNode }) => {
  const { address: account } = useAccount();
  const [isConnected, setIsConnected] = useState(false);
  const [isDelegatesFiltering, setIsDelegatesFiltering] = useState(false);

  useEffect(() => {
    setIsConnected(!!account);
  }, [account]);

  return (
    <AgoraContext.Provider
      value={{
        isConnected,
        isDelegatesFiltering,
        setIsDelegatesFiltering,
      }}
    >
      {children}
    </AgoraContext.Provider>
  );
};

export default AgoraProvider;
