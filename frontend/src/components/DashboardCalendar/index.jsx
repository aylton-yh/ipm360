import React, { useMemo } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './DashboardCalendar.module.css';

const DashboardCalendar = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    
    // Dias vazios no início (mês anterior)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, current: false });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        current: i === currentDay 
      });
    }
    
    return days;
  }, [currentMonth, currentYear, currentDay]);

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarHeader}>
        <div className={styles.monthInfo}>
          <FaCalendarAlt className={styles.calendarIcon} />
          <div>
            <h3>{monthNames[currentMonth]}</h3>
            <span>{currentYear}</span>
          </div>
        </div>
        <div className={styles.navBtns}>
           <span>Hoje: {currentDay}/{currentMonth + 1}</span>
        </div>
      </div>

      <div className={styles.weekDaysGrid}>
        {weekDays.map(day => (
          <span key={day} className={styles.weekDay}>{day}</span>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {calendarData.map((item, index) => (
          <div 
            key={index} 
            className={`
              ${styles.dayCell} 
              ${item.day === null ? styles.emptyCell : ''} 
              ${item.current ? styles.currentDay : ''}
            `}
          >
            {item.day}
          </div>
        ))}
      </div>

      <div className={styles.calendarFooter}>
         <div className={styles.statusDot}></div>
         <p>Sistema Operacional • Sincronizado</p>
      </div>
    </div>
  );
};

export default DashboardCalendar;
