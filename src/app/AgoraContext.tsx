import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

type AgoraContextType = {
  isConnected: boolean;
};

const AgoraContext = createContext<AgoraContextType>({
  isConnected: false,
});

export function useAgoraContext() {
  return useContext(AgoraContext);
}

const AgoraProvider = ({ children }: { children: React.ReactNode }) => {
  const { address: account } = useAccount();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!account);
  }, [account]);

  return (
    <AgoraContext.Provider
      value={{
        isConnected,
      }}
    >
      {children}
    </AgoraContext.Provider>
  );
};

export default AgoraProvider;
