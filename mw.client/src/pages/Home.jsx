import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function Home() {
    const navigate = useNavigate();

    const handleNavigateToAbout = () => {
        navigate('/about');
    };

    // Apply inline styles that will override any conflicting styles
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            <button
                onClick={handleNavigateToAbout}
                style={{
                    padding: '15px 30px',
                    fontSize: '20px',
                    backgroundColor: '#57b3c0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto'
                }}
            >
                Start
            </button>
        </div>
    );
}