import Phaser from "phaser";
import { renderCharacterSVG, svgToDataURL } from "@/components/svg/char-forward";
import { PlayerData } from "@/types/player-data";

export class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }

  preload() {
    console.log("BootScene: preload started");
    this.load.image("ocean", "/assets/background.png");
    this.load.image("bg", "/gradient.png");

    //minigameRPS assets
    this.load.image('rps-bg', 'assets/rps-bg2.png') //replace asset later
    this.load.spritesheet('kelp', 'assets/kelp.png', { frameWidth: 1000, frameHeight: 1000})
    this.load.spritesheet('claw', 'assets/claw.png', { frameWidth: 1000, frameHeight: 1000})
    this.load.spritesheet('coral', 'assets/coral.png', { frameWidth: 1000, frameHeight: 1000})

    //loading screen
    this.load.image('loading', '/assets/sky.png')
    this.load.image("priv", "private.png");
  }

  async create(data: { targetScene?: string; playerData: PlayerData | null }) {
    //trying to make scene scale, not working yet
    this.scale.displaySize.setAspectRatio( 1200/675 );
    this.scale.refresh();

    

    const targetScene = data.targetScene || "MainScene";
    if (!data.playerData) {
      console.warn("BootScene received null playerData! Using defaults.");
      data.playerData = {
        bodyColor: "#60cbfcff",
        displayName: "anonymous",
        currency: 0,
      };
    }
    console.log("body color in boot: ", data.playerData.bodyColor);
    console.log("display name in boot: ", data.playerData.displayName);
    console.log("currency in boot: ", data.playerData.currency);

    const allColors = [
      data.playerData.bodyColor, // Current player's color
      "#fcb360ff", // Orange
      "#60cbfcff",   // Blue
      "#60fc75ff",   // Green
      "#FBEC5D",// Yellow
      "#ff3650"   // Red Fallback
      // ... add more colors as needed
    ];



    let loadedCount = 0;
    const totalColors = allColors.length;

    allColors.forEach(color => {
      const key = `fish-${color}`;
      const svg = renderCharacterSVG(color);
      const dataUrl = svgToDataURL(svg);
      const img = new Image();

      img.onload = () => {
        if (this.textures.exists(key)) this.textures.remove(key);
        this.textures.addImage(key, img);
        
        const tex = this.textures.get(key);
        tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
        loadedCount++;

        // Start scene when all textures are loaded
        if (loadedCount === totalColors) {
          // this.scene.start(targetScene, { playerData: data.playerData });
          if (targetScene === "CharacterCreate") {
            this.scene.start(targetScene, { playerData: data.playerData });
          } else {
            // Route MainScene (and others) through LoadingScene
            this.scene.start("LoadingScene", {
              targetScene: targetScene,
              targetData: { playerData: data.playerData },
            });
          }
          this.scene.stop();
        }
      };

      img.onerror = (e) => {
        console.error(`Failed to load texture for ${color}`, e);
        loadedCount++;
        if (loadedCount === totalColors) {
          this.scene.start(targetScene, { playerData: data.playerData });
        }
      };

      img.src = dataUrl;
    });
  }


  update(time: number, delta: number) {
    super.update(time, delta);


  }
}