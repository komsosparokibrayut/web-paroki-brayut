import { instagramPosts, INSTAGRAM_PROFILE_URL, INSTAGRAM_USERNAME } from "@/lib/instagramPosts";
import { InstagramGrid } from "@/features/gallery/components/InstagramGrid";
import PageHeader from "@/components/layout/PageHeader";

export default function GalleryPage() {
    return (
        <>
            <PageHeader
                title="Galeri Instagram"
                subtitle="Ikuti kegiatan Paroki Brayut melalui Instagram @parokibrayut"
                image="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2073&auto=format&fit=crop"
                align="center"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <InstagramGrid
                    posts={instagramPosts}
                    profileUrl={INSTAGRAM_PROFILE_URL}
                    username={INSTAGRAM_USERNAME}
                />
            </div>
        </>
    );
}
