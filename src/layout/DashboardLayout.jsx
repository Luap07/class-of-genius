import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CloudSun, MapPin, Loader2 } from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";

const DashboardLayout = () => {
  const location = useLocation();

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");

  /* =========================================================
     WEATHER
  ========================================================= */

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey =
          import.meta.env.VITE_OPENWEATHER_API_KEY;

        if (!apiKey) {
          setWeatherError("Weather unavailable");
          return;
        }

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
        console.error("Weather Error:", error);
        setWeatherError("Unable to load weather");
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <DashboardHeader />

      {/* =========================================================
          WEATHER BAR
      ========================================================= */}

      <div className="border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">

          {/* Location */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <MapPin
                size={17}
                className="text-blue-400"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Current Location
              </p>

              <p className="truncate text-sm font-bold text-white">
                Lagos, Nigeria
              </p>
            </div>
          </div>

          {/* Weather */}

          <div className="flex items-center gap-3">

            {weather ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-xs capitalize text-slate-400">
                    {weather.weather?.[0]?.description}
                  </p>

                  <p className="text-sm font-bold text-white">
                    {Math.round(weather.main?.temp)}°C
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <CloudSun
                    size={22}
                    className="text-cyan-400"
                  />
                </div>
              </>
            ) : weatherError ? (
              <span className="text-xs font-medium text-slate-500">
                {weatherError}
              </span>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Loading weather...
              </div>
            )}

          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <motion.main
        key={location.pathname}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        className="
          min-h-[calc(100vh-125px)]
          overflow-y-auto
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-slate-950
        "
      >
        <div className="min-h-full p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </motion.main>

    </div>
  );
};

export default DashboardLayout;

