import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";

export function About() {
    const navigate = useNavigate();

    const handleNavigateToHome = () => {
        navigate('/');
    };

    return (
        <>
            <Header />
            <h2>About Page</h2>
            <button onClick={handleNavigateToHome}>Back to Home</button>
        </>
    );
}

export default About;