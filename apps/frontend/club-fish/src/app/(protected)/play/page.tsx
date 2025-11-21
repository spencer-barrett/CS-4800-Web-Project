"use client";

import { withAuth } from "@/components/auth/authReq";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/clientApp";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import CharacterCreateOverlay from "@/components/game-ui/CharacterCreateOverlay";
import { PlayerProvider, usePlayer } from "@/context/playerContext";
import MainHudOverlay from "@/components/game-ui/MainHud/MainHudOverlay";

// import PhaserCanvas to prevent SSR issues with Phaser
const PhaserCanvas = dynamic(() => import("@/components/phaser/PhaserCanvas"), {
  ssr: false,
});


function GameRenderer() {
  const { loading, initialScene, playerData } = usePlayer();

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
        if (sceneKey === "MainScene" || "PrivateScene" || "dms") return <MainHudOverlay />;
        return null;
      };
      Component.displayName = "OverlayRenderer";
      return Component;
    },
    []
  );

  if (loading || !initialScene) {

    return (
      <div className="flex h-[calc(100vh-60px)] items-center justify-center">
        <div className="rounded-xl bg-black/60 text-white px-4 py-2">Loading…</div>
      </div>
    );
  }

 
  if (initialScene === "MainScene" && !playerData) {
    return (<div className="flex h-[calc(100vh-60px)] items-center justify-center">
      <div className="rounded-xl bg-black/60 text-white px-4 py-2">Loading…</div>
    </div>);
  }

  return (
    <div className="flex sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-[#27A59B]">
      <div className="flex flex-col w-full h-full items-center justify-center">


        <div className="max-w-[1200px] w-full aspect-video bg-black mb-6 rounded-md">
          {/*phaser canvas */}
          <PhaserCanvas
            key={initialScene}
            // width={1200}
            // height={675}
            initialScene={initialScene}
            parentClassName="shadow-2xl rounded-md"
            renderOverlay={OverlayRenderer}
            bootData={{ playerData }}
          />
        </div>
        <Button onClick={handleSignOut}>Sign Out!</Button>
      </div>

    </div>

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


  return (
    <PlayerProvider onboardingParam={onboarding}>
      <GameRenderer />
    </PlayerProvider>
  );




}


export default withAuth(PlayPage);
