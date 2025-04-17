/**
 * Analysis_Home.jsx - Specific component for the Analysis Dashboard homepage.
 * REVISED: Added dual API integration - first dropdown for client selection,
 * second dropdown for job selection based on selected client.
 * UPDATED: Added webhook integration for job selection and graph data visualization.
 * FIXED: Resolved ESLint parsing error by adding missing closing brace for useEffect main function body.
 * FIXED: Resolved ESLint no-undef errors for textFontSize by using the value from the styles object.
 * CONFIRMED: Webhook POST request correctly sends the 'job_id' (as 'Id') from the selected job object
 *            obtained via /api/WorkdayStepOneJobs/SearchByClientName in the request body.
 * REMOVED: "Review Data" button and associated iframe overlay functionality.
 * REVISED: Adjusted panel/section transparency for better visual consistency.
 * REVISED: Ensured consistent background transparency for panel and content sections to match screenshot.
 * NEW: Integrated react-force-graph-3d for 3D graph visualization of relational data.
 * FIXED: Corrected graph positioning to render inside the metrics section.
 * NEW: Enhanced graph colors and labels, increased initial zoom by 15%.
 * MOBILE: Added configurable mobile-specific UI element positioning adjustments.
 * MOBILE: Added configurable date formatting and inclusion of Company/Date in metrics text.
 * MOBILE: Ensured graph uses unique colors and labels as specified.
 * REVISED (Based on Research Request): Ensured react-force-graph-3d uses color-coded nodes based on GRAPH_COLORS and implements node labels via the standard nodeLabel prop (typically shown on hover/tooltip). Added comment regarding persistent labels.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// MOBILE, Importing the react-force-graph-3d library for visualization. The specific version (e.g., 1.26.1) should be managed via package.json.
import ForceGraph3D from 'react-force-graph-3d'; // Note hyphen in package name
import "../../style/AboutStyle.css"; // Reusing styling

// --- MOBILE UI ADJUSTMENTS ---
// MOBILE, Configurable offset to move username/email down on mobile. Type: string (e.g., '10px').
const MOBILE_USER_INFO_TOP_OFFSET = '0px';
// MOBILE, Configurable offset to move username/email left on mobile. Type: string (e.g., '-10px').
const MOBILE_USER_INFO_LEFT_OFFSET = '-10px';
// MOBILE, Configurable offset to move the main title ("Analysis Dashboard") up on mobile. Type: string (e.g., '-30px').
const MOBILE_TITLE_TOP_OFFSET = '-125px';
// MOBILE, Configurable offset to move the "Client & Job Selection" section up on mobile. Type: string (e.g., '-30px').
const MOBILE_SUMMARY_SECTION_TOP_OFFSET = '-30px';

// --- FEATURE CONFIGURATION ---
// MOBILE, Configuration variable to control whether the Company name is included in the Analysis/Visualization section text. Type: boolean.
const INCLUDE_COMPANY_IN_METRICS = true;
// MOBILE, Configuration variable to control whether the Job Posted Date is included in the Analysis/Visualization section text. Type: boolean.
const INCLUDE_POSTED_DATE_IN_METRICS = true;
// MOBILE, Configuration variable defining the options for formatting the Job Posted Date. Type: object.
const POSTED_DATE_FORMAT_OPTIONS = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
};
// --- 3D GRAPH CONFIGURATION ---
// MOBILE, Configuration to control node label visibility. Standard implementation uses tooltips/hover. Set to true to enable standard labels. Type: boolean.
const ENABLE_GRAPH_NODE_LABELS = true;
// MOBILE, Configuration to control link label visibility. Standard implementation uses tooltips/hover. Set to true to enable standard labels. Type: boolean.
const ENABLE_GRAPH_LINK_LABELS = true;
// MOBILE, Adjusts the default camera zoom level. Smaller values zoom in closer. Default is around ~200. Type: number.
const GRAPH_INITIAL_CAMERA_DISTANCE = 170; // 15% closer than default
// MOBILE, Sets the relative size of the nodes in the graph. Type: number.
const GRAPH_NODE_RELATIVE_SIZE = 5;
// MOBILE, Sets the resolution of the node geometry (higher means smoother spheres). Type: number (power of 2 recommended).
const GRAPH_NODE_RESOLUTION = 16;
// MOBILE, Controls the curvature of links between nodes. 0 = straight lines. Type: number (0 to 1).
const GRAPH_LINK_CURVATURE = 0.2;


// --- Unique IDs for Manual Elements ---
const DROPDOWN_CONTAINER_ID = 'manual-dropdown-container';
const DROPDOWN_SELECT_ID = 'manual-dropdown-select';
const METRICS_SECTION_ID = 'manual-metrics-section';
const SUMMARY_SECTION_ID = 'summary-section'; // ID for the Client & Job Selection section
const JOBS_DROPDOWN_CONTAINER_ID = 'jobs-dropdown-container';
// REMOVED: REVIEW_DATA_BUTTON_ID = 'review-data-button';
const MAIN_PANEL_OVERLAY_CLASS = 'analysis-home-overlay';
// REMOVED: REVIEW_OVERLAY_ACTIVE_CLASS = 'review-data-overlay-active';
const GRAPH_CONTAINER_ID = 'graph-visualization-container';

// API endpoints
const API_ENDPOINT_CLIENTS = '/api/WorkdayStepOneJobs/UniqueClientNames';
const API_ENDPOINT_JOBS = '/api/WorkdayStepOneJobs/SearchByClientName';
const WEBHOOK_URL = 'https://mountainwestjobsearch.com:5678/webhook/95315b81-babb-4998-8f2c-36df08a54eae';

// REMOVED: IFRAME_URL Constant

// --- Enhanced Graph Configuration ---
// MOBILE, Definition of unique colors used for nodes and links in the 3D graph based on type/group. Type: object.
const GRAPH_COLORS = {
    // Entity types
    PERSON: '#4287f5',         // Bright blue for people
    COMPANY: '#f5a742',        // Golden/amber for companies
    JOB: '#9d42f5',            // Purple for jobs
    SKILL: '#42f59d',          // Mint green for skills
    EDUCATION: '#f542a7',      // Pink for education entities
    DEFAULT: '#cccccc',        // Default gray

    // Relationship types
    WORKS_AT: '#00cc44',       // Green for employment
    APPLIED_TO: '#ffcc00',     // Yellow for applications
    MANAGES: '#ff5500',        // Orange for management
    HAS_SKILL: '#66ccff',      // Light blue for skills
    STUDIED_AT: '#ff66cc',     // Pink for education relationships
    DEFAULT_LINK: '#aaaaaa'    // Default gray for links
};

// MOBILE, Definition of standardized group names for graph entities. Type: object.
const GRAPH_GROUPS = {
    PERSON: 'Person',
    COMPANY: 'Company',
    JOB: 'Job Posting',
    SKILL: 'Skill',
    EDUCATION: 'Education',
    OTHER: 'Other Entity'
};

// MOBILE, Helper function to format date strings according to the configured format. Type: function.
const formatJobDate = (dateString) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null; // Invalid date
        // Combine date and time formatting using Intl.DateTimeFormat for better locale support if needed later
        const formattedDate = date.toLocaleDateString('en-US', {
            year: POSTED_DATE_FORMAT_OPTIONS.year,
            month: POSTED_DATE_FORMAT_OPTIONS.month,
            day: POSTED_DATE_FORMAT_OPTIONS.day,
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: POSTED_DATE_FORMAT_OPTIONS.hour,
            minute: POSTED_DATE_FORMAT_OPTIONS.minute,
            hour12: POSTED_DATE_FORMAT_OPTIONS.hour12,
        });
        return `${formattedDate} ${formattedTime}`;
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return null; // Return null or the original string on error
    }
};


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
    // REMOVED: isReviewOverlayVisible state
    const graphRef = useRef(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600
    });
    const [isGraphExpanded, setIsGraphExpanded] = useState(false);
    const metricsRef = useRef(null);

    // --- Update window dimensions on resize for the 3D graph ---
    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- Fetch client names from API ---
    useEffect(() => {
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
    useEffect(() => {
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
                // MOBILE, Assuming API response contains JobName, Id, Company, PostedDate fields. Type: API data structure assumption.
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
    useEffect(() => {
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
    const handleLogout = useCallback(() => {
        console.log("Logout");
        if (window.google && window.google.accounts && window.google.accounts.id) { window.google.accounts.id.disableAutoSelect(); }
        setUserData(null); setIsLoggedIn(false);
        localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData');
        setClientNames([]); setSelectedClient(''); setJobs([]); setSelectedJob('');
        // REMOVED: setIsReviewOverlayVisible(false); // No longer needed
        navigate('/about');
    }, [navigate]);

    const handleChatClick = useCallback(() => { console.log("Nav chat"); navigate('/chat'); }, [navigate]);
    const handleHomeClick = useCallback(() => { console.log("Nav home"); navigate('/about'); }, [navigate]);

    const handleClientSelect = useCallback((event) => {
        const value = event.target.value;
        setSelectedJob(''); setSelectedClient(value);
        setWebhookStatus(null); setWebhookResponse(null);
        setJobs([]); // REMOVED: setIsReviewOverlayVisible(false); // Hide overlay if client changes
        setGraphData({ nodes: [], links: [] }); // Clear graph data
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

    const handleJobSelect = useCallback((event) => {
        const value = event.target.value; // Job ID string
        setSelectedJob(value);
        setWebhookStatus(null); setWebhookResponse(null);
        // REMOVED: setIsReviewOverlayVisible(false); // Hide overlay if job changes
        setGraphData({ nodes: [], links: [] }); // Reset graph data when selecting a new job
        console.log("Selected Job ID:", value);
        if (value) {
            const selectedJobObject = jobs.find(job => job.Id && job.Id.toString() === value);
            if (selectedJobObject) {
                console.log("Found selected job object:", selectedJobObject);
                setWebhookStatus('sending');
                const webhookData = {
                    Id: selectedJobObject.Id,
                    JobName: selectedJobObject.JobName || "",
                    ClientId: selectedJobObject.ClientId || null,
                    ClientFirstName: selectedJobObject.ClientFirstName || "",
                    ClientLastName: selectedJobObject.ClientLastName || "",
                    // MOBILE, Include Company in webhook data. Type: Data structure modification.
                    Company: selectedJobObject.Company || "",
                    // MOBILE, Include PostedDate in webhook data (optional, might only be needed client-side). Type: Data structure modification.
                    // PostedDate: selectedJobObject.PostedDate || null, // Example if sending to webhook
                    timestamp: new Date().toISOString() // Time the webhook was SENT
                };
                console.log("Sending webhookData to webhook:", webhookData);
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookData)
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                throw new Error(`Webhook error: ${response.status} - ${text}`);
                            });
                        }
                        console.log("Webhook notification sent successfully with status:", response.status);
                        setWebhookStatus('success');
                        return response.json();
                    })
                    .then(data => {
                        console.log("Webhook response data:", data);
                        setWebhookResponse(data);
                        if (data?.nodes && data?.links) {
                            console.log(`Received graph data with ${data.nodes.length} nodes and ${data.links.length} links`);
                            // Process the data for the 3D graph
                            // MOBILE, Applying unique graph colors and default labels during data processing. Type: Data processing for visualization.
                            const processedData = processGraphData(data);
                            setGraphData(processedData);
                        }
                        else {
                            console.log("Webhook response received, but doesn't appear to be graph data:", data);
                        }
                    })
                    .catch(error => {
                        console.error("Failed to send webhook notification or process response:", error);
                        setWebhookStatus('error');
                    });
            } else {
                console.error("Could not find job object in state for ID:", value);
                setWebhookStatus('error');
            }
        } else {
            setWebhookStatus(null);
            setWebhookResponse(null);
            setGraphData({ nodes: [], links: [] }); // Clear graph data when no job is selected
        }
    }, [jobs]);

    // Function to process and enhance the graph data for the 3D visualization
    // MOBILE, Processes raw graph data from API/webhook to apply node colors and labels. Type: Data Preprocessing.
    const processGraphData = (data) => {
        if (!data || !data.nodes || !data.links) {
            return { nodes: [], links: [] };
        }

        // Process nodes - ensure required properties are present and add customizations
        const processedNodes = data.nodes.map(node => {
            // MOBILE, Determine node color based on group/type using pre-defined unique GRAPH_COLORS. Type: Visual styling.
            let nodeColor;
            let nodeGroup;

            switch (node.group?.toLowerCase()) {
                case 'person':
                    nodeColor = GRAPH_COLORS.PERSON;
                    nodeGroup = GRAPH_GROUPS.PERSON;
                    break;
                case 'company':
                    nodeColor = GRAPH_COLORS.COMPANY;
                    nodeGroup = GRAPH_GROUPS.COMPANY;
                    break;
                case 'job':
                    nodeColor = GRAPH_COLORS.JOB;
                    nodeGroup = GRAPH_GROUPS.JOB;
                    break;
                case 'skill':
                    nodeColor = GRAPH_COLORS.SKILL;
                    nodeGroup = GRAPH_GROUPS.SKILL;
                    break;
                case 'education':
                    nodeColor = GRAPH_COLORS.EDUCATION;
                    nodeGroup = GRAPH_GROUPS.EDUCATION;
                    break;
                default:
                    nodeColor = node.color || GRAPH_COLORS.DEFAULT;
                    nodeGroup = node.group || GRAPH_GROUPS.OTHER;
            }

            // Create enhanced node with better labels and properties
            // MOBILE, Setting node properties including 'name' which will be used for default labeling. Type: Data structure for visualization.
            return {
                ...node,
                id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
                // MOBILE, Ensuring node has a 'name' property for use in labels. Type: Data Structure Enhancement.
                name: node.name || node.label || `Node ${node.id}`,
                group: nodeGroup, // Standardized group name
                // MOBILE, Assigning the determined color to the node object. Type: Data Structure Enhancement.
                color: nodeColor, // Enhanced color scheme
                // Size based on node importance if available, with better scaling
                val: node.importance || node.value || node.val || node.size || 1.5,
                // 3D specific properties
                fx: node.fx, // Fixed X position (optional)
                fy: node.fy, // Fixed Y position (optional)
                fz: node.fz,  // Fixed Z position (optional)
                // Additional metadata for tooltips
                description: node.description || '',
                type: nodeGroup
            };
        });

        // Process links - ensure source and target references are valid
        const processedLinks = data.links.map(link => {
            // Make sure source and target are valid references
            const sourceExists = processedNodes.some(node => node.id === link.source);
            const targetExists = processedNodes.some(node => node.id === link.target);

            // Determine link color based on relationship type
            // MOBILE, Determine link color based on type using pre-defined unique GRAPH_COLORS. Type: Visual styling.
            let linkColor;
            let linkType = link.type?.toLowerCase();

            switch (linkType) {
                case 'works_at':
                    linkColor = GRAPH_COLORS.WORKS_AT;
                    break;
                case 'applied_to':
                    linkColor = GRAPH_COLORS.APPLIED_TO;
                    break;
                case 'manages':
                    linkColor = GRAPH_COLORS.MANAGES;
                    break;
                case 'has_skill':
                    linkColor = GRAPH_COLORS.HAS_SKILL;
                    break;
                case 'studied_at':
                    linkColor = GRAPH_COLORS.STUDIED_AT;
                    break;
                default:
                    linkColor = link.color || GRAPH_COLORS.DEFAULT_LINK;
            }

            return {
                ...link,
                source: sourceExists ? link.source : processedNodes[0]?.id,
                target: targetExists ? link.target : processedNodes[0]?.id,
                // Enhanced color based on relationship type
                // MOBILE, Assigning the determined color to the link object. Type: Data Structure Enhancement.
                color: linkColor,
                // Enhanced width based on relationship strength with better scaling
                value: link.importance || link.value || link.weight || link.strength || 1,
                // Description for potential tooltip/label
                // MOBILE, Ensuring link has a 'label' property for use in labels. Type: Data Structure Enhancement.
                label: link.label || link.type || 'connects to',
                type: link.type || 'connection'
            };
        }).filter(link => link.source !== link.target); // Filter out self-loops

        return { nodes: processedNodes, links: processedLinks };
    };

    // --- Styling ---
    const getStyles = useCallback(() => {
        const isMobile = window.innerWidth <= 768;
        // ... other size calculations ...
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
        const contentTopMargin = isMobile ? '120px' : '130px'; // Base top margin for content

        const standardButtonStyle = {
            fontSize: buttonFontSize,
            padding: isMobile ? '5px 10px' : '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            width: 'fit-content',
            pointerEvents: 'auto',
            transition: 'transform 0.2s ease, background-color 0.2s ease, opacity 0.5s ease-out',
            display: 'inline-block'
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

        // Base style for content sections
        const baseContentSectionStyle = {
            backgroundColor: sectionBg,
            padding: isMobile ? '15px' : '20px',
            borderRadius: '8px',
            marginBottom: isMobile ? '15px' : '20px',
            border: `1px solid ${sectionBorder}`,
            position: 'relative' // Add position for proper stacking context
        };

        // MOBILE, Dynamic height calculation for graph container based on expansion state and screen size. Type: Responsive Styling.
        const graphContainerHeight = isGraphExpanded ?
            (isMobile ? '400px' : '500px') :
            (isMobile ? '300px' : '400px');

        return {
            // --- Existing Styles (with transparency adjustments) ---
            overlay: {
                className: `${MAIN_PANEL_OVERLAY_CLASS}`,
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
                    overflow: 'auto',
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
                    backgroundColor: mainPanelBg,
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
                    // MOBILE, No direct mobile adjustments here, handled in userInfo
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
                    marginTop: contentTopMargin, // Base margin top for the content area
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
            userInfo: { // User Info container style
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                    // MOBILE, Applies vertical (down) and horizontal (left) offsets to the user info block specifically on mobile. Type: UI Styling.
                    ...(isMobile && {
                        marginTop: MOBILE_USER_INFO_TOP_OFFSET,
                        marginLeft: MOBILE_USER_INFO_LEFT_OFFSET,
                        position: 'relative', // Needed for margin offsets to work predictably
                    })
                }
            },
            userName: { // Individual username style
                style: {
                    margin: '0',
                    fontSize: userNameFontSize,
                    color: '#a7d3d8',
                    fontWeight: '500',
                }
            },
            userEmail: { // Individual email style
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
            contentHeading: { // Style for the "Analysis Dashboard" title
                style: {
                    fontSize: headingFontSize,
                    marginBottom: isMobile ? '15px' : '20px',
                    color: '#57b3c0',
                    fontWeight: 'bold',
                    // MOBILE, Applies a negative top margin to move the title up on mobile screens. Type: UI Styling.
                    ...(isMobile && {
                        marginTop: MOBILE_TITLE_TOP_OFFSET,
                        position: 'relative', // Ensure margin affects layout flow
                    })
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
            // Style for generic content sections (like Metrics)
            contentSection: {
                style: { ...baseContentSectionStyle } // Use the base style
            },
            // Specific style for the Summary/Client Selection section
            summarySectionStyle: {
                style: {
                    ...baseContentSectionStyle, // Start with base styles
                    // MOBILE, Applies a negative top margin to move the Client & Job Selection section up on mobile screens. Type: UI Styling.
                    ...(isMobile && {
                        marginTop: MOBILE_SUMMARY_SECTION_TOP_OFFSET,
                        position: 'relative', // Ensure margin affects layout flow relative to the title above it
                    })
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
            dropdownContainerStyle: {
                marginTop: '20px',
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: sectionBg,
                borderRadius: '8px',
                border: `1px solid ${sectionBorder}`,
                zIndex: '50'
            },
            jobsDropdownContainerStyle: {
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '25px',
                marginBottom: '25px',
                padding: '15px',
                backgroundColor: jobsSectionBg,
                borderRadius: '8px',
                border: `1px solid ${jobsSectionBorder}`,
                zIndex: '50'
            },
            // --- Other styles (unchanged) ---
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
            },
            webhookStatus: {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: isMobile ? '12px' : 'calc(13px * 1.35)',
                    marginTop: '10px'
                }
            },
            webhookStatusIcon: {
                sending: {
                    style: {
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#FFD700',
                        marginRight: '8px',
                        animation: 'pulse 1s infinite',
                    }
                },
                success: {
                    style: {
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                        marginRight: '8px',
                    }
                },
                error: {
                    style: {
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#ff6347',
                        marginRight: '8px',
                    }
                }
            },
            graphDataInfo: {
                style: {
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    fontSize: textFontSize,
                    color: '#a7d3d8',
                }
            },
            // REMOVED: reviewDataButton style definition
            // --- Styles for 3D Graph visualization ---
            graphContainer: { // This style applies to the placeholder div in the main DOM structure
                style: {
                    width: '100%',
                    height: graphContainerHeight, // Use dynamic height
                    backgroundColor: 'rgba(13, 20, 24, 0.5)',
                    borderRadius: '8px',
                    border: '1px solid rgba(87, 179, 192, 0.3)',
                    overflow: 'hidden',
                    marginTop: '20px',
                    position: 'relative',
                    transition: 'height 0.5s ease-out',
                    zIndex: 10, // Important: Set higher z-index for the graph container
                }
            },
            graphPlaceholderText: { // Style for the text shown *before* the graph loads
                style: {
                    color: '#a7d3d8',
                    fontSize: textFontSize,
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '6',
                    pointerEvents: 'none', // Allow clicks to pass through if needed
                }
            },
            graphReactContainer: { // Style for the div that will contain the React-rendered graph
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    zIndex: '20', // Above placeholder text
                }
            },
            graphControls: { // Style for the container holding graph control buttons
                style: {
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 150, // Higher than graph for controls
                    display: 'flex',
                    gap: '8px'
                }
            },
            graphControlButton: { // Style for individual graph control buttons
                style: {
                    ...standardButtonStyle,
                    padding: '4px 8px',
                    fontSize: isMobile ? '10px' : '12px',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)',
                    color: '#a7d3d8',
                    border: '1px solid rgba(87, 179, 192, 0.4)',
                }
            },
            graphLoadingMessage: { // Style for loading message *during* graph rendering
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#a7d3d8',
                    fontSize: textFontSize,
                    textAlign: 'center',
                    backgroundColor: 'rgba(13, 20, 24, 0.7)',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    zIndex: 7, // Above placeholder but below controls
                    whiteSpace: 'nowrap'
                }
            },

            // REMOVED: reviewOverlay, reviewCloseBar, reviewIframe styles
        };
    }, [isGraphExpanded, windowDimensions.width]); // Depend on isGraphExpanded and window width for responsiveness

    // --- Animation Helper ---
    const animateElement = (element, properties, delay = 0) => {
        if (!element) return;
        element.style.transition = 'none';
        setTimeout(() => {
            requestAnimationFrame(() => {
                element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
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
            // REMOVED: setIsReviewOverlayVisible(false);
        }
    }, [selectedClientData]);

    // ====================================
    // UI RENDERING EFFECT (MAIN PANEL)
    // ====================================
    useEffect(() => {
        // --- This effect now ONLY handles the main panel UI ---
        // --- It relies on the transparency settings defined in getStyles() ---
        console.log(`Analysis_Home: UI Effect START`); // REMOVED: isReviewOverlayVisible log
        // --- Cleanup existing main panel overlay ---
        const existingMainOverlay = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
        if (existingMainOverlay) {
            console.log("   - Cleaning up existing main panel overlay.");
            existingMainOverlay.remove();
            overlayRef.current = null;
            panelRef.current = null;
            metricsRef.current = null;
        }
        document.body.style.overflow = ''; // Reset scroll initially

        // --- REMOVED: Check for isReviewOverlayVisible to skip build ---

        // --- Standard checks (loading, login) ---
        if (loading || !isLoggedIn || !userData) {
            console.log("   - Skipping main UI build: Loading or not logged in.");
            document.body.style.overflow = ''; // Ensure scroll restored if exiting here
            return;
        }

        // --- Proceed with FULL UI REBUILD LOGIC for the Main Panel ---
        console.log("Analysis_Home: Creating MAIN PANEL UI elements (Full Rebuild)...");
        const styles = getStyles(); // Get styles including mobile adjustments and transparency
        let panel = null, overlay = null;
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Potentially trigger a style recalculation if needed, but getStyles already depends on width
                console.warn("Resize detected, styles should update via getStyles dependency.");
            }, 250);
        };

        try {
            // --- Create Overlay and Panel (using updated styles from getStyles) ---
            overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay;

            panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'analysis-panel';
            Object.assign(panel.style, styles.panel.style);
            panelRef.current = panel;

            // --- Add Profile, Buttons, Content Container (using updated styles) ---
            const buttonStackContainer = document.createElement('div');
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);
            buttonStackContainer.id = 'button-stack';

            const logoutButton = document.createElement('button');
            Object.assign(logoutButton.style, styles.logoutButton.style);
            logoutButton.className = styles.logoutButton.className;
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', handleLogout);
            buttonStackContainer.appendChild(logoutButton);

            const chatButton = document.createElement('button');
            Object.assign(chatButton.style, styles.chatButton.style);
            chatButton.className = styles.chatButton.className;
            chatButton.textContent = 'Live Chat';
            chatButton.addEventListener('click', handleChatClick);
            buttonStackContainer.appendChild(chatButton);

            const homeButton = document.createElement('button');
            Object.assign(homeButton.style, styles.homeButton.style);
            homeButton.className = styles.homeButton.className;
            homeButton.textContent = 'Back to Home';
            homeButton.addEventListener('click', handleHomeClick);
            buttonStackContainer.appendChild(homeButton);

            panel.appendChild(buttonStackContainer);

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

            // ** Apply styles with mobile offsets already included from getStyles **
            const userInfo = document.createElement('div');
            Object.assign(userInfo.style, styles.userInfo.style); // Includes mobile offsets if applicable

            const userNameEl = document.createElement('h3');
            Object.assign(userNameEl.style, styles.userName.style);
            userNameEl.textContent = `${userData.name || 'User'}`;
            userInfo.appendChild(userNameEl);

            const userEmailEl = document.createElement('p');
            Object.assign(userEmailEl.style, styles.userEmail.style);
            userEmailEl.textContent = `${userData.email || 'No email'}`;
            userInfo.appendChild(userEmailEl);

            profileContainer.appendChild(userInfo);
            panel.appendChild(profileContainer);

            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // ** Apply styles with mobile offsets already included from getStyles **
            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.contentHeading.style); // Includes mobile offsets if applicable
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);


            // --- CREATE SUMMARY SECTION (Client & Job Selection) ---
            // ** Apply specific summary section styles with mobile offsets from getStyles **
            const summarySection = document.createElement('div');
            summarySection.id = SUMMARY_SECTION_ID;
            Object.assign(summarySection.style, styles.summarySectionStyle.style); // Use specific style with mobile offset

            const summaryHeading = document.createElement('h3');
            Object.assign(summaryHeading.style, styles.contentSectionHeading.style);
            summaryHeading.textContent = "Client & Job Selection";
            summarySection.appendChild(summaryHeading);

            const summaryText = document.createElement('p');
            Object.assign(summaryText.style, styles.contentText.style);
            summaryText.textContent = "Select a client, then choose a specific job to analyze relationships and metrics.";
            summarySection.appendChild(summaryText);


            // --- ADD CLIENT DROPDOWN (using updated styles.dropdownContainerStyle) ---
            const dropdownContainer = document.createElement('div');
            dropdownContainer.id = DROPDOWN_CONTAINER_ID;
            Object.assign(dropdownContainer.style, styles.dropdownContainerStyle);

            const dropdownLabel = document.createElement('label');
            dropdownLabel.htmlFor = DROPDOWN_SELECT_ID;
            Object.assign(dropdownLabel.style, styles.clientDropdownLabel.style);
            dropdownLabel.textContent = 'Select Client:';
            dropdownContainer.appendChild(dropdownLabel);

            if (clientsLoading) {
                const loadingText = document.createElement('p');
                Object.assign(loadingText.style, styles.loadingText.style);
                loadingText.textContent = "Loading clients...";
                dropdownContainer.appendChild(loadingText);
            } else {
                const clientSelect = document.createElement('select');
                clientSelect.id = DROPDOWN_SELECT_ID;
                Object.assign(clientSelect.style, styles.clientDropdownSelect.style);
                clientSelect.value = selectedClient;
                clientSelect.addEventListener('change', handleClientSelect);

                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a client --";
                clientSelect.appendChild(defaultOption);

                if (clientNames?.length > 0) {
                    clientNames.forEach((client) => {
                        const option = document.createElement('option');
                        const clientNameString = `${client.ClientFirstName} ${client.ClientLastName}`;
                        option.value = clientNameString;
                        option.textContent = clientNameString;
                        clientSelect.appendChild(option);
                    });
                }
                dropdownContainer.appendChild(clientSelect);

                if (error?.startsWith("Failed to load clients") && clientNames.length === 0) {
                    const errorText = document.createElement('p');
                    Object.assign(errorText.style, styles.errorText.style);
                    errorText.textContent = error;
                    dropdownContainer.appendChild(errorText);
                }
            }

            summarySection.appendChild(dropdownContainer);

            // --- ADD JOBS DROPDOWN (using updated styles.jobsDropdownContainerStyle) ---
            if (selectedClientData) {
                const jobsDropdownContainer = document.createElement('div');
                jobsDropdownContainer.id = JOBS_DROPDOWN_CONTAINER_ID;
                Object.assign(jobsDropdownContainer.style, styles.jobsDropdownContainerStyle);

                const jobsLabel = document.createElement('label');
                jobsLabel.htmlFor = 'jobs-dropdown-select';
                Object.assign(jobsLabel.style, styles.jobsDropdownLabel.style);
                jobsLabel.textContent = `Select Job for ${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}:`;
                jobsDropdownContainer.appendChild(jobsLabel);

                if (jobsLoading) {
                    const loadingText = document.createElement('p');
                    Object.assign(loadingText.style, styles.loadingText.style);
                    loadingText.textContent = "Loading jobs...";
                    jobsDropdownContainer.appendChild(loadingText);
                } else {
                    const jobsSelect = document.createElement('select');
                    jobsSelect.id = 'jobs-dropdown-select';
                    Object.assign(jobsSelect.style, styles.jobsDropdownSelect.style);
                    jobsSelect.value = selectedJob;
                    jobsSelect.addEventListener('change', handleJobSelect);

                    const defaultJobOption = document.createElement('option');
                    defaultJobOption.value = "";
                    defaultJobOption.textContent = "-- Select a job --";
                    jobsSelect.appendChild(defaultJobOption);

                    if (jobs?.length > 0) {
                        jobs.forEach((job) => {
                            const option = document.createElement('option');
                            const jobId = job.Id ? job.Id.toString() : '';
                            option.value = jobId;
                            // MOBILE, Option text includes JobName, Company, and formatted PostedDate if available. Type: UI text update.
                            let optionText = job.JobName ? `${job.JobName}` : `Job ID: ${jobId}`;
                            if (job.Company) {
                                optionText += ` @ ${job.Company}`;
                            }
                            const formattedDate = formatJobDate(job.PostedDate);
                            if (formattedDate) {
                                optionText += ` (Posted: ${formattedDate})`;
                            } else {
                                optionText += ` (ID: ${jobId})`; // Fallback ID display if date missing
                            }
                            option.textContent = optionText;
                            jobsSelect.appendChild(option);
                        });
                    } else if (!error) {
                        const noJobsOption = document.createElement('option');
                        noJobsOption.value = "";
                        noJobsOption.textContent = "No jobs found for this client";
                        noJobsOption.disabled = true;
                        jobsSelect.appendChild(noJobsOption);
                    }
                    jobsDropdownContainer.appendChild(jobsSelect);

                    if (error?.startsWith("Failed to load jobs") && jobs.length === 0) {
                        const errorText = document.createElement('p');
                        Object.assign(errorText.style, styles.errorText.style);
                        errorText.textContent = error;
                        jobsDropdownContainer.appendChild(errorText);
                    }

                    if (selectedJob && webhookStatus) {
                        const statusContainer = document.createElement('div');
                        Object.assign(statusContainer.style, styles.webhookStatus.style);
                        const statusIcon = document.createElement('div');
                        Object.assign(statusIcon.style, styles.webhookStatusIcon[webhookStatus]?.style || {});
                        statusContainer.appendChild(statusIcon);
                        const statusText = document.createElement('span');

                        switch (webhookStatus) {
                            case 'sending':
                                statusText.textContent = 'Sending job data...';
                                statusText.style.color = '#FFD700';
                                break;
                            case 'success':
                                statusText.textContent = 'Job data sent successfully.';
                                statusText.style.color = '#4CAF50';
                                break;
                            case 'error':
                                statusText.textContent = 'Error sending job data.';
                                statusText.style.color = '#ff6347';
                                break;
                            default:
                                statusText.textContent = '';
                        }
                        statusContainer.appendChild(statusText);
                        jobsDropdownContainer.appendChild(statusContainer);
                    }

                    if (selectedJob && webhookStatus === 'success' && webhookResponse) {
                        const graphDataInfo = document.createElement('div');
                        Object.assign(graphDataInfo.style, styles.graphDataInfo.style);
                        const nodeCount = webhookResponse.nodes?.length ?? 0;
                        const linkCount = webhookResponse.links?.length ?? 0;
                        graphDataInfo.innerHTML = `<strong>Relational Graph Data Received</strong><br><span style="color: ${GRAPH_COLORS.DEFAULT}">● ${nodeCount} entities</span> | <span style="color: ${GRAPH_COLORS.DEFAULT_LINK}">● ${linkCount} relationships</span>`;
                        jobsDropdownContainer.appendChild(graphDataInfo);
                    }

                    // REMOVED: Review Data button creation and appending logic
                    // REMOVED: Logic to remove existing review button

                }
                summarySection.appendChild(jobsDropdownContainer);
            }
            contentContainer.appendChild(summarySection);

            // --- CREATE METRICS / VISUALIZATION SECTION (using GENERIC contentSection styles) ---
            const metricsSection = document.createElement('div');
            metricsSection.id = METRICS_SECTION_ID;
            metricsRef.current = metricsSection;
            Object.assign(metricsSection.style, styles.contentSection.style); // Use the generic style here

            const metricsHeading = document.createElement('h3');
            Object.assign(metricsHeading.style, styles.contentSectionHeading.style);
            metricsHeading.textContent = "Analysis & Visualization";
            metricsSection.appendChild(metricsHeading);

            const metricsText = document.createElement('p');
            Object.assign(metricsText.style, styles.contentText.style);

            // Status text based on selection & webhook status
            // MOBILE, Modified logic to include Company and formatted Posted Date in the metrics text, based on configuration flags. Type: UI Text Content Update.
            if (selectedJob) {
                const selectedJobObj = jobs.find(job => job.Id?.toString() === selectedJob);
                const clientNameString = selectedClientData ? `${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}` : 'Client';
                let jobDesc = selectedJobObj ? (selectedJobObj.JobName || `ID: ${selectedJobObj.Id}`) : `ID: ${selectedJob}`;

                // Add Company if configured and available
                if (INCLUDE_COMPANY_IN_METRICS && selectedJobObj?.Company) {
                    jobDesc += ` @ ${selectedJobObj.Company}`;
                }

                // Add formatted Posted Date if configured and available
                const formattedDate = INCLUDE_POSTED_DATE_IN_METRICS ? formatJobDate(selectedJobObj?.PostedDate) : null;
                if (formattedDate) {
                    jobDesc += ` (Posted: ${formattedDate})`;
                }

                let statusPrefix = "";
                if (webhookStatus === 'sending') {
                    statusPrefix = `Fetching analysis for: ${clientNameString} - ${jobDesc}...`;
                } else if (webhookStatus === 'error') {
                    statusPrefix = `Error fetching analysis for: ${clientNameString} - ${jobDesc}.`;
                } else if (webhookStatus === 'success' && webhookResponse?.nodes?.length > 0) {
                    // Changed condition to check if nodes actually exist
                    statusPrefix = `Analysis loaded for: ${clientNameString} - ${jobDesc}. Visualization below.`;
                } else if (webhookStatus === 'success') {
                    statusPrefix = `Analysis data received for: ${clientNameString} - ${jobDesc}, but no graph entities found.`;
                } else {
                    statusPrefix = `Ready to analyze: ${clientNameString} - ${jobDesc}.`;
                }
                metricsText.textContent = statusPrefix;

            } else if (selectedClientData) {
                metricsText.textContent = `Please select a job for ${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}.`;
            } else {
                metricsText.textContent = "Please select a client and then a job to begin analysis.";
            }
            metricsSection.appendChild(metricsText);

            // --- ADD GRAPH CONTAINER (placeholder where React will render the graph) ---
            // Only add the placeholder if we expect graph data
            if (selectedJob && webhookStatus === 'success') {
                const graphContainerPlaceholder = document.createElement('div');
                graphContainerPlaceholder.id = GRAPH_CONTAINER_ID; // Use the constant ID
                // Apply styling with proper z-index and dynamic height
                Object.assign(graphContainerPlaceholder.style, styles.graphContainer.style);

                // Add text indicating this is where the graph will appear (or if none is available)
                const graphPlaceholderText = document.createElement('div');
                Object.assign(graphPlaceholderText.style, styles.graphPlaceholderText.style);
                graphPlaceholderText.textContent = (webhookResponse?.nodes?.length > 0)
                    ? 'Loading 3D Graph Visualization...'
                    : 'No visualization data available for this job.';

                graphContainerPlaceholder.appendChild(graphPlaceholderText);
                metricsSection.appendChild(graphContainerPlaceholder);
            }

            contentContainer.appendChild(metricsSection);

            // --- APPEND CONTENT CONTAINER to PANEL ---
            if (panelRef.current) panelRef.current.appendChild(contentContainer);
            else throw new Error("Panel ref null before content append.");

            // --- Append Panel & Overlay to Body ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden'; // Lock scroll

            // --- Apply animations ---
            setTimeout(() => {
                if (overlayRef.current?.parentNode === document.body) {
                    animateElement(panelRef.current, { opacity: '1' }, 0);
                    const profileEl = panelRef.current?.querySelector('#profile-container');
                    if (profileEl) animateElement(profileEl, { opacity: '1', transform: 'translateX(0)' }, 150);
                    const buttonsEl = panelRef.current?.querySelector('#button-stack');
                    if (buttonsEl) animateElement(buttonsEl, { opacity: '1', transform: 'translateX(0)' }, 150);
                    const contentEl = panelRef.current?.querySelector('#content-container');
                    if (contentEl) animateElement(contentEl, { opacity: '1', transform: 'translateY(0)' }, 300);
                }
            }, 50);

            window.addEventListener('resize', handleResize);
            console.log("Analysis_Home: MAIN PANEL UI structure complete.");

        } catch (error) {
            console.error("Analysis_Home: CRITICAL ERROR during UI Effect!", error);
            if (overlayRef.current?.parentNode) overlayRef.current.remove();
            else if (overlay?.parentNode) overlay.remove();
            else {
                const existing = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
                if (existing) existing.remove();
            }
            overlayRef.current = null;
            panelRef.current = null;
            metricsRef.current = null;
            document.body.style.overflow = '';
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            setError("Failed to render dashboard UI.");
            return;
        }

        // --- Cleanup function for the MAIN PANEL UI Effect ---
        return () => {
            console.log("Analysis_Home: MAIN PANEL UI Effect CLEANUP running.");
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            const mainOverlayToRemove = overlayRef.current;
            if (mainOverlayToRemove?.parentNode) {
                console.log("   - Removing main panel overlay via ref.");
                mainOverlayToRemove.remove();
            } else {
                // Fallback check in case ref got detached somehow
                const existingFromQuery = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
                if (existingFromQuery) {
                    console.log("   - Removing main panel overlay via querySelector fallback.");
                    existingFromQuery.remove();
                } else {
                    console.log("   - No main panel overlay found to remove.");
                }
            }

            overlayRef.current = null;
            panelRef.current = null;
            metricsRef.current = null;

            // Always restore scroll on cleanup now
            document.body.style.overflow = '';
            console.log("   - Restoring body scroll.");

            console.log("   - Main panel cleanup finished.");
        };
    }, [
        isLoggedIn, userData, loading, clientsLoading, jobsLoading, clientNames,
        selectedClient, selectedClientData, jobs, selectedJob, error,
        webhookStatus, webhookResponse, // Added webhookResponse dependency
        handleLogout, handleChatClick, handleHomeClick, handleClientSelect, handleJobSelect,
        getStyles, // Now includes mobile adjustments based on window width
        // REMOVED: isReviewOverlayVisible dependency
    ]);


    // ====================================
    // GRAPH3D COMPONENT RENDERER EFFECT
    // ====================================
    useEffect(() => {
        // This effect runs specifically to render or update the 3D force graph
        console.log("Analysis_Home: Graph3D rendering effect START");

        const graphPlaceholder = document.getElementById(GRAPH_CONTAINER_ID);

        // Conditions to *skip* rendering the graph:
        // REMOVED: Check for isReviewOverlayVisible
        if (!selectedJob || webhookStatus !== 'success' || !graphData.nodes || graphData.nodes.length === 0) {
            console.log("   - Skipping graph render: No valid job/data selected or data is empty.");
            if (graphPlaceholder) {
                // Ensure placeholder shows appropriate message if graph isn't rendered
                const existingReactContainer = document.getElementById(`${GRAPH_CONTAINER_ID}-react`);
                if (existingReactContainer) existingReactContainer.remove(); // Clean up previous graph if any
                const placeholderText = graphPlaceholder.querySelector('div'); // Find the inner text div
                if (placeholderText) {
                    placeholderText.textContent = (selectedJob && webhookStatus === 'success') ? 'No visualization data available for this job.' : 'Select a job to view visualization.';
                }
            }
            return; // Exit if no nodes or not ready
        }
        if (!graphPlaceholder) {
            console.warn(`   - Skipping graph render: Cannot find graph placeholder with ID ${GRAPH_CONTAINER_ID}`);
            return; // Can't render if the target element isn't in the DOM yet
        }

        // Proceed with rendering/updating the graph
        console.log(`   - Rendering/updating graph in container #${GRAPH_CONTAINER_ID}`);
        const styles = getStyles(); // Get current styles

        try {
            // Find or create the container div where React will mount the graph
            let graphReactContainer = document.getElementById(`${GRAPH_CONTAINER_ID}-react`);
            if (!graphReactContainer) {
                console.log("   - Creating React container for ForceGraph3D");
                graphReactContainer = document.createElement('div');
                graphReactContainer.id = `${GRAPH_CONTAINER_ID}-react`;
                Object.assign(graphReactContainer.style, styles.graphReactContainer.style);
                graphPlaceholder.appendChild(graphReactContainer); // Append to the placeholder
            } else {
                console.log("   - Found existing React container for ForceGraph3D, will update.");
                // Update styles if needed (e.g., dimensions might change)
                Object.assign(graphReactContainer.style, styles.graphReactContainer.style);
            }

            // Remove placeholder text now that we are rendering the graph
            const placeholderText = graphPlaceholder.querySelector('div:not([id])'); // Find the inner text div
            if (placeholderText) placeholderText.style.display = 'none';


            // Add/Update graph controls (Expand/Reset View)
            let controlsContainer = graphReactContainer.querySelector('#graph-controls');
            if (!controlsContainer) {
                controlsContainer = document.createElement('div');
                controlsContainer.id = 'graph-controls';
                Object.assign(controlsContainer.style, styles.graphControls.style);
                graphReactContainer.appendChild(controlsContainer);
            } else {
                controlsContainer.innerHTML = ''; // Clear previous buttons to rebuild
            }

            // Expand/Collapse button
            const expandButton = document.createElement('button');
            expandButton.textContent = isGraphExpanded ? 'Collapse' : 'Expand';
            Object.assign(expandButton.style, styles.graphControlButton.style);
            expandButton.onclick = () => setIsGraphExpanded(!isGraphExpanded); // Use direct onclick or addEventListener
            controlsContainer.appendChild(expandButton);

            // Reset camera button
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset View';
            Object.assign(resetButton.style, styles.graphControlButton.style);
            resetButton.onclick = () => {
                if (graphRef.current?.cameraPosition) { // Check if method exists
                    graphRef.current.cameraPosition(
                        { z: GRAPH_INITIAL_CAMERA_DISTANCE }, // Reset to initial configured zoom
                        { x: 0, y: 0, z: 0 }, // Look at center
                        1000 // Transition duration
                    );
                } else {
                    console.warn("Cannot reset camera: graphRef.current.cameraPosition is not available.");
                }
            };
            controlsContainer.appendChild(resetButton);

            // Update placeholder's height based on expansion state (affects layout)
            graphPlaceholder.style.height = styles.graphContainer.style.height; // Use height from getStyles

            // Use React's createRoot to render the ForceGraph3D component
            // Use dynamic import for ReactDOM to avoid issues if it's not always needed
            import('react-dom/client').then(ReactDOM => {
                console.log("   - Creating/updating React root for ForceGraph3D");

                // Check if a root already exists for this container
                let root = graphReactContainer._reactRootContainer;
                if (!root) {
                    root = ReactDOM.createRoot(graphReactContainer);
                    graphReactContainer._reactRootContainer = root; // Store the root instance
                }

                // Define the node label function based on configuration
                // MOBILE, Uses config flag ENABLE_GRAPH_NODE_LABELS to enable/disable standard node tooltips/labels. Type: Configurable Feature.
                const nodeLabelFunction = ENABLE_GRAPH_NODE_LABELS
                    ? node => `${node.name || node.id}${node.type ? ` (${node.type})` : ''}`
                    : null; // Set to null to disable labels

                // Define the link label function based on configuration
                // MOBILE, Uses config flag ENABLE_GRAPH_LINK_LABELS to enable/disable standard link tooltips/labels. Type: Configurable Feature.
                const linkLabelFunction = ENABLE_GRAPH_LINK_LABELS
                    ? link => link.label || link.type || 'connects to'
                    : null; // Set to null to disable link labels

                // Render the ForceGraph3D component with enhanced configuration
                root.render(
                    <ForceGraph3D
                        ref={graphRef}
                        graphData={graphData}
                        // MOBILE, Node label function controlled by config flag. Provides labels (typically on hover/tooltip). Type: Visualization configuration.
                        nodeLabel={nodeLabelFunction}
                        // MOBILE, Node color determined by the 'color' property set during data processing using unique GRAPH_COLORS. Type: Visualization configuration.
                        nodeColor={node => node.color}
                        // MOBILE, Node size configured via GRAPH_NODE_RELATIVE_SIZE. Type: Visualization configuration.
                        nodeVal={node => node.val || 1} // Use processed val, fallback to 1
                        nodeRelSize={GRAPH_NODE_RELATIVE_SIZE}
                        // MOBILE, Link label function controlled by config flag. Provides labels (typically on hover/tooltip). Type: Visualization configuration.
                        linkLabel={linkLabelFunction}
                        // MOBILE, Link color determined by the 'color' property set during data processing using unique GRAPH_COLORS. Type: Visualization configuration.
                        linkColor={link => link.color}
                        backgroundColor="rgba(10, 15, 20, 0.1)" // Slightly transparent background
                        width={graphPlaceholder.clientWidth > 0 ? graphPlaceholder.clientWidth : 300} // Ensure width is positive
                        height={graphPlaceholder.clientHeight > 0 ? graphPlaceholder.clientHeight : 300} // Ensure height is positive
                        showNavInfo={true}
                        enableNodeDrag={true}
                        enableNavigationControls={true}
                        linkWidth={link => link.value || 1}
                        linkOpacity={0.7}
                        nodeOpacity={0.9}
                        // MOBILE, Node resolution configured via GRAPH_NODE_RESOLUTION for smoother spheres. Type: Visual Quality Configuration.
                        nodeResolution={GRAPH_NODE_RESOLUTION}
                        // MOBILE, Link curvature configured via GRAPH_LINK_CURVATURE for better visibility. Type: Visual Style Configuration.
                        linkCurvature={GRAPH_LINK_CURVATURE}
                        // Improved warmup and cooldown for better initial layout stability
                        warmupTicks={120}
                        cooldownTime={2000}
                        // Node interaction handler
                        onNodeClick={node => {
                            console.log('Clicked node:', node);
                            // Zoom into node on click example
                            if (graphRef.current?.cameraPosition) {
                                graphRef.current.cameraPosition(
                                    { x: node.x, y: node.y, z: (graphRef.current.cameraPosition().z || GRAPH_INITIAL_CAMERA_DISTANCE) * 0.6 }, // Zoom closer
                                    { x: node.x, y: node.y, z: node.z }, // Look at node center
                                    1000
                                );
                            }
                        }}
                        // MOBILE, Initial camera zoom level configured via GRAPH_INITIAL_CAMERA_DISTANCE. Type: Visualization Configuration.
                        cameraPosition={{ z: GRAPH_INITIAL_CAMERA_DISTANCE }}
                        // Dynamic forces adjustments (can be tuned further)
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                    />
                );

                console.log("   - ForceGraph3D component rendered/updated successfully");

                // Initial camera position setting after render (useful if ref wasn't ready initially)
                setTimeout(() => {
                    if (graphRef.current && !graphRef.current.cameraPosition().z) { // Check if camera position is default/unset
                        graphRef.current.cameraPosition({ z: GRAPH_INITIAL_CAMERA_DISTANCE });
                        console.log("   - Applied initial camera distance post-render.");
                    }
                }, 100);


            }).catch(error => {
                console.error("   - Error rendering ForceGraph3D component:", error);
                if (graphPlaceholder) graphPlaceholder.innerHTML = '<p style="color:red; text-align: center; padding: 20px;">Error rendering graph visualization.</p>';
            });

        } catch (error) {
            console.error("Error rendering 3D graph:", error);
            if (graphPlaceholder) graphPlaceholder.innerHTML = '<p style="color:red; text-align: center; padding: 20px;">Critical error during graph setup.</p>';
        }

        // --- Cleanup function for the GRAPH RENDERER Effect ---
        return () => {
            console.log("Analysis_Home: Graph3D render effect CLEANUP running.");
            const reactContainer = document.getElementById(`${GRAPH_CONTAINER_ID}-react`);
            if (reactContainer && reactContainer._reactRootContainer) {
                console.log("   - Unmounting React graph component.");
                try {
                    reactContainer._reactRootContainer.unmount();
                    delete reactContainer._reactRootContainer; // Clean up stored root
                    // Note: We don't remove the reactContainer itself here,
                    // because the main UI effect might need the placeholder div (GRAPH_CONTAINER_ID)
                    // to exist for its layout calculations or to show messages.
                    // The *content* of the reactContainer is unmounted.
                    // If the graph should fully disappear, the main UI effect should remove GRAPH_CONTAINER_ID.
                    reactContainer.innerHTML = ''; // Clear any residual content just in case
                } catch (e) {
                    console.error("   - Error during React unmount:", e);
                    reactContainer.innerHTML = ''; // Fallback clear
                }
            } else {
                console.log("   - No React graph component found to unmount.");
            }
            // Restore placeholder text if it exists and was hidden
            if (graphPlaceholder) {
                const placeholderText = graphPlaceholder.querySelector('div:not([id])');
                if (placeholderText) {
                    placeholderText.style.display = ''; // Make visible again
                }
            }
            console.log("   - Graph cleanup finished.");
        };
    }, [
        graphData, // Main trigger: redraw if data changes
        selectedJob, // Need job selected
        webhookStatus, // Need webhook success
        // REMOVED: isReviewOverlayVisible dependency
        isGraphExpanded, // Trigger redraw for size changes
        windowDimensions, // Trigger redraw on window resize (for width/height props)
        getStyles // Styles depend on expansion and window size
    ]);


    // ====================================
    // CONDITIONAL JSX RENDERING (REMOVED IFRAME OVERLAY)
    // ====================================
    // REMOVED: The entire `if (isReviewOverlayVisible) { ... }` block.

    // --- Default Return ---
    // The main UI is built entirely within the primary useEffect hook that manipulates the DOM.
    // This component's direct return value is null, allowing the useEffect hook full control
    // over the '#root' or equivalent container.
    return null;
}