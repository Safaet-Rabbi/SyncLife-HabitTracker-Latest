import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CalendarView = ({ habits, completions }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Adjust logic to get a 6-week grid or just month days
    // Logic: similar to script.js
    
    const changeMonth = (offset) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const getDayData = (day) => {
        const dStr = new Date(year, month, day).toISOString().split('T')[0];
        // Calculate completion percentage for this day
        // Find habits active on this day (simplified: all active habits)
        // Check completions
        
        // Simplified: percentage of ALL habits completed
        if (habits.length === 0) return 0;

        const dayOfWeek = new Date(year, month, day).getDay();
        const activeHabits = habits.filter(h => {
             if (h.frequency === 'daily') return true;
             if (h.frequency === 'weekly') return dayOfWeek === 1;
             if (h.frequency === 'custom') return h.customDays?.includes(dayOfWeek);
             return false;
        });

        if (activeHabits.length === 0) return 0;

        const completedCount = activeHabits.filter(h => 
            completions.some(c => c.habitId === h._id && c.date === dStr && c.completed)
        ).length;

        return (completedCount / activeHabits.length) * 100;
    };

    const renderCalendarGrid = () => {
        const days = [];
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day other-month"></div>);
        }
        
        // Days of month
        for (let i = 1; i <= daysInMonth; i++) {
            const percentage = getDayData(i);
            const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
            
            days.push(
                <div key={i} className={`calendar-day ${isToday ? 'today' : ''} ${percentage > 0 ? 'has-progress' : ''}`}>
                    <div className="calendar-day-number">{i}</div>
                    <div className="calendar-progress">
                        <div className="calendar-progress-bar" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="tab-content active">
             <div className="calendar-header">
                <button onClick={() => changeMonth(-1)}><FaChevronLeft /></button>
                <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)}><FaChevronRight /></button>
            </div>
            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="calendar-day header">{d}</div>
                ))}
                {renderCalendarGrid()}
            </div>
        </div>
    );
};

export default CalendarView;