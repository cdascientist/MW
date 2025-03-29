import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";

export function Home() {
    const navigate = useNavigate();

    const handleNavigateToAbout = () => {
        navigate('/about');
    };

    return (
        <>
            <Header />
            <h2>Home Page</h2>
            <button onClick={handleNavigateToAbout}>Go to About Page</button>
        </>
    );
}

export default Home;