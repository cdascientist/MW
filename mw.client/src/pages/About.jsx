/**
 * About.jsx - Component for the About page with Google authentication
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css";

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);

    // Google Client ID - this should match what's in your App.jsx
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Check if user is already logged in
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

    // Set up Google Sign-In
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

    // JWT token decoder
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

    // Logout handler
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

    // Google Sign-In style injector for mobile
    const injectGoogleSignInStyles = () => {
        // Check if styles already exist to avoid duplicates
        if (document.getElementById('google-signin-mobile-styles')) return;

        // Create a style element
        const styleEl = document.createElement('style');
        styleEl.id = 'google-signin-mobile-styles';

        // CSS targeting Google's authentication elements
        styleEl.innerHTML = `
            /* Mobile Google Sign-In popup positioning */
            @media (max-width: 768px) {
                /* Target Google's dialog containers */
                .S9gUrf-YoZ4jf, 
                .nsm7Bb-HzV7m-LgbsSe,
                .whsOnd.zHQkBf, 
                .jlVej, 
                .L5Fo6c-jXK9Hd-YPqjbf,
                #credential_picker_container,
                #credential_picker_iframe,
                .g3VIld {
                    position: fixed !important;
                    top: 25% !important; /* Position in top quarter of screen */
                    left: 50% !important;
                    transform: translate(-50%, 0) !important;
                    max-width: 90vw !important;
                    width: 320px !important;
                    z-index: 99999 !important; /* Very high z-index */
                }
                
                /* Background overlay styling */
                .Bgzgmd,
                .VfPpkd-SJnn3d {
                    background-color: rgba(0,0,0,0.7) !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 99990 !important;
                }
            }
        `;

        // Add the styles to document head
        document.head.appendChild(styleEl);
    };

    // Google Sign-In handler
    const handleGoogleButtonClick = () => {
        if (!googleAuthLoaded || !window.google || !window.google.accounts || !window.google.accounts.id) {
            console.error('Google Sign-In API not loaded yet');
            alert('Google Sign-In is still loading. Please try again in a moment.');
            return;
        }

        // Inject custom styles for mobile Google popup positioning
        injectGoogleSignInStyles();

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

            // Different positioning for mobile vs desktop
            if (window.innerWidth <= 768) { // Mobile
                hiddenButtonContainer.style.position = 'fixed';
                hiddenButtonContainer.style.top = '25%';
                hiddenButtonContainer.style.left = '50%';
                hiddenButtonContainer.style.transform = 'translate(-50%, 0)';
                hiddenButtonContainer.style.width = '320px';
                hiddenButtonContainer.style.maxWidth = '90vw';
                hiddenButtonContainer.style.zIndex = '99999';
            } else { // Desktop
                hiddenButtonContainer.style.position = 'absolute';
                hiddenButtonContainer.style.opacity = '0';
                hiddenButtonContainer.style.pointerEvents = 'none';
                hiddenButtonContainer.style.zIndex = '-1';
            }

            document.body.appendChild(hiddenButtonContainer);
        }

        // Create a backdrop element for the popup
        const backdrop = document.createElement('div');
        backdrop.id = 'google-signin-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.right = '0';
        backdrop.style.bottom = '0';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        backdrop.style.zIndex = '99990';
        document.body.appendChild(backdrop);

        // First attempt: try to show the prompt directly
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('Prompt not displayed or skipped. Trying fallback method...');

                // Remove backdrop if prompt fails
                if (document.body.contains(backdrop)) {
                    document.body.removeChild(backdrop);
                }

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

            // Remove backdrop after a reasonable timeout if not removed already
            setTimeout(() => {
                if (document.body.contains(backdrop)) {
                    document.body.removeChild(backdrop);
                }
            }, 30000);
        });
    };

    // UI rendering with DOM manipulation
    useEffect(() => {
        // Check if we're on a mobile device
        const isMobile = window.innerWidth <= 768;

        // Create the overlay container
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999';

        // Create the flat panel
        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        if (!isMobile) {
            // DESKTOP VIEW

            // Panel header
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 45px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            // Main header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 55px;"></h1></header>`;
            panel.appendChild(headerDiv);

            if (isLoggedIn) {
                // Action buttons for logged-in users (Desktop)
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

                // User profile for logged-in users (Desktop)
                const profileContainer = document.createElement('div');
                profileContainer.style.display = 'flex';
                profileContainer.style.flexDirection = 'column';
                profileContainer.style.alignItems = 'flex-start';
                profileContainer.style.padding = '30px';
                profileContainer.style.marginTop = '100px';
                profileContainer.style.marginBottom = '20px';
                profileContainer.style.width = 'calc(100% - 60px)';
                profileContainer.style.position = 'relative';

                // User profile photo
                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '15px';
                userPhotoDiv.style.marginLeft = '35%';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #57b3c0;" />` :
                        '<div style="width: 80px; height: 80px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileContainer.appendChild(userPhotoDiv);

                // User info
                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.marginBottom = '30px';
                userInfoDiv.style.marginLeft = '35%';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 32px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 8px 0 0 0; font-size: 24px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileContainer.appendChild(userInfoDiv);
                panel.appendChild(profileContainer);

                // Content for logged-in users (Desktop)
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '0 30px 30px 30px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';
                contentContainer.style.maxHeight = 'calc(100% - 300px)';
                contentContainer.style.clear = 'both';
                contentContainer.style.marginTop = '50px';
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; margin-bottom: 30px; color: #a7d3d8;">
                        You're now logged in to the Mountain West application. This secure area allows
                        you to access all features of our platform.
                    </p>
                    <p style="font-size: 35px; color: #a7d3d8;">
                        The interface features advanced visualization capabilities
                        designed to maximize your productivity and workflow efficiency.
                    </p>
                    <p style="font-size: 35px; color: #a7d3d8; margin-top: 30px;">
                        Explore the various tools and resources available to you through the navigation menu.
                        If you need assistance, the Live Chat option is available.
                    </p>
                    <p style="font-size: 35px; color: #a7d3d8; margin-top: 30px;">
                        Your account provides personalized access to all Mountain West features and services.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // Template button at bottom of page - positioned absolutely to avoid overlap
                const templateButtonContainer = document.createElement('div');
                templateButtonContainer.style.position = 'absolute';
                templateButtonContainer.style.bottom = '30px';
                templateButtonContainer.style.left = '50%';
                templateButtonContainer.style.transform = 'translateX(-50%)';
                templateButtonContainer.style.zIndex = '10';
                templateButtonContainer.innerHTML = `
                    <button id="template-button" class="nav-button chat-button" style="font-size: 30px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 10px 20px; border-radius: 6px;">Open Template Page</button>
                `;
                panel.appendChild(templateButtonContainer);
            } else {
                // Content for NOT logged-in users (Desktop)
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '30px';
                contentContainer.style.marginTop = '30px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';
                contentContainer.style.maxHeight = 'calc(100% - 200px)';
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // ***** DESKTOP BUTTON POSITIONING - Adjust these values to reposition buttons *****
                // Google sign-in button for not logged in (Desktop)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.position = 'absolute';
                googleButtonContainer.style.left = '30%';
                googleButtonContainer.style.top = '75%';
                googleButtonContainer.style.zIndex = '10';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 30px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 260px;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 24px; height: 24px;"/>
                        Sign in with Google
                    </button>
                `;
                panel.appendChild(googleButtonContainer);

                // Back to Start button (Desktop) - positioned side by side with Google button
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.position = 'absolute';
                homeButtonContainer.style.left = '60%';  // Position to the right of Google button
                homeButtonContainer.style.top = '75%';   // Same height as Google button
                homeButtonContainer.style.zIndex = '15';
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: 260px; font-size: 30px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 20px; border-radius: 6px;">Back to Start</button>
                `;
                panel.appendChild(homeButtonContainer);
            }
        } else {
            // MOBILE VIEW

            // Panel header
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 24px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            // Main header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 28px;"></h1></header>`;
            panel.appendChild(headerDiv);

            if (isLoggedIn) {
                // Action buttons for logged-in users (Mobile)
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

                // User profile for logged-in users (Mobile)
                const profileSection = document.createElement('div');
                profileSection.style.width = '100%';
                profileSection.style.display = 'flex';
                profileSection.style.flexDirection = 'column';
                profileSection.style.alignItems = 'center';
                profileSection.style.marginTop = '80px';
                profileSection.style.marginBottom = '10px';
                profileSection.style.position = 'relative';
                profileSection.style.zIndex = '10';

                // User profile photo
                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '10px';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #57b3c0;" />` :
                        '<div style="width: 80px; height: 80px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileSection.appendChild(userPhotoDiv);

                // User info
                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.width = '100%';
                userInfoDiv.style.textAlign = 'center';
                userInfoDiv.style.marginBottom = '20px';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 20px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 8px 0 0 0; font-size: 16px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileSection.appendChild(userInfoDiv);
                panel.appendChild(profileSection);

                // Content for logged-in users (Mobile)
                const contentArea = document.createElement('div');
                contentArea.style.width = '100%';
                contentArea.style.display = 'flex';
                contentArea.style.flexDirection = 'column';
                contentArea.style.position = 'relative';
                contentArea.style.top = '120px';
                contentArea.style.paddingBottom = '140px'; // Add extra padding to make room for button
                contentArea.innerHTML = `
                    <p style="font-size: 16px; margin: 0 15px 15px 15px; color: #a7d3d8;">
                        You're now logged in to the Mountain West application. This secure area allows
                        you to access all features of our platform.
                    </p>
                    <p style="font-size: 16px; margin: 0 15px 15px 15px; color: #a7d3d8;">
                        The interface features advanced visualization capabilities
                        designed to maximize your productivity and workflow efficiency.
                    </p>
                    <p style="font-size: 16px; margin: 0 15px 15px 15px; color: #a7d3d8;">
                        Explore the various tools and resources available to you through the navigation menu.
                        If you need assistance, the Live Chat option is available.
                    </p>
                    <p style="font-size: 16px; margin: 0 15px 15px 15px; color: #a7d3d8;">
                        Your account provides personalized access to all Mountain West features and services.
                    </p>
                `;
                panel.appendChild(contentArea);

                // Template button for mobile - positioned at bottom with additional 45% lower position
                const templateButtonContainer = document.createElement('div');
                templateButtonContainer.style.position = 'absolute';
                templateButtonContainer.style.top = '750px'; // Lowered position (closer to bottom)
                templateButtonContainer.style.left = '0';
                templateButtonContainer.style.width = '100%';
                templateButtonContainer.style.display = 'flex';
                templateButtonContainer.style.justifyContent = 'center';
                templateButtonContainer.style.zIndex = '15';
                templateButtonContainer.innerHTML = `
    <button id="template-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 6px 12px; border-radius: 4px;">Open Template Page</button>
`;
                panel.appendChild(templateButtonContainer);

                // Adjust content area padding to accommodate the lower button position
                contentArea.style.paddingBottom = '100px'; // Increased padding at bottom
            } else {
                // Content for NOT logged-in users (Mobile)
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '15px';
                contentContainer.style.marginTop = '15px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.width = 'calc(100% - 30px)';
                contentContainer.style.paddingBottom = '150px';
                contentContainer.innerHTML = `
                    <p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // ***** MOBILE BUTTON POSITIONING - Adjust these values to reposition buttons *****
                // Google sign-in button for not logged in (Mobile)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.width = '100%';
                googleButtonContainer.style.display = 'flex';
                googleButtonContainer.style.justifyContent = 'center';
                googleButtonContainer.style.position = 'absolute';
                googleButtonContainer.style.left = '0';
                googleButtonContainer.style.top = '86%'; // Keep at 90% from the top
                googleButtonContainer.style.zIndex = '10';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 8px 16px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: 180px;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                        Sign in with Google
                    </button>
                `;
                panel.appendChild(googleButtonContainer);

                // Back to Start button (Mobile)
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.position = 'absolute';
                homeButtonContainer.style.left = '0';
                homeButtonContainer.style.top = '100%'; // Bring up to 100% (closer to Google button)
                homeButtonContainer.style.width = '100%';
                homeButtonContainer.style.display = 'flex';
                homeButtonContainer.style.justifyContent = 'center';
                homeButtonContainer.style.zIndex = '15';
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: 180px; font-size: 16px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 8px 16px; border-radius: 4px;">Back to Start</button>
                `;
                panel.appendChild(homeButtonContainer);
            }
        }

        // Add panel to overlay and overlay to body
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.location.reload();
            }, 250);
        };
        window.addEventListener('resize', handleResize);

        // Add event listeners
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => navigate('/'));
        }

        if (isLoggedIn) {
            const chatButton = document.getElementById('chat-button');
            if (chatButton) {
                chatButton.addEventListener('click', () => navigate('/chat'));
            }

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', handleLogout);
            }

            // Add event listener for the template button
            const templateButton = document.getElementById('template-button');
            if (templateButton) {
                templateButton.addEventListener('click', () => navigate('/loggedintemplate'));
            }
        }

        if (!isLoggedIn) {
            const googleButton = document.getElementById('google-login-button');
            if (googleButton) {
                googleButton.addEventListener('click', handleGoogleButtonClick);
            }
        }

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            const hiddenContainer = document.getElementById('hidden-google-button');
            if (hiddenContainer && document.body.contains(hiddenContainer)) {
                document.body.removeChild(hiddenContainer);
            }

            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }

            const mobileStyles = document.getElementById('google-signin-mobile-styles');
            if (mobileStyles && document.head.contains(mobileStyles)) {
                document.head.removeChild(mobileStyles);
            }
        };
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded]);

    // Return null as UI is created via DOM manipulation
    return null;
}