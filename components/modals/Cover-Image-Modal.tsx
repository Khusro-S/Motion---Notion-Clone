"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "@/components/upload/single-image";
import { UploaderProvider } from "@/components/upload/uploader-provider";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";

export default function CoverImageModal() {
  const coverImage = useCoverImage();

  const params = useParams();

  const [dropzoneWidth, setDropzoneWidth] = useState(450);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateWidth = () => {
      if (typeof window === "undefined") return;

      if (window.innerWidth < 640) {
        setDropzoneWidth(Math.min(window.innerWidth * 0.8, 450));
      } else {
        // Desktop: fixed 450px
        setDropzoneWidth(450);
      }
    };

    // Set initial width
    updateWidth();

    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateWidth();
      }, 100);
    };
    // Update on resize
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

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
            width={dropzoneWidth}
            dropzoneOptions={{
              maxSize: 1024 * 1024 * 4, // 4 MB
            }}
          />
        </UploaderProvider>
      </DialogContent>
    </Dialog>
  );
}
