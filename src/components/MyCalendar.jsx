import React from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = React.useState([
    {
      title: "Math Revision",
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000),
    },
  ]);

  // ✅ FIX: control calendar view properly
  const [view, setView] = React.useState(Views.MONTH);

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt("Enter study task:");
    if (!title) return;

    setEvents((prev) => [...prev, { title, start, end }]);
  };

  return (
    <div className="relative w-full p-4 md:p-6 rounded-3xl overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#05070f]" />

      {/* GLOWS */}
      <div className="absolute -top-24 left-1/4 w-[350px] h-[350px] bg-blue-500/10 blur-[140px]" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 blur-[140px]" />

      {/* CALENDAR WRAPPER */}
      <div className="relative z-10 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-4 shadow-2xl">

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          style={{ height: 600 }}

          // ✅ FIXED VIEW CONTROL
          view={view}
          onView={(newView) => setView(newView)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}

          className="modern-calendar"
        />
      </div>

      {/* PROFESSIONAL STYLING */}
      <style>{`
        .modern-calendar {
          color: #e5e7eb;
        }

        /* TOOLBAR */
        .rbc-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 600;
          color: #93c5fd;
        }

        .rbc-btn-group button {
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 12px;
          border-radius: 10px;
          margin: 0 3px;
          transition: 0.2s;
        }

        .rbc-btn-group button:hover {
          background: rgba(59,130,246,0.35);
          transform: scale(1.05);
        }

        .rbc-btn-group button.rbc-active {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none;
        }

        /* GRID */
        .rbc-month-view,
        .rbc-time-view {
          border: none;
          background: transparent;
        }

        .rbc-day-bg:hover {
          background: rgba(59,130,246,0.08);
        }

        .rbc-today {
          background: rgba(59,130,246,0.15) !important;
        }

        /* HEADERS */
        .rbc-header {
          padding: 10px 0;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        /* EVENTS */
        .rbc-event {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 8px;
          padding: 3px 6px;
          font-size: 12px;
          box-shadow: 0 4px 15px rgba(59,130,246,0.25);
          border: none;
        }

        .rbc-event:hover {
          transform: scale(1.05);
        }

        .rbc-off-range-bg {
          background: transparent;
        }
      `}</style>

    </div>
  );
};

export default MyCalendar;