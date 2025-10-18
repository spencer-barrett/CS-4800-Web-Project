"use client";

import { withAuth } from "@/components/auth/authReq";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/clientApp";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import CharacterCreateOverlay from "@/components/game-ui/CharacterCreateOverlay";


// import PhaserCanvas to prevent SSR issues with Phaser
const PhaserCanvas = dynamic(
    () => import("@/components/phaser/PhaserCanvas"),
    { ssr: false }
);

// Define available game scenes
type SceneKey = "MainScene" | "CharacterCreate";

/**
 * MainHudOverlay Component
 * Renders the in-game HUD overlay with a menu button and modal menu dialog.
 * Provides access to game settings and options to resume gameplay.
 * 
 * TODO: Implement entire bottom UI bar and menus
 */
function MainHudOverlay() {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <>
            <div className="absolute bottom-3 right-3 space-x-2">
                <Button size="sm" variant="secondary" onClick={() => setShowMenu((v) => !v)}>
                    Menu
                </Button>
            </div>
            {showMenu && (
                <div className="absolute inset-0 grid place-items-center">
                    <div className="w-[420px] rounded-xl border border-white/10 bg-black/70 p-6 text-white backdrop-blur">
                        <h2 className="mb-3 text-xl font-bold">Game Menu</h2>
                        <p className="mb-4 text-sm opacity-80">Change settings or exit to lobby.</p>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowMenu(false)}>Resume</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * PlayPage Component
 * Main game page component that handles authentication state, character creation flow,
 * and renders the appropriate game scene based on user data.
 * 
 * Manages the transition between character creation and main gameplay.
 */
function PlayPage() {
    const params = useSearchParams();
    const [initialScene, setInitialScene] = useState<SceneKey | null>(null);
    const onboarding = params.get("onboarding");
    const [bodyColor, setBodyColor] = useState("");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                if (onboarding) {
                    setInitialScene("CharacterCreate");
                    return;
                }
                if (!user) {
                    setInitialScene("CharacterCreate");
                    return;
                }

                // Fetch user document from Firestore to check character status
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                const hasCharacter = !!snap.data()?.hasCharacter;
                setBodyColor(snap.data()?.bodyColor ?? "#60cbfcff");

                // Route to main scene if character exists, otherwise to character creation
                setInitialScene(hasCharacter ? "MainScene" : "CharacterCreate");
            } catch (e) {
                console.error("onboarding check failed:", e);
                setInitialScene("CharacterCreate");
            }
        });

        return () => unsub();
    }, [onboarding]);

    /**
     * Sign out handler that logs the user out of Firebase authentication
    */
    const handleSignOut = async () => {
        try {
            await auth.signOut();

        } catch (error) {
            console.error("Error signing out:", error);
        }
    }


    /**
     * Memoized overlay renderer component that displays the appropriate UI
     * based on the current active game scene.
     */
    const OverlayRenderer = useMemo(
        () => {
            const Component = ({ game, sceneKey }: { game: Phaser.Game | null; sceneKey: string | null }) => {
                if (sceneKey === "CharacterCreate") return <CharacterCreateOverlay game={game} />;
                if (sceneKey === "MainScene") return <MainHudOverlay />;
                return null;
            };
            Component.displayName = "OverlayRenderer";
            return Component;
        },
        []
    );

    // loading state
    if (!initialScene) {
        return (
            <div className="flex h-[calc(100vh-60px)] items-center justify-center">
                <div className="rounded-xl bg-black/60 text-white px-4 py-2">Loading…</div>
            </div>
        );
    }


    return (
        <div className="flex sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-purple-300">
            <div className="flex flex-col w-full h-full items-center justify-center">


                <div className="w-[1200px] h-[675px] bg-black mb-6">
                    {/*phaser canvas */}
                    <PhaserCanvas
                        key={initialScene}
                        width={1200}
                        height={675}
                        initialScene={initialScene}
                        parentClassName="shadow-2xl rounded-xl"
                        renderOverlay={OverlayRenderer}
                        bootData={{ bodyColor }}
                    />
                </div>
                <Button onClick={handleSignOut}>Sign Out!</Button>
            </div>

        </div>
    );
}

export default withAuth(PlayPage)