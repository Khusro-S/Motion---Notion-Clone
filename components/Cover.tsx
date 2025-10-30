import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImageIcon, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useFileRemove } from "@/hooks/use-file-remove";
import { Skeleton } from "./ui/skeleton";

interface CoverProps {
  url?: string;
  preview?: boolean;
  isArchived?: boolean;
}

export default function Cover({ url, preview, isArchived }: CoverProps) {
  const params = useParams();
  const coverImage = useCoverImage();

  const { onRemove } = useFileRemove({
    documentId: params.documentId as Id<"documents">,
    fileUrl: url,
  });

  return (
    <div
      className={cn(
        "relative w-full mt-8 group",
        !url || url === undefined ? "h-[12vh]" : "md:h-[35vh] h-[25vh]",
        url && "bg-muted",
        preview && "mt-0"
      )}
    >
      {!!url && (
        <Image src={url} fill alt="Cover Image" className="object-cover" />
      )}
      {url && !preview && !isArchived && (
        // <>
        //   {/* Desktop: Hover buttons */}
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 items-center gap-x-2 hidden md:flex">
          <Button
            className="text-xs hover:bg-secondary/55 hover:text-white"
            // variant="outline"
            size="sm"
            onClick={() => coverImage.onReplace(url)}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            className="text-xs hover:bg-secondary/55 hover:text-white"
            size="sm"
            onClick={onRemove}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full md:h-[35vh] h-[25vh]" />;
};