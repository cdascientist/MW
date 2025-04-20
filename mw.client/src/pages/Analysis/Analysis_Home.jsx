/**
 * Analysis_Home.jsx - Specific component for the Analysis Dashboard homepage.
 * REVISED: Added dual API integration - first dropdown for client selection,
 * second dropdown for job selection based on selected client.
 * UPDATED: Added webhook integration for job selection and graph data visualization.
 * ENHANCED: Improved touch functionality for mobile devices with the 3D graph visualization
 * NEW: Added persistent node labels with three-spritetext for better visibility
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
 * MOBILE: Improved touch interface for the 3D graph visualization with proper touch handling
 * MOBILE: Added CSS touch-action properties to prevent default browser behaviors on touch
 * MOBILE: Modified control type based on device (orbit for mobile, trackball for desktop)
 * MOBILE: Implemented responsive sizing for touch targets on mobile
 * FIXED: ESLint 'link' defined but never used - Verified 'link' is used as parameter in processGraphData map.
 * FIXED: ESLint 'loading' assigned but never used - Verified 'loading' state is used in main UI useEffect conditional check.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// MOBILE, Importing the react-force-graph-3d library for visualization. The specific version (e.g., 1.26.1) should be managed via package.json.
import ForceGraph3D from 'react-force-graph-3d'; // Note hyphen in package name
import SpriteText from 'three-spritetext'; // Import for persistent node labels
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
// MOBILE, Sets the relative size of nodes on mobile for easier touch targets. Type: number.
const GRAPH_NODE_RELATIVE_SIZE_MOBILE = 7;
// MOBILE, Sets the resolution of the node geometry (higher means smoother spheres). Type: number (power of 2 recommended).
const GRAPH_NODE_RESOLUTION = 16;
// MOBILE, Lower resolution on mobile for better performance. Type: number.
const GRAPH_NODE_RESOLUTION_MOBILE = 8;
// MOBILE, Controls the curvature of links between nodes. 0 = straight lines. Type: number (0 to 1).
const GRAPH_LINK_CURVATURE = 0.2;
// MOBILE, Controls link width, thicker for mobile. Type: number.
const GRAPH_LINK_WIDTH_MOBILE = 2;
// MOBILE, Controls link width for desktop. Type: number.
const GRAPH_LINK_WIDTH_DESKTOP = 1.5;
// MOBILE, Touch action type for the graph container. Type: string.
const GRAPH_TOUCH_ACTION = 'none';
// MOBILE, Mobile touch instructions timeout in ms. Type: number.
const MOBILE_TOUCH_INSTRUCTIONS_TIMEOUT = 5000;
// MOBILE, Mobile cooldown time for simulation in ms. Type: number.
const GRAPH_COOLDOWN_TIME_MOBILE = 3000;
// MOBILE, Desktop cooldown time for simulation in ms. Type: number.
const GRAPH_COOLDOWN_TIME_DESKTOP = 2000;
// NEW, Text label height for persistent node labels on desktop. Type: number.
const NODE_LABEL_TEXT_HEIGHT = 3;
// NEW, Text label height for persistent node labels on mobile. Type: number.
const NODE_LABEL_TEXT_HEIGHT_MOBILE = 4;
// NEW, Y-position offset for text labels relative to nodes. Type: number.
const NODE_LABEL_Y_POSITION = 5;
// NEW, Background color for node labels. Type: string.
const NODE_LABEL_BACKGROUND = 'rgba(0,0,0,0.7)';
// NEW, Text color for node labels. Type: string.
const NODE_LABEL_TEXT_COLOR = '#ffffff';
// NEW, Padding around text in node labels. Type: number.
const NODE_LABEL_PADDING = 2;
// NEW, Border radius for node label backgrounds. Type: number.
const NODE_LABEL_BORDER_RADIUS = 3;

// --- Unique IDs for Manual Elements ---
const DROPDOWN_CONTAINER_ID = 'manual-dropdown-container';
const DROPDOWN_SELECT_ID = 'manual-dropdown-select';
const METRICS_SECTION_ID = 'manual-metrics-section';
const SUMMARY_SECTION_ID = 'summary-section'; // ID for the Client & Job Selection section
const JOBS_DROPDOWN_CONTAINER_ID = 'jobs-dropdown-container';
const MAIN_PANEL_OVERLAY_CLASS = 'analysis-home-overlay';
const GRAPH_CONTAINER_ID = 'graph-visualization-container';
const TOUCH_INSTRUCTIONS_ID = 'touch-instructions';

// API endpoints
const API_ENDPOINT_CLIENTS = '/api/WorkdayStepOneJobs/UniqueClientNames';
const API_ENDPOINT_JOBS = '/api/WorkdayStepOneJobs/SearchByClientName';
const WEBHOOK_URL = 'https://mountainwestjobsearch.com:5678/webhook/95315b81-babb-4998-8f2c-36df08a54eae';

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

/**
 * Helper function to detect if the current device is mobile
 * @returns {boolean} True if device is mobile
 */
