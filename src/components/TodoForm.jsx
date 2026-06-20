import React, { useState, useEffect } from 'react';
import { Plus, Check, ClipboardList, X } from 'lucide-react';

export default function TodoForm({
  categories,
  activeCategory,
  onAddTodo,
  editingTodo,
  onUpdateTodo,
  onCancelEdit
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [catId, setCatId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  
  // Subtasks list state for this todo item
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskText, setSubtaskText] = useState('');

  // Prefill form when editing a todo
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || '');
      setDesc(editingTodo.description || '');
      setCatId(editingTodo.categoryId || '');
      setPriority(editingTodo.priority || 'medium');
      setDueDate(editingTodo.dueDate || '');
      setSubtasks(editingTodo.subtasks || []);
    } else {
      resetForm();
    }
  }, [editingTodo]);

  // Set default category when active workspace changes
  useEffect(() => {
    if (!editingTodo) {
      // If the current folder is a category ID, default to it, otherwise default to first category
      const isSystemList = ['all', 'today', 'scheduled', 'important'].includes(activeCategory);
      if (!isSystemList) {
        setCatId(activeCategory);
      } else if (categories.length > 0) {
        setCatId(categories[0].id);
      }
    }
  }, [activeCategory, categories, editingTodo]);

  const resetForm = () => {
    setTitle('');
    setDesc('');
    // Default to activeCategory if it's not a smart filter
    const isSystemList = ['all', 'today', 'scheduled', 'important'].includes(activeCategory);
    setCatId(isSystemList ? (categories[0]?.id || '') : activeCategory);
    setPriority('medium');
    setDueDate('');
    setSubtasks([]);
    setSubtaskText('');
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskText.trim()) return;
    
    const newSub = {
      id: crypto.randomUUID(),
      text: subtaskText.trim(),
      completed: false
    };
    
    setSubtasks([...subtasks, newSub]);
    setSubtaskText('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todoData = {
      title: title.trim(),
      description: desc.trim(),
      categoryId: catId,
      priority,
      dueDate,
      subtasks
    };

    if (editingTodo) {
      onUpdateTodo({
        ...editingTodo,
        ...todoData
      });
    } else {
      onAddTodo(todoData);
      resetForm();
    }
  };

  return (
    <div className="glass-panel todo-form-card fade-in">
      <h3 className="todo-form-title">
        <ClipboardList size={20} style={{ color: 'var(--primary)' }} />
        <span>{editingTodo ? 'Edit Task Details' : 'Create New Task'}</span>
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="todo-title">Task Title *</label>
          <input
            id="todo-title"
            type="text"
            className="form-input"
            placeholder="e.g. Design app interface"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={60}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="todo-desc">Description</label>
          <textarea
            id="todo-desc"
            className="form-input"
            placeholder="Add some details..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            style={{ resize: 'none', fontFamily: 'inherit' }}
            maxLength={250}
          />
        </div>

        {/* Category & Priority selector row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="todo-cat">Category</label>
            <select
              id="todo-cat"
              className="form-input"
              value={catId}
              onChange={(e) => setCatId(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="todo-priority">Priority</label>
            <select
              id="todo-priority"
              className="form-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label htmlFor="todo-date">Due Date</label>
          <input
            id="todo-date"
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Subtask Builder */}
        <div className="form-group">
          <label>Subtask Checklist ({subtasks.length})</label>
          
          {subtasks.length > 0 && (
            <div className="subtasks-builder-list custom-scroll">
              {subtasks.map(sub => (
                <div key={sub.id} className="subtask-builder-item">
                  <span>{sub.text}</span>
                  <button
                    type="button"
                    className="btn-icon"
                    style={{ width: '22px', height: '22px', border: 'none', color: 'var(--danger)' }}
                    onClick={() => handleRemoveSubtask(sub.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="subtask-input-row">
            <input
              type="text"
              className="form-input"
              placeholder="Add step..."
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              maxLength={80}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddSubtask}
              style={{ padding: '8px 12px' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Form buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            {editingTodo ? (
              <>
                <Check size={16} />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Add Task</span>
              </>
            )}
          </button>
          {editingTodo && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                resetForm();
                onCancelEdit();
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
