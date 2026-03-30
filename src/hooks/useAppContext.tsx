import { createContext, useContext } from "react";

type AppContextType = {
  setMetaDescription: (description: string) => void;
  setMetaKeywords: (keywords: string) => void;
  setCanonicalUrl: (url: string) => void;
};

export const AppContext = createContext<AppContextType>({
  setMetaDescription: () => {},
  setMetaKeywords: () => {},
  setCanonicalUrl: () => {},
});

export const useAppContext = () => {
  return useContext(AppContext);
};
