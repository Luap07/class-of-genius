import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  ChevronDown,
  Flame,
  BookOpen,
} from "lucide-react";

const AISessionProfile = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState({
    topics: [],
  });

  // ================= LOAD LIVE DATA =================
  useEffect(() => {
    const load = () => {
      const saved = JSON.parse(
        localStorage.getItem("studentProgress")
      );

      if (saved) setData(saved);
    };

    load();

    window.addEventListener("storage", load);
    return () =>
      window.removeEventListener("storage", load);
  }, []);

  // ================= SAFE FALLBACKS =================
  const subject = data.subject || "No Subject Yet";
  const subSubject = data.subSubject || "General";
  const streak = data.streak || 0;

  const topics = data.topics || [];

  const currentTopic =
    data.currentTopicIndex || 0;

  const totalTopics =
    data.totalTopics ||
    topics.reduce(
      (sum, t) => sum + (t.total || 0),
      0
    );

  const completedTopics =
    data.completedTopics ||
    topics.reduce(
      (sum, t) => sum + (t.completed || 0),
      0
    );

  const progress =
    totalTopics > 0
      ? Math.round(
          (completedTopics / totalTopics) * 100
        )
      : 0;

  // ================= SECTION WRAPPER =================
  const Section = ({ children }) => (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-3xl mb-4">
      {children}
    </div>
  );

  return (
    <div className="w-80 bg-[#0b1120] border border-slate-800 rounded-[32px] p-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">

      {/* ================= SUBJECT ================= */}
      <Section>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-slate-400 text-[10px] uppercase tracking-widest">
              Current Subject
            </h3>

            <p className="text-[#3b82f6] font-bold text-lg mt-1">
              {subject}
            </p>

            <p className="text-slate-300 text-sm">
              {subSubject}
            </p>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-2xl">
            <BookOpen className="text-emerald-500" size={20} />
          </div>
        </div>
      </Section>

      {/* ================= PROGRESS ================= */}
      <Section>
        <h3 className="text-slate-400 text-[10px] uppercase tracking-widest mb-6">
          Lesson Progress
        </h3>

        <div className="flex items-center gap-6">

          {/* PROGRESS RING */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              background: `conic-gradient(#10b981 ${progress}%, #3b82f6 ${progress}%, #1e293b 0%)`,
            }}
          >
            <div className="w-[85%] h-[85%] rounded-full bg-[#111827] flex flex-col items-center justify-center">
              <span className="font-bold text-md">
                {progress}%
              </span>
            </div>
          </div>

          {/* TOPIC COUNT */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {completedTopics}/{totalTopics}
            </span>
            <span className="text-[10px] text-slate-400 uppercase">
              Topics Completed
            </span>
          </div>
        </div>

        <p className="text-sm mt-6 mb-2 font-medium">
          Lesson {currentTopic} Progress
        </p>

        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3b82f6] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Section>

      {/* ================= TOPIC BREAKDOWN ================= */}
      <Section>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3"
        >
          Topics Breakdown
          {isOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        {isOpen && (
          <div className="space-y-1">
            {topics.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No topic data yet
              </p>
            ) : (
              topics.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm ${
                    t.active
                      ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                      : "text-slate-500"
                  }`}
                >
                  <span>{t.name}</span>

                  {t.done && (
                    <Check
                      size={14}
                      className="text-green-500"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Section>

      {/* ================= STREAK ================= */}
      <Section>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            <span className="text-sm font-semibold text-slate-300">
              Streak
            </span>
          </div>

          <span className="text-lg font-bold text-orange-400">
            {streak} Days
          </span>
        </div>
      </Section>
    </div>
  );
};

export default AISessionProfile;