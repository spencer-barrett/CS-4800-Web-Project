import Phaser from "phaser";
import { renderCharacterSVG, svgToDataURL } from "@/components/svg/char-forward";

export class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }

  preload() {
    console.log("BootScene: preload started");
    this.load.image("ocean", "/assets/background.png");
    this.load.image("bg", "/gradient.png");
  }

  async create(data: { targetScene?: string; bodyColor?: string }) {
    const targetScene = data.targetScene || "MainScene";
    const bodyColor = data.bodyColor || "#60cbfcff";
    console.log("body color in boot: ", bodyColor);

     const allColors = [
    bodyColor, // Current player's color
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
      loadedCount++;
      
      // Start scene when all textures are loaded
      if (loadedCount === totalColors) {
        this.scene.start(targetScene, { bodyColor });
      }
    };
    
    img.onerror = (e) => {
      console.error(`Failed to load texture for ${color}`, e);
      loadedCount++;
      if (loadedCount === totalColors) {
        this.scene.start(targetScene, { bodyColor });
      }
    };
    
    img.src = dataUrl;
  });
}

 
  update(time: number, delta: number) {
    super.update(time, delta);


  }
}