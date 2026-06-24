import React, { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Activity, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // weekEndDate represents the date of the 7th day shown in the weekly strip
  const [weekEndDate, setWeekEndDate] = useState(selectedDate || todayStr);

  const activeDayRef = useRef(null);

  // Helper to add/subtract days from a date string (YYYY-MM-DD)
  const addDays = (dateStr, offset) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Sync weekEndDate when selectedDate changes (e.g. via calendar date picker)
  useEffect(() => {
    if (selectedDate) {
      setWeekEndDate(selectedDate);
    }
  }, [selectedDate]);

  // Helper to get current time formatted as HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Pre-fill time with current time on mount
  useEffect(() => {
    setTime(getCurrentTime());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!time.trim() || !text.trim()) return;

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

  // Weekly Navigation Handlers
  const handlePrevWeek = () => {
    const newEnd = addDays(weekEndDate, -7);
    setWeekEndDate(newEnd);
    setSelectedDate(newEnd);
  };

  const handleNextWeek = () => {
    let newEnd = addDays(weekEndDate, 7);
    if (newEnd > todayStr) {
      newEnd = todayStr;
    }
    setWeekEndDate(newEnd);
    setSelectedDate(newEnd);
  };

  const handleDateChange = (dateVal) => {
    if (!dateVal) return;
    if (dateVal > todayStr) return; // Prevent future dates
    setSelectedDate(dateVal);
  };

  const isAtLatestWeek = weekEndDate >= todayStr;

  // Generate 7 days array ending at weekEndDate
  const daysArray = [];
  for (let i = -6; i <= 0; i++) {
    daysArray.push(addDays(weekEndDate, i));
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
        ref={isActive ? activeDayRef : null}
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
      {/* If mobile, render the form at the top of the timeline */}
      {isMobile && (
        <div className="glass-panel do-form-card mobile-do-form" style={{ marginBottom: '20px', padding: '16px' }}>
          <h4 className="todo-form-title" style={{ marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            <span>Log Daily Activity</span>
          </h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Time"
                value={time}
                readOnly
                required
                style={{ cursor: 'default' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="What did you do?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', justifyContent: 'center' }}>
              <Plus size={16} />
              <span>Add Log</span>
            </button>
          </form>
        </div>
      )}

      {/* Date Selector Weekly Navigation Strip */}
      <div className="do-date-selector">
        <div className="do-month-nav" style={{ justifyContent: 'center', marginBottom: '8px' }}>
          <div className="do-month-label-wrapper">
            <span>{getMonthYearLabel(selectedDate)}</span>
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
        </div>

        <div className="do-week-strip-container">
          <button 
            className="do-month-nav-btn" 
            onClick={handlePrevWeek}
            title="Previous 7 Days"
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
            title="Next 7 Days"
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Timeline view */}
      <div className="dashboard-right-header" style={{ marginBottom: '16px' }}>
        <h3 className="onboarding-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={22} style={{ color: 'var(--primary)' }} />
          <span>Daily Do's Timeline</span>
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
