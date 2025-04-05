/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 4 - Desktop Popup Styling: No Dimming, High Z-Index, Larger Size)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css";

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const isAttemptingLogin = useRef(false);
    const retryTimeoutRef = useRef(null);

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
            isAttemptingLogin.current = false; // Reset attempt flag on callback
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
            script.defer = true;
            script.onload = () => {
                setGoogleAuthLoaded(true);
                console.log('Google Sign-In script loaded via onload.');
                if (!window.google?.accounts?.id) {
                    console.warn('Google GSI script loaded, but window.google.accounts.id not immediately available.');
                }
            };
            script.onerror = () => {
                console.error('Failed to load Google Sign-In script.');
            };
            document.head.appendChild(script);
        } else {
            if (window.google?.accounts?.id) {
                if (!googleAuthLoaded) {
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already existed and API seems ready.');
                }
            } else {
                if (!googleAuthLoaded) {
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already existed, setting loaded state optimistically (API might still be initializing).');
                }
            }
        }

        // Cleanup global callback and timeout ref
        return () => {
            delete window.handleGoogleSignIn;
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            // Clean up injected styles on component unmount
            const customStyles = document.getElementById('google-signin-custom-styles');
            if (customStyles && document.head.contains(customStyles)) {
                document.head.removeChild(customStyles);
            }
        };
    }, []); // <-- Empty dependency array ensures this runs only once


    // Logout handler - memoized
    const handleLogout = useCallback(() => {
        isAttemptingLogin.current = false;
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log('User logged out.');
    }, [setIsLoggedIn, setUserData]);


    // Google Sign-In style injector for BOTH mobile and desktop overrides
    const injectGoogleSignInStyles = useCallback(() => {
        // Use a consistent ID for the style element
        const styleId = 'google-signin-custom-styles';
        if (document.getElementById(styleId)) return; // Prevent duplicate styles

        const styleEl = document.createElement('style');
        styleEl.id = styleId;

        // Define CSS rules for mobile and desktop
        styleEl.innerHTML = `
            /* --- Mobile Styles (< 769px) --- */
            @media (max-width: 768px) {
                /* Target Google's dialog containers for positioning */
                .S9gUrf-YoZ4jf,
                .nsm7Bb-HzV7m-LgbsSe,
                .whsOnd.zHQkBf,
                .jlVej,
                .L5Fo6c-jXK9Hd-YPqjbf,
                #credential_picker_container,
                #credential_picker_iframe,
                iframe[src^="https://accounts.google.com/gsi/iframe/select"], /* More specific iframe selector */
                .g3VIld {
                    position: fixed !important;
                    top: 25% !important; /* Position in top quarter of screen */
                    left: 50% !important;
                    transform: translate(-50%, 0) !important;
                    max-width: 90vw !important;
                    width: 320px !important; /* Standard mobile width */
                    min-height: auto !important; /* Reset min-height for mobile */
                    z-index: 99999 !important; /* High z-index for mobile */
                }

                /* Mobile background overlay styling (created programmatically) */
                /* Styles for .Bgzgmd, .VfPpkd-SJnn3d (the overlay classes google uses) */
                 /* We control the backdrop programmatically for mobile, so explicit CSS might not be needed */
                 /* Or ensure our programmatically created one uses a specific ID/Class if we want to style it here */
            }

            /* --- Desktop Styles (> 768px) --- */
            @media (min-width: 769px) {
                /* Target Google's dialog containers for positioning, size, and z-index */
                 .S9gUrf-YoZ4jf,
                 .nsm7Bb-HzV7m-LgbsSe, /* This is often the main container */
                 iframe[src^="https://accounts.google.com/gsi/iframe/select"], /* Target the specific iframe */
                 #credential_picker_container /* Might be relevant */
                  {
                    position: fixed !important;
                    top: 50% !important; /* Center vertically */
                    left: 50% !important; /* Center horizontally */
                    transform: translate(-50%, -50%) !important; /* Precise centering */

                    /* Increased Size */
                    width: 750px !important; /* Significantly wider */
                    max-width: 85vw !important; /* Limit width based on viewport */
                    min-height: 550px !important; /* Significantly taller */
                    height: auto !important; /* Allow height to adjust */

                    /* Highest Z-Index */
                    z-index: 2147483647 !important; /* Max 32-bit signed integer z-index */

                    /* Optional: Add some styling */
                     box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                     border-radius: 8px; /* May or may not apply depending on Google's structure */
                }

                /* Ensure NO dimming/overlay on Desktop by targeting Google's overlay classes (if they exist) */
                 .Bgzgmd,
                 .VfPpkd-SJnn3d {
                     display: none !important; /* Hide Google's default overlay */
                     background-color: transparent !important; /* Ensure no background color */
                 }
            }
        `;
        document.head.appendChild(styleEl);
        console.log("Injected Google Sign-In custom styles.");
    }, []);


    // --- Function to perform the actual sign-in steps ---
    const initiateGoogleSignInFlow = useCallback(() => {
        console.log("Initiating Google Sign-In Flow...");
        isAttemptingLogin.current = true;

        // Determine if mobile based on window width
        const isMobile = window.innerWidth <= 768;

        try {
            // 1. Initialize
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            // 2. Inject styles (applies both mobile and desktop rules)
            injectGoogleSignInStyles();

            // 3. Create backdrop ONLY FOR MOBILE
            let backdropElement = null; // Keep track of the element if created
            if (isMobile) {
                console.log("Creating backdrop for mobile.");
                backdropElement = document.createElement('div');
                backdropElement.id = 'google-signin-backdrop'; // Use ID for potential removal
                backdropElement.style.position = 'fixed'; backdropElement.style.top = '0'; backdropElement.style.left = '0';
                backdropElement.style.right = '0'; backdropElement.style.bottom = '0';
                backdropElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                backdropElement.style.zIndex = '99990'; // Below mobile popup
                document.body.appendChild(backdropElement);
            } else {
                console.log("Skipping backdrop creation for desktop.");
            }

            // Function to clean up UI artifacts (backdrop)
            const cleanupSignInUI = () => {
                isAttemptingLogin.current = false; // Reset attempt flag
                const existingBackdrop = document.getElementById('google-signin-backdrop');
                if (existingBackdrop && document.body.contains(existingBackdrop)) {
                    console.log("Removing backdrop.");
                    document.body.removeChild(existingBackdrop);
                }
            };

            // 4. Show prompt
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
                    console.log('Prompt not shown or dismissed. Reason:', notification.getNotDisplayedReason() || notification.getSkippedReason() || notification.getDismissedReason());
                    cleanupSignInUI(); // Clean up backdrop if it exists
                } else {
                    console.log('Google Sign-In prompt displayed.');
                    // Set timeout to clean up backdrop just in case prompt hangs (mainly for mobile)
                    setTimeout(cleanupSignInUI, 15000);
                }
            });

        } catch (error) {
            console.error('Error during Google Sign-In flow execution:', error);
            isAttemptingLogin.current = false; // Reset flag on error
            const existingBackdrop = document.getElementById('google-signin-backdrop'); // Try removing backdrop on error too
            if (existingBackdrop && document.body.contains(existingBackdrop)) {
                document.body.removeChild(existingBackdrop);
            }
            alert("An error occurred during Google Sign-In. Please try again.");
        }
    }, [GOOGLE_CLIENT_ID, injectGoogleSignInStyles]);


    // Google Sign-In button click handler - WITH RETRY LOGIC
    const handleGoogleButtonClick = useCallback(() => {
        console.log("Google Sign-In button clicked.");

        if (isAttemptingLogin.current) {
            console.log("Login attempt already in progress. Ignoring click.");
            return;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        if (googleAuthLoaded && window.google?.accounts?.id) {
            console.log("GSI library ready on first check.");
            initiateGoogleSignInFlow();
        } else {
            console.warn("GSI library not ready on first check. Scheduling retry in 500ms.");
            isAttemptingLogin.current = true;

            retryTimeoutRef.current = setTimeout(() => {
                console.log("Executing GSI retry check...");
                if (googleAuthLoaded && window.google?.accounts?.id) {
                    console.log("GSI library ready on retry check.");
                    initiateGoogleSignInFlow();
                } else {
                    console.error("GSI library STILL not ready after 500ms retry.");
                    alert('Google Sign-In is still loading. Please try again in a moment.');
                    isAttemptingLogin.current = false;
                }
                retryTimeoutRef.current = null;
            }, 500);
        }

    }, [googleAuthLoaded, initiateGoogleSignInFlow]);


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

        // --- Start of UI Creation (Full DOM manipulation logic included) ---
        if (!isMobile) {
            // DESKTOP VIEW
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 45px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 55px;"></h1></header>`;
            panel.appendChild(headerDiv);

            if (isLoggedIn && userData) {
                // Desktop Logged In UI Elements
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.position = 'absolute'; actionButtons.style.top = '20px'; actionButtons.style.right = '20px';
                actionButtons.style.display = 'flex'; actionButtons.style.gap = '15px'; actionButtons.style.zIndex = '20';
                actionButtons.innerHTML = `
                    <button id="logout-button" class="nav-button" style="font-size: 30px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 10px 20px; border-radius: 6px;">Logout</button>
                    <button id="chat-button" class="nav-button chat-button" style="font-size: 30px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 10px 20px; border-radius: 6px;">Open Live Chat</button>
                `;
                panel.appendChild(actionButtons);

                const profileContainer = document.createElement('div');
                profileContainer.style.display = 'flex'; profileContainer.style.flexDirection = 'column'; profileContainer.style.alignItems = 'flex-start';
                profileContainer.style.padding = '30px'; profileContainer.style.marginTop = '100px'; profileContainer.style.marginBottom = '20px';
                profileContainer.style.width = 'calc(100% - 60px)'; profileContainer.style.position = 'relative';

                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '15px'; userPhotoDiv.style.marginLeft = '35%';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #57b3c0;" />` :
                        '<div style="width: 80px; height: 80px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileContainer.appendChild(userPhotoDiv);

                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.marginBottom = '30px'; userInfoDiv.style.marginLeft = '35%';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 32px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 8px 0 0 0; font-size: 24px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileContainer.appendChild(userInfoDiv);
                panel.appendChild(profileContainer);

                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '0 30px 30px 30px'; contentContainer.style.display = 'flex'; contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto'; contentContainer.style.maxHeight = 'calc(100% - 300px)';
                contentContainer.style.clear = 'both'; contentContainer.style.marginTop = '50px';
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

                const templateButtonContainer = document.createElement('div');
                templateButtonContainer.style.position = 'absolute'; templateButtonContainer.style.bottom = '30px';
                templateButtonContainer.style.left = '50%'; templateButtonContainer.style.transform = 'translateX(-50%)';
                templateButtonContainer.style.zIndex = '10';
                templateButtonContainer.innerHTML = `
                    <button id="template-button" class="nav-button chat-button" style="font-size: 30px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 10px 20px; border-radius: 6px;">Open Template Page</button>
                `;
                panel.appendChild(templateButtonContainer);

            } else { // Desktop Logged Out
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '30px'; contentContainer.style.marginTop = '30px';
                contentContainer.style.display = 'flex'; contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto'; contentContainer.style.maxHeight = 'calc(100% - 200px)';
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.position = 'absolute'; googleButtonContainer.style.left = '30%';
                googleButtonContainer.style.top = '75%'; googleButtonContainer.style.zIndex = '10';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 30px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; width: auto;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 24px; height: 24px;"/>
                        Sign in with Google
                    </button>
                `;
                panel.appendChild(googleButtonContainer);

                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.position = 'absolute'; homeButtonContainer.style.left = '60%';
                homeButtonContainer.style.top = '75%'; homeButtonContainer.style.zIndex = '15';
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: auto; font-size: 30px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 20px; border-radius: 6px;">Back to Start</button>
                `;
                panel.appendChild(homeButtonContainer);
            }

        } else { // isMobile
            // MOBILE VIEW
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 24px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 28px;"></h1></header>`;
            panel.appendChild(headerDiv);


            if (isLoggedIn && userData) { // Mobile Logged In
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.position = 'absolute'; actionButtons.style.top = '10px'; actionButtons.style.right = '10px';
                actionButtons.style.display = 'flex'; actionButtons.style.flexDirection = 'column'; actionButtons.style.gap = '8px';
                actionButtons.style.zIndex = '20';
                actionButtons.innerHTML = `
                    <button id="logout-button" class="nav-button" style="font-size: 14px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 6px 12px; border-radius: 4px;">Logout</button>
                    <button id="chat-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 6px 12px; border-radius: 4px;">Open Live Chat</button>
                `;
                panel.appendChild(actionButtons);

                const profileSection = document.createElement('div');
                profileSection.style.width = '100%'; profileSection.style.display = 'flex'; profileSection.style.flexDirection = 'column';
                profileSection.style.alignItems = 'center'; profileSection.style.marginTop = '80px';
                profileSection.style.marginBottom = '10px'; profileSection.style.position = 'relative'; profileSection.style.zIndex = '10';

                const userPhotoDiv = document.createElement('div');
                userPhotoDiv.style.marginBottom = '10px';
                userPhotoDiv.innerHTML = `
                    ${userData.picture ?
                        `<img src="${userData.picture}" alt="Profile" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #57b3c0;" />` :
                        '<div style="width: 70px; height: 70px; border-radius: 50%; background-color: #57b3c0; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px;">' + (userData.name ? userData.name.charAt(0) : 'U') + '</div>'
                    }
                `;
                profileSection.appendChild(userPhotoDiv);

                const userInfoDiv = document.createElement('div');
                userInfoDiv.style.width = '100%'; userInfoDiv.style.textAlign = 'center'; userInfoDiv.style.marginBottom = '20px';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 18px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileSection.appendChild(userInfoDiv);
                panel.appendChild(profileSection);

                const contentArea = document.createElement('div');
                contentArea.style.width = 'calc(100% - 30px)';
                contentArea.style.margin = '0 auto';
                contentArea.style.display = 'flex'; contentArea.style.flexDirection = 'column';
                contentArea.style.position = 'relative';
                contentArea.style.marginTop = '20px';
                contentArea.style.paddingBottom = '80px';
                contentArea.style.overflowY = 'auto';
                contentArea.style.maxHeight = 'calc(100vh - 350px)';
                contentArea.innerHTML = `
                    <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        You're now logged in to the Mountain West application. This secure area allows
                        you to access all features of our platform.
                    </p>
                    <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        The interface features advanced visualization capabilities
                        designed to maximize your productivity and workflow efficiency.
                    </p>
                     <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        Explore the various tools and resources available to you through the navigation menu.
                        If you need assistance, the Live Chat option is available.
                    </p>
                     <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                        Your account provides personalized access to all Mountain West features and services.
                    </p>
                `;
                panel.appendChild(contentArea);

                const templateButtonContainer = document.createElement('div');
                templateButtonContainer.style.position = 'absolute'; templateButtonContainer.style.bottom = '20px';
                templateButtonContainer.style.left = '0'; templateButtonContainer.style.width = '100%';
                templateButtonContainer.style.display = 'flex'; templateButtonContainer.style.justifyContent = 'center';
                templateButtonContainer.style.zIndex = '15';
                templateButtonContainer.innerHTML = `
                    <button id="template-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 8px 16px; border-radius: 4px;">Open Template Page</button>
                `;
                panel.appendChild(templateButtonContainer);

            } else { // Mobile Logged Out
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '15px'; contentContainer.style.marginTop = '15px';
                contentContainer.style.display = 'flex'; contentContainer.style.flexDirection = 'column';
                contentContainer.style.width = 'calc(100% - 30px)'; contentContainer.style.paddingBottom = '120px';
                contentContainer.style.overflowY = 'auto';
                contentContainer.style.maxHeight = 'calc(100vh - 250px)';
                contentContainer.innerHTML = `
                    <p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                const backToStartButtonTopMarginMobile = '50px';

                const mobileButtonArea = document.createElement('div');
                mobileButtonArea.style.position = 'absolute';
                mobileButtonArea.style.bottom = '120px';
                mobileButtonArea.style.left = '0';
                mobileButtonArea.style.width = '100%';
                mobileButtonArea.style.display = 'flex';
                mobileButtonArea.style.flexDirection = 'column';
                mobileButtonArea.style.alignItems = 'center';
                mobileButtonArea.style.gap = '15px';
                mobileButtonArea.style.zIndex = '10';

                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.innerHTML = `
                         <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 10px 18px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: auto;">
                             <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                             Sign in with Google
                         </button>
                     `;
                mobileButtonArea.appendChild(googleButtonContainer);

                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.marginTop = backToStartButtonTopMarginMobile;
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


        // --- Start of Event Listener Attachment ---
        const homeButton = document.getElementById('home-button');
        if (homeButton) homeButton.addEventListener('click', () => navigate('/'));
        if (isLoggedIn) {
            const chatButton = document.getElementById('chat-button');
            if (chatButton) chatButton.addEventListener('click', () => navigate('/chat'));
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) logoutButton.addEventListener('click', handleLogout);
            const templateButton = document.getElementById('template-button');
            if (templateButton) templateButton.addEventListener('click', () => navigate('/loggedintemplate'));
        } else {
            const googleButton = document.getElementById('google-login-button');
            if (googleButton) googleButton.addEventListener('click', handleGoogleButtonClick);
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

            // Remove main UI overlay
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            // Remove other dynamically added elements
            const hiddenContainer = document.getElementById('hidden-google-button');
            if (hiddenContainer && document.body.contains(hiddenContainer)) document.body.removeChild(hiddenContainer);

            // Remove backdrop if it exists (e.g., mobile)
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) document.body.removeChild(backdrop);

            // Remove injected styles *IF* they should be removed on component unmount
            // Note: Keeping them might be fine if this is the only place they're used.
            // const customStyles = document.getElementById('google-signin-custom-styles');
            // if(customStyles && document.head.contains(customStyles)){
            //    document.head.removeChild(customStyles);
            // }
        };
        // Dependencies for the main UI effect
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded, initiateGoogleSignInFlow, injectGoogleSignInStyles]); // Added initiateGoogleSignInFlow and injectGoogleSignInStyles


    // Return null as UI is created via DOM manipulation
    return null;
}