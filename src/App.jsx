import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsSection from './components/StatsSection';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Auth from './components/Auth';
import useLocalStorage from './hooks/useLocalStorage';
import { Plus } from 'lucide-react';

const API_BASE = 'https://gagaflow.onrender.com/api';

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
  const [theme, setTheme] = useLocalStorage('aether_theme', 'dark');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

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

  // Sync theme with DOM root node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-open modal form on mobile when editing is triggered
  useEffect(() => {
    if (editingTodo && isMobile) {
      setIsFormOpen(true);
    }
  }, [editingTodo, isMobile]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
        theme={theme} 
        toggleTheme={toggleTheme} 
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
      />

      {/* Main Task View Dashboard */}
      <main className="main-workspace">
        <DashboardHeader
          activeCategory={activeCategory}
          categories={categories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
          setIsMobileOpen={setIsMobileOpen}
          onOpenForm={() => setIsFormOpen(true)}
          user={user}
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        <div className="dashboard-grid">
          {/* Form and Stats sidebar */}
          <div className="dashboard-left">
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
          </div>

          {/* Core todo items container list */}
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
      {isMobile && user && (
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
    </div>
  );
}
