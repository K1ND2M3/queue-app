import React, { useEffect } from 'react'
import './PopupConfirm.css';

function PopupConfirm({
    title,
    message,
    onClose,
    onConfirm,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลืก',
    confirmColor = 'default' // 'default' or 'danger'
}) {

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

  return (
    <div className='modal-overlay'>
        <div className='confirm-modal'>
            <h2>{title}</h2>
            <p>{message}</p>
            <div className='confirm-button-group'>
                <button className='cancel-btn' onClick={onClose}>
                    {cancelText}
                </button>
                <button className={`confirm-btn ${confirmColor}`} onClick={onConfirm}>
                    {confirmText}
                </button>
            </div>
        </div>
      
    </div>
  )
}

export default PopupConfirm
