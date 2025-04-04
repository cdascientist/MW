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

    const handleGoogleButtonClick = () => {
        if (!googleAuthLoaded || !window.google || !window.google.accounts || !window.google.accounts.id) {
            console.error('Google Sign-In API not loaded yet');
            alert('Google Sign-In is still loading. Please try again in a moment.');
            return;
        }

        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: window.handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Create a hidden div for Google's button rendering (if needed)
        let hiddenButtonContainer = document.getElementById('hidden-google-button');
        if (!hiddenButtonContainer) {
            hiddenButtonContainer = document.createElement('div');
            hiddenButtonContainer.id = 'hidden-google-button';
            hiddenButtonContainer.style.position = 'absolute';
            hiddenButtonContainer.style.opacity = '0';
            hiddenButtonContainer.style.pointerEvents = 'none';
            hiddenButtonContainer.style.zIndex = '-1';
            document.body.appendChild(hiddenButtonContainer);
        }

        // First attempt: try to show the prompt directly
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('Prompt not displayed or skipped. Trying fallback method...');

                // Fallback: render the Google button and auto-click it
                window.google.accounts.id.renderButton(
                    hiddenButtonContainer,
                    { theme: 'filled_blue', size: 'large', type: 'standard' }
                );

                // Wait a tiny bit for the button to render, then click it
                setTimeout(() => {
                    const googleButton = hiddenButtonContainer.querySelector('div[role="button"]');
                    if (googleButton) {
                        googleButton.click();
                    } else {
                        console.error('Failed to find the rendered Google button');
                    }
                }, 100);
            }
        });
    };

    // Use DOM manipulation for panel and Google button
    useEffect(() => {
        // Check if we're on a mobile device
        const isMobile = window.innerWidth <= 768;

        // ====================================
        // PANEL STRUCTURE SETUP
        // ====================================
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999';

        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        // ====================================
        // DESKTOP STYLING
        // ====================================
        if (!isMobile) {
            // Panel header styling (Desktop)
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 45px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            // Main header styling (Desktop)
            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 55px;">Mountain West</h1></header>`;
            panel.appendChild(headerDiv);

            // Top-right action buttons (Desktop)
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            actionButtons.style.position = 'absolute';
            actionButtons.style.top = '20px';
            actionButtons.style.right = '20px';
            actionButtons.style.display = 'flex';
            actionButtons.style.gap = '15px';
            actionButtons.style.zIndex = '20';
            actionButtons.innerHTML = `
                <button id="logout-button" class="nav-button" style="font-size: 30px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 10px 20px; border-radius: 6px;">Logout</button>
                <button id="chat-button" class="nav-button chat-button" style="font-size: 30px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 10px 20px; border-radius: 6px;">Open Live Chat</button>
            `;
            panel.appendChild(actionButtons);

            // ====================================
            // DESKTOP CONTENT - LOGGED IN VIEW
            // ====================================
            if (isLoggedIn && userData) {
                // Create container for user profile
                const profileContainer = document.createElement('div');
                profileContainer.style.display = 'flex';
                profileContainer.style.flexDirection = 'column';
                profileContainer.style.alignItems = 'flex-start';
                profileContainer.style.padding = '30px';
                profileContainer.style.marginTop = '30px';

                // User profile photo
                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '15px';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #57b3c0;" />` :
                        '<div style="width: 80px; height: 80px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileContainer.appendChild(userPhotoDiv);

                // User name and email
                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.marginBottom = '30px';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 32px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 8px 0 0 0; font-size: 24px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileContainer.appendChild(userInfoDiv);

                panel.appendChild(profileContainer);

                // ===========================================
                // AFTER LOGIN CONTENT STARTS HERE (DESKTOP)
                // ===========================================
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '0 30px 30px 30px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';

                // Main content paragraphs - 35% larger on desktop
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; margin-bottom: 30px; color: #a7d3d8;">
                        You're now logged in to the Mountain West application. This secure area allows
                        you to access all features of our platform.
                    </p>
                    
                    <p style="font-size: 35px; color: #a7d3d8;">
                        The interface features advanced visualization capabilities
                        designed to maximize your productivity and workflow efficiency.
                    </p>
                `;
                panel.appendChild(contentContainer);
            }
            // ====================================
            // DESKTOP CONTENT - NOT LOGGED IN VIEW
            // ====================================
            else {
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '30px';
                contentContainer.style.marginTop = '30px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';

                contentContainer.innerHTML = `
                    <p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // Google sign-in button for not logged in (Desktop)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.position = 'absolute';
                googleButtonContainer.style.left = '20px';
                googleButtonContainer.style.top = '71%';
                googleButtonContainer.style.zIndex = '10';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 30px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 260px;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 24px; height: 24px;"/>
                        Sign in with Google
                    </button>
                `;
                panel.appendChild(googleButtonContainer);
            }

            // Back to Start button (Desktop)
            const homeButtonContainer = document.createElement('div');
            homeButtonContainer.style.position = 'absolute';
            homeButtonContainer.style.bottom = '30px';
            homeButtonContainer.style.left = '30px';
            homeButtonContainer.style.zIndex = '15';
            homeButtonContainer.innerHTML = `
                <button id="home-button" class="nav-button" style="width: 260px; font-size: 30px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 20px; border-radius: 6px;">Back to Start</button>
            `;
            panel.appendChild(homeButtonContainer);
        }
        // ====================================
        // MOBILE STYLING
        // ====================================
        else {
            // Panel header styling (Mobile)
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 24px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            // Main header styling (Mobile)
            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 28px;">Mountain West</h1></header>`;
            panel.appendChild(headerDiv);

            // Top-right action buttons (Mobile)
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            actionButtons.style.position = 'absolute';
            actionButtons.style.top = '10px';
            actionButtons.style.right = '10px';
            actionButtons.style.display = 'flex';
            actionButtons.style.flexDirection = 'column';
            actionButtons.style.gap = '8px';
            actionButtons.style.zIndex = '20';
            actionButtons.innerHTML = `
                <button id="logout-button" class="nav-button" style="font-size: 14px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 6px 12px; border-radius: 4px;">Logout</button>
                <button id="chat-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 6px 12px; border-radius: 4px;">Open Live Chat</button>
            `;
            panel.appendChild(actionButtons);

            // ====================================
            // MOBILE CONTENT - LOGGED IN VIEW
            // ====================================
            if (isLoggedIn && userData) {
                // Create container for user profile
                const profileContainer = document.createElement('div');
                profileContainer.style.display = 'flex';
                profileContainer.style.flexDirection = 'column';
                profileContainer.style.alignItems = 'flex-start';
                profileContainer.style.padding = '15px';
                profileContainer.style.marginTop = '15px';

                // User profile photo
                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '10px';
                userPhotoDiv.style.alignSelf = 'center';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #57b3c0;" />` :
                        '<div style="width: 60px; height: 60px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileContainer.appendChild(userPhotoDiv);

                // User name and email
                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.marginBottom = '20px';
                userInfoDiv.style.textAlign = 'center';
                userInfoDiv.style.width = '100%';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 18px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileContainer.appendChild(userInfoDiv);

                panel.appendChild(profileContainer);

                // ===========================================
                // AFTER LOGIN CONTENT STARTS HERE (MOBILE)
                // ===========================================
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '0 15px 15px 15px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';

                // Main content paragraphs
                contentContainer.innerHTML = `
                    <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        You're now logged in to the Mountain West application. This secure area allows
                        you to access all features of our platform.
                    </p>
                    
                    <p style="font-size: 16px; color: #a7d3d8;">
                        The interface features advanced visualization capabilities
                        designed to maximize your productivity and workflow efficiency.
                    </p>
                `;
                panel.appendChild(contentContainer);
            }
            // ====================================
            // MOBILE CONTENT - NOT LOGGED IN VIEW
            // ====================================
            else {
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '15px';
                contentContainer.style.marginTop = '15px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';

                contentContainer.innerHTML = `
                    <p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // Google sign-in button for not logged in (Mobile)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.position = 'absolute';
                googleButtonContainer.style.left = '50%';
                googleButtonContainer.style.transform = 'translateX(-50%)';
                googleButtonContainer.style.top = '65%';
                googleButtonContainer.style.zIndex = '10';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 8px 16px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: 180px;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                        Sign in with Google
                    </button>
                `;
                panel.appendChild(googleButtonContainer);
            }

            // Back to Start button (Mobile)
            const homeButtonContainer = document.createElement('div');
            homeButtonContainer.style.position = 'absolute';
            homeButtonContainer.style.bottom = '15px';
            homeButtonContainer.style.left = '50%';
            homeButtonContainer.style.transform = 'translateX(-50%)';
            homeButtonContainer.style.zIndex = '15';
            homeButtonContainer.innerHTML = `
                <button id="home-button" class="nav-button" style="width: 180px; font-size: 16px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 8px 16px; border-radius: 4px;">Back to Start</button>
            `;
            panel.appendChild(homeButtonContainer);
        }

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // ====================================
        // RESPONSIVE HANDLING
        // ====================================
        const handleResize = () => {
            // Remove the current panel
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            // Re-render with the new device detection
            setTimeout(() => {
                // Use DOM manipulation for panel and Google button (this calls the current useEffect again)
                const newIsMobile = window.innerWidth <= 768;
                if (newIsMobile !== isMobile) {
                    window.location.reload(); // Reload to apply the correct layout
                }
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        // ====================================
        // EVENT LISTENERS
        // ====================================
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

        const googleButton = document.getElementById('google-login-button');
        if (googleButton) {
            googleButton.addEventListener('click', handleGoogleButtonClick);
        }

        // ====================================
        // CLEANUP FUNCTION
        // ====================================
        return () => {
            window.removeEventListener('resize', handleResize);

            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            const hiddenContainer = document.getElementById('hidden-google-button');
            if (hiddenContainer) {
                document.body.removeChild(hiddenContainer);
            }
        };
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded]);

    // Return null as UI is created outside React's control
    return null;
}