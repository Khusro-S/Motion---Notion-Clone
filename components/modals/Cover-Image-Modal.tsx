"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "@/components/upload/single-image";
import {
  UploaderProvider,
  type UploadFn,
} from "@/components/upload/uploader-provider";
import { useState, useCallback } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function CoverImageModal() {
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();

  const update = useMutation(api.documents.updateDocumentTitle);
  const params = useParams();

  const onClose = () => {
    coverImage.onClose();
  };

  const uploadFn: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      const res = await edgestore.publicImages.upload({
        file,
        signal,
        onProgressChange,
      });

      await update({
        id: params.documentId as Id<"documents">,
        coverImage: res.url,
      });

      return res;
    },
    [edgestore, update, params.documentId]
  );

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Cover Image
          </DialogTitle>
        </DialogHeader>
        <UploaderProvider uploadFn={uploadFn} autoUpload>
          <SingleImageDropzone
            height={200}
            width={450}
            dropzoneOptions={{
              maxSize: 1024 * 1024 * 4, // 4 MB
            }}
          />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
}
