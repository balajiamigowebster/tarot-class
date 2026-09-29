import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Provider } from 'react-redux'
import { store } from './store/store'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="372772469026-9en9lk8f4utf722j7t5jb770fq1f2lfn.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
