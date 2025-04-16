import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

export default function Home() {
    const navigate = useNavigate();
    const buttonContainerId = 'home-start-button-container'; // Define ID constant

    const handleNavigateToAbout = () => {
        console.log("Start button clicked, navigating to /about");
        navigate('/about');
    };

    useEffect(() => {
        console.log("Home.jsx: useEffect Mount - Attempting to add Start button.");

        const rootElement = document.getElementById('root');
        if (!rootElement) {
            console.error("Home.jsx Error: #root element not found. Cannot add Start button.");
            return; // Exit if root doesn't exist
        }

        // Check if the button container already exists from a previous render/mount
        let buttonContainer = document.getElementById(buttonContainerId);
        if (buttonContainer) {
            console.log("Home.jsx: Found existing Start button container. Re-using.");
        } else {
            console.log("Home.jsx: Creating new Start button container.");
            // --- Create Button Container ---
            buttonContainer = document.createElement('div');
            buttonContainer.id = buttonContainerId; // Use the constant ID
            Object.assign(buttonContainer.style, {
                position: 'absolute', // Position within #root
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 5000, // High z-index relative to #root content
                pointerEvents: 'none'
            });

            // --- Create the Button ---
            const startButton = document.createElement('button');
            startButton.id = 'actual-home-start-button';
            Object.assign(startButton.style, {
                padding: '15px 30px',
                fontSize: '20px',
                backgroundColor: '#57b3c0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                pointerEvents: 'auto' // Button is clickable
            });
            startButton.textContent = 'Start';
            startButton.onclick = handleNavigateToAbout;

            // --- Append to container and then to #root ---
            buttonContainer.appendChild(startButton);
            rootElement.appendChild(buttonContainer);
            console.log("Home.jsx: New Start button appended to #root.");
        }


        // --- Cleanup Function ---
        return () => {
            console.log("Home.jsx: useEffect Cleanup - Attempting to remove Start button.");
            // Find the container specifically within #root for removal
            const container = rootElement.querySelector(`#${buttonContainerId}`); // Use ID selector
            if (container && container.parentNode === rootElement) {
                try {
                    rootElement.removeChild(container);
                    console.log("Home.jsx cleanup: Start button removed from #root.");
                } catch (e) {
                    console.error("Home.jsx cleanup error removing button:", e);
                }
            } else {
                console.log("Home.jsx cleanup: Start button container not found in #root for removal.");
            }
        };
    }, [navigate]); // Dependency: navigate

    // Component renders nothing itself
    return null;
}