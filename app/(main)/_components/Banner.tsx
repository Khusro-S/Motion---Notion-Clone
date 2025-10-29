"use client";

import ConfirmModal from "@/components/modals/Confirm-Modal";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteFiles } from "@/hooks/use-delete-files";

interface BannerProps {
  documentId: Id<"documents">;
}

export default function Banner({ documentId }: BannerProps) {
  const router = useRouter();
  const params = useParams();
  const { deleteDocumentWithFiles } = useDeleteFiles();

  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const document = useQuery(api.documents.getDocumentById, { documentId });
  const allDocuments = useQuery(api.documents.getTrash);

  const onRemove = async () => {
    let loadingToast: string | number | undefined;

    try {
      loadingToast = toast.loading("Deleting your note...");

      await deleteDocumentWithFiles(
        document || { _id: documentId },
        allDocuments || []
      );
      if (params.documentId === documentId) {
        router.push("/documents");
      }
      await remove({ id: documentId });

      toast.dismiss(loadingToast);
      toast.success("Your note is deleted permanently!");
    } catch (error) {
      console.error("Failed to delete document:", error);

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.error("Failed to delete your note.");
    }
  };
  const onRestore = () => {
    const promise = restore({
      id: documentId,
    });

    toast.promise(promise, {
      loading: "Restoring your note...",
      success: "Note restored ",
      error: "Failed to restore your note.",
    });
  };

  return (
    <div className="w-full bg-rose-500 text-sm text-center p-2 text-white flex items-center justify-center gap-x-2">
      <p>This page is in the Trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        // variant="outline"
        className="border-white border bg-transparent hover:bg-primary/20 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore page
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          //   variant="outline"
          className="bg-white hover:bg-gray-200 text-black hover:text-black p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
}
