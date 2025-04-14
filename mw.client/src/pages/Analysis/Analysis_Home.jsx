/**
 * Analysis_Home.jsx - Analysis Dashboard Component
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../style/AboutStyle.css"; // Correct path to styles

export default function Analysis_Home() {
    // ====================================
    // 1. COMPONENT SETUP & STATE INITIALIZATION
    // ====================================
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);

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
            } catch (error) {
                console.error('Analysis_Home: Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        } else {
            setIsLoggedIn(false);
            setUserData(null);
        }
        setLoading(false);
        if (!isAuthenticated && !loading) {
            console.warn("Analysis_Home: Auth check complete, user not authenticated. Redirecting...");
            redirectToLogin("Not authenticated after check");
        }
    }, []);

    // Redirect function
    const redirectToLogin = (reason) => {
        navigate('/about');
    };

    // Logout handler
    const handleLogout = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        redirectToLogin("User logged out");
    };

    // ====================================
    // 3. STYLING CONFIGURATION (WITH ANIMATION PROPERTIES)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // *** GLOBAL SIZE CONFIGURATION ***
        // Panel sizing (25% smaller than LoggedInTemplate)
        const sizeFactor = 0.75; // 25% smaller (75% of original size)

        // Desktop-specific panel size with 25% reduction
        const desktopPanelWidth = isMobile ? '95%' : `calc(85% * ${sizeFactor})`; // 25% smaller
        const desktopPanelHeight = isMobile ? '90vh' : `calc(85vh * ${sizeFactor})`; // 25% smaller
        const desktopMaxWidth = isMobile ? '1200px' : `calc(1200px * ${sizeFactor})`; // 25% smaller
        // *** END GLOBAL SIZE CONFIGURATION ***

        // *** PANEL PADDING CONFIGURATION ***
        const panelPaddingTop = isMobile ? '20px' : '30px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        // *** END PANEL PADDING CONFIGURATION ***

        // ****** CONTENT VERTICAL POSITION CONFIGURATION ****** 
        // This variable controls the space between the top of the panel and the content
        // Increase this to push content down further below buttons
        const contentTopOffsetMobile = '180px';
        const contentTopOffsetDesktop = '140px';
        // ****** END CONTENT VERTICAL POSITION CONFIGURATION ******

        // *** CONTENT MARGIN CONFIGURATION ***
        const profileTopMargin = isMobile ? '10px' : '20px';
        // Content sections side margins for preventing horizontal scroll
        const contentSidePadding = '15px'; // Space to prevent horizontal scroll
        // Content right padding (to avoid button overlap)
        const contentRightPadding = isMobile ? '20px' : '120px'; // Extra space on right for buttons
        // *** END CONTENT MARGIN CONFIGURATION ***

        // *** BUTTON POSITION CONFIGURATION ***
        const sideButtonsTop = isMobile ? '20px' : '30px';
        const sideButtonsRight = panelPaddingSides;
        const buttonGap = '10px';
        // *** END BUTTON POSITION CONFIGURATION ***

        // *** FONT SIZE CONFIGURATION ***
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)'; // 35% larger heading for desktop
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)'; // 35% larger text for desktop
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)'; // 35% larger section heading for desktop
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)'; // 35% larger username for desktop
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)'; // 35% larger email for desktop
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)'; // 35% larger button text for desktop
        // *** END FONT SIZE CONFIGURATION ***

        return {
            overlay: {
                className: 'ui-overlay analysis-overlay',
                style: {
                    zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: isMobile ? '10px' : '50px', boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel analysis-panel',
                style: {
                    position: 'relative',
                    width: desktopPanelWidth, maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight, backgroundColor: 'rgba(13, 20, 24, 0.9)',
                    borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    padding: panelPaddingTop + ' ' + panelPaddingSides + ' ' + panelPaddingBottom + ' ' + panelPaddingSides,
                    color: 'white', pointerEvents: 'auto',
                    overflowY: 'auto', // Make the panel vertically scrollable
                    overflowX: 'hidden', // Prevent horizontal scrolling
                    boxSizing: 'border-box',
                    opacity: 0, // Start with opacity 0 for animation
                    WebkitOverflowScrolling: 'touch', // Improve scrolling on iOS
                    msOverflowStyle: 'none', // Hide scrollbar in IE and Edge
                    scrollbarWidth: 'thin', // Thin scrollbar in Firefox
                }
            },
            profileContainer: {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                    marginTop: profileTopMargin,
                    width: 'calc(100% - ' + contentRightPadding + ')', // Prevent horizontal overflow
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateX(-50px)', // Start off-screen for animation
                }
            },
            sideButtonsContainer: {
                style: {
                    position: 'absolute',
                    top: sideButtonsTop,
                    right: sideButtonsRight,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: buttonGap,
                    zIndex: 100,
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateX(50px)', // Start off-screen for animation
                }
            },
            contentContainer: {
                style: {
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    paddingRight: contentRightPadding, // Space for buttons
                    paddingLeft: contentSidePadding,
                    marginTop: isMobile ? contentTopOffsetMobile : contentTopOffsetDesktop, // Using the configurable top offset
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateY(30px)', // Start below for animation
                }
            },
            titleHeading: {
                style: {
                    fontSize: headingFontSize,
                    color: '#57b3c0',
                    fontWeight: 'bold',
                    marginBottom: '30px',
                    width: 'calc(100% - ' + contentRightPadding + ')', // Prevent horizontal overflow
                    overflowWrap: 'break-word', // Prevent text overflow
                    wordWrap: 'break-word',
                    hyphens: 'auto',
                }
            },
            profilePhoto: {
                style: {
                    width: isMobile ? '45px' : '60px', // Larger profile photo for desktop
                    height: isMobile ? '45px' : '60px', // Larger profile photo for desktop
                    borderRadius: '50%',
                    border: '2px solid #57b3c0',
                    objectFit: 'cover',
                    flexShrink: 0,
                }
            },
            profilePhotoPlaceholder: {
                style: {
                    width: isMobile ? '45px' : '60px', // Larger placeholder for desktop
                    height: isMobile ? '45px' : '60px', // Larger placeholder for desktop
                    borderRadius: '50%',
                    backgroundColor: '#57b3c0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isMobile ? '18px' : '24px', // Larger letter for desktop
                    flexShrink: 0,
                }
            },
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left', } },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500', } },
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e', } },
            logoutButton: { className: 'nav-button logout-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            chatButton: { className: 'nav-button chat-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            homeButton: { className: 'nav-button home-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', width: 'fit-content' } },
            dashboardButton: { className: 'nav-button dashboard-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad', border: '1px solid rgba(142, 68, 173, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            contentHeading: { style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', } },
            contentText: { style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', } },
            contentSection: {
                style: {
                    backgroundColor: 'rgba(87, 179, 192, 0.05)',
                    padding: isMobile ? '15px' : '20px',
                    borderRadius: '8px',
                    marginBottom: isMobile ? '25px' : '30px',
                    border: '1px solid rgba(87, 179, 192, 0.1)',
                    maxWidth: '100%',
                    overflowWrap: 'break-word', // Prevent text overflow
                    wordWrap: 'break-word',
                    boxSizing: 'border-box',
                }
            },
            contentSectionHeading: { style: { fontSize: sectionHeadingFontSize, marginBottom: '15px', color: '#57b3c0', fontWeight: '600', } },
        };
    };

    // Simple animation function using setTimeout and transitions
    const animateElement = (element, properties, delay = 0) => {
        if (!element) return;

        setTimeout(() => {
            // Add CSS transition
            element.style.transition = 'all 0.5s ease-out';

            // Apply animation properties
            Object.keys(properties).forEach(prop => {
                element.style[prop] = properties[prop];
            });
        }, delay);
    };

    // ====================================
    // 4. UI RENDERING EFFECT (WITH ANIMATIONS)
    // ====================================
    useEffect(() => {
        if (loading) { return; }
        if (!isLoggedIn || !userData) {
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove(); overlayRef.current = null;
            }
            return;
        }
        if (overlayRef.current || document.querySelector('.analysis-overlay')) { return; }

        const styles = getStyles();
        const isMobile = window.innerWidth <= 768;
        let panel;

        try {
            // Create Overlay and Panel
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'analysis-panel';
            Object.assign(panel.style, styles.panel.style);
            panelRef.current = panel;

            // --- CREATE PROFILE INFO (Top-Left) ---
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

            // --- CREATE SIDE BUTTONS (Right) ---
            const sideButtonsContainer = document.createElement('div');
            sideButtonsContainer.id = 'side-buttons-container';
            Object.assign(sideButtonsContainer.style, styles.sideButtonsContainer.style);

            // Create buttons array for sorting by size/priority
            const buttonsConfig = [
                {
                    id: 'logout-button',
                    text: 'Logout',
                    style: styles.logoutButton.style,
                    className: styles.logoutButton.className,
                    handler: () => handleLogout(),
                    priority: 1
                },
                {
                    id: 'chat-button',
                    text: 'Live Chat',
                    style: styles.chatButton.style,
                    className: styles.chatButton.className,
                    handler: () => navigate('/chat'),
                    priority: 2
                },
                {
                    id: 'dashboard-button',
                    text: 'Back to Dashboard',
                    style: styles.dashboardButton.style,
                    className: styles.dashboardButton.className,
                    handler: () => navigate('/loggedintemplate'),
                    priority: 3
                },
                {
                    id: 'home-button',
                    text: 'Back to Home',
                    style: styles.homeButton.style,
                    className: styles.homeButton.className,
                    handler: () => navigate('/'),
                    priority: 4
                }
            ];

            // Sort buttons by priority (ascending)
            buttonsConfig.sort((a, b) => a.priority - b.priority);

            // Create and add buttons in sorted order
            buttonsConfig.forEach(config => {
                const button = document.createElement('button');
                button.id = config.id;
                button.className = config.className;
                Object.assign(button.style, config.style);
                button.textContent = config.text;
                button.addEventListener('click', config.handler);
                sideButtonsContainer.appendChild(button);
            });

            panel.appendChild(sideButtonsContainer);

            // --- CREATE CONTENT AREA ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // Add title heading to content container
            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.contentHeading.style);
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);

            // Add single content section with Lorem Ipsum
            const contentSection = document.createElement('div');
            Object.assign(contentSection.style, styles.contentSection.style);

            // Add lorem ipsum content
            for (let i = 1; i <= 7; i++) {
                const paragraph = document.createElement('p');
                Object.assign(paragraph.style, styles.contentText.style);

                // First paragraph has more specific content
                if (i === 1) {
                    paragraph.textContent = "Welcome to the Analysis Dashboard. This is where you can view and analyze your data, create visualizations, and generate reports based on the information collected from various sources.";
                } else {
                    // Different lorem ipsum paragraphs
                    const loremTexts = [
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.",
                        "Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam.",
                        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum.",
                        "Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim.",
                        "Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper. Nulla facilisi. Integer lacinia sollicitudin massa. Cras metus.",
                        "Sed aliquet risus a tortor. Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante."
                    ];

                    paragraph.textContent = loremTexts[(i - 2) % loremTexts.length];
                }

                contentSection.appendChild(paragraph);
            }

            contentContainer.appendChild(contentSection);
            panel.appendChild(contentContainer);

            // --- APPEND TO BODY ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            // Apply animations using setTimeout (Pure DOM, no external dependencies)
            setTimeout(() => {
                // Panel fade in
                if (window.framerMotion && window.framerMotion.animate) {
                    // If Framer Motion is available from CDN
                    window.framerMotion.animate('#analysis-panel', { opacity: 1 }, { duration: 0.5 });

                    // Profile container animation
                    window.framerMotion.animate('#profile-container', {
                        opacity: 1,
                        x: 0
                    }, {
                        duration: 0.5,
                        delay: 0.2,
                        ease: 'easeOut'
                    });

                    // Button container animation
                    window.framerMotion.animate('#side-buttons-container', {
                        opacity: 1,
                        x: 0
                    }, {
                        duration: 0.5,
                        delay: 0.2,
                        ease: 'easeOut'
                    });

                    // Content animation
                    window.framerMotion.animate('#content-container', {
                        opacity: 1,
                        y: 0
                    }, {
                        duration: 0.5,
                        delay: 0.4,
                        ease: 'easeOut'
                    });
                } else {
                    // Fallback to simple CSS transitions
                    animateElement(panel, { opacity: '1' }, 0);
                    animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(sideButtonsContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                }

                // Add hover effects to buttons
                const buttons = document.querySelectorAll('#side-buttons-container button');
                buttons.forEach(button => {
                    button.addEventListener('mouseenter', () => {
                        button.style.transform = 'scale(1.05)';
                        button.style.transition = 'transform 0.2s ease';
                    });

                    button.addEventListener('mouseleave', () => {
                        button.style.transform = 'scale(1)';
                        button.style.transition = 'transform 0.2s ease';
                    });
                });

                // Ensure mobile scrolling works
                if (isMobile) {
                    // Add specific mobile scrolling styles
                    panel.style.overflowY = 'scroll';
                    panel.style['-webkit-overflow-scrolling'] = 'touch';

                    // Add touchstart listener to improve scroll responsiveness on mobile
                    panel.addEventListener('touchstart', function () {
                        // This empty handler improves scroll performance on iOS
                    }, { passive: true });
                }

                // Make side buttons container stay in position when scrolling
                panel.addEventListener('scroll', function () {
                    const sideButtons = document.getElementById('side-buttons-container');
                    if (sideButtons) {
                        const initialTop = isMobile ? 20 : 30; // Same as sideButtonsTop
                        sideButtons.style.top = `${initialTop + panel.scrollTop}px`;
                    }
                });
            }, 100);
        } catch (error) {
            console.error("Analysis_Home: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove(); overlayRef.current = null;
            }
            return;
        }

        // ====================================
        // 5. EVENT HANDLING & CLEANUP
        // ====================================
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("Analysis_Home: Reloading due to resize...");
                window.location.reload();
            }, 250);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
            } else {
                const fallbackOverlay = document.querySelector('.analysis-overlay');
                if (fallbackOverlay) {
                    fallbackOverlay.remove();
                }
            }

            overlayRef.current = null;
            panelRef.current = null;
        };
    }, [isLoggedIn, userData, loading, navigate, handleLogout]);

    return null; // Component renders null, UI handled by effect test
}