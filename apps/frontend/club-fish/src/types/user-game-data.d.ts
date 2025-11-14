export type UseUserGameDataResult = {
  loading: boolean;
  initialScene: SceneKey | null;
  bodyColor: string;
  displayName: string;
};
export type SceneKey = "MainScene" | "CharacterCreate";