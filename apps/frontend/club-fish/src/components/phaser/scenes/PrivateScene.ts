import Phaser from "phaser";
import { Math as pMath } from "phaser";
import Pointer = Phaser.Input.Pointer;
import { getStateCallbacks, Room } from "colyseus.js";
import type { MainRoom, MyRoomState } from "@/types/myroomstate";
import { networkManager } from "@/lib/colyseus/networkController";
import { PlayerData } from "@/types/player-data";
const { Vector2 } = pMath;

export let room_: MainRoom;
export class PrivateScene extends Phaser.Scene {
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

  private targetSessionId?: string;

  init(data: {
    room?: Room<MyRoomState>;
    playerData: PlayerData;
    targetSessionId?: string;
  }) {
    this.playerEntities = {};
    this.playerNameLabels = {};
    this.playerHats = {};
    this.playerBracelets = {};

    console.log("PrivateScene: init", data.targetSessionId);
    this.playerData = data.playerData;
    this.targetSessionId = data.targetSessionId;
    this.inputPayload.color = this.playerData.bodyColor ?? "#964B00";

    if (data.room) {
      this.room = data.room;
    }
  }
  constructor() {
    super("PrivateScene");
  }

  async create() {


    if (!this.room) {
      // Join or create room based on target session ID
      this.room = await networkManager.joinPrivateRoomByUserId(
        this.playerData,
        this.targetSessionId!
      );

    }

    room_ = this.room;
    this.myId = this.room.sessionId;

    console.log("Connected to private room:", this.room.roomId);
    console.log("Room is based on session:", this.targetSessionId);
    const $ = getStateCallbacks(this.room);
    console.log("PrivateScene: create started");
    console.log("Connected to main room:", this.room.roomId);

    const { width, height } = this.scale;
    //background image
    this.add.image(width * 0.5, height * 0.5, 'fishtank').setDisplaySize(width, height)

    this.room.onMessage("chat", (msg) => console.log(" asd", msg));


    this.events.once("shutdown", () => {
      if (this.room) {
        Object.values(this.playerEntities).forEach((entity) => {
          if (entity && !entity.scene) return;
          entity.destroy();
        });
        Object.values(this.playerNameLabels).forEach((label) => {
          if (label && !label.scene) return;
          label.destroy();
        });
        Object.values(this.playerHats).forEach((hat) => {
          if (hat && !hat.scene) return;
          hat.destroy();
        });
        Object.values(this.playerBracelets).forEach((bracelet) => {
          if (bracelet && !bracelet.scene) return;
          bracelet.destroy();
        });

        if (this.room.connection.isOpen) {
          this.room.leave();
        }
        networkManager.clearPrivateRoom();
        this.room = undefined!;
      }
    });

    $(this.room.state).players.onAdd((player, sessionId) => {
      console.log(`   Player added: ${sessionId}`);

      const { width, height } = this.scale;

      const boundWidth = width * 0.75;
      const boundHeight = height * 0.4;

      const offsetX = width * 0.12;
      const offsetY = height * 0.45;

      const spawnMinX = offsetX;
      const spawnMaxX = offsetX + boundWidth;
      const spawnMinY = offsetY;
      const spawnMaxY = offsetY + boundHeight;

      player.x = Phaser.Math.Clamp(player.x, spawnMinX, spawnMaxX);
      player.y = Phaser.Math.Clamp(player.y, spawnMinY, spawnMaxY);

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
          return;
        }
        pointer.event.stopPropagation();

        console.log("Clicked on player:", sessionId);
        console.log("Player data:", player);

        window.onPhaserPlayerClick?.({
          sessionId,
          userId: player.userId,
          displayName: player.displayName,
          bodyColor: player.color,
        });

      });

      this.playerEntities[sessionId] = entity;

      $(player).listen("color", (newColor, previousColor) => {
        console.log(`[PrivateScene] Body color changed for ${sessionId}: ${previousColor} -> ${newColor}`);
        const entity = this.playerEntities[sessionId];
        if (!entity) {
          console.warn(`[PrivateScene] Entity not found for ${sessionId}`);
          return;
        }

        if (this.textures.exists(newColor)) {
          entity.setTexture(newColor);
          console.log(`[PrivateScene] Updated ${sessionId} texture to ${newColor}`);
        } else {
          console.warn(`[PrivateScene] Texture ${newColor} not found for player ${sessionId}`);
        }
      });

      if (player.equippedHat) {
        const hatTexture = `hat-${player.equippedHat}`;
        console.log(`Creating hat for ${sessionId} with texture: ${hatTexture}`);
        if (this.textures.exists(hatTexture)) {
          const hat = this.add.image(entity.x, entity.y - 39, hatTexture).setScale(0.8);
          this.playerHats[sessionId] = hat;
        } else {
          console.warn(`Hat texture ${hatTexture} not found`);
        }
      }

