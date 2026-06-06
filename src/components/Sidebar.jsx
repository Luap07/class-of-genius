import React, { useState, useEffect, useContext } from "react";
import {
  Search,
  History,
  Library,
  Users,
  Download,
  CloudSun,
} from "lucide-react";

import { StudyContext } from "../context/StudyContext";

const Sidebar = () => {
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");

  const studyContext = useContext(StudyContext);
  const user = studyContext?.user || null;

  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Genius";

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

        if (!apiKey) {
          setWeatherError("API key not found");
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Lagos&units=metric&appid=${apiKey}`
        );

        const data = await response.json();

        if (Number(data.cod) !== 200) {
          setWeatherError(data.message || "Weather unavailable");
          return;
        }

        setWeather(data);
      } catch (error) {
        console.error(error);
        setWeatherError("Unable to load weather");
      }
    };

    fetchWeather();
  }, []);

  return (
    <aside
      className="
        hidden
        lg:flex
        w-64
        h-screen
        sticky
        top-0
        shrink-0
        bg-white
        border-r
        border-gray-200
        p-6
        flex-col
        justify-between
      "
    >
      {/* TOP */}
      <div>
        {/* USER */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="font-bold text-lg text-gray-800">
              {userName}
            </h2>

            <p className="text-xs text-gray-500">
              Welcome Back
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-3">
          <SidebarLink
            icon={<History size={20} />}
            label="History"
          />

          <SidebarLink
            icon={<Library size={20} />}
            label="Libraries"
          />

          <SidebarLink
            icon={<Users size={20} />}
            label="Connects"
          />

          <SidebarLink
            icon={<Download size={20} />}
            label="Downloads"
          />
        </nav>
      </div>

      {/* WEATHER */}
      <div
        className="
          bg-white
          rounded-2xl
          p-4
          shadow-[0_12px_30px_rgba(0,0,0,0.15)]
          hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)]
          transition-all
          duration-300
          hover:-translate-y-1
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">
              Lagos Forecast
            </p>

            <p className="font-bold text-xl text-gray-800">
              {weather?.main?.temp !== undefined
                ? `${Math.round(weather.main.temp)}°C`
                : weatherError || "Loading..."}
            </p>

            {weather?.weather?.[0]?.main && (
              <p className="text-xs text-gray-500 mt-1">
                {weather.weather[0].main}
              </p>
            )}
          </div>

          <CloudSun
            size={34}
            className="text-blue-500"
          />
        </div>
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon, label }) => {
  return (
    <button
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
    >
      {icon}
      <span className="font-medium">
        {label}
      </span>
    </button>
  );
};

export default Sidebar;