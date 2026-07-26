import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UIContext = createContext(null);

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => JSON.parse(localStorage.getItem('sidebarOpen')) || false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <UIContext.Provider value={{ sidebarOpen, setSidebarOpen, theme, setTheme }}>
      {children}
    </UIContext.Provider>
  );
};

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};