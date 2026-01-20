'use client'

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteAlbumAction } from "@/features/gallery/actions";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteAlbumButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => {
                if (confirm("Are you sure you want to delete this album?")) {
                    startTransition(async () => {
                        await deleteAlbumAction(id);
                        toast.success("Album deleted");
                    });
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
