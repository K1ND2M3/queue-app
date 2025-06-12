import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div className='footer'>
        <div className='footer-content container'>
            <div className='footer-box'>
                <Link to='/' className='logo'>Zent Studio<span>.</span></Link>
            </div>
        </div>
        <div className='social'>
            <a href='https://discord.gg/AB3cPWvT7C'><i class='bx bxl-discord'></i></a>
        </div>
        <p className='copyright'>&#169; 2025 Zent Studio</p>
    </div>
  )
}

export default Footer
