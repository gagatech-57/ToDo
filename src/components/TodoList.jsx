import React, { useState } from 'react';
import TodoItem from './TodoItem';
import { Inbox, CheckCircle2, Briefcase, User, ShoppingBag, Heart, ChevronLeft, ChevronRight, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

export default function TodoList({
  todos,
  categories,
  activeCategory,
  searchQuery,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleSubtask,
  selectedDate,
  setSelectedDate
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, dueDate, priority
  const [isCollapsed, setIsCollapsed] = useState(true); // collapsed by default

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Helper to find the Sunday of the week containing a date
  const getStartOfWeek = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayNum}`;
  };

  // Helper to add/subtract days from a date string (YYYY-MM-DD)
  const addDays = (dateStr, offset) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayNum}`;
  };

  // Get month name and year label for YYYY-MM-DD
  const getMonthYearLabel = (dateStr) => {
    if (!dateStr) return '';
    const [y, m] = dateStr.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };

  // Weekly Navigation Handlers (navigating by exactly 1 week)
  const handlePrevWeek = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    let newDate = addDays(selectedDate, 7);
    if (newDate > todayStr) newDate = todayStr;
    setSelectedDate(newDate);
  };

  const handleDateChange = (dateVal) => {
    if (!dateVal) return;
    if (dateVal > todayStr) return;
    setSelectedDate(dateVal);
  };

  // Right chevron boundary check
  const viewedWeekStart = getStartOfWeek(selectedDate || todayStr);
  const currentWeekStart = getStartOfWeek(todayStr);
  const isAtLatestWeek = viewedWeekStart >= currentWeekStart;

  // Generate 7 days array (Sunday to Saturday) containing the selectedDate
  const weekStart = getStartOfWeek(selectedDate || todayStr);
  const daysArray = [];
  for (let i = 0; i < 7; i++) {
    daysArray.push(addDays(weekStart, i));
  }

  const dayElements = daysArray.map((dStr) => {
    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const isFuture = dStr > todayStr;
    const isActive = selectedDate === dStr;
    const isToday = dStr === todayStr;

    return (
      <button
        key={dStr}
        className={`do-day-item ${isActive ? 'active' : ''} ${isFuture ? 'disabled' : ''}`}
        onClick={() => !isFuture && setSelectedDate(dStr)}
        disabled={isFuture}
        type="button"
      >
        <span className="do-day-weekday">{weekday}</span>
        <span className="do-day-number">{d}</span>
        {isToday && <span className="do-day-today-dot" />}
      </button>
    );
  });

  // 1. Category/List Filtering + day-wise filter
  const filterByCategory = (list) => {
    let baseList = list;
    if (activeCategory === 'today') {
      baseList = list.filter(t => t.dueDate === todayStr);
    } else if (activeCategory === 'scheduled') {
      baseList = list.filter(t => t.dueDate);
    } else if (activeCategory === 'important') {
      baseList = list.filter(t => t.priority === 'high');
    } else if (activeCategory !== 'all') {
      baseList = list.filter(t => t.categoryId === activeCategory);
    }
    // Filter tasks by selected day
    return baseList.filter(t => t.dueDate === selectedDate);
  };

  // 2. Status Tab Filtering
  const filterByStatus = (list) => {
    if (statusFilter === 'active') return list.filter(t => !t.completed);
    if (statusFilter === 'completed') return list.filter(t => t.completed);
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
    const copy = [...list];
    if (sortBy === 'newest') {
      return copy.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    if (sortBy === 'dueDate') {
      return copy.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }
    if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return copy.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    }
    return copy;
  };

  // Run the pipelined filters
  const filteredTodos = sortTasks(
    filterBySearch(
      filterByStatus(
        filterByCategory(todos)
      )
    )
  );

  const isViewingToday = selectedDate === todayStr;

  return (
    <div className="dashboard-right">
      {/* Date Selector Weekly Navigation Strip */}
      <div className={`do-date-selector ${isCollapsed ? 'collapsed' : ''}`} style={{ marginBottom: '16px' }}>
        <div className="do-month-nav">
          <div className="do-month-label-wrapper">
            <span>{getMonthYearLabel(selectedDate || todayStr)}</span>
            <div className="do-calendar-picker-wrapper" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button className="do-calendar-btn" title="Pick Date" type="button">
                <Calendar size={15} />
                <input
                  type="date"
                  className="do-calendar-input"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </button>
            </div>
          </div>

          <button
            className="do-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Show Days' : 'Hide Days'}
            type="button"
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="do-week-strip-container fade-in">
            <button
              className="do-month-nav-btn"
              onClick={handlePrevWeek}
              title="Previous Week"
              type="button"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="do-days-strip">
              {dayElements}
            </div>

            <button
              className="do-month-nav-btn"
              onClick={handleNextWeek}
              disabled={isAtLatestWeek}
              style={{ opacity: isAtLatestWeek ? 0.25 : 1, cursor: isAtLatestWeek ? 'not-allowed' : 'pointer' }}
              title="Next Week"
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Past Day Notice Banner — shown when not viewing today */}
      {!isViewingToday && (
        <div className="past-day-notice fade-in">
          <span>📅 Viewing a past day — new tasks can only be added on today</span>
        </div>
      )}

      {/* Filters and sorting row */}
      <div className="list-filters">
        <div className="filter-tabs">
          <button className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
          <button className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>Active</button>
          <button className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`} onClick={() => setStatusFilter('completed')}>Completed</button>
        </div>

        <div className="sort-select-wrapper">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by:</span>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
            <h3 className="onboarding-title">Welcome to Gaga ToDo!</h3>
            <p className="onboarding-sub">Get started by exploring your pre-configured workspaces:</p>
            <div className="onboarding-grid">
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #6366f1' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Briefcase size={16} /></div>
                  <span className="onboarding-badge" style={{ color: '#6366f1' }}>Work</span>
                </div>
                <p>Manage professional tasks, design deliverables, development milestones, and project deadlines.</p>
              </div>
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><User size={16} /></div>
                  <span className="onboarding-badge" style={{ color: '#10b981' }}>Personal</span>
                </div>
                <p>Track personal lifestyle goals, daily tasks, reminders, chores, and personal habits.</p>
              </div>
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><ShoppingBag size={16} /></div>
                  <span className="onboarding-badge" style={{ color: '#f59e0b' }}>Shopping</span>
                </div>
                <p>Log store shopping items, wishlists, groceries, and gift ideas in one place.</p>
              </div>
              <div className="onboarding-card glass-panel" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="onboarding-card-header">
                  <div className="onboarding-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Heart size={16} /></div>
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
            <h3>{statusFilter === 'completed' ? 'No completed tasks' : 'No tasks here'}</h3>
            <p>{statusFilter === 'completed' ? 'Tasks you complete will show up here.' : 'No tasks match your filter. Try adding a task!'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
