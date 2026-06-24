import React from 'react';
import { Search, Sun, Moon, Menu, Plus, LogOut } from 'lucide-react';

export default function DashboardHeader({
  activeCategory,
  categories,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  theme,
  toggleTheme,
  setIsMobileOpen,
  onOpenForm,
  user,
  onLogout,
  isMobile
}) {
  
  // Resolve Workspace/Category Header Name
  const getHeaderTitle = () => {
    if (activeCategory === 'all') return 'All Tasks';
    if (activeCategory === 'today') return "Today's Agenda";
    if (activeCategory === 'scheduled') return 'Scheduled Focus';
    if (activeCategory === 'important') return 'Important Priority';
    if (activeCategory === 'dos') return "Daily Do's";
    
    const cat = categories.find(c => c.id === activeCategory);
    return cat ? `${cat.name} Workspace` : 'Workspace';
  };

  const getHeaderColor = () => {
    if (activeCategory === 'all') return 'var(--primary)';
    if (activeCategory === 'today') return 'var(--success)';
    if (activeCategory === 'scheduled') return 'var(--info)';
    if (activeCategory === 'important') return 'var(--danger)';
    if (activeCategory === 'dos') return 'var(--accent-purple)';

    const cat = categories.find(c => c.id === activeCategory);
    return cat ? cat.color : 'var(--primary)';
  };

  const getHeaderSub = () => {
    if (activeCategory === 'all') return 'A full birds-eye view of your tasks.';
    if (activeCategory === 'today') return 'Tasks scheduled for completion today.';
    if (activeCategory === 'scheduled') return 'Upcoming events and deadlines.';
    if (activeCategory === 'important') return 'Highly critical items needing immediate attention.';
    if (activeCategory === 'dos') return 'Track and log what you are doing throughout the day.';
    
    return 'Manage project items and checklist goals.';
  };

  return (
    <header className="header">
      {/* Left section: Navigation toggle + Title area */}
      <div className="header-left">
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
                width: '10px', 
                height: '10px', 
                backgroundColor: getHeaderColor(),
                boxShadow: `0 0 10px ${getHeaderColor()}`
              }} 
            />
            {getHeaderTitle()}
          </h2>
          <p className="header-subtitle">{getHeaderSub()}</p>
        </div>
      </div>

      {/* Center section: Search bar */}
      <div className="header-center">
        <div className="search-bar">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            className="form-input"
            placeholder={activeCategory === 'dos' ? "Search daily logs..." : "Search tasks..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right section: Theme toggler + Profile avatar in last */}
      <div className="header-right">
        {/* Theme Toggler */}
        <button 
          className="btn-icon" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile Avatar */}
        {user && (
          <div className="header-profile" title={`Logged in as ${user.email}`}>
            <span className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="profile-name">{user.name}</span>
            <button 
              className="btn-icon profile-logout"
              onClick={onLogout}
              title="Logout"
              style={{ border: 'none', width: '28px', height: '28px', background: 'transparent' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
