"use client";

import { withAuth } from "@/components/auth/authReq";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/clientApp";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import CharacterCreateOverlay from "@/components/game-ui/CharacterCreateOverlay";
import { ChatWindow } from "@/components/chat/ChatWindow";
import {
  Store,
  StoreIcon,
  Swords,
  Users,
  BedSingle,
  Settings,
} from "lucide-react";
import MenuBar from "@/components/game-ui/MainHud/MenuBar";
import { useUserGameData } from "@/hooks/useUserGameData";

// import PhaserCanvas to prevent SSR issues with Phaser
const PhaserCanvas = dynamic(() => import("@/components/phaser/PhaserCanvas"), {
  ssr: false,
});

// Define available game scenes
type SceneKey = "MainScene" | "CharacterCreate";

/**
 * MainHudOverlay Component
 * Renders the in-game HUD overlay with a menu button and modal menu dialog.
 * Provides access to game settings and options to resume gameplay.
 *
 * TODO: Implement entire bottom UI bar and menus
 */
function MainHudOverlay({
  changeScene,
}: {
  changeScene: (scene: SceneKey) => void;
}) {


  return (
    <>

      <ChatWindow />
      <MenuBar />

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
    const onboarding = params.get("onboarding");
    const { loading, initialScene, bodyColor, displayName } = useUserGameData(onboarding);
        
  /**
   * Sign out handler that logs the user out of Firebase authentication
   */
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
  if (loading || !initialScene) {
    
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
                        bootData={{ bodyColor, displayName }}
                    />
                </div>
                <Button onClick={handleSignOut}>Sign Out!</Button>
            </div>

        </div>
      
    );
  }


export default withAuth(PlayPage);
