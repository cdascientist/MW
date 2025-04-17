/**
 * LoggedInTemplate.jsx - Template component for logged-in pages
 * Updated with styling and positioning consistent with About.jsx,
 * including proper panel centering and desktop size enhancements.
 * Fixed layout to prevent content from covering buttons.
 * Removed borders around sections and pushed Template Main Content up.
 * Added mobile-specific adjustments to move content sections up.
 * Added mobile-specific adjustments to move the Analysis button up, user info down/left.
 * Placed configuration variables at the top.
 * Fixed ESLint warnings.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/AboutStyle.css"; // Reusing styling from About

// ====================================
// MOBILE ADJUSTMENT CONFIGURATION
// ====================================
// MOBILE: Vertical offset for the 'Template Main Content' heading on mobile screens (negative value moves up).
const mobileContentHeadingOffsetY = '-110px';
// MOBILE: Vertical offset for the content section below the main heading on mobile screens (negative value moves up).
const mobileContentSectionOffsetY = '-110px';
// MOBILE: Vertical offset for the 'Open Analysis Dashboard' button on mobile screens (negative value moves up).
const mobileAnalysisButtonOffsetY = '-110px';
// MOBILE: Vertical offset for the user info (name/email) container on mobile screens (positive value moves down).
const mobileUserInfoOffsetY = '55px';
// MOBILE: Horizontal offset for the user info (name/email) container on mobile screens (negative value moves left).
const mobileUserInfoOffsetX = '-55px';

export default function LoggedInTemplate() {
    // ====================================
    // 1. COMPONENT SETUP & STATE INITIALIZATION
    // ====================================
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const overlayRef = useRef(null);

    // ====================================
    // 2. AUTHENTICATION VERIFICATION & INITIAL STATE
    // ====================================
    useEffect(() => {
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');
        // let isAuthenticated = false; // Removed as it was unused

        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                // isAuthenticated = true; // Removed as it was unused
                console.log("LoggedInTemplate: Retrieved authenticated session from localStorage");
            } catch (error) {
                console.error('LoggedInTemplate: Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
                setIsLoggedIn(false);
                setUserData(null);
            }
        } else {
            setIsLoggedIn(false);
            setUserData(null);
        }
        setLoading(false);

        // Redirect if not authenticated after checks (Optional, uncomment if needed)
        // const checkAuthAndRedirect = () => {
        //     const currentStatus = localStorage.getItem('mw_isLoggedIn') === 'true';
        //     if (!currentStatus && !loading) { // Ensure loading is finished before redirecting
        //         console.warn("LoggedInTemplate: Auth check complete, user not authenticated. Redirecting...");
        //         navigate('/about'); // Redirect to About/Login page
        //     }
        // };
        // // You might want a slight delay or use a different mechanism if loading state updates asynchronously
        // // setTimeout(checkAuthAndRedirect, 100); // Example delay
        // checkAuthAndRedirect(); // Or call directly if state updates reliably before this runs


    }, [navigate, loading]); // Added loading to dependency array to potentially re-run check

    // ====================================
    // 3. HANDLERS (Logout, Navigation)
    // ====================================
    const handleLogout = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log("User logged out, navigating to About page");
        navigate('/about');
    }, [navigate]);

    const handleChatClick = useCallback(() => {
        console.log("Navigating to chat");
        navigate('/chat');
    }, [navigate]);

    const handleHomeClick = useCallback(() => {
        console.log("Navigating to about page");
        navigate('/about');
    }, [navigate]);

    const handleAnalysisClick = useCallback(() => {
        console.log("Navigating to analysis dashboard");
        navigate('/analysis/home');
    }, [navigate]);

    // ====================================
    // 4. STYLING CONFIGURATION (Aligned with About.jsx)
    // ====================================
    const getStyles = () => {
        // MOBILE: Check if the screen width is mobile size. Used for conditional styling.
        const isMobile = window.innerWidth <= 768;

        // Panel dimensions and spacing (consistent with About.jsx)
        const panelPaddingTop = isMobile ? '100px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';

        // Text sizes (consistent with About.jsx)
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)'; // Added for section headers
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';

        // Element positioning (consistent with About.jsx)
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';
        // Adjusted content top margin as per previous LoggedInTemplate request
        const contentTopMargin = isMobile ? '120px' : '130px';

        // Button standardization (consistent with About.jsx)
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

        // Fix for the parent overlay positioning (consistent with About.jsx)
        return {
            // Overlay styling ensures the panel is centered properly
            overlay: {
                className: 'ui-overlay logged-in-template-overlay', // Specific class name
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
            // Panel style with centering fixes (consistent with About.jsx)
            panel: {
                className: 'flat-panel logged-in-template-panel', // Specific class name
                style: {
                    position: 'relative', // Relative positioning for children
                    width: desktopPanelWidth,
                    maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight,
                    maxHeight: '90vh', // Consistent max height
                    backgroundColor: 'rgba(13, 20, 24, 0.65)',
                    borderRadius: '12px',
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`,
                    color: 'white',
                    pointerEvents: 'auto',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                    opacity: 0, // Start with opacity 0 for animation
                    margin: '0 auto',
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
                    opacity: 0,
                    transform: 'translateX(-50px)',
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
                    zIndex: 100,
                    alignItems: 'flex-end',
                    opacity: 0,
                    transform: 'translateX(50px)',
                }
            },
            contentContainer: {
                className: 'content-container',
                style: {
                    width: '100%',
                    marginTop: contentTopMargin,
                    opacity: 0,
                    transform: 'translateY(30px)',
                    position: 'relative',
                    zIndex: 5
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
                    position: 'relative', // Needed for transform positioning
                    // MOBILE: Apply vertical and horizontal offset transform only on mobile screens using configured variables.
                    transform: isMobile ? `translate(${mobileUserInfoOffsetX}, ${mobileUserInfoOffsetY})` : 'none',
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
            // Button styles specific to LoggedInTemplate, using standard base
            logoutButton: {
                className: 'nav-button logout-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(255, 99, 71, 0.2)',
                    color: '#ff6347',
                    border: '1px solid rgba(255, 99, 71, 0.4)'
                }
            },
            chatButton: {
                className: 'nav-button chat-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(255, 165, 0, 0.2)', // Orange theme for chat
                    color: '#FFA500',
                    border: '1px solid rgba(255, 165, 0, 0.4)'
                }
            },
            homeButton: { // Renamed from About's home button, points back to About
                className: 'nav-button about-home-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(87, 179, 192, 0.2)', // Teal theme
                    color: '#57b3c0',
                    border: '1px solid rgba(87, 179, 192, 0.4)',
                    textDecoration: 'none'
                }
            },
            analysisButton: { // Analysis button (similar to About's dashboard button)
                className: 'nav-button analysis-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(142, 68, 173, 0.2)', // Purple theme
                    color: '#8e44ad',
                    border: '1px solid rgba(142, 68, 173, 0.4)',
                    marginBottom: isMobile ? '15px' : '20px',
                    position: 'relative', // Needed for transform positioning
                    // MOBILE: Apply vertical offset transform only on mobile screens using configured variable.
                    transform: isMobile ? `translateY(${mobileAnalysisButtonOffsetY})` : 'none',
                }
            },
            // Content styles (consistent with About.jsx)
            contentHeading: {
                style: {
                    fontSize: headingFontSize,
                    marginBottom: isMobile ? '15px' : '20px',
                    color: '#57b3c0',
                    fontWeight: 'bold',
                    position: 'relative', // Needed for transform positioning
                    // MOBILE: Apply vertical offset transform only on mobile screens using configured variable.
                    transform: isMobile ? `translateY(${mobileContentHeadingOffsetY})` : 'none',
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
                    position: 'relative', // Needed for margin adjustments relative to transformed elements
                    // MOBILE: Apply negative marginTop only on mobile screens using configured variable to move section up.
                    marginTop: isMobile ? mobileContentSectionOffsetY : '0px',
                    // Border removed as per original LoggedInTemplate request
                }
            },
            contentSectionHeading: { // Added style for section headings
                style: {
                    fontSize: sectionHeadingFontSize,
                    marginBottom: '10px',
                    color: '#57b3c0', // Consistent heading color
                    fontWeight: '600',
                }
            },
        };
    };

    // Animation helper (consistent with About.jsx)
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
    // 5. UI RENDERING EFFECT WITH IMPROVED CENTERING
    // ====================================
    useEffect(() => {
        // Exit if loading, or if UI already exists
        if (loading) return;
        if (overlayRef.current || document.querySelector('.logged-in-template-overlay')) return;

        // Essential check: Don't render if not logged in or user data missing
        // This prevents errors if the auth check fails or runs slowly.
        if (!isLoggedIn || !userData) {
            console.warn("LoggedInTemplate: Attempted to render UI without authentication. Aborting.");
            // Optionally, trigger redirect here again if component loads before auth check completes
            // navigate('/about');
            return;
        }

        const styles = getStyles();
        // MOBILE: Get mobile status once for use in hover effect logic.
        const isMobile = window.innerWidth <= 768; // Define here for use in hover effect logic
        let panel; // Declare panel variable

        try {
            // --- Create Overlay with improved positioning ---
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            // --- Create Panel with fixed positioning ---
            panel = document.createElement('div'); // Assign to panel variable
            panel.className = styles.panel.className;
            panel.id = 'template-panel'; // Use a specific ID for this template
            Object.assign(panel.style, styles.panel.style);

            // --- Button stack (top-right) ---
            const buttonStackContainer = document.createElement('div');
            buttonStackContainer.id = 'button-stack';
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);

            // Create buttons array for sorting by priority (optional, but good practice)
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
                    id: 'chat-button',
                    text: 'Live Chat',
                    style: styles.chatButton.style,
                    className: styles.chatButton.className,
                    handler: handleChatClick,
                    priority: 2
                },
                { // This button navigates back to the About/Login page
                    id: 'about-home-button',
                    text: 'Home',
                    style: styles.homeButton.style, // Using 'homeButton' style key from getStyles
                    className: styles.homeButton.className,
                    handler: handleHomeClick,
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

            // --- Profile container (top-left) ---
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
            userInfoDiv.id = 'user-info-container'; // Add ID for potential targeting
            // MOBILE: Apply the specific user info styles from getStyles which includes the offset.
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

            // --- Main content area (flows below absolute elements) ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // Main content heading
            const contentHeading = document.createElement('h2');
            contentHeading.id = 'template-main-content-heading'; // Add ID for clarity
            Object.assign(contentHeading.style, styles.contentHeading.style);
            contentHeading.textContent = "Template Main Content"; // Title for this specific template
            contentContainer.appendChild(contentHeading);

            // Analysis Button (placed within content flow)
            const analysisButton = document.createElement('button');
            analysisButton.id = 'analysis-button';
            analysisButton.className = styles.analysisButton.className;
            // MOBILE: Apply the specific analysis button styles from getStyles which includes the offset.
            Object.assign(analysisButton.style, styles.analysisButton.style);
            analysisButton.textContent = 'Open Analysis Dashboard';
            analysisButton.addEventListener('click', handleAnalysisClick);
            contentContainer.appendChild(analysisButton); // Add analysis button here

            // Example content section (This is the section below the main heading)
            const contentSectionDiv = document.createElement('div');
            contentSectionDiv.id = 'template-example-section'; // Add ID for clarity
            Object.assign(contentSectionDiv.style, styles.contentSection.style);

            const contentSectionHeading = document.createElement('h3');
            Object.assign(contentSectionHeading.style, styles.contentSectionHeading.style);
            contentSectionHeading.textContent = "Content Section Example";

            const contentSectionP = document.createElement('p');
            Object.assign(contentSectionP.style, styles.contentText.style);
            contentSectionP.textContent = "This is an example content section within the logged-in template. You can replace this with actual page content relevant to the route using this template.";

            contentSectionDiv.appendChild(contentSectionHeading);
            contentSectionDiv.appendChild(contentSectionP);
            contentContainer.appendChild(contentSectionDiv); // Add example section
            panel.appendChild(contentContainer);

            // --- IMPORTANT: APPEND TO BODY AND ENSURE PROPER CENTERING ---
            // First, remove any existing panels or overlays
            const existingOverlays = document.querySelectorAll('.logged-in-template-overlay, .ui-overlay');
            existingOverlays.forEach(el => {
                if (el !== overlay) el.parentNode?.removeChild(el);
            });

            // Then append the new overlay
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            // Ensure body allows content (reset potential overflow: hidden from About.jsx)
            document.body.style.overflow = 'auto'; // Or 'visible'

            // Force panel to center check (consistent with About.jsx)
            setTimeout(() => {
                // Get viewport dimensions
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Get panel dimensions
                const panelWidth = panel.offsetWidth;
                const panelHeight = panel.offsetHeight;

                // Check if the panel is centered by flexbox; if not, apply fixed positioning as fallback
                const panelRect = panel.getBoundingClientRect();
                const viewportCenterX = window.innerWidth / 2;
                const viewportCenterY = window.innerHeight / 2;
                const panelCenterX = panelRect.left + panelRect.width / 2;
                const panelCenterY = panelRect.top + panelRect.height / 2;
                const xOffset = Math.abs(panelCenterX - viewportCenterX);
                const yOffset = Math.abs(panelCenterY - viewportCenterY);

                // Allow for small deviations (e.g., due to subpixel rendering)
                const tolerance = 10;
                if (xOffset > tolerance || yOffset > tolerance) {
                    // Only apply fixed positioning if flex centering seems to have failed significantly
                    console.warn("LoggedInTemplate: Panel not centered correctly by flexbox, applying fixed position fallback.");
                    panel.style.position = 'fixed';
                    panel.style.top = '50%';
                    panel.style.left = '50%';
                    panel.style.transform = 'translate(-50%, -50%)';
                    panel.style.margin = '0'; // Override margin: auto if using fixed
                } else {
                    console.log("LoggedInTemplate: Panel centered correctly via flexbox.");
                }

                // Debug centering
                console.log(`LoggedInTemplate Panel dimensions: ${panelWidth}x${panelHeight}`);
                console.log(`LoggedInTemplate Viewport dimensions: ${viewportWidth}x${viewportHeight}`);
                console.log(`LoggedInTemplate Panel Rect: top=${panelRect.top}, left=${panelRect.left}`);
                console.log(`LoggedInTemplate Panel calculated center offset: x=${xOffset.toFixed(2)}, y=${yOffset.toFixed(2)}`);

            }, 50); // Increased delay slightly to ensure rendering completes

            // Apply animations (consistent with About.jsx)
            setTimeout(() => {
                // Panel fade in
                if (window.framerMotion && window.framerMotion.animate) {
                    // Use Framer Motion if available
                    window.framerMotion.animate('#template-panel', { opacity: 1 }, { duration: 0.5 });
                    window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#button-stack', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                } else {
                    // Fallback to simple CSS transitions
                    animateElement(panel, { opacity: '1' }, 0);
                    const profileContainerEl = document.getElementById('profile-container');
                    const buttonStackEl = document.getElementById('button-stack');
                    const contentContainerEl = document.getElementById('content-container');

                    if (profileContainerEl) animateElement(profileContainerEl, { opacity: '1', transform: 'translateX(0)' }, 200);
                    if (buttonStackEl) animateElement(buttonStackEl, { opacity: '1', transform: 'translateX(0)' }, 200);
                    if (contentContainerEl) animateElement(contentContainerEl, { opacity: '1', transform: 'translateY(0)' }, 400);
                }

                // Add hover effects to all buttons (consistent with About.jsx)
                const allButtons = document.querySelectorAll('#button-stack button, #analysis-button');
                allButtons.forEach(button => {
                    const originalBackgroundColor = button.style.backgroundColor;
                    const scaleFactor = 'scale(1.05)';
                    let hoverBackgroundColor = originalBackgroundColor; // Default

                    // Define hover colors based on button ID
                    if (button.id === 'logout-button') hoverBackgroundColor = 'rgba(255, 99, 71, 0.3)';
                    else if (button.id === 'chat-button') hoverBackgroundColor = 'rgba(255, 165, 0, 0.3)';
                    else if (button.id === 'about-home-button') hoverBackgroundColor = 'rgba(87, 179, 192, 0.3)';
                    else if (button.id === 'analysis-button') hoverBackgroundColor = 'rgba(142, 68, 173, 0.3)';

                    // MOBILE: Check button ID and isMobile to apply combined transform on hover for analysis button
                    const isAnalysisButtonMobile = isMobile && button.id === 'analysis-button';
                    const mobileOffsetYTransform = isAnalysisButtonMobile ? `translateY(${mobileAnalysisButtonOffsetY}) ` : '';

                    button.addEventListener('mouseenter', () => {
                        button.style.transform = `${mobileOffsetYTransform}${scaleFactor}`; // Combine transforms correctly
                        button.style.backgroundColor = hoverBackgroundColor;
                    });

                    button.addEventListener('mouseleave', () => {
                        button.style.transform = `${mobileOffsetYTransform}scale(1)`; // Revert scale but maintain Y offset if needed
                        button.style.backgroundColor = originalBackgroundColor;
                    });
                });

            }, 100); // Delay animation start slightly

        } catch (error) {
            console.error("LoggedInTemplate: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
                overlayRef.current = null;
            }
            // Clean up body style if error occurs
            document.body.style.overflow = 'auto';
            return;
        }

        // ====================================
        // 6. EVENT HANDLING & CLEANUP
        // ====================================
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("LoggedInTemplate: Reloading due to resize...");
                window.location.reload(); // Simple reload on resize to re-calculate styles
            }, 250);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            // Remove the overlay using the ref if possible
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
            } else {
                // Fallback cleanup if ref is lost or wasn't set
                const fallbackOverlay = document.querySelector('.logged-in-template-overlay');
                if (fallbackOverlay) {
                    fallbackOverlay.remove();
                }
            }
            overlayRef.current = null;

            // Ensure body scroll is restored on unmount
            document.body.style.overflow = 'auto';
        };
    }, [
        isLoggedIn,
        userData,
        loading,
        navigate, // Added navigate
        handleLogout,
        handleChatClick,
        handleHomeClick,
        handleAnalysisClick
    ]); // Dependencies for the main effect

    // Component renders null because the UI is built entirely via DOM manipulation in the useEffect
    return null;
}