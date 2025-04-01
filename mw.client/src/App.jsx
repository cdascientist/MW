import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './pages/Home';
import About from './pages/About';
import LiveChat from './pages/LiveChat';
import './App.css';

function App() {
    // Replace with your actual Google Client ID from Google Cloud Console
    const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';

    return (
        <GoogleOAuthProvider clientId={"7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com"}>
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