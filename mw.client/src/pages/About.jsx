/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 19 - Fixed Google OAuth implementation)
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
    const googleButtonContainerRef = useRef(null);

    // Google Client ID
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // *** CONFIGURABLE CONTENT POSITIONING VARIABLES ***
    // Adjust these values to control the vertical positioning of content sections
    const CONFIG = {
        desktop: {
            // Controls content container top margin in desktop view
            contentContainerTopMargin: '-130px',
            // Controls logged-out content section max height in desktop view
            contentMaxHeight: 'calc(100% - 200px)',
            // Controls position of button stack in desktop view
            buttonStackTopPosition: '85%',
            // Controls top position for the content section after login
            loggedInContentTopPosition: '-70px',
            // Controls top position for user info section after login
            userInfoTopPosition: '-120px',
            // Controls the height of the content section (expanded)
            loggedInContentHeight: 'calc(100% - 180px)'
        },
        mobile: {
            // Controls content container top margin in mobile view
            contentContainerTopMargin: '-65px',
            // Controls logged-out content section max height in mobile view 
            contentMaxHeight: 'calc(100vh - 250px)',
            // Controls position of button stack in mobile view
            buttonStackBottomPosition: '100px',
            // Controls top margin for the button area
            buttonStackTopMargin: '20px'
        }
    };
    // *** END CONFIGURABLE CONTENT POSITIONING VARIABLES ***

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
        // Define the global callback function - FIXED: Simplified implementation
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

        // FIXED: Improved script loading logic
        const loadGoogleScript = () => {
            // Load Google script if it doesn't exist
            if (!document.getElementById('google-signin-script')) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.id = 'google-signin-script';
                script.async = true;
                script.defer = true;

                // FIXED: Added better error handling with timeout
                let timeoutId = null;

                script.onload = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script loaded successfully.');
                };

                script.onerror = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    console.error('Failed to load Google Sign-In script.');
                };

                // Set a timeout to detect if Google API fails to initialize
                timeoutId = setTimeout(() => {
                    if (!window.google?.accounts?.id) {
                        console.warn('Google API failed to initialize after timeout');
                    }
                }, 5000);

                document.head.appendChild(script);
            } else if (window.google?.accounts?.id) {
                // Script already exists and API is ready
                if (!googleAuthLoaded) {
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already existed and API is ready.');
                }
            } else {
                // Script exists but API might still be initializing
                if (!googleAuthLoaded) {
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script exists, awaiting API initialization.');
                }
            }
        };

        // Load the script
        loadGoogleScript();

        // Cleanup global callback and timeout ref
        return () => {
            delete window.handleGoogleSignIn;
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }

            // Remove any Google Sign-In related DOM elements
            const customStyles = document.getElementById('google-signin-custom-styles');
            if (customStyles && document.head.contains(customStyles)) {
                document.head.removeChild(customStyles);
            }

            // Clean up any Google container elements
            const googleContainers = document.querySelectorAll('[id^="credential_picker_container"]');
            googleContainers.forEach(container => {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            });

            // Remove any mobile overlay
            const mobileOverlay = document.getElementById('mobile-google-signin-overlay');
            if (mobileOverlay && document.body.contains(mobileOverlay)) {
                document.body.removeChild(mobileOverlay);
            }

            // Remove dedicated Google sign-in container
            const dedicatedGoogleContainer = document.getElementById('dedicated-google-signin-container');
            if (dedicatedGoogleContainer && document.body.contains(dedicatedGoogleContainer)) {
                document.body.removeChild(dedicatedGoogleContainer);
            }
        };
    }, []); // Empty dependency array ensures this runs only once

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

    // FIXED: Improved Google Sign-In container creation
    const createDedicatedGoogleSignInContainer = useCallback(() => {
        // Remove any existing container first
        const existingContainer = document.getElementById('dedicated-google-signin-container');
        if (existingContainer) {
            document.body.removeChild(existingContainer);
        }

        // Create a clean slate container positioned above all other content
        const container = document.createElement('div');
        container.id = 'dedicated-google-signin-container';

        // Style it to cover the entire viewport and center its content
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent backdrop
            zIndex: '2147483647', // Maximum z-index (2^31 - 1)
            pointerEvents: 'auto'
        });

        // Create an inner container for the Google Sign-In button/iframe
        const innerContainer = document.createElement('div');
        innerContainer.id = 'google-signin-inner-container';

        // Style the inner container
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

        // Add a title
        const title = document.createElement('h3');
        title.textContent = 'Sign in with Google';
        title.style.marginBottom = '20px';
        title.style.color = '#333';
        innerContainer.appendChild(title);

        // Add a container for the Google button
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-button-element-container';
        innerContainer.appendChild(buttonContainer);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '8px 16px';
        closeButton.style.border = '1px solid #ccc';
        closeButton.style.borderRadius = '4px';
        closeButton.style.backgroundColor = '#f2f2f2';
        closeButton.style.cursor = 'pointer';

        closeButton.addEventListener('click', () => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
            isAttemptingLogin.current = false;
        });

        innerContainer.appendChild(closeButton);
        container.appendChild(innerContainer);
        document.body.appendChild(container);

        return buttonContainer;
    }, []);

    // FIXED: Improved Google Sign-In initialization
    const initializeGoogleSignIn = useCallback(() => {
        if (!window.google?.accounts?.id) {
            console.error("Google Sign-In API not available");
            return false;
        }

        try {
            const buttonContainer = createDedicatedGoogleSignInContainer();

            // Initialize Google Sign-In with improved error handling
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        // First clean up the container
                        const container = document.getElementById('dedicated-google-signin-container');
                        if (container && document.body.contains(container)) {
                            document.body.removeChild(container);
                        }

                        // Then process the sign-in response
                        window.handleGoogleSignIn(response);
                    },
                    cancel_on_tap_outside: false,
                    context: 'signin'
                });
            } catch (initError) {
                console.error("Error initializing Google Sign-In:", initError);
                return false;
            }

            // Render the button in our container
            try {
                window.google.accounts.id.renderButton(
                    buttonContainer,
                    {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        text: 'signin_with',
                        shape: 'rectangular',
                        logo_alignment: 'center',
                        width: 250
                    }
                );
            } catch (renderError) {
                console.error("Error rendering Google Sign-In button:", renderError);
                return false;
            }

            // Also prompt with the One Tap UI in our container with error handling
            try {
                window.google.accounts.id.prompt((notification) => {
                    console.log("Google Sign-In prompt notification:", notification);
                });
            } catch (promptError) {
                console.error("Error with Google Sign-In prompt:", promptError);
                // Continue even if prompt fails - button should still work
            }

            return true;
        } catch (error) {
            console.error("Error in overall Google Sign-In flow:", error);
            return false;
        }
    }, [GOOGLE_CLIENT_ID, createDedicatedGoogleSignInContainer]);

    // FIXED: Improved Google Sign-In button click handler
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

        // FIXED: First check if Google API is available
        if (window.google?.accounts?.id) {
            console.log("GSI library ready. Initializing sign-in flow...");
            isAttemptingLogin.current = true;
            initializeGoogleSignIn();
        } else {
            console.warn("GSI library not ready. Scheduling retry in 1500ms.");
            isAttemptingLogin.current = true;

            // FIXED: Increased retry timeout and improved error handling
            retryTimeoutRef.current = setTimeout(() => {
                console.log("Executing GSI retry check...");
                if (window.google?.accounts?.id) {
                    console.log("GSI library ready on retry check.");
                    initializeGoogleSignIn();
                } else {
                    console.error("GSI library STILL not ready after retry.");

                    // Show more user-friendly error message
                    const container = document.getElementById('dedicated-google-signin-container');
                    if (container) {
                        const messageDiv = document.createElement('div');
                        messageDiv.style.color = '#ff6347';
                        messageDiv.style.marginTop = '15px';
                        messageDiv.style.textAlign = 'center';
                        messageDiv.textContent = 'Google Sign-In is not available right now. Please try again later.';

                        const innerContainer = document.getElementById('google-signin-inner-container');
                        if (innerContainer) {
                            innerContainer.appendChild(messageDiv);
                        }
                    } else {
                        alert('Google Sign-In is not available right now. Please try again later.');
                    }

                    isAttemptingLogin.current = false;
                }
                retryTimeoutRef.current = null;
            }, 1500); // Increased from 500ms to 1500ms for better reliability
        }
    }, [googleAuthLoaded, initializeGoogleSignIn]);

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

        // Make the side menu "Start Job Search" button visible when logged in
        const jobSearchLink = document.querySelector('.nav-item a[href*="mountainwestjobsearch.com"]');
        if (jobSearchLink) {
            // Change display style based on login state - show when logged in, hide when not
            jobSearchLink.style.display = isLoggedIn ? 'flex' : 'none';
        }

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
                // ****** DESKTOP LOGGED IN UI WITH CONFIGURABLE POSITION VARIABLES ******
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.position = 'absolute'; actionButtons.style.top = '20px'; actionButtons.style.right = '20px';
                actionButtons.style.display = 'flex'; actionButtons.style.gap = '15px'; actionButtons.style.zIndex = '20';
                actionButtons.innerHTML = `
                    <button id="logout-button" class="nav-button" style="font-size: 30px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 10px 20px; border-radius: 6px;">Logout</button>
                    <button id="template-button" class="nav-button chat-button" style="font-size: 30px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 10px 20px; border-radius: 6px;">Dashboard</button>
                `;
                panel.appendChild(actionButtons);

                const profileContainer = document.createElement('div');
                profileContainer.style.display = 'flex'; profileContainer.style.flexDirection = 'column'; profileContainer.style.alignItems = 'flex-start';
                profileContainer.style.padding = '30px';
                // Using configurable position for user info
                profileContainer.style.marginTop = CONFIG.desktop.userInfoTopPosition;
                profileContainer.style.marginBottom = '20px';
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
                contentContainer.style.overflow = 'auto';
                // UPDATED: Now using the configurable height variable
                contentContainer.style.maxHeight = CONFIG.desktop.loggedInContentHeight;
                contentContainer.style.clear = 'both';
                // Using configurable position for content
                contentContainer.style.marginTop = CONFIG.desktop.loggedInContentTopPosition;
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

                // REMOVED: Job Search and Template buttons are no longer added here

            } else { // Desktop Logged Out
                // *** SECTION WITH CONFIGURABLE CONTENT POSITIONING - DESKTOP VIEW ***
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '30px';
                // Using the configurable top margin
                contentContainer.style.marginTop = CONFIG.desktop.contentContainerTopMargin;
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';
                // Using the configurable max height
                contentContainer.style.maxHeight = CONFIG.desktop.contentMaxHeight;
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // **Desktop_NoLogin_Buttons** 
                // Configuration for button container on desktop
                const leftButtonStack = document.createElement('div');
                leftButtonStack.style.position = 'absolute';
                leftButtonStack.style.left = '50px'; // Attach to left side
                // Using the configurable top position
                leftButtonStack.style.top = CONFIG.desktop.buttonStackTopPosition;
                leftButtonStack.style.transform = 'translateY(-50%)';
                leftButtonStack.style.display = 'flex';
                leftButtonStack.style.flexDirection = 'column'; // Stack vertically
                leftButtonStack.style.gap = '20px'; // Space between buttons
                leftButtonStack.style.zIndex = '10';

                // Google login button configuration (desktop)
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container';
                googleButtonContainer.style.width = '280px';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 24px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 24px; height: 24px;"/>
                        Sign in with Google
                    </button>
                `;
                leftButtonStack.appendChild(googleButtonContainer);
                googleButtonContainerRef.current = googleButtonContainer;

                // MODIFIED: Made Back to Start button invisible but keeping it in DOM
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.width = '280px';
                homeButtonContainer.style.top = '92px';
                homeButtonContainer.style.display = 'none'; // Changed to none to make it invisible
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: 100%; font-size: 24px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 20px; border-radius: 6px;">Back to Start</button>
                `;
                leftButtonStack.appendChild(homeButtonContainer);

                // Add button stack to panel
                panel.appendChild(leftButtonStack);
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
                actionButtons.style.position = 'absolute';
                actionButtons.style.top = '10px';
                actionButtons.style.right = '10px';
                actionButtons.style.display = 'flex';
                actionButtons.style.flexDirection = 'column';
                actionButtons.style.gap = '8px';
                actionButtons.style.zIndex = '20';
                // MODIFIED: Changed "Open Live Chat" to "Dashboard" in mobile view
                actionButtons.innerHTML = `
                    <button id="logout-button" class="nav-button" style="font-size: 14px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 6px 12px; border-radius: 4px;">Logout</button>
                    <button id="template-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 6px 12px; border-radius: 4px;">Dashboard</button>
                `;
                panel.appendChild(actionButtons);

                // User profile section (fixed position at top 20%)
                const profileSection = document.createElement('div');
                profileSection.style.position = 'absolute';
                profileSection.style.top = '20%';
                profileSection.style.left = '0';
                profileSection.style.width = '100%';
                profileSection.style.display = 'flex';
                profileSection.style.flexDirection = 'column';
                profileSection.style.alignItems = 'center';
                profileSection.style.padding = '0 15px';
                profileSection.style.zIndex = '11';
                profileSection.style.backgroundColor = 'rgba(13, 20, 24, 0.7)'; // Match panel background for clean overlap prevention

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
                userInfoDiv.style.width = '100%';
                userInfoDiv.style.textAlign = 'center';
                userInfoDiv.style.marginBottom = '20px';
                userInfoDiv.innerHTML = `
                    <h3 style="margin: 0; font-size: 18px; color: #57b3c0;">Welcome, ${userData.name || 'User'}!</h3>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #a7d3d8;">${userData.email || 'Not available'}</p>
                `;
                profileSection.appendChild(userInfoDiv);
                panel.appendChild(profileSection);

                // Calculate profile section height for proper content offset
                const profileSectionHeight = 120; // Approximate height based on content (70px photo + 15px margin + 35px text)

              // Content container (placed below profile with calculated offset)
                const contentContainer = document.createElement('div');
                contentContainer.style.position = 'absolute';
                contentContainer.style.top = 'calc(20% + ' + profileSectionHeight + 'px)'; // Position below profile section
                contentContainer.style.left = '0';
                contentContainer.style.width = '100%';
                contentContainer.style.height = 'calc(80% - ' + profileSectionHeight + 'px)'; // Adjusted height
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto';
                contentContainer.style.padding = '15px 15px 70px 15px'; // Add padding bottom for template button
                contentContainer.style.zIndex = '10';
                contentContainer.style.boxSizing = 'border-box';

                // Content text
                contentContainer.innerHTML = `
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
                panel.appendChild(contentContainer);

                // REMOVED: Job Search and Template buttons are no longer added here for mobile view

            } else { // Mobile Logged Out
                // *** SECTION WITH CONFIGURABLE CONTENT POSITIONING - MOBILE VIEW ***
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '15px';
                // Using the configurable top margin
                contentContainer.style.marginTop = CONFIG.mobile.contentContainerTopMargin;
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.width = 'calc(100% - 30px)';
                contentContainer.style.paddingBottom = '120px';
                contentContainer.style.overflowY = 'auto';
                // Using the configurable max height
                contentContainer.style.maxHeight = CONFIG.mobile.contentMaxHeight;
                contentContainer.innerHTML = `
                    <p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope.
                    </p>
                `;
                panel.appendChild(contentContainer);

                // **** MOBILE BUTTON AREA WITH CONFIGURABLE POSITIONING ****
                // Configuration for button container on mobile
                const mobileButtonArea = document.createElement('div');
                mobileButtonArea.style.position = 'absolute';
                // Using the configurable bottom position
                mobileButtonArea.style.bottom = CONFIG.mobile.buttonStackBottomPosition;
                // Apply the configurable top margin
                mobileButtonArea.style.marginTop = CONFIG.mobile.buttonStackTopMargin;
                mobileButtonArea.style.left = '0';
                mobileButtonArea.style.width = '100%';
                mobileButtonArea.style.display = 'flex';
                mobileButtonArea.style.flexDirection = 'column';
                mobileButtonArea.style.alignItems = 'center';
                mobileButtonArea.style.gap = '15px';
                mobileButtonArea.style.zIndex = '10';

                // Google login button configuration (mobile) - UPDATED WITH UNIQUE ID
                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container-mobile'; // Unique ID for mobile container
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button-mobile" style="background-color: #4285F4; color: white; padding: 10px 18px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: auto;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                        Sign in with Google
                    </button>
                `;
                mobileButtonArea.appendChild(googleButtonContainer);
                googleButtonContainerRef.current = googleButtonContainer;

                // MODIFIED: Made Back to Start button invisible but keeping in DOM for mobile view
                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.marginTop = '45px';
                homeButtonContainer.style.display = 'none'; // Changed to none to make it invisible
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
            // MODIFIED: Changed chat button reference to template button (for Dashboard)
            const templateButton = document.getElementById('template-button');
            if (templateButton) templateButton.addEventListener('click', () => navigate('/loggedintemplate'));

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) logoutButton.addEventListener('click', handleLogout);
        } else {
            // Desktop Google button
            const desktopGoogleButton = document.getElementById('google-login-button');
            if (desktopGoogleButton) desktopGoogleButton.addEventListener('click', handleGoogleButtonClick);

            // Mobile Google button - separate handler with explicit event prevention
            const mobileGoogleButton = document.getElementById('google-login-button-mobile');
            if (mobileGoogleButton) {
                mobileGoogleButton.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent any default action
                    e.stopPropagation(); // Stop event bubbling
                    console.log("Mobile Google button clicked!");
                    handleGoogleButtonClick(); // Call the same handler function
                });
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

            // Remove main UI overlay
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }

            // Remove dedicated Google container if exists
            const dedicatedGoogleContainer = document.getElementById('dedicated-google-signin-container');
            if (dedicatedGoogleContainer && document.body.contains(dedicatedGoogleContainer)) {
                document.body.removeChild(dedicatedGoogleContainer);
            }

            // Remove backdrop if it exists
            const backdrop = document.getElementById('google-signin-backdrop');
            if (backdrop && document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }

            // Remove mobile overlay if it exists
            const mobileOverlay = document.getElementById('mobile-google-signin-overlay');
            if (mobileOverlay && document.body.contains(mobileOverlay)) {
                document.body.removeChild(mobileOverlay);
            }

            // Remove injected styles
            const customStyles = document.getElementById('google-signin-custom-styles');
            if (customStyles && document.head.contains(customStyles)) {
                document.head.removeChild(customStyles);
            }
        };
        // Dependencies for the main UI effect
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded, initializeGoogleSignIn]);


    // Return null as UI is created via DOM manipulation
    return null;
}