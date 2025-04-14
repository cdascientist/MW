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
    const [loading, setLoading] = useState(true); // Loading for auth check
    const overlayRef = useRef(null);
    const panelRef = useRef(null);

    // State for Client Names Dropdown
    const [clientNames, setClientNames] = useState([]);
    const [selectedClientName, setSelectedClientName] = useState('');
    const [namesLoading, setNamesLoading] = useState(false); // Loading for names fetch
    const [namesError, setNamesError] = useState(null);

    // ====================================
    // 2. AUTHENTICATION VERIFICATION & REDIRECTION
    // ====================================
    useEffect(() => {
        // console.log("Auth Effect: Running auth check...");
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');
        let isAuthenticated = false;
        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                isAuthenticated = true;
                // console.log("Auth Effect: User authenticated from localStorage.");
            } catch (error) {
                console.error('Analysis_Home: Failed to parse saved user data:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        } else {
            setIsLoggedIn(false);
            setUserData(null);
            // console.log("Auth Effect: No valid auth data in localStorage.");
        }
        setLoading(false); // Auth check complete
        if (!isAuthenticated && !loading) { // Check loading state here too
            console.warn("Analysis_Home: Auth check complete, user not authenticated. Redirecting...");
            redirectToLogin("Not authenticated after check");
        }
    }, []); // Removed loading from dependency array here, it's set internally

    // Redirect function
    const redirectToLogin = (reason) => {
        console.log(`Redirecting to login: ${reason}`);
        navigate('/about');
    };

    // Logout handler
    const handleLogout = () => {
        console.log("handleLogout called");
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
            console.log("Google auto select disabled.");
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log("Local storage cleared.");
        // Ensure redirection happens *after* state update is likely processed
        setTimeout(() => redirectToLogin("User logged out"), 0);
    };


    // ====================================
    // 2.5. FETCH CLIENT NAMES
    // ====================================
    useEffect(() => {
        // Only fetch names if logged in and not already loading/fetched
        if (isLoggedIn && !namesLoading && clientNames.length === 0 && !namesError) {
            console.log("Fetching client names...");
            setNamesLoading(true);
            setNamesError(null);

            const fetchClientNames = async () => {
                try {
                    // Adjust the URL if your API is hosted elsewhere or needs specific base URL
                    const response = await fetch('/api/WorkdayStepOneJobs/UniqueClientFirstNames');

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
                    }
                    const names = await response.json();
                    console.log("Client names fetched successfully:", names);
                    setClientNames(names || []); // Ensure it's an array
                    setSelectedClientName(''); // Reset selection
                } catch (error) {
                    console.error("Analysis_Home: Failed to fetch client names:", error);
                    setNamesError('Failed to load client names. Please try again later.');
                    setClientNames([]); // Clear any potentially stale names
                } finally {
                    setNamesLoading(false);
                }
            };

            fetchClientNames();
        } else if (!isLoggedIn) {
            // If user logs out, clear names
            setClientNames([]);
            setSelectedClientName('');
            setNamesLoading(false);
            setNamesError(null);
        }
        // Dependencies: Run when login status changes
    }, [isLoggedIn]); // Rerun only when isLoggedIn changes

    // ====================================
    // 3. STYLING CONFIGURATION (WITH ANIMATION PROPERTIES)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;
        const sizeFactor = 0.75;

        // ***** PANEL CONFIGURATION *****
        const desktopPanelWidth = isMobile ? '95%' : `calc(85% * ${sizeFactor})`;
        const desktopPanelHeight = isMobile ? '90vh' : `calc(85vh * ${sizeFactor})`;
        const desktopMaxWidth = isMobile ? '1200px' : `calc(1200px * ${sizeFactor})`;

        // ***** PADDING CONFIGURATION *****
        const panelPaddingTop = isMobile ? '20px' : '30px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';

        // ***** CLIENT SELECTION POSITIONING *****
        // Controls the spacing and layout of the client dropdown area
        const dropdownTopMargin = isMobile ? '90px' : '80px';
        const dropdownBottomMargin = isMobile ? '25px' : '30px';
        const dropdownLabelMargin = '8px';
        const dropdownLabelColor = '#a7d3d8';
        const dropdownBackgroundColor = 'rgba(87, 179, 192, 0.1)';
        const dropdownBorderColor = 'rgba(87, 179, 192, 0.3)';

        // ***** CONTENT SECTION POSITIONING *****
        // Controls where the main content area appears relative to the dropdown
        const contentSectionTopMargin = '25px'; // Space between dropdown and content section
        const contentSectionBorderRadius = '8px';
        const contentSectionBottomMargin = isMobile ? '25px' : '30px';
        const contentAreaPadding = isMobile ? '15px' : '20px';

        // General positioning
        const profileTopMargin = isMobile ? '10px' : '20px';
        const contentSidePadding = '15px';
        const contentRightPadding = isMobile ? '20px' : '120px';

        // ***** SIDE BUTTONS CONFIGURATION *****
        // These variables control the fixed side buttons
        const sideButtonsTop = isMobile ? '20px' : '30px';
        const sideButtonsRight = panelPaddingSides;
        const buttonGap = '10px';
        const buttonWidth = 'auto'; // Set to auto to allow natural width
        const buttonRightAlignment = 'flex-end'; // Align buttons to the right

        // Font sizes
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';
        const dropdownFontSize = isMobile ? '14px' : 'calc(15px * 1.35)';

        return {
            overlay: {
                className: 'ui-overlay analysis-overlay',
                style: { zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '10px' : '50px', boxSizing: 'border-box' }
            },
            panel: {
                className: 'flat-panel analysis-panel',
                style: { position: 'relative', width: desktopPanelWidth, maxWidth: desktopMaxWidth, height: desktopPanelHeight, backgroundColor: 'rgba(13, 20, 24, 0.9)', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)', padding: panelPaddingTop + ' ' + panelPaddingSides + ' ' + panelPaddingBottom + ' ' + panelPaddingSides, color: 'white', pointerEvents: 'auto', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box', opacity: 0, WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'thin' }
            },
            profileContainer: {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                    marginTop: profileTopMargin,
                    width: 'calc(100% - ' + contentRightPadding + ')',
                    opacity: 0,
                    transform: 'translateX(-50px)'
                }
            },
            sideButtonsContainer: {
                style: {
                    position: 'absolute', // Using absolute for positioning
                    top: sideButtonsTop,
                    right: sideButtonsRight,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: buttonGap,
                    zIndex: 100,
                    opacity: 0,
                    transform: 'translateX(50px)',
                    alignItems: buttonRightAlignment // Align buttons to the right
                }
            },
            contentContainer: {
                style: {
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    paddingRight: contentRightPadding,
                    paddingLeft: contentSidePadding,
                    opacity: 0,
                    transform: 'translateY(30px)',
                    wordWrap: 'break-word', // Ensure text wraps properly 
                    overflowWrap: 'break-word' // Modern browsers support
                }
            },
            titleHeading: {
                style: {
                    fontSize: headingFontSize,
                    color: '#57b3c0',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    width: 'calc(100% - ' + contentRightPadding + ')',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    hyphens: 'auto'
                }
            },
            profilePhoto: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0 } },
            profilePhotoPlaceholder: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0 } },
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left' } },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500' } },
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e' } },
            logoutButton: { className: 'nav-button logout-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: buttonWidth } },
            chatButton: { className: 'nav-button chat-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: buttonWidth } },
            homeButton: { className: 'nav-button home-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', width: buttonWidth } },
            dashboardButton: { className: 'nav-button dashboard-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad', border: '1px solid rgba(142, 68, 173, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: buttonWidth } },
            contentHeading: { style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold' } },
            contentText: { style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', wordWrap: 'break-word', overflowWrap: 'break-word' } },
            contentSection: {
                style: {
                    backgroundColor: 'rgba(87, 179, 192, 0.05)',
                    padding: contentAreaPadding,
                    borderRadius: contentSectionBorderRadius,
                    marginBottom: contentSectionBottomMargin,
                    marginTop: contentSectionTopMargin, // Added margin-top for spacing from dropdown
                    border: '1px solid rgba(87, 179, 192, 0.1)',
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    boxSizing: 'border-box'
                }
            },
            contentSectionHeading: {
                style: {
                    fontSize: sectionHeadingFontSize,
                    marginBottom: '15px',
                    color: '#57b3c0',
                    fontWeight: '600'
                }
            },
            // ***** DROPDOWN STYLES *****
            dropdownContainer: {
                style: {
                    position: 'relative',
                    marginTop: dropdownTopMargin, // Top margin adjusted
                    marginBottom: dropdownBottomMargin, // Space between dropdown and content
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }
            },
            dropdownLabel: {
                style: {
                    display: 'block',
                    fontSize: textFontSize,
                    color: dropdownLabelColor,
                    marginBottom: dropdownLabelMargin,
                    fontWeight: '500'
                }
            },
            dropdownSelect: {
                style: {
                    width: '100%',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    fontSize: dropdownFontSize,
                    backgroundColor: dropdownBackgroundColor,
                    color: '#e0e0e0',
                    border: '1px solid ' + dropdownBorderColor,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2357b3c0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '8px' : '12px'} center`,
                    backgroundSize: '20px',
                    boxSizing: 'border-box'
                }
            },
            loadingText: {
                style: {
                    fontSize: textFontSize,
                    color: '#FFA500',
                    marginBottom: '15px',
                    fontStyle: 'italic'
                }
            }
        };
    };

    // Simple animation function using setTimeout and transitions
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
    // 4. UI RENDERING EFFECT (WITH ANIMATIONS)
    // ====================================
    useEffect(() => {
        console.log("UI Effect: Running. Loading:", loading, "IsLoggedIn:", isLoggedIn);
        if (loading) {
            console.log("UI Effect: Exiting because loading is true.");
            return;
        } // Wait for auth check

        // If not logged in after check, ensure no UI is rendered by this component
        if (!isLoggedIn) {
            console.log("UI Effect: User not logged in, ensuring overlay is removed.");
            if (overlayRef.current && overlayRef.current.parentNode) {
                console.log("UI Effect: Removing existing overlay.");
                overlayRef.current.remove(); overlayRef.current = null;
            } else {
                // Double check if somehow ref got detached but element exists
                const existingOverlay = document.querySelector('.analysis-overlay');
                if (existingOverlay) {
                    console.log("UI Effect: Removing fallback found overlay.");
                    existingOverlay.remove();
                }
            }
            return; // Don't proceed to render UI
        }

        // If logged in but no user data (shouldn't happen with current logic, but safe check)
        if (!userData) {
            console.warn("UI Effect: Logged in but no user data found. Aborting UI render.");
            return;
        }

        // Prevent duplicate rendering if overlay already exists
        if (overlayRef.current || document.querySelector('.analysis-overlay')) {
            console.log("UI Effect: Overlay already exists, skipping UI creation.");
            return;
        }
        console.log("UI Effect: Proceeding to create UI elements...");

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
                profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile";
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
            userInfoDiv.appendChild(userNameEl); userInfoDiv.appendChild(userEmailEl);
            profileContainer.appendChild(userInfoDiv);
            panel.appendChild(profileContainer);

            // --- CREATE SIDE BUTTONS (Right) ---
            const sideButtonsContainer = document.createElement('div');
            sideButtonsContainer.id = 'side-buttons-container';
            Object.assign(sideButtonsContainer.style, styles.sideButtonsContainer.style);
            const buttonsConfig = [
                { id: 'logout-button', text: 'Logout', style: styles.logoutButton.style, className: styles.logoutButton.className, handler: handleLogout, priority: 1 },
                { id: 'chat-button', text: 'Live Chat', style: styles.chatButton.style, className: styles.chatButton.className, handler: () => navigate('/chat'), priority: 2 },
                { id: 'dashboard-button', text: 'Back to Dashboard', style: styles.dashboardButton.style, className: styles.dashboardButton.className, handler: () => navigate('/loggedintemplate'), priority: 3 },
                { id: 'home-button', text: 'Back to Home', style: styles.homeButton.style, className: styles.homeButton.className, handler: () => navigate('/'), priority: 4 }
            ];
            buttonsConfig.sort((a, b) => a.priority - b.priority);
            buttonsConfig.forEach(config => {
                const button = document.createElement('button');
                button.id = config.id; button.className = config.className;
                Object.assign(button.style, config.style); button.textContent = config.text;
                button.addEventListener('click', config.handler);
                sideButtonsContainer.appendChild(button);
            });
            panel.appendChild(sideButtonsContainer);

            // --- CREATE CONTENT AREA ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // Add title heading
            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.titleHeading.style);
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);

            // --- ADD CLIENT NAME DROPDOWN ---
            const dropdownContainer = document.createElement('div');
            dropdownContainer.id = 'dropdown-container';
            Object.assign(dropdownContainer.style, styles.dropdownContainer.style);

            if (namesLoading) {
                const loadingMsg = document.createElement('p');
                Object.assign(loadingMsg.style, styles.loadingText.style);
                loadingMsg.textContent = "Loading client names...";
                dropdownContainer.appendChild(loadingMsg);
            } else if (namesError) {
                const errorMsg = document.createElement('p');
                Object.assign(errorMsg.style, styles.loadingText.style); // Reuse style
                errorMsg.style.color = '#ff6347'; // Make error red
                errorMsg.textContent = namesError;
                dropdownContainer.appendChild(errorMsg);
            } else if (clientNames.length > 0) {
                const dropdownLabel = document.createElement('label');
                dropdownLabel.htmlFor = 'client-name-select';
                Object.assign(dropdownLabel.style, styles.dropdownLabel.style);
                dropdownLabel.textContent = 'Select Client:';
                dropdownContainer.appendChild(dropdownLabel);

                const dropdownSelect = document.createElement('select');
                dropdownSelect.id = 'client-name-select';
                Object.assign(dropdownSelect.style, styles.dropdownSelect.style);
                dropdownSelect.value = selectedClientName; // Bind value to state
                dropdownSelect.addEventListener('change', (e) => {
                    console.log("Dropdown changed:", e.target.value);
                    setSelectedClientName(e.target.value);
                    // Add any other logic needed when selection changes here
                });

                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a Client --";
                dropdownSelect.appendChild(defaultOption);

                // Add client names
                clientNames.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    dropdownSelect.appendChild(option);
                });
                dropdownContainer.appendChild(dropdownSelect);
            } else {
                // Case where loading is done, no error, but no names found
                const noNamesMsg = document.createElement('p');
                Object.assign(noNamesMsg.style, styles.loadingText.style); // Reuse style
                noNamesMsg.textContent = "No client names found.";
                dropdownContainer.appendChild(noNamesMsg);
            }
            contentContainer.appendChild(dropdownContainer); // Add dropdown section to content

            // --- ADD CONTENT SECTION ---
            const contentSection = document.createElement('div');
            Object.assign(contentSection.style, styles.contentSection.style);
            for (let i = 1; i <= 7; i++) {
                const paragraph = document.createElement('p');
                Object.assign(paragraph.style, styles.contentText.style);
                if (i === 1) {
                    paragraph.textContent = "Welcome to the Analysis Dashboard. Select a client from the dropdown above to view specific details. This section will display relevant information based on your selection.";
                } else {
                    const loremTexts = ["Lorem ipsum dolor sit amet...", "Suspendisse in justo...", "Vestibulum ante ipsum...", "Morbi in ipsum sit amet...", "Curabitur sit amet mauris...", "Sed aliquet risus a tortor...", "Integer id quam..."]; // Shortened for brevity
                    paragraph.textContent = loremTexts[(i - 2) % loremTexts.length];
                }
                contentSection.appendChild(paragraph);
            }
            contentContainer.appendChild(contentSection); // Add content section after dropdown

            // Append content container to panel
            panel.appendChild(contentContainer);

            // --- APPEND TO BODY ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            console.log("UI Effect: UI elements created and appended to body.");

            // Apply animations
            setTimeout(() => {
                console.log("UI Effect: Applying animations...");
                if (window.framerMotion && window.framerMotion.animate) {
                    // Use Framer Motion if available
                    window.framerMotion.animate('#analysis-panel', { opacity: 1 }, { duration: 0.5 });
                    window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#side-buttons-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                } else {
                    // Fallback to simple CSS transitions
                    animateElement(panel, { opacity: '1' }, 0);
                    animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(sideButtonsContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                }

                // Add hover effects etc.
                const buttons = document.querySelectorAll('#side-buttons-container button');
                buttons.forEach(button => {
                    button.addEventListener('mouseenter', () => { button.style.transform = 'scale(1.05)'; button.style.transition = 'transform 0.2s ease'; });
                    button.addEventListener('mouseleave', () => { button.style.transform = 'scale(1)'; button.style.transition = 'transform 0.2s ease'; });
                });

                // Mobile scrolling improvements
                if (isMobile) {
                    panel.style.overflowY = 'scroll';
                    panel.style['-webkit-overflow-scrolling'] = 'touch';
                    panel.addEventListener('touchstart', function () { }, { passive: true });
                }

                // Make side buttons stick when scrolling
                panel.addEventListener('scroll', function () {
                    const sideButtons = document.getElementById('side-buttons-container');
                    if (sideButtons) {
                        const initialTop = isMobile ? 20 : 30; // Same as sideButtonsTop
                        sideButtons.style.top = `${initialTop + panel.scrollTop}px`;
                    }
                });

                console.log("UI Effect: Animations applied and event listeners added.");
            }, 100); // Small delay before starting animations

        } catch (error) {
            console.error("Analysis_Home: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove(); overlayRef.current = null;
            }
            // Optionally display an error message to the user here
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
                window.location.reload(); // Simple reload strategy
            }, 250);
        };

        window.addEventListener('resize', handleResize);
        console.log("UI Effect: Resize listener added.");

        // Cleanup function
        return () => {
            console.log("UI Effect: Cleanup running.");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            console.log("UI Effect: Resize listener removed.");

            // Enhanced cleanup to ensure overlay removal
            if (overlayRef.current && overlayRef.current.parentNode) {
                console.log("UI Effect Cleanup: Removing overlay via ref.");
                overlayRef.current.remove();
            } else {
                // If ref is lost, try querying selector again
                const fallbackOverlay = document.querySelector('.analysis-overlay');
                if (fallbackOverlay) {
                    console.log("UI Effect Cleanup: Removing overlay via fallback querySelector.");
                    fallbackOverlay.remove();
                } else {
                    console.log("UI Effect Cleanup: No overlay found to remove.");
                }
            }

            // Nullify refs
            overlayRef.current = null;
            panelRef.current = null;
            console.log("UI Effect Cleanup: Refs nullified.");
        };
    }, [isLoggedIn, userData, loading, navigate, clientNames, namesLoading, namesError]); // Added name-related state

    // Component renders null, UI is managed entirely by the effect hook
    return null;
}