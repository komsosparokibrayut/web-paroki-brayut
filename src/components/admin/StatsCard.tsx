import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number; // percentage
        positive?: boolean; // explicit override, otherwise inferred from value > 0
        label?: string; // e.g., "from last month"
    };
    iconClassName?: string;
    iconContainerClassName?: string;
    infoTooltip?: string;
    compact?: boolean;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    iconClassName,
    iconContainerClassName,
    infoTooltip,
    compact = false,
}: StatsCardProps) {
    const isPositive = trend?.positive ?? (trend?.value ? trend.value >= 0 : true);
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    if (compact) {
        return (
            <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            iconContainerClassName || "bg-blue-50"
                        )}>
                            <Icon className={cn("h-4 w-4", iconClassName || "text-blue-600")} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
                                {infoTooltip && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="w-3 h-3 text-slate-400 cursor-help shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <p className="text-xs">{infoTooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-xl font-bold text-slate-900">{value}</span>
                                {trend && (
                                    <span className={cn(
                                        "inline-flex items-center gap-0.5 text-xs font-medium",
                                        isPositive ? "text-green-600" : "text-red-600"
                                    )}>
                                        <TrendIcon className="w-3 h-3" />
                                        {Math.abs(trend.value)}%
                                    </span>
                                )}
                            </div>
                            {description && (
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Standard (non-compact) version
    return (
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                            {infoTooltip && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p className="text-xs">{infoTooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{value}</div>
                    </div>
                    <div className={cn(
                        "p-2.5 rounded-lg shrink-0",
                        iconContainerClassName || "bg-blue-50"
                    )}>
                        <Icon className={cn("h-5 w-5", iconClassName || "text-blue-600")} />
                    </div>
                </div>

                {(trend || description) && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                        {trend && (
                            <span className={cn(
                                "inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded",
                                isPositive
                                    ? "text-green-700 bg-green-50"
                                    : "text-red-700 bg-red-50"
                            )}>
                                <TrendIcon className="w-3 h-3" />
                                {trend.value > 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        {description && (
                            <span className="text-slate-500">{description}</span>
                        )}
                        {trend?.label && !description && (
                            <span className="text-slate-500">{trend.label}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
