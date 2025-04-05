/**
 * LoggedInTemplate.jsx - Template component for logged-in pages
 * ... (rest of comments)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
        // ... (Auth logic remains the same) ...
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
        // ... (Logout logic remains the same) ...
        if (window.google && window.google.accounts && window.google.accounts.id) { window.google.accounts.id.disableAutoSelect(); }
        setUserData(null); setIsLoggedIn(false); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData');
        redirectToLogin("User logged out");
    };

    // ====================================
    // 3. STYLING CONFIGURATION (REVISED - Absolute Profile Top-Left)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // --- Define spacing & positioning values ---
        const panelPaddingTop = isMobile ? '100px' : '130px'; // << KEY: Space above flowed content START
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';

        // Absolute positions (relative to panel edges)
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides; // Align with panel side padding
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides; // Align with panel side padding
        const buttonStackGap = isMobile ? '10px' : '15px';


        return {
            overlay: {
                className: 'ui-overlay logged-in-template-overlay',
                style: {
                    zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: isMobile ? '10px' : '50px', boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel logged-in-template-panel',
                style: {
                    position: 'relative', // << IMPORTANT: For absolute children
                    width: isMobile ? '95%' : '85%', maxWidth: '1200px',
                    height: isMobile ? '90vh' : '85vh', backgroundColor: 'rgba(13, 20, 24, 0.9)',
                    borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    // --- Padding adjusted for absolute elements ---
                    paddingTop: panelPaddingTop, // << Space for content below absolute elements
                    paddingLeft: panelPaddingSides,
                    paddingRight: panelPaddingSides,
                    paddingBottom: panelPaddingBottom,
                    color: 'white', pointerEvents: 'auto', overflowY: 'auto',
                    boxSizing: 'border-box',
                }
            },
            // --- Profile Section (Absolute Positioning Top-Left) ---
            profileContainer: {
                style: {
                    position: 'absolute', // << Absolute
                    top: profileTop,
                    left: profileLeft,
                    display: 'flex', alignItems: 'center',
                    gap: '15px',
                    zIndex: 10, // Ensure above potential background elements
                    // Removed marginBottom, paddingBottom, borderBottom, width: 100%
                }
            },
            profilePhoto: { style: { width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0, } }, // Slightly smaller photo
            profilePhotoPlaceholder: { style: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', flexShrink: 0, } },
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left', } },
            userName: { style: { margin: '0', fontSize: isMobile ? '15px' : '17px', color: '#a7d3d8', fontWeight: '500', } }, // Slightly smaller text
            userEmail: { style: { margin: '2px 0 0 0', fontSize: isMobile ? '11px' : '13px', color: '#7a9a9e', } }, // Slightly smaller text

            // --- Button Stack (Absolute Positioning Top-Right) ---
            buttonStackContainer: {
                style: {
                    position: 'absolute', // Relative to panel
                    top: buttonStackTop,
                    right: buttonStackRight, // Align with panel side padding
                    display: 'flex', flexDirection: 'column',
                    gap: buttonStackGap,
                    zIndex: 10, // Ensure above flowed content
                    alignItems: 'flex-end', // Align buttons themselves to the right edge of the stack container
                }
            },
            // Button styles (fit-content makes them align right via alignItems on container)
            logoutButton: { className: 'nav-button logout-button', style: { fontSize: isMobile ? '12px' : '14px', backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            chatButton: { className: 'nav-button chat-button', style: { fontSize: isMobile ? '12px' : '14px', backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            homeButton: { className: 'nav-button home-button', style: { fontSize: isMobile ? '12px' : '14px', backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', width: 'fit-content' } },

            // --- Header ("Dashboard") Title - REMOVED from layout flow ---
            // We are not using a separate H1 title in this layout

            // --- Main Content Section (Flows Below Absolute Elements due to Panel Padding) ---
            contentContainer: {
                className: 'content-container',
                style: {
                    // Position is static (default), flows normally
                    // It starts below the panel's paddingTop
                    width: '100%', // Takes full width within padding
                }
            },
            // Content inner styles remain the same
            contentHeading: { style: { fontSize: isMobile ? '20px' : '24px', marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', } },
            contentText: { style: { fontSize: isMobile ? '15px' : '16px', marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', } },
            contentSection: { style: { backgroundColor: 'rgba(87, 179, 192, 0.05)', padding: isMobile ? '15px' : '20px', borderRadius: '8px', marginBottom: isMobile ? '15px' : '20px', border: '1px solid rgba(87, 179, 192, 0.1)', } },
            contentSectionHeading: { style: { fontSize: isMobile ? '18px' : '20px', marginBottom: '10px', color: '#57b3c0', fontWeight: '600', } },

            // --- Footer Button Container - REMOVED (Home button is in top-right stack) ---
        };
    };


    // ====================================
    // 4. UI RENDERING EFFECT (REVISED - Absolute Profile/Buttons, Remove Header)
    // ====================================
    useEffect(() => {
        // console.log(`LoggedInTemplate: UI Effect Running: isLoggedIn=${isLoggedIn}, loading=${loading}, userData=${!!userData}`);
        if (loading) { return; }
        if (!isLoggedIn || !userData) { if (overlayRef.current && overlayRef.current.parentNode) { overlayRef.current.remove(); overlayRef.current = null; } return; }
        if (overlayRef.current || document.querySelector('.logged-in-template-overlay')) { return; }
        // console.log("LoggedInTemplate: UI Effect: Proceeding to render UI...");
        const styles = getStyles(); const isMobile = window.innerWidth <= 768; let panel;
        try {
            // Create Overlay and Panel
            const overlay = document.createElement('div'); overlay.className = styles.overlay.className; Object.assign(overlay.style, styles.overlay.style); overlayRef.current = overlay;
            panel = document.createElement('div'); panel.className = styles.panel.className; Object.assign(panel.style, styles.panel.style);

            // --- CREATE ABSOLUTE BUTTON STACK (Top-Right) ---
            const buttonStackContainer = document.createElement('div'); Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);
            const logoutButton = document.createElement('button'); logoutButton.id = 'logout-button'; logoutButton.className = styles.logoutButton.className; Object.assign(logoutButton.style, styles.logoutButton.style); logoutButton.textContent = 'Logout'; buttonStackContainer.appendChild(logoutButton);
            const chatButton = document.createElement('button'); chatButton.id = 'chat-button'; chatButton.className = styles.chatButton.className; Object.assign(chatButton.style, styles.chatButton.style); chatButton.textContent = 'Live Chat'; buttonStackContainer.appendChild(chatButton);
            const homeButton = document.createElement('button'); homeButton.id = 'home-button'; homeButton.className = styles.homeButton.className; Object.assign(homeButton.style, styles.homeButton.style); homeButton.textContent = 'Back to Home'; buttonStackContainer.appendChild(homeButton);
            panel.appendChild(buttonStackContainer); // Add button stack to panel

            // --- CREATE ABSOLUTE PROFILE INFO (Top-Left) ---
            const profileContainer = document.createElement('div'); Object.assign(profileContainer.style, styles.profileContainer.style); // Uses absolute styles now
            const profilePhotoEl = document.createElement(userData.picture ? 'img' : 'div'); if (userData.picture) { profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile"; Object.assign(profilePhotoEl.style, styles.profilePhoto.style); } else { profilePhotoEl.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U'; Object.assign(profilePhotoEl.style, styles.profilePhotoPlaceholder.style); } profileContainer.appendChild(profilePhotoEl);
            const userInfoDiv = document.createElement('div'); Object.assign(userInfoDiv.style, styles.userInfo.style); const userNameEl = document.createElement('h3'); Object.assign(userNameEl.style, styles.userName.style); userNameEl.textContent = `${userData.name || 'User'}`; const userEmailEl = document.createElement('p'); Object.assign(userEmailEl.style, styles.userEmail.style); userEmailEl.textContent = userData.email || 'No email provided'; userInfoDiv.appendChild(userNameEl); userInfoDiv.appendChild(userEmailEl); profileContainer.appendChild(userInfoDiv);
            panel.appendChild(profileContainer); // Add profile container to panel

            // --- REMOVE HEADER ("Dashboard") TITLE ---
            // No headerTitle element created or appended

            // --- CREATE FLOWED CONTENT AREA ---
            // This content starts below the panel's paddingTop
            const contentContainer = document.createElement('div'); contentContainer.className = styles.contentContainer.className; Object.assign(contentContainer.style, styles.contentContainer.style);
            const contentHeading = document.createElement('h2'); Object.assign(contentHeading.style, styles.contentHeading.style); contentHeading.textContent = "Template Main Content";
            const contentSectionDiv = document.createElement('div'); Object.assign(contentSectionDiv.style, styles.contentSection.style);
            const contentSectionHeading = document.createElement('h3'); Object.assign(contentSectionHeading.style, styles.contentSectionHeading.style); contentSectionHeading.textContent = "Content Section Example";
            const contentSectionP = document.createElement('p'); Object.assign(contentSectionP.style, styles.contentText.style); contentSectionP.textContent = "This is an example content section with different styling to show how you can organize your page content.";
            contentSectionDiv.appendChild(contentSectionHeading); contentSectionDiv.appendChild(contentSectionP);
            contentContainer.appendChild(contentHeading);
            contentContainer.appendChild(contentSectionDiv);
            panel.appendChild(contentContainer); // Add content container to panel flow

            // --- REMOVE Footer Home Button Container ---
            // Home button is now in the top-right stack

            // --- APPEND TO BODY ---
            overlay.appendChild(panel); document.body.appendChild(overlay);
            // console.log("LoggedInTemplate: UI Effect: Successfully created and appended overlay.");
        } catch (error) { console.error("LoggedInTemplate: Error during UI element creation:", error); if (overlayRef.current && overlayRef.current.parentNode === document.body) { overlayRef.current.remove(); overlayRef.current = null; } return; }

        // ====================================
        // 5. EVENT HANDLING & CLEANUP (No changes needed here)
        // ====================================
        let resizeTimeout; const handleResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { console.log("LoggedInTemplate: Reloading due to resize..."); window.location.reload(); }, 250); }; window.addEventListener('resize', handleResize);
        const homeBtn = document.getElementById('home-button'); if (homeBtn) homeBtn.addEventListener('click', () => navigate('/')); else console.error("LoggedInTemplate: Home button not found");
        const chatBtn = document.getElementById('chat-button'); if (chatBtn) chatBtn.addEventListener('click', () => navigate('/chat')); else console.error("LoggedInTemplate: Chat button not found");
        const logoutBtn = document.getElementById('logout-button'); if (logoutBtn) logoutBtn.addEventListener('click', handleLogout); else console.error("LoggedInTemplate: Logout button not found");
        return () => {
            // console.log("LoggedInTemplate: Cleanup Function Running");
            window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout);
            if (overlayRef.current && overlayRef.current.parentNode) { overlayRef.current.remove(); }
            else { const fallbackOverlay = document.querySelector('.logged-in-template-overlay'); if (fallbackOverlay) { fallbackOverlay.remove(); } }
            overlayRef.current = null;
        };
    }, [isLoggedIn, userData, loading, navigate]);

    // ====================================
    // 6. TEMPLATE-SPECIFIC FUNCTIONS
    // ====================================
    const handleCustomAction = () => { console.log('Custom action triggered on template page'); };

    return null; // Component renders null, UI handled by effect
}