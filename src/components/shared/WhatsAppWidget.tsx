"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WhatsAppWidget() {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href="https://wa.me/622748609221"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-6 right-6 z-40"
                    >
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-600 shadow-lg transition-all hover:scale-110 active:scale-95"
                            aria-label="Contact via WhatsApp"
                        >
                            <MessageCircle className="h-7 w-7 text-white" />
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Hubungi Kami via WhatsApp</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
