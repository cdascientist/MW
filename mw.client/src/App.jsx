import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Page Imports
import Home from './pages/Home';
import About from './pages/About';
import LiveChat from './pages/LiveChat';
import LoggedInTemplate from './pages/LoggedInTemplate'; // <--- IMPORT LoggedInTemplate
import Analysis_Home from './pages/Analysis/Analysis_Home';

// Styling
import './App.css';

function App() {
    // Use your existing Google Client ID
    const googleClientId = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Add a console log to verify initialization
    console.log("Initializing Google OAuth with Client ID:", googleClientId);

    // Create a global error handler for Google OAuth (optional, but good practice)
    window.handleGoogleAuthError = (error) => {
        console.error("Google OAuth Error:", error);
        // You could display a user-facing error message here as well
    };

    return (
        // Wrap with GoogleOAuthProvider for authentication context
        <GoogleOAuthProvider
            clientId={googleClientId}
            onScriptLoadError={(error) => {
                console.error("Failed to load Google OAuth script:", error);
                // Add visible error message to page if script fails to load
                const errorElement = document.createElement('div');
                errorElement.style.position = 'fixed';
                errorElement.style.top = '10px';
                errorElement.style.right = '10px';
                errorElement.style.padding = '10px';
                errorElement.style.background = 'rgba(255, 0, 0, 0.7)';
                errorElement.style.color = 'white';
                errorElement.style.borderRadius = '5px';
                errorElement.style.zIndex = '10000'; // High z-index
                errorElement.textContent = 'Failed to load Google Sign-In!';
                // Ensure body exists before appending
                if (document.body) {
                    document.body.appendChild(errorElement);
                } else {
                    window.addEventListener('DOMContentLoaded', () => document.body.appendChild(errorElement));
                }
            }}
        >
            {/* Set up the router */}
            <BrowserRouter>
                {/* Define the application routes */}
                <Routes>
                    {/* Existing Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/chat" element={<LiveChat />} />

                    {/* --- ADDED ROUTE for LoggedInTemplate --- */}
                    <Route path="/loggedintemplate" element={<LoggedInTemplate />} />
                    {/* --- ADDED ROUTE for Analysis_Home --- */}   
                    <Route path="/analysis/home" element={<Analysis_Home />} />
                   
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;