export type UseUserGameDataResult = {
  loading: boolean;
  initialScene: SceneKey | null;
  playerData: PlayerData | null;
  setPlayerData: React.Dispatch<React.SetStateAction<PlayerData | null>>;
  
};
export type SceneKey = "MainScene" | "CharacterCreate";