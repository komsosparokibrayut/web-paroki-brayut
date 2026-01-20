'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createAlbumAction } from "@/features/gallery/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateAlbumForm() {
    const router = useRouter();

    async function action(formData: FormData) {
        const result = await createAlbumAction(null, formData);
        if (result.success) {
            toast.success("Album created");
            router.push(`/admin/gallery/${result.id}`);
        } else {
            toast.error(result.error || "Failed to create album");
        }
    }

    return (
        <form action={action} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Album Title</Label>
                <Input id="title" name="title" required placeholder="e.g. Easter Vigil 2024" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required placeholder="Describe the event..." />
            </div>

            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create Album"}
        </Button>
    )
}
