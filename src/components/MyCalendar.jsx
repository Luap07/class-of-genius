import React, { useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { supabase } from "../lib/supabaseClient";
import {
  CalendarDays,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");

  /* =========================================================
     FORMAT DATABASE EVENTS FOR REACT BIG CALENDAR
  ========================================================= */

  const formattedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  }, [events]);

  /* =========================================================
     FETCH CURRENT USER'S CALENDAR ONLY
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User error:", userError);
          return;
        }

        if (!user) {
          if (mounted) {
            setEvents([]);
          }
          return;
        }

        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .order("start", { ascending: true });

        if (error) {
          console.error("Calendar fetch error:", error);
          return;
        }

        if (mounted) {
          setEvents(data || []);
        }
      } catch (error) {
        console.error("Calendar loading error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     OPEN TASK CREATION
  ========================================================= */

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({
      start,
      end,
    });

    setTaskTitle("");
    setShowTaskModal(true);
  };

  /* =========================================================
     CREATE TASK
  ========================================================= */

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim() || !selectedSlot) {
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in to create a study task.");
        return;
      }

      const newEvent = {
        user_id: user.id,
        title: taskTitle.trim(),
        start: selectedSlot.start.toISOString(),
        end: selectedSlot.end.toISOString(),
      };

      const { data, error } = await supabase
        .from("calendar_events")
        .insert([newEvent])
        .select()
        .single();

      if (error) {
        console.error("Create calendar task error:", error);
        alert("Unable to create this task.");
        return;
      }

      setEvents((prev) => [...prev, data]);

      setTaskTitle("");
      setSelectedSlot(null);
      setShowTaskModal(false);
    } catch (error) {
      console.error("Create task error:", error);
      alert("Something went wrong while creating the task.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     SELECT EVENT
  ========================================================= */

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  /* =========================================================
     DELETE TASK
  ========================================================= */

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    const confirmed = window.confirm(
      `Delete "${selectedEvent.title}" from your calendar?`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in again.");
        return;
      }

      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", selectedEvent.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Delete calendar task error:", error);
        alert("Unable to delete this task.");
        return;
      }

      setEvents((prev) =>
        prev.filter((event) => event.id !== selectedEvent.id)
      );

      setSelectedEvent(null);
    } catch (error) {
      console.error("Delete task error:", error);
      alert("Something went wrong while deleting the task.");
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     EVENT STYLE
  ========================================================= */

  const eventStyleGetter = () => ({
    style: {
      background:
        "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
      borderRadius: "9px",
      border: "1px solid rgba(147,197,253,0.25)",
      color: "#ffffff",
      padding: "4px 7px",
      fontSize: "12px",
      fontWeight: "600",
      boxShadow: "0 6px 18px rgba(37,99,235,0.22)",
    },
  });

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] p-3 sm:p-5 md:p-7">

      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050812] via-[#091120] to-[#03050b]" />

        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div className="absolute bottom-[-180px] left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[140px]" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-500/10">
            <CalendarDays
              size={21}
              className="text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              My Study Calendar
            </h2>

            <p className="text-xs text-slate-500">
              Plan and manage your personal learning schedule
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedSlot({
              start: new Date(),
              end: new Date(
                Date.now() + 60 * 60 * 1000
              ),
            });

            setTaskTitle("");
            setShowTaskModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:from-blue-500 hover:to-indigo-500"
        >
          <Plus size={17} />
          Add Study Task
        </button>
      </div>

      {/* =====================================================
          CALENDAR
      ===================================================== */}

      <div className="relative z-10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-3 shadow-2xl backdrop-blur-2xl sm:p-5">

        {loading ? (
          <div className="flex h-[600px] flex-col items-center justify-center">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Loader2
                size={22}
                className="animate-spin text-blue-400"
              />
            </div>

            <p className="text-sm font-medium text-slate-400">
              Loading your calendar...
            </p>

          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={formattedEvents}
            startAccessor="start"
            endAccessor="end"
            selectable
            popup
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{
              height: 600,
            }}
            view={view}
            onView={(newView) => setView(newView)}
            views={[
              Views.MONTH,
              Views.WEEK,
              Views.DAY,
              Views.AGENDA,
            ]}
            className="premium-calendar"
          />
        )}
      </div>

      {/* =====================================================
          CREATE TASK MODAL
      ===================================================== */}

      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a1120] p-6 shadow-2xl">

            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <button
              type="button"
              onClick={() => {
                setShowTaskModal(false);
                setSelectedSlot(null);
              }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>

            <div className="relative">

              <div className="mb-6">

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10">
                  <CalendarDays
                    size={20}
                    className="text-blue-400"
                  />
                </div>

                <h3 className="text-xl font-bold text-white">
                  Add Study Task
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create a task for your personal study calendar.
                </p>
              </div>

              <form
                onSubmit={handleCreateTask}
                className="space-y-5"
              >

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Task Title
                  </label>

                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) =>
                      setTaskTitle(e.target.value)
                    }
                    placeholder="e.g. Chemistry revision"
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/10"
                    required
                  />
                </div>

                {selectedSlot && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Scheduled
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {moment(selectedSlot.start).format(
                        "MMM D, YYYY • h:mm A"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Until{" "}
                      {moment(selectedSlot.end).format(
                        "h:mm A"
                      )}
                    </p>

                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || !taskTitle.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving Task...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Add Task
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EVENT DETAILS MODAL
      ===================================================== */}

      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">

          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0a1120] p-6 shadow-2xl">

            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>

            <div className="mb-6">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                <CalendarDays
                  size={21}
                  className="text-blue-400"
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Study Task
              </p>

              <h3 className="mt-2 pr-8 text-xl font-bold text-white">
                {selectedEvent.title}
              </h3>

            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">

              <p className="text-sm font-semibold text-slate-200">
                {moment(selectedEvent.start).format(
                  "dddd, MMMM D, YYYY"
                )}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {moment(selectedEvent.start).format(
                  "h:mm A"
                )}{" "}
                –{" "}
                {moment(selectedEvent.end).format(
                  "h:mm A"
                )}
              </p>

            </div>

            <button
              type="button"
              onClick={handleDeleteEvent}
              disabled={deleting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={17} />
                  Delete Task
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          PREMIUM CALENDAR STYLES
      ===================================================== */}

      <style>{`
        .premium-calendar {
          color: #e2e8f0;
          font-size: 13px;
        }

        .premium-calendar .rbc-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-bottom: 20px;
        }

        .premium-calendar .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 800;
          color: #dbeafe;
          letter-spacing: -0.02em;
        }

        .premium-calendar .rbc-btn-group {
          display: flex;
          gap: 5px;
        }

        .premium-calendar .rbc-btn-group button {
          background: rgba(255,255,255,0.055);
          color: #cbd5e1;
          border: 1px solid rgba(255,255,255,0.09);
          padding: 7px 12px;
          border-radius: 10px;
          transition: all 0.2s ease;
          font-weight: 600;
        }

        .premium-calendar .rbc-btn-group button:hover {
          background: rgba(59,130,246,0.18);
          color: #ffffff;
          border-color: rgba(59,130,246,0.35);
        }

        .premium-calendar .rbc-btn-group button.rbc-active {
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );
          color: white;
          border-color: transparent;
          box-shadow: 0 5px 18px rgba(37,99,235,0.25);
        }

        .premium-calendar .rbc-month-view,
        .premium-calendar .rbc-time-view,
        .premium-calendar .rbc-agenda-view {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255,255,255,0.015);
        }

        .premium-calendar .rbc-month-row {
          border-color: rgba(255,255,255,0.06);
        }

        .premium-calendar .rbc-day-bg {
          border-color: rgba(255,255,255,0.055);
          transition: background 0.2s ease;
        }

        .premium-calendar .rbc-day-bg:hover {
          background: rgba(59,130,246,0.06);
        }

        .premium-calendar .rbc-today {
          background: rgba(59,130,246,0.09) !important;
        }

        .premium-calendar .rbc-header {
          padding: 11px 5px;
          color: #94a3b8;
          border-color: rgba(255,255,255,0.06);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .premium-calendar .rbc-date-cell {
          padding: 7px;
          color: #94a3b8;
        }

        .premium-calendar .rbc-date-cell.rbc-now {
          color: #60a5fa;
          font-weight: 800;
        }

        .premium-calendar .rbc-off-range {
          color: #475569;
        }

        .premium-calendar .rbc-off-range-bg {
          background: rgba(255,255,255,0.01);
        }

        .premium-calendar .rbc-event {
          border: none;
          transition: all 0.2s ease;
        }

        .premium-calendar .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 20px rgba(37,99,235,0.3);
        }

        .premium-calendar .rbc-event-label {
          font-size: 10px;
          font-weight: 700;
        }

        .premium-calendar .rbc-time-view .rbc-time-gutter,
        .premium-calendar .rbc-time-view .rbc-time-content {
          border-color: rgba(255,255,255,0.06);
        }

        .premium-calendar .rbc-timeslot-group {
          border-color: rgba(255,255,255,0.055);
        }

        .premium-calendar .rbc-time-slot {
          border-color: rgba(255,255,255,0.035);
        }

        .premium-calendar .rbc-label {
          color: #64748b;
        }

        .premium-calendar .rbc-current-time-indicator {
          background: #3b82f6;
          height: 2px;
        }

        .premium-calendar .rbc-agenda-table {
          border-color: rgba(255,255,255,0.06);
        }

        .premium-calendar .rbc-agenda-table tbody > tr > td {
          border-color: rgba(255,255,255,0.06);
          color: #cbd5e1;
          padding: 10px;
        }

        .premium-calendar .rbc-agenda-date-cell,
        .premium-calendar .rbc-agenda-time-cell {
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .premium-calendar .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .premium-calendar .rbc-toolbar-label {
            text-align: center;
            order: -1;
          }

          .premium-calendar .rbc-btn-group {
            justify-content: center;
            flex-wrap: wrap;
          }

          .premium-calendar .rbc-btn-group button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MyCalendar;