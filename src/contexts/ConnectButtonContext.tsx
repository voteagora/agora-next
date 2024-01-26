import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  SetStateAction,
} from "react";

type ConnectButtonContextType = {
  refetchDelegate: boolean | null;
  setRefetchDelegate: Dispatch<SetStateAction<boolean | null>>;
};

const ConnectButtonContext = createContext<ConnectButtonContextType>({
  refetchDelegate: null,
  setRefetchDelegate: (refetchDelegate) => {},
});

export function useConnectButtonContext() {
  return useContext(ConnectButtonContext);
}

const ConnectButtonProvider = ({ children }: { children: React.ReactNode }) => {
  const [refetchDelegate, setRefetchDelegate] = useState<boolean | null>(null);

  return (
    <ConnectButtonContext.Provider
      value={{
        refetchDelegate,
        setRefetchDelegate,
      }}
    >
      {children}
    </ConnectButtonContext.Provider>
  );
};

export default ConnectButtonProvider;
