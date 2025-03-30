import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import "../style/AboutStyle.css";
import Header from '../components/Header';
import { createRoot } from 'react-dom/client';

export default function About() {
    const navigate = useNavigate();

    useEffect(() => {
        // Create the overlay container
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';

        // Create the flat panel
        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        // Create the panel header
        const panelHeader = document.createElement('div');
        panelHeader.className = 'panel-header';
        panelHeader.innerHTML = '<h2 class="panel-title"></h2>';
        panel.appendChild(panelHeader);

        // Create a container for the Header component
        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-in-panel';
        headerContainer.id = 'header-mount-point';
        panel.appendChild(headerContainer);

        // Create the content section
        const contentSection = document.createElement('div');
        contentSection.className = 'panel-content';
        contentSection.innerHTML = `
            <!-- Section title -->
            <h3 class="panel-section-title">Home Page</h3>
            
            <!-- Panel content -->
            <p class="panel-text">
                Welcome to the Mountain West application! This panel is 
                positioned in the upper left corner with 80% transparency 
                and rounded corners, taking up 75% of the screen.
            </p>
            
            <p class="panel-text">
                The interface features advanced visualization capabilities
                designed to maximize your productivity and workflow efficiency.
            </p>
            
            <!-- Navigation button -->
            <div class="button-container">
                <button class="nav-button" id="home-button">
                    Back to Home
                </button>
            </div>
        `;

        // Append content section to panel
        panel.appendChild(contentSection);

        // Append panel to overlay
        overlay.appendChild(panel);

        // Append overlay to body
        document.body.appendChild(overlay);

        // Render Header into the container
        const headerRoot = createRoot(headerContainer);
        headerRoot.render(<Header />);

        // Add event listener to the button
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                navigate('/');
            });
        }

        // Cleanup on unmount
        return () => {
            headerRoot.unmount();
            document.body.removeChild(overlay);
        };
    }, [navigate]);

    // Return null because the UI is created outside React's control
    return null;
}