/**
 * Analysis_Home.jsx - Specific component for the Analysis Dashboard homepage.
 * REVISED: Added dual API integration - first dropdown for client selection,
 * second dropdown for job selection based on selected client.
 * UPDATED: Added webhook integration for job selection and graph data visualization.
 * FIXED: Resolved ESLint parsing error by adding missing closing brace for useEffect main function body.
 * FIXED: Resolved ESLint no-undef errors for textFontSize by using the value from the styles object.
 * CONFIRMED: Webhook POST request correctly sends the 'job_id' (as 'Id') from the selected job object
 *            obtained via /api/WorkdayStepOneJobs/SearchByClientName in the request body.
 * ADDED: "Review Data" button appears on successful job data send, triggering a full-screen iframe overlay.
 * REVISED: Adjusted panel/section transparency for better visual consistency.
 * FIXED: Corrected iframe overlay rendering logic to ensure it fills the screen and interacts properly
 *        with the main panel managed by useEffect. Ensured main panel DOM is removed when iframe is active.
 * REVISED: Replaced small iframe close 'X' with a larger, more prominent close bar at the top.
 * ADDED: Comment explaining potential issues with embedding external sites like Google due to X-Frame-Options.
 * REVISED: Ensured consistent background transparency for panel and content sections to match screenshot.
 * REVISED: Adjusted iframe close bar styling for better visibility.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../style/AboutStyle.css"; // Reusing styling

// --- Unique IDs for Manual Elements ---
const DROPDOWN_CONTAINER_ID = 'manual-dropdown-container';
const DROPDOWN_SELECT_ID = 'manual-dropdown-select';
const METRICS_SECTION_ID = 'manual-metrics-section';
const SUMMARY_SECTION_ID = 'summary-section';
const JOBS_DROPDOWN_CONTAINER_ID = 'jobs-dropdown-container';
const REVIEW_DATA_BUTTON_ID = 'review-data-button';
const MAIN_PANEL_OVERLAY_CLASS = 'analysis-home-overlay';
const REVIEW_OVERLAY_ACTIVE_CLASS = 'review-data-overlay-active';

// API endpoints
const API_ENDPOINT_CLIENTS = '/api/WorkdayStepOneJobs/UniqueClientNames';
const API_ENDPOINT_JOBS = '/api/WorkdayStepOneJobs/SearchByClientName';
const WEBHOOK_URL = 'https://mountainwestjobsearch.com:5678/webhook/95315b81-babb-4998-8f2c-36df08a54eae';

// IMPORTANT NOTE ON IFRAME_URL:
const IFRAME_URL = 'https://bing.com'; // Using Bing as an example that *might* allow embedding more readily than Google.

export default function Analysis_Home() {
    console.log("Analysis_Home: Component rendering");

    // --- State and Setup ---
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [webhookStatus, setWebhookStatus] = useState(null);
    const [webhookResponse, setWebhookResponse] = useState(null);
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const [clientNames, setClientNames] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [error, setError] = useState(null);
    const [isReviewOverlayVisible, setIsReviewOverlayVisible] = useState(false);

    // --- Fetch client names from API ---
    useEffect(() => { /* ... (unchanged fetch logic) ... */
        console.log("Analysis_Home: Fetching client names from API");
        const fetchClientNames = async () => {
            try {
                setClientsLoading(true);
                const response = await fetch(API_ENDPOINT_CLIENTS);
                if (!response.ok) throw new Error(`API error: ${response.status}`);
                const data = await response.json();
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
                setClientNames([]);
            } finally {
                setClientsLoading(false);
            }
        };
        if (isLoggedIn) fetchClientNames();
    }, [isLoggedIn]);

    // --- Fetch jobs by client name from API ---
    useEffect(() => { /* ... (unchanged fetch logic) ... */
        if (!selectedClientData) { setJobs([]); return; }
        console.log("Analysis_Home: Fetching jobs for client:", selectedClientData);
        const fetchJobsByClient = async () => {
            try {
                setJobsLoading(true); setJobs([]);
                const queryParams = new URLSearchParams({
                    firstName: selectedClientData.ClientFirstName,
                    lastName: selectedClientData.ClientLastName
                });
                const apiUrl = `${API_ENDPOINT_JOBS}?${queryParams.toString()}`;
                console.log("Fetching jobs from:", apiUrl);
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`API error: ${response.status}`);
                const data = await response.json();
                console.log("Jobs fetched successfully:", data);
                setJobs(Array.isArray(data) ? data : []);
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
    useEffect(() => { /* ... (unchanged auth logic) ... */
        console.log("Analysis_Home: Auth useEffect running.");
        const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
        const savedUserData = localStorage.getItem('mw_userData');
        let isAuthenticated = false;
        if (savedLoginStatus === 'true' && savedUserData) {
            try {
                const parsedUserData = JSON.parse(savedUserData);
                setUserData(parsedUserData); setIsLoggedIn(true); isAuthenticated = true;
                console.log("Retrieved session");
            } catch (error) {
                console.error('Failed parse:', error);
                localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData');
            }
        } else {
            setIsLoggedIn(false); setUserData(null); console.log("No session");
        }
        setLoading(false);
        if (!isAuthenticated) {
            setTimeout(() => {
                if (!localStorage.getItem('mw_isLoggedIn')) {
                    console.warn("Not auth, redirecting..."); navigate('/about');
                }
            }, 50);
        } else {
            console.log("Auth OK.");
        }
    }, [navigate]);

    // --- Handlers ---
    const handleLogout = useCallback(() => { /* ... (unchanged logout logic) ... */
        console.log("Logout");
        if (window.google && window.google.accounts && window.google.accounts.id) { window.google.accounts.id.disableAutoSelect(); }
        setUserData(null); setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData');
        setClientNames([]); setSelectedClient(''); setJobs([]); setSelectedJob('');
        setIsReviewOverlayVisible(false); // Close overlay on logout
        navigate('/about');
    }, [navigate]);

    const handleChatClick = useCallback(() => { console.log("Nav chat"); navigate('/chat'); }, [navigate]);
    const handleHomeClick = useCallback(() => { console.log("Nav home"); navigate('/about'); }, [navigate]);

    const handleClientSelect = useCallback((event) => { /* ... (unchanged client select logic) ... */
        const value = event.target.value;
        setSelectedJob(''); setSelectedClient(value);
        setWebhookStatus(null); setWebhookResponse(null);
        setJobs([]); setIsReviewOverlayVisible(false); // Hide overlay if client changes
        if (value && clientNames.length > 0) {
            const nameParts = value.split(' ');
            if (nameParts.length >= 2) {
                const firstName = nameParts[0] || ''; const lastName = nameParts.slice(1).join(' ') || '';
                const foundClient = clientNames.find(c => c.ClientFirstName === firstName && c.ClientLastName === lastName);
                if (foundClient) { console.log("Selected Client Data:", foundClient); setSelectedClientData(foundClient); }
                else { console.error("Could not find client data for:", value); setSelectedClientData(null); }
            } else { console.error("Invalid client name format:", value); setSelectedClientData(null); }
        } else { setSelectedClientData(null); }
        console.log("Selected Client:", value);
    }, [clientNames]);

    const handleJobSelect = useCallback((event) => { /* ... (unchanged job select logic) ... */
        const value = event.target.value; // Job ID string
        setSelectedJob(value);
        setWebhookStatus(null); setWebhookResponse(null);
        setIsReviewOverlayVisible(false); // Hide overlay if job changes
        console.log("Selected Job ID:", value);
        if (value) {
            const selectedJobObject = jobs.find(job => job.Id && job.Id.toString() === value);
            if (selectedJobObject) {
                console.log("Found selected job object:", selectedJobObject);
                setWebhookStatus('sending');
                const webhookData = { Id: selectedJobObject.Id, JobName: selectedJobObject.JobName || "", ClientId: selectedJobObject.ClientId || null, ClientFirstName: selectedJobObject.ClientFirstName || "", ClientLastName: selectedJobObject.ClientLastName || "", Company: selectedJobObject.Company || "", timestamp: new Date().toISOString() };
                console.log("Sending webhookData to webhook:", webhookData);
                fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(webhookData) })
                    .then(response => {
                        if (!response.ok) { return response.text().then(text => { throw new Error(`Webhook error: ${response.status} - ${text}`); }); }
                        console.log("Webhook notification sent successfully with status:", response.status);
                        setWebhookStatus('success'); return response.json();
                    })
                    .then(data => {
                        console.log("Webhook response data:", data); setWebhookResponse(data);
                        if (data?.nodes && data?.links) { console.log(`Received graph data with ${data.nodes.length} nodes and ${data.links.length} links`); }
                        else { console.log("Webhook response received, but doesn't appear to be graph data:", data); }
                    })
                    .catch(error => { console.error("Failed to send webhook notification or process response:", error); setWebhookStatus('error'); });
            } else { console.error("Could not find job object in state for ID:", value); setWebhookStatus('error'); }
        } else { setWebhookStatus(null); setWebhookResponse(null); }
    }, [jobs]);

    // --- Styling ---
    const getStyles = useCallback(() => {
        const isMobile = window.innerWidth <= 768;
        // ... other size calculations (unchanged) ...
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

        const standardButtonStyle = { /* ... (unchanged) ... */
            fontSize: buttonFontSize, padding: isMobile ? '5px 10px' : '8px 15px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', width: 'fit-content', pointerEvents: 'auto', transition: 'transform 0.2s ease, background-color 0.2s ease, opacity 0.5s ease-out', display: 'inline-block'
        };

        // --- Define consistent background transparency (MATCHING SCREENSHOT) ---
        const mainPanelBg = 'rgba(13, 20, 24, 0.8)'; // Dark, moderately transparent main panel
        // Teal sections with higher alpha to match screenshot appearance
        const sectionBg = 'rgba(87, 179, 192, 0.4)'; // More opaque teal sections
        // Orange section (if/when it appears) should have similar alpha
        const jobsSectionBg = 'rgba(255, 165, 0, 0.4)'; // More opaque orange section
        // Borders adjusted slightly if needed
        const sectionBorder = 'rgba(87, 179, 192, 0.5)'; // Slightly stronger border
        const jobsSectionBorder = 'rgba(255, 165, 0, 0.5)';

        return {
            // --- Existing Styles (with transparency adjustments) ---
            overlay: { /* ... (unchanged overlay style) ... */ className: `${MAIN_PANEL_OVERLAY_CLASS}`, style: { zIndex: '9999', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', width: '100vw', height: '100vh', pointerEvents: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', overflow: 'auto', } },
            panel: { /* ... (panel style using mainPanelBg) ... */ className: 'flat-panel analysis-home-panel', style: { position: 'relative', width: desktopPanelWidth, maxWidth: desktopMaxWidth, height: desktopPanelHeight, maxHeight: '90vh', backgroundColor: mainPanelBg, borderRadius: '12px', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)', padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`, color: 'white', pointerEvents: 'auto', overflowY: 'auto', boxSizing: 'border-box', opacity: 0, margin: '0 auto', top: 'auto', left: 'auto', transform: 'none', } },
            profileContainer: { /* ... (unchanged) ... */ style: { position: 'absolute', top: profileTop, left: profileLeft, display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10, opacity: 0, transform: 'translateX(-50px)', } },
            buttonStackContainer: { /* ... (unchanged) ... */ style: { position: 'absolute', top: buttonStackTop, right: buttonStackRight, display: 'flex', flexDirection: 'column', gap: buttonStackGap, zIndex: 100, alignItems: 'flex-end', opacity: 0, transform: 'translateX(50px)', pointerEvents: 'auto', } },
            contentContainer: { /* ... (unchanged) ... */ className: 'content-container', style: { width: '100%', marginTop: contentTopMargin, opacity: 0, transform: 'translateY(30px)', position: 'relative', zIndex: 5 } },
            profilePhoto: { /* ... (unchanged) ... */ style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', border: '2px solid #57b3c0', objectFit: 'cover', flexShrink: 0, } },
            profilePhotoPlaceholder: { /* ... (unchanged) ... */ style: { width: isMobile ? '45px' : '60px', height: isMobile ? '45px' : '60px', borderRadius: '50%', backgroundColor: '#57b3c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: isMobile ? '18px' : '24px', flexShrink: 0, } },
            userInfo: { /* ... (unchanged) ... */ style: { display: 'flex', flexDirection: 'column', textAlign: 'left', } },
            userName: { /* ... (unchanged) ... */ style: { margin: '0', fontSize: userNameFontSize, color: '#a7d3d8', fontWeight: '500', } },
            userEmail: { /* ... (unchanged) ... */ style: { margin: '2px 0 0 0', fontSize: userEmailFontSize, color: '#7a9a9e', } },
            logoutButton: { /* ... (unchanged) ... */ className: 'nav-button logout-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 99, 71, 0.2)', color: '#ff6347', border: '1px solid rgba(255, 99, 71, 0.4)' } },
            chatButton: { /* ... (unchanged) ... */ className: 'nav-button chat-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(255, 165, 0, 0.2)', color: '#FFA500', border: '1px solid rgba(255, 165, 0, 0.4)' } },
            homeButton: { /* ... (unchanged) ... */ className: 'nav-button home-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(87, 179, 192, 0.2)', color: '#57b3c0', border: '1px solid rgba(87, 179, 192, 0.4)', textDecoration: 'none' } },
            contentHeading: { /* ... (unchanged) ... */ style: { fontSize: headingFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#57b3c0', fontWeight: 'bold', } },
            contentText: { /* ... (unchanged) ... */ style: { fontSize: textFontSize, marginBottom: isMobile ? '15px' : '20px', color: '#c0d0d3', lineHeight: '1.6', } },
            // --- Styles using updated background/border ---
            contentSection: { style: { backgroundColor: sectionBg, padding: isMobile ? '15px' : '20px', borderRadius: '8px', marginBottom: isMobile ? '15px' : '20px', border: `1px solid ${sectionBorder}` } },
            contentSectionHeading: { /* ... (unchanged) ... */ style: { fontSize: sectionHeadingFontSize, marginBottom: '10px', color: '#57b3c0', fontWeight: '600', } },
            dropdownContainerStyle: { marginTop: '20px', marginBottom: '25px', padding: '15px', backgroundColor: sectionBg, borderRadius: '8px', border: `1px solid ${sectionBorder}`, zIndex: '50' },
            jobsDropdownContainerStyle: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '25px', marginBottom: '25px', padding: '15px', backgroundColor: jobsSectionBg, borderRadius: '8px', border: `1px solid ${jobsSectionBorder}`, zIndex: '50' },
            // --- Other styles (unchanged) ---
            clientDropdownLabel: { /* ... */ style: { display: 'block', fontSize: isMobile ? '13px' : 'calc(14px * 1.35)', color: '#a7d3d8', marginBottom: '8px', fontWeight: '500', } },
            jobsDropdownLabel: { /* ... */ style: { display: 'block', fontSize: isMobile ? '13px' : 'calc(14px * 1.35)', color: '#ffd27f', marginBottom: '8px', fontWeight: '500', } },
            clientDropdownSelect: { /* ... */ style: { display: 'block', width: '100%', maxWidth: '400px', height: '45px', padding: isMobile ? '8px 10px' : '10px 12px', fontSize: '16px', backgroundColor: 'rgba(13, 20, 24, 0.8)', color: '#e0e0e0', border: '1px solid rgba(87, 179, 192, 0.4)', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: `right ${isMobile ? '10px' : '15px'} center`, backgroundSize: '20px', } },
            jobsDropdownSelect: { /* ... */ style: { display: 'block', width: '100%', maxWidth: '400px', height: '45px', padding: isMobile ? '8px 10px' : '10px 12px', fontSize: '16px', backgroundColor: 'rgba(13, 20, 24, 0.8)', color: '#e0e0e0', border: '1px solid rgba(255, 165, 0, 0.4)', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: `right ${isMobile ? '10px' : '15px'} center`, backgroundSize: '20px', } },
            loadingText: { /* ... */ style: { fontSize: textFontSize, color: '#a7d3d8', fontStyle: 'italic' } },
            errorText: { /* ... */ style: { fontSize: textFontSize, color: '#ff6347', marginTop: '10px' } },
            webhookStatus: { /* ... */ style: { display: 'flex', alignItems: 'center', fontSize: isMobile ? '12px' : 'calc(13px * 1.35)', marginTop: '10px' } },
            webhookStatusIcon: { /* ... */ sending: { style: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFD700', marginRight: '8px', animation: 'pulse 1s infinite', } }, success: { style: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4CAF50', marginRight: '8px', } }, error: { style: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff6347', marginRight: '8px', } } },
            graphDataInfo: { /* ... */ style: { marginTop: '10px', padding: '10px', backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '6px', border: '1px solid rgba(76, 175, 80, 0.3)', fontSize: textFontSize, color: '#a7d3d8', } },
            reviewDataButton: { /* ... */ className: 'nav-button review-data-button', style: { ...standardButtonStyle, backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.4)', marginTop: '15px', opacity: '0', alignSelf: 'flex-start', maxWidth: '400px', width: 'auto', padding: isMobile ? '8px 15px' : '10px 20px', } },

            // --- IFRAME OVERLAY STYLES (with adjusted Close Bar) ---
            reviewOverlay: { /* ... (unchanged) ... */
                style: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', zIndex: 13000, padding: 0, boxSizing: 'border-box', }
            },
            reviewCloseBar: { // Adjusted close bar for better visibility/style
                style: {
                    height: isMobile ? '45px' : '50px', width: '100%',
                    backgroundColor: 'rgba(20, 30, 35, 0.9)', // Slightly darker, more opaque bar
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#E0E0E0', // Lighter text color
                    fontSize: isMobile ? '16px' : '18px', fontWeight: '600', // Bolder text
                    cursor: 'pointer', zIndex: 13001,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.3)', // More visible border
                    flexShrink: 0, transition: 'background-color 0.2s ease',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)', // Add text shadow
                }
            },
            reviewIframe: { /* ... (unchanged) ... */
                style: { width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', flexGrow: 1, }
            },
        };
    }, []);

    // --- Animation Helper ---
    const animateElement = (element, properties, delay = 0) => { /* ... (unchanged) ... */
        if (!element) return; element.style.transition = 'none';
        // element.offsetHeight; // Force reflow if needed
        element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        setTimeout(() => { requestAnimationFrame(() => { Object.keys(properties).forEach(prop => { element.style[prop] = properties[prop]; }); }); }, delay);
    };

    // Reset selected job when client changes
    useEffect(() => { /* ... (unchanged) ... */
        if (!selectedClientData) { setSelectedJob(''); setIsReviewOverlayVisible(false); }
    }, [selectedClientData]);

    // ====================================
    // UI RENDERING EFFECT (MAIN PANEL)
    // ====================================
    useEffect(() => {
        // --- This effect now ONLY handles the main panel UI ---
        // --- It relies on the transparency settings defined in getStyles() ---
        console.log(`Analysis_Home: UI Effect START (isReviewOverlayVisible: ${isReviewOverlayVisible})`);
        // --- Cleanup existing main panel overlay ---
        const existingMainOverlay = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
        if (existingMainOverlay) { console.log("   - Cleaning up existing main panel overlay."); existingMainOverlay.remove(); overlayRef.current = null; panelRef.current = null; }
        document.body.style.overflow = ''; // Reset scroll initially

        // --- Skip main panel build if iframe overlay is active ---
        if (isReviewOverlayVisible) {
            console.log("   - Skipping main UI build (iframe overlay active).");
            document.body.style.overflow = 'hidden'; // Ensure scroll lock
            return; // JSX rendering handles the iframe overlay
        }

        // --- Standard checks (loading, login) ---
        if (loading || !isLoggedIn || !userData) {
            console.log("   - Skipping main UI build: Loading or not logged in.");
            document.body.style.overflow = ''; // Ensure scroll restored if exiting here
            return;
        }

        // --- Proceed with FULL UI REBUILD LOGIC for the Main Panel ---
        console.log("Analysis_Home: Creating MAIN PANEL UI elements (Full Rebuild)...");
        const styles = getStyles(); // Get styles including transparency adjustments
        let panel = null, overlay = null;
        let resizeTimeout;
        const handleResize = () => { /* ... (unchanged resize warning) ... */ clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { console.warn("Resize detected..."); }, 250); };

        try {
            // --- Create Overlay and Panel (using updated styles from getStyles) ---
            overlay = document.createElement('div'); overlay.className = styles.overlay.className; Object.assign(overlay.style, styles.overlay.style); overlayRef.current = overlay;
            panel = document.createElement('div'); panel.className = styles.panel.className; panel.id = 'analysis-panel'; Object.assign(panel.style, styles.panel.style); panelRef.current = panel;

            // --- Add Profile, Buttons, Content Container (using updated styles) ---
            // (Code for creating these elements is unchanged, but they will inherit the styles)
            const buttonStackContainer = document.createElement('div'); Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style); buttonStackContainer.id = 'button-stack'; /* Add buttons */ /* ... */
            const logoutButton = document.createElement('button'); Object.assign(logoutButton.style, styles.logoutButton.style); logoutButton.className = styles.logoutButton.className; logoutButton.textContent = 'Logout'; logoutButton.addEventListener('click', handleLogout); buttonStackContainer.appendChild(logoutButton);
            const chatButton = document.createElement('button'); Object.assign(chatButton.style, styles.chatButton.style); chatButton.className = styles.chatButton.className; chatButton.textContent = 'Live Chat'; chatButton.addEventListener('click', handleChatClick); buttonStackContainer.appendChild(chatButton);
            const homeButton = document.createElement('button'); Object.assign(homeButton.style, styles.homeButton.style); homeButton.className = styles.homeButton.className; homeButton.textContent = 'Back to Home'; homeButton.addEventListener('click', handleHomeClick); buttonStackContainer.appendChild(homeButton);
            panel.appendChild(buttonStackContainer);

            const profileContainer = document.createElement('div'); Object.assign(profileContainer.style, styles.profileContainer.style); profileContainer.id = 'profile-container'; /* Add profile photo/info */ /* ... */
            const profilePhotoEl = document.createElement(userData.picture ? 'img' : 'div'); if (userData.picture) { profilePhotoEl.src = userData.picture; profilePhotoEl.alt = "Profile"; Object.assign(profilePhotoEl.style, styles.profilePhoto.style); } else { profilePhotoEl.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U'; Object.assign(profilePhotoEl.style, styles.profilePhotoPlaceholder.style); } profileContainer.appendChild(profilePhotoEl);
            const userInfo = document.createElement('div'); Object.assign(userInfo.style, styles.userInfo.style);
            const userNameEl = document.createElement('h3'); Object.assign(userNameEl.style, styles.userName.style); userNameEl.textContent = `${userData.name || 'User'}`; userInfo.appendChild(userNameEl);
            const userEmailEl = document.createElement('p'); Object.assign(userEmailEl.style, styles.userEmail.style); userEmailEl.textContent = `${userData.email || 'No email'}`; userInfo.appendChild(userEmailEl);
            profileContainer.appendChild(userInfo);
            panel.appendChild(profileContainer);

            const contentContainer = document.createElement('div'); contentContainer.id = 'content-container'; contentContainer.className = styles.contentContainer.className; Object.assign(contentContainer.style, styles.contentContainer.style); /* Add content heading */ /* ... */
            const contentHeading = document.createElement('h2'); Object.assign(contentHeading.style, styles.contentHeading.style); contentHeading.textContent = "Analysis Dashboard"; contentContainer.appendChild(contentHeading);


            // --- CREATE SUMMARY SECTION (using updated styles.contentSection) ---
            const summarySection = document.createElement('div'); summarySection.id = SUMMARY_SECTION_ID; Object.assign(summarySection.style, styles.contentSection.style); /* Add heading/text */ /* ... */
            const summaryHeading = document.createElement('h3'); Object.assign(summaryHeading.style, styles.contentSectionHeading.style); summaryHeading.textContent = "Client & Job Selection"; summarySection.appendChild(summaryHeading);
            const summaryText = document.createElement('p'); Object.assign(summaryText.style, styles.contentText.style); summaryText.textContent = "Select a client, then choose a specific job to analyze relationships and metrics."; summarySection.appendChild(summaryText);


            // --- ADD CLIENT DROPDOWN (using updated styles.dropdownContainerStyle) ---
            const dropdownContainer = document.createElement('div'); dropdownContainer.id = DROPDOWN_CONTAINER_ID; Object.assign(dropdownContainer.style, styles.dropdownContainerStyle); /* Add label/select */ /* ... */
            const dropdownLabel = document.createElement('label'); dropdownLabel.htmlFor = DROPDOWN_SELECT_ID; Object.assign(dropdownLabel.style, styles.clientDropdownLabel.style); dropdownLabel.textContent = 'Select Client:'; dropdownContainer.appendChild(dropdownLabel);
            if (clientsLoading) { /* ... loading text ... */ const loadingText = document.createElement('p'); Object.assign(loadingText.style, styles.loadingText.style); loadingText.textContent = "Loading clients..."; dropdownContainer.appendChild(loadingText); } else { /* ... client select ... */ const clientSelect = document.createElement('select'); clientSelect.id = DROPDOWN_SELECT_ID; Object.assign(clientSelect.style, styles.clientDropdownSelect.style); clientSelect.value = selectedClient; clientSelect.addEventListener('change', handleClientSelect); const defaultOption = document.createElement('option'); defaultOption.value = ""; defaultOption.textContent = "-- Select a client --"; clientSelect.appendChild(defaultOption); if (clientNames?.length > 0) { clientNames.forEach((client) => { const option = document.createElement('option'); const clientNameString = `${client.ClientFirstName} ${client.ClientLastName}`; option.value = clientNameString; option.textContent = clientNameString; clientSelect.appendChild(option); }); } dropdownContainer.appendChild(clientSelect); if (error?.startsWith("Failed to load clients") && clientNames.length === 0) { const errorText = document.createElement('p'); Object.assign(errorText.style, styles.errorText.style); errorText.textContent = error; dropdownContainer.appendChild(errorText); } }
            summarySection.appendChild(dropdownContainer);

            // --- ADD JOBS DROPDOWN (using updated styles.jobsDropdownContainerStyle) ---
            if (selectedClientData) { /* ... (logic unchanged, uses updated styles) ... */
                const jobsDropdownContainer = document.createElement('div'); jobsDropdownContainer.id = JOBS_DROPDOWN_CONTAINER_ID; Object.assign(jobsDropdownContainer.style, styles.jobsDropdownContainerStyle);
                const jobsLabel = document.createElement('label'); jobsLabel.htmlFor = 'jobs-dropdown-select'; Object.assign(jobsLabel.style, styles.jobsDropdownLabel.style); jobsLabel.textContent = `Select Job for ${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}:`; jobsDropdownContainer.appendChild(jobsLabel);
                if (jobsLoading) { /* ... loading text ... */ const loadingText = document.createElement('p'); Object.assign(loadingText.style, styles.loadingText.style); loadingText.textContent = "Loading jobs..."; jobsDropdownContainer.appendChild(loadingText); }
                else { /* ... job select, status, button logic ... */
                    const jobsSelect = document.createElement('select'); jobsSelect.id = 'jobs-dropdown-select'; Object.assign(jobsSelect.style, styles.jobsDropdownSelect.style); jobsSelect.value = selectedJob; jobsSelect.addEventListener('change', handleJobSelect); /* ... options ... */ const defaultJobOption = document.createElement('option'); defaultJobOption.value = ""; defaultJobOption.textContent = "-- Select a job --"; jobsSelect.appendChild(defaultJobOption); if (jobs?.length > 0) { jobs.forEach((job) => { const option = document.createElement('option'); const jobId = job.Id ? job.Id.toString() : ''; option.value = jobId; option.textContent = job.JobName ? `${job.JobName} (ID: ${jobId})` : `Job ID: ${jobId}`; jobsSelect.appendChild(option); }); } else if (!error) { const noJobsOption = document.createElement('option'); noJobsOption.value = ""; noJobsOption.textContent = "No jobs found for this client"; noJobsOption.disabled = true; jobsSelect.appendChild(noJobsOption); } jobsDropdownContainer.appendChild(jobsSelect);
                    if (error?.startsWith("Failed to load jobs") && jobs.length === 0) { /* ... error text ... */ const errorText = document.createElement('p'); Object.assign(errorText.style, styles.errorText.style); errorText.textContent = error; jobsDropdownContainer.appendChild(errorText); }
                    if (selectedJob && webhookStatus) { /* ... webhook status ... */ const statusContainer = document.createElement('div'); Object.assign(statusContainer.style, styles.webhookStatus.style); const statusIcon = document.createElement('div'); Object.assign(statusIcon.style, styles.webhookStatusIcon[webhookStatus]?.style || {}); statusContainer.appendChild(statusIcon); const statusText = document.createElement('span'); switch (webhookStatus) { case 'sending': statusText.textContent = 'Sending job data...'; statusText.style.color = '#FFD700'; break; case 'success': statusText.textContent = 'Job data sent successfully.'; statusText.style.color = '#4CAF50'; break; case 'error': statusText.textContent = 'Error sending job data.'; statusText.style.color = '#ff6347'; break; default: statusText.textContent = ''; } statusContainer.appendChild(statusText); jobsDropdownContainer.appendChild(statusContainer); }
                    if (selectedJob && webhookStatus === 'success' && webhookResponse) { /* ... graph info ... */ const graphDataInfo = document.createElement('div'); Object.assign(graphDataInfo.style, styles.graphDataInfo.style); const nodeCount = webhookResponse.nodes?.length ?? 0; const linkCount = webhookResponse.links?.length ?? 0; graphDataInfo.innerHTML = `<strong>Relational Graph Data Received</strong><br><span style="color: #8bc34a">● ${nodeCount} entities</span> | <span style="color: #ff9800">● ${linkCount} relationships</span>`; jobsDropdownContainer.appendChild(graphDataInfo); }
                    if (selectedJob && webhookStatus === 'success') { /* ... review button ... */
                        console.log("   - Webhook success, creating Review Data button."); const reviewButton = document.createElement('button'); reviewButton.id = REVIEW_DATA_BUTTON_ID; reviewButton.className = styles.reviewDataButton.className; Object.assign(reviewButton.style, styles.reviewDataButton.style); reviewButton.textContent = 'Review Data'; reviewButton.addEventListener('click', () => { console.log("Review Data button clicked."); setIsReviewOverlayVisible(true); }); jobsDropdownContainer.appendChild(reviewButton);
                        setTimeout(() => { const buttonElement = document.getElementById(REVIEW_DATA_BUTTON_ID); if (buttonElement?.parentNode === jobsDropdownContainer) { animateElement(buttonElement, { opacity: '1' }, 0); console.log("   - Fading in Review Data button."); } }, 100);
                    } else { /* ... remove button if exists ... */ const existingButton = jobsDropdownContainer.querySelector(`#${REVIEW_DATA_BUTTON_ID}`); if (existingButton) existingButton.remove(); }
                }
                summarySection.appendChild(jobsDropdownContainer);
            }
            contentContainer.appendChild(summarySection);

            // --- CREATE METRICS / VISUALIZATION SECTION (using updated styles.contentSection) ---
            const metricsSection = document.createElement('div'); metricsSection.id = METRICS_SECTION_ID; Object.assign(metricsSection.style, styles.contentSection.style); /* Add heading/text/placeholder */ /* ... */
            const metricsHeading = document.createElement('h3'); Object.assign(metricsHeading.style, styles.contentSectionHeading.style); metricsHeading.textContent = "Analysis & Visualization"; metricsSection.appendChild(metricsHeading);
            const metricsText = document.createElement('p'); Object.assign(metricsText.style, styles.contentText.style);
            // (Simplified display logic)
            if (selectedJob) { const selectedJobObj = jobs.find(job => job.Id?.toString() === selectedJob); const clientNameString = selectedClientData ? `${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}` : 'Client'; const jobDesc = selectedJobObj ? (selectedJobObj.JobName || `ID: ${selectedJobObj.Id}`) : `ID: ${selectedJob}`; if (webhookStatus === 'sending') { metricsText.textContent = `Fetching analysis for: ${clientNameString} - ${jobDesc}...`; } else if (webhookStatus === 'error') { metricsText.textContent = `Error fetching analysis for: ${clientNameString} - ${jobDesc}.`; } else if (webhookStatus === 'success' && webhookResponse) { metricsText.textContent = `Analysis loaded for: ${clientNameString} - ${jobDesc}. Visualization below.`; } else { metricsText.textContent = `Ready to analyze: ${clientNameString} - ${jobDesc}.`; } }
            else if (selectedClientData) { metricsText.textContent = `Please select a job for ${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}.`; }
            else { metricsText.textContent = "Please select a client and then a job to begin analysis."; }
            metricsSection.appendChild(metricsText);
            if (selectedJob && webhookStatus === 'success' && webhookResponse?.nodes && webhookResponse?.links) {
                const graphInfoPlaceholder = document.createElement('div'); Object.assign(graphInfoPlaceholder.style, { marginTop: '20px', padding: '20px', border: '1px dashed rgba(87, 179, 192, 0.4)', borderRadius: '8px', textAlign: 'center', color: '#a7d3d8', fontSize: styles.contentText.style.fontSize }); graphInfoPlaceholder.textContent = '[ Graph Visualization Area ]'; metricsSection.appendChild(graphInfoPlaceholder);
            }
            contentContainer.appendChild(metricsSection);

            // --- APPEND CONTENT CONTAINER to PANEL ---
            if (panelRef.current) panelRef.current.appendChild(contentContainer);
            else throw new Error("Panel ref null before content append.");

            // --- Append Panel & Overlay to Body ---
            overlay.appendChild(panel); document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden'; // Lock scroll

            // --- Apply animations ---
            setTimeout(() => { /* ... (unchanged animation logic) ... */ if (overlayRef.current?.parentNode === document.body) { animateElement(panelRef.current, { opacity: '1' }, 0); const profileEl = panelRef.current?.querySelector('#profile-container'); if (profileEl) animateElement(profileEl, { opacity: '1', transform: 'translateX(0)' }, 150); const buttonsEl = panelRef.current?.querySelector('#button-stack'); if (buttonsEl) animateElement(buttonsEl, { opacity: '1', transform: 'translateX(0)' }, 150); const contentEl = panelRef.current?.querySelector('#content-container'); if (contentEl) animateElement(contentEl, { opacity: '1', transform: 'translateY(0)' }, 300); } }, 50);

            window.addEventListener('resize', handleResize);
            console.log("Analysis_Home: MAIN PANEL UI structure complete.");

        } catch (error) { /* ... (unchanged error handling) ... */
            console.error("Analysis_Home: CRITICAL ERROR during UI Effect!", error);
            if (overlayRef.current?.parentNode) overlayRef.current.remove(); else if (overlay?.parentNode) overlay.remove(); else { const existing = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`); if (existing) existing.remove(); }
            overlayRef.current = null; panelRef.current = null; document.body.style.overflow = ''; window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout); setError("Failed to render dashboard UI."); return;
        }

        // --- Cleanup function for the MAIN PANEL UI Effect ---
        return () => { /* ... (unchanged cleanup logic) ... */
            console.log("Analysis_Home: MAIN PANEL UI Effect CLEANUP running.");
            window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout);
            const mainOverlayToRemove = overlayRef.current;
            if (mainOverlayToRemove?.parentNode) { console.log("   - Removing main panel overlay via ref."); mainOverlayToRemove.remove(); }
            else { const existingFromQuery = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`); if (existingFromQuery) { console.log("   - Removing main panel overlay via querySelector fallback."); existingFromQuery.remove(); } else { console.log("   - No main panel overlay found to remove."); } }
            overlayRef.current = null; panelRef.current = null;
            if (!document.body.classList.contains(REVIEW_OVERLAY_ACTIVE_CLASS)) { document.body.style.overflow = ''; console.log("   - Restoring body scroll (iframe overlay not active)."); }
            else { console.log("   - Iframe overlay IS active, keeping scroll locked."); }
            console.log("   - Main panel cleanup finished.");
        };
    }, [ // Dependencies list unchanged
        isLoggedIn, userData, loading, clientsLoading, jobsLoading, clientNames,
        selectedClient, selectedClientData, jobs, selectedJob, error,
        webhookStatus, webhookResponse,
        handleLogout, handleChatClick, handleHomeClick, handleClientSelect, handleJobSelect,
        getStyles,
        isReviewOverlayVisible
    ]);

    // ====================================
    // CONDITIONAL JSX RENDERING (IFRAME OVERLAY)
    // ====================================
    if (isReviewOverlayVisible) {
        const styles = getStyles(); // Get styles including updated close bar
        console.log("Rendering Review Data Overlay via JSX");
        document.body.classList.add(REVIEW_OVERLAY_ACTIVE_CLASS); // Mark body
        document.body.style.overflow = 'hidden'; // Ensure scroll lock

        return (
            <div style={styles.reviewOverlay.style} className={`review-data-overlay ${REVIEW_OVERLAY_ACTIVE_CLASS}`}>
                {/* Updated Close Bar */}
                <div
                    style={styles.reviewCloseBar.style}
                    onClick={() => {
                        console.log("Closing Review Data Overlay via bar click");
                        setIsReviewOverlayVisible(false); // Trigger state change back
                        document.body.classList.remove(REVIEW_OVERLAY_ACTIVE_CLASS); // Remove marker class
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(50, 60, 65, 0.95)'} // Darken on hover
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(20, 30, 35, 0.9)'} // Revert from hover
                    role="button"
                    tabIndex={0}
                    aria-label="Close Data Review"
                >
                    Close Data Review
                </div>

                {/* Iframe Area */}
                <iframe
                    src={IFRAME_URL}
                    style={styles.reviewIframe.style}
                    title="Review Data Visualization"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Standard sandbox
                >
                    {/* Fallback content */}
                    <p style={{ padding: '20px', color: '#333' }}>
                        The content could not be displayed. This might be because the website ({IFRAME_URL}) prevents embedding, or your browser does not support iframes.
                    </p>
                </iframe>
            </div>
        );
    }

    // --- Default Return ---
    return null; // useEffect handles main panel DOM
}