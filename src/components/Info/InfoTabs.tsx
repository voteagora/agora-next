import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  FC,
} from "react";

// Define the shape of the context value
interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

// Create a context to manage the active tab state
const TabsContext = createContext<TabsContextProps | undefined>(undefined);

// Tabs component props
interface TabsProps {
  children: ReactNode;
  defaultValue: string;
}

// TabsList component props
interface TabsListProps {
  children: ReactNode;
  className?: string;
}

// TabsTrigger component props
interface TabsTriggerProps {
  children: ReactNode;
  value: string;
}

// TabsContent component props
interface TabsContentProps {
  children: ReactNode;
  value: string;
}

export const Tabs: FC<TabsProps> = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: FC<TabsListProps> = ({ children, className }) => {
  return <div className={`flex ${className}`}>{children}</div>;
};

export const TabsTrigger: FC<TabsTriggerProps> = ({ children, value }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs provider");
  }

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={`px-4 py-2 text-xs font-semibold ${
        activeTab === value
          ? "bg-[#F3F3F3] text-black rounded-full"
          : "bg-white text-gray-af"
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent: FC<TabsContentProps> = ({ children, value }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs provider");
  }

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return <div className="mt-4">{children}</div>;
};
