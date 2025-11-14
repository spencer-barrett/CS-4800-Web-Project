"use client";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "../components/svg/logo";
import { PlayButton } from "../components/svg/play-button";
import { Button } from "@/components/ui/button";


export default function Home() {



  //bg-[#29cfb4]
  return (
    <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-72px)] w-full bg-[#29cfb4] bg-cover bg-center relative">
      {/* <div className="absolute top-0 left-0 z-10 bg-background/40 h-svh w-svw backdrop-blur-sm" /> */}
<Image src="/hero.png" className="object-cover h-full w-full absolute top-0 left-0 z-5 " alt="hero"   width={0}
  height={0}
  sizes="100vw"/>
   <div className="flex flex-col justify-center items-center w-full h-full z-20 absolute top-0 left-0">
       

  {/* <img src="/logoipsum-284.svg" alt="logo" className="h-70 w-90"/> */}
  <Logo className="!h-70 !w-90"/>
<Button
              variant="default"
              className="h-14 w-28 bg-amber-400 cursor-pointer rounded-lg text-foreground hover:bg-amber-500 border-2 border-amber-300 dark:border-amber-600"
              asChild
            >
              <Link
                href="/play"
                className="!flex !items-center justify-center"
              >
                 <PlayButton className="!h-8 !w-auto fill-foreground" />

              </Link>
            </Button>
   </div>
 

    </div>
  );
}
