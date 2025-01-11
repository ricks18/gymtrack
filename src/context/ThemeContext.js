import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isBarbieMode, setIsBarbieMode] = useState(false);

  const theme = {
    colors: isBarbieMode ? {
      primary: '#FF69B4', // Rosa Barbie
      background: '#FFC0CB', // Rosa claro
      card: '#FFB6C1', // Rosa mais claro
      text: '#FF1493', // Rosa escuro
      border: '#FFE4E1', // Rosa muito claro
      notification: '#FF69B4',
      secondary: '#FF82AB', // Rosa médio
      accent: '#FF1493', // Rosa forte
    } : {
      primary: '#007AFF',
      background: '#000000',
      card: '#1C1C1E',
      text: '#FFFFFF',
      border: '#2C2C2E',
      notification: '#FF453A',
      secondary: '#666666',
      accent: '#007AFF',
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isBarbieMode, setIsBarbieMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
