import Phaser from "phaser";
import { Math as pMath } from "phaser";
import Pointer = Phaser.Input.Pointer;
import { getStateCallbacks } from "colyseus.js";
import type { MainRoom } from "@/types/myroomstate";
import { networkManager } from "@/lib/colyseus/networkController";
import { PlayerData } from "@/types/player-data";
const { Vector2 } = pMath;

export let room_: MainRoom;
export class MainScene extends Phaser.Scene {
  currentPlayer!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  localRef!: Phaser.GameObjects.Rectangle;

  remoteRef!: Phaser.GameObjects.Rectangle;
  playerEntities: {
    [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  } = {};

  playerNameLabels: {
    [sessionId: string]: Phaser.GameObjects.Text;
  } = {};

  playerHats: {
    [sessionId: string]: Phaser.GameObjects.Image;
  } = {};

  playerBracelets: {
    [sessionId: string]: Phaser.GameObjects.Image;
  } = {};

  myId = "";
  private room!: MainRoom;
  fish!: Phaser.GameObjects.Image;

  private playerData!: PlayerData;

  target = new Vector2();

  private isMoving = false;
  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;
  currentTick: number = 0;
  inputPayload = {
    x: 0,
    y: 0,
    tick: 0,
    color: "",
  };
  private isReady: boolean = false;

  private returnFromPrivate!: boolean;

  init(data: {
    room?: MainRoom;
    playerData: PlayerData;
    returnFromPrivate?: boolean;
  }) {

    this.isReady = false;

    this.playerEntities = {};
    this.playerNameLabels = {};
    this.playerHats = {};
    this.playerBracelets = {};
    this.currentPlayer = undefined!;
    this.isMoving = false;
    this.elapsedTime = 0;
    this.currentTick = 0;
    this.target = new Vector2();

    this.playerData = data.playerData;
    this.returnFromPrivate = data.returnFromPrivate || false;
    this.inputPayload.color = this.playerData.bodyColor ?? "#964B00";
  }

  constructor() {
    super("MainScene");
  }

  async create() {


    this.game.registry.set("playerData", this.playerData);
    //connect to main room
    this.room = await networkManager.connectMainRoom(this.playerData);


    room_ = this.room;
    this.myId = this.room.sessionId;
    const $ = getStateCallbacks(this.room);


    if (typeof window !== "undefined") {
      (window as any).__currentSessionId = this.room.sessionId;
      (window as any).__currentUserId = this.playerData.userId;
    }


    this.room.onMessage("chat", (msg) => console.log(" asd", msg));
    const { width, height } = this.scale;

    this.add.image(width * 0.5, height * 0.5, "ocean").setOrigin(0.5);

    this.events.once("shutdown", () => {
      if (this.room) {
        this.room.leave();
        networkManager.clearMainRoom();
        this.room = undefined!;
      }
    });

    $(this.room.state).players.onAdd((player, sessionId) => {

      const nameLabel = this.make.text({
        x: player.x,
        y: player.y - 95,
        add: true,
        text: player.displayName,
        style: {
          align: "center",
          backgroundColor: "#363636b7",
        },
        padding: {
          x: 4,
          y: 2,
        },
      });

      this.playerNameLabels[sessionId] = nameLabel;

      const entity = this.physics.add
        .image(player.x, player.y, player.color)
        .setScale(1)
        .setInteractive({ useHandCursor: true });

      entity.on("pointerup", (pointer: Pointer) => {
        if ((window as any).__overlayOpen) {
          console.log("Overlay is open, ignoring click");
          return;
        }
        pointer.event.stopPropagation();


        window.onPhaserPlayerClick?.({
          sessionId,
          userId: player.userId,
          displayName: player.displayName,
          bodyColor: player.color,
        });

      });

      this.playerEntities[sessionId] = entity;

      // listen for body color changes
      $(player).listen("color", (newColor, previousColor) => {
        console.log(`Body color changed for ${sessionId}: ${previousColor} -> ${newColor}`);
        const entity = this.playerEntities[sessionId];
        if (!entity) return;

        // Check if texture exists
        if (this.textures.exists(newColor)) {
          entity.setTexture(newColor);
          console.log(`updated ${sessionId} texture to ${newColor}`);
        } else {
          console.warn(`Texture ${newColor} not found for player ${sessionId}`);
        }
      });

      if (player.equippedHat) {
        const hatTexture = `hat-${player.equippedHat}`;
        console.log(`Creating hat for ${sessionId} with texture: ${hatTexture}`);
        if (this.textures.exists(hatTexture)) {
          // Create hat at entity position
          const hat = this.add.image(entity.x, entity.y - 38, hatTexture).setScale(0.8);
          this.playerHats[sessionId] = hat;
        } else {
          console.warn(`Hat texture ${hatTexture} not found`);
        }
      }

      $(player).listen("equippedHat", (value, previousValue) => {
        console.log(`Hat changed for ${sessionId}: ${previousValue} -> ${value}`);
        const entity = this.playerEntities[sessionId];
        if (!entity) return;

        const oldHat = this.playerHats[sessionId];
        if (oldHat) {
          oldHat.destroy();
          delete this.playerHats[sessionId];
        }

        if (value) {
          const hatTexture = `hat-${value}`;
          if (this.textures.exists(hatTexture)) {
            const hat = this.add.image(entity.x, entity.y - 38, hatTexture).setScale(0.8);
            this.playerHats[sessionId] = hat;
          }
        }
      });

      if (player.equippedBracelet) {
        const braceletTexture = `bracelet-${player.equippedBracelet}`;
        console.log(`Creating bracelet for ${sessionId} with texture: ${braceletTexture}`);
        if (this.textures.exists(braceletTexture)) {
          // position bracelet on right fin
          const bracelet = this.add.image(entity.x + 33, entity.y + 15, braceletTexture).setScale(0.8);
          this.playerBracelets[sessionId] = bracelet;
        } else {
          console.warn(`Bracelet texture ${braceletTexture} not found`);
        }
      }

      $(player).listen("equippedBracelet", (value, previousValue) => {
        console.log(`Bracelet changed for ${sessionId}: ${previousValue} -> ${value}`);
        const entity = this.playerEntities[sessionId];
        if (!entity) return;

        const oldBracelet = this.playerBracelets[sessionId];
        if (oldBracelet) {
          oldBracelet.destroy();
          delete this.playerBracelets[sessionId];
        }

        if (value) {
          const braceletTexture = `bracelet-${value}`;
          if (this.textures.exists(braceletTexture)) {
            const bracelet = this.add.image(entity.x + 33, entity.y + 15, braceletTexture).setScale(0.8);
            this.playerBracelets[sessionId] = bracelet;
          }
        }
      });

      if (sessionId === this.room.sessionId) {
        this.currentPlayer = entity;

      } else {


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


      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }

      const nameLabel = this.playerNameLabels[sessionId];
      if (nameLabel) {
        nameLabel.destroy();
        delete this.playerNameLabels[sessionId];
      }

      const hat = this.playerHats[sessionId];
      if (hat) {
        hat.destroy();
        delete this.playerHats[sessionId];
      }

      const bracelet = this.playerBracelets[sessionId];
      if (bracelet) {
        bracelet.destroy();
        delete this.playerBracelets[sessionId];
      }

    });

    this.input.on(
      "pointerup",
      (pointer: Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {

        if ((window as any).__overlayOpen) return;
        if (gameObjects.length > 0) return;

        if (pointer.leftButtonReleased()) {
          const { worldX, worldY } = pointer;
          this.target.x = worldX;
          this.target.y = worldY;

          const localEntity = this.playerEntities[this.myId];
          if (localEntity) {
            this.physics.moveToObject(localEntity, this.target, 200);
            this.isMoving = true;
          }
        }
      }
    );

    this.events.emit("world:ready");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("colyseus:room-ready"));
      window.dispatchEvent(new CustomEvent("phaser:ready"));
    }
  }
  fixedTick(time: number, delta: number) {
    if (!this.room) return;
    if (!this.currentPlayer) return;
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

      this.room.send(0, this.inputPayload);

      if (distance < 5) {
        const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        this.isMoving = false;
      }
    }

