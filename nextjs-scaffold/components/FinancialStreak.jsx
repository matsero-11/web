"use client";

import { useState, useEffect } from "react";

export default function FinancialStreak() {
  const [streakDays, setStreakDays] = useState(0);
  const [isActiveToday, setIsActiveToday] = useState(false);

  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const storedData = localStorage.getItem("metabox_streak_data");
      
      let streakInfo = storedData
        ? JSON.parse(storedData)
        : { lastDate: "", streakCount: 0, dates: [] };

      if (streakInfo.lastDate === today) {
        setIsActiveToday(true);
        setStreakDays(streakInfo.streakCount);
      } else {
        const last = new Date(streakInfo.lastDate);
        const current = new Date(today);
        const diffDays = Math.round((current - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Día consecutivo
          const newCount = streakInfo.streakCount + 1;
          const updated = {
            lastDate: today,
            streakCount: newCount,
            dates: [...(streakInfo.dates || []), today],
          };
          localStorage.setItem("metabox_streak_data", JSON.stringify(updated));
          setStreakDays(newCount);
          setIsActiveToday(true);
        } else if (diffDays > 1) {
          // Se rompió la racha, reiniciamos a 1
          const updated = {
            lastDate: today,
            streakCount: 1,
            dates: [today],
          };
          localStorage.setItem("metabox_streak_data", JSON.stringify(updated));
          setStreakDays(1);
          setIsActiveToday(true);
        } else {
          // Primera interacción limpia
          const updated = {
            lastDate: today,
            streakCount: 1,
            dates: [today],
          };
          localStorage.setItem("metabox_streak_data", JSON.stringify(updated));
          setStreakDays(1);
          setIsActiveToday(true);
        }
      }
    } catch (e) {
      console.error("Error al acceder al almacenamiento local de racha:", e);
    }
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-sm select-none">
      {/* Icono de Llama Verde Estilizado en SVG */}
      <div className="relative flex items-center justify-center">
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            isActiveToday ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-zinc-600"
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.19 3.03-7.6 6.54-9.36.37-.19.82.02.92.42.33 1.34 1.13 2.5 2.19 3.29C13.56 7.37 15.11 5 15.11 2c0-.46.47-.79.91-.63C19.26 2.65 21 6.28 21 10c0 7.18-4.03 13-9 13zm0-2c3.87 0 7-4.66 7-11 0-1.89-.62-3.8-1.57-5.2-.67 2.62-2.48 4.79-4.82 5.92-.38.18-.83-.02-.93-.43-.33-1.34-1.12-2.5-2.18-3.29C8.3 10.23 7 12.44 7 15c0 3.31 2.24 6 5 6z" />
        </svg>
        {isActiveToday && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-bold text-emerald-400 tracking-tight">
          {streakDays} {streakDays === 1 ? "día" : "días"}
        </span>
        <span className="text-[11px] text-zinc-400 font-normal">
          de racha financiera
        </span>
      </div>
    </div>
  );
}
