import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import { createRoot } from 'react-dom/client';

export default function LiveChat() {
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
        panelHeader.innerHTML = '<h2 class="panel-title">Live Support</h2>';
        panel.appendChild(panelHeader);

        // Create a container for the Header component
        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-in-panel';
        headerContainer.id = 'header-mount-point';
        panel.appendChild(headerContainer);

        // Create the content section
        const contentSection = document.createElement('div');
        contentSection.className = 'panel-content';
        contentSection.style.display = 'flex';
        contentSection.style.flexDirection = 'column';
        contentSection.style.height = 'calc(100% - 80px)';
        contentSection.style.position = 'relative';

        // Create chat container with fixed height for reliability
        const chatContainer = document.createElement('div');
        chatContainer.style.width = '100%';
        chatContainer.style.height = '500px';
        chatContainer.style.marginBottom = '20px';
        chatContainer.style.border = '1px solid rgba(87, 179, 192, 0.3)';
        chatContainer.style.borderRadius = '8px';
        chatContainer.style.overflow = 'hidden';
        chatContainer.style.position = 'relative'; // For absolute positioning of buttons

        // Create a direct DOM iframe element instead of using innerHTML
        const chatFrame = document.createElement('iframe');
        chatFrame.src = "https://app.vectorshift.ai/chatbots/embedded/67e9cb8a33ed5d01ceecbc29?openChatbot=true";
        chatFrame.style.width = '100%';
        chatFrame.style.height = '100%';
        chatFrame.style.border = 'none';
        chatFrame.allow = "clipboard-read; clipboard-write; microphone";
        chatFrame.id = 'chatFrame';

        // Add iframe to chat container
        chatContainer.appendChild(chatFrame);

        // Add chat container to content section
        contentSection.appendChild(chatContainer);

        // Create button container that overlays the chat
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '15px';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.left = '0';
        buttonContainer.style.right = '0';
        buttonContainer.style.zIndex = '100';
        buttonContainer.id = 'button-container';

        // Create Home button
        const homeButton = document.createElement('button');
        homeButton.className = 'nav-button';
        homeButton.id = 'home-button';
        homeButton.textContent = 'Back to Home';
        homeButton.style.backgroundColor = 'rgba(13, 20, 24, 0.8)'; // Semi-transparent background
        buttonContainer.appendChild(homeButton);

        // Create About button
        const aboutButton = document.createElement('button');
        aboutButton.className = 'nav-button';
        aboutButton.id = 'about-button';
        aboutButton.textContent = 'Back to About';
        aboutButton.style.backgroundColor = 'rgba(13, 20, 24, 0.8)'; // Semi-transparent background
        buttonContainer.appendChild(aboutButton);

        // Add button container to content section
        contentSection.appendChild(buttonContainer);

        // Add content section to panel
        panel.appendChild(contentSection);

        // Add panel to overlay
        overlay.appendChild(panel);

        // Add overlay to body
        document.body.appendChild(overlay);

        // Render Header into header container
        const headerRoot = createRoot(headerContainer);
        headerRoot.render(<Header />);

        // Add event listeners to buttons
        homeButton.addEventListener('click', () => {
            navigate('/');
        });

        aboutButton.addEventListener('click', () => {
            navigate('/about');
        });

        // Handle responsive design
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            const panelHeight = contentSection.clientHeight;

            // Position the buttons consistently based on panel height
            if (isMobile) {
                buttonContainer.style.flexDirection = 'column';
                buttonContainer.style.width = '80%';
                buttonContainer.style.left = '10%';
                buttonContainer.style.top = `${panelHeight * 1.}px`; // Push down by 90%
            } else {
                buttonContainer.style.flexDirection = 'row';
                buttonContainer.style.width = 'auto';
                buttonContainer.style.left = '0';
                buttonContainer.style.right = '0';
                buttonContainer.style.top = `${panelHeight * 0.9}px`; // Same positioning for desktop
            }
        };

        // Set initial responsive styles with a delay to ensure proper rendering
        setTimeout(handleResize, 100);

        // Add resize listener
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            headerRoot.unmount();
            document.body.removeChild(overlay);
        };
    }, [navigate]);

    return null;
}