import Phaser from "phaser";
import { Math as pMath } from "phaser";
import Pointer = Phaser.Input.Pointer;
import { Client, Room, getStateCallbacks } from "colyseus.js";
import type { MainRoom } from "@/types/myroomstate";
import { networkManager } from "@/lib/colyseus/networkController";
const { Vector2 } = pMath;

export let room_: MainRoom;
export class MainScene extends Phaser.Scene {
  currentPlayer!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  localRef!: Phaser.GameObjects.Rectangle;

  remoteRef!: Phaser.GameObjects.Rectangle;
  playerEntities: {
    [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  } = {};

  myId = "";
  private room!: MainRoom;
  fish!: Phaser.GameObjects.Image;
  private bodyColor = "#60cbfcff";

  target = new Vector2();

  private isMoving = false;
  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;
  currentTick: number = 0;
  inputPayload = {
    x: 0,
    y: 0,
    tick: 0,
  };

  init(data: { room: MainRoom; bodyColor?: string }) {
    console.log("MainScene: init", data);
    this.bodyColor = data.bodyColor ?? this.bodyColor;
  }

  constructor() {
    super("MainScene");
  }


  async create() {
    //custom cursor
    // this.input.setDefaultCursor("url(assets/cursor-small.cur), pointer");
    this.room = await networkManager.connectMainRoom();
    room_ = this.room;
    this.myId = this.room.sessionId;
    const $ = getStateCallbacks(this.room);
    console.log("MainScene: create started");
    console.log("Connected to main room:", this.room.roomId);

    this.room.onMessage("chat", (msg) => console.log(" asd", msg));
    const { width, height } = this.scale;

    const key = `fish-${this.bodyColor}`;
    console.log(`Fish texture "${key}" exists?`, this.textures.exists(key));

    this.add.image(width * 0.5, height * 0.5, "ocean").setOrigin(0.5);

    $(this.room.state).players.onAdd((player, sessionId) => {
      console.log(`   Player added: ${sessionId}`);
      console.log(`   My ID: ${this.room.sessionId}`);
      console.log(`   Is me? ${sessionId === this.room.sessionId}`);
      console.log(`   Initial position: (${player.x}, ${player.y})`);

      const entity = this.physics.add
        .image(player.x, player.y, key)
        .setScale(0.5);
      this.playerEntities[sessionId] = entity;

      if (sessionId === this.room.sessionId) {
        console.log(`      This is MY player`);
        this.currentPlayer = entity;

        this.localRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.localRef.setStrokeStyle(1, 0x00ff00);

        this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
        this.remoteRef.setStrokeStyle(1, 0xff0000);

        $(player).onChange(() => {
          this.remoteRef.x = player.x;
          this.remoteRef.y = player.y;
        });
      } else {
        console.log(`      This is a REMOTE player`);
        entity.setData("serverX", player.x);
        entity.setData("serverY", player.y);

        $(player).onChange(() => {
          entity.setData("serverX", player.x);
          entity.setData("serverY", player.y);
        });
      }
    });

    // remove local reference when entity is removed from the server
    $(this.room.state).players.onRemove((player, sessionId) => {
      console.log(`   Player removed: ${sessionId}`);
      console.log(
        `   Current players in memory:`,
        Object.keys(this.playerEntities)
      );

      const entity = this.playerEntities[sessionId];
      if (entity) {
        console.log(`    Destroying entity for ${sessionId}`);
        entity.destroy();
        delete this.playerEntities[sessionId];

        // Also destroy remoteRef if it exists
        if (this.remoteRef && sessionId === this.myId) {
          this.remoteRef.destroy();
          this.localRef.destroy();
        }
      } else {
      }

      console.log(`   Remaining players:`, Object.keys(this.playerEntities));
    });

    // When the user releases the screen...
    this.input.on("pointerup", (pointer: Pointer) => {
      // Get the WORLD x and y position of the pointer

      console.log("Pointer released:", pointer.worldX, pointer.worldY);
      const { worldX, worldY } = pointer;

      this.target.x = worldX;
      this.target.y = worldY;

      const localEntity = this.playerEntities[this.myId] ?? this.fish;
      if (localEntity) {
        this.physics.moveToObject(localEntity, this.target, 200);

        this.isMoving = true;
      } else {
        console.warn("No local entity found to move");
      }
    });

    
 this.events.emit("world:ready");

if (typeof window !== "undefined") {
  window.dispatchEvent(new CustomEvent("colyseus:room-ready"));
   window.dispatchEvent(new CustomEvent("phaser:ready"));
}

  }
  fixedTick(time: number, delta: number) {
    this.currentTick++;
    const distance = Phaser.Math.Distance.Between(
      this.currentPlayer.x,
      this.currentPlayer.y,
      this.target.x,
      this.target.y
    );

    if (this.isMoving) {
      // Send position update every frame while moving
      this.inputPayload.x = this.currentPlayer.x;
      this.inputPayload.y = this.currentPlayer.y;
      this.inputPayload.tick = this.currentTick;
      console.log(
        `📤 [${this.room.sessionId}] Sending position: (${this.inputPayload.x}, ${this.inputPayload.y})`
      );
      this.room.send(0, this.inputPayload);

      if (distance < 5) {
        const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        this.isMoving = false;
      }
    }

    this.localRef.x = this.currentPlayer.x;
    this.localRef.y = this.currentPlayer.y;
    // Interpolate other players
    for (let sessionId in this.playerEntities) {
      if (sessionId === this.room.sessionId) {
        continue;
      }

      const entity = this.playerEntities[sessionId];
      const { serverX, serverY } = entity.data?.values || {};

      if (serverX !== undefined && serverY !== undefined) {
        entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2);
        entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
      }
    }
  }
  update(_time: number, delta: number): void {
    if (!this.currentPlayer) {
      return;
    }

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick(_time, this.fixedTimeStep);
    }
  }
}
