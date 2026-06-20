import React from 'react';
import { ClipboardList, Clock, CheckCircle2, Award } from 'lucide-react';

export default function StatsSection({ todos }) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="quick-stats fade-in">
      {/* Total Tasks */}
      <div className="glass-panel stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
          <ClipboardList size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="glass-panel stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
          <Clock size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="glass-panel stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
          <CheckCircle2 size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="glass-panel stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
          <Award size={22} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{rate}%</span>
          <span className="stat-label">Complete Rate</span>
        </div>
      </div>
    </section>
  );
}
