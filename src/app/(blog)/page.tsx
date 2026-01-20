import { Metadata } from "next";
import { getAllPosts } from "@/actions/posts";
import { getChurchStatistics, getScheduleEvents } from "@/lib/data";
import ImmersiveHero from "@/components/home/ImmersiveHero";
import IdentitySection from "@/components/home/IdentitySection";
import WorshipInvitation from "@/components/home/WorshipInvitation";
import CommunityStories from "@/components/home/CommunityStories";
import ImpactDonation from "@/components/home/ImpactDonation";
import SectionNav from "@/components/home/SectionNav";

export const metadata: Metadata = {
  title: "Beranda | Paroki Brayut Santo Yohanes Paulus II",
  description: "Selamat datang di website resmi Paroki Brayut. Dapatkan informasi jadwal misa terbaru, warta paroki, berita kegiatan, dan profil gereja.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXTAUTH_URL,
    title: "Paroki Brayut Santo Yohanes Paulus II",
    description: "Website Resmi Paroki Brayut - Jadwal Misa, Berita, dan Kegiatan",
    siteName: "Paroki Brayut",
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const [allPosts, churchStats, upcomingEvents] = await Promise.all([
    getAllPosts().catch(err => {
      console.error("Failed to fetch posts:", err);
      return [];
    }),
    getChurchStatistics().catch(err => {
      console.error("Failed to fetch stats:", err);
      return null; // Handle null gracefully in component
    }),
    getScheduleEvents().catch(err => {
      console.error("Failed to fetch events:", err);
      return [];
    })
  ]);

  const publishedPosts = allPosts.filter((post) => {
    return post.published && new Date(post.publishedAt) <= new Date();
  });

  return (
    <main className="min-h-screen bg-brand-warm selection:bg-brand-gold selection:text-white">
      {/* Section Navigation */}
      <SectionNav />

      {/* 1. The Hook: Emotional Immersive Hero */}
      <section id="hero" className="h-screen w-full">
        <ImmersiveHero />
      </section>

      {/* 2. The Identity: Who We Are & Exploration */}
      <section id="identity" className="min-h-screen w-full">
        <IdentitySection />
      </section>

      {/* 3. The Invitation: Worship & Schedule */}
      <section id="worship" className="min-h-screen w-full">
        <WorshipInvitation upcomingEvents={upcomingEvents} />
      </section>

      {/* 4. The Life: Community Stories (News) */}
      <section id="stories" className="min-h-screen w-full">
        <CommunityStories posts={publishedPosts} />
      </section>

      {/* 5. The Impact: Building Vision (Donation) */}
      <section id="donation">
        <ImpactDonation qrCodeValue={process.env.QR_CODE} />
      </section>
    </main>
  );
}
