import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

/**
 * Standard layout for all sections of LibraryHub.
 * Includes the Navbar, scrollable content area, and Footer.
 * Each piece is its own component for single responsibility.
 */
const MainLayout = () => {
    return (
        <div className="min-h-screen bg-theme-white dark:bg-slate-900 flex flex-col transition-colors duration-300">
            <Navbar />
            <main className="flex-1 container mx-auto px-6 py-8 animate-in fade-in duration-700">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
