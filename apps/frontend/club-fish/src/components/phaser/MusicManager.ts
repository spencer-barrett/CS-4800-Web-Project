export class MusicManager {
  static instance: Phaser.Sound.BaseSound | null = null;
  static muted: boolean = false;

  static play(scene: Phaser.Scene, key: string, volume: number = 0.4) {
    // Already playing? Do nothing.
    if (this.instance && this.instance.key === key) return;

    // Stop previous track
    if (this.instance) {
      this.instance.stop();
      this.instance.destroy();
    }

    // Create & play new track
    this.instance = scene.sound.add(key, { loop: true, volume });
    this.instance.play();
  }

  static stop() {
    if (this.instance) {
      this.instance.stop();
      this.instance.destroy();
      this.instance = null;
    }
  }
  static toggleMute(scene: Phaser.Scene): boolean {
    this.muted = !this.muted;
    scene.sound.setMute(this.muted);
    return this.muted;
  }

  static setMute(scene: Phaser.Scene, value: boolean) {
    this.muted = value;
    scene.sound.setMute(value);
  }
}
// <button onClick={() => {
//     const game = (window as any).PhaserGame;
//     const scene = game.scene.keys["MainScene"];
//     MusicManager.toggleMute(scene);
// }}>
//   Toggle Mute
// </button>