import React from 'react';
import QueueTable from '../components/QueueTable';
import '../pages/AdminDashboard.css';

function HomePage({ queueData }) {
  return (
    <section className="admin-dashboard container"> 
      <div className="dashboard-header">
        <div className="header-text">
          <h1>ตารางคิว</h1>
          <p>ตรวจสอบสถานะคิวงานของคุณได้ที่นี่</p>
        </div>
      </div>
      
      <div className="queue-management-section">
        <QueueTable queueData={queueData} />
      </div>
    </section>
  );
}

export default HomePage;