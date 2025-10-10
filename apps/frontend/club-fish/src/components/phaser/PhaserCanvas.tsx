"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

type Props = { width?: number; height?: number; parentClassName?: string };

export default function PhaserCanvas({
    width = 960,
    height = 540,
    parentClassName = "w-fit h-fit"
}: Props) {
    const parentRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const Phaser = (await import("phaser")).default;
            const { BootScene } = await import("./scenes/BootScene");
            const { MainScene } = await import("./scenes/MainScene");

            if (!mounted || !parentRef.current) {
                return;
            }

            gameRef.current = new Phaser.Game({
                type: Phaser.AUTO,
                parent: parentRef.current,
                width,
                height,
                backgroundColor: "#0b1220",
                physics: {
                    default: "arcade", arcade: {
                        gravity: {
                            y: 0,
                            x: 0
                        }
                    }
                },
                scene: [BootScene, MainScene],
            });
        })();

        return () => {
            mounted = false;
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [width, height]);

    return (<div ref={parentRef} className={parentClassName} />);
}
