import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { SettingsProvider } from './contexts/SettingsContext'
import App from './App'
import { checkAndRefreshToken } from './utils/axios'

// Check for token on app startup
checkAndRefreshToken();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <SettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SettingsProvider>
    </Provider>
  </StrictMode>,
)
