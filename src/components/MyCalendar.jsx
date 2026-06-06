import React from "react"; // Keep this, but ensure the component uses the updated syntax
import { Calendar, momentLocalizer } from "react-big-calendar";
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

  const handleSelectSlot = ({ start, end }) => {
    const title = prompt("Enter study task:");
    if (!title) return;

    setEvents((prev) => [...prev, { title, start, end }]);
  };

  return (
    <div className="h-[400px] w-full text-xs">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: 400 }}
      />
    </div>
  );
};

export default MyCalendar;