import React from 'react';
import './QueueTable.css';

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


function QueueTable({ queueData }) {
  return (
    <div className="admin-table-container">
      <table className="admin-queue-table">
        <thead>
          <tr>
            <th>ลำดับคิว</th>
            <th>ชื่อ</th>
            <th>ประเภทงาน</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {queueData && queueData.length > 0 ? (
            queueData.map((queueItem, index) => (
              <tr key={queueItem._id}>
                <td data-label="ลำดับคิว">
                  <div className='queue-number'>
                    <span>{index + 1}</span>
                  </div>
                </td>
                <td>{queueItem.name}</td>
                <td>{queueItem.type}</td>
                <td><StatusBadge status={queueItem.status} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-results-cell">
                ไม่มีคิวในขณะนี้
              </td>
            </tr>
          )}
        </tbody>
        </table>
    </div>
    
  );
}

export default QueueTable;