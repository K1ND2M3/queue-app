import React, {useState} from 'react';
import './PopupAddQueue.css';
import { type } from '@testing-library/user-event/dist/type';

function PopupAddQueue({ onClose, onSave }) {
    
    const [formData, setFormData] = useState({
        name: '',
        type: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

  return (
    <div className='modal-overlay'>
        <div className='edit-queue-modal'>
            <h2>เพิ่มคิวใหม่</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label htmlFor='add-name'>ชื่อลูกค้า</label>
                    <input 
                        type='text'
                        id='add-name'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='add-type'>ประเภทงาน</label>
                    <input 
                        type='text'
                        id='add-type'
                        name='type'
                        value={formData.type}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className='form-actions'>
                    <button type='button' className='cancel-btn' onClick={onClose}>ยกเลิก</button>
                    <button type='submit' className='save-btn'>บันทึก</button>
                </div>
            </form>
        </div>
      
    </div>
  )
}

export default PopupAddQueue
