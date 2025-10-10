import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }
  preload() {
    // You guys can load any assetts here and define names from public folder!
    // /public/assets
    this.load.image("bg", "/assets/background.png");
    this.load.image("clownfish", "/assets/Clownfish.png");
  }
  create() {
    this.scene.start("main");
  }
}
