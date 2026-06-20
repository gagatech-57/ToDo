import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import StatsSection from './components/StatsSection';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import useLocalStorage from './hooks/useLocalStorage';

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
  const [todos, setTodos] = useLocalStorage('aether_todos', []);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [theme, setTheme] = useLocalStorage('aether_theme', 'dark');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initialize mock data only if todos is empty on first load
  useEffect(() => {
    if (todos.length === 0) {
      const mockTodos = [
        {
          id: 'mock-1',
          title: 'Design Aether Dashboard UX',
          description: 'Refine core components, frosted glass blur ratios, and color palette tokens.',
          categoryId: 'cat-work',
          priority: 'high',
          dueDate: getRelativeDate(0), // Today
          completed: false,
          createdAt: Date.now() - 3600000 * 2, // 2 hrs ago
          subtasks: [
            { id: 'sub-1-1', text: 'Define HSL variable values', completed: true },
            { id: 'sub-1-2', text: 'Design sidebar navigation elements', completed: false }
          ]
        },
        {
          id: 'mock-2',
          title: 'Morning Cardio Routine',
          description: 'Complete a 5km outdoor run at the park.',
          categoryId: 'cat-health',
          priority: 'medium',
          dueDate: getRelativeDate(-1), // Yesterday (will show overdue!)
          completed: false,
          createdAt: Date.now() - 3600000 * 24, // 24 hrs ago
          subtasks: []
        },
        {
          id: 'mock-3',
          title: 'Weekly grocery restock',
          description: 'Buy vegetables, almond milk, and coffee beans.',
          categoryId: 'cat-shopping',
          priority: 'low',
          dueDate: getRelativeDate(1), // Tomorrow
          completed: false,
          createdAt: Date.now() - 3600000 * 12, // 12 hrs ago
          subtasks: []
        },
        {
          id: 'mock-4',
          title: 'Setup React Project Directory',
          description: 'Scaffold application structure using Vite template.',
          categoryId: 'cat-work',
          priority: 'high',
          dueDate: getRelativeDate(-2),
          completed: true,
          createdAt: Date.now() - 3600000 * 48,
          subtasks: []
        }
      ];
      setTodos(mockTodos);
    }
  }, []);

  // Sync theme with DOM root node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Add Task
  const handleAddTodo = (todoData) => {
    const newTodo = {
      ...todoData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now()
    };
    setTodos([newTodo, ...todos]);
  };

  // Update Task
  const handleUpdateTodo = (updatedTodo) => {
    setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
    setEditingTodo(null);
  };

  // Delete Task
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
    if (editingTodo && editingTodo.id === id) {
      setEditingTodo(null);
    }
  };

  // Toggle Complete Task
  const handleToggleComplete = (id) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          // When completing task, complete all subtasks too for UX convenience
          subtasks: t.subtasks.map(s => ({ ...s, completed: !t.completed }))
        };
      }
      return t;
    }));
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(t => {
      if (t.id === todoId) {
        const updatedSubtasks = t.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        
        // If all subtasks are complete, should we complete the main task?
        // Let's keep them separate, but check if user wants to toggle them individually.
        return {
          ...t,
          subtasks: updatedSubtasks
        };
      }
      return t;
    }));
  };

  // Create Custom Category
  const handleAddCategory = (catData) => {
    const newCat = {
      ...catData,
      id: `cat-${crypto.randomUUID()}`
    };
    setCategories([...categories, newCat]);
  };

  // Filter todos corresponding to current active category/folder view for the stats calculation
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
        />

        <div className="dashboard-grid custom-scroll">
          {/* Form and Stats sidebar */}
          <div className="dashboard-left">
            <StatsSection todos={filteredStatsTodos} />
            <TodoForm
              categories={categories}
              activeCategory={activeCategory}
              onAddTodo={handleAddTodo}
              editingTodo={editingTodo}
              onUpdateTodo={handleUpdateTodo}
              onCancelEdit={() => setEditingTodo(null)}
            />
          </div>

          {/* Core todo items container list */}
          <TodoList
            todos={todos}
            categories={categories}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTodo}
            onEdit={setEditingTodo}
            onToggleSubtask={handleToggleSubtask}
          />
        </div>
      </main>
    </div>
  );
}
