/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 32 - Fixed mobile button issues)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css"; // Ensure this CSS doesn't conflict

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const isAttemptingLogin = useRef(false);
    const retryTimeoutRef = useRef(null);

    // Google Client ID
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // *** CONFIGURABLE POSITIONING VARIABLES ***
    const CONFIG = {
        desktop: {
            contentTopMargin: '-100px',
            contentMaxHeight: '55vh', // Reduced by 25% (from 60vh to 45vh)
            contentBottomPadding: '150px', // Padding at bottom of content area
            loggedInContentTopPosition: '-70px',
            userInfoTopPosition: '-120px',
            loggedInContentHeight: 'calc(100% - 180px)',
            buttonBottomPosition: '50px',
            buttonLeftPosition: '50px',
            buttonZIndex: '9999999', // Extreme z-index for button
            buttonWidth: '280px' // Width of the button
        },
        mobile: {
            headerHeight: '60px',
            contentMaxHeight: '55vh', // Added this line - Reduced by 25% (from 60vh to 45vh)
            contentBottomSpace: '140px', // Space to leave at bottom for button area
            contentPaddingBottom: '80px', // Padding at bottom of content
            buttonAreaHeight: '100px',
            buttonBottomPosition: '10%', // Changed from '0' to '10%' - moving the button up by 10%
            buttonAreaBackground: 'rgba(13, 20, 24, 0.8)',
            buttonZIndex: '9995', // Just below menu's 10000
            buttonWidth: '240px' // Width of the button
        }
    };
    // *** END CONFIGURABLE POSITIONING VARIABLES ***

    // --- Lorem Ipsum Text --- (unchanged)
    const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia";

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
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            return { name: 'User', email: '' };
        }
    };

    // Aggressive removal of Google Sign-In Modal
    const removeDedicatedContainer = () => {
        const container = document.getElementById('dedicated-google-signin-container');
        if (container && document.body.contains(container)) {
            console.log("Attempting remove GSI container.");
            try {
                document.body.removeChild(container);
            } catch (e) {
                console.warn("Error removing GSI container:", e);
            }
        }
    };

    // Set up Google Sign-In Script
    useEffect(() => {
        window.handleGoogleSignIn = (response) => {
            isAttemptingLogin.current = false;
            removeDedicatedContainer();
            if (response && response.credential) {
                console.log("GSI success:", response);
                const decodedToken = decodeJwtResponse(response.credential);
                setUserData(decodedToken);
                setIsLoggedIn(true);
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
            } else {
                console.warn('GSI failed/cancelled.');
            }
        };

        const loadGoogleScript = () => {
            if (!document.getElementById('google-signin-script')) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.id = 'google-signin-script';
                script.async = true;
                script.defer = true;
                let timeoutId = null;
                script.onload = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    if (window.google?.accounts?.id) {
                        setGoogleAuthLoaded(true);
                        console.log('GSI script loaded & API ready.');
                    } else {
                        setTimeout(() => {
                            if (window.google?.accounts?.id) {
                                setGoogleAuthLoaded(true);
                                console.log('GSI API ready after delay.');
                            } else {
                                console.warn('GSI API failed init post-load.');
                            }
                        }, 500);
                    }
                };
                script.onerror = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    console.error('Failed to load GSI script.');
                };
                timeoutId = setTimeout(() => {
                    if (!window.google?.accounts?.id && !googleAuthLoaded) {
                        console.warn('GSI API init timeout');
                    }
                }, 5000);
                document.head.appendChild(script);
            } else if (window.google?.accounts?.id && !googleAuthLoaded) {
                setGoogleAuthLoaded(true);
                console.log('GSI script existed & API ready.');
            } else if (!googleAuthLoaded) {
                console.log('GSI script exists, awaiting API init.');
            }
        };

        loadGoogleScript();

        return () => {
            delete window.handleGoogleSignIn;
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            removeDedicatedContainer();
            const googleElements = document.querySelectorAll('[id^="credential_picker_container"], #mobile-google-signin-overlay, #google-signin-custom-styles');
            googleElements.forEach(el => el.parentNode?.removeChild(el));
        };
    }, [googleAuthLoaded]);

    // Initialize Google Sign-In when the library is loaded
    useEffect(() => {
        if (googleAuthLoaded && window.google?.accounts?.id) {
            console.log("Initializing Google Sign-In...");

            // Configure Google Sign-In
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: window.handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            console.log("Google Sign-In initialized successfully");
        }
    }, [googleAuthLoaded, GOOGLE_CLIENT_ID]);

    // Logout handler
    const handleLogout = useCallback(() => {
        isAttemptingLogin.current = false;
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        window.google?.accounts?.id.disableAutoSelect();
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log('User logged out.');
    }, [setIsLoggedIn, setUserData]);

    // Creates the dedicated modal/overlay
    const createDedicatedGoogleSignInContainer = useCallback(() => {
        removeDedicatedContainer();
        const container = document.createElement('div');
        container.id = 'dedicated-google-signin-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: '9998', // Below maximum z-index, behind menu toggle (10001) but above most UI
            pointerEvents: 'auto'
        });
        const innerContainer = document.createElement('div');
        innerContainer.id = 'google-signin-inner-container';
        Object.assign(innerContainer.style, {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '300px',
            maxWidth: '90%'
        });
        const title = document.createElement('h3');
        title.textContent = 'Sign in with Google';
        Object.assign(title.style, {
            marginBottom: '20px',
            color: '#333',
            fontSize: '1.2em'
        });
        innerContainer.appendChild(title);
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-button-element-container';
        innerContainer.appendChild(buttonContainer);
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        Object.assign(closeButton.style, {
            marginTop: '20px',
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f2f2f2',
            cursor: 'pointer',
            fontSize: '0.9em'
        });
        closeButton.addEventListener('click', () => {
            removeDedicatedContainer();
            isAttemptingLogin.current = false;
        });
        innerContainer.appendChild(closeButton);
        container.appendChild(innerContainer);
        document.body.appendChild(container);
        return buttonContainer;
    }, []);

    // Render Google Sign-In button in a specified container
    const renderGoogleSignInButton = useCallback((containerId) => {
        if (!googleAuthLoaded || !window.google?.accounts?.id) {
            console.warn("Cannot render Google Sign-In button - Google Auth not loaded");
            return false;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        try {
            console.log(`Rendering Google Sign-In button in ${containerId}`);
            window.google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: containerId.includes('mobile') ? CONFIG.mobile.buttonWidth : CONFIG.desktop.buttonWidth
            });
            return true;
        } catch (error) {
            console.error("Error rendering Google Sign-In button:", error);
            return false;
        }
    }, [googleAuthLoaded, CONFIG]);

    // Handle Google Sign-In button click
    const handleGoogleButtonClick = useCallback(() => {
        console.log("Google Sign-In button clicked");
        if (!googleAuthLoaded || !window.google?.accounts?.id) {
            console.warn("Google Auth not loaded, cannot start sign-in");
            return;
        }

        isAttemptingLogin.current = true;

        // Create a dedicated container for sign-in
        const buttonContainer = createDedicatedGoogleSignInContainer();

        // Render the Google Sign-In button in the modal
        setTimeout(() => {
            if (buttonContainer) {
                window.google.accounts.id.renderButton(buttonContainer, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: 240
                });

                // You can also prompt the One Tap UI if desired
                // window.google.accounts.id.prompt();
            }
        }, 0);
    }, [googleAuthLoaded, createDedicatedGoogleSignInContainer]);

    // Main UI rendering effect
    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999';

        const panel = document.createElement('div');
        panel.className = 'flat-panel';
        panel.style.overflow = 'hidden'; // Changed from 'auto' to 'hidden'
        panel.style.position = 'relative'; // Important for internal positioning

        // Ensure job search link visibility is controlled by login state
        const jobSearchLink = document.querySelector('.nav-item a[href*="mountainwestjobsearch.com"]');
        if (jobSearchLink) {
            jobSearchLink.style.display = isLoggedIn ? 'flex' : 'none';
        }

        // --- UI Creation ---
        if (!isMobile) {
            // ================== DESKTOP VIEW ==================
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
                // Desktop Logged In UI
                // (unchanged for now)
            } else {
                // Desktop Logged Out UI
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                Object.assign(contentContainer.style, {
                    padding: '30px',
                    marginTop: CONFIG.desktop.contentTopMargin,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll', // Changed to scroll for better visibility of scrollbars
                    maxHeight: CONFIG.desktop.contentMaxHeight,
                    position: 'relative',
                    zIndex: '5',
                    paddingBottom: CONFIG.desktop.contentBottomPadding,
                    pointerEvents: 'auto',
                    boxSizing: 'border-box',
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: '-ms-autohiding-scrollbar', // Better scrollbars for IE
                });

                contentContainer.innerHTML = `<p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8; overflow-wrap: break-word;">${loremIpsumText}</p>`;
                panel.appendChild(contentContainer);

                // **Desktop_NoLogin_Buttons**
                const leftButtonStack = document.createElement('div');
                Object.assign(leftButtonStack.style, {
                    position: 'absolute',
                    left: CONFIG.desktop.buttonLeftPosition,
                    bottom: CONFIG.desktop.buttonBottomPosition,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    zIndex: CONFIG.desktop.buttonZIndex
                });

                // Google button container for desktop
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container-desktop';
                googleButtonContainer.style.width = CONFIG.desktop.buttonWidth + 'px';
                googleButtonContainer.style.position = 'relative';
                googleButtonContainer.style.zIndex = CONFIG.desktop.buttonZIndex;

                leftButtonStack.appendChild(googleButtonContainer);

                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.width = '280px';
                homeButtonContainer.style.display = 'none';
                homeButtonContainer.innerHTML = `<button id="home-button" style="
                    background-color: rgba(87, 179, 192, 0.2);
                    color: #57b3c0;
                    border: 1px solid rgba(87, 179, 192, 0.4);
                    width: 100%;
                    padding: 12px 16px;
                    font-size: 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    pointer-events: auto;
                    z-index: 9999999;
                ">Back to Start</button>`;
                leftButtonStack.appendChild(homeButtonContainer);

                panel.appendChild(leftButtonStack);
            }
        } else {
            // ================== MOBILE VIEW ==================
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 25px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 28px;"></h1></header>`;
            panel.appendChild(headerDiv);

            if (isLoggedIn && userData) {
                // Mobile Logged In UI
                // (unchanged for now)
            } else {
                // Mobile Logged Out UI
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                Object.assign(contentContainer.style, {
                    position: 'absolute',
                    top: CONFIG.mobile.headerHeight,
                    bottom: CONFIG.mobile.contentBottomSpace,
                    left: '15px',
                    right: '15px',
                    overflowY: 'scroll', // Changed to scroll for better visibility of scrollbars
                    width: 'auto',
                    boxSizing: 'border-box',
                    zIndex: '10',
                    maxHeight: CONFIG.mobile.contentMaxHeight, // Added this line to apply maxHeight on mobile
                    paddingBottom: CONFIG.mobile.contentPaddingBottom,
                    WebkitOverflowScrolling: 'touch',
                    pointerEvents: 'auto',
                    msOverflowStyle: '-ms-autohiding-scrollbar', // Better scrollbars for IE
                });

                contentContainer.innerHTML = `<p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8; overflow-wrap: break-word;">${loremIpsumText}</p>`;
                panel.appendChild(contentContainer);
            }
        }
        // --- End of UI Creation ---

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // --- Mobile-specific UI for Google Sign-In ---
        if (isMobile) {
            // First, remove any existing mobile button (to avoid duplicates across page loads)
            const existingMobileButton = document.querySelector('.mobileButtonArea');
            if (existingMobileButton) {
                existingMobileButton.remove();
            }

            // Create mobile button area (only on About page and only on mobile)
            const mobileButtonArea = document.createElement('div');
            mobileButtonArea.className = 'mobileButtonArea';
            Object.assign(mobileButtonArea.style, {
                position: 'fixed',
                bottom: CONFIG.mobile.buttonBottomPosition,
                left: '0',
                width: '100%',
                height: CONFIG.mobile.buttonAreaHeight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                zIndex: '9995', // Just below menu's 10000
                boxSizing: 'border-box',
                padding: '20px 0',
                backgroundColor: CONFIG.mobile.buttonAreaBackground,
                pointerEvents: 'all'
            });

            // Create Google button for mobile
            const googleButton = document.createElement('button');
            googleButton.id = 'google-login-button-mobile';
            googleButton.type = 'button';
            Object.assign(googleButton.style, {
                backgroundColor: 'white',
                color: '#444',
                width: CONFIG.mobile.buttonWidth + 'px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: 'Roboto, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                zIndex: '9996', // Above container
                marginTop: '10px',
                WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
                touchAction: 'manipulation',
                outline: 'none',
                WebkitAppearance: 'none',
                pointerEvents: 'auto'
            });

            // Add Google logo and text
            googleButton.innerHTML = `
                <img src="https://developers.google.com/identity/images/g-logo.png" 
                     style="width: 20px; height: 20px; margin-right: 12px;" 
                     alt="Google logo">
                Sign in with Google
            `;

            // Add home button container (hidden by default)
            const homeButtonContainer = document.createElement('div');
            homeButtonContainer.id = 'homeButtonContainer';
            homeButtonContainer.style.width = CONFIG.mobile.buttonWidth + 'px';
            homeButtonContainer.style.display = 'none';

            // Create home button
            const homeButton = document.createElement('button');
            homeButton.id = 'home-button-mobile';
            Object.assign(homeButton.style, {
                backgroundColor: 'rgba(87, 179, 192, 0.2)',
                color: '#57b3c0',
                border: '1px solid rgba(87, 179, 192, 0.4)',
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '4px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: '9996'
            });
            homeButton.textContent = 'Back to Start';
            homeButtonContainer.appendChild(homeButton);

            // Append everything
            mobileButtonArea.appendChild(googleButton);
            mobileButtonArea.appendChild(homeButtonContainer);
            document.body.appendChild(mobileButtonArea);

            // Handle mobile button events
            googleButton.addEventListener('click', function (e) {
                console.log("Mobile button click event fired!");
                e.preventDefault();
                e.stopPropagation();
                handleGoogleButtonClick();
            }, { capture: true });

            googleButton.addEventListener('touchend', function (e) {
                console.log("Mobile button touchend event fired!");
                e.preventDefault();
                e.stopPropagation();
                setTimeout(() => handleGoogleButtonClick(), 10);
            }, { capture: true });

            // Add visual feedback
            googleButton.addEventListener('touchstart', function () {
                this.style.backgroundColor = '#f0f0f0';
                this.style.transform = 'scale(0.98)';
            }, { passive: true });

            googleButton.addEventListener('touchend', function () {
                this.style.backgroundColor = 'white';
                this.style.transform = 'scale(1)';
            }, { passive: true });

            // Home button listener
            if (homeButton) {
                homeButton.addEventListener('click', () => navigate('/'));
            }
        }

        // --- Event Listener Attachment ---
        const homeButton = document.getElementById('home-button');
        if (homeButton) homeButton.addEventListener('click', () => navigate('/'));

        if (isLoggedIn) {
            // Logged in listeners would go here
        } else {
            // Desktop button handler
            const desktopGoogleButton = document.getElementById('google-login-button-desktop');
            if (desktopGoogleButton) {
                desktopGoogleButton.addEventListener('click', (e) => {
                    console.log("Desktop Google button clicked");
                    e.preventDefault();
                    e.stopPropagation();
                    handleGoogleButtonClick(e);
                });
                // Add hover effect
                desktopGoogleButton.addEventListener('mouseenter', () => {
                    desktopGoogleButton.style.backgroundColor = '#f8f8f8';
                    desktopGoogleButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                });
                desktopGoogleButton.addEventListener('mouseleave', () => {
                    desktopGoogleButton.style.backgroundColor = 'white';
                    desktopGoogleButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                });
            }

            // Render desktop Google button if auth is loaded
            if (googleAuthLoaded) {
                renderGoogleSignInButton('google-button-container-desktop');
            } else {
                // Set up a watcher to render button once auth is ready
                const checkAuthInterval = setInterval(() => {
                    if (googleAuthLoaded && window.google?.accounts?.id) {
                        renderGoogleSignInButton('google-button-container-desktop');
                        clearInterval(checkAuthInterval);
                    }
                }, 500);

                // Clear interval after 10 seconds to prevent infinite checking
                setTimeout(() => clearInterval(checkAuthInterval), 10000);
            }
        }
        // --- End of Event Listener Attachment ---

        // Make sure scrolling works correctly
        const contentElements = document.querySelectorAll('.content-container');
        contentElements.forEach(el => {
            // Enable touch scrolling on mobile
            el.addEventListener('touchstart', () => { }, { passive: true });
            // Enable mouse wheel scrolling
            el.addEventListener('wheel', () => { }, { passive: true });
        });

        // Resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.location.reload();
            }, 250);
        };
        window.addEventListener('resize', handleResize);

        // --- Cleanup function ---
        return () => {
            // Clean up global click handler
            delete window.mobileButtonClickHandler;

            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            if (document.body.contains(overlay)) {
                try {
                    document.body.removeChild(overlay);
                } catch (e) {
                    console.error("Error removing overlay:", e);
                }
            }

            // Clean up mobile button
            const mobileButtonArea = document.querySelector('.mobileButtonArea');
            if (mobileButtonArea) mobileButtonArea.remove();

            // Ensure Google Sign-In modal is also cleaned up
            removeDedicatedContainer();

            // Remove any Google artifacts that might be left
            const googleElements = document.querySelectorAll(
                '[id^="credential_picker_container"], ' +
                '[id^="g_a_"], ' +
                '#google-button-container-desktop, ' +
                '#google-button-container-mobile, ' +
                '#google-signin-custom-styles'
            );

            googleElements.forEach(el => {
                if (el && el.parentNode) {
                    try {
                        el.parentNode.removeChild(el);
                    } catch (e) {
                        console.warn("Error removing Google element:", e);
                    }
                }
            });
        };
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded, renderGoogleSignInButton, createDedicatedGoogleSignInContainer, CONFIG, loremIpsumText]); // Dependencies updated

    return null;
}