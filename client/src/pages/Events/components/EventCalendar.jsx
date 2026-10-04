import { useState } from "react";
import styles from "./EventCalendar.module.css";

const SDG_COLORS = {
  "SDG 1": "#E5243B",
  "SDG 2": "#DDA63A",
  "SDG 3": "#4C9F38",
  "SDG 4": "#C5192D",
  "SDG 5": "#FF3A21",
  "SDG 6": "#26BDE2",
  "SDG 7": "#FCC30B",
  "SDG 8": "#A21942",
  "SDG 9": "#FD6925",
  "SDG 10": "#DD1367",
  "SDG 11": "#FD9D24",
  "SDG 12": "#BF8B2E",
  "SDG 13": "#3F7E44",
  "SDG 14": "#0A97D9",
  "SDG 15": "#56C02B",
  "SDG 16": "#00689D",
  "SDG 17": "#19486A",
};

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function EventCalendar({
  events,
  selectedDate,
  onSelectDate,
}) {
  const today = new Date();

  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const prevMonth = () => {
    setCurrent((currentMonth) => {
      if (currentMonth.month === 0) {
        return {
          month: 11,
          year: currentMonth.year - 1,
        };
      }

      return {
        month: currentMonth.month - 1,
        year: currentMonth.year,
      };
    });
  };

  const nextMonth = () => {
    setCurrent((currentMonth) => {
      if (currentMonth.month === 11) {
        return {
          month: 0,
          year: currentMonth.year + 1,
        };
      }

      return {
        month: currentMonth.month + 1,
        year: currentMonth.year,
      };
    });
  };

  const firstDay = new Date(
    current.year,
    current.month,
    1
  ).getDay();

  const daysInMonth = new Date(
    current.year,
    current.month + 1,
    0
  ).getDate();

  const daysInPreviousMonth = new Date(
    current.year,
    current.month,
    0
  ).getDate();

  const eventsByDate = {};

  events.forEach((event) => {
    const date = new Date(event.date);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const dateString = date.toDateString();

    if (!eventsByDate[dateString]) {
      eventsByDate[dateString] = [];
    }

    eventsByDate[dateString].push(event);
  });

  const cells = [];

  for (
    let i = firstDay - 1;
    i >= 0;
    i--
  ) {
    cells.push({
      day: daysInPreviousMonth - i,
      current: false,
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push({
      day,
      current: true,
    });
  }

  let nextDay = 1;

  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay,
      current: false,
    });

    nextDay++;
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={prevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>

        <span className={styles.monthLabel}>
          {MONTHS[current.month]}{" "}
          {current.year}
        </span>

        <button
          type="button"
          className={styles.navBtn}
          onClick={nextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className={styles.dayNames}>
        {DAYS.map((day) => (
          <span
            key={day}
            className={styles.dayName}
          >
            {day}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((cell, index) => {
          const cellMonth = cell.current
            ? current.month
            : index < firstDay
              ? current.month - 1
              : current.month + 1;

          const date = new Date(
            current.year,
            cellMonth,
            cell.day
          );

          const dateString =
            date.toDateString();

          const dayEvents =
            eventsByDate[dateString] || [];

          const hasEvent =
            cell.current &&
            dayEvents.length > 0;

          const isToday =
            cell.current &&
            dateString ===
              today.toDateString();

          const isSelected =
            selectedDate &&
            dateString ===
              selectedDate.toDateString();

          const className = [
            styles.cell,
            !cell.current
              ? styles.outside
              : "",
            isToday
              ? styles.today
              : "",
            isSelected
              ? styles.selected
              : "",
            hasEvent
              ? styles.hasEvent
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          const eventColors = [
            ...new Set(
              dayEvents
                .map(
                  (event) =>
                    SDG_COLORS[
                      event.sdgTag
                    ]
                )
                .filter(Boolean)
            ),
          ].slice(0, 3);

          return (
            <button
              type="button"
              key={`${dateString}-${index}`}
              className={className}
              onClick={() => {
                if (!cell.current) {
                  return;
                }

                onSelectDate(
                  isSelected ? null : date
                );
              }}
            >
              {cell.day}

              {hasEvent &&
                eventColors.length > 0 && (
                  <span
                    className={
                      styles.eventDots
                    }
                  >
                    {eventColors.map(
                      (
                        color,
                        dotIndex
                      ) => (
                        <span
                          key={`${color}-${dotIndex}`}
                          className={
                            styles.dot
                          }
                          style={{
                            backgroundColor:
                              color,
                          }}
                        />
                      )
                    )}
                  </span>
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EventCalendar;