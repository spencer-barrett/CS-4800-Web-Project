import Phaser from "phaser";
import { renderCharacterSVG, svgToDataURL } from "@/components/svg/char-forward";
import { networkManager } from "@/lib/colyseus/networkController";

import { Client, Room } from "colyseus.js"
import { MainRoom } from "@/types/myroomstate";
//import { room } from "@/hooks/useChatMessages";


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
  }

  async create(data: { targetScene?: string; bodyColor?: string }) {
    const targetScene = data.targetScene || "MainScene";
    const bodyColor = data.bodyColor || "#60cbfcff";

  
  
  const svg = renderCharacterSVG(bodyColor);
    const dataUrl = svgToDataURL(svg);
    const img = new Image();

   
    console.log("BootScene: create started", data);

    

    img.onload = () => {
      const key = `fish-${bodyColor}`;
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addImage(key, img);

      this.scene.start(targetScene, {  bodyColor });
    };

    img.onerror = (e) => {
      console.error(" Failed to decode SVG", e);
      this.scene.start(data.targetScene, { bodyColor: data.bodyColor });
    };

    img.src = dataUrl;
  }

 
  update(time: number, delta: number) {
    super.update(time, delta);


  }
}