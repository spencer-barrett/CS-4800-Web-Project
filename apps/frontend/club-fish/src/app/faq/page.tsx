"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="flex flex-col items-center justify-start sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-gradient-to-b from-[#0f403c] to-[#1B746C] overflow-y-auto">
      <div className="w-full max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Frequently Asked Questions
        </h1>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem
            value="item-1"
            className="bg-[#1B746C] border border-[#27A59B] rounded-lg px-6"
          >
            <AccordionTrigger className="text-white hover:text-[#27A59B] text-lg font-semibold hover:no-underline">
              What is Club Fish?
            </AccordionTrigger>
            <AccordionContent className="text-gray-200 text-base">
              Club Fish is a multiplayer online game where you can swim around
              as a fish, customize your appearance with hats and accessories,
              chat with friends, play minigames, and decorate your own private
              bowl!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="bg-[#1B746C] border border-[#27A59B] rounded-lg px-6"
          >
            <AccordionTrigger className="text-white hover:text-[#27A59B] text-lg font-semibold hover:no-underline">
              How do I customize my fish?
            </AccordionTrigger>
            <AccordionContent className="text-gray-200 text-base">
              Visit the Shop to browse cosmetics like hats, bracelets, and body
              colors. Purchase items with coins you earn from playing minigames,
              then equip them from your inventory to customize your fish's
              appearance!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="bg-[#1B746C] border border-[#27A59B] rounded-lg px-6"
          >
            <AccordionTrigger className="text-white hover:text-[#27A59B] text-lg font-semibold hover:no-underline">
              Can I play with my friends?
            </AccordionTrigger>
            <AccordionContent className="text-gray-200 text-base">
              Yes! Add friends through the Friends menu, send them direct
              messages, and create private rooms where only you and your friends
              can hang out. You can also visit your friends' decorated bowls!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-4"
            className="bg-[#1B746C] border border-[#27A59B] rounded-lg px-6"
          >
            <AccordionTrigger className="text-white hover:text-[#27A59B] text-lg font-semibold hover:no-underline">
              What minigames are available?
            </AccordionTrigger>
            <AccordionContent className="text-gray-200 text-base">
              Currently, you can play Rock Paper Scissors against other players!
              Win matches to earn coins that you can spend in the shop. More
              minigames are coming soon!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-5"
            className="bg-[#1B746C] border border-[#27A59B] rounded-lg px-6"
          >
            <AccordionTrigger className="text-white hover:text-[#27A59B] text-lg font-semibold hover:no-underline">
              How do I earn coins?
            </AccordionTrigger>
            <AccordionContent className="text-gray-200 text-base">
              You can earn coins by winning minigames like Rock Paper Scissors.
              Coins can be used to purchase cosmetic items in the shop to
              customize your fish and make it uniquely yours!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
