import Link from "next/link";
import { Logo } from "../svg/logo";
import { PlayButton } from "../svg/play-button";
import { Button } from "../ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Footer() {
  const items = [
    {
      title: "Contact",
      content: [{ label: "contact", href: "/contact" }],
    },
    {
      title: "Account",
      content: [{ label: "change password", href: "/change-password" }],
    },
  ];
  var currentTime = new Date();
  return (
    <footer className="min-h-64 shrink-0 border-t-1 border-border">
      <div className="flex flex-col p-4 md:p-6 h-full gap-4">
        <div
          id="main-content"
          className="flex flex-col gap-6 mb-4 md:mb-0 md:grid md:grid-cols-3 flex-1 h-full">
          <div
            id="about-us"
            className="flex flex-col items-center justify-center"
          >
            <Logo />
            <div>Lorem Ipusm</div>
          </div>
          <section className="md:flex justify-center hidden">
            {items.map((item) => (
              <div id="" className="flex-col flex items-center w-full" key={item.title}>
                <div>
                  <span className="font-[800]">{item.title}</span>
                   <ul>
                  {item.content.map((i) => (
                   
                      <li key={i.href}>
                        <Link href={i.href}>{i.label}</Link>
                      </li>
                    
                  ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
          
          <div className="flex justify-center items-center">
            <Button
              variant="default"
              className="h-14 w-28 bg-amber-400 cursor-pointer rounded-lg text-foreground hover:bg-amber-500 border-2 border-amber-300 dark:border-amber-600"
              asChild
            >
              <Link
                href="/login"
                className="!flex !items-center justify-center"
              >
                <PlayButton className="!h-8 !w-auto fill-background" />
              </Link>
            </Button>
          </div>
          <section className="md:hidden flex justify-center">
            <Accordion type="single" collapsible className="w-full">
              {items.map((item, n) => (
                <AccordionItem value={item.title} key={n}>
                  <AccordionTrigger>
                    <span className="font-[800]">{item.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <ul>
                      {item.content.map((i) => (
                        <li key={i.href}>
                          <Link href={i.href}>{i.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
        
        <div id="legal-info" className="flex items-center justify-center">
          <ul className="flex flex-col text-center gap-2 !text-[0.75rem]">
            <li className="">
              © {currentTime.getFullYear()} Lorem Ipsum - All Rights Reserved
            </li>
            <li className="">
              <Link href="https://glblobs.blob.core.windows.net/docs/privacy_policy.pdf">
                privacy policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
