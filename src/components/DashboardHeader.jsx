import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, Plus, LogOut } from 'lucide-react';

export default function DashboardHeader({
  activeCategory,
  categories,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  setIsMobileOpen,
  onOpenForm,
  user,
  onLogout,
  isMobile
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Resolve Workspace/Category Header Name
  const getHeaderTitle = () => {
    if (activeCategory === 'all') return 'All Tasks';
    if (activeCategory === 'today') return "Today's Agenda";
    if (activeCategory === 'scheduled') return 'Scheduled Focus';
    if (activeCategory === 'important') return 'Important Priority';
    if (activeCategory === 'dos') return "Day Manager";
    
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

      {/* Right section: Profile avatar in last */}
      <div className="header-right">

        {/* User Profile Avatar with Dropdown */}
        {user && (
          <div className="header-profile-container" ref={dropdownRef}>
            <button 
              className="header-profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              title="View profile options"
            >
              <span className="profile-avatar header-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </button>

            {showDropdown && (
              <div className="profile-dropdown glass-panel scale-in">
                {/* Profile header/details inside dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="profile-avatar" style={{ width: '40px', height: '40px', fontSize: '1.1rem', flexShrink: 0 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                {/* Logout option button */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className="profile-dropdown-item logout-item"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
