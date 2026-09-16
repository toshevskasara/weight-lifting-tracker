import {  Link, Outlet } from 'react-router-dom'
import Homepage from '../pages/Homepage'
import { supabase } from '../supabaseClient.js'
import { useState, useEffect, useRef } from 'react'
import '../components/Dashboard.css'

function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const usernameTextRef = useRef(null);
  const usernameWrapRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fitUsername = () => {
      const text = usernameTextRef.current;
      const wrap = usernameWrapRef.current;
      if(!text || !wrap) return;

      let fontSize = 16;
      text.style.fontSize = `${fontSize}px`;

      while(text.scrollWidth > wrap.clientWidth &&
        fontSize > 10){
          fontSize -= 1;
          text.style.fontSize = `${fontSize}px`;
        }
    };

    fitUsername();
    window.addEventListener('resize', fitUsername);
    return() => window.removeEventListener('resize', fitUsername);

  }, [userEmail]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="dashboard-shell">
      {/*Mobile versoin hambuerger*/}
      <div className="mobile-topbar d-md-none">
        <button className="hamburger-btn"
                aria-label="Toggle menu"
                onClick={() => setMenuOpen(prev => !prev)}>
                  <span></span>
                  <span></span>
                  <span></span>
        </button>
      </div>

      {menuOpen && (
        <div className="sidebar-backdrop d-md-none" onClick={closeMenu}></div>
      )}

      <div className="row g-0">
        {/* Sidebar */}
        <nav className="col-md-2 d-none d-md-block sidebar border-end">          <div className="pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className="nav-link" href="/#/">Homepage</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/exercises">Your Exercises</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#/best">Personal Best</a>
              </li>

              <li className="nav-item username-item">
                <div className="username-wrap" ref={usernameWrapRef}>
                  <span className="username-text" ref={usernameTextRef}>
                    {userEmail.split('@')[0]}
                  </span>
                </div>
              </li>
              <li className="nav-item">
                <a className="btn btn-logout" href="/#/signup" role="button">Log Out</a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-md-10 ms-sm-auto main-content px-4 pt-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Dashboard