"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";

type PhaserGameWithCleanup = Phaser.Game & {
    __reactOverlayCleanup?: () => void;
};

/**
 * Arguments passed to the overlay render function
 */
type OverlayArgs = {
    game: Phaser.Game | null;
    width: number;
    height: number;
    sceneKey: string | null;
};


/**
 * Props for the PhaserCanvas component
 */
type Props = {
    width?: number;
    height?: number;
    bootData?: Record<string, unknown>;
    parentClassName?: string;
    initialScene?: "MainScene" | "CharacterCreate";
    renderOverlay?: (args: OverlayArgs) => React.ReactNode;
};


/**
 * PhaserCanvas Component
 * React wrapper for Phaser game instances that handles initialization, lifecycle,
 * and an overlay system for rendering React UI on top of the canvas.
  */
export default function PhaserCanvas({
    width = 1200,
    height = 675,
    parentClassName = "w-fit h-fit",
    initialScene = "MainScene",
    renderOverlay,
    bootData
}: Props) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<PhaserGameWithCleanup | null>(null);
    const [size] = useState({ w: width, h: height });
    const [activeSceneKey, setActiveSceneKey] = useState<string | null>(null);


    /**
     * Effect to initialize and manage the Phaser game lifecycle.
     */
    useEffect(() => {
        let mounted = true;

        (async () => {
            const Phaser = (await import("phaser")).default;
            const { BootScene } = await import("./scenes/BootScene");
            const { MainScene } = await import("./scenes/MainScene");
            const { CharacterCreateScene } = await import("./scenes/CharacterCreateScene");

            if (!mounted || !mountRef.current) return;

            const game = new Phaser.Game({
                type: Phaser.AUTO,
                parent: mountRef.current,
                width,
                height,
                backgroundColor: "#0b1220",
                physics: { default: "arcade", arcade: { gravity: { y: 0, x: 0 } } },
                scene: [BootScene, CharacterCreateScene, MainScene],
                callbacks: {
                    preBoot: (g) => g.registry.set("initialScene", initialScene),
                },
            }) as PhaserGameWithCleanup;

            gameRef.current = game;

            const sm = game.scene;
            const bootPayload = {
                targetScene: initialScene,
                ...bootData
            };
            game.scene.start("boot", bootPayload);

            /**
             * Used to determine which overlay to render.
             */
            const updateSceneKey = () => {
                const scenes = sm.getScenes(true) as Phaser.Scene[];
                if (!scenes.length) return;
                const top = scenes[scenes.length - 1];
                setActiveSceneKey(top.scene.key);
            };

            game.events.on(Phaser.Core.Events.POST_STEP, updateSceneKey);

            const onUiScene = (key: string) => setActiveSceneKey(key);
            game.events.on("ui:scene", onUiScene);

            return () => {
                game.events.off(Phaser.Core.Events.POST_STEP, updateSceneKey);
                game.events.off("ui:scene", onUiScene);
            };
        })();

        return () => {
            mounted = false;
            gameRef.current?.__reactOverlayCleanup?.();
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [width, height, initialScene, renderOverlay, bootData]);

    return (
        <div
            className={parentClassName}
            style={{ width, height, position: "relative" }}
        >
            <div ref={mountRef} style={{ width: "100%", height: "100%" }} />


            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    display: "grid",
                    placeItems: "center",
                    pointerEvents: "none",
                }}
            >
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    {/* // specify what is clickable in overlay components */}
                    {renderOverlay?.({
                        game: gameRef.current,
                        width: size.w,
                        height: size.h,
                        sceneKey: activeSceneKey,
                    })}
                </div>
            </div>
        </div>

    );
}