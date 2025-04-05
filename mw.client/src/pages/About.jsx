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
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false); // State to track script load AND basic readiness

    // Google Client ID - this should match what's in your App.jsx
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Check if user is already logged in on component mount
    useEffect(() => {
        console.log("About.jsx: Checking initial login state.");
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');

        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                console.log("About.jsx: User was already logged in.", parsedUserData);
            } catch (error) {
                console.error('About.jsx: Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        } else {
            console.log("About.jsx: User was not logged in.");
        }
    }, []); // Run only once on mount


    // JWT token decoder
    const decodeJwtResponse = (token) => {
        // ... (decoder logic remains the same) ...
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

    // Set up Google Sign-In - Runs only ONCE on component mount
    useEffect(() => {
        console.log("About.jsx: Google Sign-In setup effect running.");

        // Define the callback function globally
        window.handleGoogleSignIn = (response) => {
            console.log("About.jsx: handleGoogleSignIn callback received:", response);
            if (response && response.credential) {
                const decodedToken = decodeJwtResponse(response.credential);
                console.log("About.jsx: Decoded JWT token:", decodedToken);
                // Use functional updates for state based on previous state if needed,
                // though direct set should be fine here after login.
                setUserData(decodedToken);
                setIsLoggedIn(true);
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
            } else {
                console.error('About.jsx: Google Sign-In failed or response missing credential.');
            }
        };

        // --- Load GSI Script ---
        if (!document.getElementById('google-signin-script')) {
            console.log('About.jsx: Google Sign-In script tag NOT found. Creating...');
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.id = 'google-signin-script';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('About.jsx: Google Sign-In script ONLOAD fired.');
                // **Crucial:** Set loaded state *after* onload fires.
                setGoogleAuthLoaded(true);
                console.log('About.jsx: setGoogleAuthLoaded(true) called inside ONLOAD.');
                // You can optionally check for window.google here, but the handler check is more important
                if (window.google?.accounts?.id) {
                    console.log('About.jsx: window.google.accounts.id IS available inside ONLOAD.');
                } else {
                    console.warn('About.jsx: window.google.accounts.id is NOT YET available right after ONLOAD.');
                }
            };
            script.onerror = () => {
                console.error('About.jsx: FATAL - Failed to load Google Sign-In script from Google.');
                // Consider setting an error state to inform the user
            };
            document.head.appendChild(script);
        } else {
            console.log('About.jsx: Google Sign-In script tag already exists.');
            // If the script tag exists, we *assume* it has loaded or will load.
            // Set the state to true optimistically. The button handler check remains the safety net.
            if (!googleAuthLoaded) {
                setGoogleAuthLoaded(true);
                console.log('About.jsx: setGoogleAuthLoaded(true) called because script tag already existed.');
            }
            // Check if the API is ready *now*
            if (window.google?.accounts?.id) {
                console.log('About.jsx: Script tag existed AND window.google.accounts.id IS available.');
            } else {
                console.warn('About.jsx: Script tag existed BUT window.google.accounts.id is NOT available yet.');
            }
        }

        // Clean up the global callback function
        return () => {
            console.log("About.jsx: Cleaning up Google Sign-In setup effect.");
            delete window.handleGoogleSignIn;
        };
    }, []); // <-- Empty array: Run only once on initial mount


    // Logout handler - memoized with useCallback
    const handleLogout = useCallback(() => {
        console.log("About.jsx: handleLogout called.");
        if (window.google?.accounts?.id) {
            console.log("About.jsx: Disabling Google Auto Select.");
            window.google.accounts.id.disableAutoSelect();
        } else {
            console.log("About.jsx: Google API not available during logout, skipping disableAutoSelect.");
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log('About.jsx: User logged out, state and localStorage cleared.');
    }, [setIsLoggedIn, setUserData]);


    // Google Sign-In style injector - no changes needed here
    const injectGoogleSignInStyles = () => {
        // ... (style injection logic remains the same) ...
        if (document.getElementById('google-signin-mobile-styles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'google-signin-mobile-styles';
        styleEl.innerHTML = `...`; // Keep your styles
        document.head.appendChild(styleEl);
    };


    // Google Sign-In button click handler - memoized with useCallback
    const handleGoogleButtonClick = useCallback(() => {
        console.log('About.jsx: handleGoogleButtonClick triggered.');

        // --- DETAILED CHECK ---
        const isLoadedState = googleAuthLoaded;
        const googleObjectExists = !!window.google;
        const accountsObjectExists = !!window.google?.accounts;
        const idObjectExists = !!window.google?.accounts?.id;

        console.log(`About.jsx: Checking GSI Status:
          googleAuthLoaded state: ${isLoadedState}
          window.google exists?: ${googleObjectExists}
          window.google.accounts exists?: ${accountsObjectExists}
          window.google.accounts.id exists?: ${idObjectExists}`);

        if (!isLoadedState || !idObjectExists) { // Simplified: We need the state AND the final 'id' object
            console.warn('About.jsx: Google Sign-In prerequisites not met. Aborting click.');
            if (!isLoadedState) {
                console.warn('Reason: googleAuthLoaded state is false.');
            }
            if (!googleObjectExists) {
                console.warn('Reason: window.google object not found.');
            } else if (!accountsObjectExists) {
                console.warn('Reason: window.google.accounts object not found.');
            } else if (!idObjectExists) {
                console.warn('Reason: window.google.accounts.id object not found.');
            }
            // Provide user feedback - replacing the console.warn from before
            alert('Google Sign-In is still initializing. Please wait a moment and try again.');
            return; // Stop execution
        }

        console.log("About.jsx: Google Sign-In prerequisites met. Proceeding...");

        // Inject custom styles for mobile Google popup positioning
        injectGoogleSignInStyles();

        try {
            console.log("About.jsx: Initializing google.accounts.id...");
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            console.log("About.jsx: Initialization complete. Calling prompt...");

            // Create backdrop and handle prompt (logic remains the same)
            const backdrop = document.createElement('div');
            // ... (backdrop creation) ...
            backdrop.id = 'google-signin-backdrop';
            backdrop.style.position = 'fixed'; /* ... rest of styles ... */
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            backdrop.style.zIndex = '99990';
            document.body.appendChild(backdrop);

            const removeBackdrop = () => { /* ... */ };

            window.google.accounts.id.prompt((notification) => {
                console.log("About.jsx: Google prompt notification received:", notification);
                // ... (handle notification cases and removeBackdrop) ...
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
                    console.warn("About.jsx: Prompt dismissed or not shown.");
                    removeBackdrop();
                } else {
                    console.log("About.jsx: Prompt displayed.");
                }
                setTimeout(removeBackdrop, 15000); // Timeout remains
            });

        } catch (error) {
            console.error('About.jsx: Error during Google Sign-In initialization or prompt:', error);
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }
            alert("An error occurred during Google Sign-In. Please try again."); // User feedback
        }

    }, [googleAuthLoaded, GOOGLE_CLIENT_ID]); // Dependencies remain: state + client ID


    // UI rendering with DOM manipulation - Main effect hook
    useEffect(() => {
        console.log("About.jsx: Main UI effect running. isLoggedIn:", isLoggedIn);
        // --- Start of UI Creation (DOM manipulation - NO CHANGES needed here) ---
        const isMobile = window.innerWidth <= 768;
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999';
        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        // ... (Keep all your existing DOM element creation logic for both mobile/desktop and logged-in/out states) ...
        // Example structure:
        if (!isMobile) {
            if (isLoggedIn && userData) {
                // Desktop Logged In UI
            } else {
                // Desktop Logged Out UI
            }
        } else {
            if (isLoggedIn && userData) {
                // Mobile Logged In UI
            } else {
                // Mobile Logged Out UI
            }
        }
        // ... (end of UI creation)

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // --- Start of Event Listener Attachment ---
        console.log("About.jsx: Attaching event listeners.");
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
                logoutButton.addEventListener('click', handleLogout); // Use memoized handler
            }
            const templateButton = document.getElementById('template-button');
            if (templateButton) {
                templateButton.addEventListener('click', () => navigate('/loggedintemplate'));
            }
            console.log("About.jsx: Attached logged-in listeners.");
        } else { // Not logged in
            const googleButton = document.getElementById('google-login-button');
            if (googleButton) {
                googleButton.addEventListener('click', handleGoogleButtonClick); // Use memoized handler
                console.log("About.jsx: Attached Google Sign-In listener.");
            } else {
                console.warn("About.jsx: Google login button not found in DOM for listener attachment.");
            }
        }

        // Resize handler
        let resizeTimeout;
        const handleResize = () => { /* ... */ };
        window.addEventListener('resize', handleResize);

        // --- Cleanup function ---
        return () => {
            console.log("About.jsx: Cleaning up main UI effect.");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            // Detach listeners manually if needed, though removing the elements usually suffices
            // Example: if (googleButton) googleButton.removeEventListener('click', handleGoogleButtonClick);

            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            // ... (remove other dynamically added elements like backdrop, hidden button, styles) ...
            const hiddenContainer = document.getElementById('hidden-google-button');
            if (hiddenContainer && document.body.contains(hiddenContainer)) document.body.removeChild(hiddenContainer);
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) document.body.removeChild(backdrop);
            const mobileStyles = document.getElementById('google-signin-mobile-styles');
            if (mobileStyles && document.head.contains(mobileStyles)) document.head.removeChild(mobileStyles);
        };
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded]); // Dependencies updated

    // Component returns null as UI is managed via DOM manipulation
    return null;
}