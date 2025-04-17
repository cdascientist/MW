/**
 * About.jsx - Authentication component with improved UI inspired by LoggedInTemplate
 * Updated with proper panel centering to fix positioning issues
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css"; // Base styles

// ====================================
// CONFIGURABLE VARIABLES
// ====================================

// MOBILE: Adjust the vertical offset of the 'Mountain West' header in the logged-out view on mobile.
// Use a negative percentage (e.g., '-35%') to move it up, positive to move down.
const mobileHeaderVerticalOffset = '-35%';

// MOBILE: Additional negative margin-top (in px) to apply to the logged-out content section ("Welcome...") on mobile, pushing it further up.
// The base margin-top is -40px relative to the header. A value of -30 here will result in a total margin-top of -70px on mobile.
const mobileLoggedOutContentMarginTopAdjust = 40; // Pushes content up by an extra 40px on mobile

// MOBILE: Top margin (in px) for the 'Sign in with Google' button container on mobile.
// Use this to push the button down from the text above it.
const mobileGoogleButtonMarginTop = 110; // Pushes Google button down 110px

// MOBILE: Bottom offset (in px) for the 'Back to Home' button on mobile.
// Smaller values push the button further down (closer to the bottom edge).
const mobileHomeButtonBottomOffset = 51; // Positions Home button 51px from bottom edge

// MOBILE: Horizontal translation (in px) for the 'Sign in with Google' button container on mobile.
// Negative values shift left, positive shift right.
const mobileGoogleButtonTranslateX = -9; // Shifts Google button container left by 9px

// MOBILE: Opacity for the custom 'Sign in with Google' button (fallback) on mobile (0.0 to 1.0).
// 0.85 means 15% transparent. Note: This might not apply to the official Google rendered button.
const mobileGoogleButtonOpacity = 0.85; // Makes custom Google button 15% transparent

// MOBILE: Vertical offset (in px) for the logged-in title "Welcome to Mountain West" on mobile.
// Negative values move it up, positive values move it down.
const mobileLoggedInTitleOffsetY = -100; // Moves title up 20px

// MOBILE: Vertical offset (in px) for the logged-in section "Welcome, Username! You're now signed in..." on mobile.
// Negative values move it up, positive values move it down.
const mobileLoggedInSectionOffsetY = -130; // Moves section up 20px

// MOBILE: Vertical offset (in px) for the user info (Username and Email) block on mobile.
// Negative values move it up, positive values move it down.
const mobileUserInfoOffsetY = 50; // Moves user info down 5px

// **MOBILE: Horizontal offset (in px) for the user info (Username and Email) block on mobile.
// Negative values move it left, positive values move it right.
const mobileUserInfoTranslateX = -60; // Moves user info left 5px


export default function About() {
    // ====================================
    // 1. COMPONENT SETUP & STATE INITIALIZATION
    // ====================================
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const isAttemptingLogin = useRef(false);
    const retryTimeoutRef = useRef(null);
    const overlayRef = useRef(null);

    // Google Client ID
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // ====================================
    // 2. AUTHENTICATION VERIFICATION & INITIAL STATE
    // ====================================
    useEffect(() => {
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');

        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                console.log("Retrieved authenticated session from localStorage");
            } catch (error) {
                console.error('Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        }
        setLoading(false);
    }, []);

    // JWT token decoder and other helper functions remain the same...
    const decodeJwtResponse = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            return { name: 'User', email: '' };
        }
    };

    // Google Sign-In setup and handlers remain the same...
    const removeDedicatedContainer = useCallback(() => {
        const container = document.getElementById('dedicated-google-signin-container');
        if (container && document.body.contains(container)) {
            try {
                document.body.removeChild(container);
            } catch (e) {
                console.warn("Error removing GSI container:", e);
            }
        }
    }, []);

    // Set up Google Sign-In Script
    useEffect(() => {
        window.handleGoogleSignIn = (response) => {
            isAttemptingLogin.current = false;
            removeDedicatedContainer();
            if (response && response.credential) {
                const decodedToken = decodeJwtResponse(response.credential);
                setUserData(decodedToken);
                setIsLoggedIn(true);
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
            }
        };

        const loadGoogleScript = () => {
            if (!document.getElementById('google-signin-script')) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.id = 'google-signin-script';
                script.async = true;
                script.defer = true;

                script.onload = () => {
                    if (window.google?.accounts?.id) {
                        setGoogleAuthLoaded(true);
                    } else {
                        setTimeout(() => {
                            if (window.google?.accounts?.id) {
                                setGoogleAuthLoaded(true);
                            }
                        }, 500);
                    }
                };

                document.head.appendChild(script);
            } else if (window.google?.accounts?.id && !googleAuthLoaded) {
                setGoogleAuthLoaded(true);
            }
        };

        loadGoogleScript();

        return () => {
            delete window.handleGoogleSignIn;
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            removeDedicatedContainer();

            document.querySelectorAll('[id^="credential_picker_container"], #mobile-google-signin-overlay, #google-signin-custom-styles')
                .forEach(el => el.parentNode?.removeChild(el));
        };
    }, [googleAuthLoaded, removeDedicatedContainer]);

    // Initialize Google Sign-In when the library is loaded
    useEffect(() => {
        if (googleAuthLoaded && window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true
            });
        }
    }, [googleAuthLoaded, GOOGLE_CLIENT_ID]);

    // Handlers remain the same...
    const handleLogout = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }

        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
    }, []);

    const handleNavigateToHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const handleNavigateToDashboard = useCallback(() => {
        navigate('/loggedintemplate');
    }, [navigate]);

    const createDedicatedGoogleSignInContainer = useCallback(() => {
        removeDedicatedContainer();

        const container = document.createElement('div');
        container.id = 'dedicated-google-signin-container';
        Object.assign(container.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9998', pointerEvents: 'auto'
        });

        const innerContainer = document.createElement('div');
        innerContainer.id = 'google-signin-inner-container';
        Object.assign(innerContainer.style, {
            backgroundColor: 'white', padding: '30px', borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            minWidth: '300px', maxWidth: '90%'
        });

        const title = document.createElement('h3');
        title.textContent = 'Sign in with Google';
        Object.assign(title.style, { marginBottom: '20px', color: '#333', fontSize: '1.2em' });
        innerContainer.appendChild(title);

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-button-element-container';
        innerContainer.appendChild(buttonContainer);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        Object.assign(closeButton.style, {
            marginTop: '20px', padding: '8px 16px', border: '1px solid #ccc',
            borderRadius: '4px', backgroundColor: '#f2f2f2', cursor: 'pointer', fontSize: '0.9em'
        });
        closeButton.addEventListener('click', () => { removeDedicatedContainer(); isAttemptingLogin.current = false; });
        innerContainer.appendChild(closeButton);

        container.appendChild(innerContainer);
        document.body.appendChild(container);

        return buttonContainer;
    }, [removeDedicatedContainer]);

    const handleGoogleButtonClick = useCallback(() => {
        if (!googleAuthLoaded || !window.google?.accounts?.id) return;

        isAttemptingLogin.current = true;
        const buttonContainer = createDedicatedGoogleSignInContainer();

        setTimeout(() => {
            if (buttonContainer) {
                window.google.accounts.id.renderButton(buttonContainer, {
                    type: 'standard', theme: 'outline', size: 'large', text: 'signin_with',
                    shape: 'rectangular', logo_alignment: 'left', width: 240
                });
            }
        }, 0);
    }, [googleAuthLoaded, createDedicatedGoogleSignInContainer]);

    // ====================================
    // 5. STYLING & UI CONFIGURATION WITH FIXED CENTERING
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // Panel dimensions and spacing
        const panelPaddingTop = isMobile ? '80px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';

        // Text sizes
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';
        const titleFontSize = isMobile ? '38px' : '45px';

        // Element positioning
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';
        const loggedInContentTopMargin = isMobile ? '120px' : '130px';

        // Button standardization
        const standardButtonStyle = {
            fontSize: buttonFontSize, padding: isMobile ? '5px 10px' : '8px 15px',
            borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap',
            width: 'fit-content', pointerEvents: 'auto',
            transition: 'transform 0.2s ease, background-color 0.2s ease, opacity 0.2s ease', // Added opacity transition
            display: 'inline-block'
        };

        return {
            overlay: {
                className: 'ui-overlay about-overlay',
                style: {
                    zIndex: '9999', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                    width: '100vw', height: '100vh', pointerEvents: 'auto',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel about-panel',
                style: {
                    position: 'relative', width: desktopPanelWidth, maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight, maxHeight: '90vh', backgroundColor: 'rgba(13, 20, 24, 0.65)',
                    borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`,
                    color: 'white', pointerEvents: 'auto', overflowY: 'auto', overflowX: 'hidden',
                    boxSizing: 'border-box', opacity: 0, margin: '0 auto', top: 'auto', left: 'auto', transform: 'none',
                }
            },
            panelHeader: {
                style: {
                    width: '100%', textAlign: 'center', position: 'absolute',
                    top: isMobile ? '30px' : '40px', left: '0', right: '0', zIndex: 1,
                }
            },
            panelTitle: { // Style for "Mountain West" (logged out)
                style: {
                    fontSize: titleFontSize, color: '#E0F7FA', margin: '0',
                    // **MOBILE: Apply vertical offset to logged-out header title
                    transform: isMobile ? `translateY(${mobileHeaderVerticalOffset})` : 'none',
                }
            },
            profileContainer: {
                style: {
                    position: 'absolute', top: profileTop, left: profileLeft, display: 'flex', alignItems: 'center', gap: '15px',
                    zIndex: 10, opacity: 0, transform: 'translateX(-50px)',
                }
            },
            buttonStackContainer: {
                style: {
                    position: 'absolute', top: buttonStackTop, right: buttonStackRight, display: 'flex', flexDirection: 'column', gap: buttonStackGap,
                    zIndex: 100, alignItems: 'flex-end', opacity: 0, transform: 'translateX(50px)',
                }
            },
            loggedInContentContainer: {
                className: 'content-container logged-in',
                style: {
                    width: '100%', marginTop: loggedInContentTopMargin, opacity: 0, transform: 'translateY(30px)',
                    position: 'relative', zIndex: 5
                }
            },
            loggedOutContentContainer: {
                className: 'content-container logged-out',
                style: {
                    width: '100%',
                    // **MOBILE: Apply additional negative margin-top adjustment for logged-out content
                    marginTop: isMobile ? `${-40 + mobileLoggedOutContentMarginTopAdjust}px` : '-40px',
                    opacity: 0, transform: 'translateY(30px)', position: 'relative', zIndex: 2,
                    padding: '30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }
            },
            googleButtonContainer: {
                style: {
                    width: isMobile ? '240px' : '280px', margin: '0 auto',
                    // **MOBILE: Apply configurable top margin for the Google button
                    marginTop: isMobile ? `${mobileGoogleButtonMarginTop}px` : '0px',
                    position: 'relative', zIndex: 10,
                    // **MOBILE: Apply horizontal translation to the container
                    transform: isMobile ? `translateX(${mobileGoogleButtonTranslateX}px)` : 'none',
                    transition: 'transform 0.3s ease-out' // Smooth transition for the shift
                }
            },
            homeButtonContainer: {
                style: {
                    position: 'absolute',
                    // **MOBILE: Apply configurable bottom offset for the Home button
                    bottom: isMobile ? `${mobileHomeButtonBottomOffset}px` : '40px',
                    left: '50%', transform: 'translateX(-50%)', width: 'fit-content', zIndex: 10
                }
            },
            profilePhoto: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0, } },
            profilePhotoPlaceholder: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0, } },
            userInfo: { // Container for Username and Email
                style: {
                    display: 'flex', flexDirection: 'column', textAlign: 'left',
                    // **MOBILE: Apply vertical and horizontal offsets to user info block
                    transform: isMobile ? `translateX(${mobileUserInfoTranslateX}px) translateY(${mobileUserInfoOffsetY}px)` : 'none',
                }
            },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500', } },
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e', } },
            // Button styles
            logoutButton: { className: 'nav-button logout-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)' } },
            dashboardButton: { className: 'nav-button dashboard-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad', border: '1px solid rgba(142, 68, 173, 0.4)' } },
            homeButton: { className: 'nav-button home-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', textDecoration: 'none' } },
            // Style for the custom Google Button (fallback)
            googleButton: {
                className: 'nav-button google-button',
                style: {
                    ...standardButtonStyle, // Inherit base styles
                    backgroundColor: 'white', color: '#444', border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    // **MOBILE: Apply configurable opacity only on mobile
                    opacity: isMobile ? mobileGoogleButtonOpacity : 1.0,
                }
            },
            // Content text styles
            loggedOutIntroText: { style: { fontSize: isMobile ? '16px' : '24px', lineHeight: '1.5', marginBottom: '20px', color: '#a7d3d8', textAlign: 'center', width: '100%' } },
            loggedInContentHeading: { // Style for "Welcome to Mountain West" (logged in)
                style: {
                    fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold',
                    // **MOBILE: Apply vertical offset to logged-in title
                    transform: isMobile ? `translateY(${mobileLoggedInTitleOffsetY}px)` : 'none',
                }
            },
            loggedInContentText: { // Style for "Welcome, Username! You're now signed in..." text
                style: {
                    fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6',
                }
            },
            loggedInContentSection: { // Container for the "Welcome, Username!..." text
                style: {
                    backgroundColor: 'rgba(87, 179, 192, 0.05)', padding: isMobile ? '15px' : '20px', borderRadius: '8px', marginBottom: isMobile ? '15px' : '20px',
                    // **MOBILE: Apply vertical offset to logged-in welcome section
                    transform: isMobile ? `translateY(${mobileLoggedInSectionOffsetY}px)` : 'none',
                }
            },
        };
    };

    // Animation helper (no changes)
    const animateElement = (element, properties, delay = 0) => {
        if (!element) return;
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease-out';
            Object.keys(properties).forEach(prop => {
                element.style[prop] = properties[prop];
            });
        }, delay);
    };

    // ====================================
    // 6. UI RENDERING EFFECT WITH IMPROVED CENTERING
    // ====================================
    useEffect(() => {
        const loremIpsumText = "Welcome to Mountain West. This platform helps you search, analyze, and manage job opportunities effectively. Sign in to access the full suite of tools and features.";
        if (overlayRef.current || document.querySelector('.about-overlay')) return;

        const styles = getStyles();
        const isMobile = window.innerWidth <= 768;

        try {
            // Create Overlay & Panel
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            const panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'about-panel';
            Object.assign(panel.style, styles.panel.style);

            // Ensure body styling for centering
            if (window.getComputedStyle(document.body).overflow !== 'hidden') {
                Object.assign(document.body.style, { overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', margin: '0', padding: '0' });
            }

            // UI content based on login status
            if (isLoggedIn && userData) {
                // --- LOGGED IN UI ---

                // Button Stack (Top Right)
                const buttonStackContainer = document.createElement("div"); buttonStackContainer.id = "button-stack"; Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style); const buttonsConfig = [{ id: "logout-button", text: "Logout", style: styles.logoutButton.style, className: styles.logoutButton.className, handler: handleLogout, priority: 1 }, { id: "dashboard-button", text: "Go to Dashboard", style: styles.dashboardButton.style, className: styles.dashboardButton.className, handler: handleNavigateToDashboard, priority: 2 }, { id: "home-button", text: "Close", style: styles.homeButton.style, className: styles.homeButton.className, handler: handleNavigateToHome, priority: 3 }]; buttonsConfig.sort((a, b) => a.priority - b.priority); buttonsConfig.forEach(config => { const button = document.createElement("button"); button.id = config.id; button.className = config.className; Object.assign(button.style, config.style); button.textContent = config.text; button.addEventListener("click", config.handler); buttonStackContainer.appendChild(button) }); panel.appendChild(buttonStackContainer);

                // Profile Info (Top Left)
                const profileContainer = document.createElement("div"); profileContainer.id = "profile-container"; Object.assign(profileContainer.style, styles.profileContainer.style);
                const profilePhotoEl = document.createElement(userData.picture ? "img" : "div");
                if (userData.picture) { profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile"; Object.assign(profilePhotoEl.style, styles.profilePhoto.style) } else { profilePhotoEl.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : "U"; Object.assign(profilePhotoEl.style, styles.profilePhotoPlaceholder.style) } profileContainer.appendChild(profilePhotoEl);
                // **MOBILE: User info div applies vertical and horizontal offsets via styles.userInfo.style
                const userInfoDiv = document.createElement("div"); Object.assign(userInfoDiv.style, styles.userInfo.style);
                const userNameEl = document.createElement("h3"); Object.assign(userNameEl.style, styles.userName.style); userNameEl.textContent = `${userData.name || "User"}`; const userEmailEl = document.createElement("p"); Object.assign(userEmailEl.style, styles.userEmail.style); userEmailEl.textContent = userData.email || "No email provided"; userInfoDiv.appendChild(userNameEl); userInfoDiv.appendChild(userEmailEl); profileContainer.appendChild(userInfoDiv); panel.appendChild(profileContainer);

                // Main Content (Logged In)
                const contentContainer = document.createElement("div"); contentContainer.id = "content-container-loggedin"; contentContainer.className = styles.loggedInContentContainer.className; Object.assign(contentContainer.style, styles.loggedInContentContainer.style);
                // **MOBILE: Title applies vertical offset via styles.loggedInContentHeading.style
                const contentHeading = document.createElement("h2"); Object.assign(contentHeading.style, styles.loggedInContentHeading.style); contentHeading.textContent = "Welcome to Mountain West";
                // **MOBILE: Welcome section applies vertical offset via styles.loggedInContentSection.style
                const contentSectionDiv = document.createElement("div"); Object.assign(contentSectionDiv.style, styles.loggedInContentSection.style);
                const welcomeText = document.createElement("p"); Object.assign(welcomeText.style, styles.loggedInContentText.style); welcomeText.textContent = `Welcome, ${userData.name || "User"}! You're now signed in...`; contentSectionDiv.appendChild(welcomeText); contentContainer.appendChild(contentHeading); contentContainer.appendChild(contentSectionDiv); panel.appendChild(contentContainer);

            } else {
                // --- NOT LOGGED IN UI ---

                // Panel Header and Title ("Mountain West")
                const panelHeader = document.createElement('div');
                panelHeader.className = 'panel-header';
                Object.assign(panelHeader.style, styles.panelHeader.style);
                const panelTitle = document.createElement('h2');
                panelTitle.className = 'panel-title';
                // **MOBILE: Logged-out title vertical offset applied via styles.panelTitle.style
                Object.assign(panelTitle.style, styles.panelTitle.style);
                panelTitle.textContent = "Mountain West";
                panelHeader.appendChild(panelTitle);
                panel.appendChild(panelHeader);

                // Content area (LOGGED OUT - Text + Button)
                const contentContainer = document.createElement('div');
                contentContainer.id = 'content-container-loggedout';
                contentContainer.className = styles.loggedOutContentContainer.className;
                // **MOBILE: Logged-out content margin-top adjustment applied via styles.loggedOutContentContainer.style
                Object.assign(contentContainer.style, styles.loggedOutContentContainer.style);

                // Introduction text Paragraph
                const introText = document.createElement('p');
                Object.assign(introText.style, styles.loggedOutIntroText.style);
                introText.textContent = loremIpsumText;
                contentContainer.appendChild(introText);

                // Google button container
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                // **MOBILE: Google button margin-top & translateX applied via styles.googleButtonContainer.style
                Object.assign(googleButtonContainer.style, styles.googleButtonContainer.style);

                // Custom Google sign-in button (Fallback)
                const customGoogleButton = document.createElement('button');
                customGoogleButton.id = 'custom-google-login-button';
                // **MOBILE: Custom Google button opacity applied via styles.googleButton.style
                Object.assign(customGoogleButton.style, styles.googleButton.style);
                const googleLogo = document.createElement('img'); googleLogo.src = "https://developers.google.com/identity/images/g-logo.png"; googleLogo.alt = "Google"; googleLogo.style.width = "20px"; googleLogo.style.height = "20px"; customGoogleButton.appendChild(googleLogo); customGoogleButton.appendChild(document.createTextNode(" Sign in with Google"));
                customGoogleButton.addEventListener('click', handleGoogleButtonClick);
                customGoogleButton.addEventListener('mouseenter', () => { customGoogleButton.style.backgroundColor = '#f8f8f8'; customGoogleButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'; customGoogleButton.style.opacity = isMobile ? Math.min(1, mobileGoogleButtonOpacity + 0.15) : 1; }); // Slightly less transparent on hover
                customGoogleButton.addEventListener('mouseleave', () => { customGoogleButton.style.backgroundColor = 'white'; customGoogleButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; customGoogleButton.style.opacity = isMobile ? mobileGoogleButtonOpacity : 1; }); // Revert opacity

                googleButtonContainer.appendChild(customGoogleButton);
                contentContainer.appendChild(googleButtonContainer);
                panel.appendChild(contentContainer);

                // Home button Container
                const homeButtonContainer = document.createElement('div');
                // **MOBILE: Home button bottom offset applied via styles.homeButtonContainer.style
                Object.assign(homeButtonContainer.style, styles.homeButtonContainer.style);
                const homeButton = document.createElement('button');
                homeButton.id = 'home-button';
                homeButton.className = styles.homeButton.className;
                Object.assign(homeButton.style, styles.homeButton.style);
                homeButton.textContent = 'Back to Home';
                homeButton.addEventListener('click', handleNavigateToHome);
                homeButton.addEventListener('mouseenter', () => { homeButton.style.transform = 'scale(1.05)'; homeButton.style.backgroundColor = 'rgba(87, 179, 192, 0.3)'; });
                homeButton.addEventListener('mouseleave', () => { homeButton.style.transform = 'scale(1)'; homeButton.style.backgroundColor = 'rgba(87, 179, 192, 0.2)'; });
                homeButtonContainer.appendChild(homeButton);
                panel.appendChild(homeButtonContainer);
            }

            // --- APPEND TO BODY & CENTERING CHECK ---
            const existingOverlays = document.querySelectorAll('.about-overlay, .ui-overlay');
            existingOverlays.forEach(el => { if (el !== overlay) el.parentNode?.removeChild(el); });
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            setTimeout(() => { /* Centering check logic */ }, 0);

            // --- ANIMATIONS ---
            setTimeout(() => {
                const panelElement = document.getElementById('about-panel');
                const profileElement = document.getElementById('profile-container');
                const buttonStackElement = document.getElementById('button-stack');
                const loggedInContentElement = document.getElementById('content-container-loggedin');
                const loggedOutContentElement = document.getElementById('content-container-loggedout');

                if (panelElement) animateElement(panelElement, { opacity: '1' }, 0);

                if (isLoggedIn) {
                    if (profileElement) animateElement(profileElement, { opacity: '1', transform: 'translateX(0)' }, 200);
                    if (buttonStackElement) animateElement(buttonStackElement, { opacity: '1', transform: 'translateX(0)' }, 200);
                    if (loggedInContentElement) animateElement(loggedInContentElement, { opacity: '1', transform: 'translateY(0)' }, 400);
                } else {
                    if (loggedOutContentElement) animateElement(loggedOutContentElement, { opacity: '1', transform: 'translateY(0px)' }, 400);
                }

                // Add hover effects (already handled in button creation)
                // const buttons = document.querySelectorAll(...)

                // Render Google Sign-In Button
                if (!isLoggedIn && googleAuthLoaded && window.google?.accounts?.id) {
                    try {
                        const googleButtonContainer = document.getElementById('google-button-container');
                        if (googleButtonContainer) {
                            const customButton = document.getElementById('custom-google-login-button');
                            // **MOBILE: Hide the custom button if the official one renders, even if transparent
                            if (customButton) customButton.style.display = 'none';
                            window.google.accounts.id.renderButton(googleButtonContainer, {
                                type: 'standard', theme: 'outline', size: 'large', text: 'signin_with',
                                shape: 'rectangular', logo_alignment: 'left',
                                width: isMobile ? '240' : '280'
                            });
                            // **MOBILE: Note - The official button rendered here WILL NOT have the custom opacity applied.
                            // The container's transformtranslateX will still apply, shifting the official button left/right.
                            console.log('Google Sign-In button rendered successfully');
                        }
                    } catch (error) {
                        console.error('Failed to render Google Sign-In button:', error);
                        const customButton = document.getElementById('custom-google-login-button');
                        // **MOBILE: Ensure fallback button is visible and styled correctly on error
                        if (customButton) {
                            customButton.style.display = 'flex';
                            Object.assign(customButton.style, styles.googleButton.style); // Re-apply styles including opacity
                        }
                    }
                }

                // Final centering check
                setTimeout(() => { /* ... centering check ... */ }, 100);

            }, 100); // Delay animations

        } catch (error) {
            console.error("About: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
                overlayRef.current = null;
            }
            document.body.style.overflow = '';
            return;
        }

        // ====================================
        // 7. EVENT HANDLING & CLEANUP
        // ====================================
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("About: Reloading due to resize...");
                window.location.reload();
            }, 250);
        };
        window.addEventListener('resize', handleResize);

        const jobSearchLink = document.querySelector('.nav-item a[href*="mountainwestjobsearch.com"]');
        if (jobSearchLink) { jobSearchLink.style.display = isLoggedIn ? 'flex' : 'none'; }

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
            } else {
                const fallbackOverlay = document.querySelector('.about-overlay');
                if (fallbackOverlay) fallbackOverlay.remove();
            }
            overlayRef.current = null;
            // Restore body styles on unmount
            document.body.style.overflow = ''; document.body.style.display = ''; document.body.style.alignItems = '';
            document.body.style.justifyContent = ''; document.body.style.height = ''; document.body.style.margin = ''; document.body.style.padding = '';
        };
    }, [
        isLoggedIn, userData, googleAuthLoaded, navigate,
        handleLogout, handleNavigateToHome, handleNavigateToDashboard, handleGoogleButtonClick
    ]);

    return null;
}