import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import "../style/AboutStyle.css";
import Header from '../components/Header';

// This would be a proper React component
export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Check for existing login
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');

        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        }
    }, []);

    const handleGoogleLoginSuccess = (credentialResponse) => {
        if (credentialResponse.credential) {
            const decodedToken = decodeJwtResponse(credentialResponse.credential);
            setUserData(decodedToken);
            setIsLoggedIn(true);
            localStorage.setItem('mw_isLoggedIn', 'true');
            localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
        }
    };

    const handleGoogleLoginError = () => {
        console.error('Google login failed');
    };

    const handleLogout = () => {
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
    };

    const decodeJwtResponse = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            return { name: 'User', email: '' };
        }
    };

    return (
        <div className="ui-overlay">
            <div className="flat-panel">
                <div className="panel-header">
                    <h2 className="panel-title">Mountain West</h2>
                </div>

                <div className="header-in-panel">
                    <Header />
                </div>

                <div className="panel-content">
                    {isLoggedIn && userData ? (
                        <>
                            <h3 className="panel-section-title">Welcome, {userData.name}!</h3>

                            <div className="user-profile">
                                {userData.picture && (
                                    <img src={userData.picture} alt="Profile" className="profile-picture" />
                                )}
                                <div className="user-info">
                                    <p className="panel-text">Email: {userData.email || 'Not available'}</p>
                                </div>
                            </div>

                            <p className="panel-text">
                                You're now logged in to the Mountain West application. This secure area allows
                                you to access all features of our platform.
                            </p>

                            <p className="panel-text">
                                The interface features advanced visualization capabilities
                                designed to maximize your productivity and workflow efficiency.
                            </p>

                            <div className="buttons-row">
                                <button className="nav-button" onClick={handleLogout}>
                                    Logout
                                </button>
                                <button className="nav-button" onClick={() => navigate('/')}>
                                    Back to Home
                                </button>
                                <button className="nav-button chat-button" onClick={() => navigate('/chat')}>
                                    Open Live Chat
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="panel-section-title">Login Required</h3>

                            <p className="panel-text">
                                Welcome to the Mountain West application! Please sign in with your
                                Google account to access all features.
                            </p>

                            <div className="login-container">
                                <GoogleLogin
                                    onSuccess={handleGoogleLoginSuccess}
                                    onError={handleGoogleLoginError}
                                    useOneTap
                                    width="300px"
                                    theme="filled_blue"
                                    text="signin_with"
                                    shape="rectangular"
                                    size="large"
                                    logo_alignment="center"
                                    type="standard"
                                />
                            </div>

                            <div className="buttons-row">
                                <button className="nav-button" onClick={() => navigate('/')}>
                                    Back to Home
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}