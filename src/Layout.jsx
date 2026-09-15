import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './components/Dashboard.jsx';

function Layout() {
    return (
        <>
            <Header />
            <Dashboard />
            <Footer />
        </>
    );
}

export default Layout;