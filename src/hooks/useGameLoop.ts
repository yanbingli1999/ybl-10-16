import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

export function useGameLoop() {
  const isPaused = useGameStore(s => s.isPaused);
  const speed = useGameStore(s => s.speed);
  const tickGame = useGameStore(s => s.tickGame);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
      return;
    }
    // 2000ms / speed = 游戏内1小时
    const interval = Math.max(300, 2000 / speed);
    ref.current = window.setInterval(() => tickGame(1), interval);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [isPaused, speed, tickGame]);
}
