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
      // 1. Optimistic Update: ลบและอัปเดต order ใน UI ทันที
      setQueueData(prev => {
        const deletedItem = prev.find(item => item._id === queueId);
        if (!deletedItem) return prev;

        return prev
          .filter(item => item._id !== queueId)
          .map(item => ({
            ...item,
            order: item.order > deletedItem.order ? item.order - 1 : item.order
          }));
      });

      // 2. ส่ง request ลบไปที่ backend
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete');

      // 3. รับข้อมูลล่าสุดจาก server (optional)
      const updatedQueues = await response.json();
      setQueueData(updatedQueues);

    } catch (error) {
      console.error('Error deleting queue:', error);
      // 4. ย้อนกลับ state หากล้มเหลว
      const refreshedData = await fetchQueues();
      setQueueData(refreshedData);
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateQueueItem = async (updatedItem) => {
    const token = localStorage.getItem('token');
    handleCloseEditPopup();
    
    try {
      // 1. Optimistic Update: อัปเดต UI ทันที
      setQueueData(prev => {
        const oldItem = prev.find(item => item._id === updatedItem._id);
        if (!oldItem) return prev;

        return prev.map(item => {
          // คิวที่ถูกแก้ไข
          if (item._id === updatedItem._id) return updatedItem;
          
          // คิวอื่นๆ ที่ต้องเลื่อนลำดับ
          if (updatedItem.order < oldItem.order) {
            if (item.order >= updatedItem.order && item.order < oldItem.order) {
              return { ...item, order: item.order + 1 };
            }
          } else {
            if (item.order > oldItem.order && item.order <= updatedItem.order) {
              return { ...item, order: item.order - 1 };
            }
          }
          return item;
        }).sort((a, b) => a.order - b.order);
      });

      // 2. ส่ง request ไป backend
      const response = await fetch(`/api/queues/${updatedItem._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedItem)
      });

      if (!response.ok) throw new Error('Failed to update');

      // 3. รับข้อมูลล่าสุดจาก server
      const updatedQueues = await response.json();
      setQueueData(updatedQueues);

    } catch (error) {
      console.error('Error updating queue:', error);
      // 4. ย้อนกลับ state หากล้มเหลว
      const refreshedData = await fetchQueues();
      setQueueData(refreshedData);
    }
  };

  
  const handleAddQueueItem = async (newItemData) => {
    const token = localStorage.getItem('token');
    setShowAddPopup(false);
    
    // ประกาศ mockItem นอกบล็อก try-catch เพื่อให้เข้าถึงได้ทั่วทั้งฟังก์ชัน
    let mockItem = null;

    try {
      // 1. สร้าง mock data สำหรับ Optimistic UI
      mockItem = {
        ...newItemData,
        _id: `mock-${Date.now()}`, // ใช้ prefix "mock-" เพื่อระบุว่าเป็นข้อมูลชั่วคราว
        status: 'รอดำเนินการ',
        createdAt: new Date().toLocaleDateString('th-TH'),
        order: queueData.length > 0 ? Math.max(...queueData.map(q => q.order)) + 1 : 1
      };

      // 2. อัพเดต UI ทันทีด้วย mock data
      setQueueData(prev => [...prev, mockItem]);

      // 3. ส่ง request จริงไปยัง backend
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newItemData),
      });

      if (!response.ok) throw new Error('Failed to add');

      // 4. แทนที่ mock data ด้วยข้อมูลจริงจาก server
      const addedItem = await response.json();
      setQueueData(prev => 
        prev.map(item => item._id === mockItem._id ? addedItem : item)
      );

    } catch (error) {
      console.error('Error adding queue:', error);
      // 5. ย้อนกลับ state โดยลบ mock data ออก (ถ้ามี)
      if (mockItem) {
        setQueueData(prev => prev.filter(item => item._id !== mockItem._id));
      }
      // หรือโหลดข้อมูลใหม่จาก server เพื่อความปลอดภัย
      // const refreshedData = await fetchQueues();
      // setQueueData(refreshedData);
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