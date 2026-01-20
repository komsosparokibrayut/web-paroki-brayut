import { TrendingUp, Users, Eye, MousePointerClick, Clock, ArrowUpRight, Medal } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PostMetadata } from "@/types/post";

interface UmamiStatsData {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
    comparison?: {
        pageviews: number;
        visitors: number;
        visits: number;
        bounces: number;
        totaltime: number;
    };
}

interface UmamiMetric {
    x: string;
    y: number;
}

interface UmamiStatsProps {
    latestPosts?: PostMetadata[];
}

const WEBSITE_ID = "c438390e-addf-46b3-8f5e-47f26dcaf8c3";
const API_URL = "https://api.umami.is/v1";

async function getUmamiData(endpoint: string) {
    const apiKey = process.env.UMAMI_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(`${API_URL}/websites/${WEBSITE_ID}${endpoint}`, {
            headers: {
                "Accept": "application/json",
                "x-umami-api-key": apiKey,
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            console.error(`Umami API error: ${response.status} ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch from Umami:", error);
        return null;
    }
}

async function getUmamiStats(): Promise<UmamiStatsData | null> {
    const endAt = Date.now();
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    return getUmamiData(`/stats?startAt=${startAt}&endAt=${endAt}`);
}

async function getTopPages(): Promise<UmamiMetric[] | null> {
    const endAt = Date.now();
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000;
    // Limit to 20 to ensure we catch enough specific pages if needed
    return getUmamiData(`/metrics?type=url&startAt=${startAt}&endAt=${endAt}&limit=20`);
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString("id-ID");
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
}

function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
}

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">1</span>;
    }
    if (rank === 2) {
        return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">2</span>;
    }
    if (rank === 3) {
        return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">3</span>;
    }
    return <span className="inline-flex items-center justify-center w-5 h-5 text-slate-400 text-xs font-medium">{rank}</span>;
}

export default async function UmamiStats({ latestPosts = [] }: UmamiStatsProps) {
    const [stats, topPages] = await Promise.all([
        getUmamiStats(),
        getTopPages()
    ]);

    if (!stats) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    Website Analytics
                </h2>
                <div className="text-center py-6">
                    <p className="text-sm text-slate-500">
                        Umami analytics are not available. Please configure the UMAMI_API_KEY.
                    </p>
                </div>
            </div>
        );
    }

    const bounceRate = stats.visits > 0 ? (stats.bounces / stats.visits) * 100 : 0;

    // Process Top Blog Posts (filtering for /artikel/)
    const topBlogPosts = topPages?.filter((p: UmamiMetric) => p.x.startsWith("/artikel/")) || [];

    // Process Latest Posts Performance
    const latestPostsPerformance = latestPosts.map(post => {
        const categories = post.categories || [];
        const category = categories[0] || "uncategorized";
        const url = `/artikel/${category.toLowerCase().replace(/\s+/g, '-')}/${post.slug}`;

        // Find matching metric
        const metric = topPages?.find((p: UmamiMetric) => p.x === url);

        return {
            ...post,
            views: metric ? metric.y : 0,
            url
        };
    });

    return (
        <div className="space-y-4">
            {/* Analytics Header + Stats in Compact Grid */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        Website Analytics
                    </h2>
                    <span className="text-xs text-slate-500">Last 30 Days</span>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatsCard
                            title="Page Views"
                            value={formatNumber(stats.pageviews)}
                            icon={Eye}
                            iconClassName="text-blue-600"
                            iconContainerClassName="bg-blue-50"
                            trend={stats.comparison ? {
                                value: calculatePercentageChange(stats.pageviews, stats.comparison.pageviews),
                            } : undefined}
                            compact
                        />
                        <StatsCard
                            title="Visitors"
                            value={formatNumber(stats.visitors)}
                            icon={Users}
                            iconClassName="text-purple-600"
                            iconContainerClassName="bg-purple-50"
                            trend={stats.comparison ? {
                                value: calculatePercentageChange(stats.visitors, stats.comparison.visitors),
                            } : undefined}
                            compact
                        />
                        <StatsCard
                            title="Total Visits"
                            value={formatNumber(stats.visits)}
                            icon={MousePointerClick}
                            iconClassName="text-green-600"
                            iconContainerClassName="bg-green-50"
                            trend={stats.comparison ? {
                                value: calculatePercentageChange(stats.visits, stats.comparison.visits),
                            } : undefined}
                            compact
                        />
                        <StatsCard
                            title="Bounce Rate"
                            value={`${bounceRate.toFixed(1)}%`}
                            icon={Clock}
                            iconClassName="text-amber-600"
                            iconContainerClassName="bg-amber-50"
                            infoTooltip="Bounce rate is the percentage of visitors who enter the site and then leave ('bounce') rather than continuing to view other pages. A lower bounce rate generally indicates better engagement."
                            compact
                        />
                    </div>
                </div>
            </div>

            {/* Top Posts Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top 10 Blog Posts */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                            <Medal className="w-4 h-4 text-amber-500" />
                            Top Visited Posts
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="w-10 text-center py-2 px-3">#</TableHead>
                                    <TableHead className="py-2 px-3">Path</TableHead>
                                    <TableHead className="text-right py-2 px-3 w-20">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topBlogPosts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-20 text-center text-slate-500 text-sm">
                                            No data available yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    topBlogPosts.slice(0, 10).map((page, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50">
                                            <TableCell className="text-center py-2 px-3">
                                                <RankBadge rank={i + 1} />
                                            </TableCell>
                                            <TableCell className="py-2 px-3">
                                                <Link
                                                    href={page.x}
                                                    target="_blank"
                                                    className="text-sm text-slate-700 hover:text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                                                >
                                                    {page.x.replace('/artikel/', '')}
                                                    <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right py-2 px-3 font-semibold text-blue-600 text-sm">
                                                {formatNumber(page.y)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Latest 10 Posts Performance */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-semibold text-sm text-slate-900">Latest Posts Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="py-2 px-3">Title</TableHead>
                                    <TableHead className="text-right py-2 px-3 w-20">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {latestPostsPerformance.slice(0, 10).map((post) => (
                                    <TableRow key={post.slug} className="hover:bg-slate-50">
                                        <TableCell className="py-2 px-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-700 truncate max-w-[200px]">{post.title}</span>
                                                <span className="text-xs text-slate-400">{new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-2 px-3">
                                            {post.views > 0 ? (
                                                <Badge variant="secondary" className="bg-green-50 text-green-700 font-semibold text-xs">
                                                    {formatNumber(post.views)}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 text-xs">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {latestPostsPerformance.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-20 text-center text-slate-500 text-sm">
                                            No posts found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
