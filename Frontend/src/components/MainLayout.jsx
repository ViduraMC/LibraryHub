import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/**
 * Standard layout for authenticated sections of LibraryHub.
 * Includes the persistent navigation bar and a content area.
 */
const MainLayout = () => {
    return (
        <div className="min-h-screen bg-theme-white flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-6 py-8 animate-in fade-in duration-700">
                <Outlet />
            </main>
            
            <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} LibraryHub Management System
            </footer>
        </div>
    );
};

export default MainLayout;
