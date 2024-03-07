import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  SetStateAction,
} from "react";

type RefetchDelegate = {
  address: string;
  prevVotingPowerDelegatee?: string;
};

type ConnectButtonContextType = {
  refetchDelegate: RefetchDelegate | null;
  setRefetchDelegate: Dispatch<SetStateAction<RefetchDelegate | null>>;
};

const ConnectButtonContext = createContext<ConnectButtonContextType>({
  refetchDelegate: null,
  setRefetchDelegate: (refetchDelegate) => {},
});

export function useConnectButtonContext() {
  return useContext(ConnectButtonContext);
}

const ConnectButtonProvider = ({ children }: { children: React.ReactNode }) => {
  const [refetchDelegate, setRefetchDelegate] =
    useState<RefetchDelegate | null>(null);

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
