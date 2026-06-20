import React, { useState } from 'react';
import TodoItem from './TodoItem';
import { Inbox, CheckCircle2 } from 'lucide-react';

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
                : 'Get started by creating a new task on the left!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
