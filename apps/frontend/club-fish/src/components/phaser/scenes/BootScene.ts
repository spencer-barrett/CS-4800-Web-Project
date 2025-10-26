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
    this.load.image('sky', 'assets/sky.png') //replace asset later
    this.load.spritesheet('kelp', 'assets/kelp.png', { frameWidth: 1000, frameHeight: 1000})
    this.load.spritesheet('claw', 'assets/claw.png', { frameWidth: 1000, frameHeight: 1000})
    this.load.spritesheet('coral', 'assets/coral.png', { frameWidth: 1000, frameHeight: 1000})
  }
  create() {
    //this.scene.start("main");
    this.scene.start("rps"); //add a button or something later to get to minigame instead of skipping main scene
  }
}
