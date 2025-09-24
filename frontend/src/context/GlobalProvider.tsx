import { createContext, useContext, useState } from "react";

interface GlobalStateInterface {
  role: "user" | "admin" | null;
  setRole: React.Dispatch<React.SetStateAction<"user" | "admin" | null>>;
}
const GlobalContext = createContext<GlobalStateInterface | undefined>(undefined);

interface GlobalProviderInterface {
  children: React.ReactNode;
}

const GlobalProvider: React.FC<GlobalProviderInterface> = ({ children }) => {
  const [role, setRole] = useState<"user" | "admin" | null>(null);

  return (
    <GlobalContext.Provider
      value={{
        role,
        setRole,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const GlobalState = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("GlobalState must be used within a GlobalProvider");
  }
  return context;
};

export default GlobalProvider;
