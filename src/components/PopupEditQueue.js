import React, {useState, useEffect} from 'react';
import './PopupEditQueue.css';

const STATUS_OPTIONS = ['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'];

function PopupEditQueue({queueItem, onClose, onSave, totalQueues}) {

    const [formData, setFormData] = useState({ ...queueItem });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setFormData({ ...queueItem });
    }, [queueItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));

        setIsDropdownOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!queueItem) return null;

    return (
        <div className='modal-overlay'>
            <div className='edit-queue-modal'>
                <h2>แก้ไขคิว #{formData.order}</h2>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='order'>ลำดับคิว</label>
                        <input 
                            type='number'
                            id='order'
                            name='order'
                            value={formData.order}
                            onChange={handleChange}
                            required
                            min='1'
                            max={totalQueues}
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='name'>ชื่อลูกค้า</label>
                        <input 
                            type='text'
                            id='name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='type'>ประเภทงาน</label>
                        <input 
                            type='text'
                            id='type'
                            name='type'
                            value={formData.type}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='status'>สถานะ</label>
                        <div className='select-wrapper'>
                            <select
                                id='status'
                                name='status'
                                value={formData.status}
                                onMouseDown={(e) => {
                                    setIsDropdownOpen(prev => !prev);
                                }}
                                onBlur={() => setIsDropdownOpen(false)}
                                onChange={handleChange}
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <span className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}>
                                <i className='bx bxs-chevron-down'></i>
                            </span>
                        </div>
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

export default PopupEditQueue
