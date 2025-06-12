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
  const [isJustLoggedIn, setIsJustLoggedIn] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'ตกลง',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const response = await fetch('/api/queues');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQueueData(data);
      } catch (error) {
        console.error("Failed to fetch queues:", error);

      }
    };
    fetchQueues();
  }, []);


  const handleLoginSubmit = async (username, password) => {
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({ email: username, password: password}),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        localStorage.setItem('token', data.token);

        setIsLoggedIn(true);
        setIsJustLoggedIn(true);
        return { success: true };
    } catch (error) {
        console.error('Login failed', error);
        
        return { success: false, message: error.message };
    }
  };
  
  const handleCloseConfirm = useCallback(() => {
    setConfirmState({ isOpen: false });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
    handleCloseConfirm();
  }, [navigate, handleCloseConfirm]);

  const fetchQueues = useCallback(async () => {
    try {
        const response = await fetch('/api/queues');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQueueData(data);
    } catch (error) {
        console.error('Failed to fetch queues:', error);
    }
  }, []);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
        setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleDeleteQueueItem = useCallback(async (queueId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/queues/${queueId}`, {
            method: 'DELETE',
            headers: {
              'Authorization' : `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete queue from server');
        }
        
        await fetchQueues();

    } catch (error) {
        console.error('Error deleting queue:', error);
    } finally {
        handleCloseConfirm();
    }
  }, [fetchQueues ,handleCloseConfirm]);


  const handleOpenLogoutConfirm = useCallback(() => {
    setConfirmState({
      isOpen: true,
      title: 'ยืนยันการออกจากระบบ',
      message: 'คุณต้องการออกจากระบบใช่หรือไม่?',
      onConfirm: handleLogout,
      confirmText: 'ออกจากระบบ'
    });
  }, [handleLogout]);

  const handleOpenDeleteConfirm = useCallback((queueId) => {
    setConfirmState({
      isOpen: true,
      title: 'ยืนยันการลบ',
      message: 'คุณแน่ใจหรือไม่ว่าจะลบคิวนี้?',
      onConfirm: () => handleDeleteQueueItem(queueId),
      confirmText: 'ยืนยันการลบ'
    });
  }, [handleDeleteQueueItem]);
  
  const handleOpenEditPopup = (item) => { setEditingItem(item); };
  const handleCloseEditPopup = () => { setEditingItem(null); };

  const handleUpdateQueueItem = async (updatedItem) => {
    const token = localStorage.getItem('token');
    try {
        
        const response = await fetch(`/api/queues/${updatedItem._id}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedItem),
        });

        if (!response.ok) {
            throw new Error('Failed to update queue on server');
        }

        await fetchQueues();
    } catch (error) {
        console.error('Error updating queue', error);
    } finally {
        handleCloseEditPopup();
    }
  };

  const handleAddQueueItem = async (newItemData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch ('/api/queues', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newItemData),
        });

        if(!response.ok) {
            throw new Error('Failed to add queue');
        }

        const savedQueue = await response.json();

        setQueueData(prevData => [...prevData, savedQueue]);
        setShowAddPopup(false);
    } catch (error) {
        console.error('Error adding queue:', error);
    }
  };

  useEffect(() => {
    if (isJustLoggedIn) {
      navigate('/admin');
      setIsJustLoggedIn(false);
    }
  }, [isJustLoggedIn, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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