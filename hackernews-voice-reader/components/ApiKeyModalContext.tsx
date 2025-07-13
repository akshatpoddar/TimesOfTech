import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiKeyModalContextType {
  isVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
}

const ApiKeyModalContext = createContext<ApiKeyModalContextType | undefined>(undefined);

interface ApiKeyModalProviderProps {
  children: ReactNode;
}

export const ApiKeyModalProvider: React.FC<ApiKeyModalProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  return (
    <ApiKeyModalContext.Provider value={{ isVisible, showModal, hideModal }}>
      {children}
    </ApiKeyModalContext.Provider>
  );
};

export const useApiKeyModal = () => {
  const context = useContext(ApiKeyModalContext);
  if (context === undefined) {
    throw new Error('useApiKeyModal must be used within an ApiKeyModalProvider');
  }
  return context;
}; 