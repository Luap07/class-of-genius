import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ProgressPanel = () => {
  const [learningRate, setLearningRate] = useState(0);
  const [stats, setStats] = useState({ subjects: 0, completed: 0 });
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const calculateProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load Weekly Activity Data with Weekly Reset Logic
    const weekStorageKey = `studentWeeklyProgress_${user.id}`;
    const now = new Date();
    // Unique identifier for current week
    const currentWeekId = `${now.getFullYear()}-W${Math.ceil((now.getDate() + now.getDay()) / 7)}`;
    
    let savedWeek = JSON.parse(localStorage.getItem(weekStorageKey));
    if (!savedWeek || savedWeek.weekId !== currentWeekId) {
      savedWeek = { weekData: [0, 0, 0, 0, 0, 0, 0], weekId: currentWeekId };
      localStorage.setItem(weekStorageKey, JSON.stringify(savedWeek));
    }
    setWeeklyData(savedWeek.weekData);

    // Load Subject Stats
    const storageKey = `studentProgress_${user.id}`;
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && saved.subjects) {
      const allTopics = Object.values(saved.subjects).flatMap(s => Object.values(s.topics || {}));
      const globalCompleted = allTopics.reduce((acc, t) => acc + t.completed, 0);
      const globalTotal = allTopics.reduce((acc, t) => acc + t.total, 0);
      
      setLearningRate(globalTotal > 0 ? Math.round((globalCompleted / globalTotal) * 100) : 0);
      setStats({
        subjects: Object.keys(saved.subjects).length,
        completed: globalCompleted
      });
    }
  };

  useEffect(() => {
    calculateProgress();
    window.addEventListener("storage-update", calculateProgress);
    return () => window.removeEventListener("storage-update", calculateProgress);
  }, []);

  const circumference = Math.PI * 70;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-8 bg-[#01011d] text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-8">
      {/* LEFT: Gauge Summary */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center border-r border-slate-800 pr-8">
        <h2 className="text-xl font-medium text-slate-400 mb-6 w-full text-left">Learning Dashboard</h2>
        <div className="relative flex flex-col items-center">
          <svg className="w-64 h-40" viewBox="0 0 180 95">
            <path d="M 10,80 A 70,70 0 0,1 170,80" fill="none" stroke="#1e293b" strokeWidth="12" strokeDasharray="3, 4" strokeLinecap="round" />
            <path d="M 10,80 A 70,70 0 0,1 170,80" fill="none" stroke="#38bdf8" strokeWidth="12" strokeDasharray="3, 4" strokeDashoffset={-((100 - learningRate) / 100) * circumference} className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute top-12 flex flex-col items-center">
            <h3 className="text-5xl font-bold">{learningRate}%</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Learning Rate</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8 w-full">
          <div className="bg-[#131316] p-4 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[10px] uppercase font-bold">Subjects</p>
            <p className="text-2xl font-bold mt-1">{stats.subjects}</p>
          </div>
          <div className="bg-[#131316] p-4 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[10px] uppercase font-bold">Completed</p>
            <p className="text-2xl font-bold mt-1 text-blue-400">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Weekly Activity Chart */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h3 className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-wider">Weekly Activity</h3>
        <div className="flex items-end justify-between h-40 gap-2 w-full">
          {weeklyData.map((val, idx) => (
            <div key={days[idx]} className="flex flex-col items-center flex-1">
              <div className="w-full bg-[#131316] rounded-t-lg relative flex flex-col justify-end h-32 border border-slate-800/50">
                <div 
                  className={`w-full rounded-t-sm transition-all duration-700 ${idx === currentDayIndex ? 'bg-green-600' : 'bg-blue-700'}`} 
                  style={{ height: `${val > 100 ? 100 : val}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-2 uppercase">{days[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPanel;