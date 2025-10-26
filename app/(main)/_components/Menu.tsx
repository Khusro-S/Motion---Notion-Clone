"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageIcon, MoreHorizontal, Smile, Trash, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoverImage } from "@/hooks/use-cover-image";
import IconPicker from "./IconPicker";
import { useFileRemove } from "@/hooks/use-file-remove";

interface MenuProps {
  documentId: Id<"documents">;
  coverUrl?: string;
  icon?: boolean;
}
export default function Menu({ documentId, coverUrl, icon }: MenuProps) {
  const router = useRouter();
  const { user } = useUser();

  const archive = useMutation(api.documents.archive);
  const removeIcon = useMutation(api.documents.removeIcon);
  const update = useMutation(api.documents.updateDocumentTitle);
  const coverImage = useCoverImage();

  const { onRemove: onRemoveCover } = useFileRemove({
    documentId,
    fileUrl: coverUrl,
  });

  const onArchive = () => {
    const promise = archive({
      id: documentId,
    });

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash!",
      error: "Failed to archive your note.",
    });

    router.push("/documents");
  };
  const onIconSelect = (icon: string) => {
    const promise = update({
      id: documentId,
      icon,
    });
    toast.promise(promise, {
      loading: "Adding icon...",
      success: "Icon added!",
      error: "Failed to add icon.",
    });
  };
  const onRemoveIcon = () => {
    const promise = removeIcon({
      id: documentId,
    });
    toast.promise(promise, {
      loading: "Removing icon...",
      success: "Icon removed!",
      error: "Failed to remove icon.",
    });
  };

  const onAddCover = () => {
    coverImage.onOpen();
  };

  //   const onReplaceCover = () => {
  //  if (coverImage.url) {
  //    coverImage.onReplace(coverImage.url, documentId);
  //  } else {
  //    coverImage.onOpen();
  //  }
  //     removeCoverImage({
  //       id: params.documentId as Id<"documents">,
  //     });
  //   };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        {/* Icon Actions */}
        {icon ? (
          <>
            <DropdownMenuItem
              // className="text-muted-foreground text-sm"
              onClick={onRemoveIcon}
            >
              <X className="h-4 w-4" />
              Remove icon
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <IconPicker onChange={onIconSelect} asChild>
              <div
                role="button"
                className="text-sm hover:bg-primary/5 flex items-center w-full p-2 cursor-pointer"
              >
                <Smile className="h-4 w-4 mr-2" />
                Add icon
              </div>
            </IconPicker>
            <DropdownMenuSeparator />
          </>
        )}
        {/* Cover Image Actions */}
        {coverUrl ? (
          <>
            <DropdownMenuItem onClick={() => coverImage.onReplace(coverUrl)}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Change cover
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemoveCover}>
              <X className="h-4 w-4 mr-2" />
              Remove cover
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onAddCover}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Add cover
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Delete Action */}
        <DropdownMenuItem onClick={onArchive}>
          <Trash className="h-4 w-4 mr-2" />
          Delete Note
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-6 w-6" />;
};
