import { NavLink } from "react-router-dom";
import {
  Coins, Star, Calendar, Clock, CloudSun, Play, Pause, Gauge,
  Hospital, BookOpen, Users, Receipt, RotateCcw,
} from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { WEATHER_NAMES } from "@/data/gameData";

const WEATHER_EMOJI: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  misty: "🌫️",
};

export function TopBar() {
  const money = useGameStore(s => s.money);
  const reputation = useGameStore(s => s.reputation);
  const currentDay = useGameStore(s => s.currentDay);
  const currentTime = useGameStore(s => s.currentTime);
  const weather = useGameStore(s => s.weather);
  const isPaused = useGameStore(s => s.isPaused);
  const speed = useGameStore(s => s.speed);
  const togglePause = useGameStore(s => s.togglePause);
  const setSpeed = useGameStore(s => s.setSpeed);
  const resetGame = useGameStore(s => s.resetGame);

  const hour = Math.floor(currentTime).toString().padStart(2, "0");
  const minute = Math.floor((currentTime % 1) * 60).toString().padStart(2, "0");

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-clinic-deep via-teal-800 to-clinic-deep text-white shadow-lg">
      <div className="container px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-2xl">🏥</span>
            <h1 className="font-display text-xl md:text-2xl tracking-wider text-clinic-amber">
              灵兽诊所
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1 justify-center">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Coins className="w-4 h-4 text-clinic-amber" />
              <span className="font-semibold tabular-nums">{money}</span>
              <span className="text-xs opacity-75">金</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-clinic-amber" />
              <span className="font-semibold tabular-nums">{reputation}</span>
              <span className="text-xs opacity-75">声望</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 text-clinic-light-jade" />
              <span className="font-semibold">第 {currentDay} 天</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-clinic-light-jade" />
              <span className="font-semibold tabular-nums">{hour}:{minute}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <CloudSun className="w-4 h-4" />
              <span className="mr-1">{WEATHER_EMOJI[weather]}</span>
              <span className="font-semibold">{WEATHER_NAMES[weather]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              title={isPaused ? "继续" : "暂停"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                    speed === s ? "bg-clinic-amber text-clinic-deep" : "hover:bg-white/10"
                  }`}
                >
                  {s > 1 && <Gauge className="w-3 h-3" />}
                  {s}x
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (confirm("确定要重新开始游戏吗？所有存档将丢失。")) resetGame();
              }}
              className="p-2 rounded-lg bg-white/15 hover:bg-red-500/60 transition-colors"
              title="重新开始"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="mt-3 flex flex-wrap gap-1.5 text-sm">
          {[
            { to: "/", label: "诊所", icon: Hospital, end: true },
            { to: "/archive", label: "灵兽档案", icon: BookOpen },
            { to: "/staff", label: "员工管理", icon: Users },
            { to: "/finance", label: "财务流水", icon: Receipt },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-clinic-amber text-clinic-deep font-semibold shadow-md"
                    : "bg-white/10 hover:bg-white/20"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
