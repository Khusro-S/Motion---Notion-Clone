"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/Spinner";
import { useParams } from "next/navigation";
import Toolbar from "@/app/(main)/_components/Toolbar";
import Cover from "@/components/Cover";

export default function DocumentIdPage() {
  const params = useParams();
  const documentId = params.documentId as Id<"documents">;
  const document = useQuery(api.documents.getDocumentById, {
    documentId,
  });

  if (document === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="h-full flex items-center justify-center">Not found</div>
    );
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
      </div>
    </div>
  );
}
