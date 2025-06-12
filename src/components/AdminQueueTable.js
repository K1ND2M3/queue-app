import React, {useEffect, useRef, useState, useCallback} from 'react';
import ReactDOM from 'react-dom';
import './AdminQueueTable.css';

const StatusBadge = ({ status }) => {
  const statusMap = {
    'กำลังดำเนินการ': 'progress',
    'รอดำเนินการ': 'pending',
    'เสร็จสิ้น': 'completed',
    'ยกเลิก': 'cancelled'
  };

  const statusClass = statusMap[status] || 'default';

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
};

const ActionMenu = ({ top, left, onClose, onEdit, onRealDelete }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleInteraction = () => {
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleInteraction, true);
        window.addEventListener('resize', handleInteraction, true);
    
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleInteraction, true);
        window.removeEventListener('resize', handleInteraction, true);

        };
    }, [onClose]);

    return (
        <div className="action-menu" style={{ top: top, left: left }} ref={menuRef}>
        <button className="action-menu-item" onClick={onEdit}>
            <i className='bx bxs-edit'></i> แก้ไข
        </button>
        <button className="action-menu-item danger" onClick={onRealDelete}>
            <i className='bx bxs-trash'></i> ลบ
        </button>
        </div>
    );
};


function AdminQueueTable({ queueData, onDeleteItem, onEditItem, totalItemCount }) {
    const [openMenu, setOpenMenu] = useState({ id: null, position: null});
    const actionButtonRefs = useRef({});

    const handleToggleMenu = (queue_id) => {
        const buttonElement = actionButtonRefs.current[queue_id];

        if (openMenu.id === queue_id) {
            setOpenMenu({ id: null, position: null });
        } else {
            const rect = buttonElement.getBoundingClientRect();
            setOpenMenu({
                id: queue_id,
                position: {
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX - 80,
                }
            });
        }
    };

    const handleCloseMenu = useCallback(() => {
        setOpenMenu({ id: null, position: null});
    }, []);

  return (
    <div className='admin-table-container'>
        <table className='admin-queue-table'>
            <thead>
                <tr>
                    <th>ลำดับคิว</th>
                    <th>ชื่อลูกค้า</th>
                    <th>ประเภทงาน</th>
                    <th>สถานะ</th>
                    <th>วันที่สร้าง</th>
                    <th>การจัดการ</th>
                </tr>
            </thead>
            <tbody>
                {totalItemCount === 0 ? (
                    <tr>
                        <td colSpan="6" className="no-results-cell">
                            ยังไม่มีคิวในระบบ
                        </td>
                    </tr>
                ) : queueData.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="no-results-cell">
                            ไม่พบรายการที่ค้นหา
                        </td>
                    </tr>
                ) : (
                    queueData.map((item, index) => (
                        <tr key={item._id}>
                            <td data-label="ลำดับคิว">{item.order}</td>
                            <td data-label="ชื่อลูกค้า">{item.name}</td>
                            <td data-label="ประเภทงาน">{item.type}</td>
                            <td data-label="สถานะ"><StatusBadge status={item.status} /></td>
                            <td data-label="วันที่สร้าง">{item.createdAt}</td>
                            <td data-label="การจัดการ" className="actions-cell">
                                <button
                                    ref={(el) => (actionButtonRefs.current[item._id] = el)}
                                    className="action-btn"
                                    onClick={() => handleToggleMenu(item._id)}
                                >
                                    <i className='bx bx-dots-vertical-rounded'></i>
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>

        {openMenu.id && ReactDOM.createPortal (
            <ActionMenu 
                top={openMenu.position.top}
                left={openMenu.position.left}
                onClose={handleCloseMenu}    
                onEdit={() => {
                    const itemToEdit = queueData.find(q => q._id === openMenu.id);
                    const displayOrder = queueData.findIndex(q => q._id === openMenu.id) + 1;
                    onEditItem({...itemToEdit, order: displayOrder });

                    handleCloseMenu();
                }}
                onDelete={() => console.log('Delete item:', openMenu.id)}
                onRealDelete={() => {
                    onDeleteItem(openMenu.id);

                    setOpenMenu({ id: null, position: null });
                }}
            />,
            document.getElementById('menu-portal')
        )}
    </div>
  );
}

export default AdminQueueTable
