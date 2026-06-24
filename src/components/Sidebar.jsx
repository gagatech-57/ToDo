import React, { useState } from 'react';
import { CheckSquare, Inbox, Calendar, AlertCircle, Plus, X, Folder, BarChart2 } from 'lucide-react';

const PRESETS_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#8b5cf6', // Violet
  '#0ea5e9', // Sky
];

export default function Sidebar({
  categories,
  activeCategory,
  setActiveCategory,
  todos,
  onAddCategory,
  isMobileOpen,
  setIsMobileOpen,
  dos = []
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESETS_COLORS[0]);

  // Calculate todo counts for main system lists
  const getSystemListCount = (type) => {
    switch (type) {
      case 'all':
        return todos.length;
      case 'today':
        const todayStr = new Date().toISOString().split('T')[0];
        return todos.filter(t => t.dueDate === todayStr && !t.completed).length;
      case 'scheduled':
        return todos.filter(t => t.dueDate && !t.completed).length;
      case 'important':
        return todos.filter(t => t.priority === 'high' && !t.completed).length;
      default:
        return 0;
    }
  };

  // Calculate count for specific category
  const getCategoryCount = (catId) => {
    return todos.filter(t => t.categoryId === catId && !t.completed).length;
  };

  // Handle category creation
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      color: selectedColor
    });
    setNewCatName('');
    setIsAdding(false);
  };

  return (
    <>
      {/* Sidebar mobile overlay backdrop */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <span className="sidebar-logo-text">
            <span className="logo-gaga">Gaga</span>
            <span className="logo-todo">ToDo</span>
          </span>
          <button 
            className="btn-icon mobile-nav-toggle" 
            style={{ marginLeft: 'auto', border: 'none' }}
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* System Lists Section */}
        <div className="sidebar-nav-title">Smart Filters</div>
        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('all');
              setIsMobileOpen(false);
            }}
          >
            <div className="sidebar-item-left">
              <Inbox size={18} />
              <span>All Tasks</span>
            </div>
            <span className="sidebar-item-count">{getSystemListCount('all')}</span>
          </li>
          
          <li 
            className={`sidebar-item ${activeCategory === 'today' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('today');
              setIsMobileOpen(false);
            }}
          >
            <div className="sidebar-item-left">
              <Calendar size={18} />
              <span>Today</span>
            </div>
            <span className="sidebar-item-count">{getSystemListCount('today')}</span>
          </li>

          <li 
            className={`sidebar-item ${activeCategory === 'scheduled' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('scheduled');
              setIsMobileOpen(false);
            }}
          >
            <div className="sidebar-item-left">
              <Calendar size={18} style={{ opacity: 0.7 }} />
              <span>Scheduled</span>
            </div>
            <span className="sidebar-item-count">{getSystemListCount('scheduled')}</span>
          </li>

          <li 
            className={`sidebar-item ${activeCategory === 'important' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('important');
              setIsMobileOpen(false);
            }}
          >
            <div className="sidebar-item-left">
              <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
              <span>Important</span>
            </div>
            <span className="sidebar-item-count">{getSystemListCount('important')}</span>
          </li>

          <li 
            className={`sidebar-item ${activeCategory === 'dos' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('dos');
              setIsMobileOpen(false);
            }}
          >
            <div className="sidebar-item-left">
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
              <span>Do's</span>
            </div>
            <span className="sidebar-item-count">{dos.length}</span>
          </li>
        </ul>

        {/* Categories Section */}
        <div className="sidebar-nav-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Categories</span>
        </div>
        <ul className="sidebar-menu custom-scroll" style={{ maxHeight: 'calc(100vh - 420px)', marginBottom: '16px' }}>
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`sidebar-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setIsMobileOpen(false);
              }}
            >
              <div className="sidebar-item-left">
                <span className="category-dot" style={{ backgroundColor: cat.color }} />
                <span>{cat.name}</span>
              </div>
              <span className="sidebar-item-count">{getCategoryCount(cat.id)}</span>
            </li>
          ))}
        </ul>

        {/* Category Add Trigger & Form */}
        <div className="add-category-box">
          {!isAdding ? (
            <div className="add-category-trigger" onClick={() => setIsAdding(true)}>
              <Plus size={16} />
              <span>New Category</span>
            </div>
          ) : (
            <form onSubmit={handleCreateCategory} className="fade-in">
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Category Name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  maxLength={18}
                  autoFocus
                  required
                />
              </div>

              {/* Color dots options */}
              <div className="category-form-colors">
                {PRESETS_COLORS.map(color => (
                  <span
                    key={color}
                    className={`color-dot-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
                >
                  Create
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
