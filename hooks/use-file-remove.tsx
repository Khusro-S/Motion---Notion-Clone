"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useEdgeStore } from "@/lib/edgestore";

interface UseFileRemoveProps {
  documentId: Id<"documents">;
  fileUrl?: string;
  onSuccess?: () => void;
}

export function useFileRemove({
  documentId,
  fileUrl,
  onSuccess,
}: UseFileRemoveProps) {
  const { edgestore } = useEdgeStore();
  const removeCover = useMutation(api.documents.removeCoverImage);

  const onRemove = async () => {
    const promise = async () => {
      // Remove from Convex first
      await removeCover({ id: documentId });

      // Delete from EdgeStore if URL exists
      if (fileUrl) {
        try {
          await edgestore.publicImages.delete({
            url: fileUrl,
          });
        } catch (error) {
          console.error("Failed to delete from EdgeStore:", error);
          // Don't throw - Convex update already succeeded
        }
      }

      onSuccess?.();
    };

    toast.promise(promise(), {
      loading: "Removing cover...",
      success: "Cover removed!",
      error: "Failed to remove cover.",
    });
  };

  return { onRemove };
}
