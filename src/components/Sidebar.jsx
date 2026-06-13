import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  History,
  Library,
  Download,
  CloudSun,
  X,
  PanelLeft,
  Inbox, // ✅ added
} from "lucide-react";

import { StudyContext } from "../context/StudyContext";

const Sidebar = ({ open = false, setOpen = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const studyContext = useContext(StudyContext);
  const user = studyContext?.user;

  const userName = user?.displayName || user?.email?.split("@")[0] || "Genius";

  const navItems = [
    { title: "Libraries", icon: Library, path: "/libraries" },
    { title: "Downloads", icon: Download, path: "/downloads" },
    {
      title: "History",
      icon: History,
      action: () => setShowHistory(!showHistory),
    },

    // ✅ CONTACT INBOX ADDED HERE
    {
      title: "Contact Inbox",
      icon: Inbox,
      path: "/contact-inbox",
    },
  ];

  const handleSearchSubmit = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    const newHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 10);
    setHistory(newHistory);
    setSearchValue("");
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Lagos&units=metric&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
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
      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white bg-slate-900 rounded-lg"
      >
        <PanelLeft size={22} />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72
          bg-gradient-to-b from-slate-900 via-slate-950 to-black
          text-white border-r border-slate-800
          flex flex-col justify-between p-5
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:fixed lg:left-0
        `}
      >
        {/* CLOSE BUTTON */}
        <div className="lg:hidden flex justify-end mb-4">
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* TOP */}
        <div className="flex-1">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 mb-6">
            <h2 className="font-bold text-lg">{userName}</h2>
            <p className="text-xs text-blue-100">Welcome Back</p>
          </div>

          <div className="relative mb-5">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="Search..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3"
            />
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      setOpen(false);
                    } else {
                      item.action();
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    active ? "bg-blue-600" : "hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  {item.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* WEATHER */}
        <div className="bg-slate-800/50 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Lagos Weather</p>
              <p className="text-lg font-bold">
                {weather?.main?.temp
                  ? `${Math.round(weather.main.temp)}°C`
                  : weatherError || "Loading..."}
              </p>
            </div>
            <CloudSun className="text-blue-400" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;