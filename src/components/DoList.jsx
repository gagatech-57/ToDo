import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Activity, ChevronLeft, ChevronRight, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

export default function DoList({
  dos,
  onAddDo,
  onDeleteDo,
  isMobile,
  selectedDate,
  setSelectedDate
}) {
  const [time, setTime] = useState('');
  const [text, setText] = useState('');
  const [textError, setTextError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Helper to find the Sunday of the week containing a date
  const getStartOfWeek = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    date.setDate(date.getDate() - day);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayNum}`;
  };

  // Helper to add/subtract days from a date string (YYYY-MM-DD)
  const addDays = (dateStr, offset) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayNum}`;
  };

  // Helper to get current time formatted as 12-hour AM/PM
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hourStr = String(hours).padStart(2, '0');
    return `${hourStr}:${minutes} ${ampm}`;
  };

  // Pre-fill time with current time on mount
  useEffect(() => {
    setTime(getCurrentTime());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTextError('');
    if (!text.trim()) {
      setTextError('Please describe your activity.');
      return;
    }
    if (!time.trim()) return;

    onAddDo(time.trim(), text.trim());
    setText('');
    setTime(getCurrentTime());
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
    if (newDate > todayStr) {
      newDate = todayStr;
    }
    setSelectedDate(newDate);
  };

  const handleDateChange = (dateVal) => {
    if (!dateVal) return;
    if (dateVal > todayStr) return; // Prevent future dates
    setSelectedDate(dateVal);
  };

  // Right chevron boundary check: disable if currently selected date's week is today's week
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
      </button>
    );
  });

  // Format header title date label nicely
  const getHeaderDateLabel = () => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="do-container">
      {/* If mobile, render the form at top — only when viewing today */}
      {isMobile && selectedDate === todayStr && (
        <div className="glass-panel do-form-card mobile-do-form" style={{ marginBottom: '20px', padding: '16px' }}>
          <h4 className="todo-form-title" style={{ marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            <span>Log Daily Activity</span>
          </h4>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Time"
                value={time}
                readOnly
                style={{ cursor: 'default' }}
              />
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className={`form-input ${textError ? 'input-error' : ''}`}
                  placeholder="What did you do?"
                  value={text}
                  onChange={(e) => { setText(e.target.value); if (textError) setTextError(''); }}
                />
                {textError && (
                  <div className="field-error-msg">
                    <span className="field-error-icon">!</span>
                    {textError}
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', justifyContent: 'center' }}>
              <Plus size={16} />
              <span>Add Log</span>
            </button>
          </form>
        </div>
      )}
      {/* Past day notice for Day Manager mobile */}
      {isMobile && selectedDate !== todayStr && (
        <div className="past-day-notice fade-in" style={{ marginBottom: '16px' }}>
          <span>📅 Viewing a past day — new logs can only be added on today</span>
        </div>
      )}

      {/* Date Selector Weekly Navigation Strip */}
      <div className={`do-date-selector ${isCollapsed ? 'collapsed' : ''}`}>
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
            title={isCollapsed ? "Show Days" : "Hide Days"}
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

      {/* Timeline view */}
      <div className="dashboard-right-header" style={{ marginBottom: '16px' }}>
        <h3 className="onboarding-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={22} style={{ color: 'var(--primary)' }} />
          <span>Day Manager Timeline</span>
        </h3>
        <p className="onboarding-sub" style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.8 }}>
          {getHeaderDateLabel()}
        </p>
      </div>

      <div className="do-timeline-wrapper">
        {dos.length > 0 ? (
          <div className="do-timeline">
            {dos.map((item) => (
              <div key={item.id} className="do-timeline-item fade-in">
                {/* Timeline node marker */}
                <div className="do-timeline-node">
                  <div className="do-node-dot" />
                </div>

                {/* Log card */}
                <div className="do-log-card glass-panel">
                  <div className="do-log-time-badge">
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    <span>{item.time}</span>
                  </div>
                  <div className="do-log-text">{item.text}</div>
                  <button
                    className="btn-icon delete-do-btn"
                    onClick={() => onDeleteDo(item.id)}
                    title="Delete log"
                    style={{ color: 'var(--danger)', padding: '4px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state fade-in" style={{ padding: '40px 20px' }}>
            <div className="empty-icon-wrapper" style={{ margin: '0 auto 16px' }}>
              <Clock size={28} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3>{selectedDate === todayStr ? 'No activities logged yet' : 'No dos on this day'}</h3>
            <p>{selectedDate === todayStr ? 'Use the form to start tracking what you do throughout the day!' : 'No activities were logged for this day.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
