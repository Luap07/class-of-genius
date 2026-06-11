import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  History,
  Library,
  Download,
  CloudSun,
  PanelLeft,
  X,
  ChevronRight,
} from "lucide-react";

import { StudyContext } from "../context/StudyContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const studyContext = useContext(StudyContext);
  const user = studyContext?.user || null;

  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Genius";

  const progress = 0;

  const navItems = [
    { title: "Libraries", icon: Library, path: "/libraries" },
    { title: "Downloads", icon: Download, path: "/downloads" },
    {
      title: "History",
      icon: History,
      action: () => setShowHistory(!showHistory),
    },
  ];

  const handleSearchSubmit = () => {
    const trimmed = searchValue.trim();
    if (trimmed.length < 2) return;

    const newHistory = [
      trimmed,
      ...history.filter((h) => h !== trimmed),
    ].slice(0, 10);

    setHistory(newHistory);
    setSearchValue("");
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Lagos&units=metric&appid=${
            import.meta.env.VITE_WEATHER_API_KEY
          }`
        );

        const data = await res.json();

        if (Number(data.cod) !== 200) {
          setWeatherError("Weather unavailable");
          return;
        }

        setWeather(data);
      } catch {
        setWeatherError("Unable to load weather");
      }
    };

    fetchWeather();
  }, []);

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-xl rounded-xl p-2"
      >
        <PanelLeft size={24} />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
fixed lg:sticky top-0 left-0 z-50
h-screen w-72
bg-gradient-to-b from-slate-900 via-slate-950 to-black
text-white border-r border-slate-800
flex flex-col justify-between p-5
transition-transform duration-300
${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
`}
      >
        {/* TOP */}
        <div>
          {/* CLOSE BTN (mobile) */}
          <div className="lg:hidden flex justify-end mb-4">
            <button onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          {/* USER */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-xl mb-6">
            <h2 className="font-bold text-lg">{userName}</h2>
            <p className="text-xs text-blue-100">Welcome Back</p>
          </div>

          {/* SEARCH */}
          <div className="relative mb-5">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              value={searchValue}
              placeholder="Search..."
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearchSubmit()
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* HISTORY */}
          {showHistory && (
            <div className="mb-5 bg-slate-800/60 rounded-xl p-3 max-h-40 overflow-auto">
              {history.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No history yet
                </p>
              ) : (
                history.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setSearchValue(item)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 cursor-pointer text-sm"
                  >
                    <ChevronRight size={14} />
                    {item}
                  </div>
                ))
              )}
            </div>
          )}

          {/* NAVIGATION */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const active =
                location.pathname === item.path;

              return (
                <button
                  key={i}
                  onClick={() =>
                    item.path
                      ? navigate(item.path)
                      : item.action()
                  }
                  className={`
flex items-center gap-3 p-3 rounded-xl transition-all duration-300
hover:bg-slate-800 hover:translate-x-1
${
  active
    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
    : "text-gray-300"
}
`}
                >
                  <Icon size={18} />
                  {item.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div className="space-y-4">
          {/* PROGRESS RING */}
          <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-700">
            <div>
              <p className="text-xs text-gray-400">Progress</p>
              <p className="font-bold text-sm">{progress}%</p>
            </div>

            <svg className="w-10 h-10 rotate-[-90deg]">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#1f2937"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={100}
              />
            </svg>
          </div>

          {/* WEATHER */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">
                  Lagos Weather
                </p>
                <p className="text-lg font-bold">
                  {weather?.main?.temp
                    ? `${Math.round(weather.main.temp)}°C`
                    : weatherError || "Loading..."}
                </p>
              </div>

              <CloudSun className="text-blue-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;