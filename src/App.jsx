import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsSection from './components/StatsSection';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import DoList from './components/DoList';
import Auth from './components/Auth';
import useLocalStorage from './hooks/useLocalStorage';
import { Plus, Activity } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5050/api' 
  : 'https://gagaflow.onrender.com/api';

// Predefined Workspaces/Categories
const DEFAULT_CATEGORIES = [
  { id: 'cat-work', name: 'Work', color: '#6366f1' },
  { id: 'cat-personal', name: 'Personal', color: '#10b981' },
  { id: 'cat-shopping', name: 'Shopping', color: '#f59e0b' },
  { id: 'cat-health', name: 'Health', color: '#8b5cf6' }
];

// Helper to get relative date strings so mock data is always valid
const getRelativeDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export default function App() {
  const [categories, setCategories] = useLocalStorage('aether_categories', DEFAULT_CATEGORIES);
  const [todos, setTodos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [dos, setDos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [showDayManagerAlert, setShowDayManagerAlert] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallAlert, setShowInstallAlert] = useState(false);
  const [dontShowInstallAgain, setDontShowInstallAgain] = useState(false);
  const [showIosInstallInstructions, setShowIosInstallInstructions] = useState(false);

  // Toast notifier helper
  // Toast notifier helper
  const showToast = (message, type = 'info') => {
    const id = crypto.randomUUID();
    let title = '';
    let note = '';
    
    if (typeof message === 'object' && message !== null) {
      title = message.title || '';
      note = message.note || '';
    } else {
      title = String(message);
    }
    
    setToasts(prev => [...prev, { id, title, note, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Cracker boom confetti celebration (Optimized for 2 seconds duration)
  const triggerConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#007aff', '#af52de', '#ff2d55', '#34c759', '#ff9500', '#ffcc00', '#5856d6'];
    const particles = [];
    const timeouts = [];
    let isSpawning = true;
    const startTime = Date.now();

    // Helper to spawn a burst of particles
    const spawnBurst = (x, y, count, angleMin, angleMax, speedMin, speedMax) => {
      for (let i = 0; i < count; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        particles.push({
          x: x,
          y: y,
          angle: angle,
          speed: speed,
          radius: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.007 + 0.007, // Faster decay for 2s total lifecycle
          gravity: Math.random() * 0.06 + 0.12, // Light gravity
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.04 + 0.02
        });
      }
    };

    // Wave 1: Immediate rich bursts from center and bottom corners
    spawnBurst(width / 2, height * 0.5, 100, 0, Math.PI * 2, 4, 11);
    spawnBurst(0, height, 40, -Math.PI * 0.35, -Math.PI * 0.05, 11, 17);
    spawnBurst(width, height, 40, -Math.PI * 0.95, -Math.PI * 0.65, 11, 17);

    // Wave 2: Timed burst at 350ms - Secondary corner shoots
    timeouts.push(setTimeout(() => {
      spawnBurst(0, height, 30, -Math.PI * 0.3, -Math.PI * 0.08, 9, 15);
      spawnBurst(width, height, 30, -Math.PI * 0.92, -Math.PI * 0.7, 9, 15);
    }, 350));

    // Wave 3: Timed burst at 700ms - Bottom middle fountain upward
    timeouts.push(setTimeout(() => {
      spawnBurst(width / 2, height, 40, -Math.PI * 0.65, -Math.PI * 0.35, 8, 14);
    }, 700));

    // Wave 4: Timed burst at 1100ms - Final celebration sparkles
    timeouts.push(setTimeout(() => {
      spawnBurst(width * 0.3, height * 0.4, 25, 0, Math.PI * 2, 3, 7);
      spawnBurst(width * 0.7, height * 0.4, 25, 0, Math.PI * 2, 3, 7);
      isSpawning = false; // Finished triggering waves
    }, 1100));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = isSpawning || (Date.now() - startTime < 2000); // Ensure active animation for 2 seconds

      particles.forEach(p => {
        if (p.alpha > 0) {
          alive = true;
          // Apply motion with wind drift wobble
          p.x += Math.cos(p.angle) * p.speed + Math.sin(p.wobble) * 0.45;
          p.y += Math.sin(p.angle) * p.speed + p.gravity;
          p.speed *= 0.96; // Air resistance / friction
          p.wobble += p.wobbleSpeed;
          p.alpha -= p.decay;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        window.removeEventListener('resize', handleResize);
        timeouts.forEach(clearTimeout);
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      }
    };

    animate();
  };


  // Authentication State
  const [user, setUser] = useLocalStorage('aether_user', null);

  // Day Manager feature alert pop-up state
  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(`gaga_day_manager_alert_seen_user_${user.id}`);
      if (!seen) {
        setShowDayManagerAlert(true);
      }
    } else {
      setShowDayManagerAlert(false);
    }
  }, [user]);

  const handleCloseAlert = () => {
    if (user) {
      localStorage.setItem(`gaga_day_manager_alert_seen_user_${user.id}`, 'true');
    }
    setShowDayManagerAlert(false);
  };

  const handleViewFeature = () => {
    if (user) {
      localStorage.setItem(`gaga_day_manager_alert_seen_user_${user.id}`, 'true');
    }
    setActiveCategory('dos');
    setShowDayManagerAlert(false);
  };

  // Capture beforeinstallprompt event for PWA
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Display PWA install alert after short delay if conditions met
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const neverShow = localStorage.getItem('gaga_pwa_install_never_show') === 'true';
    if (!isStandalone && !neverShow) {
      const timer = setTimeout(() => {
        setShowInstallAlert(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install choice: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallAlert(false);
    } else {
      // Fallback instruction popup for iOS or unsupported browsers
      setShowIosInstallInstructions(true);
    }
  };

  const handleLaterInstall = () => {
    if (dontShowInstallAgain) {
      localStorage.setItem('gaga_pwa_install_never_show', 'true');
    }
    setShowInstallAlert(false);
  };

  // Viewport Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch todos from MongoDB when user is active
  useEffect(() => {
    if (user) {
      const fetchTodos = async () => {
        try {
          const response = await fetch(`${API_BASE}/todos`, {
            headers: {
              'x-user-id': user.id
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Map DB _id to id key for frontend render compatibility
            const formatted = data.map(todo => ({ ...todo, id: todo._id }));
            setTodos(formatted);
          }
        } catch (err) {
          console.error('Error loading tasks:', err);
        }
      };
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [user]);

  // Fetch Do Items from MongoDB when user is active or selectedDate changes
  useEffect(() => {
    if (user) {
      const fetchDos = async () => {
        try {
          const response = await fetch(`${API_BASE}/dos?date=${selectedDate}`, {
            headers: {
              'x-user-id': user.id
            }
          });
          if (response.ok) {
            const data = await response.json();
            const formatted = data.map(doItem => ({ ...doItem, id: doItem._id }));
            setDos(formatted);
          }
        } catch (err) {
          console.error('Error loading do logs:', err);
        }
      };
      fetchDos();
    } else {
      setDos([]);
    }
  }, [user, selectedDate]);

  // Sync theme with DOM root node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Auto-open modal form on mobile when editing is triggered
  useEffect(() => {
    if (editingTodo && isMobile) {
      setIsFormOpen(true);
    }
  }, [editingTodo, isMobile]);

  const handleLogout = () => {
    setUser(null);
    setTodos([]);
  };

  // Add Task to DB
  const handleAddTodo = async (todoData) => {
    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(todoData)
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = { ...data, id: data._id };
        setTodos([formatted, ...todos]);
        showToast('Task created successfully!  🎉', 'success');
      } else {
        showToast('Failed to create task.', 'danger');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      showToast('Connection error. Failed to add task.', 'danger');
    }
  };

  // Update Task in DB
  const handleUpdateTodo = async (updatedTodo) => {
    try {
      const todoId = updatedTodo.id || updatedTodo._id;
      const response = await fetch(`${API_BASE}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTodo)
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = { ...data, id: data._id };
        setTodos(todos.map(t => (t.id === formatted.id || t._id === formatted.id) ? formatted : t));
        setEditingTodo(null);
        setIsFormOpen(false);
        showToast('Task updated successfully! 📝', 'success');
      } else {
        showToast('Failed to update task.', 'danger');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      showToast('Connection error. Failed to update task.', 'danger');
    }
  };

  // Delete Task from DB
  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTodos(todos.filter(t => t.id !== id && t._id !== id));
        if (editingTodo && (editingTodo.id === id || editingTodo._id === id)) {
          setEditingTodo(null);
        }
        showToast('Task deleted successfully.', 'info');
      } else {
        showToast('Failed to delete task.', 'danger');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('Connection error. Failed to delete task.', 'danger');
    }
  };

  // Add Daily Log (Do Item) to DB
  const handleAddDo = async (time, text) => {
    try {
      const response = await fetch(`${API_BASE}/dos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ time, text, dateStr: selectedDate })
      });

      if (response.ok) {
        const newDo = await response.json();
        setDos(prev => [{ ...newDo, id: newDo._id }, ...prev]);
        showToast('Daily log added successfully!', 'success');
      } else {
        showToast('Failed to add daily log.', 'danger');
      }
    } catch (err) {
      console.error('Error adding daily log:', err);
      showToast('Connection error. Failed to add daily log.', 'danger');
    }
  };

  // Delete Daily Log (Do Item) from DB
  const handleDeleteDo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/dos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDos(prev => prev.filter(item => item.id !== id && item._id !== id));
        showToast('Daily log deleted successfully.', 'info');
      } else {
        showToast('Failed to delete daily log.', 'danger');
      }
    } catch (err) {
      console.error('Error deleting daily log:', err);
      showToast('Connection error. Failed to delete daily log.', 'danger');
    }
  };

  // Toggle Complete Task in DB (Optimistic UI Update for instant feedback)
  const handleToggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id || t._id === id);
    if (!todo) return;

    const originalTodo = { ...todo };
    const newCompleted = !todo.completed;
    const newSubtasks = todo.subtasks ? todo.subtasks.map(s => ({ ...s, completed: newCompleted })) : [];

    // Optimistically update local state immediately (0ms lag)
    const optimisticTodo = { ...todo, completed: newCompleted, subtasks: newSubtasks };
    setTodos(prevTodos => prevTodos.map(t => (t.id === id || t._id === id) ? optimisticTodo : t));

    // Show toast and confetti immediately
    if (newCompleted) {
      triggerConfetti();
      const quotes = [
        "Be consistent, do well.",
        "Task completed! Do well.",
        "Task completed! Never give up."
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      showToast({ title: 'Task completed! 🎉', note: randomQuote }, 'success');
    } else {
      showToast({ title: 'Task marked as pending.', note: 'Keep doing! Never give up.' }, 'info');
    }

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: newCompleted, subtasks: newSubtasks })
      });
      if (!response.ok) {
        // Revert optimistic update on failure
        setTodos(prevTodos => prevTodos.map(t => (t.id === id || t._id === id) ? originalTodo : t));
        showToast('Failed to toggle task status.', 'danger');
      } else {
        const data = await response.json();
        const formatted = { ...data, id: data._id };
        // Sync with actual DB response
        setTodos(prevTodos => prevTodos.map(t => (t.id === id || t._id === id) ? formatted : t));
      }
    } catch (err) {
      console.error('Error toggling complete:', err);
      // Revert optimistic update on error
      setTodos(prevTodos => prevTodos.map(t => (t.id === id || t._id === id) ? originalTodo : t));
      showToast('Connection error. Reverted status.', 'danger');
    }
  };

  // Toggle Subtask in DB
  const handleToggleSubtask = async (todoId, subtaskId) => {
    const todo = todos.find(t => t.id === todoId || t._id === todoId);
    if (!todo) return;

    const newSubtasks = todo.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    try {
      const response = await fetch(`${API_BASE}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subtasks: newSubtasks })
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = { ...data, id: data._id };
        setTodos(todos.map(t => (t.id === todoId || t._id === todoId) ? formatted : t));
      }
    } catch (err) {
      console.error('Error toggling subtask:', err);
    }
  };

  // Create Custom Category
  const handleAddCategory = (catData) => {
    const newCat = {
      ...catData,
      id: `cat-${crypto.randomUUID()}`
    };
    setCategories([...categories, newCat]);
  };

  // Filter todos corresponding to current active category/folder view for stats
  const getFilteredTodosForStats = () => {
    if (activeCategory === 'all') return todos;
    
    if (activeCategory === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return todos.filter(t => t.dueDate === todayStr);
    }
    
    if (activeCategory === 'scheduled') {
      return todos.filter(t => t.dueDate);
    }
    
    if (activeCategory === 'important') {
      return todos.filter(t => t.priority === 'high');
    }
    
    return todos.filter(t => t.categoryId === activeCategory);
  };

  const filteredStatsTodos = getFilteredTodosForStats();

  const filteredDos = dos.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // AUTH VIEW GATEKEEPER
  if (!user) {
    return (
      <Auth 
        onLogin={(userObj, isRegister) => {
          setUser(userObj);
          if (isRegister) {
            showToast('Account created successfully! Welcome 🎉', 'success');
          } else {
            showToast('Logged in successfully! Welcome back 👋', 'success');
          }
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Glassmorphism background blobs */}
      <div className="glass-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Navigation Sidebar */}
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        todos={todos}
        onAddCategory={handleAddCategory}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        dos={dos}
      />

      {/* Main Task View Dashboard */}
      <main className="main-workspace">
        <DashboardHeader
          activeCategory={activeCategory}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsMobileOpen={setIsMobileOpen}
          onOpenForm={() => setIsFormOpen(true)}
          user={user}
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        <div className="dashboard-grid">
          {/* Form and Stats sidebar */}
          {(!isMobile || activeCategory !== 'dos') && (
            <div className="dashboard-left">
              {activeCategory === 'dos' ? (
                <DoFormDesktop onAddDo={handleAddDo} />
              ) : (
                <>
                  <StatsSection todos={filteredStatsTodos} />
                  
                  {/* Show static form on BIG SCREEN only */}
                  {!isMobile && (
                    <TodoForm
                      categories={categories}
                      activeCategory={activeCategory}
                      onAddTodo={handleAddTodo}
                      editingTodo={editingTodo}
                      onUpdateTodo={handleUpdateTodo}
                      onCancelEdit={() => setEditingTodo(null)}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Core todo items container list / Do's Timeline */}
          {activeCategory === 'dos' ? (
            <DoList
              dos={filteredDos}
              onAddDo={handleAddDo}
              onDeleteDo={handleDeleteDo}
              isMobile={isMobile}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          ) : (
            <TodoList
              todos={todos}
              categories={categories}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onEdit={(todo) => {
                setEditingTodo(todo);
                // Open modal drawer on mobile, static form handles on desktop
                if (isMobile) {
                  setIsFormOpen(true);
                }
              }}
              onToggleSubtask={handleToggleSubtask}
            />
          )}
        </div>
      </main>

      {/* popup modal form - ONLY rendered on MOBILE screens */}
      {isMobile && isFormOpen && (
        <div 
          className="modal-backdrop" 
          onClick={() => { 
            setIsFormOpen(false); 
            setEditingTodo(null); 
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <TodoForm
              categories={categories}
              activeCategory={activeCategory}
              onAddTodo={(todo) => { 
                handleAddTodo(todo); 
                setIsFormOpen(false); 
              }}
              editingTodo={editingTodo}
              onUpdateTodo={(todo) => { 
                handleUpdateTodo(todo); 
                setIsFormOpen(false); 
              }}
              onCancelEdit={() => { 
                setEditingTodo(null); 
                setIsFormOpen(false); 
              }}
            />
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) on Mobile */}
      {isMobile && user && activeCategory !== 'dos' && (
        <button 
          className="mobile-fab"
          onClick={() => setIsFormOpen(true)}
          title="Create New Task"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Toast Notification Chunky Bar System */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card toast-${toast.type} scale-in`}>
            <div className="toast-content-wrapper">
              <span className="toast-title">{toast.title}</span>
              {toast.note && <span className="toast-note">{toast.note}</span>}
            </div>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Day Manager Feature Welcome Alert Modal */}
      {showDayManagerAlert && (
        <div className="modal-backdrop" style={{ zIndex: 99999 }}>
          <div className="modal-content glass-panel scale-in" style={{ maxWidth: '400px', padding: '28px', textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div className="alert-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--logo-start), var(--logo-end))',
              color: 'white',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)'
            }}>
              <Activity size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
              Introducing Day Manager!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Track, schedule, and log exactly what you are doing throughout the day. Manage your daily timeline step-by-step with standard weekly calendars.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseAlert}
                style={{ flex: 1, padding: '10px 16px', justifyContent: 'center' }}
              >
                Later
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleViewFeature}
                style={{ flex: 1, padding: '10px 16px', justifyContent: 'center' }}
              >
                View Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Custom Installation Promotion Alert Popup */}
      {showInstallAlert && (
        <div className="modal-backdrop" style={{ zIndex: 99999 }}>
          <div className="modal-content glass-panel scale-in" style={{ maxWidth: '400px', padding: '28px', textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div className="alert-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--logo-start), var(--logo-end))',
              color: 'white',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)'
            }}>
              <Plus size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
              Add to Home Screen
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
              Install Gaga ToDo on your home screen to launch it directly like a native mobile app!
            </p>
            
            {/* Don't show this again checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '22px', userSelect: 'none' }}>
              <input 
                id="dont-show-install-checkbox"
                type="checkbox"
                checked={dontShowInstallAgain}
                onChange={(e) => setDontShowInstallAgain(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="dont-show-install-checkbox" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Don't show this again
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleLaterInstall}
                style={{ flex: 1, padding: '10px 16px', justifyContent: 'center' }}
              >
                Later
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleInstallApp}
                style={{ flex: 1, padding: '10px 16px', justifyContent: 'center' }}
              >
                Add App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS / Safari Share Walkthrough Instruction Overlay */}
      {showIosInstallInstructions && (
        <div className="modal-backdrop" style={{ zIndex: 100000 }} onClick={() => setShowIosInstallInstructions(false)}>
          <div className="modal-content glass-panel scale-in" style={{ maxWidth: '400px', padding: '28px', textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
              How to Install on iPhone
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', textAlign: 'left' }}>
              Since Chrome native installation is limited on iOS, follow these simple Safari browser steps:
            </p>
            <ol style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'left', paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Open this website in the <strong>Safari</strong> browser.</li>
              <li>Tap the <strong>Share</strong> button at the bottom of the screen (the square icon with an upward arrow).</li>
              <li>Scroll down the list and select <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top-right corner to install!</li>
            </ol>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setShowIosInstallInstructions(false);
                if (dontShowInstallAgain) {
                  localStorage.setItem('gaga_pwa_install_never_show', 'true');
                }
                setShowInstallAlert(false);
              }}
              style={{ width: '100%', padding: '10px 16px', justifyContent: 'center' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- DESKTOP LOG DAILY FORM ----------------
function DoFormDesktop({ onAddDo }) {
  const [time, setTime] = useState('');
  const [text, setText] = useState('');

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hourStr = String(hours).padStart(2, '0');
    return `${hourStr}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    setTime(getCurrentTime());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!time.trim() || !text.trim()) return;
    onAddDo(time.trim(), text.trim());
    setText('');
    setTime(getCurrentTime());
  };

  return (
    <div className="glass-panel todo-form-card fade-in">
      <h3 className="todo-form-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} style={{ color: 'var(--primary)' }} />
        <span>Log Daily Activity</span>
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label htmlFor="do-time" style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600 }}>Time</label>
          <input
            id="do-time"
            type="text"
            className="form-input"
            placeholder="e.g. 04:21 PM"
            value={time}
            readOnly
            required
            style={{ width: '100%', cursor: 'default' }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="do-text" style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600 }}>Activity description</label>
          <input
            id="do-text"
            type="text"
            className="form-input"
            placeholder="What did you do?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px 16px', justifyContent: 'center' }}>
          <Plus size={16} />
          <span>Add Log</span>
        </button>
      </form>
    </div>
  );
}
