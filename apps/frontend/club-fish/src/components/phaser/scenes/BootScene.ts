import Phaser from "phaser";
import { renderCharacterSVG, svgToDataURL } from "@/components/svg/char-forward";

export class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }

  preload() {
    console.log("BootScene: preload started");
    this.load.image("ocean", "/assets/background.png");
    this.load.image("bg", "/gradient.png");
  }

  create(data: { targetScene?: string; bodyColor?: string }) {
    console.log("BootScene: create started", data);

    const targetScene = data.targetScene || "MainScene";
    const bodyColor = data.bodyColor || "#60cbfcff";

    const svg = renderCharacterSVG(bodyColor);
    const dataUrl = svgToDataURL(svg);
    const img = new Image();

    img.onload = () => {
      const key = `fish-${bodyColor}`;
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addImage(key, img);

      this.scene.start(targetScene, { bodyColor });
    };

    img.onerror = (e) => {
      console.error(" Failed to decode SVG", e);
      this.scene.start(targetScene, { bodyColor });
    };

    img.src = dataUrl;
  }

  update(time: number, delta: number) {
      super.update(time, delta);


  }
}