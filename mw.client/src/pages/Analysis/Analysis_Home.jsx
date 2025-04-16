﻿/**
 * Analysis_Home.jsx - Specific component for the Analysis Dashboard homepage.
 * REVISED: Added dual API integration - first dropdown for client selection,
 * second dropdown for job selection based on selected client.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../style/AboutStyle.css"; // Reusing styling

// --- Unique IDs for Manual Elements ---
const DROPDOWN_CONTAINER_ID = 'manual-dropdown-container';
const DROPDOWN_SELECT_ID = 'manual-dropdown-select';
const METRICS_SECTION_ID = 'manual-metrics-section';
const SUMMARY_SECTION_ID = 'summary-section';

// API endpoints
const API_ENDPOINT_CLIENTS = '/api/WorkdayStepOneJobs/UniqueClientNames';
const API_ENDPOINT_JOBS = '/api/WorkdayStepOneJobs/SearchByClientName';

export default function Analysis_Home() {
    console.log("Analysis_Home: Component rendering");

    // --- State and Setup ---
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(false);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const [clientNames, setClientNames] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [error, setError] = useState(null);

    // --- Fetch client names from API ---
    useEffect(() => {
        console.log("Analysis_Home: Fetching client names from API");

        const fetchClientNames = async () => {
            try {
                setClientsLoading(true);
                const response = await fetch(API_ENDPOINT_CLIENTS);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();

                // Sort clients by last name, then first name
                const sortedClients = [...data].sort((a, b) => {
                    const lastNameComp = (a.ClientLastName || '').localeCompare(b.ClientLastName || '');
                    if (lastNameComp !== 0) return lastNameComp;
                    return (a.ClientFirstName || '').localeCompare(b.ClientFirstName || '');
                });

                setClientNames(sortedClients);
                setError(null);
                console.log("Client names fetched successfully:", sortedClients);
            } catch (error) {
                console.error("Failed to fetch client names:", error);
                setError("Failed to load clients. Please try again later.");
                // If API fails, maintain empty array rather than using placeholder data
                setClientNames([]);
            } finally {
                setClientsLoading(false);
            }
        };

        // Only fetch client data if user is logged in
        if (isLoggedIn) {
            fetchClientNames();
        }

    }, [isLoggedIn]);

    // --- Fetch jobs by client name from API ---
    useEffect(() => {
        // Skip if no client is selected
        if (!selectedClientData) {
            setJobs([]);
            return;
        }

        console.log("Analysis_Home: Fetching jobs for client:", selectedClientData);

        const fetchJobsByClient = async () => {
            try {
                setJobsLoading(true);
                setJobs([]); // Clear previous jobs while loading

                // Build query parameters for the API call
                const queryParams = new URLSearchParams({
                    firstName: selectedClientData.ClientFirstName,
                    lastName: selectedClientData.ClientLastName
                });

                const apiUrl = `${API_ENDPOINT_JOBS}?${queryParams.toString()}`;
                console.log("Fetching from:", apiUrl);

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                console.log("Jobs fetched successfully:", data);

                // Ensure data is an array even if empty
                const jobsArray = Array.isArray(data) ? data : [];
                setJobs(jobsArray);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
                setError("Failed to load jobs. Please try again later.");
                setJobs([]);
            } finally {
                setJobsLoading(false);
            }
        };

        fetchJobsByClient();
    }, [selectedClientData]);

    // --- Auth useEffect ---
    useEffect(() => {
        console.log("Analysis_Home: Auth useEffect running.");
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');

        let isAuthenticated = false;

        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                isAuthenticated = true;
                console.log("Retrieved session");
            } catch (error) {
                console.error('Failed parse:', error);
                localStorage.removeItem('mw_isLoggedIn');
                localStorage.removeItem('mw_userData');
            }
        } else {
            setIsLoggedIn(false);
            setUserData(null);
            console.log("No session");
        }

        setLoading(false);

        if (!isAuthenticated) {
            setTimeout(() => {
                if (!localStorage.getItem('mw_isLoggedIn')) {
                    console.warn("Not auth, redirecting...");
                    navigate('/about');
                }
            }, 50);
        } else {
            console.log("Auth OK.");
        }
    }, [navigate]);

    // --- Handlers ---
    const handleLogout = useCallback(() => {
        console.log("Logout");
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        setUserData(null);
        setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn');
        localStorage.removeItem('mw_userData');
        setClientNames([]);
        setSelectedClient('');
        navigate('/about');
    }, [navigate]);

    const handleChatClick = useCallback(() => {
        console.log("Nav chat");
        navigate('/chat');
    }, [navigate]);

    const handleHomeClick = useCallback(() => {
        console.log("Nav home");
        navigate('/about');
    }, [navigate]);

    const handleClientSelect = useCallback((event) => {
        const value = event.target.value;
        setSelectedJob(''); // Reset job selection when client changes
        setSelectedClient(value);

        // Find the selected client object from the clientNames array
        if (value && clientNames.length > 0) {
            // Split the full name into first and last name
            const nameParts = value.split(' ');
            if (nameParts.length >= 2) {
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Find the matching client object
                const selectedClient = clientNames.find(client =>
                    client.ClientFirstName === firstName &&
                    client.ClientLastName === lastName
                );

                if (selectedClient) {
                    console.log("Selected Client Data:", selectedClient);
                    setSelectedClientData(selectedClient);
                } else {
                    console.error("Could not find client data for:", value);
                    setSelectedClientData(null);
                }
            } else {
                console.error("Invalid client name format:", value);
                setSelectedClientData(null);
            }
        } else {
            setSelectedClientData(null);
            setJobs([]);
        }

        console.log("Selected Client:", value);
    }, [clientNames]);

    const handleJobSelect = useCallback((event) => {
        const value = event.target.value;
        setSelectedJob(value);
        console.log("Selected Job:", value);
    }, []);

    // --- Styling ---
    const getStyles = () => {
        const isMobile = window.innerWidth <= 768;

        // Standard styles
        const panelPaddingTop = isMobile ? '100px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)';
        const buttonFontSize = isMobile ? '12px' : 'calc(14px * 1.35)';
        const userNameFontSize = isMobile ? '15px' : 'calc(17px * 1.35)';
        const userEmailFontSize = isMobile ? '11px' : 'calc(13px * 1.35)';
        const sectionHeadingFontSize = isMobile ? '18px' : 'calc(20px * 1.35)';
        const profileTop = isMobile ? '20px' : '30px';
        const profileLeft = panelPaddingSides;
        const buttonStackTop = isMobile ? '15px' : '25px';
        const buttonStackRight = panelPaddingSides;
        const buttonStackGap = isMobile ? '10px' : '15px';
        const contentTopMargin = isMobile ? '120px' : '130px';
        const secondDropdownMarginTop = '20px';

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
                className: 'ui-overlay analysis-home-overlay',
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
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    overflow: 'auto', // Enable scrolling if content is tall
                }
            },
            panel: {
                className: 'flat-panel analysis-home-panel',
                style: {
                    position: 'relative',
                    width: desktopPanelWidth,
                    maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight,
                    maxHeight: '90vh',
                    backgroundColor: 'rgba(13, 20, 24, 0.65)',
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
                    pointerEvents: 'auto',
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
            contentHeading: {
                style: {
                    fontSize: headingFontSize,
                    marginBottom: isMobile ? '15px' : '20px',
                    color: '#57b3c0',
                    fontWeight: 'bold',
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
                    border: '1px solid rgba(87, 179, 192, 0.2)'
                }
            },
            contentSectionHeading: {
                style: {
                    fontSize: sectionHeadingFontSize,
                    marginBottom: '10px',
                    color: '#57b3c0',
                    fontWeight: '600',
                }
            },
            // Enhanced dropdown styling
            dropdownContainerStyle: {
                marginTop: '20px',
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: 'rgba(87, 179, 192, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(87, 179, 192, 0.3)',
                zIndex: '50'
            },
            jobsDropdownContainerStyle: {
                marginTop: '25px',
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 165, 0, 0.3)',
                zIndex: '50'
            },
            clientDropdownLabel: {
                style: {
                    display: 'block',
                    fontSize: isMobile ? '13px' : 'calc(14px * 1.35)',
                    color: '#a7d3d8',
                    marginBottom: '8px',
                    fontWeight: '500',
                }
            },
            jobsDropdownLabel: {
                style: {
                    display: 'block',
                    fontSize: isMobile ? '13px' : 'calc(14px * 1.35)',
                    color: '#ffd27f',
                    marginBottom: '8px',
                    fontWeight: '500',
                }
            },
            clientDropdownSelect: {
                style: {
                    display: 'block',
                    width: '100%',
                    maxWidth: '400px',
                    height: '45px',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)',
                    color: '#e0e0e0',
                    border: '1px solid rgba(87, 179, 192, 0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    appearance: 'none',
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '10px' : '15px'} center`,
                    backgroundSize: '20px',
                }
            },
            jobsDropdownSelect: {
                style: {
                    display: 'block',
                    width: '100%',
                    maxWidth: '400px',
                    height: '45px',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)',
                    color: '#e0e0e0',
                    border: '1px solid rgba(255, 165, 0, 0.4)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    appearance: 'none',
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '10px' : '15px'} center`,
                    backgroundSize: '20px',
                }
            },
            loadingText: {
                style: {
                    fontSize: textFontSize,
                    color: '#a7d3d8',
                    fontStyle: 'italic'
                }
            },
            errorText: {
                style: {
                    fontSize: textFontSize,
                    color: '#ff6347',
                    marginTop: '10px'
                }
            }
        };
    };

    // --- Animation Helper ---
    const animateElement = (element, properties, delay = 0) => {
        if (!element) return;
        element.style.transition = 'all 0.5s ease-out';
        setTimeout(() => {
            requestAnimationFrame(() => {
                Object.keys(properties).forEach(prop => {
                    element.style[prop] = properties[prop];
                });
            });
        }, delay);
    };

    // Reset selected job when client changes
    useEffect(() => {
        if (!selectedClientData) {
            setSelectedJob('');
        }
    }, [selectedClientData]);

    // ====================================
    // UI RENDERING EFFECT
    // ====================================
    useEffect(() => {
        console.log(`Analysis_Home: UI Effect START`);

        if (loading || !isLoggedIn || !userData) {
            console.log("   - Skipping UI.");
            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
                overlayRef.current = null;
                panelRef.current = null;
                document.body.style.overflow = '';
            }
            return;
        }

        if (overlayRef.current || document.querySelector('.analysis-home-overlay')) {
            console.warn("   - Overlay exists, skipping.");
            return;
        }

        console.log("Analysis_Home: Creating UI elements...");
        const styles = getStyles();
        let panel = null;
        let overlay = null;

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.warn("Resize occurred.");
            }, 250);
        };

        try {
            // --- Create Overlay and Panel ---
            overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'analysis-panel';
            Object.assign(panel.style, styles.panel.style);
            panelRef.current = panel;
            console.log("   - Overlay and Panel objects created.");

            // --- CREATE BUTTON STACK ---
            const buttonStackContainer = document.createElement('div');
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);
            buttonStackContainer.id = 'button-stack';

            const logoutButton = document.createElement('button');
            Object.assign(logoutButton.style, styles.logoutButton.style);
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', handleLogout);
            buttonStackContainer.appendChild(logoutButton);

            const chatButton = document.createElement('button');
            Object.assign(chatButton.style, styles.chatButton.style);
            chatButton.textContent = 'Live Chat';
            chatButton.addEventListener('click', handleChatClick);
            buttonStackContainer.appendChild(chatButton);

            const homeButton = document.createElement('button');
            Object.assign(homeButton.style, styles.homeButton.style);
            homeButton.textContent = 'Back to Home';
            homeButton.addEventListener('click', handleHomeClick);
            buttonStackContainer.appendChild(homeButton);

            panel.appendChild(buttonStackContainer);
            console.log("   - Button stack added.");

            // --- CREATE PROFILE INFO ---
            const profileContainer = document.createElement('div');
            Object.assign(profileContainer.style, styles.profileContainer.style);
            profileContainer.id = 'profile-container';

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

            const userNameEl = document.createElement('h3');
            Object.assign(userNameEl.style, styles.userName.style);
            userNameEl.textContent = `${userData.name || 'User'}`;
            profileContainer.appendChild(userNameEl);

            panel.appendChild(profileContainer);
            console.log("   - Profile info added.");

            // --- CREATE CONTENT CONTAINER ---
            console.log("   - Creating Content Container...");
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.contentHeading.style);
            contentHeading.textContent = "Analysis Dashboard 2";
            contentContainer.appendChild(contentHeading);

            // --- CREATE SUMMARY SECTION WITH INCREASED HEIGHT ---
            console.log("   - Creating Summary Section...");
            const summarySection = document.createElement('div');
            summarySection.id = SUMMARY_SECTION_ID;
            // Apply extended styling with increased minimum height
            Object.assign(summarySection.style, {
                ...styles.contentSection.style,
                minHeight: '250px',
                paddingBottom: '30px'
            });

            const summaryHeading = document.createElement('h3');
            Object.assign(summaryHeading.style, styles.contentSectionHeading.style);
            summaryHeading.textContent = "Dashboard Summary";
            summarySection.appendChild(summaryHeading);

            const summaryText = document.createElement('p');
            Object.assign(summaryText.style, styles.contentText.style);
            summaryText.textContent = "Display summary charts or vital statistics here. (e.g., Jobs Analyzed, Trend Indicators, etc.)";
            summarySection.appendChild(summaryText);

            // --- ADD CLIENT DROPDOWN DIRECTLY AFTER SUMMARY TEXT ---
            const dropdownContainer = document.createElement('div');
            dropdownContainer.id = DROPDOWN_CONTAINER_ID;
            Object.assign(dropdownContainer.style, styles.dropdownContainerStyle);

            // Create Label
            const dropdownLabel = document.createElement('label');
            dropdownLabel.htmlFor = DROPDOWN_SELECT_ID;
            Object.assign(dropdownLabel.style, styles.clientDropdownLabel.style);
            dropdownLabel.textContent = 'Select Client:';
            dropdownContainer.appendChild(dropdownLabel);

            // Handle loading state for client dropdown
            if (clientsLoading) {
                const loadingText = document.createElement('p');
                Object.assign(loadingText.style, styles.loadingText.style);
                loadingText.textContent = "Loading clients...";
                dropdownContainer.appendChild(loadingText);
            } else {
                // Create Select element with enhanced styling
                const clientSelect = document.createElement('select');
                clientSelect.id = DROPDOWN_SELECT_ID;
                Object.assign(clientSelect.style, styles.clientDropdownSelect.style);
                clientSelect.value = selectedClient;
                clientSelect.addEventListener('change', handleClientSelect);

                // Add Default Option
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a client --";
                clientSelect.appendChild(defaultOption);

                // Add Client Options from API data
                if (clientNames && clientNames.length > 0) {
                    clientNames.forEach((client) => {
                        const option = document.createElement('option');
                        const clientNameString = `${client.ClientFirstName} ${client.ClientLastName}`;
                        option.value = clientNameString;
                        option.textContent = clientNameString;
                        clientSelect.appendChild(option);
                    });
                }

                dropdownContainer.appendChild(clientSelect);

                // Show error message if API request failed
                if (error) {
                    const errorText = document.createElement('p');
                    Object.assign(errorText.style, styles.errorText.style);
                    errorText.textContent = error;
                    dropdownContainer.appendChild(errorText);
                }
            }

            summarySection.appendChild(dropdownContainer);

            if (selectedClientData) {
                const jobsDropdownContainer = document.createElement('div');
                jobsDropdownContainer.id = 'jobs-dropdown-container';
                Object.assign(jobsDropdownContainer.style, styles.jobsDropdownContainerStyle);

                // Create Label for Jobs dropdown
                const jobsLabel = document.createElement('label');
                jobsLabel.htmlFor = 'jobs-dropdown-select';
                Object.assign(jobsLabel.style, styles.jobsDropdownLabel.style);
                jobsLabel.textContent = `Jobs for ${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}:`;
                jobsDropdownContainer.appendChild(jobsLabel);

                // Handle loading state for jobs dropdown
                if (jobsLoading) {
                    const loadingText = document.createElement('p');
                    Object.assign(loadingText.style, styles.loadingText.style);
                    loadingText.textContent = "Loading jobs...";
                    jobsDropdownContainer.appendChild(loadingText);
                } else {
                    // Create Select element with enhanced styling
                    const jobsSelect = document.createElement('select');
                    jobsSelect.id = 'jobs-dropdown-select';
                    Object.assign(jobsSelect.style, styles.jobsDropdownSelect.style);
                    jobsSelect.value = selectedJob;
                    jobsSelect.addEventListener('change', handleJobSelect);

                    // Add Default Option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.textContent = "-- Select a job --";
                    jobsSelect.appendChild(defaultOption);

                    // Add Job Options from API data
                    if (jobs && jobs.length > 0) {
                        console.log("Adding jobs to dropdown:", jobs.length);
                        jobs.forEach((job) => {
                            const option = document.createElement('option');
                            const jobId = job.Id ? job.Id.toString() : '';
                            option.value = jobId;
                            option.textContent = job.JobName ? job.JobName : `Job ID: ${jobId}`;
                            jobsSelect.appendChild(option);
                        });
                    } else {
                        // If no jobs found, disable select and show no jobs message
                        const noJobsOption = document.createElement('option');
                        noJobsOption.value = "";
                        noJobsOption.textContent = "No jobs found for this client";
                        jobsSelect.appendChild(noJobsOption);
                        jobsSelect.disabled = true;
                        console.log("No jobs found for client:", selectedClientData);
                    }

                    jobsDropdownContainer.appendChild(jobsSelect);
                }

                summarySection.appendChild(jobsDropdownContainer);
            }

            contentContainer.appendChild(summarySection);
            console.log("   - Summary section with dropdown added.");

            // --- CREATE METRICS SECTION ---
            console.log("   - Creating Metrics Section...");
            const metricsSection = document.createElement('div');
            metricsSection.id = METRICS_SECTION_ID;
            Object.assign(metricsSection.style, styles.contentSection.style);

            const metricsHeading = document.createElement('h3');
            Object.assign(metricsHeading.style, styles.contentSectionHeading.style);
            metricsHeading.textContent = "Client Analysis Metrics";
            metricsSection.appendChild(metricsHeading);

            // Conditional content based on selection
            const metricsText = document.createElement('p');
            Object.assign(metricsText.style, styles.contentText.style);

            if (selectedJob) {
                const selectedJobObj = jobs.find(job => job.Id.toString() === selectedJob);
                if (selectedJobObj) {
                    metricsText.textContent = `Showing metrics for: ${selectedClient} - ${selectedJobObj.JobName || `Job ID: ${selectedJobObj.Id}`}`;
                } else {
                    metricsText.textContent = `Showing metrics for: ${selectedClient}`;
                }
            } else if (selectedClient) {
                metricsText.textContent = `Please select a job for ${selectedClient} to view detailed metrics.`;
            } else {
                metricsText.textContent = "Please select a client from the dropdown above to view metrics.";
            }

            metricsSection.appendChild(metricsText);
            contentContainer.appendChild(metricsSection);
            console.log("   - Metrics section added.");

            // --- APPEND CONTENT CONTAINER to PANEL ---
            console.log("   - Appending Content Container to Panel...");
            if (panelRef.current) {
                panelRef.current.appendChild(contentContainer);
                console.log("   - Content Container appended.");
            } else {
                console.error("   - CRITICAL: Panel ref lost before content append!");
                throw new Error("Panel ref lost.");
            }

            // --- Append Panel & Overlay to Body ---
            console.log("   - Appending Panel to Overlay...");
            overlay.appendChild(panel);
            console.log("   - Panel appended.");
            console.log("   - Appending Overlay to Body...");

            const existingOverlays = document.querySelectorAll('.ui-overlay');
            existingOverlays.forEach(el => {
                console.warn("   - Removing potentially duplicate overlay:", el.className);
                el.parentNode?.removeChild(el);
            });

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            console.log("   - Overlay appended.");

            // --- Apply animations ---
            console.log("   - Applying Animations...");
            setTimeout(() => {
                if (panelRef.current) animateElement(panelRef.current, { opacity: '1' }, 0);

                const profileEl = panelRef.current?.querySelector('#profile-container');
                if (profileEl) animateElement(profileEl, { opacity: '1', transform: 'translateX(0)' }, 150);

                const buttonsEl = panelRef.current?.querySelector('#button-stack');
                if (buttonsEl) animateElement(buttonsEl, { opacity: '1', transform: 'translateX(0)' }, 150);

                const contentEl = panelRef.current?.querySelector('#content-container');
                if (contentEl) animateElement(contentEl, { opacity: '1', transform: 'translateY(0)' }, 300);

                console.log("   - Animations applied.");
            }, 50);

            console.log("Analysis_Home: UI structure complete.");
            window.addEventListener('resize', handleResize);
            console.log("   - Resize listener added.");

        } catch (error) {
            console.error("Analysis_Home: !!! ERROR in UI Effect !!!", error);

            if (overlayRef.current && overlayRef.current.parentNode) {
                overlayRef.current.remove();
            } else if (overlay && overlay.parentNode) {
                overlay.remove();
            }

            overlayRef.current = null;
            panelRef.current = null;
            document.body.style.overflow = '';
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            return;
        }

        // --- Cleanup function ---
        return () => {
            console.log("Analysis_Home: UI Effect CLEANUP");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            // Remove main overlay
            const overlayToRemove = overlayRef.current ?? document.querySelector('.analysis-home-overlay');
            if (overlayToRemove && overlayToRemove.parentNode) {
                console.log("   - Removing overlay.");
                overlayToRemove.remove();
            } else {
                console.log("   - No overlay found.");
            }

            overlayRef.current = null;
            panelRef.current = null;
            document.body.style.overflow = '';
            console.log("   - Refs cleared, scroll restored.");
        };
    }, [
        isLoggedIn,
        userData,
        loading,
        clientsLoading,
        jobsLoading,
        navigate,
        handleLogout,
        handleChatClick,
        handleHomeClick,
        clientNames,
        selectedClient,
        selectedClientData,
        handleClientSelect,
        handleJobSelect,
        jobs,
        selectedJob,
        error
    ]);

    // Component doesn't render any JSX as UI is created via DOM manipulation
    return null;
}