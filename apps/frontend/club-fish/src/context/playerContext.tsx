"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUserGameData } from "@/hooks/useUserGameData";
import type { PlayerData } from "@/types/player-data";
import type { SceneKey } from "@/types/user-game-data";

type PlayerContextValue = {
  loading: boolean;
  initialScene: SceneKey | null;
  playerData: PlayerData | null;
  setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
  refreshPlayerData?: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({
  children,
  onboardingParam,
}: {
  children: ReactNode;
  onboardingParam?: string | null;
}) {
  const { loading, initialScene, playerData, setPlayerData, refreshPlayerData } =
    useUserGameData(onboardingParam);

  return (
    <PlayerContext.Provider
      value={{ loading, initialScene, playerData, setPlayerData, refreshPlayerData }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }
  return ctx;
}