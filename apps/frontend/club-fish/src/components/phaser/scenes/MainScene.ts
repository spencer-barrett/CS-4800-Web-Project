import Phaser from "phaser";
import { Client, Room } from "colyseus.js"
import { Player, MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";
import { room } from "./BootScene"

export class MainScene extends Phaser.Scene {
  fish!: Phaser.GameObjects.Image;
  //room!: Room;
  client = new Client("ws://localhost:2567");

  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys

  //playerEntities: {[sessionId: string]: any} = {};
  //local input cache
  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor() {
    super("main");
  }

  preload() {
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
  }

  create() {
    //console.log("testing")
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

    //colyseus testing
    
    // this.room.state.players.onAdd((player: Player, sessionId: string) => {
    //   const entity = this.physics.add.image(player.x, player.y, "clownfish")

    //   this.playerEntities[sessionId] = entity;
    // })

    // this.room.state.players.onRemove((player: Player, sessionId: string) => {
    //   const entity = this.playerEntities[sessionId]
    //   if (entity) {
    //     //destroy entity
    //     entity.destroy();
    //     //clear local ref
    //     delete this.playerEntities[sessionId];
    //   }
    // })
  }

  // update () {
  //   if (!this.cursorKeys) {
  //     return
  //   }
  //   if (this.cursorKeys.space?.isDown){
  //     this.scene.start("rps")
  //   }
  // }
  //for colyseus
  update() {
    if (!room) { return; }
    if (!this.cursorKeys){
			return
		}

    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
    room.send("movement", {left: this.inputPayload.left, right: this.inputPayload.right})
    if (this.cursorKeys.space?.isDown){
            // room.send("hi", this.inputPayload);
            // console.log('did it work?')
            room.send("hi", {x: 10, y: 5});
            console.log('did it work?')
            
        }
    
    //room.send(0, this.inputPayload)
  }
}
