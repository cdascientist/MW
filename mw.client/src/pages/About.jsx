/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 2 - Primary fixes applied)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css";

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false); // Tracks script load event

    // Google Client ID
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // Check initial login state
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

    // Set up Google Sign-In Script - Runs only ONCE on mount
    useEffect(() => {
        // Define the global callback function
        window.handleGoogleSignIn = (response) => {
            if (response && response.credential) {
                const decodedToken = decodeJwtResponse(response.credential);
                setUserData(decodedToken);
                setIsLoggedIn(true);
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
            } else {
                console.error('Google Sign-In failed or response missing credential.');
            }
        };

        // Load Google script if it doesn't exist
        if (!document.getElementById('google-signin-script')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.id = 'google-signin-script';
            script.async = true;
            script.defer = true; // Added defer
            script.onload = () => {
                setGoogleAuthLoaded(true); // Set state when script's onload fires
                console.log('Google Sign-In script loaded via onload.');
                // Check if API is ready *immediately* after onload (it might not be)
                if (!window.google?.accounts?.id) {
                    console.warn('Google GSI script loaded, but window.google.accounts.id not immediately available.');
                }
            };
            script.onerror = () => {
                console.error('Failed to load Google Sign-In script.');
            };
            document.head.appendChild(script);
        } else {
            // If script tag exists, assume it might be loaded or loading.
            // Check if the API object is ready now.
            if (window.google?.accounts?.id) {
                if (!googleAuthLoaded) { // Avoid redundant state updates
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already existed and API seems ready.');
                }
            } else {
                // Script exists but API not ready yet. Set loaded state optimistically.
                // The check in handleGoogleButtonClick will be the final gatekeeper.
                if (!googleAuthLoaded) {
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already existed, setting loaded state optimistically (API might still be initializing).');
                }
            }
        }

        // Cleanup global callback
        return () => {
            delete window.handleGoogleSignIn;
        };
    }, []); // <-- Empty dependency array ensures this runs only once


    // Logout handler - memoized
    const handleLogout = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log('User logged out.');
    }, [setIsLoggedIn, setUserData]); // Dependencies: functions that change state


    // Google Sign-In style injector - no changes needed
    const injectGoogleSignInStyles = () => {
        if (document.getElementById('google-signin-mobile-styles')) return;
        const styleEl = document.createElement('style');
        styleEl.id = 'google-signin-mobile-styles';
        // Keep your original CSS rules here
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
                    position: fixed !important; top: 25% !important; left: 50% !important;
                    transform: translate(-50%, 0) !important; max-width: 90vw !important;
                    width: 320px !important; z-index: 99999 !important;
                }
                /* Background overlay styling */
                .Bgzgmd, .VfPpkd-SJnn3d {
                    background-color: rgba(0,0,0,0.7) !important; position: fixed !important;
                    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
                    width: 100vw !important; height: 100vh !important; z-index: 99990 !important;
                }
            }
        `;
        document.head.appendChild(styleEl);
    };


    // Google Sign-In button click handler - memoized
    const handleGoogleButtonClick = useCallback(() => {
        // **Robust Check:** Verify the script state AND the actual API object readiness
        if (!googleAuthLoaded || !window.google?.accounts?.id) {
            // Use console.warn instead of alert for less disruption
            console.warn('Google Sign-In API not ready yet. Conditions:', {
                googleAuthLoaded,
                hasWindowGoogle: !!window.google,
                hasGoogleAccounts: !!window.google?.accounts,
                hasGoogleAccountsId: !!window.google?.accounts?.id
            });
            // Optionally, provide non-alert feedback (e.g., temporary message near button)
            // alert('Google Sign-In is still initializing. Please try again shortly.'); // Re-enable if you prefer alert
            return; // Stop if not ready
        }

        // Inject mobile styles
        injectGoogleSignInStyles();

        try {
            // Initialize Google Sign-In *just before* showing the prompt
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn, // Use the globally defined callback
                auto_select: false,
                cancel_on_tap_outside: true
            });

            // Create backdrop element
            const backdrop = document.createElement('div');
            backdrop.id = 'google-signin-backdrop';
            backdrop.style.position = 'fixed'; backdrop.style.top = '0'; backdrop.style.left = '0';
            backdrop.style.right = '0'; backdrop.style.bottom = '0';
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; backdrop.style.zIndex = '99990';
            document.body.appendChild(backdrop);

            // Function to remove backdrop
            const removeBackdrop = () => {
                if (backdrop && document.body.contains(backdrop)) {
                    document.body.removeChild(backdrop);
                }
            };

            // Attempt to show the credential picker prompt
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
                    console.log('Prompt dismissed, skipped, or not displayed. Reason:', notification.getNotDisplayedReason() || notification.getSkippedReason() || notification.getDismissedReason());
                    removeBackdrop();
                } else {
                    console.log('Google Sign-In prompt displayed.');
                }
                // Fallback timeout to remove backdrop
                setTimeout(removeBackdrop, 15000);
            });

            // Optional: Fallback using hidden button (usually not needed with prompt)
            // let hiddenButtonContainer = document.getElementById('hidden-google-button');
            // ... create if not exists ...
            // window.google.accounts.id.renderButton(...)
            // setTimeout(() => { hiddenButtonContainer.querySelector(...)?.click(); }, 100);


        } catch (error) {
            console.error('Error during Google Sign-In initialization or prompt:', error);
            // Clean up backdrop on error
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }
        }

    }, [googleAuthLoaded, GOOGLE_CLIENT_ID]); // Dependencies: state + constant


    // UI rendering with DOM manipulation - Main effect hook
    useEffect(() => {
        // Check mobile status
        const isMobile = window.innerWidth <= 768;

        // Create overlay and panel
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999';
        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        // --- Start of UI Creation (Keep your original DOM manipulation logic here) ---
        // This part should be exactly as it was in the original or first revised version
        // that displayed content correctly.
        if (!isMobile) {
            // DESKTOP VIEW
            const panelHeader = document.createElement('div'); /*...*/ panel.appendChild(panelHeader);
            const headerDiv = document.createElement('div'); /*...*/ panel.appendChild(headerDiv);
            if (isLoggedIn && userData) {
                // Desktop Logged In UI Elements (action buttons, profile, content, template button)
                const actionButtons = document.createElement('div'); /*...*/ panel.appendChild(actionButtons);
                const profileContainer = document.createElement('div'); /*...*/ panel.appendChild(profileContainer);
                const contentContainer = document.createElement('div'); /*...*/ panel.appendChild(contentContainer);
                const templateButtonContainer = document.createElement('div'); /*...*/ panel.appendChild(templateButtonContainer);
            } else {
                // Desktop Logged Out UI Elements (content, google button, home button)
                const contentContainer = document.createElement('div'); /*...*/ panel.appendChild(contentContainer);
                const googleButtonContainer = document.createElement('div'); /*...*/ panel.appendChild(googleButtonContainer);
                const homeButtonContainer = document.createElement('div'); /*...*/ panel.appendChild(homeButtonContainer);
            }
        } else {
            // MOBILE VIEW
            const panelHeader = document.createElement('div'); /*...*/ panel.appendChild(panelHeader);
            const headerDiv = document.createElement('div'); /*...*/ panel.appendChild(headerDiv);
            if (isLoggedIn && userData) {
                // Mobile Logged In UI Elements (action buttons, profile, content, template button)
                const actionButtons = document.createElement('div'); /*...*/ panel.appendChild(actionButtons);
                const profileSection = document.createElement('div'); /*...*/ panel.appendChild(profileSection);
                const contentArea = document.createElement('div'); /*...*/ panel.appendChild(contentArea);
                const templateButtonContainer = document.createElement('div'); /*...*/ panel.appendChild(templateButtonContainer);
            } else {
                // Mobile Logged Out UI Elements (content, button area with google/home buttons)
                const contentContainer = document.createElement('div'); /*...*/ panel.appendChild(contentContainer);
                const mobileButtonArea = document.createElement('div'); /*...*/ panel.appendChild(mobileButtonArea);
                // const googleButtonContainer = ... mobileButtonArea.appendChild(...)
                // const homeButtonContainer = ... mobileButtonArea.appendChild(...)
            }
        }
        // --- End of UI Creation ---

        // Add panel to overlay and overlay to body
        overlay.appendChild(panel);
        document.body.appendChild(overlay);


        // --- Start of Event Listener Attachment ---
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => navigate('/'));
        }

        if (isLoggedIn) {
            const chatButton = document.getElementById('chat-button');
            if (chatButton) chatButton.addEventListener('click', () => navigate('/chat'));
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) logoutButton.addEventListener('click', handleLogout); // Use memoized handler
            const templateButton = document.getElementById('template-button');
            if (templateButton) templateButton.addEventListener('click', () => navigate('/loggedintemplate'));
        } else { // Not logged in
            const googleButton = document.getElementById('google-login-button');
            if (googleButton) {
                googleButton.addEventListener('click', handleGoogleButtonClick); // Use memoized handler
            }
        }
        // --- End of Event Listener Attachment ---


        // Resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => { window.location.reload(); }, 250);
        };
        window.addEventListener('resize', handleResize);


        // --- Cleanup function ---
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            // Clean up other dynamically added elements
            const hiddenContainer = document.getElementById('hidden-google-button');
            if (hiddenContainer && document.body.contains(hiddenContainer)) document.body.removeChild(hiddenContainer);
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) document.body.removeChild(backdrop);
            const mobileStyles = document.getElementById('google-signin-mobile-styles');
            if (mobileStyles && document.head.contains(mobileStyles)) document.head.removeChild(mobileStyles);
        };
        // Dependencies for the main UI effect
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded]);

    // Return null as UI is created via DOM manipulation
    return null;
}