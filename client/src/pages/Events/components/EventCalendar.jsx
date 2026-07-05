import { useState } from "react";
import styles from "./EventCalendar.module.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function EventCalendar({ events, selectedDate, onSelectDate }) {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const prevMonth = () => {
    setCurrent((c) => {
      const m = c.month === 0 ? 11 : c.month - 1;
      const y = c.month === 0 ? c.year - 1 : c.year;
      return { month: m, year: y };
    });
  };

  const nextMonth = () => {
    setCurrent((c) => {
      const m = c.month === 11 ? 0 : c.month + 1;
      const y = c.month === 11 ? c.year + 1 : c.year;
      return { month: m, year: y };
    });
  };

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const daysInPrev = new Date(current.year, current.month, 0).getDate();

  const eventDates = events.map((e) => new Date(e.date).toDateString());

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth}>‹</button>
        <span className={styles.monthLabel}>
          {MONTHS[current.month]} {current.year}
        </span>
        <button className={styles.navBtn} onClick={nextMonth}>›</button>
      </div>

      <div className={styles.dayNames}>
        {DAYS.map((d) => <span key={d} className={styles.dayName}>{d}</span>)}
      </div>

      <div className={styles.grid}>
        {cells.map((cell, i) => {
          const date = new Date(current.year, cell.current ? current.month : (i < firstDay ? current.month - 1 : current.month + 1), cell.day);
          const hasEvent = cell.current && eventDates.includes(date.toDateString());
          const isToday  = cell.current && date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={i}
              className={[
                styles.cell,
                !cell.current ? styles.outside : "",
                isToday    ? styles.today    : "",
                isSelected ? styles.selected : "",
                hasEvent   ? styles.hasEvent : "",
              ].join(" ")}
              onClick={() => cell.current && onSelectDate(isSelected ? null : date)}
            >
              {cell.day}
              {hasEvent && <span className={styles.dot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EventCalendar;