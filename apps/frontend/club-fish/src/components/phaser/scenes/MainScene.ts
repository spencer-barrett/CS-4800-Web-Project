import Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  fish!: Phaser.GameObjects.Image;
  private bodyColor = "#60cbfcff";

  init(data: { bodyColor?: string }) {
    console.log("MainScene: init", data);
    if (data?.bodyColor) this.bodyColor = data.bodyColor;
  }

  constructor() {
    super("MainScene");
  }

  create() {
    console.log("MainScene: create started");
    const { width, height } = this.scale;

    console.log("Ocean exists?", this.textures.exists("ocean"));
    console.log("BG exists?", this.textures.exists("bg"));

    const key = `fish-${this.bodyColor}`;
    console.log(`Fish texture "${key}" exists?`, this.textures.exists(key));

    // Add images
    this.add.image(width * 0.5, height * 0.5, "ocean").setOrigin(0.5);
    this.fish = this.add.image(width * 0.5, height * 0.5, key).setScale(0.5);

    console.log("MainScene: create finished");
  }
}