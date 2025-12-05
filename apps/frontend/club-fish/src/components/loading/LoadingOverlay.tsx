"use client";

import { BarLoader } from "react-spinners";

export default function LoadingOverlay() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1220]">
            <p className="my-4 text-white text-4xl font-[800]">Loading...</p>
            <BarLoader color="#27A59B" width={350} height={24} cssOverride={{borderRadius: "12px"}}/>

        </div>
    );
}