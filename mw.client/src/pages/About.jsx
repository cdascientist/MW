/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 5 - Mobile Popup Z-Index and Display Fix Attempt)
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
        const styleId = 'google-signin-custom-styles';
        if (document.getElementById(styleId)) return;

        const styleEl = document.createElement('style');
        styleEl.id = styleId;

        styleEl.innerHTML = `
            /* --- Mobile Styles (< 769px) --- */
            @media (max-width: 768px) {
                /* Target Google's dialog containers for positioning */
                /* Using multiple selectors for robustness */
                div[id^='credential_picker_container'], /* Container by ID */
                iframe[src^="https://accounts.google.com/gsi/iframe/select"], /* Specific iframe */
                .S9gUrf-YoZ4jf, /* Common classes observed */
                .nsm7Bb-HzV7m-LgbsSe,
                .qwAkee.LCTIRd, /* Another potential container */
                .whsOnd.zHQkBf,
                .fxpqGc {
                    position: fixed !important;
                    top: 25% !important; /* Position in top quarter of screen */
                    left: 50% !important;
                    transform: translate(-50%, 0) !important;
                    max-width: 90vw !important;
                    width: 320px !important; /* Standard mobile width */
                    min-height: auto !important; /* Reset min-height for mobile */
                    /* *** MODIFIED Z-INDEX FOR MOBILE *** */
                    z-index: 11000 !important;
                }

                /* Styles for Google's overlay classes (may or may not be needed if backdrop is controlled programmatically) */
                 .Bgzgmd,
                 .VfPpkd-SJnn3d {
                     /* Ensure our backdrop is below the popup */
                     z-index: 10990 !important; /* Needs to be lower than popup z-index */
                     background-color: rgba(0,0,0,0.5) !important; /* Ensure dimming */
                     position: fixed !important;
                     top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
                     width: 100vw !important; height: 100vh !important;
                 }
            }

            /* --- Desktop Styles (> 768px) --- */
            @media (min-width: 769px) {
                /* Target Google's dialog containers for positioning, size, and z-index */
                 div[id^='credential_picker_container'], /* Container by ID */
                 iframe[src^="https://accounts.google.com/gsi/iframe/select"], /* Specific iframe */
                 .S9gUrf-YoZ4jf, /* Common classes observed */
                 .nsm7Bb-HzV7m-LgbsSe,
                 .qwAkee.LCTIRd,
                 .whsOnd.zHQkBf,
                 .fxpqGc {
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

                /* Ensure NO dimming/overlay on Desktop by targeting Google's overlay classes */
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
            let backdropElement = null;
            if (isMobile) {
                // Ensure no duplicate backdrop exists first
                const existingBackdrop = document.getElementById('google-signin-backdrop');
                if (!existingBackdrop) {
                    console.log("Creating backdrop for mobile.");
                    backdropElement = document.createElement('div');
                    backdropElement.id = 'google-signin-backdrop';
                    backdropElement.style.position = 'fixed'; backdropElement.style.top = '0'; backdropElement.style.left = '0';
                    backdropElement.style.right = '0'; backdropElement.style.bottom = '0';
                    backdropElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    // *** MODIFIED BACKDROP Z-INDEX FOR MOBILE ***
                    backdropElement.style.zIndex = '10990'; // Lower than mobile popup z-index (11000)
                    document.body.appendChild(backdropElement);
                } else {
                    console.log("Backdrop already exists for mobile.");
                    backdropElement = existingBackdrop; // Reference existing one for removal later
                }
            } else {
                console.log("Skipping backdrop creation for desktop.");
            }

            // Function to clean up UI artifacts (backdrop)
            const cleanupSignInUI = () => {
                isAttemptingLogin.current = false; // Reset attempt flag
                const backdropToRemove = document.getElementById('google-signin-backdrop');
                if (backdropToRemove && document.body.contains(backdropToRemove)) {
                    console.log("Removing backdrop.");
                    document.body.removeChild(backdropToRemove);
                }
            };

            // 4. Show prompt
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
                    console.log('Prompt not shown or dismissed. Reason:', notification.getNotDisplayedReason() || notification.getSkippedReason() || notification.getDismissedReason());
                    cleanupSignInUI(); // Clean up backdrop if it exists
                } else {
                    console.log('Google Sign-In prompt displayed.');
                    setTimeout(cleanupSignInUI, 15000); // Timeout ensures cleanup if prompt hangs
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

            // Remove backdrop if it exists
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) document.body.removeChild(backdrop);

            // Optionally remove injected styles (uncomment if needed)
            // const customStyles = document.getElementById('google-signin-custom-styles');
            // if(customStyles && document.head.contains(customStyles)){
            //    document.head.removeChild(customStyles);
            // }
        };
        // Dependencies for the main UI effect
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded, initiateGoogleSignInFlow, injectGoogleSignInStyles]);


    // Return null as UI is created via DOM manipulation
    return null;
}