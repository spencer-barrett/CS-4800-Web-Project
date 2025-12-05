export type UseUserGameDataResult = {
  loading: boolean;
  initialScene: SceneKey | null;
  playerData: PlayerData | null;
  setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
  refreshPlayerData: () => Promise<void>;
  
};
export type SceneKey = "MainScene" | "CharacterCreate";