      $(player).listen("equippedHat", (value, previousValue) => {
        console.log(`Hat changed for ${sessionId}: ${previousValue} -> ${value}`);
        const entity = this.playerEntities[sessionId];
        if (!entity) return;

        // remove old hat
        const oldHat = this.playerHats[sessionId];
        if (oldHat) {
          oldHat.destroy();
          delete this.playerHats[sessionId];
        }

        // add new hat
        if (value) {
          const hatTexture = `hat-${value}`;
          if (this.textures.exists(hatTexture)) {
            const hat = this.add.image(entity.x, entity.y - 39, hatTexture).setScale(0.8);
            this.playerHats[sessionId] = hat;
          }
        }
      });

      // add bracelet rendering
      if (player.equippedBracelet) {
        const braceletTexture = `bracelet-${player.equippedBracelet}`;
        console.log(`Creating bracelet for ${sessionId} with texture: ${braceletTexture}`);
        if (this.textures.exists(braceletTexture)) {
          const bracelet = this.add.image(entity.x + 32, entity.y + 7, braceletTexture).setScale(0.8);
          this.playerBracelets[sessionId] = bracelet;
        } else {
          console.warn(`Bracelet texture ${braceletTexture} not found`);
        }
      }

      $(player).listen("equippedBracelet", (value, previousValue) => {
        console.log(`Bracelet changed for ${sessionId}: ${previousValue} -> ${value}`);
        const entity = this.playerEntities[sessionId];
        if (!entity) return;

        // remove old bracelet
        const oldBracelet = this.playerBracelets[sessionId];
        if (oldBracelet) {
          oldBracelet.destroy();
          delete this.playerBracelets[sessionId];
        }

        // add new bracelet
        if (value) {
          const braceletTexture = `bracelet-${value}`;
          if (this.textures.exists(braceletTexture)) {
            const bracelet = this.add.image(entity.x + 32, entity.y + 7, braceletTexture).setScale(0.8);
            this.playerBracelets[sessionId] = bracelet;
          }
        }
      });

      if (sessionId === this.room.sessionId) {
        this.currentPlayer = entity;

        this.physics.world.setBounds(offsetX, offsetY, boundWidth, boundHeight);
        entity.setCollideWorldBounds(true);

        this.events.emit("scene:ready");

      } else {

        entity.setData("serverX", player.x);
        entity.setData("serverY", player.y);
        console.log(`[PRIV] Initial pos for ${sessionId}: (${player.x}, ${player.y})`);

        let changeCount = 0;
        $(player).onChange(() => {
          changeCount++;
          entity.setData("serverX", player.x);
          entity.setData("serverY", player.y);
          
          // Log first 10 changes to see if it's working
          if (changeCount <= 10) {
            console.log(`[PRIV] onChange #${changeCount} for ${sessionId}: (${player.x}, ${player.y})`);
          }
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

      if (entity.body) {
        entity.body.destroy();
      }

      if (entity) {
        console.log(`    Destroying entity for ${sessionId}`);
        entity.destroy();
        delete this.playerEntities[sessionId];
      }

      const nameLabel = this.playerNameLabels[sessionId];
      if (nameLabel) {
        nameLabel.destroy();
        delete this.playerNameLabels[sessionId];
      }

      // destroy hat
      const hat = this.playerHats[sessionId];
      if (hat) {
        hat.destroy();
        delete this.playerHats[sessionId];
      }

      // destroy bracelet
      const bracelet = this.playerBracelets[sessionId];
      if (bracelet) {
        bracelet.destroy();
        delete this.playerBracelets[sessionId];
      }

      console.log(`   Remaining players:`, Object.keys(this.playerEntities));
    });

    this.input.on(
      "pointerup",
      (pointer: Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
        console.log("pointerup overlay flag:", (window as any).__overlayOpen);
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

    const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;

    // check if player hit world bounds
    if (body.blocked.left || body.blocked.right || body.blocked.up || body.blocked.down) {
      body.setVelocity(0, 0);
      this.isMoving = false;
    }

    const distance = Phaser.Math.Distance.Between(
      this.currentPlayer.x,
      this.currentPlayer.y,
      this.target.x,
      this.target.y
    );

    if (this.isMoving) {
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

      const nameLabel = this.playerNameLabels[sessionId];
      if (nameLabel && entity) {
        nameLabel.x = entity.x - nameLabel.width / 2;
        nameLabel.y = entity.y - 75;
      }

      const hat = this.playerHats[sessionId];
      if (hat && entity) {
        hat.x = entity.x;
        hat.y = entity.y - 39;
      }

      const bracelet = this.playerBracelets[sessionId];
      if (bracelet && entity) {
        bracelet.x = entity.x + 32;
        bracelet.y = entity.y + 7;
      }
    }
  }
}