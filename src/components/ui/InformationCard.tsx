import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InformationCardProps {
    title?: string;
    description: string;
    className?: string;
}

export default function InformationCard({
    title = "Informasi Penting",
    description,
    className
}: InformationCardProps) {
    return (
        <div className={cn("bg-blue-50 rounded-xl border border-brand-blue/10 p-8", className)}>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                    <Info className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-blue-900">{title}</h3>
            </div>
            <p className="text-blue-900 leading-relaxed pl-12">
                {description}
            </p>
        </div>
    );
}