    // Interpolate other players
    for (const sessionId in this.playerEntities) {
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

    for (const sessionId in this.playerNameLabels) {
      const entity = this.playerEntities[sessionId];
      const nameLabel = this.playerNameLabels[sessionId];

      if (entity && nameLabel) {
        // Position the name above the player
        nameLabel.x = entity.x - nameLabel.width / 2;
        nameLabel.y = entity.y - 75;
      }
    }
  }
  update(_time: number, delta: number): void {
    if (!this.room) return;
    if (!this.currentPlayer) {
      return;
    }

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick(_time, this.fixedTimeStep);
    }

    for (const sessionId in this.playerEntities) {
      const entity = this.playerEntities[sessionId];

      // update name label
      const nameLabel = this.playerNameLabels[sessionId];
      if (nameLabel && entity) {
        nameLabel.x = entity.x - nameLabel.width / 2;
        nameLabel.y = entity.y - 75;
      }

      // update hat position every frame
      const hat = this.playerHats[sessionId];
      if (hat && entity) {
        hat.x = entity.x;
        hat.y = entity.y - 39;
      }

      // update bracelet position every frame
      const bracelet = this.playerBracelets[sessionId];
      if (bracelet && entity) {
        bracelet.x = entity.x + 32;
        bracelet.y = entity.y + 7;
      }
    }
  }
}
export async function createNonMainRoom(type: string, size: number): Promise<any> {
  room_ = await networkManager.connectNonMainRoom(type, size);
  console.log(room_.roomId)
}