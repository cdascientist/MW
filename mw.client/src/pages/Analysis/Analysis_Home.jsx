/**
 * Analysis_Home.jsx - Specific component for the Analysis Dashboard homepage.
 * REVISED: Attempting robust direct DOM manipulation for dropdown rendering via useEffect.
 * Uses placeholder data to isolate rendering logic.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../style/AboutStyle.css"; // Reusing styling

// --- PLACEHOLDER CLIENT DATA ---
const PLACEHOLDER_CLIENTS = [ /* ... placeholder data ... */ { firstName: 'Alice', lastName: 'Smith' }, { firstName: 'Bob', lastName: 'Johnson' }, { firstName: 'Charlie', lastName: 'Williams' }, { firstName: 'Diana', lastName: 'Brown' }, { firstName: 'Ethan', lastName: 'Jones' },];
PLACEHOLDER_CLIENTS.sort((a, b) => { /* ... sorting ... */ const lastNameComp = (a.lastName || '').localeCompare(b.lastName || ''); if (lastNameComp !== 0) return lastNameComp; return (a.firstName || '').localeCompare(b.firstName || ''); });

// --- Unique IDs for Manual Elements ---
const DROPDOWN_CONTAINER_ID = 'manual-dropdown-container';
const DROPDOWN_SELECT_ID = 'manual-dropdown-select';
const METRICS_SECTION_ID = 'manual-metrics-section'; // ID for the parent section

