import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css";
import Header from '../components/Header';

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);

    // Google Client ID - this should match what's in your App.jsx
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Check for existing login on mount
    useEffect(() => {
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

    // Load Google Sign-In API
    useEffect(() => {
        // Define the callback function for Google's authentication
        window.handleGoogleSignIn = (response) => {
            if (response && response.credential) {
                // Decode the JWT token
                const decodedToken = decodeJwtResponse(response.credential);

                // Set user data and login state
                setUserData(decodedToken);
                setIsLoggedIn(true);

                // Save to localStorage
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
            }
        };

        // Load the Google Identity Services script only once
        if (!googleAuthLoaded && !document.getElementById('google-signin-script')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.id = 'google-signin-script';
            script.async = true;
            script.onload = () => {
                setGoogleAuthLoaded(true);
                console.log('Google Sign-In script loaded');
            };
            document.head.appendChild(script);
        }

        // Clean up
        return () => {
            // Remove global callback if component unmounts
            delete window.handleGoogleSignIn;
        };
    }, [googleAuthLoaded]);

    const handleLogout = () => {
        // Revoke Google authentication if google is loaded
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }

        // Clear state and localStorage
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

    // Render and handle the Google Sign-In button
    const handleGoogleButtonClick = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            // Initialize Google Sign-In
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            // Display the One Tap UI
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('One Tap UI was not displayed or was skipped');
                    // Render the standard Sign-In button as fallback
                    window.google.accounts.id.renderButton(
                        document.getElementById('google-signin-container'),
                        {
                            theme: 'filled_blue',
                            size: 'large',
                            width: 280,
                            text: 'signin_with',
                            shape: 'rectangular'
                        }
                    );
                }
            });
        } else {
            console.error('Google Sign-In API not loaded yet');
            alert('Google Sign-In is still loading. Please try again in a moment.');
        }
    };

    // Use DOM manipulation for panel and Google button
    useEffect(() => {
        // Create the panel DOM structure
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999'; // Set high z-index but lower than Google's overlays

        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        const panelHeader = document.createElement('div');
        panelHeader.className = 'panel-header';
        panelHeader.innerHTML = '<h2 class="panel-title">Mountain West</h2>';
        panel.appendChild(panelHeader);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'header-in-panel';
        headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1>Mountain West</h1></header>`;
        panel.appendChild(headerDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'panel-content';

        // Build content based on login state
        if (isLoggedIn && userData) {
            contentDiv.innerHTML = `
                <h3 class="panel-section-title">Welcome, ${userData.name || 'User'}!</h3>
                
                <div class="user-profile">
                    ${userData.picture ? `<img src="${userData.picture}" alt="Profile" class="profile-picture" />` : ''}
                    <div class="user-info">
                        <p class="panel-text">Email: ${userData.email || 'Not available'}</p>
                    </div>
                </div>
                
                <p class="panel-text">
                    You're now logged in to the Mountain West application. This secure area allows
                    you to access all features of our platform.
                </p>
                
                <p class="panel-text">
                    The interface features advanced visualization capabilities
                    designed to maximize your productivity and workflow efficiency.
                </p>
                
                <div class="buttons-row">
                    <button id="logout-button" class="nav-button">Logout</button>
                    <button id="home-button" class="nav-button">Back to Home</button>
                    <button id="chat-button" class="nav-button chat-button">Open Live Chat</button>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <h3 class="panel-section-title">Login Required</h3>
                
                <p class="panel-text">
                    Welcome to the Mountain West application! Please sign in with your
                    Google account to access all features.
                </p>
                
                <div class="login-container">
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                        Sign in with Google
                    </button>
                    <div id="google-signin-container" style="margin-top: 15px;"></div>
                </div>
                
                <div class="buttons-row">
                    <button id="home-button" class="nav-button">Back to Home</button>
                </div>
            `;
        }

        panel.appendChild(contentDiv);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Attach event listeners
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => navigate('/'));
        }

        const chatButton = document.getElementById('chat-button');
        if (chatButton) {
            chatButton.addEventListener('click', () => navigate('/chat'));
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        // Attach event listener to our Google button
        const googleButton = document.getElementById('google-login-button');
        if (googleButton) {
            googleButton.addEventListener('click', handleGoogleButtonClick);
        }

        // Cleanup function
        return () => {
            // Remove the overlay
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        };
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded]);

    // Return null as UI is created outside React's control
    return null;
}