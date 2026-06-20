import React from 'react';
import { Search, Sun, Moon, Menu } from 'lucide-react';

export default function DashboardHeader({
  activeCategory,
  categories,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  theme,
  toggleTheme,
  setIsMobileOpen
}) {
  
  // Resolve Workspace/Category Header Name
  const getHeaderTitle = () => {
    if (activeCategory === 'all') return 'All Tasks';
    if (activeCategory === 'today') return "Today's Agenda";
    if (activeCategory === 'scheduled') return 'Scheduled Focus';
    if (activeCategory === 'important') return 'Important Priority';
    
    const cat = categories.find(c => c.id === activeCategory);
    return cat ? `${cat.name} Workspace` : 'Workspace';
  };

  const getHeaderColor = () => {
    if (activeCategory === 'all') return 'var(--primary)';
    if (activeCategory === 'today') return 'var(--success)';
    if (activeCategory === 'scheduled') return 'var(--info)';
    if (activeCategory === 'important') return 'var(--danger)';

    const cat = categories.find(c => c.id === activeCategory);
    return cat ? cat.color : 'var(--primary)';
  };

  const getHeaderSub = () => {
    if (activeCategory === 'all') return 'A full birds-eye view of your tasks.';
    if (activeCategory === 'today') return 'Tasks scheduled for completion today.';
    if (activeCategory === 'scheduled') return 'Upcoming events and deadlines.';
    if (activeCategory === 'important') return 'Highly critical items needing immediate attention.';
    
    return 'Manage project items and checklist goals.';
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn-icon mobile-nav-toggle"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={20} />
        </button>
        <div className="header-welcome">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span 
              className="category-dot" 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: getHeaderColor(),
                boxShadow: `0 0 10px ${getHeaderColor()}`
              }} 
            />
            {getHeaderTitle()}
          </h2>
          <p>{getHeaderSub()}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Real-time search bar */}
        <div className="search-bar">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Theme Toggler */}
        <button 
          className="btn-icon" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
