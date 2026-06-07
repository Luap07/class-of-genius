import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  History,
  Library,
  Users,
  Download,
  CloudSun,
  PanelLeft,
  X,
} from "lucide-react";

import { StudyContext } from "../context/StudyContext";

const Sidebar = () => {
  const navigate = useNavigate(); // 🔥 ADDED

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("searchHistory")) || []
  );

  const [showHistory, setShowHistory] = useState(false);

  const studyContext = useContext(StudyContext);
  const user = studyContext?.user || null;

  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Genius";

  const handleSearchSubmit = () => {
    const trimmed = searchValue.trim();
    if (trimmed.length < 2) return;

    const newHistory = [
      trimmed,
      ...history.filter((h) => h !== trimmed),
    ].slice(0, 10);

    setHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    setSearchValue("");
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Lagos&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        if (Number(data.cod) !== 200) {
          setWeatherError("Weather unavailable");
          return;
        }

        setWeather(data);
      } catch (error) {
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-xl p-2"
      >
        <PanelLeft size={24} />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-64 h-screen bg-white border-r
        p-6 flex flex-col justify-between
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        <div className="lg:hidden flex justify-end mb-4">
          <button onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        <div>

          {/* USER */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="font-bold text-lg">{userName}</h2>
              <p className="text-xs text-gray-500">Welcome Back</p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" />

              <input
                type="text"
                value={searchValue}
                placeholder="Search documents..."
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg"
              />
            </div>
          </div>

          {/* HISTORY */}
          {showHistory && (
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="text-sm p-2 hover:bg-white rounded cursor-pointer"
                  onClick={() => setSearchValue(item)}
                >
                  🔎 {item}
                </div>
              ))}
            </div>
          )}

          {/* NAVIGATION (NOW REAL DRIVE NAVIGATION) */}
          <nav className="flex flex-col gap-3">

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
            >
              <History size={20} />
              History
            </button>

            <button
              onClick={() => navigate("/libraries")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
            >
              <Library size={20} />
              Libraries (Drive)
            </button>

            <button
              onClick={() => navigate("/connects")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
            >
              <Users size={20} />
              Connects
            </button>

            <button
              onClick={() => navigate("/downloads")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50"
            >
              <Download size={20} />
              Downloads
            </button>

          </nav>
        </div>

        {/* WEATHER */}
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Lagos Forecast</p>
              <p className="font-bold">
                {weather?.main?.temp
                  ? `${Math.round(weather.main.temp)}°C`
                  : weatherError || "Loading..."}
              </p>
            </div>
            <CloudSun className="text-blue-500" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;