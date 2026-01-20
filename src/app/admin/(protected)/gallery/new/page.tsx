import { CreateAlbumForm } from "@/features/gallery/components/CreateAlbumForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewAlbumPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/gallery">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Create New Album</h1>
            </div>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <CreateAlbumForm />
            </div>
        </div>
    );
}
