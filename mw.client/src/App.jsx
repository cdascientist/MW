import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';
import About from './pages/About';
import LiveChat from './pages/LiveChat';
import './App.css';

function App() {
    // Use your existing Google Client ID
    const googleClientId = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Add a console log to verify initialization
    console.log("Initializing Google OAuth with Client ID:", googleClientId);

    // Create a global error handler for Google OAuth
    window.handleGoogleAuthError = (error) => {
        console.error("Google OAuth Error:", error);
    };

    return (
        <GoogleOAuthProvider
            clientId={googleClientId}
            onScriptLoadError={(error) => {
                console.error("Failed to load Google OAuth script:", error);
                // Add visible error message to page
                const errorElement = document.createElement('div');
                errorElement.style.position = 'fixed';
                errorElement.style.top = '10px';
                errorElement.style.right = '10px';
                errorElement.style.padding = '10px';
                errorElement.style.background = 'rgba(255, 0, 0, 0.7)';
                errorElement.style.color = 'white';
                errorElement.style.borderRadius = '5px';
                errorElement.style.zIndex = '10000';
                errorElement.textContent = 'Failed to load Google Sign-In!';
                document.body.appendChild(errorElement);
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/chat" element={<LiveChat />} />
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;