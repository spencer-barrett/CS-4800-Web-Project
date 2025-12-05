export class MusicManager {
  static instance: Phaser.Sound.BaseSound | null = null;

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
}