import type Phaser from "phaser";

declare global {
  interface Window {
    PhaserGame?: Phaser.Game & {
      __reactOverlayCleanup?: () => void;
    };
  }
}

declare global {
  interface Window {
    onPhaserPlayerClick?: (payload: {
      sessionId: string;
      userId: string;
      displayName: string;
      bodyColor: string;
    }) => void;
  }
}


export {};
