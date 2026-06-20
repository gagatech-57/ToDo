import React, { useState } from 'react';
import { Calendar, Edit3, Trash2, ChevronDown, ChevronUp, Tag } from 'lucide-react';

export default function TodoItem({
  todo,
  categories,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleSubtask
}) {
  const [expanded, setExpanded] = useState(false);

  // Look up category metadata
  const category = categories.find(c => c.id === todo.categoryId);

  // Check if task is overdue
  const checkOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    
    // Set due date to end of that day local time
    const dueTime = new Date(todo.dueDate + 'T23:59:59').getTime();
    const nowTime = new Date().getTime();
    
    return dueTime < nowTime;
  };

  const isOverdue = checkOverdue();

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate subtask stats
  const totalSubtasks = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Resolve priority colors
  const getPriorityColor = () => {
    if (todo.priority === 'high') return 'var(--danger)';
    if (todo.priority === 'medium') return 'var(--warning)';
    return 'var(--primary)';
  };

  return (
    <div 
      className={`todo-card fade-in ${todo.completed ? 'completed' : ''}`}
      style={{ '--todo-priority-color': getPriorityColor() }}
    >
      <div className="todo-card-main">
        {/* Checkbox */}
        <label className="checkbox-container">
          <input 
            type="checkbox" 
            checked={todo.completed} 
            onChange={() => onToggleComplete(todo.id)} 
          />
          <span className="checkmark"></span>
        </label>

        {/* Content Details */}
        <div className="todo-content">
          <h4 className="todo-title">{todo.title}</h4>
          
          {todo.description && (
            <p className="todo-desc">{todo.description}</p>
          )}

          <div className="todo-meta">
            {/* Priority Tag */}
            <span className={`priority-tag ${todo.priority}`}>
              {todo.priority}
            </span>

            {/* Category Tag */}
            {category && (
              <span 
                className="todo-meta-item" 
                style={{ 
                  backgroundColor: 'var(--border-color)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
              >
                <span 
                  className="category-dot" 
                  style={{ backgroundColor: category.color, width: '6px', height: '6px', marginRight: '6px' }} 
                />
                {category.name}
              </span>
            )}

            {/* Due Date */}
            {todo.dueDate && (
              <span className={`todo-meta-item ${isOverdue ? 'overdue' : ''}`}>
                <Calendar size={12} />
                <span>
                  {isOverdue ? 'Overdue: ' : ''}
                  {formatDate(todo.dueDate)}
                </span>
              </span>
            )}

            {/* Subtask Tracker badge */}
            {totalSubtasks > 0 && (
              <span className="todo-meta-item" style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => setExpanded(!expanded)}>
                <Tag size={12} />
                <span>{completedSubtasks}/{totalSubtasks} steps</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions panel */}
        <div className="todo-actions">
          {totalSubtasks > 0 && (
            <button 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', border: 'none' }}
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse Checklist' : 'Expand Checklist'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          
          <button 
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none' }}
            onClick={() => onEdit(todo)}
            title="Edit Task"
          >
            <Edit3 size={16} />
          </button>

          <button 
            className="btn-icon" 
            style={{ width: '28px', height: '28px', border: 'none', color: 'var(--danger)' }}
            onClick={() => onDelete(todo.id)}
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Subtasks Panel */}
      {totalSubtasks > 0 && expanded && (
        <div className="todo-subtasks-section fade-in">
          {/* Progress bar info */}
          <div className="subtask-progress-wrapper">
            <span>Progress: {percentComplete}%</span>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${percentComplete}%` }} />
            </div>
          </div>

          {/* Subtasks rendering list */}
          {todo.subtasks.map(sub => (
            <div 
              key={sub.id} 
              className={`todo-subtask-item ${sub.completed ? 'completed' : ''}`}
            >
              <span 
                className="checkmark-small"
                onClick={() => onToggleSubtask(todo.id, sub.id)}
              />
              <span 
                style={{ cursor: 'pointer' }}
                onClick={() => onToggleSubtask(todo.id, sub.id)}
              >
                {sub.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
