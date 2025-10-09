"use client";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Image from "next/image";
import Link from "next/link"
import { ModeToggle } from "../ui/toggle-theme";
import { Logo } from "@/components/svg/logo";
import { PlayButton } from "@/components/svg/play-button";

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Separator } from "../ui/separator";
import { useState } from "react";

export default function Navbar() {

    const items = [
        { href: "/", label: "Home" },
        { href: "/login", label: "Create Fish" },
        { href: "https://web-deployment-sandy.vercel.app/", label: "Company" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact-us", label: "Contact" },



    ];
    return (
        <header className="h-16 md:h-18 flex-shrink-0  grid md:grid-cols-4 grid-cols-3 w-full py-2 px-4">
            <div className="flex md:hidden justify-start">
                <MobileNav />
            </div>
            <div className="flex items-center justify-center col-span-1">
                <Link href="/">
                    <Logo className="text-foreground !h-[44px] !w-[70px]" />
                </Link>
            </div>
            <div className="md:flex hidden w-full flex-1 items-center md:col-span-2 col-span-1">
                <NavigationMenu className="mx-auto" viewport={false}>
                    <NavigationMenuList>
                        {items.map((item) => (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href={item.href}>{item.label}</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <div className="flex items-center justify-end md:justify-center col-span-1 gap-6">
                <div className="hidden lg:flex">
                    <Button variant="default" size="lg" className="bg-amber-400 cursor-pointer text-foreground hover:bg-amber-500 border-2 border-amber-300 dark:border-amber-600" asChild>
                        <Link href="/play" className="!flex !items-center justify-center">
                            <PlayButton className="!h-5 !w-auto fill-background" />
                        </Link>
                    </Button>
                </div>
                <ModeToggle />
            </div>
        </header>
    );
}


function MobileNav() {
    const [open, setOpen] = useState<boolean>(false);
    const items = [
        { href: "/", label: "Home" },
        { href: "/login", label: "Create Fish" },
        { href: "/company", label: "Company" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },



    ];
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden" size="icon">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>
                        Menu
                    </SheetTitle>
                </SheetHeader>

                <Separator className="my-2 mb-4" />

                <nav className="flex flex-col gap-4 !mt-2">
                    {items.map((item) => (
                        <div key={item.href}>
                            <SheetClose asChild >
                                <Link
                                    href={item.href}
                                    className="px-2 py-2 text-lg font-medium text-foreground rounded transition-colors"
                                >
                                    {item.label}
                                </Link>

                            </SheetClose>
                            <div>
                                <Separator className="my-2" />
                            </div>
                        </div>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
}