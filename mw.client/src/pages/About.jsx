/**
 * About.jsx - Component for the About page with Google authentication
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css";

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);

    // Google Client ID - this should match what's in your App.jsx
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Check if user is already logged in on component mount
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
    }, []); // Run only once on mount


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
            return { name: 'User', email: '' }; // Return default object on error
        }
    };

    // Set up Google Sign-In - Runs only ONCE on component mount
    useEffect(() => {
        // Define the callback function globally for Google's script
        window.handleGoogleSignIn = (response) => {
            if (response && response.credential) {
                const decodedToken = decodeJwtResponse(response.credential);
                setUserData(decodedToken);
                setIsLoggedIn(true);
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
                // Note: No need to manually navigate here unless required after login
            } else {
                console.error('Google Sign-In failed or response missing credential.');
            }
        };

        // Load the Google Identity Services script ONLY if it doesn't exist
        if (!document.getElementById('google-signin-script')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.id = 'google-signin-script';
            script.async = true;
            script.defer = true; // Defer execution until HTML parsing is complete
            script.onload = () => {
                setGoogleAuthLoaded(true); // Set state when script is loaded
                console.log('Google Sign-In script loaded and ready.');
                // Initialize here IF you needed auto-login or button rendering immediately
                // But initializing in the button click handler is often safer for prompt usage
            };
            script.onerror = () => {
                console.error('Failed to load Google Sign-In script.');
                // Optionally, set an error state here to inform the user
            };
            document.head.appendChild(script);
        } else {
            // If script tag exists, check if the API is already available
            if (window.google && window.google.accounts && window.google.accounts.id) {
                if (!googleAuthLoaded) { // Avoid unnecessary state update if already true
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already loaded.');
                }
            } else {
                // Script tag exists, but API not ready. It might still be loading/initializing.
                // The check in handleGoogleButtonClick will handle this.
                console.warn('Google Sign-In script tag found, but API not immediately ready.');
                // Optionally, set a timeout to re-check and setGoogleAuthLoaded(true) later
                // setTimeout(() => {
                //    if (window.google?.accounts?.id && !googleAuthLoaded) {
                //        setGoogleAuthLoaded(true);
                //    }
                // }, 500);
            }
        }

        // Clean up the global callback function when the component unmounts
        return () => {
            delete window.handleGoogleSignIn;
        };
    }, [googleAuthLoaded]); // <-- Empty array: Run only once on initial mount


    // Logout handler - memoized with useCallback
    const handleLogout = useCallback(() => {
        // Revoke Google authentication if google is loaded
        if (window.google && window.google.accounts && window.google.accounts.id) {
            // Prevents the One Tap prompt from showing automatically on next visit
            window.google.accounts.id.disableAutoSelect();
            // Optional: If you want to completely sign the user out of their Google session for your app
            // window.google.accounts.id.revoke(localStorage.getItem('user_google_id'), done => {
            //   console.log('Google session revoked.');
            // });
        }

        // Clear state and localStorage
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        // Optionally navigate after logout
        // navigate('/');
        console.log('User logged out.');
    }, [setIsLoggedIn, setUserData]); // Dependencies for useCallback


    // Google Sign-In style injector for mobile - defined outside render path
    const injectGoogleSignInStyles = () => {
        if (document.getElementById('google-signin-mobile-styles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'google-signin-mobile-styles';
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
        document.head.appendChild(styleEl);
    };


    // Google Sign-In button click handler - memoized with useCallback
    const handleGoogleButtonClick = useCallback(() => {
        // **Robust Check:** Verify the Google library is loaded AND initialized
        if (!googleAuthLoaded || !window.google || !window.google.accounts || !window.google.accounts.id) {
            console.warn('Google Sign-In API not loaded or ready yet. Please try again shortly.');
            // Alert removed - User can just click again if needed.
            // Optionally, provide visual feedback (e.g., disable button briefly, show spinner)
            return;
        }

        // Inject custom styles for mobile Google popup positioning
        injectGoogleSignInStyles();

        try {
            // Initialize Google Sign-In *just before* showing the prompt
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn, // Use the globally defined callback
                auto_select: false, // Set to false to always require user interaction on button click
                cancel_on_tap_outside: true
            });

            // Create a hidden div for potential button rendering fallback
            let hiddenButtonContainer = document.getElementById('hidden-google-button');
            if (!hiddenButtonContainer) {
                hiddenButtonContainer = document.createElement('div');
                hiddenButtonContainer.id = 'hidden-google-button';
                // Style it to be invisible but interactable if needed
                hiddenButtonContainer.style.position = 'absolute';
                hiddenButtonContainer.style.top = '-9999px';
                hiddenButtonContainer.style.left = '-9999px';
                hiddenButtonContainer.style.zIndex = '-1';
                document.body.appendChild(hiddenButtonContainer);
            }

            // Create a backdrop element for the popup (optional, for better UX)
            const backdrop = document.createElement('div');
            backdrop.id = 'google-signin-backdrop';
            backdrop.style.position = 'fixed';
            backdrop.style.top = '0';
            backdrop.style.left = '0';
            backdrop.style.right = '0';
            backdrop.style.bottom = '0';
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            backdrop.style.zIndex = '99990'; // Below popup, above content
            document.body.appendChild(backdrop);

            // Function to remove backdrop
            const removeBackdrop = () => {
                if (document.body.contains(backdrop)) {
                    document.body.removeChild(backdrop);
                }
            };

            // Attempt to show the credential picker prompt
            window.google.accounts.id.prompt((notification) => {
                // This callback provides information about the prompt UI status
                if (notification.isNotDisplayed()) {
                    console.log('Prompt not displayed, reason:', notification.getNotDisplayedReason());
                    removeBackdrop(); // Remove backdrop if prompt fails immediately
                    // Consider fallback to renderButton here if needed for specific reasons
                } else if (notification.isSkippedMoment()) {
                    console.log('Prompt skipped, reason:', notification.getSkippedReason());
                    removeBackdrop(); // Remove backdrop if skipped
                } else if (notification.isDismissedMoment()) {
                    console.log('Prompt dismissed by user, reason:', notification.getDismissedReason());
                    removeBackdrop(); // Remove backdrop if dismissed
                } else {
                    console.log('Google Sign-In prompt displayed successfully.');
                    // Backdrop will be removed by timeout or successful sign-in/dismissal handling
                }

                // Fallback if prompt fails (Optional - `prompt` is generally preferred)
                // if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                //     console.log('Prompt failed. Consider rendering button as fallback if necessary.');
                // window.google.accounts.id.renderButton(
                //     hiddenButtonContainer,
                //     { theme: 'filled_blue', size: 'large', type: 'standard' }
                // );
                // setTimeout(() => {
                //     const googleButton = hiddenButtonContainer.querySelector('div[role="button"]');
                //     if (googleButton) googleButton.click();
                //     else console.error('Fallback Google button not found.');
                // }, 100);
                // }

                // Set a timeout to remove the backdrop in case something goes wrong
                setTimeout(removeBackdrop, 15000); // 15 seconds timeout
            });

        } catch (error) {
            console.error('Error during Google Sign-In initialization or prompt:', error);
            // Clean up backdrop if an error occurs
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }
        }

    }, [googleAuthLoaded, GOOGLE_CLIENT_ID]); // Dependencies for useCallback


    // UI rendering with DOM manipulation - Main effect hook
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

        // --- Start of UI Creation (Similar to original, using DOM manipulation) ---
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

            if (isLoggedIn && userData) { // Check userData as well
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
                contentContainer.style.maxHeight = 'calc(100% - 300px)'; // Adjust as needed
                contentContainer.style.clear = 'both';
                contentContainer.style.marginTop = '50px'; // Adjust as needed
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

                // Template button at bottom of page
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

            } else { // Not logged in
                // Content for NOT logged-in users (Desktop)
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '30px';
                contentContainer.style.marginTop = '30px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';
                contentContainer.style.maxHeight = 'calc(100% - 200px)'; // Adjust as needed
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction... [rest of text] ...
                    </p>
                `;
                panel.appendChild(contentContainer);

                // Google sign-in button container (Desktop)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.position = 'absolute';
                googleButtonContainer.style.left = '30%';
                googleButtonContainer.style.top = '75%';
                googleButtonContainer.style.zIndex = '10';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 30px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; width: auto;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 24px; height: 24px;"/>
                        Sign in with Google
                    </button>
                `;
                panel.appendChild(googleButtonContainer);

                // Back to Start button container (Desktop)
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.position = 'absolute';
                homeButtonContainer.style.left = '60%';
                homeButtonContainer.style.top = '75%';
                homeButtonContainer.style.zIndex = '15';
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: auto; font-size: 30px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 20px; border-radius: 6px;">Back to Start</button>
                `;
                panel.appendChild(homeButtonContainer);
            }

        } else { // isMobile
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


            if (isLoggedIn && userData) { // Logged In Mobile
                // Action buttons (Mobile)
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

                // User profile (Mobile)
                const profileSection = document.createElement('div');
                profileSection.style.width = '100%';
                profileSection.style.display = 'flex';
                profileSection.style.flexDirection = 'column';
                profileSection.style.alignItems = 'center';
                profileSection.style.marginTop = '80px'; // Adjusted margin
                profileSection.style.marginBottom = '10px';
                profileSection.style.position = 'relative';
                profileSection.style.zIndex = '10';

                // User photo
                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '10px';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #57b3c0;" />` : // Slightly smaller
                        '<div style="width: 70px; height: 70px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileSection.appendChild(userPhotoDiv);

                // User info
                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.width = '100%';
                userInfoDiv.style.textAlign = 'center';
                userInfoDiv.style.marginBottom = '20px';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 18px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileSection.appendChild(userInfoDiv);
                panel.appendChild(profileSection);


                // Content (Mobile)
                const contentArea = document.createElement('div');
                contentArea.style.width = 'calc(100% - 30px)'; // Padding included
                contentArea.style.margin = '0 auto'; // Center content area
                contentArea.style.display = 'flex';
                contentArea.style.flexDirection = 'column';
                contentArea.style.position = 'relative'; // Relative positioning
                // contentArea.style.top = '0'; // Remove absolute top positioning
                contentArea.style.marginTop = '20px'; // Add margin top instead
                contentArea.style.paddingBottom = '80px'; // Space for button at bottom
                contentArea.style.overflowY = 'auto'; // Allow scrolling if content exceeds space
                contentArea.style.maxHeight = 'calc(100vh - 350px)'; // Example max height
                contentArea.innerHTML = `
                    <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        You're now logged in... [rest of text] ...
                    </p>
                    <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        The interface features... [rest of text] ...
                    </p>
                     <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        Explore the various tools... [rest of text] ...
                    </p>
                     <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        Your account provides... [rest of text] ...
                    </p>
                `;
                panel.appendChild(contentArea);


                // Template button (Mobile) - Positioned at the bottom
                const templateButtonContainer = document.createElement('div');
                templateButtonContainer.style.position = 'absolute';
                templateButtonContainer.style.bottom = '20px'; // Position near bottom
                templateButtonContainer.style.left = '0';
                templateButtonContainer.style.width = '100%';
                templateButtonContainer.style.display = 'flex';
                templateButtonContainer.style.justifyContent = 'center';
                templateButtonContainer.style.zIndex = '15';
                templateButtonContainer.innerHTML = `
                    <button id="template-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 8px 16px; border-radius: 4px;">Open Template Page</button>
                `;
                panel.appendChild(templateButtonContainer);


            } else { // Not Logged In Mobile
                // Content (Mobile - Not Logged In)
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '15px';
                contentContainer.style.marginTop = '15px';
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.width = 'calc(100% - 30px)';
                contentContainer.style.paddingBottom = '120px'; // Space for buttons
                contentContainer.style.overflowY = 'auto';
                contentContainer.style.maxHeight = 'calc(100vh - 250px)'; // Example max height
                contentContainer.innerHTML = `
                    <p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8;">
                        Mountain West provides compassionate care... [rest of text] ...
                    </p>
                `;
                panel.appendChild(contentContainer);

                // Buttons container (Mobile - Not Logged In)
                const mobileButtonArea = document.createElement('div');
                mobileButtonArea.style.position = 'absolute';
                mobileButtonArea.style.bottom = '20px'; // Position buttons near bottom
                mobileButtonArea.style.left = '0';
                mobileButtonArea.style.width = '100%';
                mobileButtonArea.style.display = 'flex';
                mobileButtonArea.style.flexDirection = 'column'; // Stack buttons vertically
                mobileButtonArea.style.alignItems = 'center';
                mobileButtonArea.style.gap = '15px'; // Space between buttons
                mobileButtonArea.style.zIndex = '10';

                // Google sign-in button (Mobile)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 10px 18px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: auto;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                        Sign in with Google
                    </button>
                `;
                mobileButtonArea.appendChild(googleButtonContainer);

                // Back to Start button (Mobile)
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: auto; font-size: 16px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 18px; border-radius: 4px;">Back to Start</button>
                `;
                mobileButtonArea.appendChild(homeButtonContainer);

                panel.appendChild(mobileButtonArea);
            }
        }
        // --- End of UI Creation ---

        // Add panel to overlay and overlay to body
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Resize handler (consider if reload is the best approach)
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Reloading on resize...');
                window.location.reload(); // Reloads the page on resize end
            }, 250);
        };
        window.addEventListener('resize', handleResize);

        // --- Start of Event Listener Attachment ---
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
                // Use the memoized handleLogout
                logoutButton.addEventListener('click', handleLogout);
            }

            const templateButton = document.getElementById('template-button');
            if (templateButton) {
                templateButton.addEventListener('click', () => navigate('/loggedintemplate'));
            }
        } else { // Not logged in
            const googleButton = document.getElementById('google-login-button');
            if (googleButton) {
                // Use the memoized handleGoogleButtonClick
                googleButton.addEventListener('click', handleGoogleButtonClick);
            }
        }
        // --- End of Event Listener Attachment ---

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            // Remove UI elements created by this effect
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
            console.log('About component cleanup ran.');
        };
        // Dependencies for the main UI effect:
        // Re-run if login status, user data changes, or navigation function changes.
        // Also include memoized handlers and googleAuthLoaded as they affect UI/listeners.
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded]);

    // This component uses direct DOM manipulation for its UI, so it returns null from React's perspective.
    return null;
}