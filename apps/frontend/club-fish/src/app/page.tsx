"use client";

import Image from "next/image";

export default function Home() {



  //bg-[#29cfb4]
  return (
    <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-72px)] w-full bg-[#29cfb4] bg-cover bg-center ">
      {/* <div className="absolute top-0 left-0 z-10 bg-background/40 h-svh w-svw backdrop-blur-sm" /> */}

   <img src="/hero.png" className="object-cover h-full w-full"/>

    </div>
  );
}
