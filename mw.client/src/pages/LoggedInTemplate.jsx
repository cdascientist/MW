/**
 * LoggedInTemplate.jsx - Template component for logged-in pages
 * Updated with 35% larger panel and text for desktop only
 * Fixed layout to prevent content from covering buttons
 * Removed borders around sections and pushed Template Main Content up
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import "../style/AboutStyle.css"; // Reusing styling

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
    // 2. AUTHENTICATION VERIFICATION & REDIRECTION
    // ====================================
    useEffect(() => {
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');
        let isAuthenticated = false;
        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData); setUserData(parsedUserData); setIsLoggedIn(true); isAuthenticated = true;
            } catch (error) { console.error('LoggedInTemplate: Failed to parse saved user data:', error); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData'); }
        } else { setIsLoggedIn(false); setUserData(null); }
        setLoading(false);
        if (!isAuthenticated && !loading) { console.warn("LoggedInTemplate: Auth check complete, user not authenticated. Redirecting..."); redirectToLogin("Not authenticated after check"); }
    }, []);

    // Redirect function
    const redirectToLogin = (reason) => { navigate('/about'); };

    // Logout handler
    const handleLogout = () => {
        if (window.google && window.google.accounts && window.google.accounts.id) { window.google.accounts.id.disableAutoSelect(); }
        setUserData(null); setIsLoggedIn(false); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData');
        redirectToLogin("User logged out");
    };

    // Navigation handlers
    const handleChatClick = () => {
        console.log("Navigating to chat");
        navigate('/chat');
    };

    const handleHomeClick = () => {
        console.log("Navigating to about page");
        navigate('/about');
    };

    const handleAnalysisClick = () => {
        console.log("Navigating to analysis dashboard");
        navigate('/analysis/home');
    };

    // ====================================
    // 3. STYLING CONFIGURATION (WITH ANIMATION PROPERTIES)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // --- Define spacing & positioning values ---
        const panelPaddingTop = isMobile ? '100px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';

        // Desktop-specific panel size enhancement (35% larger)
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)'; // 35% wider for desktop
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)'; // 35% taller for desktop
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)'; // 35% larger max width

        // Text size enhancement (35% larger for desktop only)
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)'; // 35% larger heading for desktop
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)'; // 35% larger text for desktop
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)'; // 35% larger section heading for desktop
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)'; // 35% larger username for desktop
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)'; // 35% larger email for desktop
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)'; // 35% larger button text for desktop

        // Absolute positions (relative to panel edges)
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';

        // Content top position (pushed down to avoid overlap)
        // MODIFIED: Reduced top margin to push content up
        const contentTopMargin = isMobile ? '120px' : '130px'; // Reduced from 150px/170px

        // Standard button style (base styles for all buttons)
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

        return {
            overlay: {
                className: 'ui-overlay logged-in-template-overlay',
                style: {
                    zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    pointerEvents: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: isMobile ? '10px' : '50px', boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel logged-in-template-panel',
                style: {
                    position: 'relative',
                    width: desktopPanelWidth, maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight, backgroundColor: 'rgba(13, 20, 24, 0.9)',
                    borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    paddingTop: panelPaddingTop,
                    paddingLeft: panelPaddingSides,
                    paddingRight: panelPaddingSides,
                    paddingBottom: panelPaddingBottom,
                    color: 'white', pointerEvents: 'auto', overflowY: 'auto',
                    boxSizing: 'border-box',
                    opacity: 0, // Start with opacity 0 for animation
                }
            },
            profileContainer: {
                style: {
                    position: 'absolute',
                    top: profileTop,
                    left: profileLeft,
                    display: 'flex', alignItems: 'center',
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
                    display: 'flex', flexDirection: 'column',
                    gap: buttonStackGap,
                    zIndex: 100, // Higher z-index to ensure buttons are above content
                    alignItems: 'flex-end',
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateX(50px)', // Start off-screen for animation
                    pointerEvents: 'auto'
                }
            },
            contentContainer: {
                className: 'content-container',
                style: {
                    width: '100%',
                    marginTop: contentTopMargin, // MODIFIED: Reduced top margin to push content up
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateY(30px)', // Start below for animation
                    position: 'relative',
                    zIndex: 5 // Lower z-index than buttons
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
                    backgroundColor: 'rgba(255, 165, 0, 0.2)',
                    color: '#FFA500',
                    border: '1px solid rgba(255, 165, 0, 0.4)'
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
            analysisButton: {
                className: 'nav-button analysis-button',
                style: {
                    ...standardButtonStyle,
                    backgroundColor: 'rgba(142, 68, 173, 0.2)',
                    color: '#8e44ad',
                    border: '1px solid rgba(142, 68, 173, 0.4)',
                    marginBottom: '20px'
                }
            },
            contentHeading: { style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', } },
            contentText: { style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', } },
            contentSection: {
                style: {
                    backgroundColor: 'rgba(87, 179, 192, 0.05)',
                    padding: isMobile ? '15px' : '20px',
                    borderRadius: '8px',
                    marginBottom: isMobile ? '15px' : '20px',
                    // MODIFIED: Removed the border property completely
                }
            },
            contentSectionHeading: { style: { fontSize: sectionHeadingFontSize, marginBottom: '10px', color: '#57b3c0', fontWeight: '600', } },
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
        if (overlayRef.current || document.querySelector('.logged-in-template-overlay')) { return; }

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
            panel.id = 'template-panel';
            Object.assign(panel.style, styles.panel.style);

            // --- CREATE ABSOLUTE BUTTON STACK (Top-Right) ---
            const buttonStackContainer = document.createElement('div');
            buttonStackContainer.id = 'button-stack';
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);

            // Create Logout Button
            const logoutButton = document.createElement('button');
            logoutButton.id = 'logout-button';
            logoutButton.className = styles.logoutButton.className;
            Object.assign(logoutButton.style, styles.logoutButton.style);
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', handleLogout);
            logoutButton.addEventListener('mouseenter', () => {
                logoutButton.style.transform = 'scale(1.05)';
                logoutButton.style.backgroundColor = 'rgba(255, 99, 71, 0.3)';
            });
            logoutButton.addEventListener('mouseleave', () => {
                logoutButton.style.transform = 'scale(1)';
                logoutButton.style.backgroundColor = 'rgba(255, 99, 71, 0.2)';
            });
            buttonStackContainer.appendChild(logoutButton);

            // Create Chat Button
            const chatButton = document.createElement('button');
            chatButton.id = 'chat-button';
            chatButton.className = styles.chatButton.className;
            Object.assign(chatButton.style, styles.chatButton.style);
            chatButton.textContent = 'Live Chat';
            chatButton.addEventListener('click', handleChatClick);
            chatButton.addEventListener('mouseenter', () => {
                chatButton.style.transform = 'scale(1.05)';
                chatButton.style.backgroundColor = 'rgba(255, 165, 0, 0.3)';
            });
            chatButton.addEventListener('mouseleave', () => {
                chatButton.style.transform = 'scale(1)';
                chatButton.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
            });
            buttonStackContainer.appendChild(chatButton);

            // Create Home Button with explicit styling and event handlers
            const homeButton = document.createElement('button');
            homeButton.id = 'home-button';
            homeButton.className = styles.homeButton.className;
            Object.assign(homeButton.style, styles.homeButton.style);
            homeButton.textContent = 'Back to About';
            homeButton.addEventListener('click', handleHomeClick);
            homeButton.addEventListener('mouseenter', () => {
                homeButton.style.transform = 'scale(1.05)';
                homeButton.style.backgroundColor = 'rgba(87, 179, 192, 0.3)';
            });
            homeButton.addEventListener('mouseleave', () => {
                homeButton.style.transform = 'scale(1)';
                homeButton.style.backgroundColor = 'rgba(87, 179, 192, 0.2)';
            });
            buttonStackContainer.appendChild(homeButton);

            panel.appendChild(buttonStackContainer);

            // --- CREATE ABSOLUTE PROFILE INFO (Top-Left) ---
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

            // --- CREATE FLOWED CONTENT AREA (PUSHED DOWN TO AVOID OVERLAP) ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.contentHeading.style);
            contentHeading.textContent = "Template Main Content";

            // Create Analysis Button in the content section with explicit event handlers
            const analysisButton = document.createElement('button');
            analysisButton.id = 'analysis-button';
            analysisButton.className = styles.analysisButton.className;
            Object.assign(analysisButton.style, styles.analysisButton.style);
            analysisButton.textContent = 'Open Analysis Dashboard';
            analysisButton.addEventListener('click', handleAnalysisClick);
            analysisButton.addEventListener('mouseenter', () => {
                analysisButton.style.transform = 'scale(1.05)';
                analysisButton.style.backgroundColor = 'rgba(142, 68, 173, 0.3)';
            });
            analysisButton.addEventListener('mouseleave', () => {
                analysisButton.style.transform = 'scale(1)';
                analysisButton.style.backgroundColor = 'rgba(142, 68, 173, 0.2)';
            });

            const contentSectionDiv = document.createElement('div');
            Object.assign(contentSectionDiv.style, styles.contentSection.style);

            const contentSectionHeading = document.createElement('h3');
            Object.assign(contentSectionHeading.style, styles.contentSectionHeading.style);
            contentSectionHeading.textContent = "Content Section Example";

            const contentSectionP = document.createElement('p');
            Object.assign(contentSectionP.style, styles.contentText.style);
            contentSectionP.textContent = "This is an example content section with different styling to show how you can organize your page content.";

            contentSectionDiv.appendChild(contentSectionHeading);
            contentSectionDiv.appendChild(contentSectionP);
            contentContainer.appendChild(contentHeading);
            contentContainer.appendChild(analysisButton); // Add analysis button right after heading
            contentContainer.appendChild(contentSectionDiv);
            panel.appendChild(contentContainer);

            // --- APPEND TO BODY ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            // Debug positioning - add outlines to help visualize the layout
            buttonStackContainer.style.outline = '1px dashed rgba(255, 255, 255, 0.3)';
            contentContainer.style.outline = '1px dashed rgba(255, 255, 255, 0.3)';

            // Apply animations using setTimeout
            setTimeout(() => {
                // Panel fade in
                if (window.framerMotion && window.framerMotion.animate) {
                    window.framerMotion.animate('#template-panel', { opacity: 1 }, { duration: 0.5 });
                    window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#button-stack', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                } else {
                    // Fallback to simple CSS transitions
                    animateElement(panel, { opacity: '1' }, 0);
                    animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(buttonStackContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                }
            }, 100);

            // Verify all buttons are clickable by adding debug info
            console.log('Buttons initialized:', {
                logoutButton: document.getElementById('logout-button'),
                chatButton: document.getElementById('chat-button'),
                homeButton: document.getElementById('home-button'),
                analysisButton: document.getElementById('analysis-button')
            });

        } catch (error) {
            console.error("LoggedInTemplate: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode === document.body) {
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
                console.log("LoggedInTemplate: Reloading due to resize...");
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
                const fallbackOverlay = document.querySelector('.logged-in-template-overlay');
                if (fallbackOverlay) {
                    fallbackOverlay.remove();
                }
            }

            overlayRef.current = null;
        };
    }, [isLoggedIn, userData, loading, navigate, handleLogout, handleChatClick, handleHomeClick, handleAnalysisClick]);

    return null; // Component renders null, UI handled by effect
}