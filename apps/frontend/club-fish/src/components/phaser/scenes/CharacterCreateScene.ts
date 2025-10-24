// scenes/CharacterCreateScene.ts
import Phaser from "phaser";

export class CharacterCreateScene extends Phaser.Scene {
  constructor() { super("CharacterCreate"); }

  create() {

        const { width, height } = this.scale;

        this.add.image(width * 0.5, height * 0.5, "bg").setOrigin(0.5);


  }
}
