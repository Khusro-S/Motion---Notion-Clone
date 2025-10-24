"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/Spinner";

export default function DocumentIdPage() {
  const params = useParams();
  const documentId = params.documentId as Id<"documents">;

  const document = useQuery(api.documents.getDocumentById, {
    documentId: documentId,
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
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-8">
        {/* <h1 className="text-4xl font-bold">{document.title}</h1> */}
        {/* {document.content && <div className="mt-4">{document.content}</div>} */}
      </div>
    </div>
  );
}
