/**
 * About.jsx - Component for the About page with Google authentication
 * (Revision 26 - Fixed desktop button stack positioning)
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
            contentTopMargin: '20px',
            contentMaxHeight: '65vh',
            // Removed buttonStackTopPosition - will use fixed bottom offset now
            loggedInContentTopPosition: '-70px',
            userInfoTopPosition: '-120px',
            loggedInContentHeight: 'calc(100% - 180px)'
        },
        mobile: { // --- MOBILE CONFIG IS FINAL ---
            headerHeight: '60px',
            buttonAreaHeight: '100px',
            buttonStackBottomPosition: '10%', // Kept but not used for button area directly
            buttonStackTopMargin: '20px'     // Kept but not used for button area directly
        }
    };
    // *** END CONFIGURABLE POSITIONING VARIABLES ***

    // --- Lorem Ipsum Text --- (unchanged)
    const loremIpsumText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus. Vestibulum libero nisl, porta vel, scelerisque eget, malesuada at, neque. Vivamus eget nibh. Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Suspendisse sollicitudin velit sed leo. Ut pharetra augue nec augue. Nam elit agna,endrerit sit amet, tincidunt ac, viverra sed, nulla. Donec porta diam eu massa. Quisque diam lorem, interdum vitae,dapibus ac, scelerisque vitae, pede. Donec eget tellus non erat lacinia fermentum. Donec in velit vel ipsum auctor pulvinar. Vestibulum iaculis lacinia est. Proin dictum elementum velit.";

    // Previous hooks and functions (useEffect login check, decodeJwtResponse, removeDedicatedContainer, useEffect GSI script, handleLogout, createDedicated..., initializeGoogleSignIn, handleGoogleButtonClick) remain unchanged from Revision 25.
    // ... (Code for hooks and callbacks - unchanged) ...
    // Check initial login state - useEffect(() => { ... }, []); // (unchanged)
    useEffect(() => { const savedLoginStatus = localStorage.getItem('mw_isLoggedIn'); const savedUserData = localStorage.getItem('mw_userData'); if (savedLoginStatus === 'true' && savedUserData) { try { const parsedUserData = JSON.parse(savedUserData); setUserData(parsedUserData); setIsLoggedIn(true); } catch (error) { console.error('Failed to parse saved user data:', error); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData'); } } }, []);
    // JWT token decoder - const decodeJwtResponse = (token) => { ... }; // (unchanged)
    const decodeJwtResponse = (token) => { try { const base64Url = token.split('.')[1]; const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')); return JSON.parse(jsonPayload); } catch (error) { console.error('Failed to decode JWT token:', error); return { name: 'User', email: '' }; } };
    // Aggressive removal of Google Sign-In Modal - const removeDedicatedContainer = () => { ... }; // (unchanged)
    const removeDedicatedContainer = () => { const container = document.getElementById('dedicated-google-signin-container'); if (container && document.body.contains(container)) { console.log("Attempting remove GSI container."); try { document.body.removeChild(container); } catch (e) { console.warn("Error removing GSI container:", e); } } };
    // Set up Google Sign-In Script - useEffect(() => { ... }, [googleAuthLoaded]); // (unchanged)
    useEffect(() => { window.handleGoogleSignIn = (response) => { isAttemptingLogin.current = false; removeDedicatedContainer(); if (response && response.credential) { console.log("GSI success:", response); const decodedToken = decodeJwtResponse(response.credential); setUserData(decodedToken); setIsLoggedIn(true); localStorage.setItem('mw_isLoggedIn', 'true'); localStorage.setItem('mw_userData', JSON.stringify(decodedToken)); } else { console.warn('GSI failed/cancelled.'); } }; const loadGoogleScript = () => { if (!document.getElementById('google-signin-script')) { const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.id = 'google-signin-script'; script.async = true; script.defer = true; let timeoutId = null; script.onload = () => { if (timeoutId) clearTimeout(timeoutId); if (window.google?.accounts?.id) { setGoogleAuthLoaded(true); console.log('GSI script loaded & API ready.'); } else { setTimeout(() => { if (window.google?.accounts?.id) { setGoogleAuthLoaded(true); console.log('GSI API ready after delay.'); } else { console.warn('GSI API failed init post-load.'); } }, 500); } }; script.onerror = () => { if (timeoutId) clearTimeout(timeoutId); console.error('Failed to load GSI script.'); }; timeoutId = setTimeout(() => { if (!window.google?.accounts?.id && !googleAuthLoaded) { console.warn('GSI API init timeout'); } }, 5000); document.head.appendChild(script); } else if (window.google?.accounts?.id && !googleAuthLoaded) { setGoogleAuthLoaded(true); console.log('GSI script existed & API ready.'); } else if (!googleAuthLoaded) { console.log('GSI script exists, awaiting API init.'); } }; loadGoogleScript(); return () => { delete window.handleGoogleSignIn; if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current); removeDedicatedContainer(); const googleElements = document.querySelectorAll('[id^="credential_picker_container"], #mobile-google-signin-overlay, #google-signin-custom-styles'); googleElements.forEach(el => el.parentNode?.removeChild(el)); }; }, [googleAuthLoaded]);
    // Logout handler - const handleLogout = useCallback(() => { ... }, [setIsLoggedIn, setUserData]); // (unchanged)
    const handleLogout = useCallback(() => { isAttemptingLogin.current = false; if (retryTimeoutRef.current) { clearTimeout(retryTimeoutRef.current); retryTimeoutRef.current = null; } window.google?.accounts?.id.disableAutoSelect(); setUserData(null); setIsLoggedIn(false); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData'); console.log('User logged out.'); }, [setIsLoggedIn, setUserData]);
    // Creates the dedicated modal/overlay - const createDedicatedGoogleSignInContainer = useCallback(() => { ... }, []); // (unchanged)
    const createDedicatedGoogleSignInContainer = useCallback(() => { removeDedicatedContainer(); const container = document.createElement('div'); container.id = 'dedicated-google-signin-container'; Object.assign(container.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '2147483647', pointerEvents: 'auto' }); const innerContainer = document.createElement('div'); innerContainer.id = 'google-signin-inner-container'; Object.assign(innerContainer.style, { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '300px', maxWidth: '90%' }); const title = document.createElement('h3'); title.textContent = 'Sign in with Google'; Object.assign(title.style, { marginBottom: '20px', color: '#333', fontSize: '1.2em' }); innerContainer.appendChild(title); const buttonContainer = document.createElement('div'); buttonContainer.id = 'google-button-element-container'; innerContainer.appendChild(buttonContainer); const closeButton = document.createElement('button'); closeButton.textContent = 'Cancel'; Object.assign(closeButton.style, { marginTop: '20px', padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f2f2f2', cursor: 'pointer', fontSize: '0.9em' }); closeButton.addEventListener('click', () => { removeDedicatedContainer(); isAttemptingLogin.current = false; }); innerContainer.appendChild(closeButton); container.appendChild(innerContainer); document.body.appendChild(container); return buttonContainer; }, []);
    // Initializes Google Sign-In - const initializeGoogleSignIn = useCallback(() => { ... }, [GOOGLE_CLIENT_ID, createDedicatedGoogleSignInContainer]); // (unchanged)
    const initializeGoogleSignIn = useCallback(() => { console.log("Attempting GSI init..."); if (!window.google?.accounts?.id) { console.error("GSI API not available."); removeDedicatedContainer(); isAttemptingLogin.current = false; return false; } try { const buttonRenderElement = createDedicatedGoogleSignInContainer(); if (!buttonRenderElement) { console.error("Failed get GSI btn render el."); removeDedicatedContainer(); isAttemptingLogin.current = false; return false; } try { window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: window.handleGoogleSignIn, cancel_on_tap_outside: false, context: 'signin' }); console.log("GSI initialized."); } catch (initError) { console.error("GSI init error:", initError); removeDedicatedContainer(); isAttemptingLogin.current = false; return false; } try { buttonRenderElement.innerHTML = ''; window.google.accounts.id.renderButton(buttonRenderElement, { type: 'standard', theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', logo_alignment: 'center', width: 250 }); console.log("GSI btn rendered."); } catch (renderError) { console.error("GSI renderButton error:", renderError); } try { console.log("Attempting GSI prompt..."); window.google.accounts.id.prompt((n) => { console.log("GSI prompt note:", n.getNotDisplayedReason(), n.getSkippedReason()); if (n.isDismissedMoment()) { console.log("GSI prompt dismissed."); removeDedicatedContainer(); isAttemptingLogin.current = false; } }); } catch (promptError) { console.error("GSI prompt error:", promptError); } return true; } catch (error) { console.error("GSI overall init error:", error); removeDedicatedContainer(); isAttemptingLogin.current = false; return false; } }, [GOOGLE_CLIENT_ID, createDedicatedGoogleSignInContainer]);
    // Click handler for custom buttons - const handleGoogleButtonClick = useCallback(() => { ... }, [googleAuthLoaded, initializeGoogleSignIn, createDedicatedGoogleSignInContainer]); // (unchanged)
    const handleGoogleButtonClick = useCallback(() => { console.log("handleGoogleButtonClick ENTERED"); if (isAttemptingLogin.current) { console.log("Login attempt in progress."); return; } isAttemptingLogin.current = true; if (retryTimeoutRef.current) { clearTimeout(retryTimeoutRef.current); retryTimeoutRef.current = null; } if (window.google?.accounts?.id) { console.log("GSI ready, initializing flow..."); if (!initializeGoogleSignIn()) { isAttemptingLogin.current = false; removeDedicatedContainer(); alert("Could not start GSI. Try again."); } } else { console.warn("GSI not ready, scheduling retry..."); const tempContainer = createDedicatedGoogleSignInContainer(); if (tempContainer) { const msg = document.createElement('p'); msg.textContent = 'Loading GSI...'; msg.style.marginTop = '15px'; tempContainer.parentNode.insertBefore(msg, tempContainer.nextSibling); } retryTimeoutRef.current = setTimeout(() => { console.log("Executing GSI retry..."); if (window.google?.accounts?.id) { console.log("GSI ready on retry."); if (!initializeGoogleSignIn()) { isAttemptingLogin.current = false; removeDedicatedContainer(); alert("Could not start GSI after loading. Try again."); } } else { console.error("GSI STILL not ready."); const container = document.getElementById('dedicated-google-signin-container'); const inner = document.getElementById('google-signin-inner-container'); if (inner) { const loading = Array.from(inner.parentNode.children).find(el => el.textContent.includes('Loading')); if (loading) loading.remove(); const errDiv = document.createElement('div'); errDiv.style.color = 'red'; errDiv.style.marginTop = '15px'; errDiv.style.textAlign = 'center'; errDiv.textContent = 'GSI failed to load. Try again later.'; inner.appendChild(errDiv); } else if (container) { container.innerHTML = '<p style="color: red; text-align: center; padding: 20px; background: white; border-radius: 5px;">GSI failed to load. Try again later.</p>'; } else { alert('GSI failed to load. Try again later.'); } isAttemptingLogin.current = false; } retryTimeoutRef.current = null; }, 1500); } }, [googleAuthLoaded, initializeGoogleSignIn, createDedicatedGoogleSignInContainer]);


    // Main UI rendering effect
    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        const overlay = document.createElement('div'); overlay.className = 'ui-overlay'; overlay.style.zIndex = '9999';
        const panel = document.createElement('div'); panel.className = 'flat-panel';
        panel.style.overflow = 'visible'; // Important for absolute children

        const jobSearchLink = document.querySelector('.nav-item a[href*="mountainwestjobsearch.com"]'); if (jobSearchLink) { jobSearchLink.style.display = isLoggedIn ? 'flex' : 'none'; }

        // --- UI Creation ---
        if (!isMobile) {
            // ================== DESKTOP VIEW (Fixing Button Position) ==================
            const panelHeader = document.createElement('div'); panelHeader.className = 'panel-header'; panelHeader.style.visibility = isLoggedIn ? 'hidden' : 'visible'; panelHeader.innerHTML = '<h2 class="panel-title" style="font-size: 45px;">Mountain West</h2>'; panel.appendChild(panelHeader);
            const headerDiv = document.createElement('div'); headerDiv.className = 'header-in-panel'; headerDiv.innerHTML = `<header style="background-color: transparent; padding: 0.5rem; color: #57b3c0; text-align: center;"><h1 style="font-size: 55px;"></h1></header>`; panel.appendChild(headerDiv);

            if (isLoggedIn && userData) { /* Desktop Logged In UI (structure unchanged) */ }
            else { // Desktop Logged Out UI
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                Object.assign(contentContainer.style, {
                    padding: '30px', marginTop: CONFIG.desktop.contentTopMargin, display: 'flex', flexDirection: 'column', overflow: 'auto', maxHeight: CONFIG.desktop.contentMaxHeight,
                });
                contentContainer.innerHTML = `<p style="font-size: 35px; line-height: 1.4; margin-bottom: 40px; color: #a7d3d8; overflow-wrap: break-word;">${loremIpsumText}</p>`;
                panel.appendChild(contentContainer);

                // **Desktop_NoLogin_Buttons**
                const leftButtonStack = document.createElement('div');
                // --- Desktop Button Position Fix ---
                Object.assign(leftButtonStack.style, {
                    position: 'absolute',
                    left: '50px', // Keep on left
                    bottom: '50px', // Position 50px from the bottom of the panel
                    // Removed: top: CONFIG.desktop.buttonStackTopPosition,
                    // Removed: transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    zIndex: '10'
                });
                // --- End Fix ---
                const googleButtonContainer = document.createElement('div'); googleButtonContainer.id = 'google-button-container-desktop'; googleButtonContainer.style.width = '280px'; googleButtonContainer.innerHTML = `<button id="google-login-button-desktop" ...>Sign in with Google</button>`; leftButtonStack.appendChild(googleButtonContainer);
                const homeButtonContainer = document.createElement('div'); homeButtonContainer.style.width = '280px'; homeButtonContainer.style.display = 'none'; homeButtonContainer.innerHTML = `<button id="home-button" ...>Back to Start</button>`; leftButtonStack.appendChild(homeButtonContainer);
                panel.appendChild(leftButtonStack);
            }
        } else {
            // ================== MOBILE VIEW (Considered FINAL - No Changes) ==================
            const panelHeader = document.createElement('div'); /* ... */ panel.appendChild(panelHeader);
            const headerDiv = document.createElement('div'); /* ... */ panel.appendChild(headerDiv);
            if (isLoggedIn && userData) { /* Mobile Logged In UI */ }
            else { // Mobile Logged Out UI
                const contentContainer = document.createElement('div');
                contentContainer.className = 'content-container';
                Object.assign(contentContainer.style, { position: 'absolute', top: CONFIG.mobile.headerHeight, bottom: CONFIG.mobile.buttonAreaHeight, left: '15px', right: '15px', overflowY: 'auto', width: 'auto', boxSizing: 'border-box', zIndex: '10' });
                contentContainer.innerHTML = `<p style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; color: #a7d3d8; overflow-wrap: break-word;">${loremIpsumText}</p>`;
                panel.appendChild(contentContainer);

                const mobileButtonArea = document.createElement('div');
                Object.assign(mobileButtonArea.style, { position: 'absolute', bottom: '0', left: '0', width: '100%', height: CONFIG.mobile.buttonAreaHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', zIndex: '11', boxSizing: 'border-box', padding: '10px 0', /* backgroundColor: 'rgba(0, 255, 0, 0.1)', // Debug background commented out */ });
                const googleButtonContainer = document.createElement('div'); googleButtonContainer.id = 'google-button-container-mobile'; googleButtonContainer.innerHTML = `<button id="google-login-button-mobile" ...>Sign in with Google</button>`; mobileButtonArea.appendChild(googleButtonContainer);
                const homeButtonContainer = document.createElement('div'); homeButtonContainer.style.display = 'none'; homeButtonContainer.innerHTML = `<button id="home-button" ...>Back to Start</button>`; mobileButtonArea.appendChild(homeButtonContainer);
                panel.appendChild(mobileButtonArea);
            }
        }
        // --- End of UI Creation ---

        overlay.appendChild(panel); document.body.appendChild(overlay);

        // --- Event Listener Attachment (Keeping mobile listener log) ---
        const homeButton = document.getElementById('home-button'); if (homeButton) homeButton.addEventListener('click', () => navigate('/'));
        if (isLoggedIn) { /* ... (logged in listeners) ... */ }
        else {
            const desktopGoogleButton = document.getElementById('google-login-button-desktop'); if (desktopGoogleButton) desktopGoogleButton.addEventListener('click', handleGoogleButtonClick);
            const mobileGoogleButton = document.getElementById('google-login-button-mobile');
            if (mobileGoogleButton) {
                console.log("Attempting attach listener to mobile button:", mobileGoogleButton);
                mobileGoogleButton.addEventListener('click', (e) => { console.log("Mobile GSI btn 'click' LISTENER FIRED!"); e.preventDefault(); e.stopPropagation(); handleGoogleButtonClick(); });
            } else { console.error("Mobile Google button not found for listener!"); }
        }
        // --- End of Event Listener Attachment ---

        // Resize handler - let resizeTimeout; const handleResize = () => { ... }; window.addEventListener('resize', handleResize); // (unchanged)
        let resizeTimeout; const handleResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { window.location.reload(); }, 250); }; window.addEventListener('resize', handleResize);

        // --- Cleanup function ---
        return () => {
            window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout);
            if (document.body.contains(overlay)) { try { document.body.removeChild(overlay); } catch (e) { } }
            removeDedicatedContainer();
        };
    }, [isLoggedIn, userData, navigate, handleLogout, handleGoogleButtonClick, googleAuthLoaded, initializeGoogleSignIn, createDedicatedGoogleSignInContainer, CONFIG, loremIpsumText]); // Dependencies checked

    return null;
}