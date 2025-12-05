"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    alert("Message Sent!\n\nThanks for reaching out! We'll swim back to you soon.");
    
  
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col items-center justify-start sm:h-[calc(100vh-72px)] h-[calc(100vh-60px)] bg-gradient-to-b from-[#0f403c] to-[#1B746C] overflow-y-auto">
      <div className="w-full max-w-2xl px-6 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Contact Us
        </h1>
        <p className="text-gray-200 text-center mb-8">
          Have questions or feedback? We&apos;d love to hear from you!
        </p>

        <Card className="bg-[#1B746C] border-2 border-[#27A59B]">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Send us a message</CardTitle>
            <CardDescription className="text-gray-300">
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="bg-[#0f403c] border-[#27A59B] text-white placeholder:text-gray-400 focus:border-[#27A59B] focus:ring-[#27A59B]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className="bg-[#0f403c] border-[#27A59B] text-white placeholder:text-gray-400 focus:border-[#27A59B] focus:ring-[#27A59B]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white font-semibold">
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What&apos;s this about?"
                  required
                  className="bg-[#0f403c] border-[#27A59B] text-white placeholder:text-gray-400 focus:border-[#27A59B] focus:ring-[#27A59B]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white font-semibold">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what&apos;s on your mind..."
                  required
                  rows={6}
                  className="bg-[#0f403c] border-[#27A59B] text-white placeholder:text-gray-400 focus:border-[#27A59B] focus:ring-[#27A59B] resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#27A59B] hover:bg-[#2bc4a8] text-white font-semibold h-12 text-lg"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-2">
          <p className="text-gray-300 text-sm">
            You can also reach us at:
          </p>
          <p className="text-white font-semibold">
            support@clubfish.com
          </p>
        </div>
      </div>
    </div>
  );
}