const isMobileDevice = () => {
    // Use conditional check for window existence during SSR or testing
    if (typeof window === 'undefined') {
        return false;
    }
    return (
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
};

export default function Analysis_Home() {
    console.log("Analysis_Home: Component rendering");

    // --- State and Setup ---
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    // 'loading' state is used to gate the initial UI rendering until auth check is complete
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
    const graphRef = useRef(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600
    });
    const [isGraphExpanded, setIsGraphExpanded] = useState(false);
    const metricsRef = useRef(null);
    // Initialize isMobile state using the helper function
    const [isMobile, setIsMobile] = useState(isMobileDevice());
    const [showTouchInstructions, setShowTouchInstructions] = useState(false);
    const touchInstructionsTimeoutRef = useRef(null);

    // --- Initialize touch instructions timeout ---
    useEffect(() => {
        // Only show instructions on mobile devices when there's graph data
        if (isMobile && graphData.nodes.length > 0 && webhookStatus === 'success') {
            setShowTouchInstructions(true);

            // Hide instructions after timeout
            touchInstructionsTimeoutRef.current = setTimeout(() => {
                setShowTouchInstructions(false);
            }, MOBILE_TOUCH_INSTRUCTIONS_TIMEOUT);
        }

        return () => {
            if (touchInstructionsTimeoutRef.current) {
                clearTimeout(touchInstructionsTimeoutRef.current);
            }
        };
    }, [isMobile, graphData.nodes.length, webhookStatus]);

    // --- Update window dimensions and mobile status on resize ---
    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
            // Re-check if device is mobile on resize
            setIsMobile(isMobileDevice());
        };

        // Check window existence before adding listener
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            // Initial check
            handleResize();
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

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
            } catch (fetchError) {
                console.error("Failed to fetch client names:", fetchError);
                setError("Failed to load clients. Please try again later.");
                setClientNames([]);
            } finally {
                setClientsLoading(false);
            }
        };
        if (isLoggedIn) fetchClientNames();
    }, [isLoggedIn]); // Re-fetch if login status changes

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
                // MOBILE, Assuming API response contains JobName, Id, Company, PostedDate fields.
                setJobs(Array.isArray(data) ? data : []);
                setError(null); // Clear previous errors on successful fetch
            } catch (fetchError) {
                console.error("Failed to fetch jobs:", fetchError);
                setError("Failed to load jobs. Please try again later.");
                setJobs([]);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobsByClient();
    }, [selectedClientData]); // Re-fetch when selected client changes

    // --- Auth useEffect ---
    useEffect(() => {
        console.log("Analysis_Home: Auth useEffect running.");
        let isAuthenticated = false;
        // Check window existence before accessing localStorage
        if (typeof window !== 'undefined') {
            const savedLoginStatus = localStorage.getItem('mw_isLoggedIn');
            const savedUserData = localStorage.getItem('mw_userData');
            if (savedLoginStatus === 'true' && savedUserData) {
                try {
                    const parsedUserData = JSON.parse(savedUserData);
                    setUserData(parsedUserData); setIsLoggedIn(true); isAuthenticated = true;
                    console.log("Retrieved session");
                } catch (parseError) {
                    console.error('Failed to parse user data:', parseError);
                    localStorage.removeItem('mw_isLoggedIn'); localStorage.removeItem('mw_userData');
                }
            } else {
                setIsLoggedIn(false); setUserData(null); console.log("No session");
            }
        } else {
            // Handle server-side rendering or environment without window
            setIsLoggedIn(false); setUserData(null); console.log("No window object available for auth check.");
        }

        // Mark loading as false *after* checking auth status
        setLoading(false);

        if (!isAuthenticated && typeof window !== 'undefined') {
            // Redirect only if not authenticated and running in a browser
            setTimeout(() => {
                // Double check auth status *inside* timeout in case state updates slowly
                if (!localStorage.getItem('mw_isLoggedIn')) {
                    console.warn("Not authenticated, redirecting to /about...");
                    navigate('/about');
                }
            }, 50);
        } else if (isAuthenticated) {
            console.log("Authentication successful.");
        }
    }, [navigate]); // navigate is a dependency

    // --- Handlers ---
    const handleLogout = useCallback(() => {
        console.log("Logout initiated");
        // Check window existence before accessing Google API or localStorage
        if (typeof window !== 'undefined') {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.disableAutoSelect();
                console.log("Google auto select disabled.");
            }
            localStorage.removeItem('mw_isLoggedIn');
            localStorage.removeItem('mw_userData');
            console.log("Local storage cleared.");
        }
        setUserData(null); setIsLoggedIn(false);
        setClientNames([]); setSelectedClient(''); setJobs([]); setSelectedJob('');
        setGraphData({ nodes: [], links: [] }); // Clear graph data on logout
        setWebhookStatus(null); setWebhookResponse(null);
        navigate('/about');
    }, [navigate]);

    const handleChatClick = useCallback(() => { console.log("Navigate to chat"); navigate('/chat'); }, [navigate]);
    const handleHomeClick = useCallback(() => { console.log("Navigate to home (about)"); navigate('/about'); }, [navigate]);

    const handleClientSelect = useCallback((event) => {
        const value = event.target.value;
        console.log("Client selected:", value);
        setSelectedJob(''); // Reset job selection
        setSelectedClient(value);
        setWebhookStatus(null); setWebhookResponse(null); // Reset webhook status
        setJobs([]); // Clear jobs list
        setGraphData({ nodes: [], links: [] }); // Clear graph data

        if (value && clientNames.length > 0) {
            // Find the client object based on the selected value (which is "FirstName LastName")
            const foundClient = clientNames.find(c => `${c.ClientFirstName} ${c.ClientLastName}` === value);
            if (foundClient) {
                console.log("Found Client Data:", foundClient);
                setSelectedClientData(foundClient);
            } else {
                console.error("Could not find client data object for:", value);
                setSelectedClientData(null);
            }
        } else {
            setSelectedClientData(null); // No client selected or clientNames empty
        }
    }, [clientNames]); // Depends on clientNames list

    const handleJobSelect = useCallback((event) => {
        const value = event.target.value; // Job ID string
        setSelectedJob(value);
        setWebhookStatus(null); setWebhookResponse(null); // Reset webhook status
        setGraphData({ nodes: [], links: [] }); // Reset graph data when selecting a new job
        console.log("Selected Job ID:", value);

        if (value) {
            const selectedJobObject = jobs.find(job => job.Id && job.Id.toString() === value);
            if (selectedJobObject) {
                console.log("Found selected job object:", selectedJobObject);
                setWebhookStatus('sending'); // Indicate sending process started
                const webhookData = {
                    Id: selectedJobObject.Id, // Ensure Id is sent
                    JobName: selectedJobObject.JobName || "",
                    ClientId: selectedJobObject.ClientId || null,
                    ClientFirstName: selectedJobObject.ClientFirstName || "",
                    ClientLastName: selectedJobObject.ClientLastName || "",
                    // MOBILE, Include Company in webhook data
                    Company: selectedJobObject.Company || "",
                    timestamp: new Date().toISOString() // Time the webhook was SENT
                };
                console.log("Sending webhook data:", webhookData);

                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookData)
                })
                    .then(response => {
                        if (!response.ok) {
                            // Attempt to get text first for better error messages
                            return response.text().then(text => {
                                throw new Error(`Webhook error: ${response.status} - ${text || response.statusText}`);
                            });
                        }
                        console.log("Webhook notification sent successfully with status:", response.status);
                        // Try parsing JSON, but handle cases where response might not be JSON
                        return response.json().catch(jsonError => {
                            console.warn("Webhook response was not valid JSON, but request succeeded.", jsonError);
                            return null; // Or handle as needed, maybe just set success status
                        });
                    })
                    .then(data => {
                        console.log("Webhook response data:", data);
                        setWebhookResponse(data); // Store the response data
                        setWebhookStatus('success'); // Mark as success even if data isn't graph data

                        if (data?.nodes && data?.links) {
                            console.log(`Received graph data with ${data.nodes.length} nodes and ${data.links.length} links`);
                            // Process the data for the 3D graph
                            // MOBILE, Applying unique graph colors and default labels during data processing
                            const processedData = processGraphData(data, isMobile); // Pass isMobile flag
                            setGraphData(processedData);

                            // Show touch instructions on mobile when data is received
                            if (isMobile) {
                                setShowTouchInstructions(true);

                                // Hide instructions after timeout
                                if (touchInstructionsTimeoutRef.current) {
                                    clearTimeout(touchInstructionsTimeoutRef.current);
                                }

                                touchInstructionsTimeoutRef.current = setTimeout(() => {
                                    setShowTouchInstructions(false);
                                }, MOBILE_TOUCH_INSTRUCTIONS_TIMEOUT);
                            }
                        } else {
                            console.log("Webhook response received, but doesn't contain expected graph nodes/links structure.");
                            // Keep success status, but graphData remains empty or previous state
                            setGraphData({ nodes: [], links: [] }); // Ensure graph is cleared if response isn't valid graph data
                        }
                    })
                    .catch(error => {
                        console.error("Failed to send webhook notification or process response:", error);
                        setWebhookStatus('error'); // Mark as error
                        setWebhookResponse({ error: error.message }); // Store error message
                        setGraphData({ nodes: [], links: [] }); // Clear graph on error
                    });
            } else {
                console.error("Could not find job object in state for ID:", value);
                setWebhookStatus('error'); // Error finding the job details locally
                setGraphData({ nodes: [], links: [] }); // Clear graph
            }
        } else {
            // No job selected (e.g., "-- Select a job --")
            setWebhookStatus(null);
            setWebhookResponse(null);
            setGraphData({ nodes: [], links: [] }); // Clear graph data
        }
    }, [jobs, isMobile]); // Depends on jobs list and isMobile flag

    // Function to process and enhance the graph data for the 3D visualization
    // MOBILE, Processes raw graph data from API/webhook to apply node colors and labels
    // Added isMobile parameter to potentially adjust processing based on device
    const processGraphData = (data, _isMobileFlag) => { // _isMobileFlag currently unused but available
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
            console.warn("processGraphData received invalid data format:", data);
            return { nodes: [], links: [] };
        }

        // Create a Set of node IDs for efficient lookup
        const nodeIds = new Set(data.nodes.map(node => node.id));

        // Process nodes - ensure required properties are present and add customizations
        const processedNodes = data.nodes.map((node, index) => {
            // MOBILE, Determine node color based on group/type using pre-defined unique GRAPH_COLORS
            let nodeColor;
            let nodeGroup;
            const groupLower = node.group?.toLowerCase();

            switch (groupLower) {
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
                    nodeColor = node.color || GRAPH_COLORS.DEFAULT; // Use node's color if provided, else default
                    nodeGroup = node.group || GRAPH_GROUPS.OTHER; // Use node's group if provided, else default
            }

            // Ensure a unique ID exists
            const nodeId = node.id ?? `generated-node-${index}-${Math.random().toString(16).slice(2)}`;

            // Create enhanced node with better labels and properties
            // MOBILE, Setting node properties including 'name' which will be used for default labeling
            return {
                ...node,
                id: nodeId,
                // MOBILE, Ensuring node has a 'name' property for use in labels/tooltips
                name: node.name || node.label || `Entity ${nodeId}`, // Provide a default name if missing
                group: nodeGroup, // Standardized group name
                // MOBILE, Assigning the determined color to the node object
                color: nodeColor, // Enhanced color scheme
                // Size based on node importance if available, with better scaling
                val: node.importance ?? node.value ?? node.val ?? node.size ?? 1.5, // Use provided value or default
                // 3D specific properties (pass through if they exist)
                fx: node.fx,
                fy: node.fy,
                fz: node.fz,
                // Additional metadata for tooltips
                description: node.description || '',
                type: nodeGroup // Store the standardized type
            };
        });

        // Process links - ensure source and target references are valid node IDs
        // The 'link' parameter here IS used within the map function.
        const processedLinks = data.links.map((link, index) => {
            // Make sure source and target reference valid nodes that exist in the processedNodes list
            const sourceExists = nodeIds.has(link.source);
            const targetExists = nodeIds.has(link.target);

            // If source or target doesn't exist, skip this link or log an error
            if (!sourceExists || !targetExists) {
                console.warn(`Skipping link ${index}: Invalid source ('${link.source}') or target ('${link.target}') ID.`);
                return null; // Mark for filtering out later
            }

            // Determine link color based on relationship type
            // MOBILE, Determine link color based on type using pre-defined unique GRAPH_COLORS
            let linkColor;
            const linkType = link.type?.toLowerCase();

            switch (linkType) {
                case 'works_at': linkColor = GRAPH_COLORS.WORKS_AT; break;
                case 'applied_to': linkColor = GRAPH_COLORS.APPLIED_TO; break;
                case 'manages': linkColor = GRAPH_COLORS.MANAGES; break;
                case 'has_skill': linkColor = GRAPH_COLORS.HAS_SKILL; break;
                case 'studied_at': linkColor = GRAPH_COLORS.STUDIED_AT; break;
                default: linkColor = link.color || GRAPH_COLORS.DEFAULT_LINK; // Use link's color if provided, else default
            }

            return {
                ...link, // Spread existing link properties
                // Ensure source/target are used directly as they are validated
                source: link.source,
                target: link.target,
                // Enhanced color based on relationship type
                // MOBILE, Assigning the determined color to the link object
                color: linkColor,
                // Enhanced width based on relationship strength with better scaling
                value: link.importance ?? link.value ?? link.weight ?? link.strength ?? 1, // Use provided value or default
                // Description for potential tooltip/label
                // MOBILE, Ensuring link has a 'label' property for use in labels
                label: link.label || link.type || 'connects to', // Provide a default label if missing
                type: link.type || 'connection' // Use provided type or default
            };
        })
            // Filter out null links (where source/target was invalid) and self-loops
            .filter(link => link !== null && link.source !== link.target);

        console.log(`Processed graph data: ${processedNodes.length} nodes, ${processedLinks.length} links.`);
        return { nodes: processedNodes, links: processedLinks };
    };


    // --- Styling ---
    // Use useCallback to memoize the style generation function
    const getStyles = useCallback(() => {
        // isMobile state is now managed by useEffect and state variable
        // const isMobile = window.innerWidth <= 768; // Removed direct window access here

        // ... other size calculations based on isMobile state ...
        const panelPaddingTop = isMobile ? '100px' : '130px';
        const panelPaddingSides = isMobile ? '15px' : '40px';
        const panelPaddingBottom = isMobile ? '30px' : '50px';
        const desktopPanelWidth = isMobile ? '95%' : 'calc(85% * 1.35)';
        const desktopPanelHeight = isMobile ? '90vh' : 'calc(85vh * 1.35)';
        const desktopMaxWidth = isMobile ? '1200px' : 'calc(1200px * 1.35)';
        const headingFontSize = isMobile ? '20px' : 'calc(24px * 1.35)';
        const textFontSize = isMobile ? '15px' : 'calc(16px * 1.35)'; // Used for placeholder/status texts
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

        // MOBILE, Dynamic height calculation for graph container based on expansion state and screen size
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
                    overflow: 'auto', // Allow overlay scroll if panel exceeds viewport height
                }
            },
            panel: {
                className: 'flat-panel analysis-home-panel',
                style: {
                    position: 'relative',
                    width: desktopPanelWidth,
                    maxWidth: desktopMaxWidth,
                    height: desktopPanelHeight,
                    maxHeight: '90vh', // Prevent panel from being taller than viewport
                    backgroundColor: mainPanelBg,
                    borderRadius: '12px',
                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                    padding: `${panelPaddingTop} ${panelPaddingSides} ${panelPaddingBottom} ${panelPaddingSides}`,
                    color: 'white',
                    pointerEvents: 'auto',
                    overflowY: 'auto', // Allow panel content to scroll
                    boxSizing: 'border-box',
                    opacity: 0, // Initial state for animation
                    margin: '0 auto', // Center panel horizontally
                    top: 'auto', // Reset potentially inherited positions
                    left: 'auto',
                    transform: 'none', // Reset potentially inherited transforms
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
                    opacity: 0, // Initial state for animation
                    transform: 'translateX(-50px)', // Initial state for animation
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
                    opacity: 0, // Initial state for animation
                    transform: 'translateX(50px)', // Initial state for animation
                    pointerEvents: 'auto',
                }
            },
            contentContainer: {
                className: 'content-container',
                style: {
                    width: '100%',
                    marginTop: contentTopMargin, // Base margin top for the content area
                    opacity: 0, // Initial state for animation
                    transform: 'translateY(30px)', // Initial state for animation
                    position: 'relative', // For z-index stacking context
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
                    fontWeight: 'bold',
                    flexShrink: 0,
                }
            },
            userInfo: { // User Info container style
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                    // MOBILE, Applies vertical (down) and horizontal (left) offsets to the user info block specifically on mobile
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
                    textAlign: 'center', // Center the main title
                    // MOBILE, Applies a negative top margin to move the title up on mobile screens
                    ...(isMobile && {
                        marginTop: MOBILE_TITLE_TOP_OFFSET,
                        position: 'relative', // Ensure margin affects layout flow
                    })
                }
            },
            contentText: { // Style for descriptive text within sections
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
                    // MOBILE, Applies a negative top margin to move the Client & Job Selection section up on mobile screens
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
            dropdownContainerStyle: { // Container for the Client dropdown
                marginTop: '15px', // Reduced top margin
                marginBottom: '20px', // Reduced bottom margin
                padding: '15px',
                backgroundColor: sectionBg, // Use consistent section background
                borderRadius: '8px',
                border: `1px solid ${sectionBorder}`, // Use consistent section border
                zIndex: '50' // Ensure dropdown appears above general content if needed
            },
            jobsDropdownContainerStyle: { // Container for the Job dropdown and status
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '15px', // Reduced top margin
                marginBottom: '20px', // Reduced bottom margin
                padding: '15px',
                backgroundColor: jobsSectionBg, // Use orange background
                borderRadius: '8px',
                border: `1px solid ${jobsSectionBorder}`, // Use orange border
                zIndex: '50' // Ensure dropdown appears above general content if needed
            },
            // --- Dropdown Label and Select Styles ---
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
                    color: '#ffd27f', // Lighter orange for label
                    marginBottom: '8px',
                    fontWeight: '500',
                }
            },
            clientDropdownSelect: {
                style: {
                    display: 'block',
                    width: '100%',
                    maxWidth: '400px', // Limit max width for very wide screens
                    height: '45px',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)', // Darker background for select itself
                    color: '#e0e0e0',
                    border: '1px solid rgba(87, 179, 192, 0.4)', // Teal border
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '10px', // Spacing below dropdown
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    appearance: 'none', // Remove default browser styling
                    // Custom dropdown arrow
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
                    maxWidth: '400px', // Limit max width
                    height: '45px',
                    padding: isMobile ? '8px 10px' : '10px 12px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)', // Darker background
                    color: '#e0e0e0',
                    border: '1px solid rgba(255, 165, 0, 0.4)', // Orange border
                    borderRadius: '6px',
                    cursor: 'pointer',
                    // Removed margin bottom, rely on gap in container
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    appearance: 'none', // Remove default browser styling
                    // Custom dropdown arrow
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: `right ${isMobile ? '10px' : '15px'} center`,
                    backgroundSize: '20px',
                }
            },
            // --- Status/Error Text Styles ---
            loadingText: {
                style: {
                    fontSize: textFontSize, // Use consistent text size
                    color: '#a7d3d8', // Teal-ish color for loading
                    fontStyle: 'italic',
                    padding: '10px 0', // Add some padding
                }
            },
            errorText: {
                style: {
                    fontSize: textFontSize, // Use consistent text size
                    color: '#ff6347', // Tomato red for errors
                    marginTop: '10px', // Spacing above error
                    fontWeight: '500',
                }
            },
            // --- Webhook Status Indicator Styles ---
            webhookStatus: {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: isMobile ? '12px' : 'calc(13px * 1.35)',
                    marginTop: '10px', // Space above status line
                }
            },
            webhookStatusIcon: { // Base style for icon container
                style: {
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '8px',
                    flexShrink: 0, // Prevent icon from shrinking
                },
                // Specific background colors per status
                sending: { backgroundColor: '#FFD700', animation: 'pulse 1.5s infinite ease-in-out' }, // Gold + pulse animation
                success: { backgroundColor: '#4CAF50' }, // Green
                error: { backgroundColor: '#ff6347' }    // Red
            },
            // --- Graph Data Info Box ---
            graphDataInfo: {
                style: {
                    marginTop: '10px',
                    padding: '10px 15px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green background
                    borderRadius: '6px',
                    border: '1px solid rgba(76, 175, 80, 0.3)', // Green border
                    fontSize: textFontSize, // Consistent text size
                    color: '#c0d0d3', // Light text color
                    lineHeight: '1.5',
                }
            },
            // --- Styles for 3D Graph visualization ---
            graphContainer: { // This style applies to the placeholder div in the main DOM structure
                style: {
                    width: '100%',
                    height: graphContainerHeight, // Use dynamic height
                    backgroundColor: 'rgba(13, 20, 24, 0.5)', // Slightly transparent dark background
                    borderRadius: '8px',
                    border: '1px solid rgba(87, 179, 192, 0.3)', // Faint teal border
                    overflow: 'hidden', // Crucial: Prevents graph spilling out
                    marginTop: '20px', // Space above graph container
                    position: 'relative', // For positioning text/controls inside
                    transition: 'height 0.5s ease-out', // Animate height changes
                    zIndex: 10, // Ensure it's above basic text but below absolute controls
                    // MOBILE: Add touch-action property for better mobile touch handling
                    touchAction: GRAPH_TOUCH_ACTION, // Prevents browser default touch actions like scroll/zoom
                    WebkitTapHighlightColor: 'transparent', // Prevent tap highlight on mobile
                }
            },
            graphPlaceholderText: { // Style for the text shown *before* the graph loads or if no data
                style: {
                    color: '#a7d3d8', // Teal-ish text
                    fontSize: textFontSize, // Consistent text size
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)', // Center the text
                    zIndex: 6, // Above graph background, below potential loading spinners
                    pointerEvents: 'none', // Allow clicks/touches to pass through if needed
                    padding: '0 20px', // Prevent text touching edges
                    width: 'calc(100% - 40px)', // Ensure text wraps
                }
            },
            graphReactContainer: { // Style for the div that will contain the React-rendered graph
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'relative', // Needed for absolute positioning of controls inside
                    zIndex: 20, // Above placeholder text
                    // MOBILE: Add touch-action property for better mobile touch handling
                    touchAction: GRAPH_TOUCH_ACTION, // Apply here too for the direct graph parent
                }
            },
            graphControls: { // Style for the container holding graph control buttons
                style: {
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 150, // High z-index to be above graph rendering
                    display: 'flex',
                    gap: '8px',
                    pointerEvents: 'none', // Make container non-interactive by default
                }
            },
            graphControlButton: { // Style for individual graph control buttons
                style: {
                    ...standardButtonStyle, // Inherit base button style
                    padding: isMobile ? '8px 12px' : '4px 8px', // Larger touch target on mobile
                    fontSize: isMobile ? '12px' : '12px',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)', // Dark background
                    color: '#a7d3d8', // Teal-ish text
                    border: '1px solid rgba(87, 179, 192, 0.4)', // Faint teal border
                    pointerEvents: 'auto', // Make buttons interactive
                    // MOBILE: Minimum size for touch targets
                    ...(isMobile && {
                        minWidth: '44px', // Ensure minimum touch area width
                        minHeight: '44px', // Ensure minimum touch area height
                        display: 'flex', // Center content if needed
                        alignItems: 'center',
                        justifyContent: 'center',
                    })
                }
            },
            // Style for loading message *during* graph rendering (optional, if needed)
            graphLoadingMessage: {
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
                    zIndex: 100, // Above graphReactContainer but below controls
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }
            },
            // MOBILE: Mobile touch instructions style
            touchInstructions: {
                style: {
                    position: 'absolute',
                    bottom: '15px', // Slightly higher position
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(13, 20, 24, 0.8)', // More opaque background
                    color: '#ffffff',
                    padding: '8px 12px', // Adjust padding
                    borderRadius: '6px', // Match other elements
                    fontSize: '11px', // Smaller font size
                    textAlign: 'center',
                    pointerEvents: 'none', // Don't block touch events
                    zIndex: 180, // Above all other controls
                    maxWidth: '90%', // Allow more width if needed
                    // Use visibility and opacity for transition
                    opacity: showTouchInstructions ? 0.9 : 0,
                    visibility: showTouchInstructions ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease, visibility 0s linear 0.3s', // Delay visibility change
                    // Hide transition when becoming visible
                    ...(showTouchInstructions && { transition: 'opacity 0.3s ease' }),
                }
            }
        };
    }, [isGraphExpanded, isMobile, showTouchInstructions]); // Dependencies for style recalculation

    // --- Animation Helper ---
    const animateElement = (element, properties, delay = 0) => {
        if (!element) {
            console.warn("animateElement: Target element is null or undefined.");
            return;
        }
        element.style.transition = 'none'; // Disable transition for immediate state setting
        // Apply initial state if needed (often opacity: 0, transform: ...) - assumed styles handle this
        setTimeout(() => {
            requestAnimationFrame(() => {
                // Re-enable transition and apply target properties
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
            setSelectedJob(''); // Clear job selection if client is deselected or data invalid
            // Optionally clear other related states like webhookStatus, graphData etc.
            setWebhookStatus(null);
            setWebhookResponse(null);
            setGraphData({ nodes: [], links: [] });
        }
    }, [selectedClientData]); // Runs when selectedClientData changes


    // ====================================
    // UI RENDERING EFFECT (MAIN PANEL)
    // ====================================
    useEffect(() => {
        console.log(`Analysis_Home: UI Effect START. Loading: ${loading}, LoggedIn: ${isLoggedIn}`);

        // --- Cleanup existing main panel overlay before creating a new one ---
        const existingMainOverlay = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
        if (existingMainOverlay) {
            console.log("   - Cleaning up existing main panel overlay.");
            existingMainOverlay.remove();
            overlayRef.current = null;
            panelRef.current = null;
            metricsRef.current = null; // Reset ref
        }
        // Reset body scroll in case a previous state locked it and didn't clean up
        if (typeof document !== 'undefined') document.body.style.overflow = '';

        // --- Standard checks (loading, login, window object) ---
        // Check for window object existence for client-side execution
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.log("   - Skipping main UI build: Not running in a browser environment.");
            return;
        }

        if (loading || !isLoggedIn || !userData) {
            console.log("   - Skipping main UI build: Loading, not logged in, or no user data.");
            // Ensure scroll is not hidden if we exit here
            document.body.style.overflow = '';
            return; // Exit effect if prerequisites not met
        }

        // --- Proceed with FULL UI REBUILD LOGIC for the Main Panel ---
        console.log("Analysis_Home: Creating MAIN PANEL UI elements (Full Rebuild)...");
        const styles = getStyles(); // Get styles including mobile adjustments and transparency
        let panel = null, overlay = null;

        // Resize handler specific to this effect instance
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Styles are recalculated via getStyles dependency, but ensure panel dimensions update if needed
                const currentPanel = panelRef.current;
                if (currentPanel) {
                    const newStyles = getStyles(); // Recalculate styles on resize
                    Object.assign(currentPanel.style, newStyles.panel.style); // Apply updated panel styles
                    // Potentially update other dynamically sized elements if necessary
                    console.log("Panel styles updated on resize.");
                }
            }, 250);
        };


        try {
            // --- Create Overlay and Panel ---
            overlay = document.createElement('div');
            overlay.className = styles.overlay.className;
            Object.assign(overlay.style, styles.overlay.style);
            overlayRef.current = overlay; // Store ref

            panel = document.createElement('div');
            panel.className = styles.panel.className;
            panel.id = 'analysis-panel';
            Object.assign(panel.style, styles.panel.style);
            panelRef.current = panel; // Store ref

            // --- Add Profile, Buttons, Content Container ---
            const buttonStackContainer = document.createElement('div');
            Object.assign(buttonStackContainer.style, styles.buttonStackContainer.style);
            buttonStackContainer.id = 'button-stack';

            // Logout Button
            const logoutButton = document.createElement('button');
            Object.assign(logoutButton.style, styles.logoutButton.style);
            logoutButton.className = styles.logoutButton.className;
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', handleLogout); // Use callback handler
            buttonStackContainer.appendChild(logoutButton);

            // Chat Button
            const chatButton = document.createElement('button');
            Object.assign(chatButton.style, styles.chatButton.style);
            chatButton.className = styles.chatButton.className;
            chatButton.textContent = 'Live Chat';
            chatButton.addEventListener('click', handleChatClick); // Use callback handler
            buttonStackContainer.appendChild(chatButton);

            // Home Button
            const homeButton = document.createElement('button');
            Object.assign(homeButton.style, styles.homeButton.style);
            homeButton.className = styles.homeButton.className;
            homeButton.textContent = 'Back to Home';
            homeButton.addEventListener('click', handleHomeClick); // Use callback handler
            buttonStackContainer.appendChild(homeButton);

            panel.appendChild(buttonStackContainer); // Add button stack to panel

            // Profile Container
            const profileContainer = document.createElement('div');
            Object.assign(profileContainer.style, styles.profileContainer.style);
            profileContainer.id = 'profile-container';

            // Profile Photo/Placeholder
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

            // User Info (Name, Email) - Applies mobile offsets via styles
            const userInfo = document.createElement('div');
            Object.assign(userInfo.style, styles.userInfo.style); // Includes mobile offsets if applicable

            const userNameEl = document.createElement('h3');
            Object.assign(userNameEl.style, styles.userName.style);
            userNameEl.textContent = `${userData.name || 'User'}`; // Use placeholder if name missing
            userInfo.appendChild(userNameEl);

            const userEmailEl = document.createElement('p');
            Object.assign(userEmailEl.style, styles.userEmail.style);
            userEmailEl.textContent = `${userData.email || 'No email provided'}`; // Use placeholder if email missing
            userInfo.appendChild(userEmailEl);

            profileContainer.appendChild(userInfo);
            panel.appendChild(profileContainer); // Add profile container to panel

            // --- Main Content Area ---
            const contentContainer = document.createElement('div');
            contentContainer.id = 'content-container';
            contentContainer.className = styles.contentContainer.className;
            Object.assign(contentContainer.style, styles.contentContainer.style);

            // Main Heading - Applies mobile offsets via styles
            const contentHeading = document.createElement('h2');
            Object.assign(contentHeading.style, styles.contentHeading.style); // Includes mobile offsets if applicable
            contentHeading.textContent = "Analysis Dashboard";
            contentContainer.appendChild(contentHeading);

            // --- CREATE SUMMARY SECTION (Client & Job Selection) ---
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

            // --- ADD CLIENT DROPDOWN ---
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
                clientSelect.value = selectedClient; // Controlled component value
                clientSelect.addEventListener('change', handleClientSelect); // Attach handler

                // Default option
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "-- Select a client --";
                clientSelect.appendChild(defaultOption);

                // Populate options
                if (clientNames?.length > 0) {
                    clientNames.forEach((client) => {
                        const option = document.createElement('option');
                        const clientNameString = `${client.ClientFirstName} ${client.ClientLastName}`;
                        option.value = clientNameString; // Value is the combined name string
                        option.textContent = clientNameString;
                        clientSelect.appendChild(option);
                    });
                } else if (!error) {
                    // Indicate if list is empty but no error occurred
                    const noClientsOption = document.createElement('option');
                    noClientsOption.value = "";
                    noClientsOption.textContent = "No clients available";
                    noClientsOption.disabled = true;
                    clientSelect.appendChild(noClientsOption);
                }
                dropdownContainer.appendChild(clientSelect);

                // Display error if client loading failed
                if (error?.includes("load clients") && clientNames.length === 0) {
                    const errorText = document.createElement('p');
                    Object.assign(errorText.style, styles.errorText.style);
                    errorText.textContent = error;
                    dropdownContainer.appendChild(errorText);
                }
            }
            summarySection.appendChild(dropdownContainer); // Add client dropdown to summary section

            // --- ADD JOBS DROPDOWN (Conditionally) ---
            if (selectedClientData) { // Only show if a client is selected
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
                    jobsSelect.value = selectedJob; // Controlled value
                    jobsSelect.addEventListener('change', handleJobSelect); // Attach handler

                    // Default job option
                    const defaultJobOption = document.createElement('option');
                    defaultJobOption.value = "";
                    defaultJobOption.textContent = "-- Select a job --";
                    jobsSelect.appendChild(defaultJobOption);

                    // Populate job options
                    if (jobs?.length > 0) {
                        jobs.forEach((job) => {
                            const option = document.createElement('option');
                            const jobId = job.Id ? job.Id.toString() : ''; // Ensure value is string
                            if (!jobId) return; // Skip if job has no ID
                            option.value = jobId;
                            // Option text: JobName @ Company (Posted: Date)
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
                        // Indicate if no jobs found for the client
                        const noJobsOption = document.createElement('option');
                        noJobsOption.value = "";
                        noJobsOption.textContent = "No jobs found for this client";
                        noJobsOption.disabled = true;
                        jobsSelect.appendChild(noJobsOption);
                    }
                    jobsDropdownContainer.appendChild(jobsSelect);

                    // Display error if job loading failed
                    if (error?.includes("load jobs") && jobs.length === 0) {
                        const errorText = document.createElement('p');
                        Object.assign(errorText.style, styles.errorText.style);
                        errorText.textContent = error;
                        jobsDropdownContainer.appendChild(errorText);
                    }

                    // --- Display Webhook Status ---
                    if (selectedJob && webhookStatus) {
                        const statusContainer = document.createElement('div');
                        Object.assign(statusContainer.style, styles.webhookStatus.style);

                        // Status Icon
                        const statusIcon = document.createElement('div');
                        const iconBaseStyle = styles.webhookStatusIcon.style;
                        const iconStatusStyle = styles.webhookStatusIcon[webhookStatus] || {};
                        Object.assign(statusIcon.style, iconBaseStyle, iconStatusStyle);
                        statusContainer.appendChild(statusIcon);

                        // Status Text
                        const statusText = document.createElement('span');
                        let textContent = '';
                        let textColor = '#c0d0d3'; // Default text color

                        switch (webhookStatus) {
                            case 'sending':
                                textContent = 'Sending job data...';
                                textColor = '#FFD700'; // Gold
                                break;
                            case 'success':
                                textContent = 'Job data sent successfully.';
                                textColor = '#4CAF50'; // Green
                                break;
                            case 'error':
                                textContent = 'Error sending job data.';
                                textColor = '#ff6347'; // Red
                                // Optionally display more error info from webhookResponse
                                if (webhookResponse?.error) {
                                    textContent += ` (${webhookResponse.error})`;
                                }
                                break;
                            default: textContent = '';
                        }
                        statusText.textContent = textContent;
                        statusText.style.color = textColor;
                        statusContainer.appendChild(statusText);
                        jobsDropdownContainer.appendChild(statusContainer);
                    }

                    // --- Display Graph Data Info Box on Success ---
                    if (selectedJob && webhookStatus === 'success' && webhookResponse) {
                        // Check specifically if nodes/links data exists in the response
                        const hasGraphData = Array.isArray(webhookResponse.nodes) && Array.isArray(webhookResponse.links);
                        if (hasGraphData) {
                            const graphDataInfo = document.createElement('div');
                            Object.assign(graphDataInfo.style, styles.graphDataInfo.style);
                            const nodeCount = webhookResponse.nodes?.length ?? 0;
                            const linkCount = webhookResponse.links?.length ?? 0;
                            graphDataInfo.innerHTML = `<strong>Relational Graph Data Received:</strong><br><span style="color: ${GRAPH_COLORS.DEFAULT}"> • ${nodeCount} entities</span> | <span style="color: ${GRAPH_COLORS.DEFAULT_LINK}"> • ${linkCount} relationships</span>`;
                            jobsDropdownContainer.appendChild(graphDataInfo);
                        } else {
                            // Optionally show a message if success but no graph data
                            const noGraphDataInfo = document.createElement('div');
                            Object.assign(noGraphDataInfo.style, styles.loadingText.style); // Reuse loading style?
                            noGraphDataInfo.style.color = '#a7d3d8';
                            noGraphDataInfo.textContent = "Analysis complete, but no graph data found for visualization.";
                            jobsDropdownContainer.appendChild(noGraphDataInfo);
                        }
                    }
                }
                summarySection.appendChild(jobsDropdownContainer); // Add jobs dropdown section to summary
            }
            contentContainer.appendChild(summarySection); // Add summary section to content

            // --- CREATE METRICS / VISUALIZATION SECTION ---
            const metricsSection = document.createElement('div');
            metricsSection.id = METRICS_SECTION_ID;
            metricsRef.current = metricsSection; // Store ref
            Object.assign(metricsSection.style, styles.contentSection.style); // Use the generic section style

            const metricsHeading = document.createElement('h3');
            Object.assign(metricsHeading.style, styles.contentSectionHeading.style);
            metricsHeading.textContent = "Analysis & Visualization";
            metricsSection.appendChild(metricsHeading);

            const metricsText = document.createElement('p');
            Object.assign(metricsText.style, styles.contentText.style);

            // Dynamic status text based on selection & webhook status
            if (selectedJob) {
                const selectedJobObj = jobs.find(job => job.Id?.toString() === selectedJob);
                const clientNameString = selectedClientData ? `${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName}` : 'Selected Client';
                let jobDesc = `Job ID: ${selectedJob}`; // Default description

                if (selectedJobObj) {
                    jobDesc = selectedJobObj.JobName || jobDesc; // Use JobName if available
                    // Add Company if configured and available
                    if (INCLUDE_COMPANY_IN_METRICS && selectedJobObj.Company) {
                        jobDesc += ` @ ${selectedJobObj.Company}`;
                    }
                    // Add formatted Posted Date if configured and available
                    const formattedDate = INCLUDE_POSTED_DATE_IN_METRICS ? formatJobDate(selectedJobObj.PostedDate) : null;
                    if (formattedDate) {
                        jobDesc += ` (Posted: ${formattedDate})`;
                    }
                }

                // Determine status text based on webhook state
                let statusPrefix = "";
                if (webhookStatus === 'sending') {
                    statusPrefix = `Fetching analysis for: ${clientNameString} - ${jobDesc}...`;
                } else if (webhookStatus === 'error') {
                    statusPrefix = `Error fetching analysis for: ${clientNameString} - ${jobDesc}.`;
                } else if (webhookStatus === 'success') {
                    // Check if the successful response actually contained graph data
                    if (webhookResponse?.nodes?.length > 0) {
                        statusPrefix = `Analysis loaded for: ${clientNameString} - ${jobDesc}. Visualization below.`;
                    } else {
                        statusPrefix = `Analysis data received for: ${clientNameString} - ${jobDesc}, but no graph entities were found for visualization.`;
                    }
                } else {
                    // Default state after job selection but before sending/receiving
                    statusPrefix = `Ready to analyze: ${clientNameString} - ${jobDesc}.`;
                }
                metricsText.textContent = statusPrefix;

            } else if (selectedClientData) {
                metricsText.textContent = `Please select a job for ${selectedClientData.ClientFirstName} ${selectedClientData.ClientLastName} to visualize relationships.`;
            } else {
                metricsText.textContent = "Please select a client and then a job to begin analysis and visualization.";
            }
            metricsSection.appendChild(metricsText);

            // --- ADD GRAPH CONTAINER PLACEHOLDER (Conditionally) ---
            // Only add the graph container if a job is selected and webhook succeeded (even if data is empty)
            // This ensures the space is allocated and the placeholder text updates correctly.
            if (selectedJob && webhookStatus === 'success') {
                const graphContainerPlaceholder = document.createElement('div');
                graphContainerPlaceholder.id = GRAPH_CONTAINER_ID; // Use the constant ID
                Object.assign(graphContainerPlaceholder.style, styles.graphContainer.style); // Apply styling

                // Add placeholder text inside the container (will be replaced/hidden by React graph)
                const graphPlaceholderText = document.createElement('div');
                Object.assign(graphPlaceholderText.style, styles.graphPlaceholderText.style);
                // Text depends on whether the successful response had nodes
                graphPlaceholderText.textContent = (webhookResponse?.nodes?.length > 0)
                    ? 'Loading 3D Graph Visualization...' // Indicate loading if nodes exist
                    : 'No visualization data available for this job.'; // Indicate no data if nodes are empty/missing
                graphContainerPlaceholder.appendChild(graphPlaceholderText);

                metricsSection.appendChild(graphContainerPlaceholder); // Add graph container to metrics section
            } else if (selectedJob && webhookStatus === 'sending') {
                // Optionally add a smaller placeholder or message while sending
                const graphSendingText = document.createElement('p');
                Object.assign(graphSendingText.style, styles.loadingText.style);
                graphSendingText.textContent = "Fetching visualization data...";
                metricsSection.appendChild(graphSendingText);
            } else if (selectedJob && webhookStatus === 'error') {
                // Optionally add an error message specifically for the graph area
                const graphErrorText = document.createElement('p');
                Object.assign(graphErrorText.style, styles.errorText.style);
                graphErrorText.textContent = "Could not load visualization due to an error.";
                metricsSection.appendChild(graphErrorText);
            }


            contentContainer.appendChild(metricsSection); // Add metrics section to content

            // --- APPEND CONTENT CONTAINER to PANEL ---
            if (panelRef.current) {
                panelRef.current.appendChild(contentContainer);
            } else {
                throw new Error("Panel ref became null before content could be appended.");
            }

            // --- Append Panel & Overlay to Body ---
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden'; // Lock body scroll

            // --- Apply entry animations ---
            setTimeout(() => {
                // Check if the overlay is still in the DOM before animating
                if (overlayRef.current?.parentNode === document.body) {
                    // Animate panel fade-in/scale-up (optional)
                    animateElement(panelRef.current, { opacity: '1', transform: 'none' }, 0); // Simple fade-in

                    // Animate profile info slide-in
                    const profileEl = panelRef.current?.querySelector('#profile-container');
                    if (profileEl) animateElement(profileEl, { opacity: '1', transform: 'translateX(0)' }, 100);

                    // Animate button stack slide-in
                    const buttonsEl = panelRef.current?.querySelector('#button-stack');
                    if (buttonsEl) animateElement(buttonsEl, { opacity: '1', transform: 'translateX(0)' }, 100);

                    // Animate content container slide-up/fade-in
                    const contentEl = panelRef.current?.querySelector('#content-container');
                    if (contentEl) animateElement(contentEl, { opacity: '1', transform: 'translateY(0)' }, 250);
                }
            }, 50); // Short delay before starting animations

            // Add resize listener
            window.addEventListener('resize', handleResize);
            console.log("Analysis_Home: MAIN PANEL UI structure complete and animations triggered.");

        } catch (uiError) {
            console.error("Analysis_Home: CRITICAL ERROR during UI Effect!", uiError);
            // Attempt cleanup if elements were partially added
            if (overlayRef.current?.parentNode) overlayRef.current.remove();
            else if (overlay?.parentNode) overlay.remove(); // Fallback if ref failed
            else { // Final attempt to find and remove
                const existing = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
                if (existing) existing.remove();
            }
            // Reset refs and state
            overlayRef.current = null;
            panelRef.current = null;
            metricsRef.current = null; // Reset ref
            document.body.style.overflow = ''; // Ensure scroll is restored
            window.removeEventListener('resize', handleResize); // Clean up listener
            clearTimeout(resizeTimeout);
            setError("Failed to render the dashboard UI. Please try again."); // Set error state
            return; // Exit effect
        }

        // --- Cleanup function for the MAIN PANEL UI Effect ---
        return () => {
            console.log("Analysis_Home: MAIN PANEL UI Effect CLEANUP running.");
            window.removeEventListener('resize', handleResize); // Remove resize listener
            clearTimeout(resizeTimeout); // Clear any pending resize timeout

            const mainOverlayToRemove = overlayRef.current; // Use the ref for removal
            if (mainOverlayToRemove?.parentNode) {
                console.log("   - Removing main panel overlay via ref.");
                mainOverlayToRemove.remove();
            } else {
                // Fallback check if ref got detached or effect ran partially
                const existingFromQuery = document.querySelector(`.${MAIN_PANEL_OVERLAY_CLASS}`);
                if (existingFromQuery) {
                    console.log("   - Removing main panel overlay via querySelector fallback.");
                    existingFromQuery.remove();
                } else {
                    console.log("   - No main panel overlay found to remove.");
                }
            }

            // Clear refs
            overlayRef.current = null;
            panelRef.current = null;
            metricsRef.current = null; // Clear ref

            // Always restore body scroll on cleanup
            if (typeof document !== 'undefined') {
                document.body.style.overflow = '';
                console.log("   - Restored body scroll.");
            }

            console.log("   - Main panel cleanup finished.");
        };
    }, [
        // === Dependencies ===
        // Core state
        isLoggedIn, userData, loading, error,
        // Client/Job data and selection
        clientsLoading, clientNames, selectedClient, selectedClientData,
        jobsLoading, jobs, selectedJob,
        // Webhook/Graph data state
        webhookStatus, webhookResponse, // Note: graphData itself doesn't trigger UI rebuild, only graph renderer
        // Callbacks used in UI elements
        handleLogout, handleChatClick, handleHomeClick, handleClientSelect, handleJobSelect,
        // Style generation depends on these
        getStyles, isMobile, // isMobile state now correctly included
        // Note: showTouchInstructions only affects styles/graph, not main UI structure directly here
    ]); // Added isMobile dependency


    // ====================================
    // GRAPH3D COMPONENT RENDERER EFFECT
    // ====================================
    useEffect(() => {
        console.log("Analysis_Home: Graph3D rendering effect START");

        // Check for browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.log("   - Skipping graph render: Not in browser environment.");
            return;
        }

        const graphPlaceholder = document.getElementById(GRAPH_CONTAINER_ID);

        // Conditions to *skip* rendering the graph:
        // 1. No job selected
        // 2. Webhook hasn't succeeded
        // 3. Graph data (nodes) is explicitly empty or null/undefined
        // 4. The placeholder element doesn't exist in the DOM yet
        if (!selectedJob || webhookStatus !== 'success' || !graphData?.nodes || graphData.nodes.length === 0) {
            console.log("   - Skipping graph render: Conditions not met (No job/success, empty data, or missing placeholder).");
            if (graphPlaceholder) {
                // Ensure placeholder shows appropriate message if graph isn't rendered
                const existingReactContainer = document.getElementById(`${GRAPH_CONTAINER_ID}-react`);
                if (existingReactContainer) {
                    // Unmount React component if it exists before removing container
                    if (existingReactContainer._reactRootContainer) {
                        try {
                            existingReactContainer._reactRootContainer.unmount();
                            delete existingReactContainer._reactRootContainer;
                        } catch (e) { console.error("Error unmounting previous graph:", e); }
                    }
                    existingReactContainer.remove(); // Clean up previous graph container
                }
                const placeholderText = graphPlaceholder.querySelector('div:not([id])'); // Find the inner text div
                if (placeholderText) {
                    // Update text based on why it's skipped
                    if (!selectedJob) {
                        placeholderText.textContent = 'Select a job to view visualization.';
                    } else if (webhookStatus !== 'success') {
                        placeholderText.textContent = 'Waiting for analysis data...';
                        // Could be more specific based on webhookStatus if needed
                    } else { // Success but no nodes
                        placeholderText.textContent = 'No visualization data available for this job.';
                    }
                    placeholderText.style.display = ''; // Make sure text is visible
                }
            }
            // Cleanup touch instructions if graph isn't showing
            const touchInstructionsElement = document.getElementById(TOUCH_INSTRUCTIONS_ID);
            if (touchInstructionsElement) touchInstructionsElement.remove();
            return; // Exit if conditions aren't met
        }

        if (!graphPlaceholder) {
            console.warn(`   - Skipping graph render: Cannot find graph placeholder element with ID ${GRAPH_CONTAINER_ID}. UI might not be ready.`);
            return; // Can't render if the target element isn't in the DOM yet
        }

        // --- Proceed with rendering/updating the graph ---
        console.log(`   - Rendering/updating graph in container #${GRAPH_CONTAINER_ID} with ${graphData.nodes.length} nodes.`);
        const styles = getStyles(); // Get current styles including graph container height

        // --- Prepare Graph Rendering Environment ---
        try {
            // Find or create the container div where React will mount the graph
            let graphReactContainer = document.getElementById(`${GRAPH_CONTAINER_ID}-react`);
            if (!graphReactContainer) {
                console.log("   - Creating React container for ForceGraph3D");
                graphReactContainer = document.createElement('div');
                graphReactContainer.id = `${GRAPH_CONTAINER_ID}-react`;
                Object.assign(graphReactContainer.style, styles.graphReactContainer.style);
                graphPlaceholder.appendChild(graphReactContainer); // Append to the placeholder div
            } else {
                console.log("   - Found existing React container for ForceGraph3D, will update.");
                // Ensure styles (like dimensions) are up-to-date
                Object.assign(graphReactContainer.style, styles.graphReactContainer.style);
            }

            // Hide or remove the initial placeholder text now that we are rendering the graph
            const placeholderText = graphPlaceholder.querySelector('div:not([id])'); // Find the inner text div
            if (placeholderText) placeholderText.style.display = 'none'; // Hide it

            // Add/Update graph controls (Expand/Reset View) dynamically
            let controlsContainer = graphReactContainer.querySelector('#graph-controls');
            if (!controlsContainer) {
                controlsContainer = document.createElement('div');
                controlsContainer.id = 'graph-controls';
                Object.assign(controlsContainer.style, styles.graphControls.style);
                // Prepend controls so they appear visually above the graph canvas
                graphReactContainer.insertBefore(controlsContainer, graphReactContainer.firstChild);
            } else {
                controlsContainer.innerHTML = ''; // Clear previous buttons to rebuild/reorder
            }

            // Expand/Collapse button
            const expandButton = document.createElement('button');
            expandButton.textContent = isGraphExpanded ? 'Collapse' : 'Expand';
            Object.assign(expandButton.style, styles.graphControlButton.style);
            // Use direct onclick for simplicity here, or manage listeners carefully in cleanup
            expandButton.onclick = () => setIsGraphExpanded(prev => !prev);
            controlsContainer.appendChild(expandButton);

            // Reset camera button
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset View';
            Object.assign(resetButton.style, styles.graphControlButton.style);
            resetButton.onclick = () => {
                if (graphRef.current?.cameraPosition) { // Check if graphRef and method exist
                    console.log("Resetting camera view...");
                    graphRef.current.cameraPosition(
                        { z: GRAPH_INITIAL_CAMERA_DISTANCE }, // Reset to initial configured zoom
                        //{ x: 0, y: 0, z: 0 }, // Look at center (optional, might be default)
                        undefined, // Let it look at default target (usually center of mass)
                        1000 // Transition duration in ms
                    );
                } else {
                    console.warn("Cannot reset camera: graphRef.current or cameraPosition method is not available.");
                }
            };
            controlsContainer.appendChild(resetButton);

            // Update the placeholder's height based on expansion state (this affects layout)
            graphPlaceholder.style.height = styles.graphContainer.style.height;

            // Add or update touch instructions for mobile
            if (isMobile) {
                let touchInstructionsElement = document.getElementById(TOUCH_INSTRUCTIONS_ID);
                if (!touchInstructionsElement) {
                    touchInstructionsElement = document.createElement('div');
                    touchInstructionsElement.id = TOUCH_INSTRUCTIONS_ID;
                    touchInstructionsElement.textContent = 'Drag to Rotate • Pinch to Zoom • Tap Node to Focus';
                    // Append inside the React container, so it's positioned relative to the graph
                    graphReactContainer.appendChild(touchInstructionsElement);
                }
                // Always apply/update styles in case they changed (e.g., visibility)
                Object.assign(touchInstructionsElement.style, styles.touchInstructions.style);
            } else {
                // Remove touch instructions if not on mobile
                const touchInstructionsElement = document.getElementById(TOUCH_INSTRUCTIONS_ID);
                if (touchInstructionsElement) touchInstructionsElement.remove();
            }

            // --- Render the ForceGraph3D Component ---
            // Use dynamic import for ReactDOM.createRoot to avoid issues if it's not always needed
            // or if running in environments where ReactDOM is conditionally loaded.
            import('react-dom/client').then(ReactDOM => {
                if (!graphReactContainer) {
                    console.warn("Graph React container disappeared before ReactDOM could render.");
                    return;
                }
                console.log("   - Creating/updating React root for ForceGraph3D");

                // Manage React Root instance associated with the container
                let root = graphReactContainer._reactRootContainer;
                if (!root) {
                    root = ReactDOM.createRoot(graphReactContainer);
                    graphReactContainer._reactRootContainer = root; // Store the root instance
                }

                // --- Configure Graph Callbacks and Properties ---

                // Node label function (for tooltips/hover info) based on configuration
                const nodeLabelFunction = ENABLE_GRAPH_NODE_LABELS
                    ? node => `${node.name || node.id}${node.type ? ` (${node.type})` : ''}${node.description ? `\n${node.description}` : ''}`
                    : null;

                // Link label function (for tooltips/hover info) based on configuration
                const linkLabelFunction = ENABLE_GRAPH_LINK_LABELS
                    ? link => link.label || link.type || 'connects to'
                    : null;

                // Custom node rendering using three-spritetext for persistent labels
                const nodeThreeObjectFunction = node => {
                    const sprite = new SpriteText(node.name || node.id); // Use node's name or ID
                    sprite.color = NODE_LABEL_TEXT_COLOR;
                    sprite.textHeight = isMobile ? NODE_LABEL_TEXT_HEIGHT_MOBILE : NODE_LABEL_TEXT_HEIGHT;
                    sprite.backgroundColor = NODE_LABEL_BACKGROUND;
                    sprite.padding = NODE_LABEL_PADDING;
                    sprite.borderRadius = NODE_LABEL_BORDER_RADIUS;
                    sprite.position.y = NODE_LABEL_Y_POSITION; // Position label above the node center
                    return sprite;
                };

                // Get current dimensions, ensuring they are valid numbers
                const containerWidth = graphPlaceholder.clientWidth > 0 ? graphPlaceholder.clientWidth : (isMobile ? 300 : 500);
                const containerHeight = graphPlaceholder.clientHeight > 0 ? graphPlaceholder.clientHeight : (isMobile ? 300 : 400);

                // --- Render the component ---
                root.render(
                    <React.StrictMode> {/* Optional: Enable StrictMode for checks */}
                        <ForceGraph3D
                            ref={graphRef} // Assign ref for imperative control (like camera reset)
                            graphData={graphData} // Pass the processed data
                            // --- Node Configuration ---
                            nodeThreeObject={nodeThreeObjectFunction} // Use sprite text for persistent labels
                            nodeLabel={nodeLabelFunction} // Standard hover labels (optional)
                            nodeColor={node => node.color || GRAPH_COLORS.DEFAULT} // Color from processed data
                            nodeVal={node => node.val ?? 1.0} // Size from processed data (ensure it's a number)
                            nodeRelSize={isMobile ? GRAPH_NODE_RELATIVE_SIZE_MOBILE : GRAPH_NODE_RELATIVE_SIZE} // Base size multiplier
                            nodeOpacity={0.9}
                            nodeResolution={isMobile ? GRAPH_NODE_RESOLUTION_MOBILE : GRAPH_NODE_RESOLUTION} // Geometry detail
                            enableNodeDrag={true} // Allow dragging nodes
                            // --- Link Configuration ---
                            linkLabel={linkLabelFunction} // Standard hover labels (optional)
                            linkColor={link => link.color || GRAPH_COLORS.DEFAULT_LINK} // Color from processed data
                            linkWidth={link => (isMobile ? GRAPH_LINK_WIDTH_MOBILE : GRAPH_LINK_WIDTH_DESKTOP) * (link.value > 1 ? 1.2 : 1)} // Base width, slightly thicker for higher value links
                            linkOpacity={0.6}
                            linkCurvature={GRAPH_LINK_CURVATURE}
                            // --- Canvas & Interaction ---
                            backgroundColor="rgba(0, 0, 0, 0.0)" // Transparent background to see panel behind
                            width={containerWidth}
                            height={containerHeight}
                            showNavInfo={false} // Hide default navigation info text
                            enableNavigationControls={true} // Enable zoom/pan/rotate controls
                            controlType={isMobile ? "orbit" : "trackball"} // Orbit for mobile touch, trackball for desktop mouse
                            // --- Physics & Performance ---
                            warmupTicks={isMobile ? 50 : 100} // Fewer ticks for faster initial layout on mobile
                            cooldownTime={isMobile ? GRAPH_COOLDOWN_TIME_MOBILE : GRAPH_COOLDOWN_TIME_DESKTOP} // Simulation duration
                            d3AlphaDecay={isMobile ? 0.04 : 0.0228} // Faster cooling on mobile
                            d3VelocityDecay={isMobile ? 0.5 : 0.4} // Higher friction on mobile
                            // --- Event Handlers ---
                            onNodeClick={node => {
                                console.log('Clicked node:', node);
                                // Zoom into node on click
                                if (graphRef.current?.cameraPosition && node.x != null && node.y != null && node.z != null) {
                                    // Calculate a reasonable target distance based on current zoom or default
                                    const currentDist = graphRef.current.cameraPosition().z || GRAPH_INITIAL_CAMERA_DISTANCE;
                                    const targetDist = Math.max(currentDist * 0.4, 30); // Zoom in significantly, but not too close

                                    graphRef.current.cameraPosition(
                                        { x: node.x, y: node.y, z: node.z + targetDist }, // Position camera relative to node
                                        { x: node.x, y: node.y, z: node.z }, // Look directly at the node
                                        1000 // Transition duration
                                    );
                                } else {
                                    console.warn("Node click zoom failed: Ref, camera method, or node position missing.");
                                }
                            }}
                            // --- Initial Camera ---
                            // Initial position set here, can be overridden by reset button
                            cameraPosition={{ z: GRAPH_INITIAL_CAMERA_DISTANCE }}
                        />
                    </React.StrictMode>
                );

                console.log("   - ForceGraph3D component rendered/updated successfully");

                // Optional: Set initial camera position via ref after a short delay if needed
                // setTimeout(() => {
                //     if (graphRef.current && /* condition to check if camera needs setting */) {
                //         graphRef.current.cameraPosition({ z: GRAPH_INITIAL_CAMERA_DISTANCE });
                //         console.log("   - Applied initial camera distance post-render.");
                //     }
                // }, 100);

            }).catch(error => {
                console.error("   - Error importing or rendering ForceGraph3D component:", error);
                if (graphPlaceholder) {
                    // Clear any existing content and show error
                    graphPlaceholder.innerHTML = `<div style="${Object.entries(styles.errorText.style).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}">Error rendering graph visualization.</div>`;
                }
            });

        } catch (error) {
            console.error("Error setting up 3D graph environment:", error);
            if (graphPlaceholder) {
                graphPlaceholder.innerHTML = `<div style="${Object.entries(styles.errorText.style).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')}">Critical error during graph setup.</div>`;
            }
        }

        // --- Cleanup function for the GRAPH RENDERER Effect ---
        return () => {
            console.log("Analysis_Home: Graph3D render effect CLEANUP running.");
            const reactContainer = document.getElementById(`${GRAPH_CONTAINER_ID}-react`);
            if (reactContainer && reactContainer._reactRootContainer) {
                console.log("   - Unmounting React graph component.");
                try {
                    reactContainer._reactRootContainer.unmount();
                    delete reactContainer._reactRootContainer; // Clean up stored root reference
                    // Optionally clear innerHTML as a fallback
                    // reactContainer.innerHTML = '';
                } catch (e) {
                    console.error("   - Error during React graph unmount:", e);
                    // Force clear HTML as fallback
                    reactContainer.innerHTML = '';
                }
            } else {
                console.log("   - No React graph component found to unmount or container missing.");
            }

            // Remove touch instructions on cleanup
            const touchInstructionsElement = document.getElementById(TOUCH_INSTRUCTIONS_ID);
            if (touchInstructionsElement) touchInstructionsElement.remove();


            // Restore placeholder text visibility if the placeholder still exists
            // and the graph wasn't supposed to be there in the next render cycle (e.g., data cleared)
            // Note: This might be handled by the *next* run of the effect anyway.
            // if (graphPlaceholder) {
            //     const placeholderText = graphPlaceholder.querySelector('div:not([id])');
            //     if (placeholderText) {
            //         placeholderText.style.display = ''; // Make visible again
            //     }
            // }

            console.log("   - Graph cleanup finished.");
        };
    }, [
        // === Dependencies ===
        graphData, // Main trigger: redraw if data changes
        selectedJob, // Required condition
        webhookStatus, // Required condition ('success')
        isGraphExpanded, // Trigger resize/redraw
        // windowDimensions, // Window dimensions affect width/height props - already handled by isMobile and getStyles
        getStyles, // Styles depend on expansion and window size (via isMobile)
        isMobile, // Affects node size, resolution, controls, etc.
        showTouchInstructions // Affects visibility of touch instructions element
    ]);


    // --- Component Return ---
    // This component uses useEffect hooks to imperatively manipulate the DOM (specifically adding/removing
    // the main panel overlay and rendering the graph into a specific container).
    // Therefore, it doesn't need to return any JSX elements itself.
    return null;
}