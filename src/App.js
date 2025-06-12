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
    const token = localStorage.getItem('token');
    handleCloseConfirm();
    try {
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchQueues();
    } catch (error) {
      console.error('Error deleting queue:', error);
    }
  };

  const handleUpdateQueueItem = async (updatedItem) => {
    const token = localStorage.getItem('token');
    handleCloseEditPopup();
    try {
      const response = await fetch(`/api/queues/${updatedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) throw new Error('Failed to update');
      await fetchQueues();
    } catch (error) {
      console.error('Error updating queue:', error);
    }
  };
  
  const handleAddQueueItem = async (newItemData) => {
    const token = localStorage.getItem('token');
    setShowAddPopup(false);
    try {
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newItemData),
      });
      if (!response.ok) throw new Error('Failed to add');
      await fetchQueues();
    } catch (error) {
      console.error('Error adding queue:', error);
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