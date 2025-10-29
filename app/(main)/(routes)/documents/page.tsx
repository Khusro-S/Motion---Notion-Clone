"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect } from "react";
import { Spinner } from "@/components/Spinner";

export default function DocumentsPage() {
  const { user } = useUser();

  const create = useMutation(api.documents.create);

  const router = useRouter();

  const onCreate = () => {
    const promise = create({ title: "Untitled Note" }).then((documentId) => {
      if (documentId) {
        router.push(`/documents/${documentId}`);
      }
    });

    toast.promise(promise, {
      loading: "Creating your new note...",
      success: "New note created!",
      error: "Failed to create your new note.",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        alt="empty"
        width={300}
        height={300}
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        alt="empty"
        width={300}
        height={300}
        className="dark:block hidden"
      />
      <h2 className="text-lg font-medium">
        Welcome to <span className="font-bold">{user?.firstName}</span>&apos;s
        Motion
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-0" />
        Create a Note
      </Button>
    </div>
  );
}
