import Phaser from "phaser";

export class LoadingScene extends Phaser.Scene {
  private targetScene!: string;
  private targetData!: any;
  private hasTransitioned: boolean = false;
  private hasLaunched: boolean = false;

  constructor() {
    super("LoadingScene");
  }

  init(data: { targetScene: string; targetData?: any }) {
    this.targetScene = data.targetScene;
    this.targetData = data.targetData || {};
    this.hasTransitioned = false;
    this.hasLaunched = false;
  }

  create() {
    if (this.hasLaunched) return;
    this.hasLaunched = true;

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1220);

   
    if (this.targetScene === "MainScene") {
        
      this.time.delayedCall(1500, () => {
        if (this.hasTransitioned) return;
        this.hasTransitioned = true;
        this.scene.start(this.targetScene, this.targetData);
      });
    } else {
      // Other scenes work fine with parallel launch
      this.scene.launch(this.targetScene, this.targetData);
      const targetScene = this.scene.get(this.targetScene);

      const handleReady = () => {
        if (this.hasTransitioned) return;
        this.hasTransitioned = true;

        targetScene.events.off("scene:ready", handleReady);

        this.scene.stop("LoadingScene");
        this.scene.bringToTop(this.targetScene);
      };

      targetScene.events.once("scene:ready", handleReady);

      this.time.delayedCall(5000, () => {
        if (!this.hasTransitioned) {
          console.warn("LoadingScene timeout - forcing transition");
          handleReady();
        }
      });
    }
  }
}