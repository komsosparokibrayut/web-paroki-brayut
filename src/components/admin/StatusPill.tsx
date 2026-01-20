import { Badge } from "@/components/ui/badge";

interface StatusPillProps {
  published: boolean;
}

export default function StatusPill({ published }: StatusPillProps) {
  return (
    <Badge
      variant={published ? "default" : "secondary"}
      className={published
        ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
      }
    >
      {published ? "Published" : "Draft"}
    </Badge>
  );
}
