import Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  fish!: Phaser.GameObjects.Image;

  constructor() {
    super("main");
  }

  create() {
    const { width, height } = this.scale;

    // You guys can paint assets loaded from bootScene here
    this.add.image(width * 0.5, height * 0.5, "bg").setOrigin(0.5);
    this.fish = this.add.image(width * 0.3, height * 0.55, "clownfish").setScale(3);

    // Simple phaser tween example you can try any of the other phaser examples here or delete and add movement controls
    this.tweens.add({
      targets: this.fish,
      x: width * 0.7,
      yoyo: true,
      repeat: -1,
      duration: 2400,
      ease: "Sine.easeInOut"
    });
  }
}