export default function Analysis_Home() {
    console.log("Analysis_Home: Component rendering (DOM Manipulation Attempt).");

    // --- State and Setup ---
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const [clientNames, setClientNames] = useState(PLACEHOLDER_CLIENTS); // Use placeholders
    const [selectedClient, setSelectedClient] = useState('');
    // No API loading/error state needed for placeholders

    // --- Auth useEffect (Keep) ---
    useEffect(() => {
        console.log("Analysis_Home: Auth useEffect running.");
        // ... (Auth logic - same as before) ...
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn'); const savedUserData = localStorage.getItem('mw_userData'); let isAuthenticated = false; if (savedLoginStatus === 'true' && savedUserData) { try { const parsedUserData = JSON.parse(savedUserData); setUserData(parsedUserData); setIsLoggedIn(true); isAuthenticated = true; console.log("Retrieved session"); } catch (error) { console.error('Failed parse:', error); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData'); } } else { setIsLoggedIn(false); setUserData(null); console.log("No session"); } setLoading(false); if (!isAuthenticated) { setTimeout(() => { if (!localStorage.getItem('mw_isLoggedIn')) { console.warn("Not auth, redirecting..."); navigate('/about'); } }, 50); } else { console.log("Auth OK."); }
    }, [navigate]);

    // --- Handlers (Keep) ---
    const handleLogout = useCallback(() => { /* ... logout ... */ console.log("Logout"); if (window.google && window.google.accounts && window.google.accounts.id) { window.google.accounts.id.disableAutoSelect(); } setUserData(null); setIsLoggedIn(false); localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData'); setClientNames(PLACEHOLDER_CLIENTS); setSelectedClient(''); navigate('/about'); }, [navigate]);
    const handleChatClick = useCallback(() => { /* ... chat ... */ console.log("Nav chat"); navigate('/chat'); }, [navigate]);
    const handleHomeClick = useCallback(() => { /* ... home ... */ console.log("Nav home"); navigate('/about'); }, [navigate]);
    const handleClientSelect = useCallback((event) => { /* ... select ... */ const value = event.target.value; setSelectedClient(value); console.log("Selected Placeholder:", value); }, []);

    // --- Styling (Keep, add border for dropdown container) ---
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;
        // ... (Standard styles remain the same) ...
        const panelPaddingTop = isMobile ? '100px' : '130px'; const panelPaddingSides = isMobile ? '15px' : '40px'; const panelPaddingBottom = isMobile ? '30px' : '50px'; const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)'; const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)'; const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)'; const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)'; const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)'; const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)'; const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)'; const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)'; const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)'; const profileTop = isMobile ? '20px' : '30px'; const profileLeft = panelPaddingSides; const buttonStackTop = isMobile ? '15px' : '25px'; const buttonStackRight = panelPaddingSides; const buttonStackGap = isMobile ? '10px' : '15px'; const contentTopMargin = isMobile ? '120px' : '130px'; const standardButtonStyle = { fontSize: buttonFontSize, padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content', pointerEvents: 'auto', transition: 'transform 0.2s ease, background-color 0.2s ease', display: 'inline-block' };

        return {
            overlay: { className: 'ui-overlay analysis-home-overlay', style: { zIndex: '9999', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', width: '100vw', height: '100vh', pointerEvents: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', } },
            panel: { className: 'flat-panel analysis-home-panel', style: { position: 'relative', width: desktopPanelWidth, maxWidth: desktopMaxWidth, height: desktopPanelHeight, maxHeight: '90vh', backgroundColor: 'rgba(13, 20, 24, 0.65)', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)', padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`, color: 'white', pointerEvents: 'auto', overflowY: 'auto', boxSizing: 'border-box', opacity: 0, margin: '0 auto', top: 'auto', left: 'auto', transform: 'none', } },
            profileContainer: { style: { position: 'absolute', top: profileTop, left: profileLeft, display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10, opacity: 0, transform: 'translateX(-50px)', } },
            buttonStackContainer: { style: { position: 'absolute', top: buttonStackTop, right: buttonStackRight, display: 'flex', flexDirection: 'column', gap: buttonStackGap, zIndex: 100, alignItems: 'flex-end', opacity: 0, transform: 'translateX(50px)', pointerEvents: 'auto', } },
            contentContainer: { className: 'content-container', style: { width: '100%', marginTop: contentTopMargin, opacity: 0, transform: 'translateY(30px)', position: 'relative', zIndex: 5 } },
            profilePhoto: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0, } },
            profilePhotoPlaceholder: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0, } },
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left', } },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500', } },
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e', } },
            logoutButton: { className: 'nav-button logout-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)' } },
            chatButton: { className: 'nav-button chat-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)' } },
            homeButton: { className: 'nav-button home-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', textDecoration: 'none' } },
            contentHeading: { style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', } },
            contentText: { style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', } },
            contentSection: { style: { backgroundColor: 'rgba(87, 179, 192, 0.05)', padding: isMobile ? '15px' : '20px', borderRadius: '8px', marginBottom: isMobile ? '15px' : '20px', border: '1px solid cyan' /* Border for section */ } },
            contentSectionHeading: { style: { fontSize: sectionHeadingFontSize, marginBottom: '10px', color: '#57b3c0', fontWeight: '600', } },
            // Style for the container DIV we will create manually
            manualDropdownContainerStyle: { marginTop: isMobile ? '15px' : '20px', marginBottom: isMobile ? '15px' : '20px', border: '2px dashed lime', padding: '5px', minHeight: '50px' /* Ensure it has some size */ },
            clientDropdownLabel: { style: { display: 'block', fontSize: isMobile ? '13px' : 'calc(14px * 1.35)', color: '#a7d3d8', marginBottom: '8px', fontWeight: '500', } },
            clientDropdownSelect: { style: { display: 'block', width: '100%', maxWidth: '400px', padding: isMobile ? '8px 10px' : '10px 12px', fontSize: isMobile ? '14px' : 'calc(15px * 1.35)', backgroundColor: 'rgba(13, 20, 24, 0.8)', color: '#e0e0e0', border: '1px solid rgba(87, 179, 192, 0.4)', borderRadius: '6px', cursor: 'pointer', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: `right ${isMobile ? '10px' : '15px'} center`, backgroundSize: '20px', } },
        };
    };

    // --- Animation Helper (Keep) ---
    const animateElement = (element, properties, delay = 0) => { /* ... animateElement ... */ if (!element) return; element.style.transition = 'all 0.5s ease-out'; setTimeout(() => { requestAnimationFrame(() => { Object.keys(properties).forEach(prop => { element.style[prop] = properties[prop]; }); }); }, delay); };

    // ====================================
    // 4. UI RENDERING EFFECT (DOM Manipulation)
    // ====================================
    useEffect(() => {
        console.log(`%cAnalysis_Home: UI Effect START (DOM Manipulation).`, "color: orange; font-weight: bold;");
        console.log(`   - State Check: loading=${loading}, isLoggedIn=${isLoggedIn}, userData=${!!userData}`);

        if (loading || !isLoggedIn || !userData) { /* ... skip logic ... */ console.log("   - Skipping UI."); if (overlayRef.current && overlayRef.current.parentNode) { overlayRef.current.remove(); overlayRef.current = null; panelRef.current = null; document.body.style.overflow = ''; } return; }
        if (overlayRef.current || document.querySelector('.analysis-home-overlay')) { /* ... skip logic ... */ console.warn("   - Overlay exists, skipping."); return; }

        console.log("%cAnalysis_Home: Creating BASE UI elements...", "color: blue;");
        const styles = getStyles();
        let panel = null; let overlay = null;
        let resizeTimeout; const handleResize = () => { /* ... */ clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { console.warn("Resize occurred."); }, 250); };

        try {
            // --- Create Overlay and Panel ---
            overlay = document.createElement('div'); /* ... */ overlay.className = styles.overlay.className; Object.assign(overlay.style, styles.overlay.style); overlayRef.current = overlay;
            panel = document.createElement('div'); /* ... */ panel.className = styles.panel.className; panel.id = 'analysis-panel'; Object.assign(panel.style, styles.panel.style); panelRef.current = panel;
            console.log("   - Overlay and Panel objects created.");

            // --- CREATE BUTTON STACK ---
            const buttonStackContainer = document.createElement('div'); /* ... */ Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style); buttonStackContainer.id = 'button-stack';
            const logoutButton = document.createElement('button'); /* ... */ Object.assign(logoutButton.style, styles.logoutButton.style); logoutButton.textContent = 'Logout'; logoutButton.addEventListener('click', handleLogout);
            buttonStackContainer.appendChild(logoutButton);
            panel.appendChild(buttonStackContainer);
            console.log("   - Button stack added.");

            // --- CREATE PROFILE INFO ---
            const profileContainer = document.createElement('div'); /* ... */ Object.assign(profileContainer.style, styles.profileContainer.style); profileContainer.id = 'profile-container';
            const userNameEl = document.createElement('h3'); /* ... */ Object.assign(userNameEl.style, styles.userName.style); userNameEl.textContent = `${userData.name || 'User'}`;
            profileContainer.appendChild(userNameEl);
            panel.appendChild(profileContainer);
            console.log("   - Profile info added.");

            // --- CREATE CONTENT CONTAINER ---
            console.log("%c   - Creating Content Container...", "color: blue;");
            const contentContainer = document.createElement('div'); /* ... */ contentContainer.id = 'content-container'; contentContainer.className = styles.contentContainer.className; Object.assign(contentContainer.style, styles.contentContainer.style);
            const contentHeading = document.createElement('h2'); /* ... */ Object.assign(contentHeading.style, styles.contentHeading.style); contentHeading.textContent = "Analysis Dashboard (DOM Manip)";
            contentContainer.appendChild(contentHeading);
            console.log("     - Content Container created.");

            // --- CREATE METRICS SECTION (Target for Dropdown) ---
            console.log("%c   - Creating Metrics Section (ID: " + METRICS_SECTION_ID + ") ...", "color: blue;");
            const metricsSection = document.createElement('div');
            metricsSection.id = METRICS_SECTION_ID; // Assign ID
            Object.assign(metricsSection.style, styles.contentSection.style); // Includes cyan border
            const metricsHeading = document.createElement('h3'); /* ... */ Object.assign(metricsHeading.style, styles.contentSectionHeading.style); metricsHeading.textContent = "Client Selection Area";
            metricsSection.appendChild(metricsHeading);
            contentContainer.appendChild(metricsSection); // Append section to content container
            console.log("     - Metrics Section created and added (Check for cyan border).");

            // --- APPEND CONTENT CONTAINER to PANEL ---
            console.log("%c   - Appending Content Container to Panel...", "color: blue;");
            if (panelRef.current) { panelRef.current.appendChild(contentContainer); console.log("     - Content Container appended."); }
            else { console.error("     - CRITICAL: Panel ref lost before content append!"); throw new Error("Panel ref lost."); }


            // --- *** DYNAMICALLY ADD DROPDOWN *** ---
            console.log("%c   - Attempting to add dropdown dynamically...", "color: magenta; font-weight: bold;");

            // Use a small timeout to potentially allow React's render cycle to settle
            const dropdownTimer = setTimeout(() => {
                console.log(`%c     - Timeout callback: Looking for target #${METRICS_SECTION_ID}...`, "color: magenta;");

                // Find the parent element *within the panel* using its ID
                const targetSection = panelRef.current?.querySelector(`#${METRICS_SECTION_ID}`);

                if (targetSection) {
                    console.log(`%c       - Target #${METRICS_SECTION_ID} found! Creating dropdown elements...`, "color: lime;");

                    // Check if dropdown already exists from a previous run (less likely with good cleanup, but safe)
                    if (targetSection.querySelector(`#${DROPDOWN_CONTAINER_ID}`)) {
                        console.warn("       - Dropdown container already exists. Skipping creation.");
                        return;
                    }

                    // Create dropdown container
                    const dropdownContainer = document.createElement('div');
                    dropdownContainer.id = DROPDOWN_CONTAINER_ID;
                    Object.assign(dropdownContainer.style, styles.manualDropdownContainerStyle); // Lime border

                    // Create Label
                    const dropdownLabel = document.createElement('label');
                    dropdownLabel.htmlFor = DROPDOWN_SELECT_ID;
                    Object.assign(dropdownLabel.style, styles.clientDropdownLabel.style);
                    dropdownLabel.textContent = 'Select Placeholder Client (Manual):';
                    dropdownContainer.appendChild(dropdownLabel);

                    // Create Select
                    const clientSelect = document.createElement('select');
                    clientSelect.id = DROPDOWN_SELECT_ID;
                    Object.assign(clientSelect.style, styles.clientDropdownSelect.style);
                    clientSelect.value = selectedClient; // Use state value
                    clientSelect.addEventListener('change', handleClientSelect); // Attach handler

                    // Add Default Option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = ""; defaultOption.textContent = "-- Select --";
                    clientSelect.appendChild(defaultOption);

                    // Add Placeholder Options
                    clientNames.forEach((client) => {
                        const option = document.createElement('option');
                        const clientNameString = `${client.firstName} ${client.lastName}`;
                        option.value = clientNameString; option.textContent = clientNameString;
                        clientSelect.appendChild(option);
                    });
                    dropdownContainer.appendChild(clientSelect);
                    console.log("         - Label & Select elements created.");

                    // Append the dropdown container to the target section
                    targetSection.appendChild(dropdownContainer);
                    console.log(`%c       - SUCCESS: Dropdown container #${DROPDOWN_CONTAINER_ID} appended to #${METRICS_SECTION_ID}.`, "color: green; font-weight: bold;");
                    console.log("         (Check UI for LIME border container with dropdown inside CYAN border section)");


                } else {
                    console.error(`%c       - FAILED: Target section #${METRICS_SECTION_ID} not found in panelRef after timeout! Cannot append dropdown.`, "color: red; font-weight: bold;");
                }
            }, 10); // Small delay (10ms) - can experiment with 0 or slightly higher

            // --- Append Panel & Overlay to Body ---
            console.log("%c   - Appending Panel to Overlay...", "color: blue;");
            overlay.appendChild(panel);
            console.log("     - Panel appended.");
            console.log("%c   - Appending Overlay to Body...", "color: blue;");
            const existingOverlays = document.querySelectorAll('.ui-overlay'); existingOverlays.forEach(el => { console.warn("   - Removing potentially duplicate overlay:", el.className); el.parentNode?.removeChild(el); });
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            console.log("     - Overlay appended.");

            // --- Apply animations ---
            console.log("%c   - Applying Animations...", "color: blue;");
            setTimeout(() => { /* ... animation logic ... */
                if (panelRef.current) animateElement(panelRef.current, { opacity: '1' }, 0);
                const profileEl = panelRef.current?.querySelector('#profile-container'); if (profileEl) animateElement(profileEl, { opacity: '1', transform: 'translateX(0)' }, 150);
                const buttonsEl = panelRef.current?.querySelector('#button-stack'); if (buttonsEl) animateElement(buttonsEl, { opacity: '1', transform: 'translateX(0)' }, 150);
                const contentEl = panelRef.current?.querySelector('#content-container'); if (contentEl) animateElement(contentEl, { opacity: '1', transform: 'translateY(0)' }, 300);
                console.log("     - Base animations applied.");
            }, 50);

            console.log("%cAnalysis_Home: UI Effect structure complete (Dropdown append attempted in timeout).", "color: green; font-weight: bold;");
            window.addEventListener('resize', handleResize); // Add listener
            console.log("   - Resize listener added.");

        } catch (error) {
            console.error("%cAnalysis_Home: !!! CATCH BLOCK ERROR in UI Effect !!!", "color: red; font-weight: bold;", error);
            // ... (Error cleanup - same as before) ...
            if (overlayRef.current && overlayRef.current.parentNode) { overlayRef.current.remove(); } else if (overlay && overlay.parentNode) { overlay.remove(); }
            overlayRef.current = null; panelRef.current = null; document.body.style.overflow = '';
            window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout);
            // Clear dropdown timer if it exists from the catch block too
            // if (dropdownTimer) clearTimeout(dropdownTimer); // Need to declare dropdownTimer outside try
            return;
        }

        // --- Cleanup function ---
        return () => {
            console.log("%cAnalysis_Home: UI Effect CLEANUP (DOM Manipulation).", "color: red;");
            window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout);
            // Explicitly remove manually added dropdown if it exists
            const manualDropdown = document.getElementById(DROPDOWN_CONTAINER_ID);
            if (manualDropdown && manualDropdown.parentNode) {
                console.log(`   - Removing manually added dropdown container #${DROPDOWN_CONTAINER_ID}.`);
                manualDropdown.parentNode.removeChild(manualDropdown);
            } else {
                console.log("   - Manual dropdown container not found for removal.");
            }
            // Remove main overlay
            const overlayToRemove = overlayRef.current ?? document.querySelector('.analysis-home-overlay');
            if (overlayToRemove && overlayToRemove.parentNode) { /* ... */ console.log("   - Removing overlay."); overlayToRemove.remove(); } else { console.log("   - No overlay found."); }
            overlayRef.current = null; panelRef.current = null; document.body.style.overflow = '';
            console.log("   - Refs cleared, scroll restored.");
            // Clear dropdown timer if effect cleans up before it fires
            // clearTimeout(dropdownTimer); // Need to declare dropdownTimer in outer scope of useEffect
        };
        // --- Dependencies ---
    }, [
        isLoggedIn, userData, loading, navigate, // Core state
        handleLogout, handleChatClick, handleHomeClick, // Base handlers
        clientNames, selectedClient, handleClientSelect // Dropdown related state/handlers
    ]);

    console.log("Analysis_Home: Returning null.");
    return null;
}