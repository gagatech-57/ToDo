import React, { useState } from 'react';
import TodoItem from './TodoItem';
import { Inbox, CheckCircle2, Briefcase, User, ShoppingBag, Heart } from 'lucide-react';

export default function TodoList({
  todos,
  categories,
  activeCategory,
  searchQuery,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleSubtask
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, dueDate, priority

  // 1. Category/List Filtering
  const filterByCategory = (list) => {
    if (activeCategory === 'all') return list;
    
    if (activeCategory === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return list.filter(t => t.dueDate === todayStr);
    }
    
    if (activeCategory === 'scheduled') {
      return list.filter(t => t.dueDate);
    }
    
    if (activeCategory === 'important') {
      return list.filter(t => t.priority === 'high');
    }
    
    // Default: category ID filtering
    return list.filter(t => t.categoryId === activeCategory);
  };

  // 2. Status Tab Filtering (All, Active, Completed)
  const filterByStatus = (list) => {
    if (statusFilter === 'active') {
      return list.filter(t => !t.completed);
    }
    if (statusFilter === 'completed') {
      return list.filter(t => t.completed);
    }
    return list;
  };

  // 3. Search Query filtering
  const filterBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter(t => 
      t.title.toLowerCase().includes(query) || 
      (t.description && t.description.toLowerCase().includes(query))
    );
  };

  // 4. Sorting Logic
  const sortTasks = (list) => {
    const listCopy = [...list];
    
    if (sortBy === 'newest') {
      return listCopy.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    if (sortBy === 'dueDate') {
      return listCopy.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }
    
    if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return listCopy.sort((a, b) => {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });
    }
    
    return listCopy;
  };

  // Run the pipelined filters
  const filteredTodos = sortTasks(
    filterBySearch(
      filterByStatus(
        filterByCategory(todos)
      )
    )
  );

  return (
    <div className="dashboard-right">
      {/* Filters and sorting row */}
      <div className="list-filters">
        {/* Status Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>

        {/* Sort Select */}
        <div className="sort-select-wrapper">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by:</span>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Todo Cards Container */}
      <div className="todo-items-list custom-scroll">
        {filteredTodos.length > 0 ? (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              categories={categories}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleSubtask={onToggleSubtask}
            />
          ))
        ) : todos.length === 0 ? (
          <div className="onboarding-container fade-in">
            <h3 className="onboarding-title">Welcome to GAGA Flow!</h3>
            <p className="onboarding-sub">Get started by exploring your pre-configured workspaces:</p>
            <div className="onboarding-grid">
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #6366f1' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                    <Briefcase size={16} />
                  </div>
                  <span className="onboarding-badge" style={{ color: '#6366f1' }}>Work</span>
                </div>
                <p>Manage professional tasks, design deliverables, development milestones, and project deadlines.</p>
              </div>
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <User size={16} />
                  </div>
                  <span className="onboarding-badge" style={{ color: '#10b981' }}>Personal</span>
                </div>
                <p>Track personal lifestyle goals, daily tasks, reminders, chores, and personal habits.</p>
              </div>
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <ShoppingBag size={16} />
                  </div>
                  <span className="onboarding-badge" style={{ color: '#f59e0b' }}>Shopping</span>
                </div>
                <p>Log store shopping items, wishlists, groceries, and gift ideas in one place.</p>
              </div>
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Heart size={16} />
                  </div>
                  <span className="onboarding-badge" style={{ color: '#8b5cf6' }}>Health</span>
                </div>
                <p>Plan workouts, running activities, medical appointments, and healthy diet goals.</p>
              </div>
            </div>
            <p className="onboarding-footer">
              {window.innerWidth <= 768 
                ? 'Tap the floating + button in the bottom right corner to add a task!'
                : 'Click "Create New Task" on the left sidebar to add your first goal!'}
            </p>
          </div>
        ) : (
          <div className="empty-state glass-panel fade-in">
            <div className="empty-state-icon">
              {statusFilter === 'completed' ? (
                <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
              ) : (
                <Inbox size={32} />
              )}
            </div>
            <h3>
              {statusFilter === 'completed' 
                ? 'No completed tasks' 
                : 'No tasks here'}
            </h3>
            <p>
              {statusFilter === 'completed' 
                ? 'Tasks you complete will show up here.' 
                : 'No tasks match your filter. Try adding a task!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
