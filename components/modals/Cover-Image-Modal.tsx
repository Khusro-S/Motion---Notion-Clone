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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function CoverImageModal() {
  const coverImage = useCoverImage();

  const params = useParams();

  const onClose = () => {
    coverImage.onClose();
  };

  const { uploadFn } = useFileUpload({
    documentId: params.documentId as Id<"documents">,
    existingUrl: coverImage.url,
    onSuccess: () => {
      coverImage.onClose();
    },
  });

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={onClose}>
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
