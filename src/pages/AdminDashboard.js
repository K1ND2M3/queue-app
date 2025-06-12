import './AdminDashboard.css'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import StatCard from '../components/StatCard';
import AdminQueueTable from '../components/AdminQueueTable';

const STATUS_OPTIONS = ['All', 'รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'];

function AdminDashboard({queueData, onDeleteItem, onEditItem, onOpenAddPopup}) {

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const filterBoxRef = useRef(null);

    const stats = useMemo(() => {
        return {
            all: queueData.length,
            pending: queueData.filter(item => item.status === 'รอดำเนินการ').length,
            progress: queueData.filter(item => item.status === 'กำลังดำเนินการ').length,
            completed: queueData.filter(item => item.status === 'เสร็จสิ้น').length,
            cancelled: queueData.filter(item => item.status === 'ยกเลิก').length,
        };
    }, [queueData]);

    const filteredQueueData = useMemo(() => {
        let filtered = queueData;

        if (statusFilter !== 'All') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(lowercasedQuery) ||
                item.type.toLowerCase().includes(lowercasedQuery) ||
                String(item.order).includes(lowercasedQuery)
            );
        }

        return filtered;
    }, [queueData, searchQuery, statusFilter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterBoxRef.current && !filterBoxRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  return (
    <div className="admin-dashboard container">
      <div className='dashboard-header'>
        <div className='header-text'>
            <h1>จัดการคิว</h1>
            <p>จัดการคิวงานของร้านคุณ</p>
        </div>
        <button className='add-queue-btn' onClick={onOpenAddPopup}>
            + เพิ่มคิวใหม่
        </button>
      </div>

      <div className='stat-cards-container'>
        <StatCard title='ทั้งหมด' value={stats.all} type='all' />
        <StatCard title='รอคิว' value={stats.pending} type='pending' />
        <StatCard title='กำลังทำ' value={stats.progress} type='progress' />
        <StatCard title='เสร็จสิ้น' value={stats.completed} type='completed' />
        <StatCard title='ยกเลิก' value={stats.cancelled} type='cancelled' />
      </div>

      <div className='queue-management-section'>
        <div className='table-controls'>
            <div className='search-box'>
                <i className='bx bx-search'></i>
                <input 
                    type='text' 
                    placeholder='ค้นหาชื่อ, หมายเลขคิว, ประเภทงาน...' 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
            </div>
            <div className='filter-box' ref={filterBoxRef}>
                <button className='filter-btn' onClick={() => setIsFilterMenuOpen(prev => !prev)}>
                    <i className='bx bx-filter-alt'></i>
                    <span>{statusFilter === 'All' ? 'ฟิลเตอร์' : statusFilter}</span>
                </button>

                {/* Dropdown */}
                {isFilterMenuOpen && (
                    <div className='filter-menu'>
                        {STATUS_OPTIONS.map(status => (
                            <button
                                key={status}
                                className={`filter-menu-item ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setIsFilterMenuOpen(false);
                                }}
                            >
                                {status === 'All' ? 'แสดงทั้งหมด' : status}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <AdminQueueTable 
            queueData={filteredQueueData} 
            onDeleteItem={onDeleteItem}
            onEditItem={onEditItem}
            totalItemCount={queueData.length}
            />
      </div>
    </div>
  );
}

export default AdminDashboard;