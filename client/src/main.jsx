import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/EnhancedNotificationContext";
import { Provider } from 'react-redux';
import store from './store';


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ProgressProvider>
              <App />
            </ProgressProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
);
