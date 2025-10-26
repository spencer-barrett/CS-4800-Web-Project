import * as Phaser from 'phaser';

export class TimerBar {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private totalTime: number;

    private background: Phaser.GameObjects.Graphics;
    private foreground: Phaser.GameObjects.Graphics;
    private timerEvent: Phaser.Time.TimerEvent;

    /**
     * Creates a new timer bar.
     * @param scene The Phaser scene to add the timer bar to.
     * @param x The x-coordinate of the timer bar.
     * @param y The y-coordinate of the timer bar.
     * @param width The width of the timer bar.
     * @param height The height of the timer bar.
     * @param totalTime The total time for the timer bar in milliseconds.
     */
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, totalTime: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.totalTime = totalTime;

        // Create the background bar
        this.background = this.scene.add.graphics({ x: this.x, y: this.y });
        this.background.fillStyle(0x000000, 0.5); // Semi-transparent black
        this.background.fillRect(0, 0, this.width, this.height);

        // Create the foreground bar
        this.foreground = this.scene.add.graphics({ x: this.x, y: this.y });
        this.foreground.fillStyle(0x00ff00, 1); // Solid green
        this.foreground.fillRect(0, 0, this.width, this.height);

        // Create the timer event that will tick down
        this.timerEvent = this.scene.time.addEvent({
            delay: this.totalTime,
            callback: this.onTimerComplete,
            callbackScope: this,
            loop: false,
        });
    }

    /**
     * Updates the width of the foreground bar based on the timer's progress.
     */
    public update(): void {
        const remainingTime = this.timerEvent.getRemaining();
        const progress = remainingTime / this.totalTime;
        
        // Use the progress to set the width of the foreground bar
        this.foreground.clear();
        this.foreground.fillStyle(this.getBarColor(progress), 1);
        this.foreground.fillRect(0, 0, this.width * progress, this.height);
    }

    /**
     * Resets the timer bar to its full state.
     */
    public reset(): void {
        this.timerEvent.reset({
            delay: this.totalTime,
            callback: this.onTimerComplete,
            callbackScope: this,
            loop: false,
        });
        this.update();
    }

    /**
     * Stops and destroys the timer bar.
     */
    public destroy(): void {
        this.timerEvent.destroy();
        this.background.destroy();
        this.foreground.destroy();
    }

    /**
     * Provides a color gradient from green to red based on the remaining time.
     * @param progress The timer's progress (0.0 to 1.0).
     * @returns A hex color value.
     */
    private getBarColor(progress: number): number {
        if (progress > 0.5) {
            return 0x00ff00; // Green
        } else if (progress > 0.25) {
            return 0xffff00; // Yellow
        } else {
            return 0xff0000; // Red
        }
    }

    /**
     * Callback function executed when the timer completes.
     */
    private onTimerComplete(): void {
        console.log("Timer finished!");
        // Add logic for when the timer is done, e.g., end the round, trigger an event.
    }
}
