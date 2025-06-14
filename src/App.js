import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PopupLogin from './components/PopupLogin';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PopupConfirm from './components/PopupConfirm';
import PopupEditQueue from './components/PopupEditQueue';
import PopupAddQueue from './components/PopupAddQueue';

function AppLogic() {
  const [darkMode, setDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [queueData, setQueueData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false });
  const [isMutating, setIsMutating] = useState(false);

  const navigate = useNavigate();


  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/queues');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setQueueData(data);
    } catch (error) {
      console.error("Failed to fetch queues:", error);
    }
  };


  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
      await fetchQueues();
      setIsLoading(false);
    };
    initializeApp();
  }, []);


  const handleLoginSubmit = async (username, password) => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');


      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      navigate('/admin');
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      return { success: false, message: error.message };
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
    handleCloseConfirm();
  };

  const handleDeleteQueueItem = async (queueId) => {
    if (isMutating) return;
    setIsMutating(true);
    const token = localStorage.getItem('token');
    handleCloseConfirm();
    
    try {
      // 1. อัพเดต UI ทันที
      setQueueData(prev => prev.filter(item => item._id !== queueId));
      
      // 2. ส่ง request ลบข้อมูล (ไม่ต้องรอ response)
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 3. หากล้มเหลว -> ย้อนกลับ state
      if (!response.ok) throw new Error('Failed to delete');
      
    } catch (error) {
      console.error('Error deleting queue:', error);
      // ย้อนกลับ state โดย fetch ข้อมูลใหม่
      const refreshedData = await fetchQueues(); // เรียกฟังก์ชัน fetchQueues ที่มีอยู่
      setQueueData(refreshedData);
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateQueueItem = async (updatedItem) => {
    const token = localStorage.getItem('token');
    handleCloseEditPopup();
    
    try {
      // 1. อัพเดต UI ทันทีด้วยข้อมูลใหม่
      setQueueData(prev => 
        prev.map(item => item._id === updatedItem._id ? updatedItem : item)
      );
      
      // 2. ส่ง request อัพเดตไปที่ backend
      const response = await fetch(`/api/queues/${updatedItem._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedItem),
      });
      
      // 3. หากล้มเหลว -> ย้อนกลับ state
      if (!response.ok) throw new Error('Failed to update');
      
    } catch (error) {
      console.error('Error updating queue:', error);
      // ย้อนกลับ state โดย fetch ข้อมูลใหม่
      const refreshedData = await fetchQueues();
      setQueueData(refreshedData);
    }
  };

  
  const handleAddQueueItem = async (newItemData) => {
    const token = localStorage.getItem('token');
    setShowAddPopup(false);
    
    try {
      // 1. สร้าง mock data สำหรับอัพเดต UI ทันที
      const mockItem = {
        ...newItemData,
        _id: Date.now().toString(), // ID ชั่วคราว
        status: 'รอดำเนินการ',
        createdAt: new Date().toLocaleDateString('th-TH'),
        order: Math.max(...queueData.map(q => q.order), 0) + 1 // สร้าง order ชั่วคราว
      };
      
      // 2. อัพเดต UI ทันที
      setQueueData(prev => [...prev, mockItem]);
      
      // 3. ส่ง request เพิ่มข้อมูลจริงไปที่ backend
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newItemData),
      });
      
      if (!response.ok) throw new Error('Failed to add');
      
      // 4. แทนที่ mock data ด้วยข้อมูลจริงจาก server (optional)
      const addedItem = await response.json();
      setQueueData(prev => 
        prev.map(item => item._id === mockItem._id ? addedItem : item)
      );
      
    } catch (error) {
      console.error('Error adding queue:', error);
      // ย้อนกลับ state โดยลบ mock data ออก
      setQueueData(prev => prev.filter(item => item._id !== mockItem._id));
    }
  };
  

  const handleCloseConfirm = () => setConfirmState({ isOpen: false });
  const handleOpenLogoutConfirm = () => setConfirmState({ isOpen: true, title: 'ยืนยันการออกจากระบบ', message: 'คุณต้องการออกจากระบบใช่หรือไม่?', onConfirm: handleLogout, confirmText: 'ออกจากระบบ' });
  const handleOpenDeleteConfirm = (queueId) => setConfirmState({ isOpen: true, title: 'ยืนยันการลบ', message: 'คุณแน่ใจหรือไม่ว่าจะลบคิวนี้?', onConfirm: () => handleDeleteQueueItem(queueId), confirmText: 'ยืนยันการลบ' });
  const handleOpenEditPopup = (item) => { setEditingItem(item); };
  const handleCloseEditPopup = () => { setEditingItem(null); };

  useEffect(() => {
    if (darkMode) { document.body.classList.add('dark-mode'); } 
    else { document.body.classList.remove('dark-mode'); }
    return () => { document.body.classList.remove('dark-mode'); }
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <i className='bx bx-loader-alt bx-spin'></i>
      </div>
    );
  }

  return (
    <div className={`content ${darkMode ? 'dark-mode' : ''}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={handleOpenLogoutConfirm}
      />
      <Routes>
        <Route path="/" element={<HomePage queueData={queueData} />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AdminDashboard 
                queueData={queueData} 
                onDeleteItem={handleOpenDeleteConfirm}
                onEditItem={handleOpenEditPopup}
                onOpenAddPopup={() => setShowAddPopup(true)}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
      
      {showLogin && ( <PopupLogin onClose={() => setShowLogin(false)} onSubmit={handleLoginSubmit}/> )}
      {confirmState.isOpen && ( <PopupConfirm {...confirmState} onClose={handleCloseConfirm} cancelText="ยกเลิก" confirmColor="danger"/> )}
      {editingItem && ( <PopupEditQueue queueItem={editingItem} onClose={handleCloseEditPopup} onSave={handleUpdateQueueItem} totalQueues={queueData.length} /> )}
      {showAddPopup && ( <PopupAddQueue onClose={() => setShowAddPopup(false)} onSave={handleAddQueueItem} /> )}

      <Footer />
    </div>
  );
}

function App() {
    return (
        <BrowserRouter>
            <AppLogic />
        </BrowserRouter>
    );
}

export default App;