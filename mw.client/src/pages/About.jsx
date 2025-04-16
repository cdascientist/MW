/**
 * About.jsx - Component for the About page with Google authentication
 * (Refactored - Fixes applied for rendering issues)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css"; // <--- ADD THIS LINE

export default function About() {
    // ====================================
    // 1. COMPONENT SETUP & STATE INITIALIZATION
    // ====================================
    const navigate = useNavigate();

    // **Initialize state directly from localStorage**
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const loggedIn = localStorage.getItem('mw_isLoggedIn') === 'true';
        // Also check if data exists and is parsable, otherwise treat as logged out
        const storedData = localStorage.getItem('mw_userData');
        if (loggedIn && storedData) {
            try {
                JSON.parse(storedData); // Try parsing
                return true;
            } catch (e) {
                console.error('About.jsx: Initial parse error:', e);
                localStorage.clear(); // Clear invalid state
                return false;
            }
        }
        return false;
    });

    const [userData, setUserData] = useState(() => {
        if (localStorage.getItem('mw_isLoggedIn') === 'true') {
            const storedData = localStorage.getItem('mw_userData');
            try {
                return storedData ? JSON.parse(storedData) : null;
            } catch (e) {
                // Error handled by isLoggedIn initializer, return null
                return null;
            }
        }
        return null;
    });

    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const isAttemptingLogin = useRef(false);
    const retryTimeoutRef = useRef(null);
    const overlayRef = useRef(null); // Ref for the overlay created by this component

    // Constants
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";
    const OVERLAY_CLASS_NAME = 'about-ui-overlay'; // Specific class for this overlay
    const MOBILE_SIGNIN_AREA_ID = 'about-mobile-signin-area'; // Specific ID for mobile area

    // --- Text Content (Specific to About) ---
    const loggedOutText = "Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.";
    const loggedInParagraph1 = "You're logged in to the Mountain West application. This secure area allows you to access platform features.";
    const loggedInParagraph2 = "From here, you can navigate to the user dashboard or other available sections.";

    // ====================================
    // 2. AUTHENTICATION & GSI LOGIC
    // ====================================

    // JWT decoder (same as before)
    const decodeJwtResponse = (token) => {
        try {
            const base64Url = token.split('.')[1]; const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) { console.error('JWT Error:', e); return null; }
    };

    // Google Sign-In Script Setup & Initialization (same as before)
    useEffect(() => {
        console.log("About.jsx: GSI Initialization useEffect running.");
        window.handleGoogleSignIn = (response) => {
            console.log("About.jsx: handleGoogleSignIn callback triggered.");
            if (response?.credential) {
                const decoded = decodeJwtResponse(response.credential);
                if (decoded) {
                    setUserData(decoded); // Update state
                    setIsLoggedIn(true); // Update state
                    localStorage.setItem('mw_isLoggedIn', 'true');
                    localStorage.setItem('mw_userData', JSON.stringify(decoded));
                    console.log("About.jsx: GSI Sign-In Successful.");
                } else {
                    console.error("About.jsx: GSI Decode Failed");
                    // Clear state if decode fails after successful Google sign-in attempt
                    setIsLoggedIn(false);
                    setUserData(null);
                    localStorage.clear();
                }
            } else {
                console.warn('About.jsx: GSI Sign-In Cancelled or Failed in Google UI.');
            }
            isAttemptingLogin.current = false;
        };

        const initializeGoogle = () => {
            if (window.google?.accounts?.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID, callback: window.handleGoogleSignIn,
                        auto_select: false, cancel_on_tap_outside: true, context: 'signin'
                    });
                    if (!googleAuthLoaded) {
                        console.log('About.jsx: GSI Initialized.');
                        setGoogleAuthLoaded(true);
                    }
                } catch (error) { console.error('About.jsx: Error during GSI initialization:', error); }
            } else { console.error('About.jsx: GSI init failed: google.accounts.id missing.'); }
        };

        // Script loading logic (remains the same)
        if (!document.getElementById('google-signin-script')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client'; script.id = 'google-signin-script';
            script.async = true; script.defer = true;
            script.onload = () => { console.log('About.jsx: GSI Script loaded.'); initializeGoogle(); };
            script.onerror = () => console.error('About.jsx: GSI script load failed.');
            document.head.appendChild(script);
        } else if (window.google?.accounts?.id && !googleAuthLoaded) {
            console.log('About.jsx: GSI Script exists, initializing.');
            initializeGoogle();
        } else if (googleAuthLoaded) {
            console.log('About.jsx: GSI already initialized.');
        }

        return () => {
            console.log("About.jsx: GSI useEffect cleanup.");
            delete window.handleGoogleSignIn;
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            document.querySelectorAll('[id^="credential_picker_container"]').forEach(el => el.parentNode?.removeChild(el));
            document.querySelectorAll('.g_id_signin').forEach(el => el.parentNode?.removeChild(el));
        };
    }, [googleAuthLoaded]); // Depends only on googleAuthLoaded

    // Logout handler (same as before)
    const handleLogout = useCallback(() => {
        console.log("About.jsx: handleLogout called.");
        window.google?.accounts?.id.disableAutoSelect();
        setUserData(null);
        setIsLoggedIn(false); // Update state
        localStorage.clear();
        console.log('About.jsx: Logged out.');
        isAttemptingLogin.current = false;
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    }, []);

    // Handle Mobile Google Sign-In Button Click (same as before)
    const handleGoogleButtonClick = useCallback(() => {
        console.log("About.jsx: Mobile Google button clicked.");
        if (isAttemptingLogin.current) {
            console.log("About.jsx: Already attempting login.");
            return;
        }
        if (!googleAuthLoaded || !window.google?.accounts?.id) {
            console.warn("About.jsx: GSI not ready for mobile prompt. Retrying...");
            isAttemptingLogin.current = true;
            retryTimeoutRef.current = setTimeout(() => {
                isAttemptingLogin.current = false;
                if (googleAuthLoaded && window.google?.accounts?.id) {
                    console.log("About.jsx: Retrying mobile prompt...");
                    handleGoogleButtonClick();
                } else {
                    alert('Google Sign-In failed to load. Please refresh.');
                }
            }, 700);
            return;
        }
        isAttemptingLogin.current = true;
        try {
            console.log("About.jsx: Calling google.accounts.id.prompt()...");
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) console.warn(`About.jsx: GSI prompt not displayed: ${notification.getNotDisplayedReason()}`);
                else if (notification.isSkippedMoment()) console.warn(`About.jsx: GSI prompt skipped: ${notification.getSkippedReason()}`);
                else if (notification.isDismissedMoment()) console.log(`About.jsx: GSI prompt dismissed: ${notification.getDismissedReason()}`);
                else console.log("About.jsx: GSI prompt displayed or moment recognized.");
                // Reset flag ONLY if prompt fails immediately or is dismissed without user action
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
                    isAttemptingLogin.current = false;
                }
                // isAttemptingLogin is reset in handleGoogleSignIn upon success/failure/cancel
            });
        } catch (e) {
            console.error("About.jsx: Error calling GSI prompt:", e);
            isAttemptingLogin.current = false; // Reset on catch
            alert("Error initiating Google Sign-In.");
        }
    }, [googleAuthLoaded]);

    // ====================================
    // 3. STYLING CONFIGURATION (Animations Removed)
    // ====================================
    const getStyles = useCallback(() => { // useCallback might be slightly better if styles were expensive
        const isMobile = window.innerWidth <= 768;

        // --- Define spacing & positioning values ---
        const panelPaddingTop = isMobile ? '100px' : '130px'; // Adjusted for profile/button space
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';

        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';

        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';

        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';

        // Content top position needs to be below profile/buttons
        const contentTopMargin = isMobile ? '80px' : '100px'; // Example: Adjust based on actual height of profile/buttons

        const standardButtonStyle = {
            fontSize: buttonFontSize, padding: isMobile ? '5px 10px' : '8px 15px',
            borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap',
            width: 'fit-content', pointerEvents: 'auto',
            transition: 'transform 0.2s ease, background-color 0.2s ease', // Keep hover/active transitions
            display: 'inline-block'
        };

        const desktopGsiHostStyle = {
            width: isMobile ? '0' : '280px', // Use desktop button width from old config
            position: 'relative', minHeight: isMobile ? '0' : '40px',
            display: isMobile ? 'none' : 'block'
        };

        return {
            overlay: {
                className: `ui-overlay ${OVERLAY_CLASS_NAME}`,
                style: {
                    zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    pointerEvents: 'none', // Overlay non-interactive
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: isMobile ? '10px' : '50px', boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel about-panel',
                style: {
                    position: 'relative', width: desktopPanelWidth, maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight, backgroundColor: 'rgba(13, 20, 24, 0.9)',
                    borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    paddingTop: panelPaddingTop, paddingLeft: panelPaddingSides,
                    paddingRight: panelPaddingSides, paddingBottom: panelPaddingBottom,
                    color: 'white', pointerEvents: 'auto', overflowY: 'auto', // Panel interactive, allow scroll
                    boxSizing: 'border-box',
                    // opacity: 1, // Default visible - REMOVED explicit opacity 0
                    WebkitOverflowScrolling: 'touch'
                }
            },
            profileContainer: { // Only shown when logged in
                style: {
                    position: 'absolute', top: profileTop, left: profileLeft,
                    display: 'flex', alignItems: 'center', gap: '15px',
                    zIndex: 10,
                    visibility: isLoggedIn ? 'visible' : 'hidden', // Control visibility directly
                    // opacity: 1, transform: 'none', // Default visible - REMOVED animation props
                }
            },
            buttonStackContainer: { // Container for top-right buttons or desktop GSI
                style: {
                    position: 'absolute', top: buttonStackTop, right: buttonStackRight,
                    display: 'flex', flexDirection: 'column', gap: buttonStackGap,
                    zIndex: 100, alignItems: 'flex-end',
                    pointerEvents: 'auto', // Allow clicks within this stack
                    // opacity: 1, transform: 'none', // Default visible - REMOVED animation props
                }
            },
            contentContainer: {
                className: 'content-container',
                style: {
                    width: '100%',
                    marginTop: contentTopMargin, // Adjust this based on profile/button height
                    position: 'relative', zIndex: 5,
                    // opacity: 1, transform: 'none', // Default visible - REMOVED animation props
                }
            },
            // Sub-element styles (unchanged from previous refactor)
            profilePhoto: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0 } },
            profilePhotoPlaceholder: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0 } },
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left' } },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500' } },
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e' } },
            logoutButton: { className: 'nav-button logout-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)' } },
            dashboardButton: { className: 'nav-button dashboard-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)' } },
            desktopGsiHost: { id: 'google-button-host-desktop', style: desktopGsiHostStyle },
            contentHeading: { style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold' } },
            contentText: { style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6' } },
            loggedOutTitle: { style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', textAlign: 'center' } },
        };
    }, [isLoggedIn]); // Re-calculate styles if login state changes (for profile visibility)

    // ====================================
    // 4. UI RENDERING EFFECT (Animations Removed)
    // ====================================
    useEffect(() => {
        console.log(`About.jsx: UI Render/Effect Start. isLoggedIn: ${isLoggedIn}`);

        // Prevent duplicate UI creation if effect runs unexpectedly
        if (document.querySelector(`.${OVERLAY_CLASS_NAME}`)) {
            console.log("About.jsx: Overlay already exists, skipping creation.");
            // It might be prudent to remove the existing one and recreate if state changed significantly
            // Or, update the existing elements instead of full recreate (more complex)
            return;
        }
        // Also clear the ref if we find an overlay but the ref is not set (e.g., after hot-reload)
        if (!overlayRef.current && document.querySelector(`.${OVERLAY_CLASS_NAME}`)) {
            console.warn("About.jsx: Found existing overlay without ref. Potential stale element.");
            // Attempt cleanup of potential stale elements before proceeding
            document.querySelector(`.${OVERLAY_CLASS_NAME}`)?.remove();
            document.getElementById(MOBILE_SIGNIN_AREA_ID)?.remove();
        }


        const styles = getStyles();
        const isMobile = window.innerWidth <= 768;
        let panel; // Declare panel outside try block for potential use in cleanup if needed

        try {
            // --- Create Overlay and Panel ---
            console.log("About.jsx: Creating Overlay and Panel elements.");
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay; // Store ref immediately

            panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'about-panel';
            Object.assign(panel.style, styles.panel.style);
            overlay.appendChild(panel); // Append panel to overlay

            // --- Create Top-Right Button Stack Container ---
            const buttonStackContainer = document.createElement('div');
            buttonStackContainer.id = 'about-button-stack';
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);
            panel.appendChild(buttonStackContainer);

            // --- Create Top-Left Profile Container ---
            const profileContainer = document.createElement('div');
            profileContainer.id = 'about-profile-container';
            Object.assign(profileContainer.style, styles.profileContainer.style);
            // Visibility is handled by the style object directly based on isLoggedIn state
            panel.appendChild(profileContainer);

            // --- Create Flowed Content Area ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'about-content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);
            panel.appendChild(contentContainer);


            // ================= POPULATE BASED ON STATE =================
            if (isLoggedIn && userData) {
                // ****** LOGGED IN STATE ******
                console.log("About.jsx: Rendering Logged In State Content.");

                // Populate Profile Container
                const profilePhotoEl = document.createElement(userData.picture ? 'img' : 'div');
                if (userData.picture) {
                    profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile";
                    Object.assign(profilePhotoEl.style, styles.profilePhoto.style);
                } else {
                    profilePhotoEl.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
                    Object.assign(profilePhotoEl.style, styles.profilePhotoPlaceholder.style);
                }
                profileContainer.appendChild(profilePhotoEl);

                const userInfoDiv = document.createElement('div');
                Object.assign(userInfoDiv.style, styles.userInfo.style);
                const userNameEl = document.createElement('h3');
                Object.assign(userNameEl.style, styles.userName.style);
                userNameEl.textContent = `${userData.name || 'User'}`;
                const userEmailEl = document.createElement('p');
                Object.assign(userEmailEl.style, styles.userEmail.style);
                userEmailEl.textContent = userData.email || 'No email provided';
                userInfoDiv.appendChild(userNameEl); userInfoDiv.appendChild(userEmailEl);
                profileContainer.appendChild(userInfoDiv);

                // Populate Button Stack (Logout/Dashboard)
                const logoutButton = document.createElement('button');
                logoutButton.id = 'logout-button'; logoutButton.className = styles.logoutButton.className;
                Object.assign(logoutButton.style, styles.logoutButton.style);
                logoutButton.textContent = 'Logout'; logoutButton.onclick = handleLogout;
                buttonStackContainer.appendChild(logoutButton);

                const dashboardButton = document.createElement('button');
                dashboardButton.id = 'dashboard-button'; dashboardButton.className = styles.dashboardButton.className;
                Object.assign(dashboardButton.style, styles.dashboardButton.style);
                dashboardButton.textContent = 'Dashboard'; dashboardButton.onclick = () => navigate('/loggedintemplate');
                buttonStackContainer.appendChild(dashboardButton);

                // Populate Content Container
                const loggedInHeading = document.createElement('h2');
                Object.assign(loggedInHeading.style, styles.contentHeading.style);
                loggedInHeading.textContent = "Welcome Back";
                contentContainer.appendChild(loggedInHeading);

                const loggedInText1 = document.createElement('p');
                Object.assign(loggedInText1.style, styles.contentText.style);
                loggedInText1.textContent = loggedInParagraph1;
                contentContainer.appendChild(loggedInText1);

                const loggedInText2 = document.createElement('p');
                Object.assign(loggedInText2.style, styles.contentText.style);
                loggedInText2.textContent = loggedInParagraph2;
                contentContainer.appendChild(loggedInText2);


            } else {
                // ****** LOGGED OUT STATE ******
                console.log("About.jsx: Rendering Logged Out State Content.");
                // Profile container is already hidden via its style in getStyles

                // Populate Content Container
                const loggedOutHeading = document.createElement('h2');
                Object.assign(loggedOutHeading.style, styles.loggedOutTitle.style);
                loggedOutHeading.textContent = "About Mountain West";
                contentContainer.appendChild(loggedOutHeading);

                const loggedOutP = document.createElement('p');
                Object.assign(loggedOutP.style, styles.contentText.style);
                loggedOutP.textContent = loggedOutText;
                contentContainer.appendChild(loggedOutP);

                // Handle Buttons for Logged Out State
                if (!isMobile) {
                    // Desktop: Add GSI render host to the top-right stack
                    console.log("About.jsx: Creating desktop GSI button host.");
                    const gsiHost = document.createElement('div');
                    gsiHost.id = styles.desktopGsiHost.id; // 'google-button-host-desktop'
                    Object.assign(gsiHost.style, styles.desktopGsiHost.style);
                    buttonStackContainer.appendChild(gsiHost); // Add to top-right

                    // Attempt to render the GSI button
                    const renderDesktopButton = () => {
                        if (!overlayRef.current || !document.getElementById(styles.desktopGsiHost.id)) {
                            console.log("About.jsx: Aborting desktop GSI render (unmounted or host removed).");
                            return; // Check if component still mounted and host exists
                        }
                        if (googleAuthLoaded && window.google?.accounts?.id) {
                            const host = document.getElementById(styles.desktopGsiHost.id);
                            // Check host exists AGAIN, could be removed between checks
                            if (host && !host.hasChildNodes()) {
                                console.log("About.jsx: Rendering desktop GSI button...");
                                try {
                                    window.google.accounts.id.renderButton(host, { type: 'standard', theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', logo_alignment: 'left', width: 280 });
                                    console.log("About.jsx: Desktop GSI button render initiated.");
                                } catch (e) { console.error("About.jsx: Desktop GSI render error:", e); if (host) host.innerHTML = 'GSI Render Failed'; }
                            } else if (host && host.hasChildNodes()) {
                                console.log("About.jsx: Desktop GSI button host already populated.");
                            }
                        } else {
                            // GSI not loaded yet, show placeholder and retry
                            const host = document.getElementById(styles.desktopGsiHost.id);
                            if (host && !host.hasChildNodes()) {
                                console.log("About.jsx: GSI not ready for desktop button, setting placeholder and retry timer.");
                                // Basic placeholder style, adapt as needed
                                host.innerHTML = `<button style='width: 280px; padding:10px; border:1px solid #ccc; border-radius:4px; background:#eee; color:#777; text-align:center; font-size: 14px;' disabled>Loading Sign-In...</button>`;
                                setTimeout(renderDesktopButton, 500); // Retry rendering
                            }
                        }
                    };
                    // Use setTimeout to ensure the host element is definitely in the DOM before trying to render
                    setTimeout(renderDesktopButton, 50);

                } else {
                    // Mobile: Create the dedicated button area at the top
                    console.log("About.jsx: Creating mobile signin area (Top).");
                    // Clean up any previous instance first
                    document.getElementById(MOBILE_SIGNIN_AREA_ID)?.remove();

                    const mobileButtonArea = document.createElement('div');
                    mobileButtonArea.id = MOBILE_SIGNIN_AREA_ID;
                    Object.assign(mobileButtonArea.style, {
                        position: 'fixed', top: '10px', // Top offset
                        left: '0', width: '100%', height: '60px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '10px',
                        zIndex: '9995', padding: '5px 0',
                        backgroundColor: 'transparent', // Background
                        pointerEvents: 'auto', boxSizing: 'border-box',
                    });

                    const mobileGoogleButton = document.createElement('button');
                    mobileGoogleButton.id = 'google-login-button-mobile'; mobileGoogleButton.type = 'button';
                    Object.assign(mobileGoogleButton.style, {
                        backgroundColor: '#ffffff', color: '#1f78d1', width: '240px', padding: '10px 18px',
                        border: '1px solid #dadce0', borderRadius: '4px', fontSize: '16px', fontWeight: '500',
                        fontFamily: "'Roboto', arial, sans-serif", cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        pointerEvents: 'auto',
                        boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
                    });
                    mobileGoogleButton.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:18px;height:18px;"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg> Sign in with Google`;
                    mobileGoogleButton.addEventListener('click', handleGoogleButtonClick);
                    mobileButtonArea.appendChild(mobileGoogleButton);

                    // Append mobile area to #root (or body if #root not found)
                    const rootEl = document.getElementById('root') || document.body;
                    // Check again it wasn't added somehow between cleanup and here
                    if (!rootEl.querySelector(`#${MOBILE_SIGNIN_AREA_ID}`)) {
                        rootEl.appendChild(mobileButtonArea);
                        console.log("About.jsx: Mobile signin area appended.");
                    } else {
                        console.log("About.jsx: Mobile signin area already exists, skipping append.");
                    }
                }
            }

            // --- APPEND Overlay TO #root ---
            const rootElement = document.getElementById('root');
            if (rootElement) {
                // Final check before appending overlay
                if (!rootElement.contains(overlay)) {
                    rootElement.appendChild(overlay);
                    console.log("About.jsx: Overlay successfully appended to #root.");
                } else {
                    console.log("About.jsx: Overlay already in #root, skipping append.");
                }
            } else {
                console.error("About.jsx: #root element not found! Cannot append overlay.");
                // Fallback? Append to body? Might cause issues.
                // document.body.appendChild(overlay);
            }

        } catch (error) {
            console.error("About.jsx: Error during UI element creation or appending:", error);
            // Attempt cleanup if an error occurred mid-creation
            if (overlayRef.current && overlayRef.current.parentNode) {
                try { overlayRef.current.remove(); } catch (e) { }
                overlayRef.current = null;
            }
            document.getElementById(MOBILE_SIGNIN_AREA_ID)?.remove(); // Also try removing mobile area
        }

        // ====================================
        // 5. EVENT HANDLING & CLEANUP
        // ====================================
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("About.jsx: Triggering reload due to resize.");
                window.location.reload(); // Still using reload on resize
            }, 250);
        };
        window.addEventListener('resize', handleResize);

        // --- Cleanup Function ---
        return () => {
            console.log("About.jsx: Cleanup running.");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            // --- Specific Cleanup for About.jsx ---
            // Remove the overlay created by THIS component using its ref primarily
            const overlayToRemove = overlayRef.current;
            if (overlayToRemove && overlayToRemove.parentNode) {
                try {
                    overlayToRemove.parentNode.removeChild(overlayToRemove);
                    console.log("About.jsx cleanup: Removed overlay via ref.");
                } catch (e) {
                    console.warn("About.jsx cleanup: Error removing overlay via ref", e);
                }
            } else {
                // Fallback if ref is lost or wasn't set correctly
                const fallbackOverlay = document.querySelector(`.${OVERLAY_CLASS_NAME}`);
                if (fallbackOverlay && fallbackOverlay.parentNode) {
                    try {
                        fallbackOverlay.parentNode.removeChild(fallbackOverlay);
                        console.log("About.jsx cleanup: Removed overlay via fallback selector.");
                    } catch (e) {
                        console.warn("About.jsx cleanup: Error removing overlay via fallback", e);
                    }
                } else {
                    console.log("About.jsx cleanup: Overlay not found for removal via ref or selector.");
                }
            }
            overlayRef.current = null; // Clear ref

            // Remove the mobile sign-in area by ID
            const mobileArea = document.getElementById(MOBILE_SIGNIN_AREA_ID);
            if (mobileArea && mobileArea.parentNode) {
                try {
                    mobileArea.parentNode.removeChild(mobileArea);
                    console.log("About.jsx cleanup: Mobile area removed.");
                } catch (e) {
                    console.warn("About.jsx cleanup: Error removing mobile area", e);
                }
            } else {
                console.log("About.jsx cleanup: Mobile area not found for removal.");
            }
        };
        // Rerun effect if login state changes (to redraw UI), or GSI load status (for button rendering)
        // Also include navigate, handleLogout, handleGoogleButtonClick as they are used inside
        // getStyles is included because it's recalculated based on isLoggedIn
    }, [isLoggedIn, userData, googleAuthLoaded, navigate, handleLogout, handleGoogleButtonClick, getStyles]);


    return null; // Component renders null, UI handled by effect
}