/**
 * About.jsx - Authentication component with improved UI inspired by LoggedInTemplate
 * Updated with proper panel centering to fix positioning issues
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css"; // Base styles

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
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: '9998',
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
    }, [removeDedicatedContainer]);

    const handleGoogleButtonClick = useCallback(() => {
        if (!googleAuthLoaded || !window.google?.accounts?.id) {
            return;
        }

        isAttemptingLogin.current = true;
        const buttonContainer = createDedicatedGoogleSignInContainer();

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
            }
        }, 0);
    }, [googleAuthLoaded, createDedicatedGoogleSignInContainer]);

    // ====================================
    // 5. STYLING & UI CONFIGURATION WITH FIXED CENTERING
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // Panel dimensions and spacing
        const panelPaddingTop = isMobile ? '100px' : '130px';
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

        // Element positioning
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';
        const contentTopMargin = isMobile ? '120px' : '130px';

        // Button standardization
        const standardButtonStyle = {
            fontSize: buttonFontSize,
            padding: isMobile ? '5px 10px' : '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            width: 'fit-content',
            pointerEvents: 'auto',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            display: 'inline-block'
        };

        // Fix for the parent overlay positioning
        return {
            // This overlay styling ensures the panel is centered properly
            overlay: {
                className: 'ui-overlay about-overlay',
                style: {
                    zIndex: '9999',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'auto',
                    // Use flexbox for perfect centering
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                }
            },
            // Panel style with centering fixes
            panel: {
                className: 'flat-panel about-panel',
                style: {
                    position: 'relative',
                    width: desktopPanelWidth,
                    maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight,
                    maxHeight: '90vh',
                    backgroundColor: 'rgba(13, 20, 24, 0.65)', // Was 0.9, now 0.65 (25% more transparent)
                    borderRadius: '12px',
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`,
                    color: 'white',
                    pointerEvents: 'auto',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    opacity: 0, // Start with opacity 0 for animation
                    // Ensure the panel itself is properly centered
                    margin: '0 auto',
                    // Remove absolute positioning that would break centering
                    top: 'auto',
                    left: 'auto',
                    transform: 'none',
                }
            },
            profileContainer: {
                style: {
                    position: 'absolute',
                    top: profileTop,
                    left: profileLeft,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    zIndex: 10,
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateX(-50px)', // Start off-screen for animation
                }
            },
            buttonStackContainer: {
                style: {
                    position: 'absolute',
                    top: buttonStackTop,
                    right: buttonStackRight,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: buttonStackGap,
                    zIndex: 100, // Higher z-index to ensure buttons are above content
                    alignItems: 'flex-end',
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateX(50px)', // Start off-screen for animation
                }
            },
            contentContainer: {
                className: 'content-container',
                style: {
                    width: '100%',
                    marginTop: contentTopMargin,
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateY(30px)', // Start below for animation
                    position: 'relative',
                    zIndex: 5 // Lower z-index than buttons
                }
            },
            profilePhoto: {
                style: {
                    width: isMobile ? '45px' : '60px',
                    height: isMobile ? '45px' : '60px',
                    borderRadius: '50%',
                    border: '2px solid #57b3c0',
                    objectFit: 'cover',
                    flexShrink: 0,
                }
            },
            profilePhotoPlaceholder: {
                style: {
                    width: isMobile ? '45px' : '60px',
                    height: isMobile ? '45px' : '60px',
                    borderRadius: '50%',
                    backgroundColor: '#57b3c0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '18px' : '24px',
                    flexShrink: 0,
                }
            },
            userInfo: {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                }
            },
            userName: {
                style: {
                    margin: '0',
                    fontSize: userNameFontSize,
                    color: '#a7d3d8',
                    fontWeight: '500',
                }
            },
            userEmail: {
                style: {
                    margin: '2px 0 0 0',
                    fontSize: userEmailFontSize,
                    color: '#7a9a9e',
                }
            },
            // Button styles
            logoutButton: {
                className: 'nav-button logout-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    color: '#ff6347',
                    border: '1px solid rgba(255, 99, 71, 0.4)'
                }
            },
            dashboardButton: {
                className: 'nav-button dashboard-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(142, 68, 173, 0.2)',
                    color: '#8e44ad',
                    border: '1px solid rgba(142, 68, 173, 0.4)'
                }
            },
            homeButton: {
                className: 'nav-button home-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(87, 179, 192, 0.2)',
                    color: '#57b3c0',
                    border: '1px solid rgba(87, 179, 192, 0.4)',
                    textDecoration: 'none'
                }
            },
            googleButton: {
                className: 'nav-button google-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'white',
                    color: '#444',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    width: isMobile ? '240px' : '280px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    margin: '0 auto'
                }
            },
            // Content styles
            contentHeading: {
                style: {
                    fontSize: headingFontSize,
                    marginBottom: isMobile ? '15px' : '20px',
                    color: '#57b3c0',
                    fontWeight: 'bold',
                }
            },
            contentText: {
                style: {
                    fontSize: textFontSize,
                    marginBottom: isMobile ? '15px' : '20px',
                    color: '#c0d0d3',
                    lineHeight: '1.6',
                }
            },
            contentSection: {
                style: {
                    backgroundColor: 'rgba(87, 179, 192, 0.05)',
                    padding: isMobile ? '15px' : '20px',
                    borderRadius: '8px',
                    marginBottom: isMobile ? '15px' : '20px',
                }
            },
        };
    };

    // Animation helper
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
        // Intro text
        const loremIpsumText = "Welcome to Mountain West. This platform helps you search, analyze, and manage job opportunities effectively. Sign in to access the full suite of tools and features.";

        // Don't proceed if there's already an overlay
        if (overlayRef.current || document.querySelector('.about-overlay')) return;

        const styles = getStyles();
        const isMobile = window.innerWidth <= 768;

        try {
            // Create Overlay with improved positioning
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            // Create Panel with fixed positioning
            const panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'about-panel';
            Object.assign(panel.style, styles.panel.style);

            // Clear any existing panel styles that might interfere
            if (window.getComputedStyle(document.body).overflow === 'hidden') {
                // Body is already set up for flex centering
                console.log("Body has correct overflow setting");
            } else {
                // Ensure body is prepared for centering
                document.body.style.overflow = 'hidden';
                document.body.style.display = 'flex';
                document.body.style.alignItems = 'center';
                document.body.style.justifyContent = 'center';
                document.body.style.height = '100vh';
                document.body.style.margin = '0';
                document.body.style.padding = '0';
            }

            // UI content based on login status
            if (isLoggedIn && userData) {
                // --- LOGGED IN UI ---

                // Button stack (top-right)
                const buttonStackContainer = document.createElement('div');
                buttonStackContainer.id = 'button-stack';
                Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);

                // Create buttons array for sorting by priority
                const buttonsConfig = [
                    {
                        id: 'logout-button',
                        text: 'Logout',
                        style: styles.logoutButton.style,
                        className: styles.logoutButton.className,
                        handler: handleLogout,
                        priority: 1
                    },
                    {
                        id: 'dashboard-button',
                        text: 'Go to Dashboard',
                        style: styles.dashboardButton.style,
                        className: styles.dashboardButton.className,
                        handler: handleNavigateToDashboard,
                        priority: 2
                    },
                    {
                        id: 'home-button',
                        text: 'Close',
                        style: styles.homeButton.style,
                        className: styles.homeButton.className,
                        handler: handleNavigateToHome,
                        priority: 3
                    }
                ];

                // Sort buttons by priority
                buttonsConfig.sort((a, b) => a.priority - b.priority);

                // Create and add buttons in sorted order
                buttonsConfig.forEach(config => {
                    const button = document.createElement('button');
                    button.id = config.id;
                    button.className = config.className;
                    Object.assign(button.style, config.style);
                    button.textContent = config.text;
                    button.addEventListener('click', config.handler);
                    buttonStackContainer.appendChild(button);
                });

                panel.appendChild(buttonStackContainer);

                // Profile container (top-left)
                const profileContainer = document.createElement('div');
                profileContainer.id = 'profile-container';
                Object.assign(profileContainer.style, styles.profileContainer.style);

                const profilePhotoEl = document.createElement(userData.picture ? 'img' : 'div');
                if (userData.picture) {
                    profilePhotoEl.src = userData.picture;
                    profilePhotoEl.alt = "Profile";
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

                userInfoDiv.appendChild(userNameEl);
                userInfoDiv.appendChild(userEmailEl);
                profileContainer.appendChild(userInfoDiv);
                panel.appendChild(profileContainer);

                // Main content area
                const contentContainer = document.createElement('div');
                contentContainer.id = 'content-container';
                contentContainer.className = styles.contentContainer.className;
                Object.assign(contentContainer.style, styles.contentContainer.style);

                // Welcome heading
                const contentHeading = document.createElement('h2');
                Object.assign(contentHeading.style, styles.contentHeading.style);
                contentHeading.textContent = "Welcome to Mountain West";

                // Welcome content section
                const contentSectionDiv = document.createElement('div');
                Object.assign(contentSectionDiv.style, styles.contentSection.style);

                const welcomeText = document.createElement('p');
                Object.assign(welcomeText.style, styles.contentText.style);
                welcomeText.textContent = `Welcome, ${userData.name || 'User'}! You're now signed in and can access all features of the Mountain West platform. Use the buttons above to navigate to different sections.`;

                contentSectionDiv.appendChild(welcomeText);
                contentContainer.appendChild(contentHeading);
                contentContainer.appendChild(contentSectionDiv);
                panel.appendChild(contentContainer);

            } else {
                // --- NOT LOGGED IN UI ---

                // Panel title
                const panelHeader = document.createElement('div');
                panelHeader.className = 'panel-header';
                panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 45px;">Mountain West</h2>';
                panel.appendChild(panelHeader);

                // Header
                const headerDiv = document.createElement('div');
                headerDiv.className = 'header-in-panel';
                headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 55px;"></h1></header>`;
                panel.appendChild(headerDiv);

                // Content area
                const contentContainer = document.createElement('div');
                contentContainer.id = 'content-container';
                contentContainer.className = styles.contentContainer.className;
                Object.assign(contentContainer.style, styles.contentContainer.style);

                // Introduction text
                const introTextContainer = document.createElement('div');
                Object.assign(introTextContainer.style, {
                    padding: '30px',
                    marginTop: '-40px', // Shift text up
                    display: 'flex',
                    flexDirection: 'column'
                });

                const introText = document.createElement('p');
                Object.assign(introText.style, {
                    fontSize: isMobile ? '16px' : '24px',
                    lineHeight: '1.5',
                    marginBottom: '40px',
                    color: '#a7d3d8',
                    textAlign: 'center'
                });
                introText.textContent = loremIpsumText;
                introTextContainer.appendChild(introText);

                // Google button container
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.width = isMobile ? '240px' : '280px';
                googleButtonContainer.style.margin = '0 auto';
                googleButtonContainer.style.position = 'relative';
                googleButtonContainer.style.zIndex = '1000';

                // Custom Google sign-in button (fallback if native one fails)
                const customGoogleButton = document.createElement('button');
                customGoogleButton.id = 'custom-google-login-button';
                Object.assign(customGoogleButton.style, styles.googleButton.style);

                // Google logo
                const googleLogo = document.createElement('img');
                googleLogo.src = "https://developers.google.com/identity/images/g-logo.png";
                googleLogo.alt = "Google";
                googleLogo.style.width = "20px";
                googleLogo.style.height = "20px";

                customGoogleButton.appendChild(googleLogo);
                customGoogleButton.appendChild(document.createTextNode("Sign in with Google"));
                customGoogleButton.addEventListener('click', handleGoogleButtonClick);
                customGoogleButton.addEventListener('mouseenter', () => {
                    customGoogleButton.style.backgroundColor = '#f8f8f8';
                    customGoogleButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                });
                customGoogleButton.addEventListener('mouseleave', () => {
                    customGoogleButton.style.backgroundColor = 'white';
                    customGoogleButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                });

                // Add button to container
                googleButtonContainer.appendChild(customGoogleButton);
                introTextContainer.appendChild(googleButtonContainer);
                contentContainer.appendChild(introTextContainer);
                panel.appendChild(contentContainer);

                // Add home button at bottom
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.position = 'absolute';
                homeButtonContainer.style.bottom = '40px';
                homeButtonContainer.style.left = '0';
                homeButtonContainer.style.width = '100%';
                homeButtonContainer.style.display = 'flex';
                homeButtonContainer.style.justifyContent = 'center';

                const homeButton = document.createElement('button');
                homeButton.id = 'home-button';
                homeButton.className = styles.homeButton.className;
                Object.assign(homeButton.style, styles.homeButton.style);
                homeButton.textContent = 'Back to Home';
                homeButton.addEventListener('click', handleNavigateToHome);
                homeButton.addEventListener('mouseenter', () => {
                    homeButton.style.transform = 'scale(1.05)';
                    homeButton.style.backgroundColor = 'rgba(87, 179, 192, 0.3)';
                });
                homeButton.addEventListener('mouseleave', () => {
                    homeButton.style.transform = 'scale(1)';
                    homeButton.style.backgroundColor = 'rgba(87, 179, 192, 0.2)';
                });

                homeButtonContainer.appendChild(homeButton);
                panel.appendChild(homeButtonContainer);
            }

            // --- IMPORTANT: APPEND TO BODY AND ENSURE PROPER CENTERING ---
            // First, remove any existing panels or overlays
            const existingOverlays = document.querySelectorAll('.about-overlay, .ui-overlay');
            existingOverlays.forEach(el => {
                if (el !== overlay) el.parentNode?.removeChild(el);
            });

            // Then append the new overlay
            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            // Force panel to center by explicitly setting its position
            setTimeout(() => {
                // Get viewport dimensions
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Get panel dimensions
                const panelWidth = panel.offsetWidth;
                const panelHeight = panel.offsetHeight;

                // Calculate centered position if needed
                if (overlay.style.display !== 'flex') {
                    // Only adjust if flex centering isn't working
                    panel.style.position = 'fixed';
                    panel.style.top = `${Math.max(0, (viewportHeight - panelHeight) / 2)}px`;
                    panel.style.left = `${Math.max(0, (viewportWidth - panelWidth) / 2)}px`;
                    panel.style.margin = '0';
                    panel.style.transform = 'none';
                }

                // Debug centering
                console.log(`Panel dimensions: ${panelWidth}x${panelHeight}`);
                console.log(`Viewport dimensions: ${viewportWidth}x${viewportHeight}`);
                console.log(`Panel position: ${panel.style.top}, ${panel.style.left}`);
            }, 0);

            // Apply animations
            setTimeout(() => {
                // Panel fade in
                if (window.framerMotion && window.framerMotion.animate) {
                    // If Framer Motion is available (imported via CDN or context)
                    window.framerMotion.animate('#about-panel', { opacity: 1 }, { duration: 0.5 });

                    if (isLoggedIn) {
                        window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                        window.framerMotion.animate('#button-stack', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    }

                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                } else {
                    // Fallback to simple CSS transitions
                    animateElement(panel, { opacity: '1' }, 0);

                    if (isLoggedIn) {
                        const profileContainer = document.getElementById('profile-container');
                        const buttonStack = document.getElementById('button-stack');

                        if (profileContainer) animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                        if (buttonStack) animateElement(buttonStack, { opacity: '1', transform: 'translateX(0)' }, 200);
                    }

                    const contentContainer = document.getElementById('content-container');
                    if (contentContainer) animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                }

                // Add hover effects to all buttons
                const buttons = document.querySelectorAll('#button-stack button, #home-button');
                buttons.forEach(button => {
                    const originalBackgroundColor = button.style.backgroundColor;
                    button.addEventListener('mouseenter', () => {
                        button.style.transform = 'scale(1.05)';

                        // Enhance the button's background color on hover
                        if (button.id === 'logout-button') {
                            button.style.backgroundColor = 'rgba(255, 99, 71, 0.3)';
                        } else if (button.id === 'dashboard-button') {
                            button.style.backgroundColor = 'rgba(142, 68, 173, 0.3)';
                        } else if (button.id === 'home-button') {
                            button.style.backgroundColor = 'rgba(87, 179, 192, 0.3)';
                        }
                    });

                    button.addEventListener('mouseleave', () => {
                        button.style.transform = 'scale(1)';
                        button.style.backgroundColor = originalBackgroundColor;
                    });
                });

                // Enable Google Sign-In if auth is loaded (for non-logged in view)
                if (!isLoggedIn && googleAuthLoaded && window.google?.accounts?.id) {
                    // Try to render the official Google Sign-In button
                    try {
                        const googleButtonContainer = document.getElementById('google-button-container');
                        if (googleButtonContainer) {
                            // First, hide the custom button
                            const customButton = document.getElementById('custom-google-login-button');
                            if (customButton) customButton.style.display = 'none';

                            // Render the official button
                            window.google.accounts.id.renderButton(googleButtonContainer, {
                                type: 'standard',
                                theme: 'outline',
                                size: 'large',
                                text: 'signin_with',
                                shape: 'rectangular',
                                logo_alignment: 'left',
                                width: isMobile ? '240' : '280'
                            });

                            console.log('Google Sign-In button rendered successfully');
                        }
                    } catch (error) {
                        console.error('Failed to render Google Sign-In button:', error);
                        // Keep custom button visible if official button fails
                        const customButton = document.getElementById('custom-google-login-button');
                        if (customButton) customButton.style.display = 'flex';
                    }
                }

                // One final check to ensure proper centering
                setTimeout(() => {
                    // Check if panel appears properly centered
                    const panelRect = panel.getBoundingClientRect();
                    const viewportCenterX = window.innerWidth / 2;
                    const viewportCenterY = window.innerHeight / 2;
                    const panelCenterX = panelRect.left + panelRect.width / 2;
                    const panelCenterY = panelRect.top + panelRect.height / 2;

                    // Check if panel is significantly off-center
                    const xOffset = Math.abs(panelCenterX - viewportCenterX);
                    const yOffset = Math.abs(panelCenterY - viewportCenterY);

                    if (xOffset > 50 || yOffset > 50) {
                        // Panel is not centered properly, apply direct positioning
                        console.log("Panel not centered correctly, applying fixed position");
                        panel.style.position = 'fixed';
                        panel.style.top = '50%';
                        panel.style.left = '50%';
                        panel.style.transform = 'translate(-50%, -50%)';
                        panel.style.margin = '0';
                    }
                }, 100);
            }, 100);

        } catch (error) {
            console.error("About: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
                overlayRef.current = null;
            }
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

        // Ensure Job Search link is visible based on login state
        const jobSearchLink = document.querySelector('.nav-item a[href*="mountainwestjobsearch.com"]');
        if (jobSearchLink) {
            jobSearchLink.style.display = isLoggedIn ? 'flex' : 'none';
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
            } else {
                const fallbackOverlay = document.querySelector('.about-overlay');
                if (fallbackOverlay) {
                    fallbackOverlay.remove();
                }
            }

            overlayRef.current = null;
        };
    }, [
        isLoggedIn,
        userData,
        googleAuthLoaded,
        navigate,
        handleLogout,
        handleNavigateToHome,
        handleNavigateToDashboard,
        handleGoogleButtonClick
    ]);

    // Component doesn't need to render any JSX as UI is created via DOM
    return null;
}