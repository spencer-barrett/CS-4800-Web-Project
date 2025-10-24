import Phaser from "phaser";
import { Math as pMath } from "phaser";
import Pointer = Phaser.Input.Pointer;
const { Vector2 } = pMath;

export class MainScene extends Phaser.Scene {

  fish!: Phaser.GameObjects.Image;
  private bodyColor = "#60cbfcff";
  target = new Vector2();

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
    this.fish = this.physics.add.image(width * 0.5, height * 0.5, key).setScale(0.5); // was missing 'physics' 

    // When the user releases the screen...
    this.input.on('pointerup', (pointer: Pointer) => {
      // Get the WORLD x and y position of the pointer
      console.log('Pointer released:', pointer.worldX, pointer.worldY);
      const { worldX, worldY } = pointer;

      // Assign the world x and y to our vector
      this.target.x = worldX;
      this.target.y = worldY;

      // Start moving our cat towards the target
      this.physics.moveToObject(this.fish, this.target, 200);
    });


    console.log("MainScene: create finished");


  }

  update() {
    if (!this.fish || !this.target) return;
    const tolerance = 5; //specify tolerance for stopping distance

    const distance = Phaser.Math.Distance.BetweenPoints(this.fish, this.target);

    // specify stopping distance
    if (distance < tolerance) {
      const body = this.fish.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.fish.setPosition(this.target.x, this.target.y);
    }
  }


}