import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

export default function Home() {
    const navigate = useNavigate();

    const handleNavigateToAbout = () => {
        navigate('/about');
    };

    useEffect(() => {
        // Make a global override to ensure our button is visible
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            #start-button-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                z-index: 99999 !important;
                pointer-events: none !important;
            }
            
            #start-button {
                pointer-events: auto !important;
                z-index: 100000 !important;
                position: relative !important;
                font-family: 'Open Sans', Arial, sans-serif !important;
                transform: none !important;
                animation: none !important;
            }
        `;
        document.head.appendChild(styleTag);

        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    return (
        <div id="start-button-overlay">
            <button
                id="start-button"
                onClick={handleNavigateToAbout}
                style={{
                    padding: '20px 40px',
                    fontSize: '24px',
                    backgroundColor: '#57b3c0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    transition: 'background-color 0.3s, transform 0.2s',
                    fontWeight: 'bold',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4a9aa6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#57b3c0';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                START
            </button>
        </div>
    );
}