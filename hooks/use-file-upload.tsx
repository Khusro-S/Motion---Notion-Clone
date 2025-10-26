"use client";

import { useCallback } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import type { UploadFn } from "@/components/upload/uploader-provider";

interface UseFileUploadProps {
  documentId: Id<"documents">;
  existingUrl?: string;
  onSuccess?: () => void;
}

export function useFileUpload({
  documentId,
  existingUrl,
  onSuccess,
}: UseFileUploadProps) {
  const { edgestore } = useEdgeStore();
  const update = useMutation(api.documents.updateDocumentTitle);

  const uploadFn: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      const uploadPromise = async () => {
        // Upload to EdgeStore
        const res = await edgestore.publicImages.upload({
          file,
          signal,
          onProgressChange,
          options: {
            replaceTargetUrl: existingUrl,
          },
        });

        // Update Convex document with new cover URL
        await update({
          id: documentId,
          coverImage: res.url,
        });

        onSuccess?.();
        return res;
      };

      // Execute the promise and show toast
      const result = await uploadPromise();

      toast.success("Cover image uploaded!");

      return result;
    },
    [edgestore, update, documentId, existingUrl, onSuccess]
  );

  return { uploadFn };
}
