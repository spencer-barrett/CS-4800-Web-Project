import Phaser from "phaser";
import { Math as pMath } from "phaser";
import Pointer = Phaser.Input.Pointer;
import { getStateCallbacks } from "colyseus.js";
import type { MainRoom } from "@/types/myroomstate";
import { networkManager } from "@/lib/colyseus/networkController";
import { PlayerData } from "@/types/player-data";
const { Vector2 } = pMath;

export let room_: MainRoom;
//export let room_dmRouting: MainRoom;
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

  myId = "";
  //myDmId = "";
  private room!: MainRoom;
  fish!: Phaser.GameObjects.Image;
  // private bodyColor = "#60cbfcff";
  // private displayName = "anonymous";
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

  //TEMPORARY BTUTON FOR RPS /////////////////////
  private go_rps!: Phaser.GameObjects.Sprite/////////////
  ////////////////////////////////////////////

  init(data: { room: MainRoom; playerData: PlayerData }) {
    console.log("MainScene: init", data);
    this.playerData = data.playerData;
    this.inputPayload.color = this.playerData.bodyColor ?? "#964B00";
  }

  constructor() {
    super("MainScene");
  }

  async create() {
    //custom cursor
    // this.input.setDefaultCursor("url(assets/cursor-small.cur), pointer");

    //connect to dm routing room, this should be done in a background scene actually. 

    // this.dmRoutingRoom = await networkManager.connectNonMainRoom("dmRouting", 300);
    // room_dmRouting = this.dmRoutingRoom;
    // //this.myDmId = this.dmRoutingRoom.sessionId; //this should be the same id for all rooms anyways
    // const dmCallbacks = getStateCallbacks(this.dmRoutingRoom);
    // console.log("Connected to dm routing room:", this.dmRoutingRoom.roomId);


    //connect to main room
    this.room = await networkManager.connectMainRoom(this.playerData);

    room_ = this.room;
    this.myId = this.room.sessionId;
    const $ = getStateCallbacks(this.room);
    console.log("MainScene: create started");
    console.log("Connected to main room:", this.room.roomId);

    //launch background scene to listen for dms globally
    // this.scene.launch('dms', this.playerData);
    // this.scene.moveAbove('MainScene', 'dms');

    this.room.onMessage("chat", (msg) => console.log(" asd", msg));
    const { width, height } = this.scale;

    const key = `fish-${this.playerData.bodyColor}`;
    console.log(`Fish texture "${key}" exists?`, this.textures.exists(key));
    console.log("name: ", this.playerData.displayName);

    this.add.image(width * 0.5, height * 0.5, "ocean").setOrigin(0.5);

    //TEMPORARY BUTTON FOR MOVING TO RPS SCENE
    this.go_rps = this.add.sprite(width*0.1, height * 0.5, "kelp").setInteractive().setScale(0.1)
    this.go_rps.on('pointerdown', () => {
      //this.scene.restart()
      this.scene.start('rps-helper')
    })
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(this.room.state).players.onAdd((player, sessionId) => {
      console.log(`   Player added: ${sessionId}`);
      console.log(`   My ID: ${this.room.sessionId}`);
      console.log(`   Is me? ${sessionId === this.room.sessionId}`);

      console.log(`   Initial position: (${player.x}, ${player.y})`);

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
    // console.log("Overlay is open, ignoring click");
    return;
  }
        pointer.event.stopPropagation();

        console.log("Clicked on player:", sessionId);
        console.log("Player data:", player);

        window.dispatchEvent(
  new CustomEvent("game:playerClick", {
    detail: { 
      sessionId,
      playerData: {
        displayName: player.displayName,
        bodyColor: player.color,
      }
    } as { sessionId: string; playerData: { displayName: string; bodyColor: string } },
  })
);
      });

      console.log("penguin texture size:", entity.width, entity.height);
      this.playerEntities[sessionId] = entity;

      if (sessionId === this.room.sessionId) {
        console.log(`      This is MY player`);
        this.currentPlayer = entity;
      } else {
        console.log(`      This is a REMOTE player`);
        console.log(
          `   color ${this.room.state.players.get(sessionId)?.color}`
        );
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
      }

      const nameLabel = this.playerNameLabels[sessionId];
      if (nameLabel) {
        nameLabel.destroy();
        delete this.playerNameLabels[sessionId];
      }

      console.log(`   Remaining players:`, Object.keys(this.playerEntities));
    });

    this.input.on(
      "pointerup",
      (pointer: Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
        // If pointer was over any interactive object, skip movement
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
      // console.log(
      //   `  [${this.room.sessionId}] Sending position: (${this.inputPayload.x}, ${this.inputPayload.y})`
      // );
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
export async function createNonMainRoom(type: string, size: number): Promise<any> {
    room_ = await networkManager.connectNonMainRoom(type, size);
    console.log(room_.roomId)
  }