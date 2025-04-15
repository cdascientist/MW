/**
 * Analysis_Home.jsx - Analysis Dashboard Component
 * Refactored to use styling consistent with LoggedInTemplate.jsx
 * Implements two-step dropdown: Client -> Job ID
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

    // State for Client Names Dropdown
    const [clientNames, setClientNames] = useState([]); // Stores array of { clientFirstName, clientLastName }
    const [selectedClient, setSelectedClient] = useState(null); // Stores the selected { clientFirstName, clientLastName } object
    const [namesLoading, setNamesLoading] = useState(false);
    const [namesError, setNamesError] = useState(null);
    const [showClientDropdown, setShowClientDropdown] = useState(true); // Control visibility/interaction

    // State for Job IDs Dropdown
    const [jobs, setJobs] = useState([]); // Stores array of job objects for the selected client
    const [selectedJobId, setSelectedJobId] = useState(''); // Stores the selected Job ID
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsError, setJobsError] = useState(null);

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
        if (!isAuthenticated && !loading) {
            console.warn("Analysis_Home: Auth check complete, user not authenticated. Redirecting...");
            redirectToLogin("Not authenticated after check");
        }
    }, [loading]); // Depend on loading to re-check redirection condition

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
        // Clear all relevant state on logout
        setClientNames([]);
        setSelectedClient(null);
        setNamesLoading(false);
        setNamesError(null);
        setShowClientDropdown(true);
        setJobs([]);
        setSelectedJobId('');
        setJobsLoading(false);
        setJobsError(null);

        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        console.log("Local storage cleared.");
        setTimeout(() => redirectToLogin("User logged out"), 0);
    };


    // ====================================
    // 2.5. FETCH CLIENT NAMES
    // ====================================
    useEffect(() => {
        if (isLoggedIn) {
            if (!namesLoading && clientNames.length === 0 && !namesError) {
                console.log("Fetching client names...");
                setNamesLoading(true);
                setNamesError(null);

                const fetchClientNames = async () => {
                    try {
                        // *** Use the correct endpoint returning first and last names ***
                        const response = await fetch('/api/WorkdayStepOneJobs/UniqueClientNames');
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`HTTP error! status: ${response.status} ${response.statusText} - ${errorText}`);
                        }
                        const namesData = await response.json();
                        console.log("Client names fetched successfully:", namesData);
                        setClientNames(namesData || []); // Expecting array of { clientFirstName, clientLastName }
                        setSelectedClient(null); // Reset selection when names reload
                        setShowClientDropdown(true); // Ensure dropdown is shown
                    } catch (error) {
                        console.error("Analysis_Home: Failed to fetch client names:", error);
                        setNamesError('Failed to load client names. Please try again later.');
                        setClientNames([]);
                    } finally {
                        setNamesLoading(false);
                    }
                };
                fetchClientNames();
            }
        } else {
            // Clear data if not logged in
            if (clientNames.length > 0 || selectedClient || namesError || namesLoading) {
                setClientNames([]);
                setSelectedClient(null);
                setShowClientDropdown(true);
                setNamesLoading(false);
                setNamesError(null);
                console.log("Cleared client names data due to logout/not logged in.");
            }
        }
    }, [isLoggedIn, namesError]); // Re-run if login status changes or if there was an error

    // ====================================
    // 2.6 FETCH JOBS FOR SELECTED CLIENT
    // ====================================
    useEffect(() => {
        // Trigger only when a client is selected
        if (selectedClient && selectedClient.clientFirstName && selectedClient.clientLastName) {
            console.log(`Fetching jobs for: ${selectedClient.clientFirstName} ${selectedClient.clientLastName}`);
            setJobsLoading(true);
            setJobsError(null);
            setJobs([]); // Clear previous jobs
            setSelectedJobId(''); // Reset job selection

            const fetchJobsForClient = async (firstName, lastName) => {
                try {
                    // *** Use the search endpoint with query parameters ***
                    const response = await fetch(`/api/WorkdayStepOneJobs/SearchByClientName?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`);
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status} ${response.statusText} - ${errorText}`);
                    }
                    const jobsData = await response.json();
                    console.log(`Jobs fetched for ${firstName} ${lastName}:`, jobsData);
                    setJobs(jobsData || []); // Expecting array of job objects
                    // Decide whether to show the job dropdown based on results
                    // setShowJobDropdown(jobsData && jobsData.length > 0);
                } catch (error) {
                    console.error("Analysis_Home: Failed to fetch jobs for client:", error);
                    setJobsError(`Failed to load jobs for ${firstName} ${lastName}.`);
                    setJobs([]);
                    // setShowJobDropdown(false);
                } finally {
                    setJobsLoading(false);
                }
            };

            fetchJobsForClient(selectedClient.clientFirstName, selectedClient.clientLastName);
            setShowClientDropdown(false); // Hide/disable client dropdown after selection

        } else {
            // If client is deselected or null initially, clear job-related state
            if (jobs.length > 0 || jobsLoading || jobsError || selectedJobId) {
                console.log("Clearing job data because client is not selected.");
                setJobs([]);
                setSelectedJobId('');
                setJobsLoading(false);
                setJobsError(null);
                setShowClientDropdown(true); // Re-enable client dropdown if deselected
            }
        }
    }, [selectedClient]); // Dependency: Run when selectedClient changes


    // ====================================
    // 3. STYLING CONFIGURATION (ADOPTED FROM LoggedInTemplate.jsx - *No changes here*)
    // ====================================
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;
        const panelPaddingTop = isMobile ? '100px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';
        const dropdownFontSize = isMobile ? '14px' : 'calc(15px * 1.35)';
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';
        const dropdownTopMargin = isMobile ? '15px' : '20px';
        const dropdownBottomMargin = isMobile ? '25px' : '30px';
        const dropdownLabelMargin = '8px';
        const dropdownLabelColor = '#a7d3d8';
        const dropdownBackgroundColor = 'rgba(87, 179, 192, 0.1)';
        const dropdownBorderColor = 'rgba(87, 179, 192, 0.3)';
        const contentSectionBorderRadius = '8px';
        const contentAreaPadding = isMobile ? '15px' : '20px';

        return {
            overlay: { className: 'ui-overlay analysis-overlay', style: { zIndex: '9999', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '10px' : '50px', boxSizing: 'border-box' } },
            panel: { className: 'flat-panel analysis-panel', style: { position: 'relative', width: desktopPanelWidth, maxWidth: desktopMaxWidth, height: desktopPanelHeight, backgroundColor: 'rgba(13, 20, 24, 0.9)', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)', paddingTop: panelPaddingTop, paddingLeft: panelPaddingSides, paddingRight: panelPaddingSides, paddingBottom: panelPaddingBottom, color: 'white', pointerEvents: 'auto', overflowY: 'auto', boxSizing: 'border-box', opacity: 0, WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'thin' } },
            profileContainer: { style: { position: 'absolute', top: profileTop, left: profileLeft, display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10, opacity: 0, transform: 'translateX(-50px)' } },
            buttonStackContainer: { style: { position: 'absolute', top: buttonStackTop, right: buttonStackRight, display: 'flex', flexDirection: 'column', gap: buttonStackGap, zIndex: 10, alignItems: 'flex-end', opacity: 0, transform: 'translateX(50px)' } },
            contentContainer: { className: 'content-container', style: { width: '100%', opacity: 0, transform: 'translateY(30px)', boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' } },
            titleHeading: { style: { fontSize: headingFontSize, color: '#57b3c0', fontWeight: 'bold', marginBottom: '20px', overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'auto' } },
            profilePhoto: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0 } },
            profilePhotoPlaceholder: { style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0 } },
            userInfo: { style: { display: 'flex', flexDirection: 'column', textAlign: 'left' } },
            userName: { style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500' } },
            userEmail: { style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e' } },
            logoutButton: { className: 'nav-button logout-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            chatButton: { className: 'nav-button chat-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            homeButton: { className: 'nav-button home-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', width: 'fit-content' } },
            dashboardButton: { className: 'nav-button dashboard-button', style: { fontSize: buttonFontSize, backgroundColor: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad', border: '1px solid rgba(142, 68, 173, 0.4)', padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content' } },
            contentSection: { style: { backgroundColor: 'rgba(87, 179, 192, 0.05)', padding: contentAreaPadding, borderRadius: contentSectionBorderRadius, border: '1px solid rgba(87, 179, 192, 0.1)', maxWidth: '100%', overflowWrap: 'break-word', wordWrap: 'break-word', boxSizing: 'border-box', marginTop: dropdownBottomMargin /* Add margin if job dropdown is present */ } },
            contentText: { style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', wordWrap: 'break-word', overflowWrap: 'break-word' } },
            // --- Client Dropdown ---
            dropdownContainer: { style: { position: 'relative', marginTop: dropdownTopMargin, marginBottom: dropdownBottomMargin, maxWidth: '100%', boxSizing: 'border-box', display: showClientDropdown ? 'block' : 'none' /* Control visibility */ } },
            selectedClientInfo: { // Style for showing the selected client when dropdown is hidden/disabled
                style: {
                    fontSize: textFontSize,
                    color: '#e0e0e0', // Make it visible
                    backgroundColor: dropdownBackgroundColor,
                    border: '1px solid ' + dropdownBorderColor,
                    borderRadius: '6px',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    marginTop: dropdownTopMargin,
                    marginBottom: dropdownBottomMargin, // Keep spacing consistent
                    fontStyle: 'italic',
                    cursor: 'not-allowed', // Indicate it's not interactive
                }
            },
            // --- Job Dropdown (Shares some styles) ---
            jobDropdownContainer: { style: { position: 'relative', marginTop: dropdownTopMargin, marginBottom: dropdownBottomMargin, maxWidth: '100%', boxSizing: 'border-box' } },
            dropdownLabel: { style: { display: 'block', fontSize: textFontSize, color: dropdownLabelColor, marginBottom: dropdownLabelMargin, fontWeight: '500' } },
            dropdownSelect: { style: { width: '100%', padding: isMobile ? '8px 10px' : '10px 12px', fontSize: dropdownFontSize, backgroundColor: dropdownBackgroundColor, color: '#e0e0e0', border: '1px solid ' + dropdownBorderColor, borderRadius: '6px', cursor: 'pointer', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2357b3c0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: `right ${isMobile ? '8px' : '12px'} center`, backgroundSize: '20px', boxSizing: 'border-box' } },
            loadingText: { style: { fontSize: textFontSize, color: '#FFA500', marginTop: dropdownTopMargin, marginBottom: dropdownBottomMargin, fontStyle: 'italic' } },
            errorText: { style: { fontSize: textFontSize, color: '#ff6347', marginTop: dropdownTopMargin, marginBottom: dropdownBottomMargin, fontWeight: '500' } },
            noDataText: { style: { fontSize: textFontSize, color: '#a7d3d8', marginTop: dropdownTopMargin, marginBottom: dropdownBottomMargin, fontStyle: 'italic' } }
        };
    };

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
    // 4. UI RENDERING EFFECT
    // ====================================
    useEffect(() => {
        if (loading) return;
        if (!isLoggedIn) {
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove(); overlayRef.current = null;
            } else {
                const existingOverlay = document.querySelector('.analysis-overlay');
                if (existingOverlay) existingOverlay.remove();
            }
            return;
        }
        if (!userData) return;
        if (overlayRef.current || document.querySelector('.analysis-overlay')) return;

        const styles = getStyles();
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

            // --- CREATE ABSOLUTE PROFILE INFO --- (No changes needed here)
            const profileContainer = document.createElement('div');
            profileContainer.id = 'profile-container';
            Object.assign(profileContainer.style, styles.profileContainer.style);
            const profilePhotoEl = document.createElement(userData.picture ? 'img' : 'div');
            if (userData.picture) { profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile"; Object.assign(profilePhotoEl.style, styles.profilePhoto.style); }
            else { profilePhotoEl.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U'; Object.assign(profilePhotoEl.style, styles.profilePhotoPlaceholder.style); }
            profileContainer.appendChild(profilePhotoEl);
            const userInfoDiv = document.createElement('div'); Object.assign(userInfoDiv.style, styles.userInfo.style);
            const userNameEl = document.createElement('h3'); Object.assign(userNameEl.style, styles.userName.style); userNameEl.textContent = `${userData.name || 'User'}`;
            const userEmailEl = document.createElement('p'); Object.assign(userEmailEl.style, styles.userEmail.style); userEmailEl.textContent = userData.email || 'No email provided';
            userInfoDiv.appendChild(userNameEl); userInfoDiv.appendChild(userEmailEl); profileContainer.appendChild(userInfoDiv);
            panel.appendChild(profileContainer);

            // --- CREATE ABSOLUTE BUTTON STACK --- (No changes needed here)
            const buttonStackContainer = document.createElement('div');
            buttonStackContainer.id = 'button-stack';
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);
            const buttonsConfig = [
                { id: 'logout-button', text: 'Logout', style: styles.logoutButton.style, className: styles.logoutButton.className, handler: handleLogout },
                { id: 'chat-button', text: 'Live Chat', style: styles.chatButton.style, className: styles.chatButton.className, handler: () => navigate('/chat') },
                { id: 'dashboard-button', text: 'Back to Dashboard', style: styles.dashboardButton.style, className: styles.dashboardButton.className, handler: () => navigate('/loggedintemplate') },
                { id: 'home-button', text: 'Back to Home', style: styles.homeButton.style, className: styles.homeButton.className, handler: () => navigate('/') }
            ];
            buttonsConfig.forEach(config => {
                const button = document.createElement('button'); button.id = config.id; button.className = config.className; Object.assign(button.style, config.style); button.textContent = config.text; button.addEventListener('click', config.handler); buttonStackContainer.appendChild(button);
            });
            panel.appendChild(buttonStackContainer);

            // --- CREATE FLOWING CONTENT AREA ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.titleHeading.style);
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);

            // --- ADD CLIENT NAME DROPDOWN/DISPLAY ---
            const clientDropdownContainer = document.createElement('div');
            clientDropdownContainer.id = 'client-dropdown-wrapper'; // Wrapper ID
            // Check if we should show the interactive dropdown OR the selected client info
            if (showClientDropdown) {
                Object.assign(clientDropdownContainer.style, styles.dropdownContainer.style); // Apply container style

                if (namesLoading) {
                    const loadingMsg = document.createElement('p');
                    Object.assign(loadingMsg.style, styles.loadingText.style);
                    loadingMsg.textContent = "Loading client names...";
                    clientDropdownContainer.appendChild(loadingMsg);
                } else if (namesError) {
                    const errorMsg = document.createElement('p');
                    Object.assign(errorMsg.style, styles.errorText.style);
                    errorMsg.textContent = namesError;
                    clientDropdownContainer.appendChild(errorMsg);
                } else if (clientNames.length > 0) {
                    const dropdownLabel = document.createElement('label');
                    dropdownLabel.htmlFor = 'client-name-select';
                    Object.assign(dropdownLabel.style, styles.dropdownLabel.style);
                    dropdownLabel.textContent = 'Select Client:';
                    clientDropdownContainer.appendChild(dropdownLabel);

                    const dropdownSelect = document.createElement('select');
                    dropdownSelect.id = 'client-name-select';
                    Object.assign(dropdownSelect.style, styles.dropdownSelect.style);
                    // Set the value based on the index of the selected client, or "" if none selected
                    const selectedIndex = selectedClient ? clientNames.findIndex(c => c.clientFirstName === selectedClient.clientFirstName && c.clientLastName === selectedClient.clientLastName) : -1;
                    dropdownSelect.value = selectedIndex > -1 ? selectedIndex.toString() : "";

                    dropdownSelect.addEventListener('change', (e) => {
                        const index = parseInt(e.target.value, 10);
                        if (!isNaN(index) && index >= 0 && index < clientNames.length) {
                            const client = clientNames[index];
                            console.log("Client selected:", client);
                            setSelectedClient(client); // Update state with the full client object
                        } else {
                            console.log("Client deselected.");
                            setSelectedClient(null); // Reset selection
                        }
                    });

                    const defaultOption = document.createElement('option');
                    defaultOption.value = ""; defaultOption.textContent = "-- Select a Client --";
                    dropdownSelect.appendChild(defaultOption);

                    // *** Use client object and index for options ***
                    clientNames.forEach((client, index) => {
                        const option = document.createElement('option');
                        option.value = index.toString(); // Use index as value
                        option.textContent = `${client.clientFirstName} ${client.clientLastName}`; // Display full name
                        dropdownSelect.appendChild(option);
                    });
                    clientDropdownContainer.appendChild(dropdownSelect);
                } else {
                    const noNamesMsg = document.createElement('p');
                    Object.assign(noNamesMsg.style, styles.noDataText.style); // Use appropriate style
                    noNamesMsg.textContent = "No client names found.";
                    clientDropdownContainer.appendChild(noNamesMsg);
                }
            } else if (selectedClient) {
                // If dropdown is hidden, show the selected client name
                const selectedInfo = document.createElement('div');
                Object.assign(selectedInfo.style, styles.selectedClientInfo.style);
                selectedInfo.textContent = `Selected Client: ${selectedClient.clientFirstName} ${selectedClient.clientLastName}`;
                // Maybe add a 'Change Client' button here later
                clientDropdownContainer.appendChild(selectedInfo);
            }
            contentContainer.appendChild(clientDropdownContainer); // Add client section

            // --- ADD JOB ID DROPDOWN ---
            const jobDropdownContainer = document.createElement('div');
            jobDropdownContainer.id = 'job-dropdown-container';
            Object.assign(jobDropdownContainer.style, styles.jobDropdownContainer.style);

            // Show this section only if a client is selected (i.e., job fetch was triggered)
            if (selectedClient) {
                if (jobsLoading) {
                    const loadingMsg = document.createElement('p');
                    Object.assign(loadingMsg.style, styles.loadingText.style);
                    loadingMsg.textContent = `Loading jobs for ${selectedClient.clientFirstName}...`;
                    jobDropdownContainer.appendChild(loadingMsg);
                } else if (jobsError) {
                    const errorMsg = document.createElement('p');
                    Object.assign(errorMsg.style, styles.errorText.style);
                    errorMsg.textContent = jobsError;
                    jobDropdownContainer.appendChild(errorMsg);
                } else if (jobs.length > 0) {
                    const dropdownLabel = document.createElement('label');
                    dropdownLabel.htmlFor = 'job-id-select';
                    Object.assign(dropdownLabel.style, styles.dropdownLabel.style);
                    dropdownLabel.textContent = 'Select Job ID:';
                    jobDropdownContainer.appendChild(dropdownLabel);

                    const dropdownSelect = document.createElement('select');
                    dropdownSelect.id = 'job-id-select';
                    Object.assign(dropdownSelect.style, styles.dropdownSelect.style);
                    dropdownSelect.value = selectedJobId; // Bind value to state
                    dropdownSelect.addEventListener('change', (e) => {
                        console.log("Job ID selected:", e.target.value);
                        setSelectedJobId(e.target.value);
                        // Add logic here if needed when job ID changes
                    });

                    const defaultOption = document.createElement('option');
                    defaultOption.value = ""; defaultOption.textContent = "-- Select a Job ID --";
                    dropdownSelect.appendChild(defaultOption);

                    // Populate with Job IDs from the fetched jobs
                    jobs.forEach(job => {
                        const option = document.createElement('option');
                        option.value = job.JobId; // Use JobId as value
                        option.textContent = `Job ID: ${job.JobId}${job.JobName ? ` - ${job.JobName}` : ''}`; // Display ID and optionally Name
                        dropdownSelect.appendChild(option);
                    });
                    jobDropdownContainer.appendChild(dropdownSelect);
                } else {
                    // Only show 'no jobs found' if not loading and no error occurred
                    if (!jobsLoading && !jobsError) {
                        const noJobsMsg = document.createElement('p');
                        Object.assign(noJobsMsg.style, styles.noDataText.style);
                        noJobsMsg.textContent = `No jobs found for ${selectedClient.clientFirstName} ${selectedClient.clientLastName}.`;
                        jobDropdownContainer.appendChild(noJobsMsg);
                    }
                }
                contentContainer.appendChild(jobDropdownContainer); // Add job dropdown section
            }


            // --- ADD CONTENT SECTION ---
            const contentSection = document.createElement('div');
            contentSection.id = 'analysis-content-section';
            Object.assign(contentSection.style, styles.contentSection.style);
            // Adjust margin top if the job dropdown is potentially visible
            if (selectedClient) {
                contentSection.style.marginTop = styles.dropdownBottomMargin.style.marginTop;
            }

            // Example content - update based on selections
            const welcomeText = document.createElement('p');
            Object.assign(welcomeText.style, styles.contentText.style);
            let dynamicText = "Welcome to the Analysis Dashboard. Select a client to begin.";
            if (selectedClient) {
                dynamicText = `Displaying analysis options for: ${selectedClient.clientFirstName} ${selectedClient.clientLastName}.`;
                if (selectedJobId) {
                    dynamicText += ` Selected Job ID: ${selectedJobId}. Details would load here.`;
                } else if (jobs.length > 0) {
                    dynamicText += ` Please select a Job ID from the dropdown above.`;
                } else if (!jobsLoading && !jobsError) {
                    dynamicText += ` No associated jobs found.`;
                } else if (jobsLoading) {
                    dynamicText += ` Loading associated jobs...`;
                }
            }
            welcomeText.textContent = dynamicText;
            contentSection.appendChild(welcomeText);

            // Add more placeholder paragraphs if needed (or actual content)
            // ... (keep existing placeholder loop if desired)

            contentContainer.appendChild(contentSection); // Add content section

            panel.appendChild(contentContainer); // Append main content to panel

            // --- APPEND TO BODY ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            // Apply animations
            setTimeout(() => {
                if (window.framerMotion && window.framerMotion.animate) {
                    window.framerMotion.animate('#analysis-panel', { opacity: 1 }, { duration: 0.5 });
                    window.framerMotion.animate('#profile-container', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#button-stack', { opacity: 1, x: 0 }, { duration: 0.5, delay: 0.2, ease: 'easeOut' });
                    window.framerMotion.animate('#content-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: 0.4, ease: 'easeOut' });
                } else {
                    animateElement(panel, { opacity: '1' }, 0);
                    animateElement(profileContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(buttonStackContainer, { opacity: '1', transform: 'translateX(0)' }, 200);
                    animateElement(contentContainer, { opacity: '1', transform: 'translateY(0)' }, 400);
                }
                // Add hover effects etc.
                const buttons = document.querySelectorAll('#button-stack button');
                buttons.forEach(button => {
                    button.addEventListener('mouseenter', () => { button.style.transform = 'scale(1.05)'; button.style.transition = 'transform 0.2s ease'; });
                    button.addEventListener('mouseleave', () => { button.style.transform = 'scale(1)'; button.style.transition = 'transform 0.2s ease'; });
                });
                // Mobile scrolling
                if (window.innerWidth <= 768) {
                    panel.style.overflowY = 'auto';
                    panel.style['-webkit-overflow-scrolling'] = 'touch';
                    panel.addEventListener('touchstart', function () { }, { passive: true });
                }
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
                if (fallbackOverlay) fallbackOverlay.remove();
            }
            overlayRef.current = null;
        };
        // *** Update dependency array for the UI effect ***
    }, [
        isLoggedIn, userData, loading, navigate, handleLogout, // Auth & Nav
        clientNames, namesLoading, namesError, // Client names data
        selectedClient, showClientDropdown, // Selected client state
        jobs, jobsLoading, jobsError, // Jobs data
        selectedJobId // Selected job state
    ]);

    // Component renders null, UI is managed entirely by the effect hook
    return null;
=======
    // Component renders null, UI is managed entirely by the effect hook
    return null;
>>>>>>> Relational_Data
=======
    // Component renders null, UI is managed entirely by the effect hook
    return null;
>>>>>>> Relational_Data
=======
    // Component renders null, UI is managed entirely by the effect hook
    return null;
>>>>>>> Relational_Data
=======
    // Component renders null, UI is managed entirely by the effect hook
    return null;
>>>>>>> Relational_Data
=======
    // Component renders null, UI is managed entirely by the effect hook
    return null;
>>>>>>> Relational_Data
=======
    // Component renders null, UI is managed entirely by the effect hook
    return null;
>>>>>>> Relational_Data
}