import Phaser from "phaser";

export class LoadingScene extends Phaser.Scene {
  private targetScene!: string;
  private targetData!: any;

  constructor() {
    super("LoadingScene");
  }

  init(data: { targetScene: string; targetData?: any }) {
    this.targetScene = data.targetScene;
    this.targetData = data.targetData || {};
  }

  create() {
    // launch target scene
    this.scene.launch(this.targetScene, this.targetData);

    const targetScene = this.scene.get(this.targetScene);
    targetScene.events.once("scene:ready", () => {
      this.scene.stop("LoadingScene");
      this.scene.bringToTop(this.targetScene);
    });
  }
}