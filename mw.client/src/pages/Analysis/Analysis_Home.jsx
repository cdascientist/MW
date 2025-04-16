/**
 * Analysis_Home.jsx - Specific component for the Analysis Dashboard homepage.
 * Updated to use the exact styling configuration from About.jsx / LoggedInTemplate.jsx
 * Ensures consistent panel size, positioning, and button styles.
 * MODIFIED: Panel background is 25% more transparent (alpha 0.65).
 * Features: User info, standard navigation, specific Analysis content area.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Framer Motion imports - using fallback or window check
import "../../style/AboutStyle.css"; // Reusing styling

export default function Analysis_Home() { // Component name updated
    // ====================================
    // 1. COMPONENT SETUP & STATE INITIALIZATION
    // ====================================
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const overlayRef = useRef(null);

    // ====================================
    // 2. AUTHENTICATION VERIFICATION & REDIRECTION
    // ====================================
    useEffect(() => {
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');
        let isAuthenticated = false;
        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                isAuthenticated = true;
                console.log("Analysis_Home: Retrieved authenticated session from localStorage");
            } catch (error) {
                console.error('Analysis_Home: Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        } else {
            setIsLoggedIn(false);
            setUserData(null);
            console.log("Analysis_Home: No authenticated session found in localStorage");
        }
        setLoading(false);

        // Redirect if not authenticated after loading check
        if (!isAuthenticated && !loading) {
            console.warn("Analysis_Home: Auth check complete, user not authenticated. Redirecting to /about...");
            navigate('/about'); // Redirect immediately if not logged in
        }
    }, [loading, navigate]); // Added dependencies

    // Logout handler
    const handleLogout = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log("Analysis_Home: User logged out. Redirecting to /about...");
        navigate('/about');
    };

    // Navigation handlers
    const handleChatClick = () => {
        console.log("Navigating to chat");
        navigate('/chat');
    };

    const handleHomeClick = () => {
        console.log("Navigating to about page");
        navigate('/about'); // Navigate back to the main 'about' page
    };

    // NOTE: handleAnalysisClick is kept in scope but no button triggers it directly in this default view
    const handleAnalysisClick = () => {
        console.log("Triggered handleAnalysisClick (potentially from future element)");
        // This might navigate to a sub-page of analysis or refresh.
        navigate('/analysis/home');
    };

    // ====================================
    // 3. STYLING CONFIGURATION (COPIED FROM LoggedInTemplate / About.jsx)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // Panel dimensions and spacing (Exact copy from About.jsx)
        const panelPaddingTop = isMobile ? '100px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';

        // Text sizes (Exact copy from About.jsx)
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)'; // Consistent with LoggedInTemplate

        // Element positioning (Exact copy from About.jsx)
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';
        const contentTopMargin = isMobile ? '120px' : '130px'; // Matches About.jsx

        // Button standardization (Exact copy from About.jsx)
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

        // Return styles object
        return {
            overlay: {
                className: 'ui-overlay analysis-home-overlay', // Specific class name
                style: { // Copied from About.jsx overlay style
                    zIndex: '9999',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel analysis-home-panel', // Specific class name
                style: { // Copied from About.jsx panel style
                    position: 'relative',
                    width: desktopPanelWidth,
                    maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight,
                    maxHeight: '90vh',
                    // *** MODIFIED BACKGROUND COLOR FOR TRANSPARENCY ***
                    backgroundColor: 'rgba(13, 20, 24, 0.65)', // Was 0.9, now 0.65 (25% more transparent)
                    borderRadius: '12px',
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`,
                    color: 'white',
                    pointerEvents: 'auto',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    opacity: 0,
                    margin: '0 auto',
                    top: 'auto',
                    left: 'auto',
                    transform: 'none',
                }
            },
            profileContainer: { // (Exact copy from About.jsx)
                style: {
                    position: 'absolute', top: profileTop, left: profileLeft,
                    display: 'flex', alignItems: 'center', gap: '15px',
                    zIndex: 10, opacity: 0, transform: 'translateX(-50px)',
                }
            },
            buttonStackContainer: { // (Exact copy from About.jsx)
                style: {
                    position: 'absolute', top: buttonStackTop, right: buttonStackRight,
                    display: 'flex', flexDirection: 'column', gap: buttonStackGap,
                    zIndex: 100, alignItems: 'flex-end', opacity: 0,
                    transform: 'translateX(50px)', pointerEvents: 'auto',
                }
            },
            contentContainer: { // (Exact copy from About.jsx)
                className: 'content-container',
                style: {
                    width: '100%', marginTop: contentTopMargin, opacity: 0,
                    transform: 'translateY(30px)', position: 'relative', zIndex: 5
                }
            },
            profilePhoto: { // (Exact copy from About.jsx)
                style: {
                    width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px',
                    borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0,
                }
            },
            profilePhotoPlaceholder: { // (Exact copy from About.jsx)
                style: {
                    width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px',
                    borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'white',
                    fontSize: isMobile ? '18px' : '24px', flexShrink: 0,
                }
            },
            userInfo: { // (Exact copy from About.jsx)
                style: { display: 'flex', flexDirection: 'column', textAlign: 'left', }
            },
            userName: { // (Exact copy from About.jsx)
                style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500', }
            },
            userEmail: { // (Exact copy from About.jsx)
                style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e', }
            },
            // --- Button Styles (Using standard base, same as LoggedInTemplate) ---
            logoutButton: {
                className: 'nav-button logout-button',
                style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)' }
            },
            chatButton: {
                className: 'nav-button chat-button',
                style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)' }
            },
            homeButton: {
                className: 'nav-button home-button',
                style: { ...standardButtonStyle, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', textDecoration: 'none' }
            },
            // --- Content Styles (Copied from About.jsx) ---
            contentHeading: {
                style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', }
            },
            contentText: {
                style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', }
            },
            contentSection: {
                style: { backgroundColor: 'rgba(87, 179, 192, 0.05)', padding: isMobile ? '15px' : '20px', borderRadius: '8px', marginBottom: isMobile ? '15px' : '20px', }
            },
            contentSectionHeading: { // Consistent with LoggedInTemplate
                style: { fontSize: sectionHeadingFontSize, marginBottom: '10px', color: '#57b3c0', fontWeight: '600', }
            },
        };
    };

    // Animation helper (Copied from About.jsx)
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
    // 4. UI RENDERING EFFECT (Using Copied Styles & Specific Content)
    // ====================================
    useEffect(() => {
        // Prevent rendering if loading or not logged in
        if (loading || !isLoggedIn || !userData) {
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
                overlayRef.current = null;
            }
            return; // Exit early
        }

        // Prevent duplicate overlays
        if (overlayRef.current || document.querySelector('.analysis-home-overlay')) {
            console.log("Analysis_Home: Overlay already exists, skipping creation.");
            return;
        }

        console.log("Analysis_Home: Creating UI elements...");
        const styles = getStyles();
        const isMobile = window.innerWidth <= 768;
        let panel; // Declare panel here

        try {
            // --- Create Overlay and Panel (Using copied styles, updated class names) ---
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className; // Use updated class name
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            panel = document.createElement('div');
            panel.className = styles.panel.className; // Use updated class name
            panel.id = 'analysis-panel'; // Specific ID for this panel
            Object.assign(panel.style, styles.panel.style); // Panel style now includes updated background alpha

            // --- CREATE ABSOLUTE BUTTON STACK (Top-Right - Using copied styles) ---
            const buttonStackContainer = document.createElement('div');
            buttonStackContainer.id = 'button-stack'; // Consistent ID
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);

            // Define button configurations (Logout, Chat, Home - "Analysis" button removed from stack)
            const buttonsConfig = [
                { id: 'logout-button', text: 'Logout', styleObj: styles.logoutButton, handler: handleLogout, priority: 1 },
                { id: 'chat-button', text: 'Live Chat', styleObj: styles.chatButton, handler: handleChatClick, priority: 2 },
                { id: 'home-button', text: 'Home', styleObj: styles.homeButton, handler: handleHomeClick, priority: 3 } // Text updated to "Home"
            ];

            buttonsConfig.sort((a, b) => a.priority - b.priority);

            buttonsConfig.forEach(config => {
                const button = document.createElement('button');
                button.id = config.id;
                button.className = config.styleObj.className;
                Object.assign(button.style, config.styleObj.style);
                button.textContent = config.text;
                button.addEventListener('click', config.handler);
                // Consistent hover effects
                const originalBackgroundColor = button.style.backgroundColor;
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'scale(1.05)';
                    if (button.id === 'logout-button') button.style.backgroundColor = 'rgba(255, 99, 71, 0.3)';
                    else if (button.id === 'chat-button') button.style.backgroundColor = 'rgba(255, 165, 0, 0.3)';
                    else if (button.id === 'home-button') button.style.backgroundColor = 'rgba(87, 179, 192, 0.3)';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'scale(1)';
                    button.style.backgroundColor = originalBackgroundColor;
                });
                buttonStackContainer.appendChild(button);
            });

            panel.appendChild(buttonStackContainer);

            // --- CREATE ABSOLUTE PROFILE INFO (Top-Left - Using copied styles) ---
            const profileContainer = document.createElement('div');
            profileContainer.id = 'profile-container'; // Consistent ID
            Object.assign(profileContainer.style, styles.profileContainer.style);
            // Profile picture/placeholder... (Code identical to LoggedInTemplate)
            const profilePhotoEl = document.createElement(userData.picture ? 'img' : 'div');
            if (userData.picture) { profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile"; Object.assign(profilePhotoEl.style, styles.profilePhoto.style); }
            else { profilePhotoEl.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U'; Object.assign(profilePhotoEl.style, styles.profilePhotoPlaceholder.style); }
            profileContainer.appendChild(profilePhotoEl);
            // User name/email... (Code identical to LoggedInTemplate)
            const userInfoDiv = document.createElement('div'); Object.assign(userInfoDiv.style, styles.userInfo.style);
            const userNameEl = document.createElement('h3'); Object.assign(userNameEl.style, styles.userName.style); userNameEl.textContent = `${userData.name || 'User'}`;
            const userEmailEl = document.createElement('p'); Object.assign(userEmailEl.style, styles.userEmail.style); userEmailEl.textContent = userData.email || 'No email provided';
            userInfoDiv.appendChild(userNameEl); userInfoDiv.appendChild(userEmailEl);
            profileContainer.appendChild(userInfoDiv);
            panel.appendChild(profileContainer);

            // --- CREATE FLOWED CONTENT AREA (SPECIFIC TO ANALYSIS HOME) ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container'; // Consistent ID
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // *** Analysis-specific content (Same as before) ***
            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.contentHeading.style);
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);
            const introText = document.createElement('p');
            Object.assign(introText.style, styles.contentText.style);
            introText.textContent = "Welcome to your analysis dashboard. View key metrics, recent reports, and manage your data analysis tasks.";
            contentContainer.appendChild(introText);
            const metricsSection = document.createElement('div');
            Object.assign(metricsSection.style, styles.contentSection.style);
            const metricsHeading = document.createElement('h3');
            Object.assign(metricsHeading.style, styles.contentSectionHeading.style);
            metricsHeading.textContent = "Key Metrics Overview";
            const metricsContent = document.createElement('p');
            Object.assign(metricsContent.style, styles.contentText.style);
            metricsContent.textContent = "Display summary charts or vital statistics here. (e.g., Jobs Analyzed, Trend Indicators, etc.)";
            metricsSection.appendChild(metricsHeading);
            metricsSection.appendChild(metricsContent);
            contentContainer.appendChild(metricsSection);
            const reportsSection = document.createElement('div');
            Object.assign(reportsSection.style, styles.contentSection.style);
            const reportsHeading = document.createElement('h3');
            Object.assign(reportsHeading.style, styles.contentSectionHeading.style);
            reportsHeading.textContent = "Recent Analysis Reports";
            const reportsContent = document.createElement('p');
            Object.assign(reportsContent.style, styles.contentText.style);
            reportsContent.textContent = "List links to recently generated analysis reports or summaries.";
            const reportLink = document.createElement('a');
            reportLink.href = "#"; reportLink.textContent = "Q3 Market Trends Analysis";
            reportLink.style.color = styles.homeButton.style.color;
            reportLink.style.display = 'block'; reportLink.style.marginTop = '10px';
            reportLink.onclick = (e) => { e.preventDefault(); console.log("Clicked placeholder report link."); };
            reportsSection.appendChild(reportsHeading);
            reportsSection.appendChild(reportsContent);
            reportsSection.appendChild(reportLink);
            contentContainer.appendChild(reportsSection);

            panel.appendChild(contentContainer);

            // --- APPEND TO BODY ---
            const existingOverlays = document.querySelectorAll('.analysis-home-overlay, .ui-overlay');
            existingOverlays.forEach(el => {
                if (el !== overlay) el.parentNode?.removeChild(el);
            });
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            // Apply animations (Using copied logic)
            setTimeout(() => {
                if (window.framerMotion && window.framerMotion.animate) {
                    window.framerMotion.animate('#analysis-panel', { opacity: 1 }, { duration: 0.5 });
                    window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#button-stack', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                    console.log("Analysis_Home: Applied Framer Motion animations.");
                } else {
                    animateElement(panel, { opacity: '1' }, 0);
                    animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(buttonStackContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                    console.log("Analysis_Home: Applied fallback CSS animations.");
                }

                // Final centering check (copied from About.jsx)
                setTimeout(() => {
                    if (!panel) return;
                    const panelRect = panel.getBoundingClientRect();
                    const viewportCenterX = window.innerWidth / 2; const viewportCenterY = window.innerHeight / 2;
                    const panelCenterX = panelRect.left + panelRect.width / 2; const panelCenterY = panelRect.top + panelRect.height / 2;
                    const xOffset = Math.abs(panelCenterX - viewportCenterX); const yOffset = Math.abs(panelCenterY - viewportCenterY);
                    if (xOffset > 50 || yOffset > 50) {
                        console.warn("Analysis_Home: Panel potentially misaligned, attempting forced centering.");
                        panel.style.position = 'fixed'; panel.style.top = '50%'; panel.style.left = '50%';
                        panel.style.transform = 'translate(-50%, -50%)'; panel.style.margin = '0';
                    } else {
                        console.log("Analysis_Home: Panel centering appears correct.");
                    }
                }, 100);

            }, 100);

            console.log("Analysis_Home: UI elements created and appended.");

        } catch (error) {
            console.error("Analysis_Home: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
                overlayRef.current = null;
            } else if (panel && panel.parentNode) {
                panel.parentNode.remove();
            }
            document.body.style.overflow = ''; // Restore scroll on error
            return;
        }

        // ====================================
        // 5. EVENT HANDLING & CLEANUP (Using pattern from About.jsx)
        // ====================================
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("Analysis_Home: Reloading due to resize for layout consistency...");
                window.location.reload();
            }, 250);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            console.log("Analysis_Home: Cleanup initiated.");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            // Remove the overlay using the ref and specific class name
            if (overlayRef.current && overlayRef.current.parentNode) {
                console.log("Analysis_Home: Removing overlay via ref.");
                overlayRef.current.remove();
            } else {
                const fallbackOverlay = document.querySelector('.analysis-home-overlay'); // Use specific class
                if (fallbackOverlay) {
                    console.log("Analysis_Home: Removing overlay via fallback querySelector.");
                    fallbackOverlay.remove();
                } else {
                    console.log("Analysis_Home: No overlay found to remove during cleanup.");
                }
            }
            overlayRef.current = null;
            document.body.style.overflow = ''; // Restore body scroll
        };
        // Update dependencies: remove handleAnalysisClick if truly unused by rendered elements
    }, [isLoggedIn, userData, loading, navigate, handleLogout, handleChatClick, handleHomeClick]);

    return null; // Component renders null, UI handled by effect
}