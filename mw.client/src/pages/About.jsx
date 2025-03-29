import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import "../style/AboutStyle.css";

export default function About() {
    const navigate = useNavigate();

    const handleNavigateToHome = () => {
        navigate('/');
    };

    useEffect(() => {
        // Create the overlay container
        const overlay = document.createElement('div');
        overlay.className = 'ui-overlay';

        // Create the flat panel
        const panel = document.createElement('div');
        panel.className = 'flat-panel';

        // Add panel content
        panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title"></h2>
      </div>
      
      <div class="panel-content">
        <h3 class="panel-section-title">Home Page</h3>
        
        <p class="panel-text">
          Welcome to the Mountain West application! This panel is 
          positioned in the upper left corner with 80% transparency 
          and rounded corners, taking up 75% of the screen.
        </p>
        
        <p class="panel-text">
          The interface features advanced visualization capabilities
          designed to maximize your productivity and workflow efficiency.
        </p>
        
        <button class="nav-button" id="home-button">
          Back to Home
        </button>
      </div>
    `;

        // Append panel to overlay
        overlay.appendChild(panel);

        // Append overlay to body (not to root)
        document.body.appendChild(overlay);

        // Add event listener to the button
        document.getElementById('home-button').addEventListener('click', () => {
            navigate('/');
        });

        // Cleanup on unmount
        return () => {
            document.body.removeChild(overlay);
        };
    }, [navigate]);

    // Return null because the UI is created outside React's control
    return null;
}