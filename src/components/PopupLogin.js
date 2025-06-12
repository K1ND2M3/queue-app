import React, { useState, useEffect, useRef } from 'react'; // เพิ่ม useState, useEffect, useRef

function PopupLogin({ onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  // useEffect for focus and Esc btn
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }

    // Listener for Esc btn to close Modal
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    

    const result = await onSubmit(email, password);
    setIsLoading(false);

    if (result.success) {
      setLoginMessage('เข้าสู่ระบบสำเร็จ! กำลังปิดหน้าต่าง');

      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setLoginMessage(result.message);
    }
  };

  return (
    <div className='modal-overlay' role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div className='login-modal'>
        <h2 id="login-modal-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={emailInputRef}
            className='email'
            type='email'
            placeholder='Email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <input
            className='password'
            type='password'
            placeholder='Password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          {loginMessage && (
            <p className={`login-feedback ${loginMessage.includes('ไม่ถูกต้อง') ? 'error' : 'success'}`}>
                {loginMessage}
            </p>
          )}

          <div className="button-group">
            <button className='close-btn' type='button' onClick={onClose}>Close</button>
            <button className='submit-btn' type='submit'>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PopupLogin;