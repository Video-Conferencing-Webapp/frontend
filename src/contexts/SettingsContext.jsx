import { createContext, useState, useMemo } from "react";
import PropTypes from "prop-types";

const initialState = {
  themeMode: "light",
  onChangeMode: () => {},
};

const SettingsContext = createContext(initialState);

function SettingsProvider({ children }) {
  const [themeMode, setThemeMode] = useState(initialState.themeMode);

  const onChangeMode = (event) => {
    setThemeMode(event.target.checked ? "dark" : "light");
  };

  const value = useMemo(
    () => ({
      themeMode,
      onChangeMode,
    }),
    [themeMode]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

SettingsProvider.propTypes = {
  children: PropTypes.node,
};

export { SettingsProvider, SettingsContext }; 