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
            
            // If new user and has no tasks, seed mock data in MongoDB
            if (data.length === 0) {
              const mockData = [
                {
                  title: 'Design GAGA Flow Dashboard UX',
                  description: 'Refine core components, frosted glass blur ratios, and color palette tokens.',
                  categoryId: 'cat-work',
                  priority: 'high',
                  dueDate: getRelativeDate(0),
                  subtasks: [
                    { id: 'sub-1-1', text: 'Define HSL variable values', completed: true },
                    { id: 'sub-1-2', text: 'Design sidebar navigation elements', completed: false }
                  ]
                },
                {
                  title: 'Morning Cardio Routine',
                  description: 'Complete a 5km outdoor run at the park.',
                  categoryId: 'cat-health',
                  priority: 'medium',
                  dueDate: getRelativeDate(-1), // Yesterday (overdue)
                  subtasks: []
                },
                {
                  title: 'Weekly grocery restock',
                  description: 'Buy vegetables, almond milk, and coffee beans.',
                  categoryId: 'cat-shopping',
                  priority: 'low',
                  dueDate: getRelativeDate(1), // Tomorrow
                  subtasks: []
                }
              ];

              const seededTodos = [];
              for (const task of mockData) {
                const res = await fetch(`${API_BASE}/todos`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                  },
                  body: JSON.stringify(task)
                });
                if (res.ok) {
                  const savedDoc = await res.json();
                  seededTodos.push({ ...savedDoc, id: savedDoc._id });
                }
              }
              setTodos(seededTodos);
            } else {
              // Map DB _id to id key for frontend render compatibility
              const formatted = data.map(todo => ({ ...todo, id: todo._id }));
              setTodos(formatted);
            }
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
      }
    } catch (err) {
      console.error('Error adding task:', err);
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
      }
    } catch (err) {
      console.error('Error updating task:', err);
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
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Toggle Complete Task in DB
  const handleToggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id || t._id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;
    const newSubtasks = todo.subtasks.map(s => ({ ...s, completed: newCompleted }));

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: newCompleted, subtasks: newSubtasks })
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = { ...data, id: data._id };
        setTodos(todos.map(t => (t.id === id || t._id === id) ? formatted : t));
      }
    } catch (err) {
      console.error('Error toggling complete:', err);
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
    return <Auth onLogin={setUser} theme={theme} toggleTheme={toggleTheme} />;
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

        <div className="dashboard-grid custom-scroll">
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
    </div>
  );
}
