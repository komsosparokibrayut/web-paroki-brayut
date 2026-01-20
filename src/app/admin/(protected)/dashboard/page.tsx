import DashboardLink from "@/components/admin/DashboardLink";
import { getAllPosts } from "@/actions/posts";
import { getUMKM, getJadwalKegiatan, getStatistik } from "@/actions/data";
import PostTable from "@/components/admin/PostTable";
import UmamiStats from "@/components/admin/UmamiStats";
import { StatsCard } from "@/components/admin/StatsCard";
import {
  FileText,
  Store,
  Calendar,
  Users,
  ArrowUpRight
} from "lucide-react";

export default async function AdminDashboard() {
  // Fetch all data in parallel
  const [posts, umkms, events, statistik] = await Promise.all([
    getAllPosts(),
    getUMKM(),
    getJadwalKegiatan(),
    getStatistik()
  ]);

  // Process data
  const publishedPosts = posts.filter((p) => p.published);
  const totalPosts = posts.length;
  const totalUMKM = umkms.length;

  // Filter upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalUpcomingEvents = upcomingEvents.length;
  const totalUmat = statistik?.parishioners || 0;

  // Process data for charts/breakdowns
  const umkmByType = umkms.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventsByCategory = events.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 font-rubik">
      {/* Website Analytics - Compact */}
      <UmamiStats latestPosts={publishedPosts.slice(0, 10)} />

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Posts"
          value={totalPosts}
          icon={FileText}
          description={`${publishedPosts.length} Published`}
          iconClassName="text-blue-600"
          iconContainerClassName="bg-blue-50"
          compact
        />
        <StatsCard
          title="Terdaftar UMKM"
          value={totalUMKM}
          icon={Store}
          iconClassName="text-purple-600"
          iconContainerClassName="bg-purple-50"
          compact
        />
        <StatsCard
          title="Upcoming Events"
          value={totalUpcomingEvents}
          icon={Calendar}
          description="Next 7 Days"
          iconClassName="text-amber-600"
          iconContainerClassName="bg-amber-50"
          compact
        />
        <StatsCard
          title="Total Umat"
          value={totalUmat.toLocaleString('id-ID')}
          icon={Users}
          iconClassName="text-pink-600"
          iconContainerClassName="bg-pink-50"
          compact
        />
      </div>

      {/* Breakdowns Row - More Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UMKM Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-400" />
            Statistik UMKM
          </h3>
          <div className="space-y-2">
            {Object.entries(umkmByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(count / totalUMKM) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-slate-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {totalUMKM === 0 && <p className="text-sm text-slate-400 italic">Belum ada data UMKM</p>}
          </div>
        </div>

        {/* Events Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Kategori Kegiatan
          </h3>
          <div className="space-y-2">
            {Object.entries(eventsByCategory).sort((a, b) => b[1] - a[1]).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${category === 'liturgi' ? 'bg-purple-500' :
                        category === 'kegiatan' ? 'bg-blue-500' :
                          category === 'rapat' ? 'bg-amber-500' : 'bg-slate-500'
                        }`}
                      style={{ width: `${(count / events.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-slate-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-slate-400 italic">Belum ada data kegiatan</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Recent Posts
              </h2>
              <DashboardLink href="/admin/posts" className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </DashboardLink>
            </div>
            <PostTable posts={posts.slice(0, 5)} hidePagination={true} />
          </div>
        </div>

        {/* Upcoming Events Column */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" /> Upcoming Events
              </h2>
              <DashboardLink href="/admin/data/jadwal" className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1">
                Manage <ArrowUpRight className="w-3 h-3" />
              </DashboardLink>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex flex-col items-center justify-center border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase leading-none">
                          {new Date(event.date).toLocaleDateString("id-ID", { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-slate-900 leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>{event.time}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="truncate">{event.location}</span>
                        </p>
                        <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wide text-slate-500 bg-slate-100 rounded">
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No upcoming events found.
                </div>
              )}
            </div>
            {upcomingEvents.length > 5 && (
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-medium">
                  +{upcomingEvents.length - 5} more events
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
