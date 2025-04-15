/**
 * Analysis_Home.jsx - Analysis Dashboard Component
 * Refactored to use styling consistent with LoggedInTemplate.jsx
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
    // panelRef might not be needed if we target by ID for animation

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
    }, []); // No dependencies needed here, runs once on mount

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
        // Redirect *after* state updates are likely processed
        setTimeout(() => redirectToLogin("User logged out"), 0);
    };


    // ====================================
    // 2.5. FETCH CLIENT NAMES
    // ====================================
    useEffect(() => {
        // Only fetch names if logged in
        if (isLoggedIn) {
            // Check if we need to fetch (not already loading, and haven't fetched successfully yet)
            if (!namesLoading && clientNames.length === 0 && !namesError) {
                console.log("Fetching client names...");
                setNamesLoading(true);
                setNamesError(null); // Clear previous errors

                const fetchClientNames = async () => {
                    try {
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
                        setClientNames([]); // Clear names on error
                    } finally {
                        setNamesLoading(false);
                    }
                };
                fetchClientNames();
            }
        } else {
            // If user logs out or isn't logged in initially, clear client names data
            if (clientNames.length > 0 || selectedClientName || namesError || namesLoading) {
                setClientNames([]);
                setSelectedClientName('');
                setNamesLoading(false);
                setNamesError(null);
                console.log("Cleared client names data due to logout/not logged in.");
            }
        }
        // Dependencies: Run when login status changes, or if an error occurred (to allow retry potential)
    }, [isLoggedIn, namesError]); // Added namesError to potentially allow refetch if component logic permits


    // ====================================
    // 3. STYLING CONFIGURATION (ADOPTED FROM LoggedInTemplate.jsx)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // --- Define spacing & positioning values ---
        const panelPaddingTop = isMobile ? '100px' : '130px'; // Adopted
        const panelPaddingSides = isMobile ? '15px' : '40px'; // Adopted
        const panelPaddingBottom = isMobile ? '30px' : '50px'; // Adopted

        // Desktop-specific panel size enhancement (35% larger)
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)'; // Adopted
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)'; // Adopted
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)'; // Adopted

        // Text size enhancement (35% larger for desktop only)
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)'; // Adopted
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)'; // Adopted
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)'; // Adopted
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)'; // Adopted
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)'; // Adopted
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)'; // Adopted
        const dropdownFontSize = isMobile ? '14px' : 'calc(15px * 1.35)'; // Adopted (Scaled Dropdown)

        // Absolute positions (relative to panel edges)
        const profileTop = isMobile ? '20px' : '30px'; // Adopted
        const profileLeft = panelPaddingSides; // Adopted
        const buttonStackTop = isMobile ? '15px' : '25px'; // Adopted
        const buttonStackRight = panelPaddingSides; // Adopted
        const buttonStackGap = isMobile ? '10px' : '15px'; // Adopted

        // ***** DROPDOWN POSITIONING (Relative within content flow) *****
        const dropdownTopMargin = isMobile ? '15px' : '20px'; // Space above dropdown (after title)
        const dropdownBottomMargin = isMobile ? '25px' : '30px'; // Space below dropdown (before content section)
        const dropdownLabelMargin = '8px';
        const dropdownLabelColor = '#a7d3d8'; // Keep specific dropdown colors
        const dropdownBackgroundColor = 'rgba(87, 179, 192, 0.1)';
        const dropdownBorderColor = 'rgba(87, 179, 192, 0.3)';

        // ***** CONTENT SECTION POSITIONING (Relative within content flow) *****
        const contentSectionBorderRadius = '8px';
        const contentAreaPadding = isMobile ? '15px' : '20px'; // Padding inside the content section box


        return {
            overlay: {
                className: 'ui-overlay analysis-overlay', // Keep specific class if needed
                style: {
                    zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                    pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: isMobile ? '10px' : '50px', boxSizing: 'border-box',
                }
            },
            panel: {
                className: 'flat-panel analysis-panel', // Keep specific class if needed
                style: {
                    position: 'relative', // Needed for absolute children
                    width: desktopPanelWidth, maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight, backgroundColor: 'rgba(13, 20, 24, 0.9)',
                    borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    paddingTop: panelPaddingTop, // Adopted (Creates space for absolute elements)
                    paddingLeft: panelPaddingSides, // Adopted
                    paddingRight: panelPaddingSides, // Adopted
                    paddingBottom: panelPaddingBottom, // Adopted
                    color: 'white', pointerEvents: 'auto', overflowY: 'auto', // Enable scrolling for content
                    boxSizing: 'border-box',
                    opacity: 0, // Start with opacity 0 for animation
                    WebkitOverflowScrolling: 'touch', // Keep mobile scroll improvements
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'thin'
                }
            },
            profileContainer: {
                style: { // Adopted absolute positioning
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
            // Renamed to buttonStackContainer for clarity, using LoggedInTemplate style
            buttonStackContainer: {
                style: { // Adopted absolute positioning
                    position: 'absolute',
                    top: buttonStackTop,
                    right: buttonStackRight,
                    display: 'flex', flexDirection: 'column',
                    gap: buttonStackGap,
                    zIndex: 10,
                    alignItems: 'flex-end', // Align buttons right
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateX(50px)', // Start off-screen for animation
                }
            },
            contentContainer: { // This holds the main flowing content (title, dropdown, text)
                className: 'content-container', // Use class for potential external styling
                style: {
                    width: '100%', // Take full width within panel padding
                    opacity: 0, // Start with opacity 0 for animation
                    transform: 'translateY(30px)', // Start below for animation
                    boxSizing: 'border-box',
                    wordWrap: 'break-word', // Ensure text wraps properly
                    overflowWrap: 'break-word' // Modern browsers support
                }
            },
            titleHeading: { // Style for the "Analysis Dashboard" title
                style: {
                    fontSize: headingFontSize, // Adopted scaled font
                    color: '#57b3c0',
                    fontWeight: 'bold',
                    marginBottom: '20px', // Space between title and dropdown
                    // No width adjustment needed, flows naturally now
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    hyphens: 'auto'
                }
            },
            profilePhoto: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0 } }, // Adopted size
            profilePhotoPlaceholder: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0 } }, // Adopted size
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left' } },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500' } }, // Adopted font size
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e' } }, // Adopted font size

            // --- BUTTON STYLES (Adopted from LoggedInTemplate) ---
            logoutButton: { className: 'nav-button logout-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            chatButton: { className: 'nav-button chat-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            homeButton: { className: 'nav-button home-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', width: 'fit-content' } },
            // Dashboard button specifically for this page, styled consistently
            dashboardButton: { className: 'nav-button dashboard-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad', border: '1px solid rgba(142, 68, 173, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },

            // --- CONTENT SPECIFIC STYLES (within contentContainer) ---
            contentSection: { // The box holding the lorem ipsum text
                style: {
                    backgroundColor: 'rgba(87, 179, 192, 0.05)',
                    padding: contentAreaPadding, // Use defined padding
                    borderRadius: contentSectionBorderRadius,
                    // marginBottom: contentSectionBottomMargin, // No explicit bottom margin needed? Content flow handles it.
                    // marginTop: contentSectionTopMargin, // No explicit top margin needed, flows after dropdown
                    border: '1px solid rgba(87, 179, 192, 0.1)',
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    boxSizing: 'border-box'
                }
            },
            contentText: { // Style for paragraphs within contentSection
                style: {
                    fontSize: textFontSize, // Adopted scaled font
                    marginBottom: isMobile ? '15px' : '20px',
                    color: '#c0d0d3',
                    lineHeight: '1.6',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                }
            },
            // ***** DROPDOWN STYLES (within contentContainer) *****
            dropdownContainer: {
                style: {
                    position: 'relative', // Keep relative for label/select positioning
                    marginTop: dropdownTopMargin, // Position below title
                    marginBottom: dropdownBottomMargin, // Space before content section
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }
            },
            dropdownLabel: {
                style: {
                    display: 'block',
                    fontSize: textFontSize, // Use scaled text font size
                    color: dropdownLabelColor,
                    marginBottom: dropdownLabelMargin,
                    fontWeight: '500'
                }
            },
            dropdownSelect: {
                style: {
                    width: '100%',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    fontSize: dropdownFontSize, // Use scaled dropdown font size
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
            loadingText: { // For loading/error messages in dropdown area
                style: {
                    fontSize: textFontSize, // Use scaled text font size
                    color: '#FFA500', // Default orange for loading
                    marginTop: dropdownTopMargin, // Consistent spacing
                    marginBottom: dropdownBottomMargin,
                    fontStyle: 'italic'
                }
            },
            errorText: { // Specific style for errors
                style: {
                    fontSize: textFontSize, // Use scaled text font size
                    color: '#ff6347', // Red for error
                    marginTop: dropdownTopMargin, // Consistent spacing
                    marginBottom: dropdownBottomMargin,
                    fontWeight: '500' // Make errors slightly bolder
                }
            }
        };
    };

    // Simple animation function using setTimeout and transitions (copied from LoggedInTemplate)
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
    // 4. UI RENDERING EFFECT (WITH ANIMATIONS & ADOPTED STRUCTURE)
    // ====================================
    useEffect(() => {
        // console.log("UI Effect: Running. Loading:", loading, "IsLoggedIn:", isLoggedIn);
        if (loading) {
            // console.log("UI Effect: Exiting because loading is true.");
            return;
        } // Wait for auth check

        // If not logged in after check, ensure no UI is rendered by this component
        if (!isLoggedIn) {
            // console.log("UI Effect: User not logged in, ensuring overlay is removed.");
            if (overlayRef.current && overlayRef.current.parentNode) {
                // console.log("UI Effect: Removing existing overlay.");
                overlayRef.current.remove(); overlayRef.current = null;
            } else {
                const existingOverlay = document.querySelector('.analysis-overlay');
                if (existingOverlay) {
                    // console.log("UI Effect: Removing fallback found overlay.");
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
            // console.log("UI Effect: Overlay already exists, skipping UI creation.");
            return;
        }
        // console.log("UI Effect: Proceeding to create UI elements...");

        const styles = getStyles();
        // const isMobile = window.innerWidth <= 768; // Already used within getStyles
        let panel; // Define panel variable

        try {
            // Create Overlay and Panel
            const overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay; // Store ref

            panel = document.createElement('div'); // Assign to the outer scope variable
            panel.className = styles.panel.className;
            panel.id = 'analysis-panel'; // Keep ID for potential targeting/animation
            Object.assign(panel.style, styles.panel.style);
            // panelRef.current = panel; // Store ref if needed elsewhere


            // --- CREATE ABSOLUTE PROFILE INFO (Top-Left) ---
            const profileContainer = document.createElement('div');
            profileContainer.id = 'profile-container'; // Use ID for animation
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
            panel.appendChild(profileContainer); // Add absolute element to panel

            // --- CREATE ABSOLUTE BUTTON STACK (Top-Right) ---
            // Use buttonStackContainer naming from adopted styles
            const buttonStackContainer = document.createElement('div');
            buttonStackContainer.id = 'button-stack'; // Use consistent ID for animation
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);

            // Define buttons for this specific page
            const buttonsConfig = [
                // Order matters for visual stacking (top to bottom)
                { id: 'logout-button', text: 'Logout', style: styles.logoutButton.style, className: styles.logoutButton.className, handler: handleLogout },
                { id: 'chat-button', text: 'Live Chat', style: styles.chatButton.style, className: styles.chatButton.className, handler: () => navigate('/chat') },
                { id: 'dashboard-button', text: 'Back to Dashboard', style: styles.dashboardButton.style, className: styles.dashboardButton.className, handler: () => navigate('/loggedintemplate') },
                { id: 'home-button', text: 'Back to Home', style: styles.homeButton.style, className: styles.homeButton.className, handler: () => navigate('/') }
            ];

            buttonsConfig.forEach(config => {
                const button = document.createElement('button');
                button.id = config.id; button.className = config.className;
                Object.assign(button.style, config.style); button.textContent = config.text;
                button.addEventListener('click', config.handler);
                buttonStackContainer.appendChild(button); // Add button to the stack
            });
            panel.appendChild(buttonStackContainer); // Add absolute element to panel

            // --- CREATE FLOWING CONTENT AREA ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container'; // Use ID for animation
            contentContainer.className = styles.contentContainer.className; // Apply class
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // Add title heading (inside content container now)
            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.titleHeading.style);
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);

            // --- ADD CLIENT NAME DROPDOWN (inside content container) ---
            const dropdownContainer = document.createElement('div');
            dropdownContainer.id = 'dropdown-container'; // Keep ID if needed
            Object.assign(dropdownContainer.style, styles.dropdownContainer.style);

            if (namesLoading) {
                const loadingMsg = document.createElement('p');
                Object.assign(loadingMsg.style, styles.loadingText.style);
                loadingMsg.textContent = "Loading client names...";
                dropdownContainer.appendChild(loadingMsg);
            } else if (namesError) {
                const errorMsg = document.createElement('p');
                Object.assign(errorMsg.style, styles.errorText.style); // Use specific error style
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
                    // Add logic here to update content based on selection
                });

                const defaultOption = document.createElement('option');
                defaultOption.value = ""; defaultOption.textContent = "-- Select a Client --";
                dropdownSelect.appendChild(defaultOption);

                clientNames.forEach(name => {
                    const option = document.createElement('option');
                    option.value = name; option.textContent = name;
                    dropdownSelect.appendChild(option);
                });
                dropdownContainer.appendChild(dropdownSelect);
            } else {
                const noNamesMsg = document.createElement('p');
                Object.assign(noNamesMsg.style, styles.loadingText.style); // Reuse style, maybe change text color
                noNamesMsg.style.color = '#a7d3d8'; // Less alarming color for "not found"
                noNamesMsg.textContent = "No client names found.";
                dropdownContainer.appendChild(noNamesMsg);
            }
            contentContainer.appendChild(dropdownContainer); // Add dropdown section to content

            // --- ADD CONTENT SECTION (inside content container) ---
            const contentSection = document.createElement('div');
            contentSection.id = 'analysis-content-section'; // Give it an ID if needed
            Object.assign(contentSection.style, styles.contentSection.style);

            // Example content - Replace/update with actual analysis data later
            const welcomeText = document.createElement('p');
            Object.assign(welcomeText.style, styles.contentText.style);
            welcomeText.textContent = selectedClientName
                ? `Displaying analysis for: ${selectedClientName}. Lorem ipsum dolor sit amet...`
                : "Welcome to the Analysis Dashboard. Select a client from the dropdown above to view specific details. This section will display relevant information based on your selection.";
            contentSection.appendChild(welcomeText);

            // Add more placeholder paragraphs if needed
            for (let i = 2; i <= 5; i++) {
                const paragraph = document.createElement('p');
                Object.assign(paragraph.style, styles.contentText.style);
                const loremTexts = ["Suspendisse in justo...", "Vestibulum ante ipsum...", "Morbi in ipsum sit amet...", "Curabitur sit amet mauris..."];
                paragraph.textContent = loremTexts[(i - 2) % loremTexts.length];
                contentSection.appendChild(paragraph);
            }

            contentContainer.appendChild(contentSection); // Add content section after dropdown

            // Append the main content container to the panel
            panel.appendChild(contentContainer);

            // --- APPEND TO BODY ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            // console.log("UI Effect: UI elements created and appended to body.");

            // Apply animations using consistent IDs and logic from LoggedInTemplate
            setTimeout(() => {
                // console.log("UI Effect: Applying animations...");
                if (window.framerMotion && window.framerMotion.animate) {
                    window.framerMotion.animate('#analysis-panel', { opacity: 1 }, { duration: 0.5 });
                    window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#button-stack', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' }); // Target button-stack ID
                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                } else {
                    // Fallback to simple CSS transitions
                    animateElement(panel, { opacity: '1' }, 0);
                    animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(buttonStackContainer, { opacity: '1', transform: 'translateX(0)' }, 200); // Target buttonStackContainer
                    animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                }

                // Add hover effects etc. (Target buttons within the stack)
                const buttons = document.querySelectorAll('#button-stack button'); // Target buttons inside the stack
                buttons.forEach(button => {
                    button.addEventListener('mouseenter', () => { button.style.transform = 'scale(1.05)'; button.style.transition = 'transform 0.2s ease'; });
                    button.addEventListener('mouseleave', () => { button.style.transform = 'scale(1)'; button.style.transition = 'transform 0.2s ease'; });
                });

                // Mobile scrolling improvements (keep if panel style has overflowY: 'auto')
                if (window.innerWidth <= 768) {
                    panel.style.overflowY = 'auto'; // Ensure it's scrollable
                    panel.style['-webkit-overflow-scrolling'] = 'touch';
                    panel.addEventListener('touchstart', function () { }, { passive: true }); // Helps responsiveness on touch
                }

                // REMOVE the custom scroll listener for sticky buttons - absolute positioning handles this now.

                // console.log("UI Effect: Animations applied and event listeners added.");
            }, 100); // Small delay before starting animations

        } catch (error) {
            console.error("Analysis_Home: Error during UI element creation:", error);
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove(); overlayRef.current = null;
            }
            return; // Stop execution on error
        }

        // ====================================
        // 5. EVENT HANDLING & CLEANUP
        // ====================================
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("Analysis_Home: Reloading due to resize...");
                window.location.reload(); // Simple reload strategy remains
            }, 250);
        };

        window.addEventListener('resize', handleResize);
        // console.log("UI Effect: Resize listener added.");

        // Cleanup function
        return () => {
            // console.log("UI Effect: Cleanup running.");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            // console.log("UI Effect: Resize listener removed.");

            if (overlayRef.current && overlayRef.current.parentNode) {
                // console.log("UI Effect Cleanup: Removing overlay via ref.");
                overlayRef.current.remove();
            } else {
                const fallbackOverlay = document.querySelector('.analysis-overlay');
                if (fallbackOverlay) {
                    // console.log("UI Effect Cleanup: Removing overlay via fallback querySelector.");
                    fallbackOverlay.remove();
                }
            }
            overlayRef.current = null; // Nullify ref
            // console.log("UI Effect Cleanup: Cleanup complete.");
        };
        // Add selectedClientName to dependencies, so content section text updates when selection changes
    }, [isLoggedIn, userData, loading, navigate, handleLogout, clientNames, namesLoading, namesError, selectedClientName]); // Added name-related state + selectedClientName

    // Component renders null, UI is managed entirely by the effect hook
    return null;
}