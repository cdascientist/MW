/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 20 - Verified scroll logic, Fixed mobile button z-index)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css"; // Ensure this CSS doesn't conflict, especially with overflow or z-index

export default function About() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [googleAuthLoaded, setGoogleAuthLoaded] = useState(false);
    const isAttemptingLogin = useRef(false);
    const retryTimeoutRef = useRef(null);
    // Removed googleButtonContainerRef as it wasn't strictly necessary with ID selection

    // Google Client ID
    const GOOGLE_CLIENT_ID = "7074654684-866fnk2dp7c23e54nt35o5o3uvlm6fbl.apps.googleusercontent.com";

    // *** CONFIGURABLE CONTENT POSITIONING VARIABLES ***
    const CONFIG = {
        desktop: {
            contentContainerTopMargin: '-130px',
            // Ensures scrollbar appears if content exceeds this height
            contentMaxHeight: 'calc(100% - 200px)',
            buttonStackTopPosition: '85%',
            loggedInContentTopPosition: '-70px',
            userInfoTopPosition: '-120px',
            // Controls the height of the logged-in content section
            loggedInContentHeight: 'calc(100% - 180px)'
        },
        mobile: {
            contentContainerTopMargin: '-65px',
            // Ensures scrollbar appears if content exceeds this height
            contentMaxHeight: 'calc(100vh - 250px)', // Relative to viewport height minus estimated header/footer space
            buttonStackBottomPosition: '10%',
            // Added explicit top margin for spacing
            buttonStackTopMargin: '20px' // Adjusted for clarity, works with bottom positioning
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
        window.handleGoogleSignIn = (response) => {
            isAttemptingLogin.current = false;
            // Clean up the dedicated container immediately after response/cancel
            const container = document.getElementById('dedicated-google-signin-container');
            if (container && document.body.contains(container)) {
                try {
                    document.body.removeChild(container);
                } catch (e) {
                    console.warn("Error removing dedicated sign-in container:", e);
                }
            }

            if (response && response.credential) {
                console.log("Google Sign-In successful:", response);
                const decodedToken = decodeJwtResponse(response.credential);
                setUserData(decodedToken);
                setIsLoggedIn(true);
                localStorage.setItem('mw_isLoggedIn', 'true');
                localStorage.setItem('mw_userData', JSON.stringify(decodedToken));
            } else {
                console.warn('Google Sign-In failed, cancelled, or response missing credential.');
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
                    // Check immediately if API is ready after load
                    if (window.google?.accounts?.id) {
                        setGoogleAuthLoaded(true);
                        console.log('Google Sign-In script loaded successfully and API ready.');
                    } else {
                        // If not ready immediately, wait a bit more (rare case)
                        setTimeout(() => {
                            if (window.google?.accounts?.id) {
                                setGoogleAuthLoaded(true);
                                console.log('Google Sign-In API ready after short delay post-load.');
                            } else {
                                console.warn('Google API failed to initialize even after script load.');
                            }
                        }, 500);
                    }
                };

                script.onerror = () => {
                    if (timeoutId) clearTimeout(timeoutId);
                    console.error('Failed to load Google Sign-In script.');
                };

                timeoutId = setTimeout(() => {
                    if (!window.google?.accounts?.id && !googleAuthLoaded) { // Only warn if not already loaded
                        console.warn('Google API did not initialize within timeout');
                    }
                }, 5000);

                document.head.appendChild(script);
            } else if (window.google?.accounts?.id) {
                if (!googleAuthLoaded) {
                    setGoogleAuthLoaded(true);
                    console.log('Google Sign-In script already existed and API is ready.');
                }
            } else {
                console.log('Google Sign-In script exists, awaiting API initialization.');
                // Optional: Add a shorter timeout here too if needed
            }
        };

        loadGoogleScript();

        // Cleanup
        return () => {
            delete window.handleGoogleSignIn;
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            // Clean up any remaining Google Sign-In related DOM elements aggressively
            const googleContainers = document.querySelectorAll('[id^="credential_picker_container"], #dedicated-google-signin-container, #mobile-google-signin-overlay');
            googleContainers.forEach(container => {
                if (container.parentNode) {
                    try {
                        container.parentNode.removeChild(container);
                    } catch (e) { /* ignore */ }
                }
            });
            const customStyles = document.getElementById('google-signin-custom-styles');
            if (customStyles && document.head.contains(customStyles)) {
                document.head.removeChild(customStyles);
            }
        };
    }, [googleAuthLoaded]); // Rerun if googleAuthLoaded changes (though it should only go false -> true)

    // Logout handler
    const handleLogout = useCallback(() => {
        isAttemptingLogin.current = false;
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
            // Optional: Revoke token on Google's side (requires more setup if needed)
            // window.google.accounts.id.revoke(localStorage.getItem('user_email'), done => { ... });
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        // Potentially remove other related keys
        console.log('User logged out.');
    }, [setIsLoggedIn, setUserData]); // Dependencies are correct

    // Creates the dedicated modal/overlay for Google Sign-In
    const createDedicatedGoogleSignInContainer = useCallback(() => {
        const existingContainer = document.getElementById('dedicated-google-signin-container');
        if (existingContainer) {
            // Don't remove here, might be needed if called again quickly
            // Return the existing button container if it exists
            const btnElContainer = document.getElementById('google-button-element-container');
            if (btnElContainer) return btnElContainer;
            // If button container missing, recreate whole thing
            try { document.body.removeChild(existingContainer); } catch (e) { }
        }

        const container = document.createElement('div');
        container.id = 'dedicated-google-signin-container';
        Object.assign(container.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Slightly darker backdrop
            zIndex: '2147483647', pointerEvents: 'auto'
        });

        const innerContainer = document.createElement('div');
        innerContainer.id = 'google-signin-inner-container';
        Object.assign(innerContainer.style, {
            backgroundColor: 'white', padding: '30px', borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', minWidth: '300px', maxWidth: '90%'
        });

        const title = document.createElement('h3');
        title.textContent = 'Sign in with Google';
        Object.assign(title.style, { marginBottom: '20px', color: '#333', fontSize: '1.2em' });
        innerContainer.appendChild(title);

        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-button-element-container'; // Container for the *actual* Google button
        innerContainer.appendChild(buttonContainer);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        Object.assign(closeButton.style, {
            marginTop: '20px', padding: '8px 16px', border: '1px solid #ccc',
            borderRadius: '4px', backgroundColor: '#f2f2f2', cursor: 'pointer', fontSize: '0.9em'
        });

        closeButton.addEventListener('click', () => {
            // Explicitly cancel the One Tap UI if it's active
            if (window.google?.accounts?.id) {
                // Note: There isn't a direct public API to *cancel* the prompt programmatically once shown.
                // Closing the container is the primary action.
            }
            if (document.body.contains(container)) {
                try { document.body.removeChild(container); } catch (e) { }
            }
            isAttemptingLogin.current = false; // Allow trying again
        });

        innerContainer.appendChild(closeButton);
        container.appendChild(innerContainer);
        document.body.appendChild(container);

        return buttonContainer; // Return the element where Google will render its button
    }, []);

    // Initializes the Google Sign-In library and renders the button/prompt
    const initializeGoogleSignIn = useCallback(() => {
        console.log("Attempting to initialize Google Sign-In...");
        if (!window.google?.accounts?.id) {
            console.error("Google Sign-In API (google.accounts.id) is not available.");
            // Clean up potentially broken container if it exists
            const container = document.getElementById('dedicated-google-signin-container');
            if (container && document.body.contains(container)) {
                try { document.body.removeChild(container); } catch (e) { }
            }
            isAttemptingLogin.current = false;
            return false; // Indicate failure
        }

        try {
            // Ensure the container exists where Google will render its button
            const buttonRenderElement = createDedicatedGoogleSignInContainer();
            if (!buttonRenderElement) {
                console.error("Failed to create or find the Google button render element container.");
                isAttemptingLogin.current = false;
                return false;
            }

            // 1. Initialize the library
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: window.handleGoogleSignIn, // Use the globally defined handler
                    cancel_on_tap_outside: false, // Keep modal open if user clicks outside
                    context: 'signin',
                    // ux_mode: 'popup' // Alternative: Use popup flow instead of overlay/iframe
                });
                console.log("Google Sign-In initialized.");
            } catch (initError) {
                console.error("Error initializing Google Sign-In:", initError);
                isAttemptingLogin.current = false;
                // Clean up container on init error
                const container = document.getElementById('dedicated-google-signin-container');
                if (container && document.body.contains(container)) {
                    try { document.body.removeChild(container); } catch (e) { }
                }
                return false;
            }

            // 2. Render the Google Sign-In Button inside our container
            try {
                // Clear previous button first if re-initializing
                buttonRenderElement.innerHTML = '';
                window.google.accounts.id.renderButton(
                    buttonRenderElement, // The specific div inside our modal
                    {
                        type: 'standard', theme: 'outline', size: 'large',
                        text: 'signin_with', shape: 'rectangular', logo_alignment: 'center',
                        width: 250 // Adjust width as needed
                    }
                );
                console.log("Google Sign-In button rendered.");
            } catch (renderError) {
                console.error("Error rendering Google Sign-In button:", renderError);
                // Don't necessarily stop here, prompt might still work
            }

            // 3. Trigger the One Tap / Sign-in Prompt
            try {
                console.log("Attempting to display Google Sign-In prompt...");
                window.google.accounts.id.prompt((notification) => {
                    // This callback handles prompt lifecycle events (display, skip, dismiss)
                    console.log("Google Sign-In prompt notification:", notification.getNotDisplayedReason(), notification.getSkippedReason(), notification.isNotDisplayed(), notification.isSkippedMoment());
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Prompt wasn't shown (e.g., cooldown, manually disabled) or was skipped.
                        // Button is still available. User might need to click the rendered button.
                        // Optionally handle this case, e.g., by ensuring the modal is visible.
                        console.log("Google prompt was not displayed or was skipped.");
                    }
                    if (notification.isDismissedMoment()) {
                        console.log("Google prompt was dismissed by user.");
                        // If dismissed, ensure our main container is also removed
                        const container = document.getElementById('dedicated-google-signin-container');
                        if (container && document.body.contains(container)) {
                            try { document.body.removeChild(container); } catch (e) { }
                        }
                        isAttemptingLogin.current = false; // Allow trying again
                    }
                });
            } catch (promptError) {
                console.error("Error displaying Google Sign-In prompt:", promptError);
                // If prompt fails, the rendered button should still be the fallback.
            }

            return true; // Indicate success
        } catch (error) {
            console.error("Error in overall Google Sign-In initialization flow:", error);
            isAttemptingLogin.current = false;
            // Clean up container on general error
            const container = document.getElementById('dedicated-google-signin-container');
            if (container && document.body.contains(container)) {
                try { document.body.removeChild(container); } catch (e) { }
            }
            return false;
        }
    }, [GOOGLE_CLIENT_ID, createDedicatedGoogleSignInContainer]); // Dependencies are correct

    // Click handler for our *custom* "Sign in with Google" buttons
    const handleGoogleButtonClick = useCallback(() => {
        console.log("Custom Google Sign-In button clicked.");

        if (isAttemptingLogin.current) {
            console.log("Login attempt already in progress. Ignoring click.");
            return;
        }
        isAttemptingLogin.current = true; // Set flag immediately

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        if (window.google?.accounts?.id) {
            console.log("GSI library ready. Initializing sign-in flow...");
            if (!initializeGoogleSignIn()) {
                // Initialization failed, reset flag
                isAttemptingLogin.current = false;
                // Optionally show user feedback here
                alert("Could not start Google Sign-In. Please try again.");
            }
            // If initializeGoogleSignIn is successful, the flag remains true until callback/cancel
        } else {
            console.warn("GSI library not ready. Scheduling check/retry...");
            // Show immediate feedback that something is happening
            const tempContainer = createDedicatedGoogleSignInContainer(); // Show modal shell
            if (tempContainer) {
                const loadingMsg = document.createElement('p');
                loadingMsg.textContent = 'Loading Google Sign-In...';
                loadingMsg.style.marginTop = '15px';
                tempContainer.parentNode.insertBefore(loadingMsg, tempContainer.nextSibling); // Add after button container
            }

            retryTimeoutRef.current = setTimeout(() => {
                console.log("Executing GSI retry check...");
                if (window.google?.accounts?.id) {
                    console.log("GSI library ready on retry check.");
                    if (!initializeGoogleSignIn()) {
                        isAttemptingLogin.current = false;
                        alert("Could not start Google Sign-In after loading. Please try again.");
                    }
                } else {
                    console.error("GSI library STILL not ready after retry.");
                    const container = document.getElementById('dedicated-google-signin-container');
                    const innerContainer = document.getElementById('google-signin-inner-container');
                    if (innerContainer) {
                        // Remove loading message if present
                        const loadingMsgElement = Array.from(innerContainer.parentNode.children).find(el => el.textContent === 'Loading Google Sign-In...');
                        if (loadingMsgElement) loadingMsgElement.remove();

                        const errorDiv = document.createElement('div');
                        errorDiv.style.color = 'red';
                        errorDiv.style.marginTop = '15px';
                        errorDiv.style.textAlign = 'center';
                        errorDiv.textContent = 'Google Sign-In failed to load. Please try again later.';
                        innerContainer.appendChild(errorDiv);
                    } else if (container) {
                        // Fallback if inner container not found
                        container.innerHTML = '<p style="color: red; text-align: center; padding: 20px; background: white; border-radius: 5px;">Google Sign-In failed to load. Please try again later.</p>';
                    } else {
                        alert('Google Sign-In failed to load. Please try again later.');
                    }
                    isAttemptingLogin.current = false;
                }
                retryTimeoutRef.current = null;
            }, 1500); // Wait 1.5 seconds
        }
    }, [googleAuthLoaded, initializeGoogleSignIn, createDedicatedGoogleSignInContainer]); // Added createDedicatedGoogleSignInContainer

    // Main UI rendering effect
    useEffect(() => {
        const isMobile = window.innerWidth <= 768;

        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';
        overlay.style.zIndex = '9999'; // Ensure app UI is below Google's UI
        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        // Update side menu link visibility
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
                // ****** DESKTOP LOGGED IN UI ******
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
                contentContainer.style.overflow = 'auto'; // Scrollable content area
                contentContainer.style.maxHeight = CONFIG.desktop.loggedInContentHeight;
                contentContainer.style.clear = 'both';
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

            } else {
                // ****** DESKTOP LOGGED OUT UI ******
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '30px';
                contentContainer.style.marginTop = CONFIG.desktop.contentContainerTopMargin;
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                // --- Scroll Fix Verification ---
                contentContainer.style.overflow = 'auto'; // Makes this container scrollable if content exceeds max-height
                contentContainer.style.maxHeight = CONFIG.desktop.contentMaxHeight; // Sets the maximum height
                // --- End Scroll Fix Verification ---
                contentContainer.innerHTML = `
                    <p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope. (Add more text here to test scrolling if needed)
                    </p>
                `;
                panel.appendChild(contentContainer);

                // **Desktop_NoLogin_Buttons**
                const leftButtonStack = document.createElement('div');
                leftButtonStack.style.position = 'absolute';
                leftButtonStack.style.left = '50px';
                leftButtonStack.style.top = CONFIG.desktop.buttonStackTopPosition;
                leftButtonStack.style.transform = 'translateY(-50%)';
                leftButtonStack.style.display = 'flex';
                leftButtonStack.style.flexDirection = 'column';
                leftButtonStack.style.gap = '20px';
                leftButtonStack.style.zIndex = '10'; // Below dedicated Google modal

                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container-desktop'; // Unique ID
                googleButtonContainer.style.width = '280px';
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button-desktop" style="background-color: #4285F4; color: white; padding: 12px 20px; border: none; border-radius: 4px; font-size: 24px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 24px; height: 24px;"/>
                        Sign in with Google
                    </button>
                `;
                leftButtonStack.appendChild(googleButtonContainer);

                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.width = '280px';
                homeButtonContainer.style.display = 'none'; // Keep hidden
                homeButtonContainer.innerHTML = `
                    <button id="home-button" class="nav-button" style="width: 100%; font-size: 24px; background-color: rgba(87, 179, 192, 0.2); color: #57b3c0; border: 1px solid rgba(87, 179, 192, 0.4); padding: 10px 20px; border-radius: 6px;">Back to Start</button>
                `;
                leftButtonStack.appendChild(homeButtonContainer);

                panel.appendChild(leftButtonStack);
            }

        } else {
            // ================== MOBILE VIEW ==================
            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-header';
            panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible';
            panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 24px;">Mountain West</h2>';
            panel.appendChild(panelHeader);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'header-in-panel';
            headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 28px;"></h1></header>`;
            panel.appendChild(headerDiv);

            if (isLoggedIn && userData) {
                // ****** MOBILE LOGGED IN UI ******
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.position = 'absolute'; actionButtons.style.top = '10px'; actionButtons.style.right = '10px';
                actionButtons.style.display = 'flex'; actionButtons.style.flexDirection = 'column';
                actionButtons.style.gap = '8px'; actionButtons.style.zIndex = '20'; // Ensure buttons are clickable
                actionButtons.innerHTML = `
                     <button id="logout-button" class="nav-button" style="font-size: 14px; background-color: rgba(255, 99, 71, 0.2); color: #ff6347; border: 1px solid rgba(255, 99, 71, 0.4); padding: 6px 12px; border-radius: 4px;">Logout</button>
                     <button id="template-button" class="nav-button chat-button" style="font-size: 14px; background-color: rgba(255, 165, 0, 0.2); color: #FFA500; border: 1px solid rgba(255, 165, 0, 0.4); padding: 6px 12px; border-radius: 4px;">Dashboard</button>
                 `;
                panel.appendChild(actionButtons);

                const profileSection = document.createElement('div');
                profileSection.style.position = 'absolute'; profileSection.style.top = '20%'; profileSection.style.left = '0';
                profileSection.style.width = '100%'; profileSection.style.display = 'flex';
                profileSection.style.flexDirection = 'column'; profileSection.style.alignItems = 'center';
                profileSection.style.padding = '0 15px'; profileSection.style.zIndex = '11'; // Above content container
                profileSection.style.backgroundColor = 'rgba(13, 20, 24, 0.7)';

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

                const profileSectionHeight = 120; // Approximate height

                const contentContainer = document.createElement('div');
                contentContainer.style.position = 'absolute';
                contentContainer.style.top = 'calc(20% + ' + profileSectionHeight + 'px)';
                contentContainer.style.left = '0'; contentContainer.style.width = '100%';
                contentContainer.style.height = 'calc(80% - ' + profileSectionHeight + 'px)';
                contentContainer.style.display = 'flex'; contentContainer.style.flexDirection = 'column';
                contentContainer.style.overflow = 'auto'; // Scrollable
                contentContainer.style.padding = '15px 15px 70px 15px';
                contentContainer.style.zIndex = '10'; // Below profile section
                contentContainer.style.boxSizing = 'border-box';
                contentContainer.innerHTML = `
                     <p style="font-size: 16px; margin-bottom: 15px; color: #a7d3d8;">
                         You're now logged in... [Content truncated for brevity] ...features and services.
                     </p>
                 `;
                panel.appendChild(contentContainer);

            } else {
                // ****** MOBILE LOGGED OUT UI ******
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                contentContainer.style.padding = '15px';
                contentContainer.style.marginTop = CONFIG.mobile.contentContainerTopMargin;
                contentContainer.style.display = 'flex';
                contentContainer.style.flexDirection = 'column';
                contentContainer.style.width = 'calc(100% - 30px)'; // Account for padding
                contentContainer.style.paddingBottom = '120px'; // Ensure space above buttons
                contentContainer.style.boxSizing = 'border-box';
                // --- Scroll Fix Verification ---
                contentContainer.style.overflowY = 'auto'; // Allows vertical scrolling if content exceeds max-height
                contentContainer.style.maxHeight = CONFIG.mobile.contentMaxHeight; // Sets the maximum height based on viewport
                // --- End Scroll Fix Verification ---
                contentContainer.style.zIndex = '10'; // Keep below button area if overlap occurs
                contentContainer.innerHTML = `
                    <p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8;">
                        Mountain West provides compassionate care for those struggling with addiction. Our experienced team offers sober living environments, recovery support groups, and personalized treatment plans to help you achieve lasting sobriety. We believe in addressing all aspects of recovery, from in-house therapy to life skills development, creating a supportive community where your recovery journey begins with dignity and hope. (Add more text here if needed to test scrolling easily)
                    </p>
                `;
                panel.appendChild(contentContainer);

                // **Mobile_NoLogin_Buttons**
                const mobileButtonArea = document.createElement('div');
                mobileButtonArea.style.position = 'absolute';
                mobileButtonArea.style.bottom = CONFIG.mobile.buttonStackBottomPosition;
                mobileButtonArea.style.marginTop = CONFIG.mobile.buttonStackTopMargin; // Add some top margin
                mobileButtonArea.style.left = '0';
                mobileButtonArea.style.width = '100%';
                mobileButtonArea.style.display = 'flex';
                mobileButtonArea.style.flexDirection = 'column';
                mobileButtonArea.style.alignItems = 'center';
                mobileButtonArea.style.gap = '15px';
                // --- Mobile Button Fix ---
                mobileButtonArea.style.zIndex = '11'; // Ensure button area is above content container (zIndex 10)
                // --- End Mobile Button Fix ---

                const googleButtonContainer = document.createElement('div');
                googleButtonContainer.id = 'google-button-container-mobile'; // Unique ID
                googleButtonContainer.innerHTML = `
                    <button id="google-login-button-mobile" style="background-color: #4285F4; color: white; padding: 10px 18px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; width: auto;">
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" style="width: 18px; height: 18px;"/>
                        Sign in with Google
                    </button>
                `;
                mobileButtonArea.appendChild(googleButtonContainer);

                const homeButtonContainer = document.createElement('div');
                homeButtonContainer.style.marginTop = '5px'; // Reduced space below Google btn
                homeButtonContainer.style.display = 'none'; // Keep hidden
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

        // --- Event Listener Attachment ---
        const homeButton = document.getElementById('home-button');
        if (homeButton) homeButton.addEventListener('click', () => navigate('/'));

        if (isLoggedIn) {
            const templateButton = document.getElementById('template-button');
            if (templateButton) templateButton.addEventListener('click', () => navigate('/loggedintemplate'));

            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) logoutButton.addEventListener('click', handleLogout);
        } else {
            // Attach listeners to the specific buttons by their unique IDs
            const desktopGoogleButton = document.getElementById('google-login-button-desktop');
            if (desktopGoogleButton) desktopGoogleButton.addEventListener('click', handleGoogleButtonClick);

            const mobileGoogleButton = document.getElementById('google-login-button-mobile');
            if (mobileGoogleButton) {
                // Using 'click' should be fine on most modern mobile browsers for buttons
                mobileGoogleButton.addEventListener('click', (e) => {
                    console.log("Mobile Google button click listener fired.");
                    e.preventDefault(); // Still good practice for buttons that trigger JS actions
                    e.stopPropagation(); // Prevent bubbling up if needed
                    handleGoogleButtonClick(); // Call the main handler
                });
                // Optional: Add touchstart for potentially faster response on some devices,
                // but ensure it doesn't double-trigger with click. Click is generally preferred.
                /*
                mobileGoogleButton.addEventListener('touchstart', (e) => {
                    console.log("Mobile Google button touchstart listener fired.");
                    e.preventDefault();
                    e.stopPropagation();
                    handleGoogleButtonClick();
                }, { passive: false }); // Need passive: false to call preventDefault
                */
            }
        }
        // --- End of Event Listener Attachment ---

        // Resize handler
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            // Reloading on resize might be disruptive, consider only if layout breaks significantly
            resizeTimeout = setTimeout(() => { window.location.reload(); }, 250);
        };
        window.addEventListener('resize', handleResize);

        // --- Cleanup function ---
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            if (document.body.contains(overlay)) {
                try { document.body.removeChild(overlay); } catch (e) { }
            }
            // Aggressive cleanup moved to the GSI script loading useEffect cleanup
        };
        // Dependencies include state and callbacks that influence the UI or listeners
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded, initializeGoogleSignIn, createDedicatedGoogleSignInContainer, CONFIG]); // Added CONFIG to deps

    // Component renders null because UI is managed entirely via direct DOM manipulation
    return null;
}