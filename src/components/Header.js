import React from 'react';
import { Link } from 'react-router-dom';


function Header({ darkMode, setDarkMode, onLoginClick, isLoggedIn, onLogoutClick }) {

  console.log('[Header.js] Received isLoggedIn prop:', isLoggedIn);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <header>
      {/* Nav */}
      <div className='nav container'>
        {/* Logo */}
        <Link to='/' className='logo'>Zent Studio<span>.</span></Link>
        
        {/* Login + Dark Toggle */}
        <div className='login'>
          {/* Toggle Icon */}
          <button
            onClick={toggleDarkMode}
            className="dark-toggle"
            aria-label={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
            title='สลับโหมดมืด/สว่าง'
          >
          <i className={`bx ${darkMode ? 'bxs-sun' : 'bxs-moon'}`}></i>
          </button>

          {isLoggedIn ? (
            <>
              <Link to='/admin' className='login-btn dashboard-btn'>
                Dashboard
              </Link>
              <button className="login-btn logout-btn" onClick={onLogoutClick}>
                Logout
              </button>
            </>
          ) : (
            <button className='login-btn' onClick={onLoginClick}>
              Login
            </button>
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;