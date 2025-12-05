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
    this.load.image('rps-bg', 'assets/rps-bg-full.png')
    this.load.spritesheet('kelp', 'assets/kelp.png', { frameWidth: 1000, frameHeight: 1000 })
    this.load.spritesheet('claw', 'assets/claw.png', { frameWidth: 1000, frameHeight: 1000 })
    this.load.spritesheet('coral', 'assets/coral.png', { frameWidth: 1000, frameHeight: 1000 })
    //memory match assets
    this.load.image('table', '/assets/card_table.png')
    //card assets for memory match, free assets by KIN on itch.io
    this.load.spritesheet('card_back', 'assets/cards/Back_2.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Spades_ACE', 'assets/cards/Spades_ACE.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Spades_K', 'assets/cards/Spades_K.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Spades_Q', 'assets/cards/Spades_Q.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Spades_J', 'assets/cards/Spades_J.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Diamonds_ACE', 'assets/cards/Diamonds_ACE.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Diamonds_K', 'assets/cards/Diamonds_K.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Diamonds_Q', 'assets/cards/Diamonds_Q.png', { frameWidth: 800, frameHeight: 800 });
    this.load.spritesheet('Diamonds_J', 'assets/cards/Diamonds_J.png', { frameWidth: 800, frameHeight: 800 });

    //loading screen
    this.load.image('loading', '/assets/sky.png')
    this.load.image("priv", "private.png");

    //private room
    this.load.image("fishtank", "/assets/fishtank.png");

    //music
    this.load.audio("main-theme", "/audio/beach_BK.mp3");
  }

  async create(data: { targetScene?: string; playerData: PlayerData | null }) {
    //trying to make scene scale, not working yet
    this.scale.displaySize.setAspectRatio(1200 / 675);
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

    // all available body colors
    const allColors = [
      data.playerData.bodyColor, // Current player's color
      "#fcb360ff", // Orange
      "#60cbfcff", // Blue
      "#60fc75ff", // Green
      "#FBEC5D",   // Yellow
      "#ff3650",   // Red
      "#9370DB",   // Purple
      "#FFB6C1",   // Pink
    ];

    // remove duplicates
    const uniqueColors = [...new Set(allColors)];

    //  all hat items with their variants
    const hatItems = [
      // Baseball hats
      { id: 'baseball-red', variant: 'baseball', color: '#DC143C' },
      { id: 'baseball-blue', variant: 'baseball', color: '#4169E1' },
      { id: 'baseball-black', variant: 'baseball', color: '#2C2C2C' },
      // Top hats
      { id: 'tophat-black', variant: 'tophat', color: '#2C2C2C' },
      { id: 'tophat-green', variant: 'tophat', color: '#228B22' },
      { id: 'tophat-red', variant: 'tophat', color: '#DC143C' },
    ];

    const braceletItems = [
      { id: 'bracelet-green', color: '#00a774' },
      { id: 'bracelet-blue', color: '#4169E1' },
      { id: 'bracelet-red', color: '#DC143C' },
      { id: 'bracelet-purple', color: '#9370DB' },
      { id: 'bracelet-gold', color: '#FFD700' },
      { id: 'bracelet-silver', color: '#C0C0C0' },
    ];

    let loadedCount = 0;
    const totalTextures = uniqueColors.length + hatItems.length + braceletItems.length;

    // Load fish textures for all colors
    uniqueColors.forEach(color => {
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
        console.log(`Loaded fish texture: ${key} (${loadedCount}/${totalTextures})`);

        // start scene when all textures are loaded
        if (loadedCount === totalTextures) {
          this.startTargetScene(targetScene, data.playerData!);
        }
      };

      img.onerror = (e) => {
        console.error(`Failed to load texture for ${color}`, e);
        loadedCount++;
        if (loadedCount === totalTextures) {
          this.startTargetScene(targetScene, data.playerData!);
        }
      };

      img.src = dataUrl;
    });

    const { renderHatSVGByVariant, svgToDataURL: hatSvgToDataURL } = await import("@/lib/cosmetics/cosmeticHelpers");

    hatItems.forEach(({ id, variant, color }) => {
      const key = `hat-${id}`;
      const svg = renderHatSVGByVariant(id);
      const dataUrl = hatSvgToDataURL(svg);
      const img = new Image();

      img.onload = () => {
        if (this.textures.exists(key)) this.textures.remove(key);
        this.textures.addImage(key, img);

        const tex = this.textures.get(key);
        tex.setFilter(Phaser.Textures.FilterMode.NEAREST);

        loadedCount++;
        console.log(`Loaded hat texture: ${key} (${variant}) (${loadedCount}/${totalTextures})`);

        if (loadedCount === totalTextures) {
          this.startTargetScene(targetScene, data.playerData!);
        }
      };

      img.onerror = (e) => {
        console.error(`Failed to load hat texture for ${id}`, e);
        loadedCount++;
        if (loadedCount === totalTextures) {
          this.startTargetScene(targetScene, data.playerData!);
        }
      };

      img.src = dataUrl;
    });

    const { renderBraceletSVGById, svgToDataURL: braceletSvgToDataURL } = await import("@/lib/cosmetics/cosmeticHelpers");

    braceletItems.forEach(({ id, color }) => {
      const key = `bracelet-${id}`;
      const svg = renderBraceletSVGById(id);
      const dataUrl = braceletSvgToDataURL(svg);
      const img = new Image();

      img.onload = () => {
        if (this.textures.exists(key)) this.textures.remove(key);
        this.textures.addImage(key, img);

        const tex = this.textures.get(key);
        tex.setFilter(Phaser.Textures.FilterMode.NEAREST);

        loadedCount++;
        console.log(`Loaded bracelet texture: ${key} (${loadedCount}/${totalTextures})`);

        if (loadedCount === totalTextures) {
          this.startTargetScene(targetScene, data.playerData!);
        }
      };

      img.onerror = (e) => {
        console.error(`Failed to load bracelet texture for ${id}`, e);
        loadedCount++;
        if (loadedCount === totalTextures) {
          this.startTargetScene(targetScene, data.playerData!);
        }
      };

      img.src = dataUrl;
    });
  }

  private startTargetScene(targetScene: string, playerData: PlayerData) {
    // CharacterCreate doesn't need a loading screen
    if (targetScene === "CharacterCreate") {
      this.scene.start(targetScene, { playerData });
    } else {
      this.scene.start("LoadingScene", {
        targetScene: targetScene,
        targetData: { playerData },
      });
    }
    this.scene.stop();
  }

  update(time: number, delta: number) {
    super.update(time, delta);
  }
}