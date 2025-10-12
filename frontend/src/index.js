import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './content/AuthContext'; 

const rootElement = document.getElementById('root');

// Sử dụng ReactDOM.createRoot để tạo root và render App component
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            {/* BỌC APP COMPONENT TRONG AUTHPROVIDER */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </React.StrictMode>
    );
}
